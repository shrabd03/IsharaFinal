import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Mail, Phone, Clock, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [fromEmail, setFromEmail] = useState(user?.email ?? "");
  const [fromName, setFromName] = useState(user?.name ?? "");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSubject("");
      setMessage("");
      toast({
        title: "Message sent",
        description: "Thank you for reaching out. We'll get back to you within 24 hours.",
      });
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 shadow-md text-white" style={{ backgroundColor: "#1F768E" }}>
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <button onClick={() => setLocation("/home")} className="flex items-center gap-2 text-primary-foreground/80 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-semibold">Contact Us</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 max-w-2xl py-8 space-y-6">
        <div className="grid sm:grid-cols-3 gap-4">
          <Card className="sm:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Mail className="w-4 h-4 text-primary" /> Email
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="text-sm font-medium text-foreground">info@ishara.jo</p>
              <p className="text-sm text-muted-foreground">General enquiries</p>
              <p className="text-sm font-medium text-foreground mt-3">support@ishara.jo</p>
              <p className="text-sm text-muted-foreground">Technical support</p>
            </CardContent>
          </Card>

          <Card className="sm:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Phone className="w-4 h-4 text-primary" /> Phone
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="text-sm font-medium text-foreground">+962 6 500 1234</p>
              <p className="text-sm text-muted-foreground">Main line</p>
              <p className="text-sm font-medium text-foreground mt-3">+962 79 200 5678</p>
              <p className="text-sm text-muted-foreground">WhatsApp support</p>
            </CardContent>
          </Card>

          <Card className="sm:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="w-4 h-4 text-primary" /> Hours
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="text-sm font-medium text-foreground">Sun – Thu</p>
              <p className="text-sm text-muted-foreground">9:00 AM – 5:00 PM</p>
              <p className="text-sm font-medium text-foreground mt-3">Fri – Sat</p>
              <p className="text-sm text-muted-foreground">Closed</p>
              <p className="text-xs text-muted-foreground mt-2">(Jordan Time, UTC+3)</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Send className="w-5 h-5 text-primary" /> Send us a message
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSend} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ct-name">Your Name</Label>
                  <Input id="ct-name" value={fromName} onChange={e => setFromName(e.target.value)} placeholder="Full name" required className="bg-background" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ct-email">Your Email</Label>
                  <Input id="ct-email" type="email" value={fromEmail} onChange={e => setFromEmail(e.target.value)} placeholder="name@example.com" required className="bg-background" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ct-subject">Subject</Label>
                <Input id="ct-subject" value={subject} onChange={e => setSubject(e.target.value)} placeholder="What is your message about?" required className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ct-message">Message</Label>
                <Textarea id="ct-message" value={message} onChange={e => setMessage(e.target.value)} placeholder="Write your message here..." required className="bg-background min-h-[130px] resize-none" />
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 gap-2" disabled={sending}>
                {sending ? "Sending…" : <><Send className="w-4 h-4" /> Send Message</>}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
