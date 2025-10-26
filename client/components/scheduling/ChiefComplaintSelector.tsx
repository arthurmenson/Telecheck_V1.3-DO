import React, { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

interface ChiefComplaintSelectorProps {
  selected: string;
  onChange: (value: string) => void;
  visitType: string;
  customReason?: string;
  onCustomReasonChange?: (value: string) => void;
}

const complaintsByVisitType: Record<string, string[]> = {
  primary: [
    "New symptoms or health concern",
    "Existing condition management",
    "Preventive care / wellness check",
    "Mental health / counseling",
    "Test result review",
    "Other",
  ],
  followup: [
    "Follow-up on recent diagnosis",
    "Medication adjustment or review",
    "Treatment progress check",
    "Post-procedure follow-up",
    "Lab result discussion",
    "Other",
  ],
  urgent: [
    "Acute pain or injury",
    "Fever or infection symptoms",
    "Respiratory issues",
    "Digestive problems",
    "Skin condition or rash",
    "Other urgent concern",
  ],
  specialist: [
    "Chronic disease management",
    "Complex diagnosis evaluation",
    "Treatment plan consultation",
    "Surgical consultation",
    "Second opinion request",
    "Other",
  ],
  second_opinion: [
    "Diagnosis confirmation",
    "Treatment plan review",
    "Surgical recommendation review",
    "Medication regimen evaluation",
    "Other",
  ],
  medication: [
    "Prescription refill",
    "Medication side effects",
    "Dosage adjustment needed",
    "Alternative medication discussion",
    "Other medication concern",
  ],
};

export function ChiefComplaintSelector({
  selected,
  onChange,
  visitType,
  customReason = "",
  onCustomReasonChange,
}: ChiefComplaintSelectorProps) {
  const complaints =
    complaintsByVisitType[visitType] || complaintsByVisitType.primary;
  const [showCustomInput, setShowCustomInput] = useState(selected === "other");

  const handleSelectionChange = (value: string) => {
    onChange(value);
    setShowCustomInput(value === "other");
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">
          What is the main reason for your visit?
        </h2>
        <p className="text-muted-foreground text-sm">
          This helps us prepare your healthcare provider with relevant
          information
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <RadioGroup value={selected} onValueChange={handleSelectionChange}>
            <div className="space-y-3">
              {complaints.map((complaint, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <RadioGroupItem
                    value={complaint.toLowerCase().replace(/\s+/g, "_")}
                    id={`complaint-${index}`}
                    className="mt-1"
                  />
                  <Label
                    htmlFor={`complaint-${index}`}
                    className="flex-1 cursor-pointer font-normal text-base leading-relaxed"
                  >
                    {complaint}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>

          {showCustomInput && (
            <div className="mt-6 pt-6 border-t">
              <Label htmlFor="custom-reason" className="mb-2 block">
                Please describe your concern in detail
              </Label>
              <Textarea
                id="custom-reason"
                placeholder="Please provide specific details about your symptoms, concerns, or reason for this visit..."
                value={customReason}
                onChange={(e) => onCustomReasonChange?.(e.target.value)}
                className="min-h-[120px]"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Include when symptoms started, severity, and any relevant
                medical history
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
