import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  HelpCircle,
  Info,
  BookOpen,
  ExternalLink,
  Play,
  CheckCircle,
} from "lucide-react";

interface FeatureExplainerProps {
  title: string;
  description: string;
  features?: string[];
  benefits?: string[];
  examples?: string[];
  learnMoreUrl?: string;
  videoUrl?: string;
  category?: string;
  complexity?: "Beginner" | "Intermediate" | "Advanced";
  estimatedTime?: string;
  prerequisites?: string[];
  icon?: React.ComponentType<{ className?: string }>;
  variant?: "info" | "help" | "minimal";
  size?: "sm" | "md" | "lg";
  placement?: "top" | "bottom" | "left" | "right";
}

export function FeatureExplainer({
  title,
  description,
  features = [],
  benefits = [],
  examples = [],
  learnMoreUrl,
  videoUrl,
  category,
  complexity,
  estimatedTime,
  prerequisites = [],
  icon: IconComponent = HelpCircle,
  variant = "info",
  size = "md",
  placement = "bottom",
}: FeatureExplainerProps) {
  const getIconSize = () => {
    switch (size) {
      case "sm":
        return "w-3 h-3";
      case "md":
        return "w-4 h-4";
      case "lg":
        return "w-5 h-5";
      default:
        return "w-4 h-4";
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case "sm":
        return "w-5 h-5";
      case "md":
        return "w-6 h-6";
      case "lg":
        return "w-7 h-7";
      default:
        return "w-6 h-6";
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "help":
        return "text-blue-500 hover:text-blue-600 hover:bg-blue-50";
      case "minimal":
        return "text-muted-foreground hover:text-foreground hover:bg-accent";
      default:
        return "text-primary hover:text-primary/80 hover:bg-primary/10";
    }
  };

  const getComplexityColor = () => {
    switch (complexity) {
      case "Beginner":
        return "bg-green-100 text-green-700";
      case "Intermediate":
        return "bg-yellow-100 text-yellow-700";
      case "Advanced":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`${getButtonSize()} p-0 rounded-full ${getVariantStyles()} transition-all duration-200 hover:scale-110`}
          aria-label={`Learn more about ${title}`}
        >
          <IconComponent className={getIconSize()} />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-96 p-0 shadow-xl border-0"
        side={placement}
        align="start"
        sideOffset={8}
      >
        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-lg overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b bg-gradient-to-r from-primary/5 to-primary/10">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-foreground mb-1">
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {description}
                </p>
              </div>
              {category && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {category}
                </Badge>
              )}
            </div>

            {/* Meta information */}
            {(complexity || estimatedTime) && (
              <div className="flex gap-2 mt-3">
                {complexity && (
                  <Badge className={`text-xs ${getComplexityColor()}`}>
                    {complexity}
                  </Badge>
                )}
                {estimatedTime && (
                  <Badge variant="outline" className="text-xs">
                    ⏱️ {estimatedTime}
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Key Features */}
            {features.length > 0 && (
              <div>
                <h4 className="font-medium text-sm text-foreground mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Key Features
                </h4>
                <ul className="space-y-1">
                  {features.map((feature, index) => (
                    <li
                      key={index}
                      className="text-sm text-muted-foreground flex items-start gap-2"
                    >
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Benefits */}
            {benefits.length > 0 && (
              <div>
                <h4 className="font-medium text-sm text-foreground mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                  Benefits
                </h4>
                <ul className="space-y-1">
                  {benefits.map((benefit, index) => (
                    <li
                      key={index}
                      className="text-sm text-muted-foreground flex items-start gap-2"
                    >
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Examples */}
            {examples.length > 0 && (
              <div>
                <h4 className="font-medium text-sm text-foreground mb-2">
                  Use Cases
                </h4>
                <div className="space-y-2">
                  {examples.map((example, index) => (
                    <div
                      key={index}
                      className="text-sm text-muted-foreground p-2 bg-accent/30 rounded border-l-2 border-primary/30"
                    >
                      {example}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prerequisites */}
            {prerequisites.length > 0 && (
              <div>
                <h4 className="font-medium text-sm text-foreground mb-2">
                  Prerequisites
                </h4>
                <ul className="space-y-1">
                  {prerequisites.map((prereq, index) => (
                    <li
                      key={index}
                      className="text-sm text-muted-foreground flex items-start gap-2"
                    >
                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                      {prereq}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {(learnMoreUrl || videoUrl) && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t">
              <div className="flex gap-2">
                {videoUrl && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 gap-2"
                    asChild
                  >
                    <a
                      href={videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Play className="w-3 h-3" />
                      Watch Demo
                    </a>
                  </Button>
                )}
                {learnMoreUrl && (
                  <Button size="sm" className="flex-1 gap-2" asChild>
                    <a
                      href={learnMoreUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <BookOpen className="w-3 h-3" />
                      Learn More
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Preset configurations for common use cases
export const presets = {
  aiScribe: {
    title: "AI Medical Scribe",
    description:
      "Intelligent voice-to-text transcription with medical terminology understanding and automated SOAP note generation.",
    features: [
      "Real-time speech-to-text with 96%+ accuracy",
      "Medical terminology recognition",
      "Auto-generated SOAP notes",
      "ICD-10 code suggestions",
      "Drug interaction alerts",
    ],
    benefits: [
      "Save 4+ hours daily on documentation",
      "Reduce transcription errors by 80%",
      "Improve patient face time",
      "Ensure HIPAA compliance",
    ],
    examples: [
      "Record patient consultations and get structured notes",
      "Upload audio files for batch processing",
      "Generate billing codes automatically",
    ],
    category: "Clinical AI",
    complexity: "Intermediate" as const,
    estimatedTime: "15 min setup",
    prerequisites: ["Microphone access permission", "Basic EHR knowledge"],
  },

  clinicalTools: {
    title: "Clinical Tools Suite",
    description:
      "Comprehensive collection of clinical assessment tools, decision support systems, and diagnostic aids.",
    features: [
      "Clinical decision support",
      "Diagnostic calculators",
      "Assessment templates",
      "Reference guides",
      "Drug interaction checker",
    ],
    benefits: [
      "Faster clinical decisions",
      "Reduced diagnostic errors",
      "Standardized assessments",
      "Evidence-based recommendations",
    ],
    category: "Clinical Suite",
    complexity: "Beginner" as const,
    estimatedTime: "5 min",
  },

  careCoordination: {
    title: "Care Coordination",
    description:
      "Streamline patient care across multiple providers with shared care plans, task management, and communication tools.",
    features: [
      "Shared care plans",
      "Provider communication",
      "Task assignments",
      "Patient progress tracking",
      "Appointment coordination",
    ],
    benefits: [
      "Improved care continuity",
      "Better provider collaboration",
      "Reduced care gaps",
      "Enhanced patient outcomes",
    ],
    category: "Care Management",
    complexity: "Intermediate" as const,
    estimatedTime: "10 min setup",
  },
};
