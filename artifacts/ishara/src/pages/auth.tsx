import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Hand } from "lucide-react";

function WavingHand({ className }: { className?: string }) {
  return (
    <motion.div
      className="inline-flex"
      style={{ transformOrigin: "70% 80%" }}
      animate={{ rotate: [0, -18, 14, -12, 10, 0] }}
      transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 1.2, ease: "easeInOut" }}
      aria-label="Waving hello (marhaba)"
    >
      <Hand className={className} />
    </motion.div>
  );
}


export default function Auth() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email) {
      login(name, email);
      setLocation("/home");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-20">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary blur-[100px]" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
             <WavingHand className="w-9 h-9" />
          </div>
          <h1 className="text-3xl font-serif text-foreground mb-2">Welcome to Ishara</h1>
          <p className="text-muted-foreground">A calm, dignified space for Jordanian Sign Language.</p>
        </div>

        <Card className="w-full shadow-xl border-primary/10">
          <Tabs defaultValue="signin" className="w-full">
            <CardHeader className="pb-0 border-b border-border/50">
              <TabsList className="grid w-full grid-cols-2 bg-transparent h-12">
                <TabsTrigger value="signin" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full text-base">Sign In</TabsTrigger>
                <TabsTrigger value="create" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full text-base">Create Account</TabsTrigger>
              </TabsList>
            </CardHeader>

            <TabsContent value="signin" className="mt-0">
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4 pt-6">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input id="signin-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" required className="bg-background" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-name">Display Name</Label>
                    <Input id="signin-name" value={name} onChange={e => setName(e.target.value)} placeholder="How should we call you?" required className="bg-background" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-lg">Sign In</Button>
                </CardFooter>
              </form>
            </TabsContent>

            <TabsContent value="create" className="mt-0">
               <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4 pt-6">
                  <div className="space-y-2">
                    <Label htmlFor="create-name">Full Name</Label>
                    <Input id="create-name" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required className="bg-background" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create-email">Email</Label>
                    <Input id="create-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" required className="bg-background" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground h-12 text-lg">Create Account</Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </motion.div>
    </div>
  );
}
