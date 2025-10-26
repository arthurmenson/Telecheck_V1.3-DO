import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import {
  Video,
  FileText,
  CreditCard,
  IdCard,
  AlertTriangle,
  CheckCircle,
  Clock,
  Wifi,
  Sun,
  Volume2,
} from "lucide-react";

export interface ConsentData {
  telehealthConsent: boolean;
  emergencyUnderstanding: boolean;
  billingAuthorization: boolean;
}

interface PreVisitInstructionsProps {
  visitType: string;
  appointmentType: string;
  consents: ConsentData;
  onConsentChange: (consents: ConsentData) => void;
}

export function PreVisitInstructions({
  visitType,
  appointmentType,
  consents,
  onConsentChange,
}: PreVisitInstructionsProps) {
  const updateConsent = (field: keyof ConsentData, value: boolean) => {
    onConsentChange({ ...consents, [field]: value });
  };

  const preparationItems = [
    {
      icon: FileText,
      title: "List of Current Medications",
      description:
        "Include all prescriptions, over-the-counter medications, vitamins, and supplements with dosages",
    },
    {
      icon: FileText,
      title: "Recent Test Results",
      description:
        "Any lab work, imaging results, or medical reports from other providers (if applicable)",
    },
    {
      icon: CreditCard,
      title: "Insurance Card",
      description: "Your current health insurance card (both sides)",
    },
    {
      icon: IdCard,
      title: "Photo ID",
      description: "Government-issued identification for verification",
    },
  ];

  const videoCallTips = [
    {
      icon: Wifi,
      title: "Stable Internet Connection",
      description:
        "Use WiFi or strong cellular data. Close other apps using bandwidth.",
    },
    {
      icon: Sun,
      title: "Good Lighting",
      description:
        "Position yourself facing a light source so the provider can see you clearly.",
    },
    {
      icon: Volume2,
      title: "Quiet, Private Location",
      description:
        "Choose a quiet room where you can speak freely about your health.",
    },
    {
      icon: Clock,
      title: "Join 5 Minutes Early",
      description:
        "Allow time to test your camera and microphone before the appointment.",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Prepare for Your Visit</h2>
        <p className="text-muted-foreground text-sm">
          Follow these steps to ensure a smooth and productive consultation
        </p>
      </div>

      {/* What to Prepare */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5" />
            What to Have Ready
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {preparationItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 pt-1">
                    <h4 className="font-medium mb-1">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Video Call Best Practices */}
      {appointmentType === "video" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Video className="w-5 h-5" />
              Video Consultation Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {videoCallTips.map((tip, index) => {
                const Icon = tip.icon;
                return (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm mb-1">{tip.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {tip.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Typical Duration:</strong> Video consultations usually
                last 15-30 minutes. Please allow extra time for complex issues.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* What to Expect */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            What to Expect
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              <p>
                Your provider will review your medical history and reason for
                visit before the appointment
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              <p>
                The consultation will follow a standard medical visit format
                with history-taking, examination (as possible), and discussion
                of treatment options
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              <p>
                Prescriptions can be sent electronically to your preferred
                pharmacy if needed
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              <p>
                You'll receive a visit summary and any follow-up instructions
                via your patient portal
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Required Consents */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Required Acknowledgements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="telehealth-consent"
              checked={consents.telehealthConsent}
              onCheckedChange={(checked) =>
                updateConsent("telehealthConsent", checked as boolean)
              }
              className="mt-1"
            />
            <Label
              htmlFor="telehealth-consent"
              className="cursor-pointer font-normal leading-relaxed"
            >
              <span className="font-medium">Telehealth Consent:</span> I consent
              to receive healthcare services via telehealth technology. I
              understand that telehealth involves the use of electronic
              communications to enable healthcare providers to diagnose,
              consult, treat, and educate patients remotely. I understand that I
              have the right to withhold or withdraw consent at any time.
            </Label>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="emergency-understanding"
              checked={consents.emergencyUnderstanding}
              onCheckedChange={(checked) =>
                updateConsent("emergencyUnderstanding", checked as boolean)
              }
              className="mt-1"
            />
            <Label
              htmlFor="emergency-understanding"
              className="cursor-pointer font-normal leading-relaxed"
            >
              <span className="font-medium">Emergency Care Understanding:</span>{" "}
              I understand that telehealth is NOT appropriate for medical
              emergencies. In case of a medical emergency, I will call 911 or go
              to the nearest emergency room. Telehealth services are designed
              for non-emergency consultations and care.
            </Label>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="billing-authorization"
              checked={consents.billingAuthorization}
              onCheckedChange={(checked) =>
                updateConsent("billingAuthorization", checked as boolean)
              }
              className="mt-1"
            />
            <Label
              htmlFor="billing-authorization"
              className="cursor-pointer font-normal leading-relaxed"
            >
              <span className="font-medium">Billing Authorization:</span> I
              authorize the healthcare provider to bill my insurance company for
              services rendered. I understand that I am responsible for any
              copayments, deductibles, or services not covered by my insurance.
              I will be notified of estimated costs prior to receiving services
              when possible.
            </Label>
          </div>

          {(!consents.telehealthConsent ||
            !consents.emergencyUnderstanding ||
            !consents.billingAuthorization) && (
            <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-orange-900 dark:text-orange-100">
                  All acknowledgements are required to proceed with booking your
                  appointment.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
