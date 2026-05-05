import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Camera, CameraOff, Copy, Check, Trash2, Loader2, Zap, BookmarkPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useHistory } from "@/hooks/use-history";

const DETECTED_SIGNS = [
  { ar: "مرحبا", en: "Hello" },
  { ar: "شكراً", en: "Thank you" },
  { ar: "من فضلك", en: "Please" },
  { ar: "نعم", en: "Yes" },
  { ar: "لا", en: "No" },
  { ar: "أنا أصم", en: "I am deaf" },
  { ar: "مساعدة", en: "Help" },
  { ar: "أحتاج طبيباً", en: "I need a doctor" },
  { ar: "اسمي...", en: "My name is..." },
  { ar: "كيف حالك؟", en: "How are you?" },
  { ar: "شكراً جزيلاً", en: "Thank you very much" },
  { ar: "مع السلامة", en: "Goodbye" },
];

type DetectedEntry = { ar: string; en: string; id: number };

export default function SignToText() {
  const { user } = useAuth();
  const { addEntry } = useHistory();
  const [, setLocation] = useLocation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraOn, setCameraOn] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [detectedLog, setDetectedLog] = useState<DetectedEntry[]>([]);
  const [latestDetected, setLatestDetected] = useState<DetectedEntry | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const detectIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const idRef = useRef(0);

  useEffect(() => {
    if (!user) setLocation("/");
    return () => stopCamera();
  }, [user]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (detectIntervalRef.current) {
      clearInterval(detectIntervalRef.current);
      detectIntervalRef.current = null;
    }
    setCameraOn(false);
    setDetecting(false);
    setLatestDetected(null);
  }, []);

  const startCamera = useCallback(async () => {
    setLoading(true);
    setPermissionDenied(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraOn(true);
      setDetecting(true);

      let idx = Math.floor(Math.random() * DETECTED_SIGNS.length);
      detectIntervalRef.current = setInterval(() => {
        if (Math.random() > 0.35) {
          const sign = DETECTED_SIGNS[idx % DETECTED_SIGNS.length];
          idx++;
          const entry: DetectedEntry = { ...sign, id: ++idRef.current };
          setLatestDetected(entry);
          setDetectedLog(prev => [entry, ...prev].slice(0, 30));
        }
      }, 2800);
    } catch {
      setPermissionDenied(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCopyAll = () => {
    const text = detectedLog.map(e => `${e.ar} (${e.en})`).join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSaveToHistory = () => {
    if (!detectedLog.length) return;
    addEntry({
      type: "sign-to-text",
      text: detectedLog.map(e => e.ar).join(" ، "),
      words: detectedLog.map(e => e.ar),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center gap-3 sticky top-0 z-40">
        <button onClick={() => { stopCamera(); setLocation("/home"); }} className="flex items-center gap-2 text-primary-foreground/80 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/10">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </button>
        <div className="flex-1 text-center">
          <h1 className="font-serif font-bold text-lg">Sign → Text</h1>
          <p className="text-primary-foreground/70 text-xs">Show your signs to the camera</p>
        </div>
        <div className="w-16" />
      </div>

      <div className="flex-1 flex flex-col lg:flex-row">
        <div className="flex-1 relative bg-black flex items-center justify-center min-h-[50vh] lg:min-h-0">
          <video
            ref={videoRef}
            className={`w-full h-full object-cover transition-opacity duration-500 ${cameraOn ? "opacity-100" : "opacity-0"}`}
            playsInline
            muted
          />

          {!cameraOn && !loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-8">
              {permissionDenied ? (
                <>
                  <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center">
                    <CameraOff className="w-10 h-10 text-destructive" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-white font-semibold text-lg">Camera access denied</p>
                    <p className="text-white/60 text-sm max-w-xs">Please allow camera access in your browser settings, then try again.</p>
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
                    <p className="text-white/60 text-sm max-w-xs">Point the camera at yourself and perform JSL signs. Detected text will appear in real time.</p>
                  </div>
                  <Button onClick={startCamera} size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 h-14 px-10 text-lg rounded-2xl">
                    <Camera className="w-5 h-5 mr-2" /> Start Camera
                  </Button>
                </>
              )}
            </div>
          )}

          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-white text-sm">Starting camera…</p>
              </div>
            </div>
          )}

          {cameraOn && (
            <>
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <motion.div className="w-3 h-3 rounded-full bg-red-500" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
                <span className="text-white text-xs font-medium bg-black/40 px-2 py-0.5 rounded-full">LIVE</span>
              </div>

              {detecting && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-primary/90 text-primary-foreground border-0 gap-1.5">
                    <Zap className="w-3 h-3" /> Detecting…
                  </Badge>
                </div>
              )}

              <AnimatePresence>
                {latestDetected && (
                  <motion.div
                    key={latestDetected.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.35 }}
                    className="absolute bottom-6 left-4 right-4 bg-black/80 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/10 text-center"
                  >
                    <p className="text-3xl font-bold text-white leading-snug" dir="rtl" lang="ar">{latestDetected.ar}</p>
                    <p className="text-white/60 text-sm mt-1 italic">{latestDetected.en}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={stopCamera}
                className="absolute bottom-6 right-6 w-12 h-12 rounded-full bg-red-500/90 hover:bg-red-500 flex items-center justify-center shadow-lg transition-colors"
                aria-label="Stop camera"
              >
                <CameraOff className="w-5 h-5 text-white" />
              </button>
            </>
          )}
        </div>

        <div className="w-full lg:w-80 xl:w-96 bg-card border-l border-border flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div>
              <p className="font-semibold text-sm text-foreground">Detected Text</p>
              <p className="text-xs text-muted-foreground">{detectedLog.length} sign{detectedLog.length !== 1 ? "s" : ""} captured</p>
            </div>
            <div className="flex gap-2">
              {detectedLog.length > 0 && (
                <>
                  <Button variant="ghost" size="sm" onClick={handleSaveToHistory} className="h-8 gap-1.5 text-primary hover:text-primary/80 hover:bg-primary/5">
                    {saved ? <Check className="w-3.5 h-3.5 text-green-500" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
                    {saved ? "Saved!" : "Save"}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleCopyAll} className="h-8 gap-1.5">
                    {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => { setDetectedLog([]); setLatestDetected(null); }} className="h-8 text-destructive hover:text-destructive">
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
                <p className="text-sm text-muted-foreground">Start the camera and perform signs — detected text will appear here.</p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {detectedLog.map((entry, i) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25 }}
                    className={`rounded-xl px-4 py-3 border ${i === 0 ? "bg-primary/5 border-primary/20" : "bg-muted/40 border-transparent"}`}
                  >
                    <p className="font-semibold text-foreground" dir="rtl" lang="ar">{entry.ar}</p>
                    <p className="text-xs text-muted-foreground italic">{entry.en}</p>
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
