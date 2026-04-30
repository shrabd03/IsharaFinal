import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, CameraOff, Sparkles, AlertCircle, Settings2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Prediction = {
  label: string;
  arabic?: string;
  confidence?: number;
};

const LOCAL_KEY = "ishara_camera_endpoint";
const DEFAULT_ENDPOINT = "http://localhost:8000/predict/frames";
const FRAMES_PER_BATCH = 8;
const FRAME_INTERVAL_MS = 120;

export function LiveCameraTranslation() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [endpoint, setEndpoint] = useState<string>(() => {
    if (typeof window === "undefined") return DEFAULT_ENDPOINT;
    return localStorage.getItem(LOCAL_KEY) || DEFAULT_ENDPOINT;
  });
  const [showSettings, setShowSettings] = useState(false);
  const [busy, setBusy] = useState(false);
  const [backendStatus, setBackendStatus] = useState<"idle" | "connected" | "offline">("idle");

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(captureAndPredict, FRAMES_PER_BATCH * FRAME_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [active, endpoint]);

  function persistEndpoint(value: string) {
    setEndpoint(value);
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_KEY, value);
    }
  }

  async function startCamera() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 640, height: 480 }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setActive(true);
    } catch (err) {
      console.error(err);
      setError("Could not access the camera. Please check your browser permissions.");
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setActive(false);
  }

  async function captureFrame(): Promise<string | null> {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return null;
    const w = canvas.width = 224;
    const h = canvas.height = 224;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, w, h);
    return canvas.toDataURL("image/jpeg", 0.7);
  }

  async function captureAndPredict() {
    if (!active || busy) return;
    setBusy(true);
    try {
      const frames: string[] = [];
      for (let i = 0; i < FRAMES_PER_BATCH; i++) {
        const f = await captureFrame();
        if (f) frames.push(f);
        if (i < FRAMES_PER_BATCH - 1) await new Promise((r) => setTimeout(r, FRAME_INTERVAL_MS));
      }
      if (frames.length === 0) return;

      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 8000);
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frames }),
        signal: controller.signal,
      });
      window.clearTimeout(timeout);

      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      const label: string = data.label ?? data.prediction ?? data.class ?? "";
      const arabic: string | undefined = data.arabic ?? data.label_ar ?? data.text;
      const confidence: number | undefined = typeof data.confidence === "number" ? data.confidence : undefined;
      if (label || arabic) {
        setPredictions((prev) => [{ label, arabic, confidence }, ...prev].slice(0, 6));
        setBackendStatus("connected");
      }
    } catch (err) {
      console.warn("Prediction failed", err);
      setBackendStatus("offline");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="overflow-hidden border-border/60 bg-card/80 backdrop-blur-xl shadow-xl">
      <CardContent className="p-0">
        <div className="flex items-center justify-between p-5 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Sign to Arabic Text</h3>
              <p className="text-xs text-muted-foreground">Live camera translation</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {backendStatus === "connected" && (
              <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-0 gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Connected
              </Badge>
            )}
            {backendStatus === "offline" && (
              <Badge variant="outline" className="text-amber-700 border-amber-500/30 gap-1">
                <AlertCircle className="w-3 h-3" /> Backend offline
              </Badge>
            )}
            <Button variant="ghost" size="icon" onClick={() => setShowSettings((s) => !s)} aria-label="Endpoint settings">
              <Settings2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-b border-border/60 bg-muted/30"
            >
              <div className="p-5 space-y-2">
                <Label htmlFor="endpoint" className="text-xs">Backend endpoint (FastAPI)</Label>
                <Input
                  id="endpoint"
                  value={endpoint}
                  onChange={(e) => persistEndpoint(e.target.value)}
                  placeholder="http://localhost:8000/predict/frames"
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  POST request with body: {`{ frames: string[] }`} (base64 JPEGs, ~{FRAMES_PER_BATCH} per batch). Expected response: {`{ label, arabic?, confidence? }`}.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative aspect-[4/3] bg-gradient-to-br from-primary/30 to-primary/60">
          <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
          <canvas ref={canvasRef} className="hidden" />
          {!active && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-primary-foreground/90 p-6 text-center">
              <CameraOff className="w-12 h-12 mb-3 opacity-70" />
              <p className="text-sm max-w-xs">
                Turn on the camera to start translating Jordanian Arabic Sign Language into Arabic text.
              </p>
            </div>
          )}
          {active && busy && (
            <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-white text-xs flex items-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin" /> Analyzing
            </div>
          )}
          {active && (
            <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/90 text-white text-xs">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> Live
            </div>
          )}
        </div>

        <div className="p-5 space-y-4">
          <div className="rounded-2xl border border-border/60 bg-muted/30 p-5 min-h-[110px]">
            {predictions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {active ? "Waiting for the first prediction…" : "Predictions will appear here."}
              </p>
            ) : (
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  <motion.div
                    key={(predictions[0].arabic || predictions[0].label) + "0"}
                    initial={{ opacity: 0, y: 10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-baseline gap-3 justify-center"
                  >
                    <Sparkles className="w-5 h-5 text-secondary shrink-0" />
                    <p
                      dir="rtl"
                      lang="ar"
                      className="text-3xl md:text-4xl font-semibold text-foreground tracking-wide"
                    >
                      {predictions[0].arabic || predictions[0].label}
                    </p>
                  </motion.div>
                </AnimatePresence>
                {predictions[0].confidence !== undefined && (
                  <p className="text-xs text-muted-foreground text-center">
                    Confidence: {(predictions[0].confidence * 100).toFixed(0)}%
                  </p>
                )}
              </div>
            )}
          </div>

          {predictions.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {predictions.slice(1).map((p, i) => (
                <Badge key={i} variant="outline" className="font-normal" dir="rtl" lang="ar">
                  {p.arabic || p.label}
                </Badge>
              ))}
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="flex gap-2">
            {!active ? (
              <Button onClick={startCamera} className="flex-1 bg-primary hover:bg-primary/90">
                <Camera className="w-4 h-4 mr-2" /> Start camera
              </Button>
            ) : (
              <Button onClick={stopCamera} variant="outline" className="flex-1">
                <CameraOff className="w-4 h-4 mr-2" /> Stop
              </Button>
            )}
            <Button
              onClick={captureAndPredict}
              variant="secondary"
              disabled={!active || busy}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Translate now"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
