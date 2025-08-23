import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { FeatureExplainer } from "./FeatureExplainer";
import {
  Brain,
  Mic,
  MicOff,
  Play,
  Pause,
  Square,
  FileText,
  Save,
  CheckCircle,
  Clock,
  Volume2,
  Copy,
  Sparkles,
  Maximize2,
  Minimize2,
  Settings,
  Download,
  AlertCircle,
} from "lucide-react";

interface CompactAIScribeProps {
  patientName?: string;
  appointmentType?: string;
  onTranscriptionComplete?: (transcript: string, soapNote?: string) => void;
  className?: string;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export function CompactAIScribe({
  patientName = "Current Patient",
  appointmentType = "Consultation",
  onTranscriptionComplete,
  className = "",
  isExpanded = false,
  onToggleExpand
}: CompactAIScribeProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [generatedSOAP, setGeneratedSOAP] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Simulate recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, isPaused]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = () => {
    setIsRecording(true);
    setIsPaused(false);
    setRecordingTime(0);
    setCurrentTranscript("");
    setGeneratedSOAP("");
    setConfidence(0);
  };

  const pauseRecording = () => {
    setIsPaused(!isPaused);
  };

  const stopRecording = () => {
    setIsRecording(false);
    setIsPaused(false);
    setIsProcessing(true);
    
    // Simulate AI processing
    setTimeout(() => {
      const mockTranscript = `Patient ${patientName} presents with chief complaint of chest pain that started this morning. Pain is described as sharp, 7/10 intensity, located in the center of the chest. No radiation to arms or jaw. Associated with shortness of breath but no nausea or diaphoresis. No recent trauma or exertional triggers noted. Patient appears anxious but cooperative. Vital signs stable.`;
      
      const mockSOAP = `SUBJECTIVE:
${patientName} presents with acute chest pain onset this morning. Pain described as sharp, 7/10 severity, central chest location. No radiation. Associated SOB, denies N/V/diaphoresis. No recent trauma or exertion.

OBJECTIVE:
Patient appears anxious but alert and cooperative. Vital signs stable. Further examination pending.

ASSESSMENT:
Acute chest pain, etiology to be determined. Differential includes cardiac, pulmonary, musculoskeletal causes.

PLAN:
1. ECG and cardiac enzymes
2. Chest X-ray
3. Pain management
4. Monitor vital signs
5. Cardiology consult if indicated`;

      setCurrentTranscript(mockTranscript);
      setGeneratedSOAP(mockSOAP);
      setConfidence(96);
      setIsProcessing(false);
      
      // Call callback if provided
      onTranscriptionComplete?.(mockTranscript, mockSOAP);
    }, 2000);
  };

  const saveToEHR = () => {
    // Simulate saving to EHR
    console.log("Saving to EHR:", { currentTranscript, generatedSOAP });
    // Show success notification
  };

  if (!isExpanded) {
    // Compact floating widget
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <Card className="w-80 shadow-xl border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" />
                AI Scribe
                <FeatureExplainer
                  title="Consultation AI Scribe"
                  description="Record and transcribe your patient consultation with automatic SOAP note generation."
                  features={[
                    "Real-time speech-to-text",
                    "Medical terminology recognition", 
                    "Auto SOAP note generation",
                    "EHR integration",
                    "High accuracy (96%+)"
                  ]}
                  benefits={[
                    "Focus on patient instead of notes",
                    "Reduce documentation time",
                    "Improve note accuracy",
                    "Generate billing codes"
                  ]}
                  size="sm"
                />
              </CardTitle>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleExpand}
                  className="h-6 w-6 p-0"
                >
                  <Maximize2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{patientName}</span>
              <Badge variant="outline" className="text-xs">{appointmentType}</Badge>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            {/* Recording Controls */}
            <div className="flex items-center justify-center mb-3">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all ${
                isRecording 
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                  : 'border-gray-300 bg-gray-50 dark:bg-gray-800'
              }`}>
                {isRecording ? (
                  <div className="text-center">
                    <Mic className="w-5 h-5 text-red-500 mx-auto" />
                    <div className="text-xs font-bold text-red-500 mt-1">
                      {formatTime(recordingTime)}
                    </div>
                  </div>
                ) : (
                  <Mic className="w-6 h-6 text-gray-400" />
                )}
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 mb-3">
              {!isRecording ? (
                <Button onClick={startRecording} size="sm" className="bg-red-600 hover:bg-red-700">
                  <Mic className="w-3 h-3 mr-1" />
                  Start
                </Button>
              ) : (
                <>
                  <Button onClick={pauseRecording} variant="outline" size="sm">
                    {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                  </Button>
                  <Button onClick={stopRecording} variant="destructive" size="sm">
                    <Square className="w-3 h-3" />
                  </Button>
                </>
              )}
            </div>

            {/* Status */}
            {isRecording && (
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-2">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                {isPaused ? 'Paused' : 'Recording'}
              </div>
            )}

            {isProcessing && (
              <div className="flex items-center justify-center gap-2 text-xs text-primary mb-2">
                <Brain className="w-3 h-3 animate-pulse" />
                Processing...
              </div>
            )}

            {/* Quick Transcript Preview */}
            {currentTranscript && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-700 text-xs">
                    <CheckCircle className="w-2 h-2 mr-1" />
                    {confidence}% Confident
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded max-h-16 overflow-hidden">
                  {currentTranscript.substring(0, 100)}...
                </div>
                
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" className="flex-1 text-xs h-7">
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </Button>
                  <Button size="sm" className="flex-1 text-xs h-7" onClick={saveToEHR}>
                    <Save className="w-3 h-3 mr-1" />
                    Save
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Expanded view
  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            AI Medical Scribe - {patientName}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleExpand}
            >
              <Minimize2 className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{appointmentType}</Badge>
          <Badge variant="secondary">Session Active</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recording Panel */}
          <div className="space-y-4">
            <h4 className="font-medium">Live Recording</h4>
            
            {/* Recording Controls */}
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center border-4 transition-all ${
                  isRecording 
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                    : 'border-gray-300 bg-gray-50 dark:bg-gray-800'
                }`}>
                  {isRecording ? (
                    <div className="text-center">
                      <Mic className="w-6 h-6 text-red-500 mx-auto mb-1" />
                      <div className="text-sm font-bold text-red-500">
                        {formatTime(recordingTime)}
                      </div>
                    </div>
                  ) : (
                    <Mic className="w-8 h-8 text-gray-400" />
                  )}
                </div>
              </div>

              <div className="flex items-center justify-center gap-3">
                {!isRecording ? (
                  <Button onClick={startRecording} className="bg-red-600 hover:bg-red-700">
                    <Mic className="w-4 h-4 mr-2" />
                    Start Recording
                  </Button>
                ) : (
                  <>
                    <Button onClick={pauseRecording} variant="outline">
                      {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                      {isPaused ? 'Resume' : 'Pause'}
                    </Button>
                    <Button onClick={stopRecording} variant="destructive">
                      <Square className="w-4 h-4" />
                      Stop & Process
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Live Transcript */}
            <div className="space-y-2">
              <h5 className="font-medium text-sm">Real-time Transcript</h5>
              <div className="min-h-32 p-3 border rounded-lg bg-muted/30">
                {currentTranscript ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-green-100 text-green-700 text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {confidence}% Confidence
                      </Badge>
                    </div>
                    <p className="text-sm leading-relaxed">{currentTranscript}</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center text-sm">
                    {isRecording ? 'Listening for speech...' : 'Start recording to see live transcription'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* SOAP Note Generation */}
          <div className="space-y-4">
            <h4 className="font-medium">Generated SOAP Note</h4>
            
            {isProcessing && (
              <div className="flex items-center justify-center gap-2 text-primary p-4">
                <Brain className="w-5 h-5 animate-pulse" />
                <span>Generating SOAP note...</span>
              </div>
            )}

            {generatedSOAP ? (
              <div className="space-y-3">
                <Textarea
                  value={generatedSOAP}
                  onChange={(e) => setGeneratedSOAP(e.target.value)}
                  className="min-h-64 font-mono text-sm"
                  placeholder="SOAP note will appear here..."
                />
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Note
                  </Button>
                  <Button size="sm" className="flex-1" onClick={saveToEHR}>
                    <Save className="w-4 h-4 mr-2" />
                    Save to EHR
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            ) : (
              <div className="min-h-64 p-4 border rounded-lg bg-muted/30 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">SOAP note will be generated after recording</p>
                </div>
              </div>
            )}

            {/* AI Insights */}
            {currentTranscript && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h5 className="font-medium text-sm text-blue-800 dark:text-blue-200 mb-2">
                  AI Insights
                </h5>
                <div className="space-y-1 text-xs text-blue-700 dark:text-blue-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3" />
                    <span>Potential diagnosis: Chest pain evaluation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3" />
                    <span>Suggested codes: ICD-10 R06.02, CPT 99213</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-3 h-3" />
                    <span>Follow-up: ECG and cardiac enzymes recommended</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
