import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, AlertCircle, Volume2, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedSign, signsList } from "@/components/signs/HandSigns";

type Token = {
  text: string;
  arabic: string;
  signId?: string;
};

const ARABIC_TO_SIGN: Record<string, string> = {
  "مرحبا": "hello",
  "مرحباً": "hello",
  "أهلا": "hello",
  "أهلاً": "hello",
  "السلام": "hello",
  "نعم": "yes",
  "أيوه": "yes",
  "اي": "yes",
  "أجل": "yes",
  "شكرا": "thank_you",
  "شكراً": "thank_you",
  "متشكر": "thank_you",
  "أنا": "me",
  "انا": "me",
  "مساعدة": "help",
  "ساعدني": "help",
  "ساعد": "help",
};

const ENGLISH_TO_SIGN: Record<string, string> = {
  hello: "hello",
  hi: "hello",
  hey: "hello",
  yes: "yes",
  yeah: "yes",
  yep: "yes",
  thanks: "thank_you",
  "thank": "thank_you",
  "thank you": "thank_you",
  me: "me",
  i: "me",
  help: "help",
};

function tokenize(text: string): Token[] {
  return text
    .split(/\s+/)
    .map((w) => w.replace(/[.,!?؟،]/g, "").trim())
    .filter(Boolean)
    .map((word) => {
      const lower = word.toLowerCase();
      const fromArabic = ARABIC_TO_SIGN[word];
      const fromEnglish = ENGLISH_TO_SIGN[lower];
      const signId = fromArabic || fromEnglish;
      const meta = signId ? signsList.find((s) => s.id === signId) : undefined;
      return {
        text: word,
        arabic: meta?.arabic || word,
        signId,
      };
    });
}

export function SpeechToSignTranslation() {
  const recognitionRef = useRef<any>(null);
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [tokens, setTokens] = useState<Token[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<"ar-JO" | "en-US">("ar-JO");

  useEffect(() => {
    const SR: any =
      (typeof window !== "undefined" && (window as any).SpeechRecognition) ||
      (typeof window !== "undefined" && (window as any).webkitSpeechRecognition);
    if (!SR) {
      setSupported(false);
      return;
    }
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = language;
    rec.onresult = (e: any) => {
      let finalText = "";
      let interimText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const piece = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += piece + " ";
        else interimText += piece;
      }
      setTranscript((prev) => {
        const combined = (prev + " " + finalText).trim();
        return finalText ? combined : prev;
      });
      if (finalText) {
        setTokens((prev) => [...prev, ...tokenize(finalText)]);
      } else {
        setTranscript((prev) => {
          const base = prev.split(/\s+/).slice(0, prev.split(/\s+/).length).join(" ");
          return (base + " " + interimText).trim();
        });
      }
    };
    rec.onerror = (e: any) => {
      if (e.error === "no-speech" || e.error === "aborted") return;
      setError(`Microphone error: ${e.error}`);
      setListening(false);
    };
    rec.onend = () => {
      setListening(false);
    };
    recognitionRef.current = rec;
    return () => {
      try { rec.stop(); } catch {}
    };
  }, [language]);

  useEffect(() => {
    if (tokens.length === 0) return;
    setActiveIndex(0);
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      if (i >= tokens.length) {
        window.clearInterval(id);
        return;
      }
      setActiveIndex(i);
    }, 1800);
    return () => window.clearInterval(id);
  }, [tokens.length]);

  function start() {
    setError(null);
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.lang = language;
      recognitionRef.current.start();
      setListening(true);
    } catch (err) {
      console.error(err);
    }
  }

  function stop() {
    if (!recognitionRef.current) return;
    try { recognitionRef.current.stop(); } catch {}
    setListening(false);
  }

  function reset() {
    setTokens([]);
    setTranscript("");
    setActiveIndex(0);
  }

  const currentToken = tokens[activeIndex];
  const matched = tokens.filter((t) => t.signId).length;
  const progress = tokens.length > 0 ? Math.round((matched / tokens.length) * 100) : 0;

  const knownSigns = useMemo(() => {
    const seen = new Set<string>();
    const result: { signId: string; english: string; arabic: string }[] = [];
    tokens.forEach((t) => {
      if (t.signId && !seen.has(t.signId)) {
        seen.add(t.signId);
        const meta = signsList.find((s) => s.id === t.signId);
        if (meta) result.push({ signId: t.signId, english: meta.english, arabic: meta.arabic });
      }
    });
    return result;
  }, [tokens]);

  return (
    <Card className="overflow-hidden border-border/60 bg-card/80 backdrop-blur-xl shadow-xl h-full">
      <CardContent className="p-0 flex flex-col h-full">
        <div className="flex items-center justify-between p-5 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center text-secondary-foreground">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Speech to Sign</h3>
              <p className="text-xs text-muted-foreground">Speak Arabic or English, watch the signs</p>
            </div>
          </div>
          <div className="flex items-center gap-1 p-1 rounded-full bg-muted">
            <button
              onClick={() => setLanguage("ar-JO")}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${language === "ar-JO" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >
              العربية
            </button>
            <button
              onClick={() => setLanguage("en-US")}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${language === "en-US" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >
              EN
            </button>
          </div>
        </div>

        <div className="relative flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-secondary/10 via-background to-primary/5 p-6 min-h-[260px]">
          <div className="absolute top-4 right-4">
            {listening && (
              <Badge className="bg-red-500/90 text-white border-0 gap-1">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> Listening
              </Badge>
            )}
          </div>

          <AnimatePresence mode="wait">
            {currentToken && currentToken.signId ? (
              <motion.div
                key={"sign-" + activeIndex}
                initial={{ opacity: 0, scale: 0.85, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="w-32 h-32 rounded-3xl bg-card/60 backdrop-blur ring-1 ring-border/60 shadow-lg flex items-center justify-center">
                  <AnimatedSign signId={currentToken.signId} isHighlighted />
                </div>
                <div className="text-center">
                  <p dir="rtl" lang="ar" className="text-2xl font-semibold text-foreground">{currentToken.arabic}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Sign {activeIndex + 1} of {tokens.length}
                  </p>
                </div>
              </motion.div>
            ) : currentToken ? (
              <motion.div
                key={"unknown-" + activeIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-3 text-center max-w-xs"
              >
                <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
                  <Volume2 className="w-8 h-8" />
                </div>
                <p dir="auto" className="text-xl font-medium text-foreground">{currentToken.text}</p>
                <p className="text-xs text-muted-foreground">No matching sign in our 22-class dataset yet — fingerspelling fallback</p>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center max-w-xs"
              >
                <div className="w-20 h-20 rounded-full bg-secondary/20 flex items-center justify-center text-secondary mx-auto mb-3">
                  <Mic className="w-8 h-8" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Tap the microphone and speak. Each recognized word will play as a sign.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-5 space-y-4 border-t border-border/60">
          <div className="rounded-xl bg-muted/40 p-3 min-h-[60px]">
            {transcript ? (
              <p dir={language === "ar-JO" ? "rtl" : "ltr"} className="text-sm text-foreground leading-relaxed">{transcript}</p>
            ) : (
              <p className="text-xs text-muted-foreground text-center">Transcript will appear here.</p>
            )}
          </div>

          {tokens.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Sign coverage</span>
                <span>{matched} / {tokens.length} matched ({progress}%)</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-secondary transition-all" style={{ width: `${progress}%` }} />
              </div>
              {knownSigns.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {knownSigns.map((s) => (
                    <Badge key={s.signId} variant="secondary" className="font-normal">
                      {s.english} ({s.arabic})
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {!supported && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/10 text-primary dark:text-primary text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <p>Your browser does not support live speech recognition. Try Chrome or Edge.</p>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="flex gap-2">
            {!listening ? (
              <Button onClick={start} disabled={!supported} className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/90">
                <Mic className="w-4 h-4 mr-2" /> Start speaking
              </Button>
            ) : (
              <Button onClick={stop} variant="outline" className="flex-1">
                <MicOff className="w-4 h-4 mr-2" /> Stop
              </Button>
            )}
            <Button onClick={reset} variant="ghost" disabled={tokens.length === 0 && !transcript}>
              <RotateCcw className="w-4 h-4 mr-2" /> Reset
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
