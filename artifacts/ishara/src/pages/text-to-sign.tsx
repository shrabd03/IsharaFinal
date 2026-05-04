import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Mic, MicOff, Send, Trash2,
  SkipBack, SkipForward, Play, Pause, RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";

/* ─── Video dictionary ─────────────────────────────────────────────────────── */

type VideoEntry = { file: string; ar: string; en: string };

/** Every Arabic / English variant that maps to a video. Keys are lowercase-trimmed. */
const VIDEO_MAP: Record<string, VideoEntry> = {
  // marhaba – hello
  "مرحبا":    { file: "marhaba.mp4", ar: "مرحبا",    en: "Hello" },
  "مرحباً":   { file: "marhaba.mp4", ar: "مرحبا",    en: "Hello" },
  "مرحبه":    { file: "marhaba.mp4", ar: "مرحبا",    en: "Hello" },
  "hello":    { file: "marhaba.mp4", ar: "مرحبا",    en: "Hello" },
  "hi":       { file: "marhaba.mp4", ar: "مرحبا",    en: "Hello" },
  "marhaba":  { file: "marhaba.mp4", ar: "مرحبا",    en: "Hello" },

  // na3am – yes
  "نعم":      { file: "na3am.mp4",   ar: "نعم",      en: "Yes" },
  "اه":       { file: "na3am.mp4",   ar: "نعم",      en: "Yes" },
  "yes":      { file: "na3am.mp4",   ar: "نعم",      en: "Yes" },
  "na3am":    { file: "na3am.mp4",   ar: "نعم",      en: "Yes" },

  // la – no
  "لا":       { file: "la.mp4",      ar: "لا",       en: "No" },
  "no":       { file: "la.mp4",      ar: "لا",       en: "No" },
  "la":       { file: "la.mp4",      ar: "لا",       en: "No" },

  // shokran – thank you
  "شكراً":    { file: "shokran.mp4", ar: "شكراً",    en: "Thank you" },
  "شكرا":     { file: "shokran.mp4", ar: "شكراً",    en: "Thank you" },
  "شكر":      { file: "shokran.mp4", ar: "شكراً",    en: "Thank you" },
  "thank you":{ file: "shokran.mp4", ar: "شكراً",    en: "Thank you" },
  "thanks":   { file: "shokran.mp4", ar: "شكراً",    en: "Thank you" },
  "shokran":  { file: "shokran.mp4", ar: "شكراً",    en: "Thank you" },

  // ana – I / me
  "أنا":      { file: "ana.mp4",     ar: "أنا",      en: "I / Me" },
  "انا":      { file: "ana.mp4",     ar: "أنا",      en: "I / Me" },
  "me":       { file: "ana.mp4",     ar: "أنا",      en: "I / Me" },
  "i":        { file: "ana.mp4",     ar: "أنا",      en: "I / Me" },
  "ana":      { file: "ana.mp4",     ar: "أنا",      en: "I / Me" },

  // anta – you
  "أنت":      { file: "anta.mp4",    ar: "أنت",      en: "You" },
  "انت":      { file: "anta.mp4",    ar: "أنت",      en: "You" },
  "you":      { file: "anta.mp4",    ar: "أنت",      en: "You" },
  "anta":     { file: "anta.mp4",    ar: "أنت",      en: "You" },

  // mosa3ada – help
  "مساعدة":   { file: "mosa3ada.mp4",ar: "مساعدة",   en: "Help" },
  "مساعده":   { file: "mosa3ada.mp4",ar: "مساعدة",   en: "Help" },
  "help":     { file: "mosa3ada.mp4",ar: "مساعدة",   en: "Help" },
  "mosa3ada": { file: "mosa3ada.mp4",ar: "مساعدة",   en: "Help" },

  // adros – I study
  "ادرس":     { file: "adros.mp4",   ar: "ادرس",     en: "I study" },
  "أدرس":     { file: "adros.mp4",   ar: "ادرس",     en: "I study" },
  "adros":    { file: "adros.mp4",   ar: "ادرس",     en: "I study" },
  "study":    { file: "adros.mp4",   ar: "ادرس",     en: "I study" },

  // afham – I understand
  "أفهم":     { file: "afham.mp4",   ar: "أفهم",     en: "I understand" },
  "افهم":     { file: "afham.mp4",   ar: "أفهم",     en: "I understand" },
  "afham":    { file: "afham.mp4",   ar: "أفهم",     en: "I understand" },
  "understand":{ file: "afham.mp4",  ar: "أفهم",     en: "I understand" },

  // athhab – I go
  "أذهب":     { file: "athhab.mp4",  ar: "أذهب",     en: "I go" },
  "اذهب":     { file: "athhab.mp4",  ar: "أذهب",     en: "I go" },
  "athhab":   { file: "athhab.mp4",  ar: "أذهب",     en: "I go" },
  "go":       { file: "athhab.mp4",  ar: "أذهب",     en: "I go" },

  // beddi – I want
  "بدي":      { file: "beddi.mp4",   ar: "بدي",      en: "I want" },
  "بدّي":     { file: "beddi.mp4",   ar: "بدي",      en: "I want" },
  "أريد":     { file: "beddi.mp4",   ar: "بدي",      en: "I want" },
  "اريد":     { file: "beddi.mp4",   ar: "بدي",      en: "I want" },
  "beddi":    { file: "beddi.mp4",   ar: "بدي",      en: "I want" },
  "want":     { file: "beddi.mp4",   ar: "بدي",      en: "I want" },

  // logha – language
  "لغة":      { file: "logha.mp4",   ar: "لغة",      en: "Language" },
  "اللغة":    { file: "logha.mp4",   ar: "لغة",      en: "Language" },
  "logha":    { file: "logha.mp4",   ar: "لغة",      en: "Language" },
  "language": { file: "logha.mp4",   ar: "لغة",      en: "Language" },

  // mai – water
  "ماء":      { file: "mai.mp4",     ar: "ماء",      en: "Water" },
  "الماء":    { file: "mai.mp4",     ar: "ماء",      en: "Water" },
  "ماي":      { file: "mai.mp4",     ar: "ماء",      en: "Water" },
  "mai":      { file: "mai.mp4",     ar: "ماء",      en: "Water" },
  "water":    { file: "mai.mp4",     ar: "ماء",      en: "Water" },

  // mashroo3 – project
  "مشروع":    { file: "mashroo3.mp4",ar: "مشروع",    en: "Project" },
  "المشروع":  { file: "mashroo3.mp4",ar: "مشروع",    en: "Project" },
  "mashroo3": { file: "mashroo3.mp4",ar: "مشروع",    en: "Project" },
  "project":  { file: "mashroo3.mp4",ar: "مشروع",    en: "Project" },

  // taleb – student
  "طالب":     { file: "taleb.mp4",   ar: "طالب",     en: "Student" },
  "الطالب":   { file: "taleb.mp4",   ar: "طالب",     en: "Student" },
  "taleb":    { file: "taleb.mp4",   ar: "طالب",     en: "Student" },
  "student":  { file: "taleb.mp4",   ar: "طالب",     en: "Student" },

  // jam3a – university
  "جامعة":    { file: "jam3a.mp4",   ar: "جامعة",    en: "University" },
  "الجامعة":  { file: "jam3a.mp4",   ar: "جامعة",    en: "University" },
  "jam3a":    { file: "jam3a.mp4",   ar: "جامعة",    en: "University" },
  "university":{ file: "jam3a.mp4",  ar: "جامعة",    en: "University" },

  // ta3am – food
  "طعام":     { file: "ta3am.mp4",   ar: "طعام",     en: "Food" },
  "الطعام":   { file: "ta3am.mp4",   ar: "طعام",     en: "Food" },
  "اكل":      { file: "ta3am.mp4",   ar: "طعام",     en: "Food" },
  "أكل":      { file: "ta3am.mp4",   ar: "طعام",     en: "Food" },
  "ta3am":    { file: "ta3am.mp4",   ar: "طعام",     en: "Food" },
  "food":     { file: "ta3am.mp4",   ar: "طعام",     en: "Food" },

  // takharroj – graduation
  "تخرج":     { file: "takharroj.mp4",ar: "تخرج",    en: "Graduation" },
  "التخرج":   { file: "takharroj.mp4",ar: "تخرج",    en: "Graduation" },
  "takharroj":{ file: "takharroj.mp4",ar: "تخرج",    en: "Graduation" },
  "graduation":{ file: "takharroj.mp4",ar: "تخرج",   en: "Graduation" },

  // wada3an – goodbye
  "وداعاً":   { file: "wada3an.mp4", ar: "وداعاً",   en: "Goodbye" },
  "وداعا":    { file: "wada3an.mp4", ar: "وداعاً",   en: "Goodbye" },
  "وداع":     { file: "wada3an.mp4", ar: "وداعاً",   en: "Goodbye" },
  "bye":      { file: "wada3an.mp4", ar: "وداعاً",   en: "Goodbye" },
  "goodbye":  { file: "wada3an.mp4", ar: "وداعاً",   en: "Goodbye" },
  "wada3an":  { file: "wada3an.mp4", ar: "وداعاً",   en: "Goodbye" },

  // wein – where
  "وين":      { file: "wein.mp4",    ar: "وين",      en: "Where" },
  "أين":      { file: "wein.mp4",    ar: "وين",      en: "Where" },
  "اين":      { file: "wein.mp4",    ar: "وين",      en: "Where" },
  "wein":     { file: "wein.mp4",    ar: "وين",      en: "Where" },
  "where":    { file: "wein.mp4",    ar: "وين",      en: "Where" },

  // ishara – sign
  "إشارة":    { file: "ishara.mp4",  ar: "إشارة",    en: "Sign" },
  "اشارة":    { file: "ishara.mp4",  ar: "إشارة",    en: "Sign" },
  "ishara":   { file: "ishara.mp4",  ar: "إشارة",    en: "Sign" },
  "sign":     { file: "ishara.mp4",  ar: "إشارة",    en: "Sign" },

  // LawSamaht – please / excuse me (2-word key too)
  "لو سمحت":  { file: "LawSamaht.mp4", ar: "لو سمحت", en: "Please / Excuse me" },
  "لوسمحت":   { file: "LawSamaht.mp4", ar: "لو سمحت", en: "Please / Excuse me" },
  "من فضلك":  { file: "LawSamaht.mp4", ar: "لو سمحت", en: "Please / Excuse me" },
  "لو":       { file: "LawSamaht.mp4", ar: "لو سمحت", en: "Please / Excuse me" },
  "lawsamaht":{ file: "LawSamaht.mp4", ar: "لو سمحت", en: "Please / Excuse me" },
  "please":   { file: "LawSamaht.mp4", ar: "لو سمحت", en: "Please / Excuse me" },
  "excuse me":{ file: "LawSamaht.mp4", ar: "لو سمحت", en: "Please / Excuse me" },
};

/* ─── Token type ────────────────────────────────────────────────────────────── */
type Token = {
  display: string;          // original text to show in the word strip
  video: VideoEntry | null; // null = no video for this word
};

/* ─── Tokeniser ─────────────────────────────────────────────────────────────── */
function tokenise(text: string): Token[] {
  // Strip Arabic diacritics, normalise whitespace
  const clean = text
    .replace(/[\u064B-\u065F\u0670]/g, "")   // Arabic diacritics
    .replace(/[.,،!؟?؛;:،]/g, " ")           // punctuation → space
    .replace(/\s+/g, " ")
    .trim();

  const words = clean.split(" ").filter(Boolean);
  const tokens: Token[] = [];
  let i = 0;

  while (i < words.length) {
    // Try 3-word match, then 2-word, then 1-word
    let matched = false;
    for (const len of [3, 2, 1]) {
      if (i + len > words.length) continue;
      const phrase = words.slice(i, i + len).join(" ");
      const key = phrase.toLowerCase().trim();
      if (VIDEO_MAP[key]) {
        tokens.push({ display: phrase, video: VIDEO_MAP[key] });
        i += len;
        matched = true;
        break;
      }
    }
    if (!matched) {
      tokens.push({ display: words[i], video: null });
      i++;
    }
  }
  return tokens;
}

/* ─── Speech recognition shim ──────────────────────────────────────────────── */
interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
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
  const [, setLocation] = useLocation();

  const [inputText, setInputText] = useState("");
  const [tokens, setTokens] = useState<Token[]>([]);
  const [current, setCurrent] = useState(0);          // index into tokens
  const [playing, setPlaying] = useState(false);
  const [listening, setListening] = useState(false);
  const [hasVoice, setHasVoice] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const recRef = useRef<ISpeechRecognition | null>(null);
  const skipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!user) setLocation("/");
    setHasVoice(!!(window.SpeechRecognition || window.webkitSpeechRecognition));
  }, [user]);

  /* When current token changes while playing, load + play the new video */
  useEffect(() => {
    if (!tokens.length) return;
    const tok = tokens[current];

    if (skipTimerRef.current) clearTimeout(skipTimerRef.current);

    if (tok.video) {
      if (videoRef.current) {
        videoRef.current.load();
        if (playing) videoRef.current.play().catch(() => {});
      }
    } else {
      // No video: show word card for 1.8 s then advance
      if (playing) {
        skipTimerRef.current = setTimeout(() => {
          if (current < tokens.length - 1) setCurrent(c => c + 1);
          else setPlaying(false);
        }, 1800);
      }
    }
    return () => { if (skipTimerRef.current) clearTimeout(skipTimerRef.current); };
  }, [current, tokens]);

  const handleConvert = useCallback(() => {
    if (!inputText.trim()) return;
    const toks = tokenise(inputText);
    setTokens(toks);
    setCurrent(0);
    setPlaying(false);
    setTimeout(() => {
      setPlaying(true);
    }, 80);
  }, [inputText]);

  const handleVideoEnded = () => {
    if (current < tokens.length - 1) {
      setCurrent(c => c + 1);
    } else {
      setPlaying(false);
    }
  };

  /* Sync play/pause with video element */
  useEffect(() => {
    if (!videoRef.current || !tokens[current]?.video) return;
    if (playing) videoRef.current.play().catch(() => {});
    else videoRef.current.pause();
  }, [playing]);

  const goTo = (idx: number) => {
    if (idx < 0 || idx >= tokens.length) return;
    setCurrent(idx);
    setPlaying(true);
  };

  /* Voice input */
  const toggleListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    if (listening) { recRef.current?.stop(); setListening(false); return; }
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = "ar-JO";
    recRef.current = rec;
    rec.onresult = (e: { results: SpeechRecognitionResultList }) => {
      setInputText(Array.from(e.results).map((r: SpeechRecognitionResult) => r[0].transcript).join(""));
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    rec.start();
    setListening(true);
  }, [listening]);

  const handleClear = () => {
    setInputText(""); setTokens([]); setCurrent(0); setPlaying(false);
    if (skipTimerRef.current) clearTimeout(skipTimerRef.current);
  };

  if (!user) return null;

  const currentToken = tokens[current] ?? null;
  const hasTokens = tokens.length > 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center gap-3 sticky top-0 z-40">
        <button onClick={() => setLocation("/home")} className="flex items-center gap-2 text-primary-foreground/80 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/10">
          <ArrowLeft className="w-5 h-5" /><span className="text-sm font-medium">Back</span>
        </button>
        <div className="flex-1 text-center">
          <h1 className="font-serif font-bold text-lg">Text → Sign</h1>
          <p className="text-primary-foreground/70 text-xs">Type or speak — watch the signs</p>
        </div>
        <div className="w-16" />
      </div>

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left: Input */}
        <div className="w-full lg:w-96 xl:w-[420px] border-r border-border bg-card flex flex-col">
          <div className="p-4 border-b border-border">
            <p className="font-semibold text-sm text-foreground mb-0.5">Your message</p>
            <p className="text-xs text-muted-foreground">Type in Arabic or English. Each word will play as a JSL sign video.</p>
          </div>
          <div className="p-4 space-y-3 flex-1 flex flex-col">
            <textarea
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleConvert(); } }}
              placeholder={"مثال: مرحبا أنا طالب\nExample: hello i want food"}
              rows={5}
              className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
            />
            <div className="flex items-center gap-2">
              {hasVoice && (
                <Button variant={listening ? "destructive" : "outline"} onClick={toggleListening} className={`gap-2 h-10 ${listening ? "animate-pulse" : ""}`}>
                  {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  {listening ? "Stop" : "Speak"}
                </Button>
              )}
              {(inputText || hasTokens) && (
                <Button variant="ghost" onClick={handleClear} className="h-10 text-muted-foreground hover:text-destructive gap-1.5">
                  <Trash2 className="w-4 h-4" /> Clear
                </Button>
              )}
              <Button onClick={handleConvert} disabled={!inputText.trim()} className="ml-auto h-10 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-6">
                <Send className="w-4 h-4" /> Show Signs
              </Button>
            </div>
            {listening && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 px-3 py-2 bg-destructive/5 border border-destructive/20 rounded-xl">
                <motion.div className="w-2 h-2 rounded-full bg-red-500" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 0.8, repeat: Infinity }} />
                <span className="text-sm text-destructive font-medium">Listening in Arabic…</span>
              </motion.div>
            )}
          </div>

          {/* Dictionary legend */}
          <div className="p-4 border-t border-border mt-auto">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">22 known signs</p>
            <div className="flex flex-wrap gap-1.5">
              {Object.values(
                Object.fromEntries(
                  Object.values(VIDEO_MAP).map(v => [v.file, v])
                )
              ).map(v => (
                <Badge key={v.file} variant="secondary" className="text-xs cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
                  onClick={() => { setInputText(t => t ? t + " " + v.ar : v.ar); }}>
                  {v.ar}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Video player */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6 bg-background">
          {!hasTokens ? (
            <div className="text-center space-y-4 max-w-sm">
              <div className="w-20 h-20 rounded-full bg-muted mx-auto flex items-center justify-center text-4xl">🤲</div>
              <p className="text-foreground font-semibold text-lg">Ready to translate</p>
              <p className="text-muted-foreground text-sm">
                Type a sentence on the left — or tap any sign badge to add it — then press <strong>Show Signs</strong>.
                Videos from Sign Mahmoud will play one word at a time.
              </p>
            </div>
          ) : (
            <div className="w-full max-w-2xl space-y-5">
              {/* Word strip */}
              <div className="flex flex-wrap gap-2 justify-center">
                {tokens.map((tok, idx) => (
                  <button
                    key={idx}
                    onClick={() => goTo(idx)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all border-2 ${
                      idx === current
                        ? "bg-primary text-primary-foreground border-primary scale-105 shadow-md"
                        : tok.video
                        ? "bg-card border-border hover:border-primary/40 text-foreground"
                        : "bg-muted/50 border-dashed border-muted-foreground/30 text-muted-foreground"
                    }`}
                  >
                    {tok.display}
                    {!tok.video && <span className="ml-1 text-xs opacity-50">?</span>}
                  </button>
                ))}
              </div>

              {/* Video / card */}
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-video shadow-xl border border-border">
                <AnimatePresence mode="wait">
                  {currentToken?.video ? (
                    <motion.div key={current} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="absolute inset-0">
                      <video
                        ref={videoRef}
                        key={currentToken.video.file}
                        src={`${import.meta.env.BASE_URL}signs/${currentToken.video.file}`}
                        onEnded={handleVideoEnded}
                        muted
                        playsInline
                        className="w-full h-full object-contain bg-black"
                      />
                    </motion.div>
                  ) : currentToken ? (
                    <motion.div key={`text-${current}`} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-primary/10 to-background p-8">
                      <p className="text-5xl font-bold text-foreground text-center" dir="rtl">{currentToken.display}</p>
                      <p className="text-muted-foreground text-sm">No sign video yet for this word</p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                {/* Current word label overlay */}
                {currentToken?.video && (
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                    <Badge className="bg-black/60 text-white border-0 text-base px-3 py-1" dir="rtl">
                      {currentToken.video.ar}
                    </Badge>
                    <Badge className="bg-black/60 text-white border-0">
                      {currentToken.video.en}
                    </Badge>
                  </div>
                )}

                {/* Progress */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${((current + 1) / tokens.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-3">
                <Button variant="outline" size="icon" onClick={() => goTo(0)} disabled={current === 0 && !playing} className="rounded-full w-10 h-10">
                  <RotateCcw className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => goTo(current - 1)} disabled={current === 0} className="rounded-full w-10 h-10">
                  <SkipBack className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  onClick={() => setPlaying(p => !p)}
                  className="rounded-full w-14 h-14 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
                >
                  {playing ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                </Button>
                <Button variant="outline" size="icon" onClick={() => goTo(current + 1)} disabled={current === tokens.length - 1} className="rounded-full w-10 h-10">
                  <SkipForward className="w-4 h-4" />
                </Button>
                <div className="ml-2 text-sm text-muted-foreground">
                  {current + 1} / {tokens.length}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
