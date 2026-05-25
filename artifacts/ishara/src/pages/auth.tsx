import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Ear, Eye, EyeOff, Chrome } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

function WavingHand({ className }: { className?: string }) {
  return (
    <motion.div
      className="inline-flex"
      style={{ transformOrigin: "70% 80%" }}
      animate={{ rotate: [0, -18, 14, -12, 10, 0] }}
      transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 1.2, ease: "easeInOut" }}
    >
      <Hand className={className} />
    </motion.div>
  );
}

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

export default function Auth() {
  const { login, register } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [tab, setTab] = useState<"signin" | "create">("signin");
  const [showForgot, setShowForgot] = useState(false);

  const [siEmail, setSiEmail] = useState("");
  const [siPassword, setSiPassword] = useState("");
  const [siShowPw, setSiShowPw] = useState(false);
  const [siError, setSiError] = useState("");
  const [siLoading, setSiLoading] = useState(false);

  const [fpEmail, setFpEmail] = useState("");

  const [suFirstName, setSuFirstName] = useState("");
  const [suLastName, setSuLastName] = useState("");
  const [suEmail, setSuEmail] = useState("");
  const [suDay, setSuDay] = useState("");
  const [suMonth, setSuMonth] = useState("");
  const [suYear, setSuYear] = useState("");
  const [suPassword, setSuPassword] = useState("");
  const [suConfirm, setSuConfirm] = useState("");
  const [suShowPw, setSuShowPw] = useState(false);
  const [suShowCp, setSuShowCp] = useState(false);
  const [suError, setSuError] = useState("");
  const [suLoading, setSuLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSiError("");
    setSiLoading(true);
    const err = await login(siEmail, siPassword);
    setSiLoading(false);
    if (err) { setSiError(err); return; }
    setLocation("/home");
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Password reset sent", description: `A reset link has been sent to ${fpEmail}` });
    setShowForgot(false);
    setFpEmail("");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuError("");
    if (!suFirstName.trim() || !suLastName.trim()) { setSuError("Please enter both first and last name."); return; }
    if (suPassword !== suConfirm) { setSuError("Passwords do not match."); return; }
    if (suPassword.length < 6) { setSuError("Password must be at least 6 characters."); return; }
    if (!suDay || !suMonth || !suYear) { setSuError("Please complete your date of birth."); return; }
    setSuLoading(true);
    const err = await register(`${suFirstName.trim()} ${suLastName.trim()}`, suEmail, suPassword, { day: suDay, month: suMonth, year: suYear });
    setSuLoading(false);
    if (err) { setSuError(err); return; }
    setLocation("/home");
  };

  const handleGoogle = () => {
    toast({ title: "Google sign-in coming soon", description: "This feature will be available in the next update." });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Two-color background: left half light green, right half light purple */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(135deg, #1F768E 0%, #4d8ea8 35%, #7d7db8 65%, #9071CE 100%)" }} />
      {/* Subtle radial depth */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 25% 50%, rgba(31,118,142,0.3) 0%, transparent 55%), radial-gradient(ellipse at 80% 40%, rgba(144,113,206,0.3) 0%, transparent 55%)" }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
            <Ear className="w-9 h-9" />
          </div>
          <h1 className="text-3xl font-serif text-foreground mb-2">Welcome to Ishara</h1>
          <p className="text-muted-foreground">A calm, dignified space for Jordanian Sign Language.</p>
        </div>

        <AnimatePresence mode="wait">
          {showForgot ? (
            <motion.div key="forgot" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <Card className="w-full shadow-xl border-primary/10">
                <CardContent className="space-y-4 pt-6">
                  <div className="text-center mb-2">
                    <h2 className="text-xl font-semibold text-foreground">Forgot password?</h2>
                    <p className="text-sm text-muted-foreground mt-1">Enter your email and we'll send you a reset link.</p>
                  </div>
                  <form onSubmit={handleForgot} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fp-email">Email address</Label>
                      <Input id="fp-email" type="email" value={fpEmail} onChange={e => setFpEmail(e.target.value)} placeholder="name@example.com" required className="bg-background" />
                    </div>
                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11">Send reset link</Button>
                  </form>
                </CardContent>
                <CardFooter className="justify-center pb-5">
                  <button onClick={() => setShowForgot(false)} className="text-sm text-primary hover:underline">Back to sign in</button>
                </CardFooter>
              </Card>
            </motion.div>
          ) : (
            <motion.div key="tabs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <Card className="w-full shadow-xl border-primary/10">
                <Tabs value={tab} onValueChange={v => { setTab(v as "signin" | "create"); setSiError(""); setSuError(""); }} className="w-full">
                  <div className="px-6 pt-5 pb-0 border-b border-border/50">
                    <TabsList className="grid w-full grid-cols-2 bg-transparent h-11">
                      <TabsTrigger value="signin" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full text-base">Sign In</TabsTrigger>
                      <TabsTrigger value="create" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full text-base">Create Account</TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="signin" className="mt-0">
                    <form onSubmit={handleSignIn}>
                      <CardContent className="space-y-4 pt-5">
                        <div className="space-y-2">
                          <Label htmlFor="si-email">Email</Label>
                          <Input id="si-email" type="email" value={siEmail} onChange={e => setSiEmail(e.target.value)} placeholder="name@example.com" required className="bg-background" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="si-password">Password</Label>
                          <div className="relative">
                            <Input id="si-password" type={siShowPw ? "text" : "password"} value={siPassword} onChange={e => setSiPassword(e.target.value)} placeholder="••••••••" required className="bg-background pr-10" />
                            <button type="button" onClick={() => setSiShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                              {siShowPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <button type="button" onClick={() => setShowForgot(true)} className="text-sm text-primary hover:underline">Forgot password?</button>
                        </div>
                        {siError && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{siError}</p>}
                        <Button type="submit" disabled={siLoading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 text-base">{siLoading ? "Signing in…" : "Sign In"}</Button>
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                          <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-3 text-muted-foreground">or</span></div>
                        </div>
                        <Button type="button" variant="outline" className="w-full h-11 gap-2" onClick={handleGoogle}>
                          <Chrome className="w-4 h-4" /> Continue with Google
                        </Button>
                      </CardContent>
                    </form>
                  </TabsContent>

                  <TabsContent value="create" className="mt-0">
                    <form onSubmit={handleRegister}>
                      <CardContent className="space-y-4 pt-5">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label htmlFor="su-first">First Name</Label>
                            <Input id="su-first" value={suFirstName} onChange={e => setSuFirstName(e.target.value)} placeholder="First name" required className="bg-background" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="su-last">Last Name</Label>
                            <Input id="su-last" value={suLastName} onChange={e => setSuLastName(e.target.value)} placeholder="Last name" required className="bg-background" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="su-email">Email</Label>
                          <Input id="su-email" type="email" value={suEmail} onChange={e => setSuEmail(e.target.value)} placeholder="name@example.com" required className="bg-background" />
                        </div>
                        <div className="space-y-2">
                          <Label>Date of Birth</Label>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <Input value={suDay} onChange={e => setSuDay(e.target.value)} placeholder="Day" type="number" min="1" max="31" className="bg-background" />
                            </div>
                            <select value={suMonth} onChange={e => setSuMonth(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                              <option value="">Month</option>
                              {MONTHS.map((m, i) => <option key={m} value={String(i + 1)}>{m}</option>)}
                            </select>
                            <div>
                              <Input value={suYear} onChange={e => setSuYear(e.target.value)} placeholder="Year" type="number" min="1900" max={new Date().getFullYear()} className="bg-background" />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="su-password">Password</Label>
                          <div className="relative">
                            <Input id="su-password" type={suShowPw ? "text" : "password"} value={suPassword} onChange={e => setSuPassword(e.target.value)} placeholder="Min. 6 characters" required className="bg-background pr-10" />
                            <button type="button" onClick={() => setSuShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                              {suShowPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="su-confirm">Confirm Password</Label>
                          <div className="relative">
                            <Input id="su-confirm" type={suShowCp ? "text" : "password"} value={suConfirm} onChange={e => setSuConfirm(e.target.value)} placeholder="Re-enter password" required className="bg-background pr-10" />
                            <button type="button" onClick={() => setSuShowCp(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                              {suShowCp ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        {suError && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{suError}</p>}
                        <Button type="submit" disabled={suLoading} className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground h-11 text-base">{suLoading ? "Creating account…" : "Create Account"}</Button>
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                          <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-3 text-muted-foreground">or</span></div>
                        </div>
                        <Button type="button" variant="outline" className="w-full h-11 gap-2" onClick={handleGoogle}>
                          <Chrome className="w-4 h-4" /> Continue with Google
                        </Button>
                      </CardContent>
                    </form>
                  </TabsContent>
                </Tabs>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
