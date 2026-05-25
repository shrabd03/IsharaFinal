import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, User, Bell, HelpCircle, ChevronRight, Save, LogOut, Sun, Moon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { usePreferences } from "@/hooks/use-preferences";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function monthName(m?: string) {
  if (!m) return "";
  const idx = parseInt(m, 10) - 1;
  return MONTHS[idx] ?? m;
}

export default function Settings() {
  const { user, updateProfile, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { preferences, updatePreferences } = usePreferences();

  const [notifPhrases, setNotifPhrases] = useState(() => localStorage.getItem("ishara_notif_phrases") !== "false");
  const [notifUpdates, setNotifUpdates] = useState(() => localStorage.getItem("ishara_notif_updates") !== "false");

  const [editName, setEditName] = useState(user?.name ?? "");
  const [nameChanged, setNameChanged] = useState(false);

  const handleSaveName = async () => {
    if (!editName.trim()) return;
    await updateProfile({ name: editName.trim() });
    setNameChanged(false);
    toast({ title: "Profile updated", description: "Your display name has been saved." });
  };

  const toggleNotif = (key: string, val: boolean, setter: (b: boolean) => void) => {
    setter(val);
    localStorage.setItem(key, String(val));
  };

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  if (!user) { setLocation("/"); return null; }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 shadow-md text-white" style={{ backgroundColor: "#1F768E" }}>
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <button onClick={() => setLocation("/home")} className="flex items-center gap-2 text-primary-foreground/80 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-semibold">Settings</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 max-w-2xl py-8 space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="w-5 h-5 text-primary" /> Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>Display Name</Label>
              <div className="flex gap-2">
                <Input
                  value={editName}
                  onChange={e => { setEditName(e.target.value); setNameChanged(true); }}
                  className="bg-background"
                />
                {nameChanged && (
                  <Button onClick={handleSaveName} size="sm" className="shrink-0 gap-1">
                    <Save className="w-4 h-4" /> Save
                  </Button>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground text-xs uppercase tracking-wide">Email</Label>
              <p className="text-foreground font-medium">{user.email}</p>
            </div>
            {user.dob && (
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs uppercase tracking-wide">Date of Birth</Label>
                <p className="text-foreground font-medium">
                  {user.dob.day} {monthName(user.dob.month)} {user.dob.year}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sun className="w-5 h-5 text-primary" /> Appearance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Theme</p>
                <p className="text-sm text-muted-foreground">Choose how Ishara looks</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => updatePreferences({ displayMode: "normal" })}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                    preferences.displayMode === "normal"
                      ? "bg-yellow-100 border-yellow-300 text-yellow-900 shadow-sm"
                      : "bg-background border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Sun className="w-4 h-4" /> Light
                </button>
                <button
                  onClick={() => updatePreferences({ displayMode: "dark" })}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                    preferences.displayMode === "dark"
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-background border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Moon className="w-4 h-4" /> Dark
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bell className="w-5 h-5 text-primary" /> Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-foreground">Phrasebook updates</p>
                <p className="text-sm text-muted-foreground">New phrases added to categories</p>
              </div>
              <button
                onClick={() => toggleNotif("ishara_notif_phrases", !notifPhrases, setNotifPhrases)}
                className={`relative w-11 h-6 rounded-full transition-colors ${notifPhrases ? "bg-primary" : "bg-muted"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${notifPhrases ? "translate-x-5" : "translate-x-0"}`} />
              </button>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-foreground">App updates</p>
                <p className="text-sm text-muted-foreground">New features and improvements</p>
              </div>
              <button
                onClick={() => toggleNotif("ishara_notif_updates", !notifUpdates, setNotifUpdates)}
                className={`relative w-11 h-6 rounded-full transition-colors ${notifUpdates ? "bg-primary" : "bg-muted"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${notifUpdates ? "translate-x-5" : "translate-x-0"}`} />
              </button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <HelpCircle className="w-5 h-5 text-primary" /> Help
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { n: 1, title: "Use the Phrasebook", desc: "Pick a category and tap a phrase to show it in large text to a hearing person. They can type a reply back to you." },
              { n: 2, title: "Live Translation", desc: "Use your camera to translate your signs into Arabic text in real time, or speak to generate animated JSL signs." },
              { n: 3, title: "Sign Dictionary", desc: "Scroll to the dictionary section to learn common Jordanian Sign Language (JSL) gestures with animated guides." },
            ].map(({ n, title, desc }) => (
              <div key={n} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-medium">{n}</div>
                <div>
                  <h4 className="font-medium text-foreground">{title}</h4>
                  <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-between text-destructive hover:bg-destructive/5 rounded-lg px-3 py-2.5 transition-colors"
            >
              <div className="flex items-center gap-2">
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sign out</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
