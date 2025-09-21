import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useTheme } from "./ThemeProvider";
import { ThemePreview } from "./ThemePreview";
import { ThemeManager } from "./ThemeManager";
import {
  Palette,
  Check,
  Heart,
  Leaf,
  Sunset,
  Waves,
  Mountain,
  Sparkles,
  Flame,
  Moon,
  Sun,
  Zap,
  RefreshCw,
} from "lucide-react";

interface ColorTheme {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  preview: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  cssVariables: {
    light: Record<string, string>;
    dark: Record<string, string>;
  };
}

const colorThemes: ColorTheme[] = [
  {
    id: "medical-teal",
    name: "Medical Teal",
    description: "Professional healthcare theme with calming teal tones",
    icon: Heart,
    preview: {
      primary: "#0891b2",
      secondary: "#06b6d4",
      accent: "#67e8f9",
      background: "#f0fdfa",
    },
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
    description: "Wellness-focused with natural green hues",
    icon: Leaf,
    preview: {
      primary: "#059669",
      secondary: "#10b981",
      accent: "#6ee7b7",
      background: "#f0fdf4",
    },
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
    description: "Premium purple theme for sophisticated experience",
    icon: Sparkles,
    preview: {
      primary: "#7c3aed",
      secondary: "#8b5cf6",
      accent: "#c4b5fd",
      background: "#faf5ff",
    },
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
    description: "Warm and energetic orange theme",
    icon: Sunset,
    preview: {
      primary: "#ea580c",
      secondary: "#f97316",
      accent: "#fed7aa",
      background: "#fff7ed",
    },
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
    description: "Deep blue theme inspired by ocean depths",
    icon: Waves,
    preview: {
      primary: "#1d4ed8",
      secondary: "#3b82f6",
      accent: "#93c5fd",
      background: "#eff6ff",
    },
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
    description: "Gentle rose theme for a softer interface",
    icon: Heart,
    preview: {
      primary: "#e11d48",
      secondary: "#f43f5e",
      accent: "#fda4af",
      background: "#fff1f2",
    },
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
  {
    id: "forest-emerald",
    name: "Forest Emerald",
    description: "Rich emerald green for a premium feel",
    icon: Mountain,
    preview: {
      primary: "#047857",
      secondary: "#059669",
      accent: "#6ee7b7",
      background: "#ecfdf5",
    },
    cssVariables: {
      light: {
        "--primary": "158 64% 52%",
        "--primary-foreground": "0 0% 100%",
        "--gradient-from": "158 64% 52%",
        "--gradient-to": "160 84% 39%",
      },
      dark: {
        "--primary": "158 64% 52%",
        "--primary-foreground": "0 0% 100%",
        "--gradient-from": "158 64% 52%",
        "--gradient-to": "160 84% 39%",
      },
    },
  },
  {
    id: "golden-amber",
    name: "Golden Amber",
    description: "Luxurious amber and gold combination",
    icon: Flame,
    preview: {
      primary: "#d97706",
      secondary: "#f59e0b",
      accent: "#fcd34d",
      background: "#fffbeb",
    },
    cssVariables: {
      light: {
        "--primary": "32 95% 44%",
        "--primary-foreground": "0 0% 100%",
        "--gradient-from": "32 95% 44%",
        "--gradient-to": "38 92% 50%",
      },
      dark: {
        "--primary": "32 95% 44%",
        "--primary-foreground": "0 0% 100%",
        "--gradient-from": "32 95% 44%",
        "--gradient-to": "38 92% 50%",
      },
    },
  },
  {
    id: "midnight-indigo",
    name: "Midnight Indigo",
    description: "Dark indigo theme for sophisticated nights",
    icon: Moon,
    preview: {
      primary: "#4338ca",
      secondary: "#6366f1",
      accent: "#a5b4fc",
      background: "#f8fafc",
    },
    cssVariables: {
      light: {
        "--primary": "243 75% 59%",
        "--primary-foreground": "0 0% 100%",
        "--gradient-from": "243 75% 59%",
        "--gradient-to": "238 78% 69%",
      },
      dark: {
        "--primary": "243 75% 59%",
        "--primary-foreground": "0 0% 100%",
        "--gradient-from": "243 75% 59%",
        "--gradient-to": "238 78% 69%",
      },
    },
  },
  {
    id: "electric-cyan",
    name: "Electric Cyan",
    description: "High-energy cyan for modern interfaces",
    icon: Zap,
    preview: {
      primary: "#0891b2",
      secondary: "#06b6d4",
      accent: "#67e8f9",
      background: "#cffafe",
    },
    cssVariables: {
      light: {
        "--primary": "188 96% 53%",
        "--primary-foreground": "0 0% 100%",
        "--gradient-from": "188 96% 53%",
        "--gradient-to": "186 100% 94%",
      },
      dark: {
        "--primary": "188 96% 53%",
        "--primary-foreground": "0 0% 100%",
        "--gradient-from": "188 96% 53%",
        "--gradient-to": "186 100% 94%",
      },
    },
  },
];

export function ColorThemeSelector() {
  const { colorTheme, setColorTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [compactView, setCompactView] = useState(false);

  const handleThemeSelect = (themeId: string) => {
    setColorTheme(themeId);
  };

  const resetToDefault = () => {
    setColorTheme("medical-teal");
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Handle ESC key to close modal
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden"; // Prevent background scroll
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const currentTheme = colorThemes.find((t) => t.id === colorTheme);

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="hover-lift"
      >
        <Palette className="w-4 h-4 mr-2" />
        <span className="hidden sm:inline">Color Theme</span>
        <span className="sm:hidden">Theme</span>
      </Button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="w-full max-w-4xl max-h-[85vh] overflow-y-auto mobile-scroll"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="glass-morphism border border-border/20 relative">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center">
                  <Palette className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-foreground">
                    Color Theme Selector
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Choose your preferred color scheme for the interface
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCompactView(!compactView)}
                  className="hover-lift"
                >
                  {compactView ? "Detailed" : "Compact"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetToDefault}
                  className="hover-lift"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClose}
                  className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                >
                  ✕
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Live Preview - only in detailed view */}
            {!compactView && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  Live Preview
                </h3>
                <div className="flex justify-center">
                  <ThemePreview
                    title="Health Dashboard"
                    description="See how your selected theme looks"
                  />
                </div>
              </div>
            )}

            {/* Current Theme Preview */}
            {currentTheme && (
              <Card className="mb-6 border-2 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{
                          backgroundColor: currentTheme.preview.primary,
                        }}
                      >
                        <currentTheme.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground flex items-center">
                          {currentTheme.name}
                          <Badge className="ml-2 bg-primary/10 text-primary">
                            Current
                          </Badge>
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {currentTheme.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {Object.values(currentTheme.preview).map((color, idx) => (
                        <div
                          key={idx}
                          className="w-8 h-8 rounded-lg border-2 border-white shadow-sm"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Theme Grid */}
            <div
              className={`grid gap-3 ${
                compactView
                  ? "grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8"
                  : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              }`}
            >
              {colorThemes.map((theme) => {
                const Icon = theme.icon;
                const isSelected = colorTheme === theme.id;

                return (
                  <Card
                    key={theme.id}
                    className={`cursor-pointer transition-all duration-300 hover-lift ${
                      isSelected
                        ? "border-2 border-primary bg-primary/5"
                        : "border border-border/20 hover:border-primary/30"
                    }`}
                    onClick={() => handleThemeSelect(theme.id)}
                  >
                    <CardContent className={compactView ? "p-2" : "p-4"}>
                      {compactView ? (
                        /* Compact View */
                        <div className="flex flex-col items-center space-y-2">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm relative"
                            style={{ backgroundColor: theme.preview.primary }}
                          >
                            <Icon className="w-4 h-4 text-white" />
                            {isSelected && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                <Check className="w-2 h-2 text-white" />
                              </div>
                            )}
                          </div>
                          <span className="text-xs font-medium text-foreground text-center leading-tight">
                            {theme.name}
                          </span>
                          <div className="flex space-x-1 w-full">
                            {Object.values(theme.preview)
                              .slice(0, 3)
                              .map((color, idx) => (
                                <div
                                  key={idx}
                                  className="flex-1 h-3 rounded border border-white/50"
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                          </div>
                        </div>
                      ) : (
                        /* Detailed View */
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm"
                              style={{ backgroundColor: theme.preview.primary }}
                            >
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            {isSelected && (
                              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>

                          <h3 className="font-semibold text-foreground mb-1">
                            {theme.name}
                          </h3>
                          <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                            {theme.description}
                          </p>

                          {/* Color Preview */}
                          <div className="flex space-x-1">
                            {Object.values(theme.preview).map((color, idx) => (
                              <div
                                key={idx}
                                className="flex-1 h-6 rounded border border-white/50 shadow-sm"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Advanced Theme Management - only in detailed view */}
            {!compactView && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <Card className="bg-blue-50/50 dark:bg-blue-900/20 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <Sun className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-foreground mb-2">
                          Theme Tips
                        </h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>
                            • Themes automatically adapt to light and dark mode
                          </li>
                          <li>
                            • Your selection is saved and will persist across
                            sessions
                          </li>
                          <li>
                            • Choose colors that work well for extended use
                          </li>
                          <li>
                            • Consider accessibility and readability for medical
                            data
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <ThemeManager />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
