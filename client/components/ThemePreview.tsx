import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Heart, Activity, TestTube, Pill, Brain } from "lucide-react";

interface ThemePreviewProps {
  title: string;
  description?: string;
}

export function ThemePreview({ title, description }: ThemePreviewProps) {
  return (
    <Card className="w-full max-w-md glass-morphism border border-border/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-foreground flex items-center">
          <Heart className="w-5 h-5 mr-2 text-primary" />
          {title}
        </CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sample Health Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-morphism p-3 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                Heart Rate
              </span>
            </div>
            <div className="text-2xl font-bold text-foreground">72</div>
            <div className="text-xs text-muted-foreground">bpm</div>
          </div>

          <div className="glass-morphism p-3 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <TestTube className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                Lab Score
              </span>
            </div>
            <div className="text-2xl font-bold text-foreground">85</div>
            <div className="text-xs text-muted-foreground">excellent</div>
          </div>
        </div>

        {/* Sample Progress */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-foreground">Daily Steps</span>
              <span className="text-muted-foreground">7,250 / 10,000</span>
            </div>
            <Progress value={72} className="h-2" />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-foreground">Medication Adherence</span>
              <span className="text-muted-foreground">95%</span>
            </div>
            <Progress value={95} className="h-2" />
          </div>
        </div>

        {/* Sample Badges and Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <Badge className="bg-primary/10 text-primary border-primary/20">
              Healthy
            </Badge>
            <Badge variant="outline" className="text-muted-foreground">
              Normal
            </Badge>
          </div>
          <Button size="sm" className="gradient-bg text-white border-0">
            <Brain className="w-4 h-4 mr-2" />
            AI Insights
          </Button>
        </div>

        {/* Sample Cards */}
        <div className="glass-morphism p-3 rounded-lg border border-border/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Pill className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-foreground">Medication Alert</h4>
              <p className="text-sm text-muted-foreground">
                Take your evening dose
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
