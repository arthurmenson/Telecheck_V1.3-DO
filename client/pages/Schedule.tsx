import React, { useState } from "react";
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
} from "lucide-react";
import { Link } from "react-router-dom";

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
}

// Doctor Card Component
const DoctorCard = ({
  doctor,
  onSelect,
  isSelected = false,
}: {
  doctor: any;
  onSelect: () => void;
  isSelected?: boolean;
}) => {
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
                  <span className="text-xs font-medium">{doctor.rating}</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {doctor.experience}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Next available: {doctor.nextAvailable}
                </span>
              </div>

              {doctor.urgentSlots && (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-3 h-3 text-orange-500" />
                  <span className="text-xs text-orange-600">
                    {doctor.urgentSlots} urgent slots today
                  </span>
                </div>
              )}

              <div className="flex gap-2 mt-3">
                {doctor.hasVideo && (
                  <Badge variant="outline" className="text-xs">
                    <Video className="w-3 h-3 mr-1" />
                    Video
                  </Badge>
                )}
                {doctor.hasInPerson && (
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
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [appointmentType, setAppointmentType] = useState("urgent");
  const [reason, setReason] = useState("");
  const [step, setStep] = useState(1);

  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appointmentDetails, setAppointmentDetails] = useState<{
    appointmentId: string;
    confirmationNumber: string;
    meetingLink?: string;
  } | null>(null);

  // Mock doctors data with urgent availability
  const doctors = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      specialty: "Cardiologist",
      location: "Heart Care Center, Downtown",
      rating: 4.9,
      experience: "15+ years",
      nextAvailable: "Today 2:00 PM",
      urgentSlots: 3,
      hasVideo: true,
      hasInPerson: true,
      specializes: ["High Cholesterol", "Heart Disease", "Drug Interactions"],
    },
    {
      id: 2,
      name: "Dr. Michael Chen",
      specialty: "Internal Medicine",
      location: "Medical Plaza, Main St",
      rating: 4.8,
      experience: "12+ years",
      nextAvailable: "Tomorrow 9:00 AM",
      urgentSlots: 1,
      hasVideo: true,
      hasInPerson: true,
      specializes: ["Preventive Care", "Medication Management", "Lab Review"],
    },
    {
      id: 3,
      name: "Dr. Emily Rodriguez",
      specialty: "Endocrinologist",
      location: "Diabetes & Hormone Center",
      rating: 4.9,
      experience: "18+ years",
      nextAvailable: "Today 4:30 PM",
      urgentSlots: 2,
      hasVideo: true,
      hasInPerson: false,
      specializes: ["Diabetes", "Metabolic Disorders", "Hormone Therapy"],
    },
  ];

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

      // Step 1: Create appointment via telemedicine API
      const appointmentData: AppointmentData = {
        providerId: selectedDoctor.id.toString(),
        userId: "user-1", // TODO: Get from auth context
        dateTime: appointmentDate.toISOString(),
        type: "video",
        reason: reason || "Video consultation",
        duration: 30, // 30 minute consultation
      };

      const scheduleResponse = await fetch("/api/telemedicine/schedule", {
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
          errorData.error ||
            `Failed to schedule appointment (${scheduleResponse.status})`,
        );
      }

      const scheduleResult: ScheduleAppointmentResponse =
        await scheduleResponse.json();

      if (!scheduleResult.success || !scheduleResult.data) {
        throw new Error(scheduleResult.error || "Failed to create appointment");
      }

      const { appointmentId, confirmationNumber, meetingLink } =
        scheduleResult.data;

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
        await fetch("/api/messaging/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            patientId: appointmentData.userId,
            type: "appointment_confirmation",
            channel: "sms",
            message: `Your appointment with ${selectedDoctor.name} is confirmed for ${selectedDate} at ${selectedTime}. Confirmation: ${confirmationNumber}`,
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

      // Move to confirmation step
      setStep(4);
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

  if (step === 4) {
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

            <Card className="max-w-md mx-auto mb-6">
              <CardContent className="p-6">
                <div className="space-y-3 text-left">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Doctor:</span>
                    <span className="font-medium">{selectedDoctor?.name}</span>
                  </div>
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
                  {appointmentDetails?.confirmationNumber && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Confirmation:
                      </span>
                      <span className="font-medium font-mono">
                        {appointmentDetails.confirmationNumber}
                      </span>
                    </div>
                  )}
                </div>

                {appointmentDetails?.meetingLink && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">
                      Video Consultation Link:
                    </p>
                    <a
                      href={appointmentDetails.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-700 underline break-all"
                    >
                      {appointmentDetails.meetingLink}
                    </a>
                  </div>
                )}
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
              Book urgent consultation for lab results and medication review
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-4 mb-8">
          {[1, 2, 3].map((num) => (
            <div key={num} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= num
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {num}
              </div>
              {num < 3 && (
                <div
                  className={`w-12 h-0.5 mx-2 ${
                    step > num ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Choose Doctor */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Choose Your Doctor</h2>
              <Badge className="bg-red-100 text-red-700">
                Based on your recent lab results
              </Badge>
            </div>

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

            <div className="flex justify-end">
              <Button
                onClick={() => {
                  setStep(2);
                  setError(null);
                }}
                disabled={!selectedDoctor}
                size="lg"
              >
                Continue to Scheduling
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Choose Date & Time */}
        {step === 2 && (
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
                disabled={!selectedDate || !selectedTime}
                size="lg"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Appointment Details */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Appointment Details</h2>

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

            <Card>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-4">Appointment Summary</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Doctor:</span>
                        <span>{selectedDoctor?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Specialty:
                        </span>
                        <span>{selectedDoctor?.specialty}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date:</span>
                        <span>{selectedDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Time:</span>
                        <span>{selectedTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <span>
                          {selectedDate === "Today"
                            ? "Urgent Consultation"
                            : "Regular Visit"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-4">Reason for Visit</h3>
                    <Textarea
                      placeholder="Describe your symptoms or concerns (e.g., discuss lab results, medication interactions, follow-up on cholesterol...)"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="h-32"
                    />

                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Shield className="w-4 h-4 text-blue-600 mt-0.5" />
                        <div className="text-sm">
                          <div className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                            Pre-visit Preparation
                          </div>
                          <div className="text-blue-700 dark:text-blue-300">
                            Your recent lab results and medication list will be
                            automatically shared with the doctor before your
                            appointment.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  setStep(2);
                  setError(null);
                }}
                disabled={isLoading}
              >
                Back
              </Button>
              <Button
                onClick={handleBookAppointment}
                size="lg"
                disabled={isLoading || !reason.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Booking...
                  </>
                ) : (
                  "Book Appointment"
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
