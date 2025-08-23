import React, { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useTheme } from "./ThemeProvider";
import { Palette, ChevronDown, ChevronUp } from "lucide-react";

const quickThemes = [
  { id: "medical-teal", name: "Medical Teal", color: "#0891b2" },
  { id: "nature-green", name: "Nature Green", color: "#059669" },
  { id: "royal-purple", name: "Royal Purple", color: "#7c3aed" },
  { id: "sunset-orange", name: "Sunset Orange", color: "#ea580c" },
  { id: "ocean-blue", name: "Ocean Blue", color: "#1d4ed8" },
  { id: "rose-pink", name: "Rose Pink", color: "#e11d48" },
];

export function QuickThemeSwitcher() {
  const { colorTheme, setColorTheme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  const currentTheme = quickThemes.find((t) => t.id === colorTheme);

  return (
    <Card className="glass-morphism border border-border/20">
      <CardContent className="p-3">
        {/* Compact Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div
              className="w-4 h-4 rounded-full border border-white/50 shadow-sm"
              style={{ backgroundColor: currentTheme?.color }}
            />
            <span className="text-sm font-medium text-foreground">
              {currentTheme?.name}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-auto p-1 text-muted-foreground hover:text-foreground"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Quick Theme Grid */}
        {isExpanded && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {quickThemes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => {
                    setColorTheme(theme.id);
                    setIsExpanded(false);
                  }}
                  className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 hover:bg-accent/50 ${
                    colorTheme === theme.id
                      ? "bg-primary/10 border border-primary/20"
                      : "bg-background/50 hover:scale-105"
                  }`}
                >
                  <div
                    className="w-6 h-6 rounded-full border border-white/50 shadow-sm mb-1"
                    style={{ backgroundColor: theme.color }}
                  />
                  <span className="text-xs text-center text-foreground font-medium leading-tight">
                    {theme.name.split(" ")[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
