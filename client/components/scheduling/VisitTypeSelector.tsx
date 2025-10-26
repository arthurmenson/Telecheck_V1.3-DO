import React from "react";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import {
  Stethoscope,
  RefreshCw,
  AlertCircle,
  UserCheck,
  FileQuestion,
  Pill,
  LucideIcon,
} from "lucide-react";

interface VisitTypeOption {
  value: string;
  label: string;
  description: string;
  icon: LucideIcon;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
}

interface VisitTypeSelectorProps {
  selected: string;
  onChange: (value: string) => void;
}

const visitTypeOptions: VisitTypeOption[] = [
  {
    value: "primary",
    label: "Primary Care Visit",
    description: "General health concerns, checkups, and preventive care",
    icon: Stethoscope,
    badge: "Most Common",
    badgeVariant: "default",
  },
  {
    value: "followup",
    label: "Follow-up Visit",
    description: "Continue care for an existing condition or treatment",
    icon: RefreshCw,
  },
  {
    value: "urgent",
    label: "Urgent Care",
    description: "Non-emergency acute conditions requiring prompt attention",
    icon: AlertCircle,
    badge: "Same Day Available",
    badgeVariant: "destructive",
  },
  {
    value: "specialist",
    label: "Specialist Consultation",
    description: "Expert consultation for specific medical conditions",
    icon: UserCheck,
  },
  {
    value: "second_opinion",
    label: "Second Opinion",
    description:
      "Get another expert perspective on your diagnosis or treatment",
    icon: FileQuestion,
  },
  {
    value: "medication",
    label: "Medication Refill Consultation",
    description: "Review and refill prescriptions with a healthcare provider",
    icon: Pill,
    badge: "Quick Visit",
    badgeVariant: "secondary",
  },
];

export function VisitTypeSelector({
  selected,
  onChange,
}: VisitTypeSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">
          What type of visit do you need?
        </h2>
        <p className="text-muted-foreground text-sm">
          Select the option that best describes your healthcare need
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {visitTypeOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = selected === option.value;

          return (
            <Card
              key={option.value}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected
                  ? "ring-2 ring-primary border-primary bg-primary/5"
                  : ""
              }`}
              onClick={() => onChange(option.value)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-foreground leading-tight">
                        {option.label}
                      </h3>
                      {option.badge && (
                        <Badge
                          variant={option.badgeVariant || "secondary"}
                          className="text-xs whitespace-nowrap"
                        >
                          {option.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground leading-snug">
                      {option.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
              For Medical Emergencies
            </p>
            <p className="text-blue-700 dark:text-blue-300">
              If you are experiencing a life-threatening emergency, please call
              911 or go to your nearest emergency room immediately. Telehealth
              is not appropriate for emergencies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
