import { useLocation } from "wouter";
import { Link } from "wouter";
import { LogOut, Book, MessageSquare, Home, Settings, Phone, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";

export function Navbar() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

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
          <button onClick={() => setLocation("/phrasebook")} className="text-primary-foreground/80 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium">
            <MessageSquare className="w-4 h-4" /> Phrasebook
          </button>
          <button onClick={() => scrollToId("dictionary")} className="text-primary-foreground/80 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium">
            <Book className="w-4 h-4" /> Dictionary
          </button>
          <button onClick={() => setLocation("/history")} className="text-primary-foreground/80 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium">
            <History className="w-4 h-4" /> History
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setLocation("/contact")} className="text-primary-foreground/80 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-white/10" aria-label="Contact us">
            <Phone className="w-4 h-4" />
            <span className="hidden sm:inline">Contact</span>
          </button>
          <button onClick={() => setLocation("/settings")} className="text-primary-foreground/80 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-white/10" aria-label="Settings">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Settings</span>
          </button>
          <div className="flex items-center gap-2 ml-1 pl-2 border-l border-white/20">
            <div className="hidden sm:block text-sm text-right">
              <div className="font-medium text-primary-foreground leading-none mb-1">{user.name}</div>
              <div className="text-primary-foreground/70 text-xs">{user.email}</div>
            </div>
            <Avatar className="h-9 w-9 border-2 border-primary-foreground/20 cursor-pointer" onClick={() => setLocation("/settings")}>
              <AvatarFallback className="bg-primary-foreground/10 text-primary-foreground">{initials}</AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-primary-foreground/80 hover:text-white hover:bg-white/10" aria-label="Sign out">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
