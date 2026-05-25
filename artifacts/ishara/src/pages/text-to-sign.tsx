import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Mic, MicOff, Send, Trash2,
  SkipBack, SkipForward, Play, Pause, RotateCcw, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useHistory } from "@/hooks/use-history";

/* ─── Video dictionary ─────────────────────────────────────────────────────── */
type VideoEntry = { file: string; ar: string; en: string };

const VIDEO_MAP: Record<string, VideoEntry> = {
  "مرحبا":     { file: "marhaba.mp4",    ar: "مرحبا",     en: "Hello" },
  "مرحباً":    { file: "marhaba.mp4",    ar: "مرحبا",     en: "Hello" },
  "مرحبه":     { file: "marhaba.mp4",    ar: "مرحبا",     en: "Hello" },
  "hello":     { file: "marhaba.mp4",    ar: "مرحبا",     en: "Hello" },
  "hi":        { file: "marhaba.mp4",    ar: "مرحبا",     en: "Hello" },
  "marhaba":   { file: "marhaba.mp4",    ar: "مرحبا",     en: "Hello" },
  "نعم":       { file: "na3am.mp4",      ar: "نعم",       en: "Yes" },
  "اه":        { file: "na3am.mp4",      ar: "نعم",       en: "Yes" },
  "yes":       { file: "na3am.mp4",      ar: "نعم",       en: "Yes" },
  "na3am":     { file: "na3am.mp4",      ar: "نعم",       en: "Yes" },
  "لا":        { file: "la.mp4",         ar: "لا",        en: "No" },
  "no":        { file: "la.mp4",         ar: "لا",        en: "No" },
  "la":        { file: "la.mp4",         ar: "لا",        en: "No" },
  "شكراً":     { file: "shokran.mp4",    ar: "شكراً",     en: "Thank you" },
  "شكرا":      { file: "shokran.mp4",    ar: "شكراً",     en: "Thank you" },
  "شكر":       { file: "shokran.mp4",    ar: "شكراً",     en: "Thank you" },
  "thank you": { file: "shokran.mp4",    ar: "شكراً",     en: "Thank you" },
  "thanks":    { file: "shokran.mp4",    ar: "شكراً",     en: "Thank you" },
  "shokran":   { file: "shokran.mp4",    ar: "شكراً",     en: "Thank you" },
  "أنا":       { file: "ana.mp4",        ar: "أنا",       en: "I / Me" },
  "انا":       { file: "ana.mp4",        ar: "أنا",       en: "I / Me" },
  "me":        { file: "ana.mp4",        ar: "أنا",       en: "I / Me" },
  "i":         { file: "ana.mp4",        ar: "أنا",       en: "I / Me" },
  "ana":       { file: "ana.mp4",        ar: "أنا",       en: "I / Me" },
  "أنت":       { file: "anta.mp4",       ar: "أنت",       en: "You" },
  "انت":       { file: "anta.mp4",       ar: "أنت",       en: "You" },
  "you":       { file: "anta.mp4",       ar: "أنت",       en: "You" },
  "anta":      { file: "anta.mp4",       ar: "أنت",       en: "You" },
  "مساعدة":    { file: "mosa3ada.mp4",   ar: "مساعدة",    en: "Help" },
  "مساعده":    { file: "mosa3ada.mp4",   ar: "مساعدة",    en: "Help" },
  "help":      { file: "mosa3ada.mp4",   ar: "مساعدة",    en: "Help" },
  "mosa3ada":  { file: "mosa3ada.mp4",   ar: "مساعدة",    en: "Help" },
  "ادرس":      { file: "adros.mp4",      ar: "ادرس",      en: "I study" },
  "أدرس":      { file: "adros.mp4",      ar: "ادرس",      en: "I study" },
  "adros":     { file: "adros.mp4",      ar: "ادرس",      en: "I study" },
  "study":     { file: "adros.mp4",      ar: "ادرس",      en: "I study" },
  "أفهم":      { file: "afham.mp4",      ar: "أفهم",      en: "I understand" },
  "افهم":      { file: "afham.mp4",      ar: "أفهم",      en: "I understand" },
  "afham":     { file: "afham.mp4",      ar: "أفهم",      en: "I understand" },
  "understand":{ file: "afham.mp4",      ar: "أفهم",      en: "I understand" },
  "أذهب":      { file: "athhab.mp4",     ar: "أذهب",      en: "I go" },
  "اذهب":      { file: "athhab.mp4",     ar: "أذهب",      en: "I go" },
  "athhab":    { file: "athhab.mp4",     ar: "أذهب",      en: "I go" },
  "go":        { file: "athhab.mp4",     ar: "أذهب",      en: "I go" },
  "بدي":       { file: "beddi.mp4",      ar: "بدي",       en: "I want" },
  "بدّي":      { file: "beddi.mp4",      ar: "بدي",       en: "I want" },
  "أريد":      { file: "beddi.mp4",      ar: "بدي",       en: "I want" },
  "اريد":      { file: "beddi.mp4",      ar: "بدي",       en: "I want" },
  "beddi":     { file: "beddi.mp4",      ar: "بدي",       en: "I want" },
  "want":      { file: "beddi.mp4",      ar: "بدي",       en: "I want" },
  "لغة":       { file: "logha.mp4",      ar: "لغة",       en: "Language" },
  "اللغة":     { file: "logha.mp4",      ar: "لغة",       en: "Language" },
  "logha":     { file: "logha.mp4",      ar: "لغة",       en: "Language" },
  "language":  { file: "logha.mp4",      ar: "لغة",       en: "Language" },
  "ماء":       { file: "mai.mp4",        ar: "ماء",       en: "Water" },
  "الماء":     { file: "mai.mp4",        ar: "ماء",       en: "Water" },
  "ماي":       { file: "mai.mp4",        ar: "ماء",       en: "Water" },
  "mai":       { file: "mai.mp4",        ar: "ماء",       en: "Water" },
  "water":     { file: "mai.mp4",        ar: "ماء",       en: "Water" },
  "مشروع":     { file: "mashroo3.mp4",   ar: "مشروع",     en: "Project" },
  "المشروع":   { file: "mashroo3.mp4",   ar: "مشروع",     en: "Project" },
  "mashroo3":  { file: "mashroo3.mp4",   ar: "مشروع",     en: "Project" },
  "project":   { file: "mashroo3.mp4",   ar: "مشروع",     en: "Project" },
  "طالب":      { file: "taleb.mp4",      ar: "طالب",      en: "Student" },
  "الطالب":    { file: "taleb.mp4",      ar: "طالب",      en: "Student" },
  "taleb":     { file: "taleb.mp4",      ar: "طالب",      en: "Student" },
  "student":   { file: "taleb.mp4",      ar: "طالب",      en: "Student" },
  "جامعة":     { file: "jam3a.mp4",      ar: "جامعة",     en: "University" },
  "الجامعة":   { file: "jam3a.mp4",      ar: "جامعة",     en: "University" },
  "jam3a":     { file: "jam3a.mp4",      ar: "جامعة",     en: "University" },
  "university":{ file: "jam3a.mp4",      ar: "جامعة",     en: "University" },
  "طعام":      { file: "ta3am.mp4",      ar: "طعام",      en: "Food" },
  "الطعام":    { file: "ta3am.mp4",      ar: "طعام",      en: "Food" },
  "اكل":       { file: "ta3am.mp4",      ar: "طعام",      en: "Food" },
  "أكل":       { file: "ta3am.mp4",      ar: "طعام",      en: "Food" },
  "ta3am":     { file: "ta3am.mp4",      ar: "طعام",      en: "Food" },
  "food":      { file: "ta3am.mp4",      ar: "طعام",      en: "Food" },
  "تخرج":      { file: "takharroj.mp4",  ar: "تخرج",      en: "Graduation" },
  "التخرج":    { file: "takharroj.mp4",  ar: "تخرج",      en: "Graduation" },
  "takharroj": { file: "takharroj.mp4",  ar: "تخرج",      en: "Graduation" },
  "graduation":{ file: "takharroj.mp4",  ar: "تخرج",      en: "Graduation" },
  "وداعاً":    { file: "wada3an.mp4",    ar: "وداعاً",    en: "Goodbye" },
  "وداعا":     { file: "wada3an.mp4",    ar: "وداعاً",    en: "Goodbye" },
  "وداع":      { file: "wada3an.mp4",    ar: "وداعاً",    en: "Goodbye" },
  "bye":       { file: "wada3an.mp4",    ar: "وداعاً",    en: "Goodbye" },
  "goodbye":   { file: "wada3an.mp4",    ar: "وداعاً",    en: "Goodbye" },
  "wada3an":   { file: "wada3an.mp4",    ar: "وداعاً",    en: "Goodbye" },
  "وين":       { file: "wein.mp4",       ar: "وين",       en: "Where" },
  "أين":       { file: "wein.mp4",       ar: "وين",       en: "Where" },
  "اين":       { file: "wein.mp4",       ar: "وين",       en: "Where" },
  "wein":      { file: "wein.mp4",       ar: "وين",       en: "Where" },
  "where":     { file: "wein.mp4",       ar: "وين",       en: "Where" },
  "إشارة":     { file: "ishara.mp4",     ar: "إشارة",     en: "Sign" },
  "اشارة":     { file: "ishara.mp4",     ar: "إشارة",     en: "Sign" },
  "ishara":    { file: "ishara.mp4",     ar: "إشارة",     en: "Sign" },
  "sign":      { file: "ishara.mp4",     ar: "إشارة",     en: "Sign" },
  "لو سمحت":   { file: "LawSamaht.mp4", ar: "لو سمحت",   en: "Please" },
  "لوسمحت":    { file: "LawSamaht.mp4", ar: "لو سمحت",   en: "Please" },
  "من فضلك":   { file: "LawSamaht.mp4", ar: "لو سمحت",   en: "Please" },
  "لو":        { file: "LawSamaht.mp4", ar: "لو سمحت",   en: "Please" },
  "lawsamaht": { file: "LawSamaht.mp4", ar: "لو سمحت",   en: "Please" },
  "please":    { file: "LawSamaht.mp4", ar: "لو سمحت",   en: "Please" },
  "excuse me": { file: "LawSamaht.mp4", ar: "لو سمحت",   en: "Please" },
};

/* Unique signs for the badge panel (deduplicated by file) */
const SIGN_BADGES = Object.values(
  Object.fromEntries(Object.values(VIDEO_MAP).map(v => [v.file, v]))
) as VideoEntry[];

type Token = { display: string; video: VideoEntry | null };

function tokenise(text: string): Token[] {
  const clean = text
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[.,،!؟?؛;:]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = clean.split(" ").filter(Boolean);
  const tokens: Token[] = [];
  let i = 0;
  while (i < words.length) {
    let matched = false;
    for (const len of [3, 2, 1]) {
      if (i + len > words.length) continue;
      const key = words.slice(i, i + len).join(" ").toLowerCase().trim();
      if (VIDEO_MAP[key]) {
        tokens.push({ display: words.slice(i, i + len).join(" "), video: VIDEO_MAP[key] });
        i += len; matched = true; break;
      }
    }
    if (!matched) { tokens.push({ display: words[i], video: null }); i++; }
  }
  return tokens;
}

/* Speech recognition types */
interface ISpeechRecognition extends EventTarget {
  continuous: boolean; interimResults: boolean; lang: string;
  start(): void; stop(): void;
  onresult: ((e: { results: SpeechRecognitionResultList }) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: Event) => void) | null;
}
declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition;
    webkitSpeechRecognition: new () => ISpeechRecognition;
  }
}

/* ─── Component ─────────────────────────────────────────────────────────────── */
export default function TextToSign() {
  const { user } = useAuth();
  const { addEntry } = useHistory();
  const [, setLocation] = useLocation();

  const [inputText, setInputText] = useState("");
  const [tokens, setTokens] = useState<Token[]>([]);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [listening, setListening] = useState(false);
  const [hasVoice, setHasVoice] = useState(false);
  const [showInput, setShowInput] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const recRef = useRef<ISpeechRecognition | null>(null);
  const skipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!user) setLocation("/");
    setHasVoice(!!(window.SpeechRecognition || window.webkitSpeechRecognition));
  }, [user]);

  /* Drive the queue: when current changes, update src directly (no remount) */
  useEffect(() => {
    if (!tokens.length) return;
    if (skipTimerRef.current) clearTimeout(skipTimerRef.current);
    const tok = tokens[current];
    if (tok.video) {
      if (videoRef.current) {
        const newSrc = `http://127.0.0.1:8000/signs/${tok.video.file}`;
        if (videoRef.current.src !== newSrc) {
          videoRef.current.src = newSrc;
        }
        if (playing) {
          const p = videoRef.current.play();
          if (p) p.catch(() => {});
        }
      }
    } else if (playing) {
      if (videoRef.current) { videoRef.current.src = ""; }
      skipTimerRef.current = setTimeout(() => advance(), 1200);
    }
    return () => { if (skipTimerRef.current) clearTimeout(skipTimerRef.current); };
  }, [current, tokens]);

  /* Sync play/pause without re-triggering on src change */
  useEffect(() => {
    if (!videoRef.current) return;
    if (playing && tokens[current]?.video) videoRef.current.play().catch(() => {});
    else if (!playing) videoRef.current.pause();
  }, [playing]);

  const advance = useCallback(() => {
    setCurrent(c => {
      if (c < tokens.length - 1) return c + 1;
      setPlaying(false);
      return c;
    });
  }, [tokens.length]);

  const handleConvert = useCallback(() => {
    if (!inputText.trim()) return;
    const toks = tokenise(inputText);
    setTokens(toks);
    setCurrent(0);
    setPlaying(false);
    setShowInput(false);
    setTimeout(() => setPlaying(true), 100);
    addEntry({
      type: "text-to-sign",
      text: inputText.trim(),
      words: toks.map(t => t.display),
    });
  }, [inputText, addEntry]);

  const handleClear = () => {
    setInputText(""); setTokens([]); setCurrent(0); setPlaying(false);
    setShowInput(true);
    if (skipTimerRef.current) clearTimeout(skipTimerRef.current);
  };

  const goTo = (idx: number) => { setCurrent(idx); setPlaying(true); };

  const toggleListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    if (listening) { recRef.current?.stop(); setListening(false); return; }
    const rec = new SR();
    rec.continuous = false; rec.interimResults = true; rec.lang = "ar-JO";
    recRef.current = rec;
    rec.onresult = (e: { results: SpeechRecognitionResultList }) =>
      setInputText(Array.from(e.results).map((r: SpeechRecognitionResult) => r[0].transcript).join(""));
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    rec.start(); setListening(true);
  }, [listening]);

  if (!user) return null;

  const currentToken = tokens[current] ?? null;
  const hasTokens = tokens.length > 0;
  const videoTokens = tokens.filter(t => t.video);
  const progress = hasTokens ? (current + 1) / tokens.length : 0;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-border sticky top-0 z-40 shadow-sm">
        <button
          onClick={() => setLocation("/home")}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-muted"
        >
          <ArrowLeft className="w-4 h-4" /><span className="text-sm">Back</span>
        </button>

        <div className="flex-1 flex items-center gap-2 min-w-0">
          {hasTokens && !showInput ? (
            <button
              onClick={() => setShowInput(s => !s)}
              className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted hover:bg-muted/80 transition-colors text-left min-w-0 border border-border"
            >
              <span className="text-foreground text-sm truncate flex-1" dir="rtl">{inputText}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground flex-shrink-0 transition-transform ${showInput ? "rotate-180" : ""}`} />
            </button>
          ) : (
            <div className="flex-1 text-center">
              <span className="text-foreground font-serif font-semibold">Text → Sign</span>
            </div>
          )}
        </div>

        {hasTokens && (
          <button onClick={handleClear} className="text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded-lg hover:bg-muted">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Collapsible input panel */}
      <AnimatePresence>
        {showInput && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden bg-muted/30 border-b border-border"
          >
            <div className="p-4 space-y-3">
              <textarea
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleConvert(); } }}
                placeholder="اكتب رسالتك"
                rows={3}
                autoFocus
                className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
              />
              <div className="flex items-center gap-2">
                {hasVoice && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleListening}
                    className={`gap-2 ${listening ? "border-red-400 text-red-500 animate-pulse" : ""}`}
                  >
                    {listening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                    {listening ? "Stop" : "Speak"}
                  </Button>
                )}
                <div className="flex-1 flex flex-wrap gap-1.5 overflow-hidden max-h-8">
                  {SIGN_BADGES.slice(0, 8).map(v => (
                    <button
                      key={v.file}
                      onClick={() => setInputText(t => t ? t + " " + v.ar : v.ar)}
                      className="text-xs px-2 py-0.5 rounded-full bg-muted hover:bg-primary/15 text-muted-foreground hover:text-primary transition-colors border border-border"
                    >
                      {v.ar}
                    </button>
                  ))}
                </div>
                <Button
                  onClick={handleConvert}
                  disabled={!inputText.trim()}
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 flex-shrink-0"
                >
                  <Send className="w-3.5 h-3.5" /> Play
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main player ── */}
      <div className="flex-1 flex flex-col bg-white">
        {!hasTokens ? (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center px-6">
            <div className="text-6xl">🤲</div>
            <div className="space-y-2 max-w-sm">
              <p className="text-foreground font-semibold text-xl">Write a sentence above</p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Type a sentence — or tap a word badge — then press <strong className="text-foreground">Play</strong>.
                Each word plays as one continuous sign sequence.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center max-w-md">
              {SIGN_BADGES.map(v => (
                <button
                  key={v.file}
                  onClick={() => { setInputText(t => t ? t + " " + v.ar : v.ar); setShowInput(true); }}
                  className="text-sm px-3 py-1.5 rounded-full bg-muted hover:bg-primary/15 text-muted-foreground hover:text-primary transition-colors border border-border"
                >
                  {v.ar}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            {/* Video — persistent element, src swapped via ref */}
            <div className="relative flex-1 bg-muted/20 flex items-center justify-center min-h-0">
              {/* Always-mounted video — never unmounted between words */}
              <video
                ref={videoRef}
                onEnded={advance}
                muted
                playsInline
                className={`w-full h-full object-contain absolute inset-0 ${currentToken?.video ? "block" : "hidden"}`}
              />

              {/* Text card for words with no video */}
              <AnimatePresence mode="wait">
                {!currentToken?.video && currentToken && (
                  <motion.div
                    key={`t-${current}`}
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center gap-3"
                  >
                    <p className="text-5xl md:text-7xl font-bold text-foreground text-center" dir="rtl">{currentToken.display}</p>
                    <p className="text-muted-foreground text-sm">No sign video for this word</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Current word overlay */}
              {currentToken?.video && (
                <div className="absolute top-4 left-0 right-0 flex items-center justify-center pointer-events-none">
                  <motion.div
                    key={current}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full border border-border shadow-sm"
                  >
                    <span className="text-foreground font-bold text-lg" dir="rtl">{currentToken.video.ar}</span>
                    <span className="text-muted-foreground text-sm">·</span>
                    <span className="text-muted-foreground text-sm">{currentToken.video.en}</span>
                  </motion.div>
                </div>
              )}

              {/* Word index */}
              <div className="absolute top-4 right-4 text-muted-foreground text-xs font-mono bg-white/80 px-2 py-0.5 rounded-full">
                {current + 1} / {tokens.length}
              </div>
            </div>

            {/* ── Bottom controls ── */}
            <div className="bg-white border-t border-border px-4 pt-3 pb-4 space-y-3 shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
              {/* Progress bar */}
              <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  animate={{ width: `${progress * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Word chips — scrollable row */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {tokens.map((tok, idx) => (
                  <button
                    key={idx}
                    onClick={() => goTo(idx)}
                    className={`flex-shrink-0 px-3 py-1 rounded-full text-sm font-medium transition-all border ${
                      idx === current
                        ? "bg-primary text-primary-foreground border-primary shadow-md scale-105"
                        : idx < current
                        ? "bg-muted text-muted-foreground/40 border-border line-through"
                        : tok.video
                        ? "bg-background text-foreground/70 border-border hover:bg-muted"
                        : "bg-transparent text-muted-foreground/40 border-dashed border-border"
                    }`}
                  >
                    {tok.display}
                  </button>
                ))}
              </div>

              {/* Transport controls */}
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => goTo(0)}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => goTo(current - 1)}
                  disabled={current === 0}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-25"
                >
                  <SkipBack className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setPlaying(p => !p)}
                  className="w-16 h-16 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center shadow-lg shadow-primary/25 transition-all active:scale-95"
                >
                  {playing
                    ? <Pause className="w-7 h-7 text-primary-foreground" />
                    : <Play className="w-7 h-7 text-primary-foreground ml-0.5" />}
                </button>
                <button
                  onClick={() => goTo(current + 1)}
                  disabled={current === tokens.length - 1}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-25"
                >
                  <SkipForward className="w-5 h-5" />
                </button>
                <Badge className={`text-xs border-0 w-9 h-9 items-center justify-center rounded-full ${videoTokens.length === tokens.length ? "bg-green-100 text-green-600" : "bg-muted text-muted-foreground"}`}>
                  {videoTokens.length}/{tokens.length}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
