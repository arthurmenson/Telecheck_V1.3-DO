import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Video,
  Phone,
  MessageCircle,
  Calendar,
  Users,
  Clock,
  Wifi,
  Settings,
  Monitor,
  Headphones,
  Camera,
  Mic,
  MicOff,
  VideoOff,
  Volume2,
  Share,
  FileText,
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  RotateCcw
} from "lucide-react";

export function Telehealth() {
  const [isInSession, setIsInSession] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const upcomingSessions = [
    {
      id: 1,
      patient: "Sarah Johnson",
      time: "10:00 AM",
      duration: "30 min",
      type: "Follow-up",
      status: "Scheduled",
      platform: "Video Call"
    },
    {
      id: 2,
      patient: "Michael Chen",
      time: "11:30 AM",
      duration: "45 min",
      type: "Consultation",
      status: "Pending",
      platform: "Phone Call"
    },
    {
      id: 3,
      patient: "Emma Wilson",
      time: "02:00 PM",
      duration: "20 min",
      type: "Check-in",
      status: "Confirmed",
      platform: "Video Call"
    }
  ];

  const recentSessions = [
    {
      patient: "James Rodriguez",
      date: "Today, 9:00 AM",
      duration: "25 min",
      outcome: "Completed",
      notes: "Patient reported improvement in symptoms"
    },
    {
      patient: "Lisa Thompson",
      date: "Yesterday, 3:30 PM",
      duration: "40 min",
      outcome: "Completed",
      notes: "Follow-up scheduled for next week"
    },
    {
      patient: "David Kim",
      date: "Yesterday, 2:00 PM",
      duration: "30 min",
      outcome: "Completed",
      notes: "Prescription updated"
    }
  ];

  const platformStats = [
    { platform: "Video Calls", sessions: 156, percentage: 65 },
    { platform: "Phone Calls", sessions: 67, percentage: 28 },
    { platform: "Chat Sessions", sessions: 17, percentage: 7 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'bg-blue-100 text-blue-800';
      case 'Confirmed': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Completed': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Telehealth Platform
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Virtual consultations and remote patient care
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-green-100 text-green-800">
            <Wifi className="w-4 h-4 mr-1" />
            Online
          </Badge>
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button>
            <Video className="w-4 h-4 mr-2" />
            Start Session
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Video className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">47</div>
            <div className="text-sm text-gray-600">Active Sessions Today</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">240</div>
            <div className="text-sm text-gray-600">Total Patients</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">4.2h</div>
            <div className="text-sm text-gray-600">Total Session Time</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">98%</div>
            <div className="text-sm text-gray-600">Connection Quality</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Virtual Session Interface */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              Session Interface
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Video Preview */}
              <div className="aspect-video bg-gray-900 rounded-lg relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Camera Preview</p>
                    <p className="text-sm opacity-75">Ready to start session</p>
                  </div>
                </div>
                {/* Connection Status */}
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 rounded-lg px-3 py-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-white text-sm">HD Quality</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant={isMuted ? "destructive" : "outline"}
                  size="lg"
                  onClick={() => setIsMuted(!isMuted)}
                  className="rounded-full w-14 h-14"
                >
                  {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </Button>
                <Button
                  variant={isVideoOff ? "destructive" : "outline"}
                  size="lg"
                  onClick={() => setIsVideoOff(!isVideoOff)}
                  className="rounded-full w-14 h-14"
                >
                  {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                </Button>
                <Button variant="outline" size="lg" className="rounded-full w-14 h-14">
                  <Volume2 className="w-6 h-6" />
                </Button>
                <Button variant="outline" size="lg" className="rounded-full w-14 h-14">
                  <Share className="w-6 h-6" />
                </Button>
              </div>

              {/* Session Tools */}
              <div className="flex items-center justify-between pt-4 border-t">
                <Button variant="outline" size="sm">
                  <FileText className="w-4 h-4 mr-2" />
                  Notes
                </Button>
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Share File
                </Button>
                <Button variant="outline" size="sm">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Record
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Upcoming Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingSessions.map((session) => (
                <div key={session.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{session.patient}</span>
                        <Badge className={getStatusColor(session.status)}>
                          {session.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {session.time} • {session.duration} • {session.type}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        {session.platform === 'Video Call' ? (
                          <Video className="w-4 h-4 text-blue-500" />
                        ) : (
                          <Phone className="w-4 h-4 text-green-500" />
                        )}
                        <span>{session.platform}</span>
                      </div>
                    </div>
                    <Button size="sm">
                      Join
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Usage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="w-5 h-5" />
            Platform Usage Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {platformStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {stat.sessions}
                </div>
                <div className="text-sm text-gray-600 mb-3">{stat.platform}</div>
                <Progress value={stat.percentage} className="h-2" />
                <div className="text-xs text-gray-500 mt-1">{stat.percentage}% of total</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentSessions.map((session, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="font-medium">{session.patient}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {session.date} • {session.duration}
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      {session.notes}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(session.outcome)}>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {session.outcome}
                    </Badge>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
