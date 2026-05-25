import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { AnimatedSign, signsList } from "@/components/signs/HandSigns";
import { useAuth } from "@/hooks/use-auth";
import { usePreferences } from "@/hooks/use-preferences";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Hand, Eye, Target, Camera, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

function Hero() {
  return (
    <div className="relative w-full h-[60vh] min-h-[400px] overflow-hidden flex items-center" style={{ background: "linear-gradient(135deg, #1F768E 0%, #4d8ea8 35%, #7d7db8 65%, #9071CE 100%)" }}>
      {/* Subtle depth overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 30% 50%, rgba(31,118,142,0.35) 0%, transparent 60%), radial-gradient(ellipse at 75% 40%, rgba(144,113,206,0.35) 0%, transparent 60%)" }} />
      {/* Decorative mountain shapes */}
      <div className="absolute inset-0 z-0">
        <svg viewBox="0 0 1440 800" preserveAspectRatio="xMidYMax slice" className="w-full h-full">
          <path d="M0,800 L0,500 L150,450 L250,550 L450,400 L600,600 L800,450 L1000,650 L1200,350 L1440,500 L1440,800 Z" fill="rgba(255,255,255,0.08)" />
          <path d="M800,800 L850,550 L1000,450 L1150,600 L1300,400 L1440,550 L1440,800 Z" fill="rgba(255,255,255,0.06)" />
        </svg>
      </div>

      <div className="container mx-auto px-4 relative z-10 grid md:grid-cols-2 gap-8 items-center h-full">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4 leading-tight text-white">Welcome to Ishara</h1>
          <p className="text-lg md:text-xl mb-8 max-w-lg" style={{ color: "rgba(255,255,255,0.85)" }}>
            A calm, dignified space for deaf and mute users in Jordan to communicate, learn, and save conversations using Jordanian Arabic Sign Language.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button size="lg" className="text-white h-12 px-8 text-lg shadow-md border border-white/30 hover:opacity-90" style={{ backgroundColor: "#1F768E" }} onClick={() => document.getElementById("dictionary")?.scrollIntoView({ behavior: "smooth" })}>
              Get started
            </Button>
            <Button size="lg" variant="outline" className="border-white/50 text-white hover:bg-white/10 hover:text-white h-12 px-8 text-lg" onClick={() => document.getElementById("dictionary")?.scrollIntoView({ behavior: "smooth" })}>
              Watch the signs
            </Button>
          </div>
        </motion.div>

        <motion.div className="hidden md:flex justify-center items-center relative h-full" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.3 }}>
          <div className="relative w-[360px] h-[420px] flex items-center justify-center">
            <div className="absolute -inset-10 rounded-full blur-3xl" style={{ backgroundColor: "rgba(144,113,206,0.3)" }} />
            <div className="absolute inset-6 rounded-[36px] backdrop-blur-md shadow-2xl" style={{ backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }} />
            <motion.div className="relative text-white flex items-center justify-center" animate={{ y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
              <motion.div style={{ transformOrigin: "70% 85%" }} animate={{ rotate: [0, -22, 18, -16, 12, 0] }} transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 1.2, ease: "easeInOut" }}>
                <Hand className="w-56 h-56 drop-shadow-[0_8px_30px_rgba(0,0,0,0.3)]" strokeWidth={1.5} />
              </motion.div>
            </motion.div>
            <motion.div className="absolute top-2 -left-6 backdrop-blur-md p-3 rounded-2xl shadow-xl" style={{ backgroundColor: "rgba(255,255,255,0.15)", border: "1px solid rgba(31,118,142,0.4)" }} animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
              <AnimatedSign signId="hello" />
            </motion.div>
            <motion.div className="absolute bottom-4 -right-4 backdrop-blur-md p-3 rounded-2xl shadow-xl" style={{ backgroundColor: "rgba(255,255,255,0.15)", border: "1px solid rgba(144,113,206,0.4)" }} animate={{ y: [0, 8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}>
              <AnimatedSign signId="thank_you" />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function TranslationCTA() {
  const [, setLocation] = useLocation();
  return (
    <section className="py-14 bg-gradient-to-b from-primary/5 to-background">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <Badge className="mb-3 bg-primary/10 text-primary border-0">AI Translation</Badge>
          <h2 className="text-2xl md:text-3xl font-serif text-foreground mb-2">Two-way communication</h2>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto">
            Translate Jordanian Sign Language to text via camera, or convert your words into visual signs.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            onClick={() => setLocation("/sign-to-text")}
            className="group relative rounded-2xl border-2 p-8 flex flex-col items-center gap-4 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer"
            style={{ backgroundColor: "rgba(31,118,142,0.38)", borderColor: "#135F73" }}
          >
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-sm" style={{ backgroundColor: "rgba(31,118,142,0.2)" }}>
              <Camera className="w-10 h-10" style={{ color: "#135F73" }} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-widest mb-2" style={{ color: "#1F768E" }}>Camera</p>
              <h3 className="text-2xl font-bold mb-2" style={{ color: "#0e4a59" }}>Sign → Text</h3>
              <p className="text-base leading-relaxed text-gray-700">
                Open the camera, perform JSL signs, and watch them convert to Arabic text in real time.
              </p>
            </div>
            <Badge className="border-0 text-sm font-semibold px-3 py-1" style={{ backgroundColor: "rgba(31,118,142,0.2)", color: "#0e4a59" }}>Live camera · AI powered</Badge>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.12 }}
            onClick={() => setLocation("/text-to-sign")}
            className="group relative rounded-2xl border-2 p-8 flex flex-col items-center gap-4 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer"
            style={{ backgroundColor: "rgba(144,113,206,0.38)", borderColor: "#5c3d9e" }}
          >
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-sm" style={{ backgroundColor: "rgba(144,113,206,0.2)" }}>
              <MessageSquare className="w-10 h-10" style={{ color: "#6a4aad" }} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-widest mb-2" style={{ color: "#9071CE" }}>Text & Voice</p>
              <h3 className="text-2xl font-bold mb-2" style={{ color: "#4a2e8a" }}>Text → Sign</h3>
              <p className="text-base leading-relaxed text-gray-700">
                Type a message or speak in Arabic — each word becomes a JSL sign animation you can show others.
              </p>
            </div>
            <Badge className="border-0 text-sm font-semibold px-3 py-1" style={{ backgroundColor: "rgba(144,113,206,0.2)", color: "#4a2e8a" }}>Type or voice · Sign animations</Badge>
          </motion.button>
        </div>
      </div>
    </section>
  );
}

function DictionarySection() {
  const [activeSign, setActiveSign] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSign((prev) => (prev + 1) % signsList.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="dictionary" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-serif text-foreground mb-4">Sign Language Dictionary</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Learn common gestures in Jordanian Arabic Sign Language (JSL). Our animated guides help you understand the precise movements.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {signsList.map((sign, index) => {
            const isHighlighted = activeSign === index;
            return (
              <Card
                key={sign.id}
                className={`overflow-hidden transition-all duration-500 cursor-pointer ${isHighlighted ? "ring-2 ring-primary scale-105 shadow-lg bg-primary/5" : "hover:border-primary/30 hover:bg-muted/30"}`}
                onClick={() => setActiveSign(index)}
              >
                <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                  <div className={`transition-colors duration-500 ${isHighlighted ? "text-primary" : "text-muted-foreground"}`}>
                    <AnimatedSign signId={sign.id} isHighlighted={isHighlighted} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-foreground">{sign.english}</h3>
                    <p className="text-sm text-secondary font-medium">({sign.arabic})</p>
                  </div>
                  <p className="text-xs text-muted-foreground opacity-80">{sign.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function VisionMissionSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-primary/10 text-primary border-0">Who We Are</Badge>
          <h2 className="text-3xl font-serif text-foreground mb-3">Our Vision & Mission</h2>
          <p className="text-muted-foreground">The purpose behind Ishara and what drives us forward.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="h-full shadow-sm hover:shadow-md transition-shadow" style={{ backgroundColor: "rgba(31,118,142,0.38)", borderColor: "#135F73" }}>
              <CardContent className="p-8 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(31,118,142,0.2)" }}>
                    <Eye className="w-6 h-6" style={{ color: "#135F73" }} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest font-medium" style={{ color: "#1F768E" }}>Vision</p>
                    <h3 className="text-xl font-serif font-semibold" style={{ color: "#0e4a59" }}>Why we exist</h3>
                  </div>
                </div>
                <p className="leading-relaxed text-gray-700">
                  To create a world where communication has no barriers — where deaf and hearing people can understand each other naturally, instantly, and without limitations of language or ability.
                </p>
                <p className="leading-relaxed text-sm text-gray-500">
                  Ishara envisions a future where technology turns every human interaction into a shared experience, not a divided one.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <Card className="h-full shadow-sm hover:shadow-md transition-shadow" style={{ backgroundColor: "rgba(144,113,206,0.38)", borderColor: "#5c3d9e" }}>
              <CardContent className="p-8 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(144,113,206,0.2)" }}>
                    <Target className="w-6 h-6" style={{ color: "#6a4aad" }} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest font-medium" style={{ color: "#9071CE" }}>Mission</p>
                    <h3 className="text-xl font-serif font-semibold" style={{ color: "#4a2e8a" }}>What we do</h3>
                  </div>
                </div>
                <p className="leading-relaxed text-gray-700">
                  Ishara bridges communication between deaf and hearing individuals using real-time AI translation. We transform sign language captured by camera into clear words for hearing users, and spoken or typed language into visual sign-based expressions for deaf users.
                </p>
                <p className="leading-relaxed text-sm text-gray-500">
                  Our mission is to make everyday communication inclusive, simple, and immediate — so no one is left out of the conversation.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  usePreferences();

  useEffect(() => {
    if (!user) setLocation("/");
  }, [user, setLocation]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pb-20">
        <Hero />
        <TranslationCTA />
        <DictionarySection />
        <VisionMissionSection />
      </main>
    </div>
  );
}
