import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import {
  Calendar,
  Clock,
  Phone,
  Video,
  User,
  MapPin,
  Stethoscope,
  Heart,
  Brain,
  Eye,
  Bone,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  Star,
  Shield,
  Loader2,
  XCircle,
  AlertCircle,
  Info,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Skeleton } from "../components/ui/skeleton";
import type { Doctor } from "../types/telemedicine";
import {
  VisitTypeSelector,
  ChiefComplaintSelector,
  SymptomDetailsForm,
  MedicalHistoryQuickForm,
  PreVisitInstructions,
  SchedulingProgressIndicator,
  type SymptomDetails,
  type MedicalHistoryData,
  type ConsentData,
} from "../components/scheduling";

// Type definitions for API responses
interface ScheduleAppointmentResponse {
  success: boolean;
  data: {
    appointmentId: string;
    confirmationNumber: string;
    meetingLink?: string;
    instructions: string[];
  };
  error?: string;
}

interface HcwConsultationResponse {
  consultationId: string;
  hcwUrl: string;
  status: string;
  scheduledTime: string;
}

interface AppointmentData {
  providerId: string;
  userId: string;
  dateTime: string;
  type: "video" | "phone" | "in_person";
  reason: string;
  duration: number;
  // Enhanced intake data
  visitType?: string;
  chiefComplaint?: string;
  symptomDetails?: SymptomDetails;
  medicalContext?: MedicalHistoryData;
  consents?: ConsentData;
  intakeCompleted?: boolean;
  intakeVersion?: string;
}

// Doctor Card Component
const DoctorCard = ({
  doctor,
  onSelect,
  isSelected = false,
}: {
  doctor: Doctor;
  onSelect: () => void;
  isSelected?: boolean;
}) => {
  // Calculate urgent slots today
  const today = new Date().toISOString().split("T")[0];
  const todayAvailability = doctor.availability.find((a) => a.date === today);
  const urgentSlots = todayAvailability ? todayAvailability.slots.length : 0;

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? "ring-2 ring-primary border-primary" : ""
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-foreground">{doctor.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {doctor.specialty}
                </p>
                <p className="text-xs text-muted-foreground">
                  {doctor.location}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 mb-1">
                  <Star className="w-3 h-3 text-yellow-500 fill-current" />
                  <span className="text-xs font-medium">
                    {doctor.rating.toFixed(1)}
                  </span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {doctor.experience}+ years
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Next available: {doctor.nextAvailable || "Check calendar"}
                </span>
              </div>

              {urgentSlots > 0 && (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-3 h-3 text-orange-500" />
                  <span className="text-xs text-orange-600">
                    {urgentSlots} slot{urgentSlots !== 1 ? "s" : ""} available
                    today
                  </span>
                </div>
              )}

              <div className="flex gap-2 mt-3">
                {doctor.videoEnabled && (
                  <Badge variant="outline" className="text-xs">
                    <Video className="w-3 h-3 mr-1" />
                    Video
                  </Badge>
                )}
                {doctor.inPersonEnabled && (
                  <Badge variant="outline" className="text-xs">
                    <MapPin className="w-3 h-3 mr-1" />
                    In-Person
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Time Slot Component
const TimeSlot = ({
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
  const typeColors = {
    urgent: "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
    regular: "border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
    video: "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
  };

  return (
    <button
      onClick={onSelect}
      className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
        isSelected ? "ring-2 ring-primary border-primary" : typeColors[type]
      }`}
    >
      <div className="flex items-center justify-center gap-2">
        {type === "urgent" && <AlertTriangle className="w-3 h-3" />}
        {type === "video" && <Video className="w-3 h-3" />}
        <span>{time}</span>
      </div>
      {type === "urgent" && <div className="text-xs mt-1">Same Day</div>}
    </button>
  );
};

export function Schedule() {
  // Step 1: Visit Type
  const [visitType, setVisitType] = useState<string>("");

  // Step 2: Chief Complaint
  const [chiefComplaint, setChiefComplaint] = useState<string>("");
  const [customReason, setCustomReason] = useState<string>("");

  // Step 3: Symptom Details
  const [symptomDetails, setSymptomDetails] = useState<SymptomDetails>({
    startDate: "",
    duration: "",
    severity: "",
    previousTreatment: "",
    relatedMedications: "",
  });

  // Step 4: Medical History
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistoryData>({
    seenForThisBefore: "",
    hasAllergies: "",
    allergyDetails: "",
    currentMedications: "",
    recentHospitalizations: "",
  });

  // Step 5: Doctor Selection (existing)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  // Step 6: Date & Time (existing)
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  // Step 7: Pre-Visit & Consents
  const [consents, setConsents] = useState<ConsentData>({
    telehealthConsent: false,
    emergencyUnderstanding: false,
    billingAuthorization: false,
  });

  // Legacy fields for backward compatibility
  const [appointmentType, setAppointmentType] = useState("urgent");
  const [reason, setReason] = useState("");

  // Navigation & UI state
  const [step, setStep] = useState(1);
  const totalSteps = 8;

  // Loading and error states for booking
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appointmentDetails, setAppointmentDetails] = useState<{
    appointmentId: string;
    confirmationNumber: string;
    meetingLink?: string;
  } | null>(null);

  // Loading and error states for doctors
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);
  const [doctorsError, setDoctorsError] = useState<string | null>(null);

  // Fetch doctors from API
  useEffect(() => {
    const fetchDoctors = async () => {
      setIsLoadingDoctors(true);
      setDoctorsError(null);

      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("Authentication required. Please log in.");
        }

        const response = await fetch(
          "/api/telemedicine/providers?videoEnabled=true",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch doctors");
        }

        const data = await response.json();

        if (!data.success || !data.providers) {
          throw new Error("Invalid response format");
        }

        setDoctors(data.providers);
      } catch (error) {
        console.error("Error fetching doctors:", error);
        setDoctorsError(
          error instanceof Error
            ? error.message
            : "Unable to load doctors. Please try again later.",
        );
      } finally {
        setIsLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, []);

  // Available time slots
  const todaySlots = [
    { time: "2:00 PM", type: "urgent" as const },
    { time: "2:30 PM", type: "urgent" as const },
    { time: "4:30 PM", type: "urgent" as const },
    { time: "5:00 PM", type: "video" as const },
    { time: "5:30 PM", type: "video" as const },
  ];

  const tomorrowSlots = [
    { time: "9:00 AM", type: "regular" as const },
    { time: "9:30 AM", type: "regular" as const },
    { time: "10:00 AM", type: "video" as const },
    { time: "10:30 AM", type: "regular" as const },
    { time: "2:00 PM", type: "regular" as const },
    { time: "2:30 PM", type: "video" as const },
  ];

  const handleBookAppointment = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) {
      setError("Please complete all required fields");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get auth token from localStorage
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required. Please log in.");
      }

      // Construct the appointment date/time
      const now = new Date();
      const appointmentDate =
        selectedDate === "Today" ? now : new Date(now.getTime() + 86400000); // Tomorrow

      // Parse time string (e.g., "2:00 PM")
      const [time, period] = selectedTime.split(" ");
      const [hours, minutes] = time.split(":").map(Number);
      const adjustedHours =
        period === "PM" && hours !== 12
          ? hours + 12
          : period === "AM" && hours === 12
            ? 0
            : hours;

      appointmentDate.setHours(adjustedHours, minutes || 0, 0, 0);

      // Step 1: Create appointment via appointments API (real database)
      // Build comprehensive reason from intake data
      const comprehensiveReason =
        customReason || reason || chiefComplaint || "Video consultation";

      const appointmentData = {
        doctorId: selectedDoctor.id.toString(),
        scheduledTime: appointmentDate.toISOString(),
        type: "video" as const,
        reason: comprehensiveReason,

        // Enhanced intake data
        visitType,
        chiefComplaint,

        // Symptom information
        symptomDetails: {
          startDate: symptomDetails.startDate,
          duration: symptomDetails.duration,
          severity: symptomDetails.severity,
          previousTreatment: symptomDetails.previousTreatment,
          relatedMedications: symptomDetails.relatedMedications,
        },

        // Medical context
        medicalContext: {
          seenForThisBefore: medicalHistory.seenForThisBefore,
          hasAllergies: medicalHistory.hasAllergies,
          allergyDetails: medicalHistory.allergyDetails,
          currentMedications: medicalHistory.currentMedications,
          recentHospitalizations: medicalHistory.recentHospitalizations,
        },

        // Consents
        consents: {
          telehealthConsent: consents.telehealthConsent,
          emergencyUnderstanding: consents.emergencyUnderstanding,
          billingAuthorization: consents.billingAuthorization,
        },

        // Metadata
        intakeCompleted: true,
        intakeVersion: "2.0",
      };

      const scheduleResponse = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(appointmentData),
      });

      if (!scheduleResponse.ok) {
        const errorData = await scheduleResponse.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            errorData.error ||
            `Failed to schedule appointment (${scheduleResponse.status})`,
        );
      }

      const scheduleResult = await scheduleResponse.json();

      if (!scheduleResult.appointmentId) {
        throw new Error("Failed to create appointment");
      }

      const appointmentId = scheduleResult.appointmentId;
      const confirmationNumber =
        scheduleResult.confirmationNumber ||
        `CONF-${appointmentId.slice(0, 8).toUpperCase()}`;
      let meetingLink = scheduleResult.meetingLink || "";

      // Step 2: Create HCW consultation session
      let hcwUrl = meetingLink;
      try {
        const hcwResponse = await fetch(
          `/api/consultations/${appointmentId}/hcw-session`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (hcwResponse.ok) {
          const hcwResult: HcwConsultationResponse = await hcwResponse.json();
          hcwUrl = hcwResult.hcwUrl || meetingLink;
        } else {
          // HCW session creation failed, but appointment is still valid
          console.warn(
            "HCW consultation session creation failed, using fallback URL",
          );
        }
      } catch (hcwError) {
        // Non-critical error - appointment is still created
        console.error("Error creating HCW session:", hcwError);
      }

      // Step 3: Send appointment confirmation notification (optional)
      try {
        await fetch("/api/notifications/appointment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            appointmentId,
            type: "confirmation",
          }),
        });
      } catch (notificationError) {
        // Non-critical error - appointment is still created
        console.error("Failed to send notification:", notificationError);
      }

      // Save appointment details and move to confirmation
      setAppointmentDetails({
        appointmentId,
        confirmationNumber,
        meetingLink: hcwUrl,
      });

      // Clear form
      setReason("");

      // Move to confirmation step (now step 8)
      setStep(8);
    } catch (err) {
      console.error("Appointment booking error:", err);

      // Handle different error types
      if (err instanceof Error) {
        if (err.message.includes("Authentication")) {
          setError(
            "Session expired. Please log in again to book an appointment.",
          );
        } else if (
          err.message.includes("network") ||
          err.message.includes("fetch")
        ) {
          setError(
            "Network error. Please check your internet connection and try again.",
          );
        } else {
          setError(err.message);
        }
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 8) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Appointment Confirmed!
            </h1>
            <p className="text-muted-foreground mb-6">
              Your appointment has been successfully scheduled.
            </p>

            <Card className="max-w-2xl mx-auto mb-6">
              <CardHeader>
                <CardTitle>Appointment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                      Visit Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Visit Type:
                        </span>
                        <span className="font-medium capitalize">
                          {visitType.replace("_", " ")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Reason:</span>
                        <span className="font-medium">
                          {chiefComplaint.replace("_", " ")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Consultation Type:
                        </span>
                        <span className="font-medium">Video Call</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                      Appointment Time
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Provider:</span>
                        <span className="font-medium">
                          {selectedDoctor?.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date:</span>
                        <span className="font-medium">{selectedDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Time:</span>
                        <span className="font-medium">{selectedTime}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {appointmentDetails?.confirmationNumber && (
                  <div className="pt-4 border-t">
                    <div className="bg-primary/5 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Confirmation Number:
                        </span>
                        <span className="text-lg font-bold font-mono text-primary">
                          {appointmentDetails.confirmationNumber}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Save this number for your records
                      </p>
                    </div>
                  </div>
                )}

                {appointmentDetails?.meetingLink && (
                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium mb-2">
                      Video Consultation Link:
                    </p>
                    <a
                      href={appointmentDetails.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 underline break-all"
                    >
                      <Video className="w-4 h-4" />
                      Join Video Call
                    </a>
                    <p className="text-xs text-muted-foreground mt-2">
                      You can also access this link from your appointment
                      confirmation email
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Preparation Reminder */}
            <Card className="max-w-2xl mx-auto mb-6 border-blue-200 bg-blue-50 dark:bg-blue-900/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-600" />
                  Before Your Appointment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Have your list of current medications ready</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>
                      Prepare any questions you want to ask your provider
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>
                      Test your camera and microphone 5 minutes before the call
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>
                      Find a quiet, private location with good lighting
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>
                      Have your insurance card and photo ID available for
                      verification
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <div className="flex gap-4 justify-center">
              <Button asChild>
                <Link to="/dashboard">Back to Dashboard</Link>
              </Button>
              <Button variant="outline">Add to Calendar</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Schedule Appointment
            </h1>
            <p className="text-muted-foreground">
              Complete our comprehensive intake process to schedule your
              healthcare visit
            </p>
          </div>
        </div>

        {/* Progress Indicator */}
        <SchedulingProgressIndicator
          currentStep={step}
          totalSteps={totalSteps}
        />

        {/* Step 1: Visit Type Selection */}
        {step === 1 && (
          <div className="space-y-6">
            <VisitTypeSelector selected={visitType} onChange={setVisitType} />

            <div className="flex justify-end">
              <Button
                onClick={() => {
                  setStep(2);
                  setError(null);
                }}
                disabled={!visitType}
                size="lg"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Chief Complaint */}
        {step === 2 && (
          <div className="space-y-6">
            <ChiefComplaintSelector
              selected={chiefComplaint}
              onChange={setChiefComplaint}
              visitType={visitType}
              customReason={customReason}
              onCustomReasonChange={setCustomReason}
            />

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  setStep(1);
                  setError(null);
                }}
              >
                Back
              </Button>
              <Button
                onClick={() => {
                  setStep(3);
                  setError(null);
                }}
                disabled={
                  !chiefComplaint ||
                  (chiefComplaint === "other" && !customReason.trim())
                }
                size="lg"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Symptom Details */}
        {step === 3 && (
          <div className="space-y-6">
            <SymptomDetailsForm
              data={symptomDetails}
              onUpdate={setSymptomDetails}
            />

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  setStep(2);
                  setError(null);
                }}
              >
                Back
              </Button>
              <Button
                onClick={() => {
                  setStep(4);
                  setError(null);
                }}
                size="lg"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Medical History */}
        {step === 4 && (
          <div className="space-y-6">
            <MedicalHistoryQuickForm
              data={medicalHistory}
              onUpdate={setMedicalHistory}
            />

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  setStep(3);
                  setError(null);
                }}
              >
                Back
              </Button>
              <Button
                onClick={() => {
                  setStep(5);
                  setError(null);
                }}
                disabled={
                  medicalHistory.hasAllergies === "yes" &&
                  !medicalHistory.allergyDetails.trim()
                }
                size="lg"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 5: Choose Doctor */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Choose Your Doctor</h2>
              <Badge className="bg-blue-100 text-blue-700">
                {visitType.replace("_", " ")}
              </Badge>
            </div>

            {/* Loading State */}
            {isLoadingDoctors && (
              <div className="grid gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="p-4">
                    <div className="flex items-start gap-4">
                      <Skeleton className="h-16 w-16 rounded-full flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                        <Skeleton className="h-3 w-2/3" />
                        <div className="flex gap-2 mt-3">
                          <Skeleton className="h-6 w-16" />
                          <Skeleton className="h-6 w-20" />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Error State */}
            {doctorsError && !isLoadingDoctors && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{doctorsError}</AlertDescription>
              </Alert>
            )}

            {/* Empty State */}
            {!isLoadingDoctors && !doctorsError && doctors.length === 0 && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>No doctors available</AlertTitle>
                <AlertDescription>
                  There are no doctors available for video consultations at this
                  time. Please check back later or contact support.
                </AlertDescription>
              </Alert>
            )}

            {/* Doctors List */}
            {!isLoadingDoctors && !doctorsError && doctors.length > 0 && (
              <div className="grid gap-4">
                {doctors.map((doctor) => (
                  <DoctorCard
                    key={doctor.id}
                    doctor={doctor}
                    isSelected={selectedDoctor?.id === doctor.id}
                    onSelect={() => setSelectedDoctor(doctor)}
                  />
                ))}
              </div>
            )}

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  setStep(4);
                  setError(null);
                }}
              >
                Back
              </Button>
              <Button
                onClick={() => {
                  setStep(6);
                  setError(null);
                }}
                disabled={!selectedDoctor || isLoadingDoctors}
                size="lg"
              >
                Continue to Scheduling
              </Button>
            </div>
          </div>
        )}

        {/* Step 6: Choose Date & Time */}
        {step === 6 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Select Date & Time</h2>
              <p className="text-muted-foreground">
                Dr. {selectedDoctor?.name} - {selectedDoctor?.specialty}
              </p>
            </div>

            {/* Date Selection */}
            <div className="space-y-4">
              <h3 className="font-medium">Available Dates</h3>
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedDate("Today")}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedDate === "Today"
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="text-center">
                    <div className="font-semibold">Today</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date().toLocaleDateString()}
                    </div>
                    <Badge variant="destructive" className="mt-1 text-xs">
                      Urgent
                    </Badge>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedDate("Tomorrow")}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedDate === "Tomorrow"
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="text-center">
                    <div className="font-semibold">Tomorrow</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(Date.now() + 86400000).toLocaleDateString()}
                    </div>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      Regular
                    </Badge>
                  </div>
                </button>
              </div>
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <div className="space-y-4">
                <h3 className="font-medium">Available Times</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {(selectedDate === "Today" ? todaySlots : tomorrowSlots).map(
                    (slot, idx) => (
                      <TimeSlot
                        key={idx}
                        time={slot.time}
                        type={slot.type}
                        isSelected={selectedTime === slot.time}
                        onSelect={() => setSelectedTime(slot.time)}
                      />
                    ),
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  setStep(5);
                  setError(null);
                }}
              >
                Back
              </Button>
              <Button
                onClick={() => {
                  setStep(7);
                  setError(null);
                }}
                disabled={!selectedDate || !selectedTime}
                size="lg"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 7: Pre-Visit Instructions & Consents */}
        {step === 7 && (
          <div className="space-y-6">
            <PreVisitInstructions
              visitType={visitType}
              appointmentType="video"
              consents={consents}
              onConsentChange={setConsents}
            />

            {/* Summary Card */}
            <Card className="border-2 border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-lg">Appointment Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Visit Type:</span>
                      <span className="font-medium capitalize">
                        {visitType.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Reason:</span>
                      <span className="font-medium">
                        {chiefComplaint.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Provider:</span>
                      <span className="font-medium">
                        {selectedDoctor?.name}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date:</span>
                      <span className="font-medium">{selectedDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time:</span>
                      <span className="font-medium">{selectedTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="font-medium">Video Consultation</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Error Display */}
            {error && (
              <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-red-900 dark:text-red-100 mb-1">
                        Booking Failed
                      </h3>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        {error}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  setStep(6);
                  setError(null);
                }}
                disabled={isLoading}
              >
                Back
              </Button>
              <Button
                onClick={handleBookAppointment}
                size="lg"
                disabled={
                  isLoading ||
                  !consents.telehealthConsent ||
                  !consents.emergencyUnderstanding ||
                  !consents.billingAuthorization
                }
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Booking Appointment...
                  </>
                ) : (
                  "Confirm & Book Appointment"
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
