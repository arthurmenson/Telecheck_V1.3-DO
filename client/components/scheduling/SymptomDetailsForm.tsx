import React from "react";
import { Card, CardContent } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Calendar } from "lucide-react";

export interface SymptomDetails {
  startDate: string;
  duration: string;
  severity: string;
  previousTreatment: string;
  relatedMedications: string;
}

interface SymptomDetailsFormProps {
  data: SymptomDetails;
  onUpdate: (data: SymptomDetails) => void;
}

const durationOptions = [
  { value: "hours", label: "Hours" },
  { value: "days", label: "Days (1-7)" },
  { value: "weeks", label: "Weeks (1-4)" },
  { value: "months", label: "Months or longer" },
];

const severityOptions = [
  {
    value: "mild",
    label: "Mild",
    description: "Noticeable but not interfering with daily activities",
  },
  {
    value: "moderate",
    label: "Moderate",
    description: "Interfering with some daily activities",
  },
  {
    value: "severe",
    label: "Severe",
    description: "Significantly limiting daily activities",
  },
  {
    value: "critical",
    label: "Critical",
    description: "Unable to perform normal activities",
  },
];

export function SymptomDetailsForm({
  data,
  onUpdate,
}: SymptomDetailsFormProps) {
  const updateField = (field: keyof SymptomDetails, value: string) => {
    onUpdate({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">
          Tell us more about your symptoms
        </h2>
        <p className="text-muted-foreground text-sm">
          This information helps your provider give you the best care
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-6">
          {/* Symptom Start Date */}
          <div className="space-y-2">
            <Label
              htmlFor="symptom-start-date"
              className="flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              When did your symptoms start?
            </Label>
            <Input
              id="symptom-start-date"
              type="date"
              value={data.startDate}
              onChange={(e) => updateField("startDate", e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="max-w-xs"
            />
          </div>

          {/* Duration */}
          <div className="space-y-3">
            <Label>How long have you been experiencing these symptoms?</Label>
            <RadioGroup
              value={data.duration}
              onValueChange={(value) => updateField("duration", value)}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {durationOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all ${
                      data.duration === option.value
                        ? "border-primary bg-primary/5"
                        : "border-gray-200"
                    }`}
                  >
                    <RadioGroupItem
                      value={option.value}
                      id={`duration-${option.value}`}
                    />
                    <Label
                      htmlFor={`duration-${option.value}`}
                      className="cursor-pointer font-normal flex-1"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Severity */}
          <div className="space-y-3">
            <Label>How would you rate the severity of your symptoms?</Label>
            <RadioGroup
              value={data.severity}
              onValueChange={(value) => updateField("severity", value)}
            >
              <div className="space-y-3">
                {severityOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-all ${
                      data.severity === option.value
                        ? "border-primary bg-primary/5"
                        : "border-gray-200"
                    }`}
                  >
                    <RadioGroupItem
                      value={option.value}
                      id={`severity-${option.value}`}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor={`severity-${option.value}`}
                        className="cursor-pointer font-medium block mb-1"
                      >
                        {option.label}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Previous Treatment */}
          <div className="space-y-2">
            <Label htmlFor="previous-treatment">
              Have you tried any treatments or remedies for these symptoms?
            </Label>
            <Textarea
              id="previous-treatment"
              placeholder="E.g., over-the-counter medications, home remedies, previous doctor visits..."
              value={data.previousTreatment}
              onChange={(e) => updateField("previousTreatment", e.target.value)}
              className="min-h-[80px]"
            />
            <p className="text-xs text-muted-foreground">
              Include what you tried and whether it helped
            </p>
          </div>

          {/* Related Medications */}
          <div className="space-y-2">
            <Label htmlFor="related-medications">
              Are you currently taking any medications related to this issue?
            </Label>
            <Textarea
              id="related-medications"
              placeholder="List any medications, supplements, or vitamins you're taking..."
              value={data.relatedMedications}
              onChange={(e) =>
                updateField("relatedMedications", e.target.value)
              }
              className="min-h-[80px]"
            />
            <p className="text-xs text-muted-foreground">
              Include dosages if you know them (e.g., Ibuprofen 200mg twice
              daily)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
