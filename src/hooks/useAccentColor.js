import { useState, useEffect } from "react";

const STORAGE_KEY = "settings_accent";

export function useAccentColor() {
  const [accent, setAccentState] = useState(
    () => localStorage.getItem(STORAGE_KEY) || "default"
  );

  /* Apply / remove data-accent on <html> whenever accent changes */
  useEffect(() => {
    const root = document.documentElement;
    if (accent === "default") {
      root.removeAttribute("data-accent");
    } else {
      root.setAttribute("data-accent", accent);
    }
  }, [accent]);

  const setAccent = (value) => {
    localStorage.setItem(STORAGE_KEY, value);
    setAccentState(value);
  };

  return { accent, setAccent };
}
