import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Camera, CameraOff, Copy, Check,
  Trash2, Loader2, Zap, BookmarkPlus, AlertCircle,
} from "lucide-react";
import { Button }     from "@/components/ui/button";
import { Badge }      from "@/components/ui/badge";
import { useAuth }    from "@/hooks/use-auth";
import { useHistory } from "@/hooks/use-history";

const PREDICT_ENDPOINT = "https://isharafinal.onrender.com/predict/frames";

/**
 * FRAME COLLECTION STRATEGY
 * Training: 60 frames uniformly sampled from a 2-3 second video clip.
 * Inference: we collect 64 frames at ~40ms spacing = ~2.5 seconds of signing.
 *   - 64 > 60 so the backend can linspace-sample exactly 60 from 64, just
 *     like training sampled from the full video.
 *   - 40ms ≈ 25fps which matches typical webcam capture rate.
 *   - Total collection time: ~2.6s per batch.
 *   - Cycle: 2.6s collect + 0.5s network breathing room = 3.1s per prediction.
 */
const FRAMES_PER_BATCH    = 64;
const FRAME_INTERVAL_MS   = 40;   // ~25 fps
const PREDICTION_CYCLE_MS = FRAMES_PER_BATCH * FRAME_INTERVAL_MS + 500; // ~3100ms

// Frontend confidence gate (backend already gates at 0.55)
const CONFIDENCE_THRESHOLD = 0.55;

type DetectedEntry = { ar: string; en: string; id: number; confidence: number };

export default function SignToText() {
  const { user }        = useAuth();
  const { addEntry }    = useHistory();
  const [, setLocation] = useLocation();

  const videoRef    = useRef<HTMLVideoElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const streamRef   = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const busyRef     = useRef(false);
  const idRef       = useRef(0);

  const [stream,           setStream]           = useState<MediaStream | null>(null);
  const [cameraOn,         setCameraOn]         = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [loading,          setLoading]          = useState(false);
  const [detecting,        setDetecting]        = useState(false);
  const [detectedLog,      setDetectedLog]      = useState<DetectedEntry[]>([]);
  const [latestDetected,   setLatestDetected]   = useState<DetectedEntry | null>(null);
  const [copied,           setCopied]           = useState(false);
  const [saved,            setSaved]            = useState(false);
  const [backendError,     setBackendError]     = useState<string | null>(null);
  const [framesSent,       setFramesSent]       = useState(0);
  const [skipReason,       setSkipReason]       = useState("");

  // Wire stream → video element AFTER React commits DOM
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (stream) {
      video.srcObject = stream;
      video.play().catch(e => console.warn("[sign→text] play():", e));
    } else {
      video.pause();
      video.srcObject = null;
    }
  }, [stream]);

  useEffect(() => {
    if (!user) setLocation("/");
    return () => doStop();
  }, [user]);

  const doStop = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    busyRef.current   = false;
    setStream(null);
    setCameraOn(false);
    setDetecting(false);
    setLatestDetected(null);
    setSkipReason("");
  }, []);

  /**
   * Capture one frame at natural (un-mirrored) orientation.
   * CSS scaleX(-1) on <video> affects display only — ctx.drawImage()
   * reads raw pixel data, so backend always gets training-matching frames.
   */
  const captureFrame = useCallback(async (): Promise<string | null> => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2 || video.videoWidth === 0) return null;
    canvas.width  = 224;
    canvas.height = 224;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, 224, 224);
    return canvas.toDataURL("image/jpeg", 0.80);
  }, []);

  const runPrediction = useCallback(async () => {
    if (busyRef.current)    return;
    if (!streamRef.current) return;
    busyRef.current = true;
    setSkipReason("");

    try {
      // Collect 64 frames at ~25fps (~2.5s of signing)
      const frames: string[] = [];
      for (let i = 0; i < FRAMES_PER_BATCH; i++) {
        const f = await captureFrame();
        if (f) frames.push(f);
        if (i < FRAMES_PER_BATCH - 1)
          await new Promise<void>(r => setTimeout(r, FRAME_INTERVAL_MS));
      }
      if (frames.length === 0) return;

      setFramesSent(n => n + frames.length);
      console.log(`[sign→text] Sending ${frames.length} frames to backend`);

      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 20_000);
      const res = await fetch(PREDICT_ENDPOINT, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ frames }),
        signal:  controller.signal,
      });
      clearTimeout(tid);
      if (!res.ok) throw new Error(`Backend ${res.status}`);

      const data = await res.json();
      console.log("[sign→text] Response:", data);
      setBackendError(null);

      if (data.skipped) {
        setSkipReason(data.skip_reason ?? "");
        console.log(`[sign→text] Skipped — ${data.skip_reason}`);
        return;
      }

      const label      = (data.label      ?? "") as string;
      const arabic     = (data.arabic     ?? label) as string;
      const confidence = (data.confidence ?? 0)   as number;

      if (label && arabic && confidence >= CONFIDENCE_THRESHOLD) {
        const entry: DetectedEntry = { ar: arabic, en: label, id: ++idRef.current, confidence };
        setLatestDetected(entry);
        setDetectedLog(prev => [entry, ...prev].slice(0, 30));
        setSkipReason("");
      }
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        console.error("[sign→text]", err);
        setBackendError("Backend not responding — make sure the Python server is running on port 8000.");
      }
    } finally {
      busyRef.current = false;
    }
  }, [captureFrame]);

  const startCamera = useCallback(async () => {
    setLoading(true);
    setPermissionDenied(false);
    setBackendError(null);
    setDetectedLog([]);
    setFramesSent(0);
    setSkipReason("");

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = mediaStream;
      setStream(mediaStream);   // triggers useEffect → srcObject + play()
      setCameraOn(true);
      setDetecting(true);
      intervalRef.current = setInterval(() => runPrediction(), PREDICTION_CYCLE_MS);
    } catch (err: any) {
      console.error("[sign→text] getUserMedia:", err);
      setPermissionDenied(true);
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    } finally {
      setLoading(false);
    }
  }, [runPrediction]);

  const handleCopyAll = () => {
    navigator.clipboard.writeText(detectedLog.map(e => `${e.ar} (${e.en})`).join("\n"))
      .then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const handleSaveToHistory = () => {
    if (!detectedLog.length) return;
    addEntry({ type: "sign-to-text", text: detectedLog.map(e => e.ar).join(" ، "), words: detectedLog.map(e => e.ar) });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!user) return null;

  const skipLabel = skipReason.includes("hand") || skipReason.includes("wrist")
    ? "Raise your hand and sign…"
    : skipReason.includes("confidence")
    ? "Sign unclear — try holding the sign for 2–3 seconds"
    : skipReason ? "Waiting for movement…" : "";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <canvas ref={canvasRef} className="hidden" />

      {/* Header */}
      <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center gap-3 sticky top-0 z-40">
        <button onClick={() => { doStop(); setLocation("/home"); }}
          className="flex items-center gap-2 text-primary-foreground/80 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/10">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </button>
        <div className="flex-1 text-center">
          <h1 className="font-serif font-bold text-lg">Sign → Text</h1>
          <p className="text-primary-foreground/70 text-xs">Show your signs to the camera</p>
        </div>
        <div className="w-16" />
      </div>

      {backendError && (
        <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-2 flex items-center gap-2 text-destructive text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />{backendError}
        </div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Camera pane */}
        <div className="flex-1 relative bg-black flex items-center justify-center min-h-[50vh] lg:min-h-0 overflow-hidden">

          {/* Video always rendered — CSS mirror for selfie UX only */}
          <video
            ref={videoRef}
            playsInline
            muted
            style={{
              transform: "scaleX(-1)",
              width: "100%", height: "100%", objectFit: "cover", display: "block",
            }}
          />

          {/* Overlay when camera is off */}
          {!cameraOn && (
            <div className="absolute inset-0 bg-[#111] flex flex-col items-center justify-center gap-6 p-8 z-10">
              {loading ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                  <p className="text-white text-sm">Starting camera…</p>
                </div>
              ) : permissionDenied ? (
                <>
                  <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center">
                    <CameraOff className="w-10 h-10 text-destructive" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-white font-semibold text-lg">Camera access denied</p>
                    <p className="text-white/60 text-sm max-w-xs">Allow camera access in your browser settings, then try again.</p>
                  </div>
                  <Button onClick={startCamera} className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8">
                    Try again
                  </Button>
                </>
              ) : (
                <>
                  <motion.div
                    className="w-24 h-24 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center"
                    animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Camera className="w-12 h-12 text-primary" />
                  </motion.div>
                  <div className="text-center space-y-2">
                    <p className="text-white font-semibold text-xl">Live Sign Detection</p>
                    <p className="text-white/60 text-sm max-w-xs">
                      Point the camera at yourself, perform a JSL sign and hold it for 2–3 seconds.
                    </p>
                  </div>
                  <Button onClick={startCamera} size="lg"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 h-14 px-10 text-lg rounded-2xl">
                    <Camera className="w-5 h-5 mr-2" /> Start Camera
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Live overlays */}
          {cameraOn && (
            <>
              <div className="absolute top-4 left-4 flex items-center gap-2 z-20">
                <motion.div className="w-3 h-3 rounded-full bg-red-500"
                  animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
                <span className="text-white text-xs font-medium bg-black/40 px-2 py-0.5 rounded-full">LIVE</span>
              </div>

              <div className="absolute top-4 right-4 flex flex-col items-end gap-2 z-20">
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary/90 text-primary-foreground border-0 gap-1.5">
                    <Zap className="w-3 h-3" /> Detecting…
                  </Badge>
                  {framesSent > 0 && (
                    <Badge variant="outline" className="bg-black/40 text-white border-white/20 text-xs">
                      {framesSent} frames
                    </Badge>
                  )}
                </div>
                {skipLabel && (
                  <span className="text-white/60 text-xs bg-black/40 px-2 py-0.5 rounded-full max-w-xs text-right">
                    {skipLabel}
                  </span>
                )}
              </div>

              <AnimatePresence>
                {latestDetected && (
                  <motion.div key={latestDetected.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.35 }}
                    className="absolute bottom-6 left-4 right-4 bg-black/80 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/10 text-center z-20">
                    <p className="text-3xl font-bold text-white leading-snug" dir="rtl" lang="ar">{latestDetected.ar}</p>
                    <p className="text-white/60 text-sm mt-1 italic">{latestDetected.en}</p>
                    <p className="text-white/40 text-xs mt-1">{(latestDetected.confidence * 100).toFixed(0)}% confidence</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <button onClick={doStop} aria-label="Stop camera"
                className="absolute bottom-6 right-6 w-12 h-12 rounded-full bg-red-500/90 hover:bg-red-500 flex items-center justify-center shadow-lg transition-colors z-20">
                <CameraOff className="w-5 h-5 text-white" />
              </button>
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 xl:w-96 bg-card border-l border-border flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div>
              <p className="font-semibold text-sm text-foreground">Detected Text</p>
              <p className="text-xs text-muted-foreground">{detectedLog.length} sign{detectedLog.length !== 1 ? "s" : ""} captured</p>
            </div>
            <div className="flex gap-2">
              {detectedLog.length > 0 && (
                <>
                  <Button variant="ghost" size="sm" onClick={handleSaveToHistory}
                    className="h-8 gap-1.5 text-teal-600 hover:text-teal-700 hover:bg-teal-50">
                    {saved ? <Check className="w-3.5 h-3.5 text-green-500" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
                    {saved ? "Saved!" : "Save"}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleCopyAll} className="h-8 gap-1.5">
                    {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                  <Button variant="ghost" size="sm"
                    onClick={() => { setDetectedLog([]); setLatestDetected(null); }}
                    className="h-8 text-destructive hover:text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {detectedLog.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-12">
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                  <Camera className="w-7 h-7 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Start the camera, perform a sign and hold it for 2–3 seconds.
                </p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {detectedLog.map((entry, i) => (
                  <motion.div key={entry.id}
                    initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }}
                    className={`rounded-xl px-4 py-3 border ${i === 0 ? "bg-primary/5 border-primary/20" : "bg-muted/40 border-transparent"}`}>
                    <p className="font-semibold text-foreground" dir="rtl" lang="ar">{entry.ar}</p>
                    <p className="text-xs text-muted-foreground italic">{entry.en}</p>
                    <p className="text-xs text-muted-foreground/60 mt-0.5">{(entry.confidence * 100).toFixed(0)}%</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
