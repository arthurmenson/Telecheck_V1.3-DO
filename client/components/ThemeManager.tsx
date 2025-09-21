import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { useTheme } from "./ThemeProvider";
import {
  Settings,
  Download,
  Upload,
  Palette,
  Copy,
  Check,
  RotateCcw,
  Save,
} from "lucide-react";

export function ThemeManager() {
  const { colorTheme, setColorTheme } = useTheme();
  const [copied, setCopied] = useState(false);
  const [customThemeName, setCustomThemeName] = useState("");

  const exportThemeSettings = () => {
    const themeData = {
      colorTheme,
      darkMode: document.documentElement.classList.contains("dark"),
      timestamp: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(themeData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `telecheck-theme-${colorTheme}-${Date.now()}.json`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const copyThemeCSS = async () => {
    const root = document.documentElement;
    const primaryColor = getComputedStyle(root).getPropertyValue("--primary");
    const gradientFrom =
      getComputedStyle(root).getPropertyValue("--gradient-from");
    const gradientTo = getComputedStyle(root).getPropertyValue("--gradient-to");

    const cssString = `
/* Telecheck Custom Theme - ${colorTheme} */
:root {
  --primary: ${primaryColor};
  --gradient-from: ${gradientFrom};
  --gradient-to: ${gradientTo};
}

.gradient-bg {
  background: linear-gradient(135deg, hsl(var(--gradient-from)), hsl(var(--gradient-to)));
}
    `.trim();

    try {
      await navigator.clipboard.writeText(cssString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy CSS:", err);
    }
  };

  const resetToDefault = () => {
    setColorTheme("medical-teal");
    localStorage.removeItem("color-theme");
  };

  const saveCustomTheme = () => {
    if (!customThemeName.trim()) return;

    const customThemes = JSON.parse(
      localStorage.getItem("custom-themes") || "[]",
    );
    const newTheme = {
      id: `custom-${Date.now()}`,
      name: customThemeName,
      baseTheme: colorTheme,
      created: new Date().toISOString(),
    };

    customThemes.push(newTheme);
    localStorage.setItem("custom-themes", JSON.stringify(customThemes));
    setCustomThemeName("");
  };

  return (
    <Card className="glass-morphism border border-border/20">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-foreground flex items-center">
          <Settings className="w-5 h-5 mr-2 text-primary" />
          Theme Manager
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Theme Info */}
        <div className="glass-morphism p-3 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              Active Theme
            </span>
            <Badge className="bg-primary/10 text-primary">
              {colorTheme
                .replace("-", " ")
                .replace(/\b\w/g, (l) => l.toUpperCase())}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Palette className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Applied at {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* Theme Actions */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportThemeSettings}
              className="text-xs"
            >
              <Download className="w-3 h-3 mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={copyThemeCSS}
              className="text-xs"
            >
              {copied ? (
                <Check className="w-3 h-3 mr-2 text-green-600" />
              ) : (
                <Copy className="w-3 h-3 mr-2" />
              )}
              {copied ? "Copied!" : "Copy CSS"}
            </Button>
          </div>

          {/* Save Custom Theme */}
          <div className="space-y-2">
            <div className="flex space-x-2">
              <Input
                placeholder="Custom theme name"
                value={customThemeName}
                onChange={(e) => setCustomThemeName(e.target.value)}
                className="text-xs"
              />
              <Button
                size="sm"
                onClick={saveCustomTheme}
                disabled={!customThemeName.trim()}
                className="text-xs"
              >
                <Save className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Reset Option */}
          <Button
            variant="outline"
            size="sm"
            onClick={resetToDefault}
            className="w-full text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="w-3 h-3 mr-2" />
            Reset to Default
          </Button>
        </div>

        {/* Theme Tips */}
        <div className="bg-blue-50/50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200/50">
          <h4 className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-1">
            Pro Tips
          </h4>
          <ul className="text-xs text-blue-700 dark:text-blue-200 space-y-1">
            <li>• Export themes to share with your team</li>
            <li>• Copy CSS for custom integrations</li>
            <li>• Save variations as custom themes</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
