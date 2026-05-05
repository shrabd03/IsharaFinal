import { useState, useEffect } from "react";

export type Preferences = {
  fontSize: number;
  textColor: 'dark' | 'purple' | 'violet' | 'plum';
  displayMode: 'normal' | 'high-contrast' | 'dark';
  soundEnabled: boolean;
};

const defaultPreferences: Preferences = {
  fontSize: 16,
  textColor: 'dark',
  displayMode: 'normal',
  soundEnabled: true,
};

export function usePreferences() {
  const [preferences, setPreferences] = useState<Preferences>(() => {
    try {
      const saved = localStorage.getItem("ishara_preferences");
      return saved ? JSON.parse(saved) : defaultPreferences;
    } catch {
      return defaultPreferences;
    }
  });

  const updatePreferences = (newPrefs: Partial<Preferences>) => {
    const updated = { ...preferences, ...newPrefs };
    setPreferences(updated);
    localStorage.setItem("ishara_preferences", JSON.stringify(updated));
  };

  useEffect(() => {
    document.documentElement.style.fontSize = `${preferences.fontSize}px`;
    
    document.documentElement.classList.remove('dark', 'high-contrast');
    if (preferences.displayMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (preferences.displayMode === 'high-contrast') {
      document.documentElement.classList.add('high-contrast');
    }

  }, [preferences]);

  return { preferences, updatePreferences };
}
