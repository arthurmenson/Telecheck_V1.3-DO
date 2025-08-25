import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import {
  Play,
  Pause,
  RotateCcw,
  Upload,
  Eye,
  Database,
  Brain,
  FileText,
  CheckCircle,
  Timer,
  Zap,
  Activity,
  TestTube,
} from "lucide-react";

interface InteractiveDemoProps {
  feature: string;
  onStepChange?: (step: number) => void;
}

export function InteractiveDemo({
  feature,
  onStepChange,
}: InteractiveDemoProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const demoSteps = {
    "ai-lab-analysis": [
      {
        title: "Upload Lab Report",
        description: "Secure file upload with validation",
        icon: Upload,
        duration: 3000,
        details: "Processing Comprehensive_Metabolic_Panel.pdf...",
      },
      {
        title: "OCR Processing",
        description: "Extracting text and medical data",
        icon: Eye,
        duration: 4000,
        details: "Recognizing medical terminology and values...",
      },
      {
        title: "Data Structuring",
        description: "Organizing and validating lab values",
        icon: Database,
        duration: 2000,
        details: "Validating 12 lab values against reference ranges...",
      },
      {
        title: "AI Analysis",
        description: "Generating clinical insights",
        icon: Brain,
        duration: 3000,
        details: "Analyzing cardiovascular and metabolic health...",
      },
      {
        title: "Report Complete",
        description: "Comprehensive health report ready",
        icon: FileText,
        duration: 1000,
        details: "Generated personalized recommendations and action items",
      },
    ],
  };

  const steps =
    demoSteps[feature as keyof typeof demoSteps] ||
    demoSteps["ai-lab-analysis"];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let progressInterval: NodeJS.Timeout;

    if (isPlaying) {
      const currentStepData = steps[currentStep];

      // Progress animation
      progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            return 100;
          }
          return prev + 100 / (currentStepData.duration / 100);
        });
      }, 100);

      // Step advancement
      interval = setTimeout(() => {
        setProgress(0);
        setCurrentStep((prev) => {
          const nextStep = prev >= steps.length - 1 ? 0 : prev + 1;
          onStepChange?.(nextStep);
          return nextStep;
        });
      }, currentStepData.duration);
    }

    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
    };
  }, [isPlaying, currentStep, steps, onStepChange]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setProgress(0);
    onStepChange?.(0);
  };

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex);
    setProgress(0);
    onStepChange?.(stepIndex);
  };

  return (
    <Card className="glass-morphism border border-border/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-foreground">
            Interactive Demo
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handlePlayPause}>
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              {isPlaying ? "Pause" : "Play"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Current Step Display */}
          <div className="glass-morphism p-6 rounded-xl border border-primary/20 bg-primary/5">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center">
                {React.createElement(steps[currentStep].icon, {
                  className: "w-6 h-6 text-white",
                })}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-bold text-foreground">
                    {steps[currentStep].title}
                  </h3>
                  {isPlaying && (
                    <Badge className="gradient-bg text-white border-0">
                      <Timer className="w-3 h-3 mr-1 animate-pulse" />
                      Processing
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground mb-3">
                  {steps[currentStep].description}
                </p>
                <p className="text-sm text-primary font-medium">
                  {steps[currentStep].details}
                </p>
                {isPlaying && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-primary">
                        {Math.round(progress)}%
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Step Navigation */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <button
                  key={index}
                  onClick={() => handleStepClick(index)}
                  className={`p-3 rounded-xl border transition-all duration-300 text-left hover-lift ${
                    index === currentStep
                      ? "border-primary bg-primary/5"
                      : index < currentStep
                        ? "border-green-200 bg-green-50"
                        : "border-border/20 glass-morphism hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    {index < currentStep ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : index === currentStep ? (
                      <Icon className="w-5 h-5 text-primary" />
                    ) : (
                      <Icon className="w-5 h-5 text-muted-foreground" />
                    )}
                    <span className="text-xs font-semibold text-foreground">
                      Step {index + 1}
                    </span>
                  </div>
                  <h4 className="font-medium text-foreground text-sm">
                    {step.title}
                  </h4>
                </button>
              );
            })}
          </div>

          {/* Demo Results */}
          {currentStep === steps.length - 1 && (
            <div className="glass-morphism p-6 rounded-xl border border-green-200 bg-green-50/50">
              <div className="flex items-center space-x-3 mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    Analysis Complete!
                  </h3>
                  <p className="text-muted-foreground">
                    Your lab report has been successfully processed
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">
                    Key Findings
                  </h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span>Glucose: 95 mg/dL (Normal)</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Activity className="w-3 h-3 text-yellow-500" />
                      <span>Cholesterol: 205 mg/dL (Borderline)</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span>HDL: 58 mg/dL (Good)</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">
                    AI Recommendations
                  </h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li className="flex items-center space-x-2">
                      <Zap className="w-3 h-3 text-primary" />
                      <span>Continue current glucose management</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Zap className="w-3 h-3 text-primary" />
                      <span>Discuss cholesterol with doctor</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Zap className="w-3 h-3 text-primary" />
                      <span>Maintain healthy HDL levels</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
