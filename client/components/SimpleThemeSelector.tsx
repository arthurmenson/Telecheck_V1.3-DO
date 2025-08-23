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

const popularThemes = [
  { id: "medical-teal", name: "Medical Teal", color: "#0891b2" },
  { id: "nature-green", name: "Nature Green", color: "#059669" },
  { id: "royal-purple", name: "Royal Purple", color: "#7c3aed" },
  { id: "sunset-orange", name: "Sunset Orange", color: "#ea580c" },
  { id: "ocean-blue", name: "Ocean Blue", color: "#1d4ed8" },
  { id: "rose-pink", name: "Rose Pink", color: "#e11d48" },
];

interface SimpleThemeSelectorProps {
  onOpenFullSelector?: () => void;
}

export function SimpleThemeSelector({
  onOpenFullSelector,
}: SimpleThemeSelectorProps) {
  const { colorTheme, setColorTheme } = useTheme();

  const currentTheme = popularThemes.find((t) => t.id === colorTheme);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="hover-lift">
          <div className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full border border-white/50"
              style={{ backgroundColor: currentTheme?.color || "#0891b2" }}
            />
            <Palette className="w-4 h-4" />
            <span className="hidden sm:inline">Theme</span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center">
          <Palette className="w-4 h-4 mr-2" />
          Color Themes
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {popularThemes.map((theme) => (
          <DropdownMenuItem
            key={theme.id}
            onClick={() => setColorTheme(theme.id)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div
                className="w-4 h-4 rounded border border-gray-300"
                style={{ backgroundColor: theme.color }}
              />
              <span>{theme.name}</span>
            </div>
            {colorTheme === theme.id && (
              <Check className="w-4 h-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        {onOpenFullSelector && (
          <DropdownMenuItem
            onClick={onOpenFullSelector}
            className="cursor-pointer text-primary"
          >
            <Palette className="w-4 h-4 mr-2" />
            More Options...
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
