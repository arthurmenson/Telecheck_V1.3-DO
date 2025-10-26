/**
 * WCAG 2.1 AA Accessibility Fixes for Schedule.tsx
 *
 * This file contains corrected versions of components from Schedule.tsx
 * with full accessibility compliance.
 *
 * CRITICAL FIXES INCLUDED:
 * 1. Keyboard-accessible doctor and time slot selection
 * 2. Progress indicator with proper ARIA attributes
 * 3. Form labels and error handling
 * 4. aria-live announcements for booking status
 * 5. Proper button and interactive element semantics
 */

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import {
  Clock,
  Video,
  User,
  MapPin,
  Star,
  AlertTriangle,
  CheckCircle,
  Shield,
  Loader2,
  XCircle,
} from "lucide-react";

// ============================================================================
// ACCESSIBLE PROGRESS INDICATOR
// ============================================================================

/**
 * Booking Progress Indicator
 *
 * FIXES:
 * - Wrapped in <nav> with aria-label
 * - Uses <ol> for semantic step list
 * - aria-current indicates current step
 * - Screen reader announces step labels
 */
export const AccessibleProgressSteps = ({
  currentStep,
  steps,
}: {
  currentStep: number;
  steps: { number: number; label: string }[];
}) => {
  return (
    <nav aria-label="Appointment booking progress" className="mb-8">
      <ol className="flex items-center gap-4">
        {steps.map(({ number, label }) => {
          const isComplete = currentStep > number;
          const isCurrent = currentStep === number;

          return (
            <li
              key={number}
              className="flex items-center"
              aria-label={`Step ${number}: ${label}${isCurrent ? " (current step)" : ""}${isComplete ? " (completed)" : ""}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                  ${
                    isCurrent || isComplete
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                aria-current={isCurrent ? "step" : undefined}
              >
                {isComplete ? (
                  <CheckCircle className="w-5 h-5" aria-hidden="true" />
                ) : (
                  <span>{number}</span>
                )}
              </div>
              <span className="sr-only">{label}</span>
              {number < steps.length && (
                <div
                  className={`w-12 h-0.5 mx-2 transition-colors ${
                    isComplete ? "bg-primary" : "bg-muted"
                  }`}
                  role="presentation"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

// ============================================================================
// ACCESSIBLE DOCTOR CARD
// ============================================================================

/**
 * Doctor Selection Card
 *
 * FIXES:
 * - Proper button semantics for selection
 * - Keyboard navigation (Enter/Space to select)
 * - aria-pressed indicates selection state
 * - Focus indicators visible
 * - All information accessible to screen readers
 */
export const AccessibleDoctorCard = ({
  doctor,
  onSelect,
  isSelected = false,
}: {
  doctor: {
    id: number;
    name: string;
    specialty: string;
    location: string;
    rating: number;
    experience: string;
    nextAvailable: string;
    urgentSlots?: number;
    hasVideo: boolean;
    hasInPerson: boolean;
  };
  onSelect: () => void;
  isSelected?: boolean;
}) => {
  return (
    <button
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      aria-pressed={isSelected}
      aria-label={`Select ${doctor.name}, ${doctor.specialty}. Rating: ${doctor.rating} stars. Next available: ${doctor.nextAvailable}${doctor.urgentSlots ? `. ${doctor.urgentSlots} urgent slots available today` : ""}`}
      className={`w-full text-left transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
        isSelected ? "ring-2 ring-primary border-primary" : ""
      }`}
    >
      <Card className={isSelected ? "border-primary" : ""}>
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-8 h-8 text-white" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-foreground">
                    {doctor.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {doctor.specialty}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <MapPin
                      className="inline w-3 h-3 mr-1"
                      aria-hidden="true"
                    />
                    {doctor.location}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 mb-1">
                    <Star
                      className="w-3 h-3 text-yellow-500 fill-current"
                      aria-hidden="true"
                    />
                    <span className="text-xs font-medium">{doctor.rating}</span>
                    <span className="sr-only">out of 5 stars</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {doctor.experience}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock
                    className="w-3 h-3 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <span className="text-xs text-muted-foreground">
                    Next available: {doctor.nextAvailable}
                  </span>
                </div>

                {doctor.urgentSlots && doctor.urgentSlots > 0 && (
                  <div className="flex items-center gap-2">
                    <AlertTriangle
                      className="w-3 h-3 text-orange-500"
                      aria-hidden="true"
                    />
                    <span className="text-xs text-orange-600">
                      <span className="font-medium">{doctor.urgentSlots}</span>{" "}
                      urgent slots available today
                    </span>
                  </div>
                )}

                <div
                  className="flex gap-2 mt-3"
                  aria-label="Available consultation types"
                >
                  {doctor.hasVideo && (
                    <Badge variant="outline" className="text-xs">
                      <Video className="w-3 h-3 mr-1" aria-hidden="true" />
                      Video
                    </Badge>
                  )}
                  {doctor.hasInPerson && (
                    <Badge variant="outline" className="text-xs">
                      <MapPin className="w-3 h-3 mr-1" aria-hidden="true" />
                      In-Person
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {isSelected && (
            <div className="mt-3 pt-3 border-t border-border">
              <div className="flex items-center gap-2 text-sm text-primary">
                <CheckCircle className="w-4 h-4" aria-hidden="true" />
                <span className="font-medium">Selected</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </button>
  );
};

// ============================================================================
// ACCESSIBLE TIME SLOT SELECTION
// ============================================================================

/**
 * Time Slot Button
 *
 * FIXES:
 * - Proper button element with semantic meaning
 * - aria-pressed for selection state
 * - Descriptive aria-label
 * - Icons supplement color coding
 * - Keyboard accessible
 */
export const AccessibleTimeSlot = ({
  time,
  type = "regular",
  onSelect,
  isSelected = false,
}: {
  time: string;
  type?: "urgent" | "regular" | "video";
  onSelect: () => void;
  isSelected?: boolean;
}) => {
  const typeLabels = {
    urgent: "Same day urgent appointment",
    regular: "Regular appointment",
    video: "Video consultation",
  };

  const typeColors = {
    urgent:
      "border-red-200 bg-red-50 text-red-700 hover:bg-red-100 focus-visible:ring-red-500",
    regular:
      "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 focus-visible:ring-primary",
    video:
      "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 focus-visible:ring-blue-500",
  };

  return (
    <button
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      aria-pressed={isSelected}
      aria-label={`${time}, ${typeLabels[type]}${isSelected ? " (selected)" : ""}`}
      className={`p-3 rounded-lg border-2 transition-all text-sm font-medium
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        ${isSelected ? "ring-2 ring-primary border-primary bg-primary/10" : typeColors[type]}`}
    >
      <div className="flex items-center justify-center gap-2">
        {type === "urgent" && (
          <AlertTriangle className="w-3 h-3" aria-hidden="true" />
        )}
        {type === "video" && <Video className="w-3 h-3" aria-hidden="true" />}
        <span>{time}</span>
      </div>
      {type === "urgent" && (
        <div className="text-xs mt-1" aria-hidden="true">
          Same Day
        </div>
      )}
      {isSelected && <div className="sr-only">Selected</div>}
    </button>
  );
};

// ============================================================================
// ACCESSIBLE DATE SELECTION
// ============================================================================

/**
 * Date Selection Button
 *
 * FIXES:
 * - Radio button group semantics
 * - Proper aria-label
 * - Keyboard navigation
 * - Visual and text indicators
 */
export const AccessibleDateSelector = ({
  dates,
  selectedDate,
  onSelect,
}: {
  dates: {
    value: string;
    label: string;
    fullDate: string;
    isUrgent: boolean;
  }[];
  selectedDate: string;
  onSelect: (date: string) => void;
}) => {
  return (
    <div role="radiogroup" aria-label="Select appointment date">
      <h3 className="font-medium mb-4">Available Dates</h3>
      <div className="flex gap-3">
        {dates.map((date) => (
          <button
            key={date.value}
            role="radio"
            aria-checked={selectedDate === date.value}
            onClick={() => onSelect(date.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(date.value);
              }
            }}
            aria-label={`${date.label}, ${date.fullDate}${date.isUrgent ? ", urgent availability" : ""}`}
            className={`p-4 rounded-lg border-2 transition-all
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
              ${
                selectedDate === date.value
                  ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
          >
            <div className="text-center">
              <div className="font-semibold">{date.label}</div>
              <div className="text-sm text-muted-foreground">
                {date.fullDate}
              </div>
              <Badge
                variant={date.isUrgent ? "destructive" : "secondary"}
                className="mt-1 text-xs"
              >
                {date.isUrgent ? "Urgent" : "Regular"}
              </Badge>
            </div>
            {selectedDate === date.value && (
              <div className="sr-only">Selected</div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// ACCESSIBLE FORM COMPONENTS
// ============================================================================

/**
 * Appointment Reason Form Field
 *
 * FIXES:
 * - Proper label association with htmlFor
 * - Required field indicator
 * - Error message with aria-describedby
 * - Help text for guidance
 * - aria-invalid for validation state
 */
export const AccessibleAppointmentReasonField = ({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) => {
  const fieldId = "appointment-reason";
  const errorId = `${fieldId}-error`;
  const helpId = `${fieldId}-help`;

  return (
    <div className="space-y-2">
      <label
        htmlFor={fieldId}
        className="block text-sm font-medium text-foreground"
      >
        Reason for Visit
        <span className="text-red-500 ml-1" aria-label="required">
          *
        </span>
      </label>

      {!error && (
        <p id={helpId} className="text-xs text-muted-foreground">
          Please describe your symptoms or concerns. This helps your doctor
          prepare for the consultation.
        </p>
      )}

      <Textarea
        id={fieldId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Example: Discuss lab results, medication interactions, follow-up on cholesterol..."
        className={`h-32 ${error ? "border-red-500 focus-visible:ring-red-500" : ""}`}
        aria-required="true"
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? errorId : helpId}
      />

      {error && (
        <div
          id={errorId}
          role="alert"
          className="flex items-start gap-2 text-sm text-red-600"
        >
          <AlertTriangle
            className="w-4 h-4 flex-shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// ACCESSIBLE STATUS ANNOUNCEMENTS
// ============================================================================

/**
 * Booking Status Announcement
 *
 * FIXES:
 * - aria-live region for dynamic updates
 * - Separate regions for loading, success, error
 * - Screen reader announcements
 * - Proper alert roles
 */
export const AccessibleBookingStatus = ({
  isLoading,
  isSuccess,
  error,
  appointmentDetails,
}: {
  isLoading: boolean;
  isSuccess: boolean;
  error?: string;
  appointmentDetails?: {
    doctor: string;
    date: string;
    time: string;
    confirmationNumber?: string;
  };
}) => {
  return (
    <>
      {/* Loading State */}
      {isLoading && (
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="flex items-center justify-center p-4"
        >
          <Loader2 className="w-6 h-6 animate-spin mr-3" aria-hidden="true" />
          <span>Booking your appointment, please wait...</span>
        </div>
      )}

      {/* Success State */}
      {isSuccess && appointmentDetails && (
        <div role="status" aria-live="polite" aria-atomic="true">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <CheckCircle
                  className="w-6 h-6 text-green-600 flex-shrink-0"
                  aria-hidden="true"
                />
                <div>
                  <h3 className="font-semibold text-green-900 mb-2">
                    Appointment Confirmed!
                  </h3>
                  <div className="space-y-1 text-sm text-green-800">
                    <p>Doctor: {appointmentDetails.doctor}</p>
                    <p>Date: {appointmentDetails.date}</p>
                    <p>Time: {appointmentDetails.time}</p>
                    {appointmentDetails.confirmationNumber && (
                      <p>
                        Confirmation Number:{" "}
                        <span className="font-mono font-semibold">
                          {appointmentDetails.confirmationNumber}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div role="alert" aria-live="assertive" aria-atomic="true">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <XCircle
                  className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div>
                  <h3 className="font-medium text-red-900 mb-1">
                    Booking Failed
                  </h3>
                  <p className="text-sm text-red-700">{error}</p>
                  <p className="text-xs text-red-600 mt-2">
                    Please try again or contact support if the issue persists.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

// ============================================================================
// ACCESSIBLE CONFIRMATION SCREEN
// ============================================================================

/**
 * Appointment Confirmation View
 *
 * FIXES:
 * - Semantic heading structure
 * - Descriptive labels for all data
 * - Keyboard-accessible actions
 * - Screen reader friendly layout
 */
export const AccessibleConfirmationScreen = ({
  appointment,
  onAddToCalendar,
  onReturnToDashboard,
}: {
  appointment: {
    doctor: string;
    specialty: string;
    date: string;
    time: string;
    type: string;
    confirmationNumber: string;
    meetingLink?: string;
  };
  onAddToCalendar: () => void;
  onReturnToDashboard: () => void;
}) => {
  return (
    <div className="text-center py-12">
      <div role="status" aria-live="polite">
        <CheckCircle
          className="w-16 h-16 text-green-500 mx-auto mb-4"
          aria-hidden="true"
        />
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Appointment Confirmed!
        </h1>
        <p className="text-muted-foreground mb-6">
          Your appointment has been successfully scheduled.
        </p>
      </div>

      <Card className="max-w-md mx-auto mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Appointment Details</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <dl className="space-y-3 text-left">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Doctor:</dt>
              <dd className="font-medium">{appointment.doctor}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Specialty:</dt>
              <dd className="font-medium">{appointment.specialty}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Date:</dt>
              <dd className="font-medium">{appointment.date}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Time:</dt>
              <dd className="font-medium">{appointment.time}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Type:</dt>
              <dd className="font-medium">{appointment.type}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Confirmation:</dt>
              <dd className="font-medium font-mono">
                {appointment.confirmationNumber}
              </dd>
            </div>
          </dl>

          {appointment.meetingLink && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">
                Video Consultation Link:
              </p>
              <a
                href={appointment.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-700 underline break-all
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
              >
                {appointment.meetingLink}
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-4 justify-center">
        <Button
          onClick={onReturnToDashboard}
          size="lg"
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          Return to Dashboard
        </Button>
        <Button
          onClick={onAddToCalendar}
          variant="outline"
          size="lg"
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          Add to Calendar
        </Button>
      </div>
    </div>
  );
};

// ============================================================================
// USAGE EXAMPLE
// ============================================================================

/**
 * Example: Complete Accessible Scheduling Flow
 */
export const ExampleAccessibleSchedulingFlow = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const steps = [
    { number: 1, label: "Choose Doctor" },
    { number: 2, label: "Select Date and Time" },
    { number: 3, label: "Appointment Details" },
  ];

  const dates = [
    {
      value: "today",
      label: "Today",
      fullDate: new Date().toLocaleDateString(),
      isUrgent: true,
    },
    {
      value: "tomorrow",
      label: "Tomorrow",
      fullDate: new Date(Date.now() + 86400000).toLocaleDateString(),
      isUrgent: false,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Schedule Appointment</h1>

      <AccessibleProgressSteps currentStep={currentStep} steps={steps} />

      {/* Step-specific content would go here */}
      <AccessibleBookingStatus
        isLoading={isLoading}
        isSuccess={false}
        error={error}
      />
    </div>
  );
};

export {
  AccessibleProgressSteps,
  AccessibleDoctorCard,
  AccessibleTimeSlot,
  AccessibleDateSelector,
  AccessibleAppointmentReasonField,
  AccessibleBookingStatus,
  AccessibleConfirmationScreen,
};
