import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Stethoscope, LifeBuoy, UtensilsCrossed, Car, ShoppingBag, Users, Plane, Siren, X, Send, ArrowLeft } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

type Phrase = { ar: string; en: string };
type Category = {
  id: string;
  ar: string;
  en: string;
  icon: LucideIcon;
  color: string;
  phrases: Phrase[];
};

const CATEGORIES: Category[] = [
  {
    id: "doctor",
    ar: "الطبيب",
    en: "Doctor",
    icon: Stethoscope,
    color: "from-rose-500/20 to-rose-500/5 text-rose-600",
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
    id: "help",
    ar: "المساعدة",
    en: "Help",
    icon: LifeBuoy,
    color: "from-amber-500/20 to-amber-500/5 text-amber-600",
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
    id: "food",
    ar: "الطعام",
    en: "Food",
    icon: UtensilsCrossed,
    color: "from-orange-500/20 to-orange-500/5 text-orange-600",
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
    id: "taxi",
    ar: "التاكسي",
    en: "Taxi",
    icon: Car,
    color: "from-yellow-500/20 to-yellow-500/5 text-yellow-700",
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
    id: "shopping",
    ar: "التسوق",
    en: "Shopping",
    icon: ShoppingBag,
    color: "from-emerald-500/20 to-emerald-500/5 text-emerald-600",
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
    id: "family",
    ar: "العائلة",
    en: "Family",
    icon: Users,
    color: "from-pink-500/20 to-pink-500/5 text-pink-600",
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
    id: "travel",
    ar: "السفر",
    en: "Travel",
    icon: Plane,
    color: "from-sky-500/20 to-sky-500/5 text-sky-600",
    phrases: [
      { ar: "أين البوابة رقم...؟", en: "Where is gate number...?" },
      { ar: "هذه أمتعتي.", en: "This is my luggage." },
      { ar: "متى تقلع الرحلة؟", en: "When does the flight depart?" },
      { ar: "أين محطة الحافلات؟", en: "Where is the bus station?" },
      { ar: "لقد ضعت، هل تساعدني؟", en: "I am lost, can you help me?" },
    ],
  },
  {
    id: "emergency",
    ar: "الطوارئ",
    en: "Emergency",
    icon: Siren,
    color: "from-red-500/20 to-red-500/5 text-red-600",
    phrases: [
      { ar: "اتصل بالشرطة من فضلك!", en: "Please call the police!" },
      { ar: "أحتاج إسعافًا.", en: "I need an ambulance." },
      { ar: "هذه حالة طارئة.", en: "This is an emergency." },
      { ar: "أنا مصاب.", en: "I am injured." },
      { ar: "اتصل بهذا الرقم: ...", en: "Call this number: ..." },
    ],
  },
];

export function PhrasebookSection() {
  const [activeCategory, setActiveCategory] = useState<Category>(CATEGORIES[0]);
  const [showingPhrase, setShowingPhrase] = useState<Phrase | null>(null);
  const [reply, setReply] = useState("");
  const [submittedReply, setSubmittedReply] = useState("");

  const handlePhraseClick = (phrase: Phrase) => {
    setShowingPhrase(phrase);
    setReply("");
    setSubmittedReply("");
  };

  const handleSubmitReply = () => {
    if (reply.trim()) {
      setSubmittedReply(reply.trim());
      setReply("");
    }
  };

  const handleClose = () => {
    setShowingPhrase(null);
    setReply("");
    setSubmittedReply("");
  };

  return (
    <section id="conversations" className="py-20 bg-background">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-serif text-foreground mb-3">Phrasebook for daily life</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Pick a category, tap a phrase, and show it to the hearing person on your screen. They can type a reply back to you.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory.id === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium border transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-md"
                    : "bg-card text-foreground border-border hover:border-primary/40 hover:bg-primary/5"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{cat.en}</span>
                <span className="opacity-70" dir="rtl">({cat.ar})</span>
              </button>
            );
          })}
        </div>

        <motion.div
          key={activeCategory.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {activeCategory.phrases.map((phrase, idx) => {
            const Icon = activeCategory.icon;
            return (
              <Card
                key={idx}
                onClick={() => handlePhraseClick(phrase)}
                className={`group cursor-pointer hover:shadow-lg hover:border-primary/40 transition-all bg-gradient-to-br ${activeCategory.color}`}
              >
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-white/70 backdrop-blur-sm flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <Badge variant="secondary" className="bg-white/60 text-foreground/70 text-xs">
                      Tap to show
                    </Badge>
                  </div>
                  <p className="text-xl font-medium text-foreground leading-relaxed" dir="rtl" lang="ar">
                    {phrase.ar}
                  </p>
                  <p className="text-sm text-muted-foreground italic">{phrase.en}</p>
                </CardContent>
              </Card>
            );
          })}
        </motion.div>
      </div>

      <AnimatePresence>
        {showingPhrase && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="bg-background rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <button
                  onClick={handleClose}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to phrases
                </button>
                <button
                  onClick={handleClose}
                  className="w-9 h-9 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 md:p-12 space-y-8">
                <div className="text-center space-y-2">
                  <Badge className="bg-primary/10 text-primary border-0">
                    {activeCategory.en} · {activeCategory.ar}
                  </Badge>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mt-4">
                    Show this to the person you're talking with
                  </p>
                </div>

                <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-8 md:p-12 border border-primary/10">
                  <p
                    className="text-4xl md:text-6xl font-bold text-foreground leading-tight text-center"
                    dir="rtl"
                    lang="ar"
                  >
                    {showingPhrase.ar}
                  </p>
                  <p className="text-lg md:text-xl text-muted-foreground text-center mt-6 italic">
                    {showingPhrase.en}
                  </p>
                </div>

                {submittedReply ? (
                  <div className="space-y-3">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground text-center">
                      Their reply
                    </p>
                    <div className="bg-secondary/10 border border-secondary/30 rounded-2xl p-6">
                      <p className="text-2xl md:text-3xl text-foreground leading-relaxed text-center">
                        {submittedReply}
                      </p>
                    </div>
                    <div className="flex justify-center gap-3 pt-2">
                      <Button variant="outline" onClick={() => { setSubmittedReply(""); setReply(""); }}>
                        Clear reply
                      </Button>
                      <Button onClick={handleClose}>Done</Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground text-center">
                      Hand the device over — they can type their reply here
                    </p>
                    <div className="flex gap-2">
                      <Input
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSubmitReply()}
                        placeholder="Type your reply..."
                        className="h-14 text-lg"
                        autoFocus
                      />
                      <Button
                        onClick={handleSubmitReply}
                        disabled={!reply.trim()}
                        className="h-14 px-6 bg-primary text-primary-foreground hover:bg-primary/90"
                      >
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
    </section>
  );
}
