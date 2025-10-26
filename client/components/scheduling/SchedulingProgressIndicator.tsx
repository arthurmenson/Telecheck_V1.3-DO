import React from "react";
import { Check } from "lucide-react";
import { cn } from "../../lib/utils";

interface SchedulingProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const stepTitles: Record<number, string> = {
  1: "Visit Type",
  2: "Chief Complaint",
  3: "Symptom Details",
  4: "Medical History",
  5: "Choose Provider",
  6: "Date & Time",
  7: "Pre-Visit Information",
  8: "Confirmation",
};

export function SchedulingProgressIndicator({
  currentStep,
  totalSteps,
}: SchedulingProgressIndicatorProps) {
  return (
    <div className="mb-8">
      {/* Progress Bar - Desktop */}
      <div className="hidden md:flex justify-between items-center mb-4">
        {Array.from({ length: totalSteps }, (_, i) => {
          const stepNumber = i + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isUpcoming = stepNumber > currentStep;

          return (
            <React.Fragment key={stepNumber}>
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all",
                    isCompleted && "bg-green-500 text-white shadow-sm",
                    isCurrent &&
                      "bg-primary text-primary-foreground shadow-md ring-4 ring-primary/20",
                    isUpcoming &&
                      "bg-muted text-muted-foreground border-2 border-muted",
                  )}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : stepNumber}
                </div>
                <div className="mt-2 text-xs text-center max-w-[80px]">
                  <span
                    className={cn(
                      "font-medium",
                      isCurrent && "text-primary",
                      isCompleted && "text-green-600 dark:text-green-400",
                      isUpcoming && "text-muted-foreground",
                    )}
                  >
                    {stepTitles[stepNumber] || `Step ${stepNumber}`}
                  </span>
                </div>
              </div>
              {stepNumber < totalSteps && (
                <div
                  className={cn(
                    "h-1 flex-1 mx-2 transition-all",
                    stepNumber < currentStep ? "bg-green-500" : "bg-muted",
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Progress Bar - Mobile */}
      <div className="md:hidden space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold shadow-md">
              {currentStep}
            </div>
            <div>
              <p className="text-sm font-medium text-primary">
                {stepTitles[currentStep] || `Step ${currentStep}`}
              </p>
              <p className="text-xs text-muted-foreground">
                Step {currentStep} of {totalSteps}
              </p>
            </div>
          </div>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Description */}
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
          {currentStep === 1 &&
            "Let's start by understanding what type of care you need"}
          {currentStep === 2 && "Tell us what brings you in today"}
          {currentStep === 3 && "Help us understand your symptoms better"}
          {currentStep === 4 && "Share relevant medical history"}
          {currentStep === 5 && "Select your healthcare provider"}
          {currentStep === 6 && "Pick a convenient time for your visit"}
          {currentStep === 7 && "Review important information and give consent"}
          {currentStep === 8 && "Your appointment is confirmed"}
        </p>
      </div>
    </div>
  );
}
