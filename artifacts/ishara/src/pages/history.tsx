import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Trash2, Camera, Type, Clock, Search, CalendarDays } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useHistory, HistoryEntry } from "@/hooks/use-history";

function formatDate(ts: number) {
  const d = new Date(ts);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function groupByDate(entries: HistoryEntry[]): [string, HistoryEntry[]][] {
  const map = new Map<string, HistoryEntry[]>();
  for (const e of entries) {
    const label = formatDate(e.timestamp);
    if (!map.has(label)) map.set(label, []);
    map.get(label)!.push(e);
  }
  return Array.from(map.entries());
}

export default function History() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { getEntries, deleteEntry, clearAll } = useHistory();

  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [search, setSearch] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    if (!user) { setLocation("/"); return; }
    setEntries(getEntries());
  }, [user]);

  if (!user) return null;

  const filtered = search.trim()
    ? entries.filter(e => e.text.toLowerCase().includes(search.toLowerCase()))
    : entries;

  const grouped = groupByDate(filtered);

  const handleDelete = (id: string) => {
    deleteEntry(id);
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const handleClearAll = () => {
    clearAll();
    setEntries([]);
    setConfirmClear(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 shadow-md text-white" style={{ backgroundColor: "#1F768E" }}>
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <button
            onClick={() => setLocation("/home")}
            className="flex items-center gap-2 text-primary-foreground/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-semibold flex-1">Conversation History</h1>
          {entries.length > 0 && (
            confirmClear ? (
              <div className="flex items-center gap-2">
                <span className="text-primary-foreground/70 text-sm">Clear all?</span>
                <button onClick={handleClearAll} className="text-sm font-medium text-red-300 hover:text-red-200 transition-colors">Yes</button>
                <button onClick={() => setConfirmClear(false)} className="text-sm font-medium text-primary-foreground/70 hover:text-white transition-colors">No</button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClear(true)}
                className="text-primary-foreground/60 hover:text-white transition-colors text-sm"
              >
                Clear all
              </button>
            )
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 max-w-2xl py-6 space-y-5 flex-1">
        {entries.length > 0 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search conversations…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
              <Clock className="w-10 h-10 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-foreground text-lg">
                {entries.length === 0 ? "No history yet" : "No matches found"}
              </p>
              <p className="text-muted-foreground text-sm max-w-xs">
                {entries.length === 0
                  ? "Your Sign → Text and Text → Sign conversations will be saved here automatically."
                  : "Try a different search term."}
              </p>
            </div>
            {entries.length === 0 && (
              <div className="flex gap-3 mt-2">
                <Button variant="outline" onClick={() => setLocation("/sign-to-text")} className="gap-2">
                  <Camera className="w-4 h-4" /> Sign → Text
                </Button>
                <Button variant="outline" onClick={() => setLocation("/text-to-sign")} className="gap-2">
                  <Type className="w-4 h-4" /> Text → Sign
                </Button>
              </div>
            )}
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {grouped.map(([label, group]) => (
              <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-widest">
                  <CalendarDays className="w-3.5 h-3.5" />
                  {label}
                </div>
                {group.map(entry => (
                  <AnimatePresence key={entry.id}>
                    <motion.div
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className={`border ${entry.type === "sign-to-text" ? "border-primary/30 bg-gradient-to-br from-primary/5 to-background" : "border-secondary/50 bg-gradient-to-br from-secondary/20 to-background"}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${entry.type === "sign-to-text" ? "bg-primary/10 text-primary" : "bg-secondary text-secondary-foreground"}`}>
                                {entry.type === "sign-to-text"
                                  ? <Camera className="w-4 h-4" />
                                  : <Type className="w-4 h-4" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge className={`text-xs border-0 ${entry.type === "sign-to-text" ? "bg-primary/10 text-primary" : "bg-secondary text-secondary-foreground"}`}>
                                    {entry.type === "sign-to-text" ? "Sign → Text" : "Text → Sign"}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">{formatTime(entry.timestamp)}</span>
                                </div>
                                <p className="text-foreground text-sm leading-relaxed line-clamp-2" dir="rtl">{entry.text}</p>
                                {entry.words.length > 1 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {entry.words.slice(0, 6).map((w, i) => (
                                      <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{w}</span>
                                    ))}
                                    {entry.words.length > 6 && (
                                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">+{entry.words.length - 6}</span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => handleDelete(entry.id)}
                              className="text-muted-foreground/50 hover:text-destructive transition-colors mt-0.5 shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </AnimatePresence>
                ))}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}
