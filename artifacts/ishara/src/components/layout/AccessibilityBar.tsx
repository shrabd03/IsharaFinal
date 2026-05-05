import { useState, useEffect } from "react";
import { Settings2, Volume2, VolumeX, Monitor, Moon, Type, Palette } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { usePreferences } from "@/hooks/use-preferences";
import { motion } from "framer-motion";

export function AccessibilityBar() {
  const { preferences, updatePreferences } = usePreferences();
  
  return (
    <Card className="p-4 flex flex-col md:flex-row items-center gap-6 justify-between bg-card/80 backdrop-blur-sm border-primary/10 shadow-md sticky top-20 z-40 mx-4 md:mx-auto max-w-5xl mt-[-2rem]">
      <div className="flex items-center gap-2 text-primary font-medium">
        <Settings2 className="w-5 h-5" />
        <span>Accessibility Settings</span>
      </div>

      <div className="flex flex-wrap items-center gap-6 justify-center">
        {/* Text Size */}
        <div className="flex items-center gap-3">
          <Type className="w-4 h-4 text-muted-foreground" />
          <div className="w-24">
            <Slider 
              value={[preferences.fontSize]} 
              min={12} max={28} step={1}
              onValueChange={(v) => updatePreferences({ fontSize: v[0] })}
              aria-label="Text Size"
            />
          </div>
          <span className="text-xs text-muted-foreground w-8">{preferences.fontSize}px</span>
        </div>

        {/* Display Mode */}
        <div className="flex items-center gap-2">
          <Monitor className="w-4 h-4 text-muted-foreground" />
          <Select 
            value={preferences.displayMode} 
            onValueChange={(v: 'normal'|'high-contrast'|'dark') => updatePreferences({ displayMode: v })}
          >
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue placeholder="Display Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal Mode</SelectItem>
              <SelectItem value="dark">Dark Mode</SelectItem>
              <SelectItem value="high-contrast">High Contrast</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Text Color Swatches */}
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-muted-foreground" />
          <div className="flex gap-1.5">
            {[
              { id: 'dark', color: 'bg-slate-900' },
              { id: 'purple', color: 'bg-purple-800' },
              { id: 'violet', color: 'bg-violet-600' },
              { id: 'plum', color: 'bg-fuchsia-900' },
            ].map(swatch => (
              <button
                key={swatch.id}
                onClick={() => updatePreferences({ textColor: swatch.id as any })}
                className={`w-6 h-6 rounded-full border-2 ${swatch.color} ${preferences.textColor === swatch.id ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : 'border-transparent'}`}
                aria-label={`Text color ${swatch.id}`}
              />
            ))}
          </div>
        </div>

        {/* Sound Toggle */}
        <div className="flex items-center gap-2">
          {preferences.soundEnabled ? <Volume2 className="w-4 h-4 text-muted-foreground" /> : <VolumeX className="w-4 h-4 text-muted-foreground" />}
          <Switch 
            checked={preferences.soundEnabled}
            onCheckedChange={(v) => updatePreferences({ soundEnabled: v })}
            aria-label="Toggle Sound"
          />
        </div>
      </div>
    </Card>
  );
}
