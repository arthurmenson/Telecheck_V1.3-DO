import React, { useState } from "react";
import { Button } from "./ui/button";
import { useTheme } from "./ThemeProvider";
import { Palette, Check, X } from "lucide-react";

const themes = [
  { id: "medical-teal", name: "Medical Teal", color: "#0891b2" },
  { id: "nature-green", name: "Nature Green", color: "#059669" },
  { id: "royal-purple", name: "Royal Purple", color: "#7c3aed" },
  { id: "sunset-orange", name: "Sunset Orange", color: "#ea580c" },
  { id: "ocean-blue", name: "Ocean Blue", color: "#1d4ed8" },
  { id: "rose-pink", name: "Rose Pink", color: "#e11d48" },
];

export function FloatingThemeButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { colorTheme, setColorTheme } = useTheme();

  const handleThemeSelect = (themeId: string) => {
    setColorTheme(themeId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Button - only visible on mobile */}
      <div className="fixed bottom-6 right-6 z-40 md:hidden">
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="w-14 h-14 rounded-full gradient-bg text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover-lift"
        >
          <Palette className="w-6 h-6" />
        </Button>
      </div>

      {/* Mobile theme selector popup */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute bottom-24 right-6 w-72">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-border/20 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground flex items-center">
                  <Palette className="w-4 h-4 mr-2 text-primary" />
                  Choose Theme
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => handleThemeSelect(theme.id)}
                    className={`flex flex-col items-center p-3 rounded-xl transition-all ${
                      colorTheme === theme.id
                        ? "bg-primary/10 border-2 border-primary/30"
                        : "bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                    }`}
                  >
                    <div
                      className="w-6 h-6 rounded-full border-2 border-white shadow-sm mb-2 relative"
                      style={{ backgroundColor: theme.color }}
                    >
                      {colorTheme === theme.id && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                          <Check className="w-2 h-2 text-white" />
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-medium text-foreground text-center leading-tight">
                      {theme.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
