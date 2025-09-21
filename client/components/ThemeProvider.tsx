import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ColorTheme = {
  id: string;
  name: string;
  cssVariables: {
    light: Record<string, string>;
    dark: Record<string, string>;
  };
};

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  colorTheme: string;
  setColorTheme: (colorTheme: string) => void;
  applyColorTheme: (themeId: string) => void;
};

const colorThemes: ColorTheme[] = [
  {
    id: "medical-teal",
    name: "Medical Teal",
    cssVariables: {
      light: {
        "--primary": "178 91% 38%",
        "--primary-foreground": "210 40% 98%",
        "--gradient-from": "178 91% 38%",
        "--gradient-to": "176 85% 45%",
      },
      dark: {
        "--primary": "178 91% 38%",
        "--primary-foreground": "210 40% 98%",
        "--gradient-from": "178 91% 38%",
        "--gradient-to": "176 85% 45%",
      },
    },
  },
  {
    id: "nature-green",
    name: "Nature Green",
    cssVariables: {
      light: {
        "--primary": "160 84% 39%",
        "--primary-foreground": "0 0% 100%",
        "--gradient-from": "160 84% 39%",
        "--gradient-to": "158 73% 52%",
      },
      dark: {
        "--primary": "160 84% 39%",
        "--primary-foreground": "0 0% 100%",
        "--gradient-from": "160 84% 39%",
        "--gradient-to": "158 73% 52%",
      },
    },
  },
  {
    id: "royal-purple",
    name: "Royal Purple",
    cssVariables: {
      light: {
        "--primary": "262 83% 58%",
        "--primary-foreground": "0 0% 100%",
        "--gradient-from": "262 83% 58%",
        "--gradient-to": "255 91% 76%",
      },
      dark: {
        "--primary": "262 83% 58%",
        "--primary-foreground": "0 0% 100%",
        "--gradient-from": "262 83% 58%",
        "--gradient-to": "255 91% 76%",
      },
    },
  },
  {
    id: "sunset-orange",
    name: "Sunset Orange",
    cssVariables: {
      light: {
        "--primary": "20 91% 48%",
        "--primary-foreground": "0 0% 100%",
        "--gradient-from": "20 91% 48%",
        "--gradient-to": "24 95% 53%",
      },
      dark: {
        "--primary": "20 91% 48%",
        "--primary-foreground": "0 0% 100%",
        "--gradient-from": "20 91% 48%",
        "--gradient-to": "24 95% 53%",
      },
    },
  },
  {
    id: "ocean-blue",
    name: "Ocean Blue",
    cssVariables: {
      light: {
        "--primary": "217 91% 60%",
        "--primary-foreground": "0 0% 100%",
        "--gradient-from": "217 91% 60%",
        "--gradient-to": "213 93% 68%",
      },
      dark: {
        "--primary": "217 91% 60%",
        "--primary-foreground": "0 0% 100%",
        "--gradient-from": "217 91% 60%",
        "--gradient-to": "213 93% 68%",
      },
    },
  },
  {
    id: "rose-pink",
    name: "Rose Pink",
    cssVariables: {
      light: {
        "--primary": "346 77% 49%",
        "--primary-foreground": "0 0% 100%",
        "--gradient-from": "346 77% 49%",
        "--gradient-to": "348 83% 58%",
      },
      dark: {
        "--primary": "346 77% 49%",
        "--primary-foreground": "0 0% 100%",
        "--gradient-from": "346 77% 49%",
        "--gradient-to": "348 83% 58%",
      },
    },
  },
];

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  colorTheme: "medical-teal",
  setColorTheme: () => null,
  applyColorTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "telecheck-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme,
  );

  const [colorTheme, setColorTheme] = useState<string>(
    () => localStorage.getItem("color-theme") || "medical-teal",
  );

  const applyColorTheme = (themeId: string) => {
    const colorThemeData = colorThemes.find((t) => t.id === themeId);
    if (!colorThemeData) return;

    const root = window.document.documentElement;
    const isDark =
      root.classList.contains("dark") ||
      (theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    const variables = isDark
      ? colorThemeData.cssVariables.dark
      : colorThemeData.cssVariables.light;

    Object.entries(variables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    localStorage.setItem("color-theme", themeId);
  };

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    let actualTheme = theme;
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
      actualTheme = systemTheme;
    } else {
      root.classList.add(theme);
    }

    // Reapply color theme when dark/light mode changes
    applyColorTheme(colorTheme);
  }, [theme, colorTheme]);

  // Apply color theme on mount
  useEffect(() => {
    applyColorTheme(colorTheme);
  }, []);

  const handleSetColorTheme = (newColorTheme: string) => {
    setColorTheme(newColorTheme);
    applyColorTheme(newColorTheme);
  };

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
    colorTheme,
    setColorTheme: handleSetColorTheme,
    applyColorTheme,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
