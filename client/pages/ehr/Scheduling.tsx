import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  MapPin,
  Phone,
  Video,
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Users,
  Stethoscope,
} from "lucide-react";

export function Scheduling() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day");

  const appointments = [
    {
      id: 1,
      time: "09:00 AM",
      duration: "30 min",
      patient: "Sarah Johnson",
      type: "Follow-up",
      provider: "Dr. Smith",
      room: "Room 101",
      status: "confirmed",
      isVirtual: false,
    },
    {
      id: 2,
      time: "10:00 AM",
      duration: "45 min",
      patient: "Michael Chen",
      type: "Consultation",
      provider: "Dr. Smith",
      room: "Virtual",
      status: "pending",
      isVirtual: true,
    },
    {
      id: 3,
      time: "11:30 AM",
      duration: "20 min",
      patient: "Emma Wilson",
      type: "Check-up",
      provider: "Dr. Smith",
      room: "Room 102",
      status: "confirmed",
      isVirtual: false,
    },
    {
      id: 4,
      time: "02:00 PM",
      duration: "60 min",
      patient: "James Rodriguez",
      type: "Physical Exam",
      provider: "Dr. Smith",
      room: "Room 101",
      status: "confirmed",
      isVirtual: false,
    },
  ];

  const providers = [
    { name: "Dr. Smith", specialty: "Internal Medicine", available: true },
    { name: "Dr. Johnson", specialty: "Cardiology", available: false },
    { name: "Dr. Williams", specialty: "Dermatology", available: true },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return CheckCircle;
      case "pending":
        return Clock;
      case "cancelled":
        return AlertCircle;
      default:
        return Clock;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Scheduling
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage appointments and provider schedules
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Search className="w-4 h-4 mr-2" />
            Search Patients
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Appointment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar and Controls */}
        <div className="lg:col-span-1 space-y-6">
          {/* Calendar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                Calendar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md"
              />
            </CardContent>
          </Card>

          {/* Provider Availability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5" />
                Provider Availability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {providers.map((provider, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{provider.name}</div>
                      <div className="text-sm text-gray-600">
                        {provider.specialty}
                      </div>
                    </div>
                    <Badge
                      className={
                        provider.available
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }
                    >
                      {provider.available ? "Available" : "Busy"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Schedule View */}
        <div className="lg:col-span-2 space-y-6">
          {/* View Controls */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="font-medium">
                    {selectedDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  <Button variant="outline" size="sm">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === "day" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("day")}
                  >
                    Day
                  </Button>
                  <Button
                    variant={viewMode === "week" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("week")}
                  >
                    Week
                  </Button>
                  <Button
                    variant={viewMode === "month" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("month")}
                  >
                    Month
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appointments List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Today's Appointments
                </span>
                <Badge variant="secondary">
                  {appointments.length} appointments
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments.map((appointment) => {
                  const StatusIcon = getStatusIcon(appointment.status);
                  return (
                    <div
                      key={appointment.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="text-center">
                            <div className="text-lg font-bold text-blue-600">
                              {appointment.time}
                            </div>
                            <div className="text-sm text-gray-500">
                              {appointment.duration}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-500" />
                              <span className="font-medium">
                                {appointment.patient}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Stethoscope className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-600">
                                {appointment.type}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {appointment.isVirtual ? (
                                <Video className="w-4 h-4 text-gray-500" />
                              ) : (
                                <MapPin className="w-4 h-4 text-gray-500" />
                              )}
                              <span className="text-sm text-gray-600">
                                {appointment.room}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(appointment.status)}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {appointment.status}
                          </Badge>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-blue-600">8</div>
                <div className="text-sm text-gray-600">
                  Today's Appointments
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-green-600">95%</div>
                <div className="text-sm text-gray-600">Show-up Rate</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-purple-600">2.5h</div>
                <div className="text-sm text-gray-600">Available Slots</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
