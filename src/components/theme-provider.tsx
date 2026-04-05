"use client";

import { useEffect } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useTheme } from "next-themes";

function ThemeCookieSync() {
  const { theme, resolvedTheme } = useTheme();

  useEffect(() => {
    const value = theme === "system" ? "system" : resolvedTheme ?? "system";

    document.cookie = `theme=${value}; path=/; max-age=31536000; samesite=lax`;
  }, [resolvedTheme, theme]);

  return null;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
}: {
  children: React.ReactNode;
  defaultTheme?: string;
}) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={defaultTheme}
      enableSystem
      disableTransitionOnChange
    >
      <ThemeCookieSync />
      {children}
    </NextThemesProvider>
  );
}
