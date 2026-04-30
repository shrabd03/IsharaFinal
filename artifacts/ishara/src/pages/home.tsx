import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { AccessibilityBar } from "@/components/layout/AccessibilityBar";
import { AnimatedSign, signsList } from "@/components/signs/HandSigns";
import { useAuth } from "@/hooks/use-auth";
import { useConversations } from "@/hooks/use-conversations";
import { usePreferences } from "@/hooks/use-preferences";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, MessageSquare, Hand, Settings2, Clock, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

function Hero() {
  const scrollToSigns = () => {
    document.getElementById("dictionary")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="relative w-full h-[60vh] min-h-[400px] overflow-hidden bg-primary text-primary-foreground flex items-center">
      {/* Abstract Petra/Jordan Landscape SVG Background */}
      <div className="absolute inset-0 z-0">
        <svg viewBox="0 0 1440 800" preserveAspectRatio="xMidYMax slice" className="w-full h-full opacity-60">
           <defs>
              <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="hsl(var(--secondary) / 0.8)" />
              </linearGradient>
           </defs>
           <rect width="1440" height="800" fill="url(#skyGrad)" />
           {/* Stars */}
           <circle cx="200" cy="150" r="1" fill="#fff" opacity="0.6"/>
           <circle cx="450" cy="100" r="2" fill="#fff" opacity="0.4"/>
           <circle cx="700" cy="200" r="1.5" fill="#fff" opacity="0.8"/>
           <circle cx="1100" cy="120" r="1" fill="#fff" opacity="0.5"/>
           <circle cx="1300" cy="180" r="2" fill="#fff" opacity="0.7"/>
           
           {/* Mountains/Cliffs (Petra inspired) */}
           <path d="M0,800 L0,500 L150,450 L250,550 L450,400 L600,600 L800,450 L1000,650 L1200,350 L1440,500 L1440,800 Z" fill="hsl(var(--primary) / 0.8)" />
           <path d="M800,800 L850,550 L1000,450 L1150,600 L1300,400 L1440,550 L1440,800 Z" fill="hsl(var(--primary))" />
        </svg>
      </div>

      <div className="container mx-auto px-4 relative z-10 grid md:grid-cols-2 gap-8 items-center h-full">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4 leading-tight">
            Welcome to Ishara
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/90 mb-8 max-w-lg">
            A calm, dignified space for deaf and mute users in Jordan to communicate, learn, and save conversations using Jordanian Arabic Sign Language.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 h-12 px-8 text-lg" onClick={() => document.getElementById('conversations')?.scrollIntoView({ behavior: 'smooth' })}>
              Get started
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary hover:bg-primary-foreground/10 hover:text-primary-foreground h-12 px-8 text-lg" onClick={scrollToSigns}>
              Watch the signs
            </Button>
          </div>
        </motion.div>

        <motion.div 
          className="hidden md:flex justify-center items-center relative h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
           <div className="relative w-64 h-64">
             <div className="absolute top-0 right-10 bg-white/10 backdrop-blur-md p-4 rounded-2xl shadow-xl transform rotate-12 animate-pulse" style={{ animationDuration: '4s' }}>
                <AnimatedSign signId="hello" />
             </div>
             <div className="absolute bottom-0 right-0 bg-white/10 backdrop-blur-md p-4 rounded-2xl shadow-xl transform -rotate-6 animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }}>
                <AnimatedSign signId="thank_you" />
             </div>
             <div className="absolute top-20 left-0 bg-white/10 backdrop-blur-md p-4 rounded-2xl shadow-xl transform -rotate-12 animate-pulse" style={{ animationDuration: '4.5s', animationDelay: '2s' }}>
                <AnimatedSign signId="help" />
             </div>
           </div>
        </motion.div>
      </div>
    </div>
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
            Learn common gestures in Jordanian Arabic Sign Language (LIU). Our animated guides help you understand the precise movements.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {signsList.map((sign, index) => {
            const isHighlighted = activeSign === index;
            return (
              <Card 
                key={sign.id} 
                className={`overflow-hidden transition-all duration-500 cursor-pointer ${isHighlighted ? 'ring-2 ring-primary scale-105 shadow-lg bg-primary/5' : 'hover:border-primary/30 hover:bg-muted/30'}`}
                onClick={() => setActiveSign(index)}
              >
                <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                  <div className={`transition-colors duration-500 ${isHighlighted ? 'text-primary' : 'text-muted-foreground'}`}>
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

function FeaturesGrid() {
  const features = [
    { icon: User, title: "Profile", desc: "Manage your personal details and app preferences." },
    { icon: MessageSquare, title: "Saved Conversations", desc: "Keep track of important discussions and common phrases." },
    { icon: Hand, title: "Custom Signs", desc: "Build a personalized vocabulary of signs you use most." },
    { icon: Settings2, title: "Accessibility", desc: "Adjust contrast, text size, and colors for comfort." },
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Card className="h-full bg-card hover:shadow-md transition-shadow border-border/50">
                <CardContent className="p-6 flex flex-col gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <f.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ConversationsSection() {
  const { conversations, createConversation } = useConversations();
  const [, setLocation] = useLocation();
  const [newTitle, setNewTitle] = useState("");
  const [open, setOpen] = useState(false);

  const handleCreate = () => {
    if (newTitle.trim()) {
      const conv = createConversation(newTitle);
      setOpen(false);
      setNewTitle("");
      setLocation(`/conversation/${conv.id}`);
    }
  };

  return (
    <section id="conversations" className="py-20 bg-background">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-serif text-foreground mb-2">Saved Conversations</h2>
            <p className="text-muted-foreground">Your history of interactions and stored phrases.</p>
          </div>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                New conversation
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>New Conversation</DialogTitle>
                <DialogDescription>
                  Start a new thread to save signs and phrases.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g., Doctor appointment"
                    onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreate} disabled={!newTitle.trim()}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {conversations.length === 0 ? (
          <Card className="border-dashed bg-muted/20">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-medium text-foreground">No conversations yet</h3>
              <p className="text-muted-foreground max-w-sm">Start a new conversation to begin saving signs and building your history.</p>
              <Button variant="outline" onClick={() => setOpen(true)} className="mt-4">Start your first conversation</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {conversations.map((conv) => (
              <Card 
                key={conv.id} 
                className="group cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
                onClick={() => setLocation(`/conversation/${conv.id}`)}
              >
                <CardContent className="p-6 flex flex-col h-full justify-between gap-6">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg line-clamp-2">{conv.title}</h3>
                      <Badge variant="secondary" className="bg-secondary/20 text-secondary-foreground shrink-0 ml-2">Saved</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                      <Clock className="w-3 h-3" />
                      {new Date(conv.dateISO).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                  <div className="flex justify-between items-center border-t border-border pt-4">
                    <span className="text-sm text-muted-foreground">{conv.signCount} signs</span>
                    <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors text-primary">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default function Home() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pb-20">
        <Hero />
        <AccessibilityBar />
        <DictionarySection />
        <FeaturesGrid />
        <ConversationsSection />
      </main>
    </div>
  );
}
