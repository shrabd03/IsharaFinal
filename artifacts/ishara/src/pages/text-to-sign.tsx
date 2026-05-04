import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Mic, MicOff, Send, Trash2, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { AnimatedSign } from "@/components/signs/HandSigns";

type SignResult = {
  word: string;
  signId: string | null;
  ar: string | null;
  description: string | null;
};

const WORD_MAP: Record<string, { signId: string; ar: string; description: string }> = {
  hello: { signId: "hello", ar: "مرحبا", description: "Wave hand side to side" },
  hi: { signId: "hello", ar: "مرحبا", description: "Wave hand side to side" },
  مرحبا: { signId: "hello", ar: "مرحبا", description: "Wave hand side to side" },
  yes: { signId: "yes", ar: "نعم", description: "Nod fist up and down" },
  نعم: { signId: "yes", ar: "نعم", description: "Nod fist up and down" },
  "thank you": { signId: "thank_you", ar: "شكراً", description: "Open hand moving from forehead outward" },
  thanks: { signId: "thank_you", ar: "شكراً", description: "Open hand moving from forehead outward" },
  شكراً: { signId: "thank_you", ar: "شكراً", description: "Open hand moving from forehead outward" },
  شكرا: { signId: "thank_you", ar: "شكراً", description: "Open hand moving from forehead outward" },
  me: { signId: "me", ar: "أنا", description: "Point to chest" },
  i: { signId: "me", ar: "أنا", description: "Point to chest" },
  أنا: { signId: "me", ar: "أنا", description: "Point to chest" },
  help: { signId: "help", ar: "مساعدة", description: "Fist on flat palm lifted upward" },
  مساعدة: { signId: "help", ar: "مساعدة", description: "Fist on flat palm lifted upward" },
};

function resolveWords(text: string): SignResult[] {
  const lower = text.toLowerCase().trim();
  const results: SignResult[] = [];
  const tokens = lower.split(/\s+/).filter(Boolean);

  let i = 0;
  while (i < tokens.length) {
    const twoWord = tokens.slice(i, i + 2).join(" ");
    if (WORD_MAP[twoWord]) {
      results.push({ word: twoWord, ...WORD_MAP[twoWord] });
      i += 2;
    } else if (WORD_MAP[tokens[i]]) {
      results.push({ word: tokens[i], ...WORD_MAP[tokens[i]] });
      i++;
    } else {
      results.push({ word: tokens[i], signId: null, ar: null, description: null });
      i++;
    }
  }
  return results;
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: Event) => void) | null;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition;
    webkitSpeechRecognition: new () => ISpeechRecognition;
  }
}

export default function TextToSign() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [inputText, setInputText] = useState("");
  const [results, setResults] = useState<SignResult[]>([]);
  const [listening, setListening] = useState(false);
  const [hasVoice, setHasVoice] = useState(false);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!user) setLocation("/");
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    setHasVoice(!!SpeechRecognitionAPI);
  }, [user]);

  const handleConvert = useCallback(() => {
    if (!inputText.trim()) return;
    setResults(resolveWords(inputText));
  }, [inputText]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleConvert(); }
  };

  const toggleListening = useCallback(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) return;

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "ar-JO";
    recognitionRef.current = recognition;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results).map((r: SpeechRecognitionResult) => r[0].transcript).join("");
      setInputText(transcript);
    };
    recognition.onend = () => {
      setListening(false);
      setTimeout(() => {
        setResults(prev => prev.length ? prev : resolveWords(inputText));
      }, 200);
    };
    recognition.onerror = () => setListening(false);
    recognition.start();
    setListening(true);
  }, [listening, inputText]);

  const handleClear = () => { setInputText(""); setResults([]); };

  if (!user) return null;

  const hasResults = results.length > 0;
  const knownCount = results.filter(r => r.signId).length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center gap-3 sticky top-0 z-40">
        <button onClick={() => setLocation("/home")} className="flex items-center gap-2 text-primary-foreground/80 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/10">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </button>
        <div className="flex-1 text-center">
          <h1 className="font-serif font-bold text-lg">Text → Sign</h1>
          <p className="text-primary-foreground/70 text-xs">Type or speak — see the signs</p>
        </div>
        <div className="w-16" />
      </div>

      <div className="container mx-auto px-4 max-w-3xl py-8 space-y-8">
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-2 mb-1">
              <Volume2 className="w-4 h-4 text-primary" />
              <p className="font-semibold text-sm text-foreground">Enter your message</p>
            </div>
            <p className="text-xs text-muted-foreground">Type in Arabic or English — known signs will be shown as animations.</p>
          </div>
          <div className="p-4 space-y-3">
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type here… e.g. Hello, thank you, help (or in Arabic: مرحبا، شكراً)"
                rows={4}
                className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
              />
            </div>
            <div className="flex items-center gap-2">
              {hasVoice && (
                <Button
                  variant={listening ? "destructive" : "outline"}
                  onClick={toggleListening}
                  className={`gap-2 h-11 ${listening ? "animate-pulse" : ""}`}
                >
                  {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  {listening ? "Stop listening" : "Speak"}
                </Button>
              )}
              {inputText && (
                <Button variant="ghost" onClick={handleClear} className="h-11 text-muted-foreground hover:text-destructive gap-2">
                  <Trash2 className="w-4 h-4" /> Clear
                </Button>
              )}
              <Button onClick={handleConvert} disabled={!inputText.trim()} className="ml-auto h-11 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-6">
                <Send className="w-4 h-4" /> Show Signs
              </Button>
            </div>
            {listening && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 px-3 py-2 bg-destructive/5 border border-destructive/20 rounded-xl">
                <motion.div className="w-2 h-2 rounded-full bg-red-500" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 0.8, repeat: Infinity }} />
                <span className="text-sm text-destructive font-medium">Listening in Arabic (Jordan)…</span>
              </motion.div>
            )}
          </div>
        </div>

        <AnimatePresence>
          {hasResults && (
            <motion.div key="results" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif font-bold text-xl text-foreground">Sign Animations</h2>
                  <p className="text-sm text-muted-foreground">{knownCount} of {results.length} word{results.length !== 1 ? "s" : ""} have known JSL signs</p>
                </div>
                <Badge className="bg-primary/10 text-primary border-0">{results.length} word{results.length !== 1 ? "s" : ""}</Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {results.map((r, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.08, duration: 0.3 }}
                    className={`rounded-2xl border p-5 flex flex-col items-center text-center gap-3 ${r.signId ? "bg-primary/5 border-primary/20" : "bg-muted/40 border-dashed border-muted-foreground/30"}`}
                  >
                    {r.signId ? (
                      <>
                        <AnimatedSign signId={r.signId} isHighlighted={true} />
                        <div>
                          <p className="font-bold text-foreground text-base" dir="rtl" lang="ar">{r.ar}</p>
                          <p className="text-xs text-primary capitalize mt-0.5">{r.word}</p>
                        </div>
                        <p className="text-xs text-muted-foreground leading-tight">{r.description}</p>
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center">
                          <span className="text-2xl font-bold text-muted-foreground uppercase">{r.word.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-muted-foreground text-sm capitalize">{r.word}</p>
                          <p className="text-xs text-muted-foreground/60 mt-0.5">No sign yet</p>
                        </div>
                      </>
                    )}
                  </motion.div>
                ))}
              </div>

              {knownCount < results.length && (
                <p className="text-xs text-center text-muted-foreground pt-2">
                  Words without a sign show their first letter as a placeholder. More signs are being added to the JSL dictionary.
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {!hasResults && (
          <div className="text-center py-12 space-y-3">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center">
              <span className="text-3xl">🤲</span>
            </div>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              Type a message above — words like <span className="font-medium">Hello, Yes, Thank you, Help, Me</span> (or their Arabic equivalents) will show as animated JSL signs.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
