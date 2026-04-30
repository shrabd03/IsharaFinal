import { useState, useEffect, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { useConversations } from "@/hooks/use-conversations";
import { signsList, AnimatedSign } from "@/components/signs/HandSigns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Search, Trash2 } from "lucide-react";

export default function ConversationDetail() {
  const [, params] = useRoute("/conversation/:id");
  const [, setLocation] = useLocation();
  const { conversations, addEntry, deleteConversation } = useConversations();
  
  const conversation = conversations.find(c => c.id === params?.id);
  const [inputText, setInputText] = useState("");
  const [selectedSign, setSelectedSign] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation?.entries]);

  if (!conversation) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <h2 className="text-2xl font-serif mb-4">Conversation not found</h2>
          <Button onClick={() => setLocation("/home")}>Back to Home</Button>
        </div>
      </div>
    );
  }

  const handleSend = () => {
    if ((inputText.trim() || selectedSign) && conversation) {
      addEntry(conversation.id, inputText.trim(), selectedSign || "hello");
      setInputText("");
      setSelectedSign(null);
      setIsComposerOpen(false);
    }
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this conversation?")) {
      deleteConversation(conversation.id);
      setLocation("/home");
    }
  };

  const filteredSigns = signsList.filter(s => 
    s.english.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.arabic.includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="bg-card border-b border-border/50 sticky top-16 z-30 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-4xl">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/home")} className="shrink-0 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-foreground leading-tight">{conversation.title}</h1>
              <p className="text-xs text-muted-foreground">
                {new Date(conversation.dateISO).toLocaleDateString()} • {conversation.signCount} signs
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleDelete} className="text-destructive/80 hover:text-destructive hover:bg-destructive/10">
            <Trash2 className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl flex flex-col">
        <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
          {conversation.entries.length === 0 ? (
            <div className="h-[40vh] flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-2">
                <AnimatedSign signId="hello" isHighlighted={true} />
              </div>
              <p className="text-muted-foreground max-w-md">
                This conversation is empty. Add entries to keep a record of signs and phrases.
              </p>
            </div>
          ) : (
            <div className="space-y-6 pb-24">
              {conversation.entries.map((entry) => {
                const sign = signsList.find(s => s.id === entry.signKey);
                return (
                  <div key={entry.id} className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 overflow-hidden text-primary">
                       <AnimatedSign signId={entry.signKey} />
                    </div>
                    <div className="flex-1">
                      <div className="bg-card border border-border p-4 rounded-2xl rounded-tl-none shadow-sm">
                        {entry.text && <p className="text-foreground mb-3 text-lg">{entry.text}</p>}
                        {sign && (
                          <div className="inline-flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-lg border border-border/50">
                            <span className="font-medium text-sm">{sign.english}</span>
                            <span className="text-xs text-secondary font-medium">({sign.arabic})</span>
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-1 ml-2 block">
                        {new Date(entry.timestampISO).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Fixed Composer Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border p-4 z-40">
           <div className="container mx-auto max-w-4xl flex items-end gap-2">
             <Dialog open={isComposerOpen} onOpenChange={setIsComposerOpen}>
               <DialogTrigger asChild>
                 <Button variant="outline" className="h-12 w-12 shrink-0 rounded-xl border-primary/20 bg-card hover:bg-muted">
                    {selectedSign ? (
                      <div className="w-8 h-8 text-primary"><AnimatedSign signId={selectedSign} /></div>
                    ) : (
                      <span className="text-xl">+</span>
                    )}
                 </Button>
               </DialogTrigger>
               <DialogContent className="sm:max-w-[500px] h-[80vh] sm:h-[600px] flex flex-col p-0 gap-0">
                 <DialogHeader className="p-6 pb-2 border-b border-border/50">
                   <DialogTitle>Select a Sign</DialogTitle>
                 </DialogHeader>
                 <div className="p-4 border-b border-border/50 bg-muted/20">
                   <div className="relative">
                     <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                     <Input 
                       placeholder="Search signs in English or Arabic..." 
                       className="pl-9 bg-background"
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                     />
                   </div>
                 </div>
                 <ScrollArea className="flex-1 p-4">
                   <div className="grid grid-cols-2 gap-3">
                     {filteredSigns.map(sign => (
                       <Card 
                         key={sign.id} 
                         className={`cursor-pointer transition-all ${selectedSign === sign.id ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'}`}
                         onClick={() => {
                           setSelectedSign(sign.id);
                           setIsComposerOpen(false);
                         }}
                       >
                         <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                           <div className={`w-16 h-16 ${selectedSign === sign.id ? 'text-primary' : 'text-muted-foreground'}`}>
                             <AnimatedSign signId={sign.id} isHighlighted={selectedSign === sign.id} />
                           </div>
                           <div>
                             <p className="font-semibold text-sm">{sign.english}</p>
                             <p className="text-xs text-secondary">({sign.arabic})</p>
                           </div>
                         </CardContent>
                       </Card>
                     ))}
                   </div>
                 </ScrollArea>
               </DialogContent>
             </Dialog>

             <Input 
               value={inputText}
               onChange={(e) => setInputText(e.target.value)}
               placeholder="Type a message..."
               className="h-12 rounded-xl bg-card border-primary/20 text-base"
               onKeyDown={(e) => e.key === 'Enter' && handleSend()}
             />
             
             <Button 
               onClick={handleSend}
               disabled={!inputText.trim() && !selectedSign}
               className="h-12 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shrink-0"
             >
               <Send className="w-5 h-5" />
             </Button>
           </div>
        </div>
      </main>
    </div>
  );
}
