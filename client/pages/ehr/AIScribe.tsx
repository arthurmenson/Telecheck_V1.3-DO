import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { FeatureExplainer, presets } from "../../components/FeatureExplainer";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import {
  Brain,
  Mic,
  MicOff,
  Play,
  Pause,
  Square,
  FileText,
  Download,
  Save,
  Edit,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Upload,
  Settings,
  Volume2,
  Eye,
  Copy,
  Share,
  Sparkles,
  Zap,
  Activity,
  Users,
  Calendar,
  Star,
  BarChart3,
} from "lucide-react";
import { Link } from "react-router-dom";

// Mock transcription data
const recentTranscriptions = [
  {
    id: "TR001",
    patientName: "Sarah Johnson",
    provider: "Dr. Smith",
    date: "2024-02-15",
    time: "10:30 AM",
    duration: "12:45",
    status: "completed",
    confidence: 96,
    type: "Office Visit",
    specialty: "Internal Medicine",
  },
  {
    id: "TR002",
    patientName: "Michael Chen",
    provider: "Dr. Williams",
    date: "2024-02-15",
    time: "2:15 PM",
    duration: "8:23",
    status: "in-progress",
    confidence: 94,
    type: "Follow-up",
    specialty: "Cardiology",
  },
  {
    id: "TR003",
    patientName: "Emily Rodriguez",
    provider: "Dr. Johnson",
    date: "2024-02-15",
    time: "3:45 PM",
    duration: "15:12",
    status: "review",
    confidence: 98,
    type: "Consultation",
    specialty: "Dermatology",
  },
];

const scribeStats = [
  {
    title: "Today's Transcriptions",
    value: "24",
    change: "+18% vs yesterday",
    icon: Mic,
    color: "#10b981",
  },
  {
    title: "Avg. Accuracy",
    value: "96.5%",
    change: "+2.1% this week",
    icon: Brain,
    color: "#3b82f6",
  },
  {
    title: "Time Saved",
    value: "4.2 hrs",
    change: "Per provider today",
    icon: Clock,
    color: "#f59e0b",
  },
  {
    title: "Auto-Generated Notes",
    value: "156",
    change: "+23 completed",
    icon: FileText,
    color: "#ef4444",
  },
];

export function AIScribe() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [selectedTranscription, setSelectedTranscription] = useState<any>(null);

  // Simulate recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, isPaused]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const startRecording = () => {
    setIsRecording(true);
    setIsPaused(false);
    setRecordingTime(0);
    setCurrentTranscript("");
  };

  const pauseRecording = () => {
    setIsPaused(!isPaused);
  };

  const stopRecording = () => {
    setIsRecording(false);
    setIsPaused(false);
    // Simulate AI processing
    setTimeout(() => {
      setCurrentTranscript(
        "Patient presents with chief complaint of chest pain that started this morning. Pain is described as sharp, 7/10 intensity, located in the center of the chest. No radiation to arms or jaw. Associated with shortness of breath but no nausea or diaphoresis. No recent trauma or exertional triggers noted...",
      );
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link to="/ehr">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to EHR
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Brain className="w-8 h-8 text-primary" />
                AI Medical Scribe
                <FeatureExplainer
                  {...presets.aiScribe}
                  learnMoreUrl="/docs/ai-scribe"
                  videoUrl="/demos/ai-scribe-walkthrough"
                  size="md"
                  variant="info"
                />
              </h1>
              <p className="text-muted-foreground">
                Automated medical documentation with AI transcription
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </Button>
            <Button className="gap-2">
              <Upload className="w-4 h-4" />
              Upload Audio
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {scribeStats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card key={idx}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {stat.value}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {stat.change}
                      </p>
                    </div>
                    <Icon className="w-8 h-8" style={{ color: stat.color }} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Live Recording Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="w-5 h-5 text-primary" />
                Live Recording & Transcription
                <FeatureExplainer
                  title="Live Recording & Transcription"
                  description="Real-time speech-to-text conversion with medical terminology recognition and confidence scoring."
                  features={[
                    "High-accuracy speech recognition (96%+)",
                    "Medical terminology understanding",
                    "Real-time confidence scoring",
                    "Pause/resume recording controls",
                    "Auto-punctuation and formatting",
                  ]}
                  benefits={[
                    "Instant transcription feedback",
                    "No post-processing delays",
                    "Hands-free documentation",
                    "HIPAA-compliant processing",
                  ]}
                  examples={[
                    "Record patient consultations in real-time",
                    "Get immediate feedback on transcription quality",
                    "Pause recording for sensitive discussions",
                  ]}
                  category="Voice Technology"
                  complexity="Beginner"
                  estimatedTime="2 min"
                  size="sm"
                />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Recording Controls */}
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center">
                  <div
                    className={`w-32 h-32 rounded-full flex items-center justify-center border-4 transition-all ${
                      isRecording
                        ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                        : "border-gray-300 bg-gray-50 dark:bg-gray-800"
                    }`}
                  >
                    {isRecording ? (
                      <div className="text-center">
                        <Mic className="w-8 h-8 text-red-500 mx-auto mb-2" />
                        <div className="text-lg font-bold text-red-500">
                          {formatTime(recordingTime)}
                        </div>
                      </div>
                    ) : (
                      <Mic className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3">
                  {!isRecording ? (
                    <Button
                      onClick={startRecording}
                      className="gap-2 bg-red-600 hover:bg-red-700"
                    >
                      <Mic className="w-4 h-4" />
                      Start Recording
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={pauseRecording}
                        variant="outline"
                        className="gap-2"
                      >
                        {isPaused ? (
                          <Play className="w-4 h-4" />
                        ) : (
                          <Pause className="w-4 h-4" />
                        )}
                        {isPaused ? "Resume" : "Pause"}
                      </Button>
                      <Button
                        onClick={stopRecording}
                        variant="destructive"
                        className="gap-2"
                      >
                        <Square className="w-4 h-4" />
                        Stop & Process
                      </Button>
                    </>
                  )}
                </div>

                {isRecording && (
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    {isPaused ? "Recording Paused" : "Recording in Progress"}
                  </div>
                )}
              </div>

              {/* Real-time Transcript */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Real-time Transcript
                </h4>
                <div className="min-h-32 p-4 border rounded-lg bg-muted/30">
                  {currentTranscript ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className="bg-green-100 text-green-700">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          96% Confidence
                        </Badge>
                        <Badge variant="outline">Auto-formatted</Badge>
                      </div>
                      <p className="text-sm leading-relaxed">
                        {currentTranscript}
                      </p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center">
                      {isRecording
                        ? "Listening for speech..."
                        : "Start recording to see live transcription"}
                    </p>
                  )}
                </div>

                {currentTranscript && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-1">
                      <Copy className="w-3 h-3" />
                      Copy
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1">
                      <Save className="w-3 h-3" />
                      Save Draft
                    </Button>
                    <Button size="sm" className="gap-1">
                      <Sparkles className="w-3 h-3" />
                      Generate SOAP Note
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* AI Processing Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-500" />
                AI Processing & Enhancement
                <FeatureExplainer
                  title="AI Processing & Enhancement"
                  description="Advanced AI algorithms that analyze transcribed text to generate clinical documentation, suggest codes, and identify important medical information."
                  features={[
                    "Automatic SOAP note generation",
                    "ICD-10 code suggestions",
                    "Drug interaction detection",
                    "Follow-up task creation",
                    "Clinical decision support",
                  ]}
                  benefits={[
                    "Reduce documentation time by 75%",
                    "Improve coding accuracy",
                    "Enhance patient safety",
                    "Standardize note formats",
                  ]}
                  examples={[
                    "Convert conversations into structured SOAP notes",
                    "Automatically suggest appropriate billing codes",
                    "Flag potential drug interactions mentioned",
                  ]}
                  category="Medical AI"
                  complexity="Advanced"
                  estimatedTime="Automatic processing"
                  prerequisites={[
                    "Completed transcription",
                    "Medical context understanding",
                  ]}
                  size="sm"
                />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* AI Features */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    title: "Auto SOAP Notes",
                    icon: FileText,
                    status: "active",
                  },
                  { title: "ICD-10 Coding", icon: BarChart3, status: "active" },
                  {
                    title: "Drug Interactions",
                    icon: AlertTriangle,
                    status: "active",
                  },
                  {
                    title: "Follow-up Tasks",
                    icon: CheckCircle,
                    status: "active",
                  },
                ].map((feature, idx) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={idx}
                      className="p-3 border rounded-lg text-center"
                    >
                      <Icon className="w-6 h-6 mx-auto mb-2 text-primary" />
                      <h5 className="text-sm font-medium">{feature.title}</h5>
                      <Badge
                        className={`text-xs mt-1 ${
                          feature.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {feature.status}
                      </Badge>
                    </div>
                  );
                })}
              </div>

              {/* Processing Queue */}
              <div className="space-y-3">
                <h4 className="font-medium">Processing Queue</h4>
                <div className="space-y-2">
                  {[
                    {
                      patient: "Sarah J.",
                      status: "Generating SOAP note",
                      progress: 85,
                    },
                    {
                      patient: "Michael C.",
                      status: "Extracting diagnoses",
                      progress: 60,
                    },
                    {
                      patient: "Emily R.",
                      status: "Coding procedures",
                      progress: 30,
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded"
                    >
                      <div>
                        <p className="text-sm font-medium">{item.patient}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.status}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="w-16 mb-1">
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-primary h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${item.progress}%` }}
                            ></div>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {item.progress}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <h4 className="font-medium">Quick Actions</h4>
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Audio File
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Configure Templates
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export Training Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transcriptions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Transcriptions</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export All
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Configure
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTranscriptions.map((transcription) => (
                <div
                  key={transcription.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Mic className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">
                        {transcription.patientName}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {transcription.provider} • {transcription.specialty}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Type</p>
                      <p className="font-medium">{transcription.type}</p>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="font-medium">{transcription.duration}</p>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        Confidence
                      </p>
                      <div className="flex items-center gap-1">
                        <div className="w-12 h-1.5 bg-gray-200 rounded-full">
                          <div
                            className="h-1.5 bg-green-500 rounded-full"
                            style={{ width: `${transcription.confidence}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">
                          {transcription.confidence}%
                        </span>
                      </div>
                    </div>

                    <Badge
                      className={
                        transcription.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : transcription.status === "in-progress"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                      }
                    >
                      {transcription.status.replace("-", " ")}
                    </Badge>

                    <div className="flex gap-1">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
