import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Stethoscope, LifeBuoy, UtensilsCrossed, Car, ShoppingBag,
  Users, Plane, Siren, ArrowLeft, X, Send, ChevronRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";

type Phrase = { ar: string; en: string };
type Category = {
  id: string;
  ar: string;
  en: string;
  icon: LucideIcon;
  bg: string;
  iconBg: string;
  iconColor: string;
  phrases: Phrase[];
};

const CATEGORIES: Category[] = [
  {
    id: "doctor", ar: "الطبيب", en: "Doctor",
    icon: Stethoscope,
    bg: "bg-rose-50 border-rose-200 hover:border-rose-400",
    iconBg: "bg-rose-100", iconColor: "text-rose-600",
    phrases: [
      { ar: "أنا أصم، من فضلك اكتب لي.", en: "I am deaf, please write to me." },
      { ar: "أحتاج طبيبًا.", en: "I need a doctor." },
      { ar: "أشعر بألم هنا.", en: "I feel pain here." },
      { ar: "أنا أتناول هذا الدواء.", en: "I take this medication." },
      { ar: "هل يمكنني الحصول على وصفة طبية؟", en: "Can I get a prescription?" },
      { ar: "متى موعدي القادم؟", en: "When is my next appointment?" },
      { ar: "لدي حساسية من...", en: "I am allergic to..." },
      { ar: "هل هذا خطير؟", en: "Is this serious?" },
    ],
  },
  {
    id: "help", ar: "المساعدة", en: "Help",
    icon: LifeBuoy,
    bg: "bg-amber-50 border-amber-200 hover:border-amber-400",
    iconBg: "bg-amber-100", iconColor: "text-amber-600",
    phrases: [
      { ar: "هل يمكنك مساعدتي من فضلك؟", en: "Can you help me, please?" },
      { ar: "أنا أصم ولا أستطيع السمع.", en: "I am deaf and cannot hear." },
      { ar: "من فضلك تكلم ببطء.", en: "Please speak slowly." },
      { ar: "اكتب الجواب هنا.", en: "Please type your answer here." },
      { ar: "لا أفهم، أعد من فضلك.", en: "I don't understand, please repeat." },
      { ar: "شكرًا جزيلًا لك.", en: "Thank you very much." },
    ],
  },
  {
    id: "food", ar: "الطعام", en: "Food",
    icon: UtensilsCrossed,
    bg: "bg-orange-50 border-orange-200 hover:border-orange-400",
    iconBg: "bg-orange-100", iconColor: "text-orange-600",
    phrases: [
      { ar: "أريد قائمة الطعام من فضلك.", en: "I would like the menu, please." },
      { ar: "ماذا توصي؟", en: "What do you recommend?" },
      { ar: "لا آكل اللحم.", en: "I don't eat meat." },
      { ar: "بدون سكر، شكرًا.", en: "Without sugar, please." },
      { ar: "الحساب من فضلك.", en: "The bill, please." },
      { ar: "هذا الطعام لذيذ.", en: "This food is delicious." },
      { ar: "أريد كأس ماء.", en: "I would like a glass of water." },
    ],
  },
  {
    id: "taxi", ar: "التاكسي", en: "Taxi",
    icon: Car,
    bg: "bg-yellow-50 border-yellow-200 hover:border-yellow-400",
    iconBg: "bg-yellow-100", iconColor: "text-yellow-700",
    phrases: [
      { ar: "خذني إلى هذا العنوان من فضلك.", en: "Take me to this address, please." },
      { ar: "كم الأجرة؟", en: "How much is the fare?" },
      { ar: "من فضلك شغّل العداد.", en: "Please turn on the meter." },
      { ar: "توقف هنا من فضلك.", en: "Stop here, please." },
      { ar: "أنا مستعجل.", en: "I am in a hurry." },
      { ar: "هل يمكنك الانتظار قليلًا؟", en: "Can you wait a moment?" },
    ],
  },
  {
    id: "shopping", ar: "التسوق", en: "Shopping",
    icon: ShoppingBag,
    bg: "bg-emerald-50 border-emerald-200 hover:border-emerald-400",
    iconBg: "bg-emerald-100", iconColor: "text-emerald-600",
    phrases: [
      { ar: "كم سعر هذا؟", en: "How much is this?" },
      { ar: "هل يوجد مقاس آخر؟", en: "Is there another size?" },
      { ar: "أين غرفة القياس؟", en: "Where is the fitting room?" },
      { ar: "هل تقبلون البطاقة؟", en: "Do you accept card?" },
      { ar: "أحتاج إيصالًا من فضلك.", en: "I need a receipt, please." },
      { ar: "هل يمكنني إرجاعه لاحقًا؟", en: "Can I return it later?" },
    ],
  },
  {
    id: "family", ar: "العائلة", en: "Family",
    icon: Users,
    bg: "bg-pink-50 border-pink-200 hover:border-pink-400",
    iconBg: "bg-pink-100", iconColor: "text-pink-600",
    phrases: [
      { ar: "كيف حالك؟", en: "How are you?" },
      { ar: "أحبك.", en: "I love you." },
      { ar: "اشتقت إليك.", en: "I missed you." },
      { ar: "متى ستأتي؟", en: "When will you come?" },
      { ar: "أنا بخير، شكرًا.", en: "I am well, thank you." },
      { ar: "اتصل بي لاحقًا.", en: "Call me later." },
    ],
  },
  {
    id: "travel", ar: "السفر", en: "Travel",
    icon: Plane,
    bg: "bg-sky-50 border-sky-200 hover:border-sky-400",
    iconBg: "bg-sky-100", iconColor: "text-sky-600",
    phrases: [
      { ar: "أين البوابة رقم...؟", en: "Where is gate number...?" },
      { ar: "هذه أمتعتي.", en: "This is my luggage." },
      { ar: "متى تقلع الرحلة؟", en: "When does the flight depart?" },
      { ar: "أين محطة الحافلات؟", en: "Where is the bus station?" },
      { ar: "لقد ضعت، هل تساعدني؟", en: "I am lost, can you help me?" },
    ],
  },
  {
    id: "emergency", ar: "الطوارئ", en: "Emergency",
    icon: Siren,
    bg: "bg-red-50 border-red-200 hover:border-red-400",
    iconBg: "bg-red-100", iconColor: "text-red-600",
    phrases: [
      { ar: "اتصل بالشرطة من فضلك!", en: "Please call the police!" },
      { ar: "أحتاج إسعافًا.", en: "I need an ambulance." },
      { ar: "هذه حالة طارئة.", en: "This is an emergency." },
      { ar: "أنا مصاب.", en: "I am injured." },
      { ar: "اتصل بهذا الرقم: ...", en: "Call this number: ..." },
    ],
  },
];

export default function Phrasebook() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [showingPhrase, setShowingPhrase] = useState<Phrase | null>(null);
  const [reply, setReply] = useState("");
  const [submittedReply, setSubmittedReply] = useState("");

  useEffect(() => {
    if (!user) setLocation("/");
  }, [user, setLocation]);

  if (!user) return null;

  const handlePhraseClick = (phrase: Phrase) => {
    setShowingPhrase(phrase);
    setReply("");
    setSubmittedReply("");
  };

  const handleSubmitReply = () => {
    if (reply.trim()) { setSubmittedReply(reply.trim()); setReply(""); }
  };

  const handleClosePhrase = () => {
    setShowingPhrase(null);
    setReply("");
    setSubmittedReply("");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="text-white py-10" style={{ backgroundColor: "#1F768E" }}>
          <div className="container mx-auto px-4 max-w-6xl">
            <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">Phrasebook</h1>
            <p className="text-white/80 max-w-xl">
              Choose a situation below. Tap any phrase to show it in large text to the person you're talking with.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 max-w-6xl py-10">
          <AnimatePresence mode="wait">
            {!activeCategory ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-5"
              >
                {CATEGORIES.map((cat, i) => {
                  const Icon = cat.icon;
                  return (
                    <motion.button
                      key={cat.id}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07, duration: 0.4 }}
                      onClick={() => setActiveCategory(cat)}
                      className={`group relative rounded-2xl border-2 ${cat.bg} p-6 flex flex-col items-center gap-4 text-center transition-all hover:shadow-lg hover:-translate-y-1 duration-200`}
                    >
                      <div className={`w-20 h-20 rounded-2xl ${cat.iconBg} ${cat.iconColor} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                        <Icon className="w-10 h-10" strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="font-bold text-lg text-foreground">{cat.en}</p>
                        <p className="text-sm text-muted-foreground mt-0.5" dir="rtl" lang="ar">{cat.ar}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {cat.phrases.length} phrases
                      </Badge>
                      <ChevronRight className={`absolute top-4 right-4 w-4 h-4 ${cat.iconColor} opacity-0 group-hover:opacity-100 transition-opacity`} />
                    </motion.button>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                key="phrases"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-3 mb-8">
                  <button
                    onClick={() => setActiveCategory(null)}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted"
                  >
                    <ArrowLeft className="w-4 h-4" /> All categories
                  </button>
                  <div className={`w-9 h-9 rounded-xl ${activeCategory.iconBg} ${activeCategory.iconColor} flex items-center justify-center`}>
                    <activeCategory.icon className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <div>
                    <span className="font-bold text-foreground text-lg">{activeCategory.en}</span>
                    <span className="text-muted-foreground ml-2 text-sm" dir="rtl" lang="ar">({activeCategory.ar})</span>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeCategory.phrases.map((phrase, idx) => {
                    const Icon = activeCategory.icon;
                    return (
                      <motion.button
                        key={idx}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.06 }}
                        onClick={() => handlePhraseClick(phrase)}
                        className={`group text-left rounded-2xl border-2 ${activeCategory.bg} p-5 space-y-3 hover:shadow-md transition-all hover:-translate-y-0.5 duration-150 w-full`}
                      >
                        <div className="flex items-center justify-between">
                          <div className={`w-9 h-9 rounded-xl ${activeCategory.iconBg} ${activeCategory.iconColor} flex items-center justify-center`}>
                            <Icon className="w-5 h-5" strokeWidth={1.5} />
                          </div>
                          <Badge variant="secondary" className="text-xs opacity-70 group-hover:opacity-100">Tap to show</Badge>
                        </div>
                        <p className="text-xl font-semibold text-foreground leading-snug" dir="rtl" lang="ar">{phrase.ar}</p>
                        <p className="text-sm text-muted-foreground italic">{phrase.en}</p>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {showingPhrase && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={handleClosePhrase}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="bg-background rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <button onClick={handleClosePhrase} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-muted transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Back to phrases
                </button>
                <button onClick={handleClosePhrase} className="w-9 h-9 rounded-full hover:bg-muted flex items-center justify-center transition-colors" aria-label="Close">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 md:p-12 space-y-8">
                <div className="text-center">
                  <Badge className="bg-primary/10 text-primary border-0">{activeCategory?.en} · {activeCategory?.ar}</Badge>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mt-4">Show this to the person you're talking with</p>
                </div>

                <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-8 md:p-12 border border-primary/10">
                  <p className="text-4xl md:text-6xl font-bold text-foreground leading-tight text-center" dir="rtl" lang="ar">
                    {showingPhrase.ar}
                  </p>
                  <p className="text-lg md:text-xl text-muted-foreground text-center mt-6 italic">{showingPhrase.en}</p>
                </div>

                {submittedReply ? (
                  <div className="space-y-3">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground text-center">Their reply</p>
                    <div className="bg-secondary/10 border border-secondary/30 rounded-2xl p-6">
                      <p className="text-2xl md:text-3xl text-foreground leading-relaxed text-center">{submittedReply}</p>
                    </div>
                    <div className="flex justify-center gap-3 pt-2">
                      <Button variant="outline" onClick={() => { setSubmittedReply(""); setReply(""); }}>Clear reply</Button>
                      <Button onClick={handleClosePhrase}>Done</Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground text-center">Hand the device over — they can type their reply here</p>
                    <div className="flex gap-2">
                      <Input value={reply} onChange={e => setReply(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmitReply()} placeholder="Type your reply..." className="h-14 text-lg" autoFocus />
                      <Button onClick={handleSubmitReply} disabled={!reply.trim()} className="h-14 px-6 bg-primary text-primary-foreground hover:bg-primary/90">
                        <Send className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
