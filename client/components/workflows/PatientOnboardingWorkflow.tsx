import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import {
  CheckCircle,
  Clock,
  ArrowRight,
  FileText,
  UserPlus,
  Mail,
  Phone,
  CreditCard,
  Shield,
  Calendar,
  MessageSquare,
  AlertTriangle,
  Settings
} from "lucide-react";

const onboardingSteps = [
  {
    id: 1,
    title: "Patient Registration",
    description: "Collect basic demographic information",
    status: "completed",
    automated: true,
    duration: "2 min",
    trigger: "New patient account created",
    actions: ["Send welcome email", "Create patient profile", "Generate ID"]
  },
  {
    id: 2,
    title: "Insurance Verification",
    description: "Verify insurance coverage and benefits",
    status: "completed", 
    automated: true,
    duration: "5 min",
    trigger: "Insurance info provided",
    actions: ["Check eligibility", "Verify benefits", "Calculate copay"]
  },
  {
    id: 3,
    title: "Intake Forms",
    description: "Send and collect required intake documents",
    status: "completed",
    automated: true,
    duration: "15 min",
    trigger: "Insurance verified",
    actions: ["Send intake forms", "Medical history", "Consent forms"]
  },
  {
    id: 4,
    title: "Health Assessment",
    description: "Complete initial health screening questionnaire",
    status: "in-progress",
    automated: false,
    duration: "10 min",
    trigger: "Intake forms completed",
    actions: ["Health screening", "Risk assessment", "Symptom checker"]
  },
  {
    id: 5,
    title: "Care Team Assignment",
    description: "Assign primary care provider and care team",
    status: "pending",
    automated: true,
    duration: "1 min",
    trigger: "Assessment completed",
    actions: ["Assign provider", "Set care team", "Care plan setup"]
  },
  {
    id: 6,
    title: "Portal Access Setup",
    description: "Grant access to patient portal and app",
    status: "pending",
    automated: true,
    duration: "2 min",
    trigger: "Care team assigned",
    actions: ["Portal invitation", "App setup", "Tutorial walkthrough"]
  },
  {
    id: 7,
    title: "First Appointment",
    description: "Schedule initial consultation appointment",
    status: "pending",
    automated: false,
    duration: "3 min",
    trigger: "Portal access granted",
    actions: ["Schedule appointment", "Send reminders", "Pre-visit prep"]
  },
  {
    id: 8,
    title: "Onboarding Complete",
    description: "Welcome package and final setup",
    status: "pending",
    automated: true,
    duration: "1 min",
    trigger: "First appointment scheduled",
    actions: ["Welcome package", "Resource links", "Support contacts"]
  }
];

export function PatientOnboardingWorkflow() {
  const [selectedStep, setSelectedStep] = useState(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "in-progress": return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "in-progress": return <Clock className="w-5 h-5 text-blue-600 animate-spin" />;
      case "pending": return <Clock className="w-5 h-5 text-gray-400" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const completedSteps = onboardingSteps.filter(step => step.status === "completed").length;
  const progressPercentage = (completedSteps / onboardingSteps.length) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-xl">
                <UserPlus className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Patient Onboarding Workflow</CardTitle>
                <CardDescription>Automated patient intake and setup process</CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Configure
              </Button>
              <Badge className="bg-green-100 text-green-800">
                Active
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Overall Progress</span>
              <span className="text-sm font-bold">{completedSteps}/{onboardingSteps.length} steps completed</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{progressPercentage.toFixed(0)}%</div>
                <div className="text-sm text-muted-foreground">Completion Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">2.3 days</div>
                <div className="text-sm text-muted-foreground">Avg. Duration</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">847</div>
                <div className="text-sm text-muted-foreground">Patients Enrolled</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">94%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Steps */}
      <div className="space-y-4">
        {onboardingSteps.map((step, index) => (
          <Card 
            key={step.id} 
            className={`transition-all cursor-pointer ${
              selectedStep === step.id ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'
            }`}
            onClick={() => setSelectedStep(selectedStep === step.id ? null : step.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                {/* Step Number & Status */}
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    step.status === 'completed' ? 'bg-green-100 text-green-800' :
                    step.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {step.status === 'completed' ? '✓' : step.id}
                  </div>
                  {getStatusIcon(step.status)}
                </div>

                {/* Step Content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-foreground">{step.title}</h3>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(step.status)}>
                        {step.status}
                      </Badge>
                      {step.automated && (
                        <Badge variant="secondary" className="text-xs">
                          Automated
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {step.duration}
                    </span>
                    <span>Trigger: {step.trigger}</span>
                  </div>
                </div>

                {/* Arrow to next step */}
                {index < onboardingSteps.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                )}
              </div>

              {/* Expanded Details */}
              {selectedStep === step.id && (
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Automated Actions</h4>
                      <div className="space-y-2">
                        {step.actions.map((action, actionIndex) => (
                          <div key={actionIndex} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span>{action}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3">Configuration</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Retry attempts:</span>
                          <span>3</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Timeout:</span>
                          <span>30 minutes</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Notifications:</span>
                          <span>Enabled</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Escalation:</span>
                          <span>After 24 hours</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm">
                      <Settings className="w-3 h-3 mr-1" />
                      Edit Step
                    </Button>
                    <Button variant="outline" size="sm">
                      Test Step
                    </Button>
                    <Button variant="outline" size="sm">
                      View Logs
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Recent Onboarding Activity
          </CardTitle>
          <CardDescription>Latest patient onboarding events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { 
                patient: "Sarah Johnson", 
                step: "Portal Access Setup", 
                status: "completed", 
                time: "2 min ago",
                details: "Patient successfully logged into portal"
              },
              { 
                patient: "Michael Chen", 
                step: "Insurance Verification", 
                status: "in-progress", 
                time: "5 min ago",
                details: "Verifying benefits with Aetna"
              },
              { 
                patient: "Emma Davis", 
                step: "Intake Forms", 
                status: "completed", 
                time: "8 min ago",
                details: "All forms submitted and reviewed"
              },
              { 
                patient: "David Wilson", 
                step: "Health Assessment", 
                status: "pending", 
                time: "12 min ago",
                details: "Waiting for patient to complete assessment"
              },
              { 
                patient: "Lisa Rodriguez", 
                step: "Care Team Assignment", 
                status: "completed", 
                time: "15 min ago",
                details: "Assigned to Dr. Amanda Foster"
              }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${
                    activity.status === 'completed' ? 'bg-green-500' :
                    activity.status === 'in-progress' ? 'bg-blue-500' : 'bg-yellow-500'
                  }`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{activity.patient}</p>
                      <Badge variant="outline" className="text-xs">
                        {activity.step}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{activity.details}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge 
                    variant={activity.status === 'completed' ? 'default' : 'secondary'} 
                    className="text-xs mb-1"
                  >
                    {activity.status}
                  </Badge>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
