import React, { useState, useEffect, useMemo } from "react";
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
  useUserProfile,
  useTelemedicineProviders,
  useBookAppointment,
  useCreateHcwSession,
} from "../hooks/api";
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

  const {
    data: doctors = [],
    isLoading: isLoadingDoctors,
    isFetching: isFetchingDoctors,
    error: providersError,
  } = useTelemedicineProviders({ videoEnabled: true }, { enabled: step >= 5 });

  const doctorsError =
    providersError instanceof Error
      ? providersError.message
      : providersError
        ? "Unable to load doctors. Please try again later."
        : null;

  const providersLoading = isLoadingDoctors || isFetchingDoctors;

  const { data: currentUser } = useUserProfile();
  const bookAppointmentMutation = useBookAppointment();
  const createHcwSessionMutation = useCreateHcwSession();

  const availableDates = useMemo(() => {
    if (!selectedDoctor?.availability) {
      return [];
    }
    return selectedDoctor.availability.filter((day) => day.slots.length > 0);
  }, [selectedDoctor]);

  useEffect(() => {
    if (!selectedDoctor) {
      setSelectedDate("");
      setSelectedTime("");
      return;
    }

    if (availableDates.length === 0) {
      setSelectedDate("");
      setSelectedTime("");
      return;
    }

    setSelectedDate((prevDate) => {
      if (prevDate && availableDates.some((day) => day.date === prevDate)) {
        return prevDate;
      }
      return availableDates[0].date;
    });
  }, [selectedDoctor, availableDates]);

  useEffect(() => {
    if (!selectedDate) {
      setSelectedTime("");
      return;
    }

    const day = availableDates.find(
      (availability) => availability.date === selectedDate,
    );
    if (!day || day.slots.length === 0) {
      setSelectedTime("");
      return;
    }

    setSelectedTime((previous) =>
      previous && day.slots.includes(previous)
        ? previous
        : (day.slots[0] ?? ""),
    );
  }, [selectedDate, availableDates]);

  const slotsForSelectedDate = useMemo(() => {
    if (!selectedDate) {
      return [];
    }
    const day = availableDates.find(
      (availability) => availability.date === selectedDate,
    );
    return day?.slots ?? [];
  }, [availableDates, selectedDate]);

  const getDateLabel = (date: string): string => {
    const today = new Date();
    const todayIso = today.toISOString().slice(0, 10);
    const tomorrowIso = new Date(today.getTime() + 86400000)
      .toISOString()
      .slice(0, 10);

    if (date === todayIso) {
      return "Today";
    }
    if (date === tomorrowIso) {
      return "Tomorrow";
    }

    const formatter = new Intl.DateTimeFormat(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    return formatter.format(new Date(`${date}T00:00:00`));
  };

  const getTimeLabel = (slot: string): string => {
    const [hours, minutes] = slot.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  };

  const handleBookAppointment = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) {
      setError("Please complete all required fields");
      return;
    }

    if (!currentUser?.id) {
      setError("Session expired. Please log in again to continue.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [year, month, day] = selectedDate.split("-").map(Number);
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const scheduledDate = new Date(
        year,
        month - 1,
        day,
        hours,
        minutes ?? 0,
        0,
        0,
      );

      const comprehensiveReason =
        customReason || reason || chiefComplaint || "Video consultation";

      const appointmentPayload: CreateAppointmentPayload = {
        patientId: currentUser.id,
        doctorId: selectedDoctor.id,
        scheduledTime: scheduledDate.toISOString(),
        type: "video",
        reason: comprehensiveReason,
        visitType,
        chiefComplaint,
        symptomDetails,
        medicalContext: medicalHistory,
        consents,
        intakeCompleted: true,
        intakeVersion: "2.0",
      };

      const appointmentResponse =
        await bookAppointmentMutation.mutateAsync(appointmentPayload);
      const appointmentResult =
        appointmentResponse.data ?? (appointmentResponse as any);

      const appointmentId =
        appointmentResult?.appointmentId ?? appointmentResult?.appointment?.id;

      if (!appointmentId) {
        throw new Error("Failed to create appointment");
      }

      const confirmationNumber =
        appointmentResult?.confirmationNumber ??
        appointmentResult?.appointment?.confirmationNumber ??
        `CONF-${appointmentId.slice(0, 8).toUpperCase()}`;

      let meetingLink =
        appointmentResult?.meetingLink ??
        appointmentResult?.appointment?.meetingLink ??
        "";

      try {
        const hcwResponse =
          await createHcwSessionMutation.mutateAsync(appointmentId);
        const hcwResult = hcwResponse.data ?? (hcwResponse as any);
        if (hcwResult?.hcwUrl) {
          meetingLink = hcwResult.hcwUrl;
        }
      } catch (hcwError) {
        console.error("Error creating HCW session:", hcwError);
      }

      setAppointmentDetails({
        appointmentId,
        confirmationNumber,
        meetingLink,
      });

      setReason("");
      setStep(8);
    } catch (err) {
      console.error("Appointment booking error:", err);
      if (err instanceof Error) {
        if (err.message.toLowerCase().includes("network")) {
          setError(
            "Network error. Please check your connection and try again.",
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
                        <span className="font-medium">
                          {selectedDate ? getDateLabel(selectedDate) : "---"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Time:</span>
                        <span className="font-medium">
                          {selectedTime ? getTimeLabel(selectedTime) : "---"}
                        </span>
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
            {providersLoading && (
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
            {doctorsError && !providersLoading && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{doctorsError}</AlertDescription>
              </Alert>
            )}

            {/* Empty State */}
            {!providersLoading && !doctorsError && doctors.length === 0 && (
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
            {!providersLoading && !doctorsError && doctors.length > 0 && (
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
                disabled={!selectedDoctor || providersLoading}
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
                Dr. {selectedDoctor?.name} — {selectedDoctor?.specialty}
              </p>
            </div>

            {availableDates.length === 0 ? (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>No availability</AlertTitle>
                <AlertDescription>
                  This provider does not have any telehealth slots in the next
                  week. Please go back and select a different provider.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="space-y-4">
                  <h3 className="font-medium">Available Dates</h3>
                  <div className="flex gap-3 flex-wrap">
                    {availableDates.map((day) => (
                      <button
                        key={day.date}
                        onClick={() => setSelectedDate(day.date)}
                        className={`p-4 rounded-lg border-2 transition-all min-w-[160px] ${selectedDate === day.date ? "border-primary ring-2 ring-primary/20 bg-primary/5" : "border-gray-200 hover:border-gray-300"}`}
                      >
                        <div className="text-center space-y-1">
                          <div className="font-semibold">
                            {getDateLabel(day.date)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(
                              `${day.date}T00:00:00`,
                            ).toLocaleDateString()}
                          </div>
                          <Badge
                            variant={
                              selectedDate === day.date
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {day.slots.length} slots
                          </Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Available Times</h3>
                  {slotsForSelectedDate.length === 0 ? (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertTitle>No times available</AlertTitle>
                      <AlertDescription>
                        All slots for {getDateLabel(selectedDate)} are booked.
                        Please choose another date.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {slotsForSelectedDate.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setSelectedTime(slot)}
                          className={`p-4 rounded-lg border-2 transition-all text-left ${selectedTime === slot ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-gray-200 hover-border-gray-300"}`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-semibold">
                                {getTimeLabel(slot)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                30 min video visit
                              </div>
                            </div>
                            <Badge
                              variant="secondary"
                              className="text-xs uppercase"
                            >
                              Video
                            </Badge>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="flex items-center gap-4 bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-900">
              <Clock className="w-6 h-6" />
              <div>
                <p className="font-medium">Video Visit Duration</p>
                <p className="text-sm">
                  Each telehealth visit includes 25 minutes with your provider
                  and a 5-minute wrap-up for care plan review.
                </p>
              </div>
            </div>

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
                      <span className="font-medium">
                        {selectedDate ? getDateLabel(selectedDate) : "---"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time:</span>
                      <span className="font-medium">
                        {selectedTime ? getTimeLabel(selectedTime) : "---"}
                      </span>
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
