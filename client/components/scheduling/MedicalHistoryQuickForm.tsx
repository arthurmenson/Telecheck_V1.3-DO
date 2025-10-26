import React from "react";
import { Card, CardContent } from "../ui/card";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { AlertCircle, Shield } from "lucide-react";

export interface MedicalHistoryData {
  seenForThisBefore: string;
  hasAllergies: string;
  allergyDetails: string;
  currentMedications: string;
  recentHospitalizations: string;
}

interface MedicalHistoryQuickFormProps {
  data: MedicalHistoryData;
  onUpdate: (data: MedicalHistoryData) => void;
}

export function MedicalHistoryQuickForm({
  data,
  onUpdate,
}: MedicalHistoryQuickFormProps) {
  const updateField = (field: keyof MedicalHistoryData, value: string) => {
    onUpdate({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Medical History</h2>
        <p className="text-muted-foreground text-sm">
          Help us understand your medical background for safer, more effective
          care
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-6">
          {/* Previously Seen */}
          <div className="space-y-3">
            <Label>Have you been seen for this issue before?</Label>
            <RadioGroup
              value={data.seenForThisBefore}
              onValueChange={(value) => updateField("seenForThisBefore", value)}
            >
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="no" id="seen-no" />
                  <Label
                    htmlFor="seen-no"
                    className="font-normal cursor-pointer"
                  >
                    No, this is the first time
                  </Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="yes" id="seen-yes" />
                  <Label
                    htmlFor="seen-yes"
                    className="font-normal cursor-pointer"
                  >
                    Yes, I've been seen for this before
                  </Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="unsure" id="seen-unsure" />
                  <Label
                    htmlFor="seen-unsure"
                    className="font-normal cursor-pointer"
                  >
                    I'm not sure
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Allergies */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              Do you have any allergies we should know about?
            </Label>
            <RadioGroup
              value={data.hasAllergies}
              onValueChange={(value) => {
                updateField("hasAllergies", value);
                if (value === "no") {
                  updateField("allergyDetails", "");
                }
              }}
            >
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="no" id="allergies-no" />
                  <Label
                    htmlFor="allergies-no"
                    className="font-normal cursor-pointer"
                  >
                    No known allergies
                  </Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="yes" id="allergies-yes" />
                  <Label
                    htmlFor="allergies-yes"
                    className="font-normal cursor-pointer"
                  >
                    Yes, I have allergies
                  </Label>
                </div>
              </div>
            </RadioGroup>

            {data.hasAllergies === "yes" && (
              <div className="mt-4 pl-8">
                <Label htmlFor="allergy-details" className="mb-2 block">
                  Please list your allergies
                </Label>
                <Textarea
                  id="allergy-details"
                  placeholder="Include medication allergies, food allergies, environmental allergies, and your reactions..."
                  value={data.allergyDetails}
                  onChange={(e) =>
                    updateField("allergyDetails", e.target.value)
                  }
                  className="min-h-[100px]"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Example: Penicillin (causes rash), Peanuts (anaphylaxis),
                  Latex (skin irritation)
                </p>
              </div>
            )}
          </div>

          {/* Current Medications */}
          <div className="space-y-2">
            <Label htmlFor="current-medications">
              Are you currently taking any medications?
            </Label>
            <Textarea
              id="current-medications"
              placeholder="List all prescription medications, over-the-counter drugs, vitamins, and supplements..."
              value={data.currentMedications}
              onChange={(e) =>
                updateField("currentMedications", e.target.value)
              }
              className="min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground">
              Include dosages and frequency if known (e.g., Lisinopril 10mg once
              daily, Vitamin D 1000IU)
            </p>
          </div>

          {/* Recent Hospitalizations */}
          <div className="space-y-2">
            <Label htmlFor="recent-hospitalizations">
              Any recent hospitalizations or surgeries? (Past 6 months)
            </Label>
            <Textarea
              id="recent-hospitalizations"
              placeholder="Describe any recent hospital stays, surgeries, or emergency room visits..."
              value={data.recentHospitalizations}
              onChange={(e) =>
                updateField("recentHospitalizations", e.target.value)
              }
              className="min-h-[80px]"
            />
            <p className="text-xs text-muted-foreground">
              If none, you can leave this blank or type "None"
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
              Your Privacy is Protected
            </p>
            <p className="text-blue-700 dark:text-blue-300">
              All information you provide is kept confidential and secure in
              accordance with HIPAA regulations. This information is only shared
              with your healthcare providers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
