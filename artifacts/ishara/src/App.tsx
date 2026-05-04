import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Auth from "@/pages/auth";
import Home from "@/pages/home";
import Settings from "@/pages/settings";
import Contact from "@/pages/contact";
import Phrasebook from "@/pages/phrasebook";
import SignToText from "@/pages/sign-to-text";
import TextToSign from "@/pages/text-to-sign";
import History from "@/pages/history";
import { usePreferences } from "@/hooks/use-preferences";
import { useEffect } from "react";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Auth} />
      <Route path="/home" component={Home} />
      <Route path="/settings" component={Settings} />
      <Route path="/contact" component={Contact} />
      <Route path="/phrasebook" component={Phrasebook} />
      <Route path="/sign-to-text" component={SignToText} />
      <Route path="/text-to-sign" component={TextToSign} />
      <Route path="/history" component={History} />
      <Route component={NotFound} />
    </Switch>
  );
}

function PreferenceProvider({ children }: { children: React.ReactNode }) {
  // This hook call ensures preferences are loaded and applied to the document element
  usePreferences();
  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PreferenceProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </PreferenceProvider>
    </QueryClientProvider>
  );
}

export default App;
