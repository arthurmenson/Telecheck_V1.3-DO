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
} from "lucide-react";
import { Link } from "react-router-dom";

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

  const handleBookAppointment = () => {
    // Here you would integrate with your booking system
    alert(
      `Appointment booked with ${selectedDoctor.name} on ${selectedDate} at ${selectedTime}`,
    );
    setStep(4); // Confirmation step
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
                    <span className="font-medium">
                      {appointmentType === "urgent"
                        ? "Urgent Consultation"
                        : "Regular Visit"}
                    </span>
                  </div>
                </div>
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
                onClick={() => setStep(2)}
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
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
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
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button onClick={handleBookAppointment} size="lg">
                Book Appointment
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
