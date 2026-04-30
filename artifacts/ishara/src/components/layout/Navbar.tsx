import { useState } from "react";
import { Link, useLocation } from "wouter";
import { LogOut, HelpCircle, Book, MessageSquare, Home, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function Navbar() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [helpOpen, setHelpOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  const scrollToId = (id: string) => {
    const trigger = () => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    if (!window.location.pathname.endsWith("/home")) {
      setLocation("/home");
      setTimeout(trigger, 120);
    } else {
      trigger();
    }
  };

  if (!user) return null;

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <nav className="bg-primary text-primary-foreground sticky top-0 z-50 shadow-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/home" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-teal-400/20 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-teal-300" />
            </div>
            <span className="font-semibold text-xl tracking-tight">Ishara</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/home" className="text-primary-foreground/80 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium">
              <Home className="w-4 h-4" /> Home
            </Link>
            <button onClick={() => scrollToId("translate")} className="text-primary-foreground/80 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium">
              <Sparkles className="w-4 h-4" /> Translate
            </button>
            <button onClick={() => scrollToId("conversations")} className="text-primary-foreground/80 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium">
              <MessageSquare className="w-4 h-4" /> Conversations
            </button>
            <button onClick={() => scrollToId("dictionary")} className="text-primary-foreground/80 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium">
              <Book className="w-4 h-4" /> Dictionary
            </button>
            <button onClick={() => setHelpOpen(true)} className="text-primary-foreground/80 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium">
              <HelpCircle className="w-4 h-4" /> Help
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-sm text-right">
                <div className="font-medium text-primary-foreground leading-none mb-1">{user.name}</div>
                <div className="text-primary-foreground/70 text-xs">{user.email}</div>
              </div>
              <Avatar className="h-9 w-9 border-2 border-primary-foreground/20">
                <AvatarFallback className="bg-primary-foreground/10 text-primary-foreground">{initials}</AvatarFallback>
              </Avatar>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-primary-foreground/80 hover:text-white hover:bg-white/10" aria-label="Sign out">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>How to use Ishara</DialogTitle>
            <DialogDescription>
              A quick guide to navigating your communication space.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">1</div>
              <div>
                <h4 className="font-medium text-foreground">Explore the Dictionary</h4>
                <p className="text-sm text-muted-foreground">Scroll to the animated signs section to learn common LIU (Jordanian Arabic Sign Language) gestures.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">2</div>
              <div>
                <h4 className="font-medium text-foreground">Save Conversations</h4>
                <p className="text-sm text-muted-foreground">Create new conversation threads to quickly access frequently used signs.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">3</div>
              <div>
                <h4 className="font-medium text-foreground">Customize your View</h4>
                <p className="text-sm text-muted-foreground">Use the Accessibility Bar to change text size, contrast mode, and colors.</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
