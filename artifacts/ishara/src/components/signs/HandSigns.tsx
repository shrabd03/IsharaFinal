import { motion } from "framer-motion";
import { Hand, HandMetal, ThumbsUp, ThumbsDown, User, HeartHandshake } from "lucide-react";

export type SignData = {
  id: string;
  english: string;
  arabic: string;
  description: string;
};

export const signsList: SignData[] = [
  { id: "hello", english: "Hello", arabic: "مرحبا", description: "Wave hand side to side" },
  { id: "yes", english: "Yes", arabic: "نعم", description: "Nod fist up and down" },
  { id: "thank_you", english: "Thank you", arabic: "شكراً", description: "Open hand moving from forehead outward" },
  { id: "me", english: "Me", arabic: "أنا", description: "Point to chest" },
  { id: "help", english: "Help", arabic: "مساعدة", description: "Fist on flat palm lifted upward" },
];

export function HelloSign({ isHighlighted }: { isHighlighted?: boolean }) {
  return (
    <motion.div
      animate={isHighlighted ? { rotate: [0, 15, -10, 15, 0] } : {}}
      transition={{ duration: 1, ease: "easeInOut", repeat: isHighlighted ? Infinity : 0, repeatDelay: 1 }}
      className="text-primary w-24 h-24"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
        <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
        <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
        <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
      </svg>
    </motion.div>
  );
}

export function YesSign({ isHighlighted }: { isHighlighted?: boolean }) {
  return (
    <motion.div
      animate={isHighlighted ? { rotateX: [0, 30, -10, 20, 0], y: [0, 5, -5, 0] } : {}}
      transition={{ duration: 1.2, ease: "easeInOut", repeat: isHighlighted ? Infinity : 0, repeatDelay: 1 }}
      className="text-primary w-24 h-24"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
        <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
        <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
        <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
      </svg>
    </motion.div>
  );
}

export function ThankYouSign({ isHighlighted }: { isHighlighted?: boolean }) {
  return (
    <motion.div
      animate={isHighlighted ? { y: [0, -10, 0], scale: [1, 1.05, 1], rotateX: [0, -20, 0] } : {}}
      transition={{ duration: 1.5, ease: "easeOut", repeat: isHighlighted ? Infinity : 0, repeatDelay: 1 }}
      className="text-primary w-24 h-24"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
        <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
        <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
        <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
      </svg>
    </motion.div>
  );
}

export function MeSign({ isHighlighted }: { isHighlighted?: boolean }) {
  return (
    <motion.div
      animate={isHighlighted ? { scale: [1, 0.9, 1], y: [0, 5, 0] } : {}}
      transition={{ duration: 1, ease: "easeInOut", repeat: isHighlighted ? Infinity : 0, repeatDelay: 1 }}
      className="text-primary w-24 h-24"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <path d="M11 14h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 16" />
        <path d="m7 20 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2-.9 2-2v-2c0-1.1-.9-2-2-2h-2" />
        <path d="M14 6V2a2 2 0 0 1 4 0v8" />
      </svg>
    </motion.div>
  );
}

export function HelpSign({ isHighlighted }: { isHighlighted?: boolean }) {
  return (
    <motion.div
      animate={isHighlighted ? { y: [0, -15, 0] } : {}}
      transition={{ duration: 1.5, ease: "easeInOut", repeat: isHighlighted ? Infinity : 0, repeatDelay: 1 }}
      className="text-primary w-24 h-24 relative"
    >
       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <path d="M2 12h20" />
        <path d="M14 12V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
        <path d="M10 12V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
        <path d="M6 12.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
      </svg>
    </motion.div>
  );
}

export function AnimatedSign({ signId, isHighlighted }: { signId: string, isHighlighted?: boolean }) {
  switch (signId) {
    case "hello": return <HelloSign isHighlighted={isHighlighted} />;
    case "yes": return <YesSign isHighlighted={isHighlighted} />;
    case "thank_you": return <ThankYouSign isHighlighted={isHighlighted} />;
    case "me": return <MeSign isHighlighted={isHighlighted} />;
    case "help": return <HelpSign isHighlighted={isHighlighted} />;
    default: return <HelloSign isHighlighted={isHighlighted} />;
  }
}
