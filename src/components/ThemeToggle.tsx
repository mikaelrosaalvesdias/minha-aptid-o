"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsDark(document.documentElement.dataset.theme === "dark");
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.dataset.theme = next ? "dark" : "";
    try {
      localStorage.setItem("ma_theme", next ? "dark" : "light");
    } catch {}
  }

  if (!mounted) {
    return <button className="theme-toggle" aria-label="Alternar tema" type="button" />;
  }

  return (
    <button className="theme-toggle" onClick={toggle} aria-label={isDark ? "Ativar tema claro" : "Ativar tema escuro"} title="Alternar tema" type="button">
      {isDark ? <Sun size={19} /> : <Moon size={19} />}
    </button>
  );
}
