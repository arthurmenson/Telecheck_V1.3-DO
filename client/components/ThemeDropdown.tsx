import React from "react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "./ui/dropdown-menu";
import { useTheme } from "./ThemeProvider";
import { Palette, Check } from "lucide-react";

const themes = [
  {
    id: "medical-teal",
    name: "Medical Teal",
    color: "#0891b2",
    desc: "Professional healthcare",
  },
  {
    id: "nature-green",
    name: "Nature Green",
    color: "#059669",
    desc: "Wellness focused",
  },
  {
    id: "royal-purple",
    name: "Royal Purple",
    color: "#7c3aed",
    desc: "Premium experience",
  },
  {
    id: "sunset-orange",
    name: "Sunset Orange",
    color: "#ea580c",
    desc: "Warm & energetic",
  },
  {
    id: "ocean-blue",
    name: "Ocean Blue",
    color: "#1d4ed8",
    desc: "Deep & calming",
  },
  {
    id: "rose-pink",
    name: "Rose Pink",
    color: "#e11d48",
    desc: "Gentle & soft",
  },
];

export function ThemeDropdown() {
  const { colorTheme, setColorTheme } = useTheme();
  const currentTheme = themes.find((t) => t.id === colorTheme);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="hover-lift gap-2">
          <div
            className="w-3 h-3 rounded-full border border-white/50 shadow-sm"
            style={{ backgroundColor: currentTheme?.color || "#0891b2" }}
          />
          <Palette className="w-4 h-4" />
          <span className="hidden sm:inline">Theme</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64 p-2" sideOffset={8}>
        <DropdownMenuLabel className="px-2 py-1.5 text-sm font-semibold flex items-center">
          <Palette className="w-4 h-4 mr-2 text-primary" />
          Color Themes
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="py-1">
          {themes.map((theme) => (
            <DropdownMenuItem
              key={theme.id}
              onClick={() => setColorTheme(theme.id)}
              className="flex items-center gap-3 p-2 cursor-pointer hover:bg-accent/80 rounded-md"
            >
              <div className="flex items-center gap-2 flex-1">
                <div
                  className="w-4 h-4 rounded-full border border-gray-300 shadow-sm flex-shrink-0"
                  style={{ backgroundColor: theme.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-foreground truncate">
                    {theme.name}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {theme.desc}
                  </div>
                </div>
              </div>
              {colorTheme === theme.id && (
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
              )}
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
