import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { Progress } from "./ui/progress";
import {
  Video,
  MessageCircle,
  Calendar,
  Clock,
  CheckCircle,
  Brain,
  Sparkles,
  User,
  AlertTriangle,
  Shield,
  FileText,
  Send,
  Mic,
  Phone,
  Zap,
  ArrowRight,
  Pill,
} from "lucide-react";

interface TelehealthVisitProps {
  isOpen: boolean;
  onClose: () => void;
  medication: {
    name: string;
    brand: string;
    price: number;
    requiresConsultation: boolean;
  };
  onOrderApproved: (orderData: any) => void;
}

interface QuestionnaireItem {
  id: string;
  label: string;
  question: string;
  type: string;
  required: boolean;
  options: string[];
  insight?: {
    icon: string;
    title: string;
    text: string;
  };
  encouragement?: {
    icon: string;
    title: string;
    text: string;
  };
}

export function TelehealthVisit({
  isOpen,
  onClose,
  medication,
  onOrderApproved,
}: TelehealthVisitProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [formData, setFormData] = useState({
    symptoms: "",
    medicalHistory: "",
    allergies: "",
    currentMedications: "",
    lifestyle: "",
    concerns: "",
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<any>(null);

  const questionnaire = [
    {
      id: "symptoms",
      label: "Current Symptoms",
      question: `What symptoms are you experiencing that make you need ${medication.name}?`,
      type: "multiple",
      required: true,
      options: [
        "High blood pressure",
        "Chest pain or discomfort",
        "Shortness of breath",
        "Fatigue or weakness",
        "Irregular heartbeat",
        "Swelling in legs/feet",
        "Other cardiovascular symptoms",
      ],
      insight: {
        icon: "💡",
        title: "Clinical Insight",
        text: "Cardiovascular symptoms can vary widely. Our AI analyzes patterns from over 100,000 patient cases to provide personalized recommendations.",
      },
    },
    {
      id: "medicalHistory",
      label: "Medical History",
      question: "Do you have any of these medical conditions?",
      type: "multiple",
      required: true,
      options: [
        "High blood pressure (Hypertension)",
        "Heart disease or heart attack",
        "Diabetes",
        "High cholesterol",
        "Kidney disease",
        "Liver disease",
        "Stroke",
        "None of the above",
      ],
      encouragement: {
        icon: "🌟",
        title: "You're doing great!",
        text: "This information helps us ensure the safest treatment for you. You're halfway through!",
      },
    },
    {
      id: "allergies",
      label: "Drug Allergies",
      question: "Have you experienced allergic reactions to any of these?",
      type: "multiple",
      required: false,
      options: [
        "ACE inhibitors (like Lisinopril)",
        "Beta blockers",
        "Penicillin or antibiotics",
        "Aspirin or NSAIDs",
        "Sulfa drugs",
        "Contrast dye",
        "No known allergies",
        "Other medications not listed",
      ],
      insight: {
        icon: "🛡️",
        title: "Safety First",
        text: "Drug allergies affect 10% of the population. Our AI cross-references your allergies with millions of drug interaction databases.",
      },
    },
    {
      id: "currentMedications",
      label: "Current Medications",
      question: "Which medications are you currently taking?",
      type: "multiple",
      required: true,
      options: [
        "Blood pressure medications",
        "Cholesterol medications (statins)",
        "Diabetes medications",
        "Blood thinners",
        "Pain medications",
        "Antidepressants",
        "Vitamins/supplements only",
        "No medications currently",
      ],
      encouragement: {
        icon: "🚀",
        title: "Almost there!",
        text: "You're providing excellent information. Just a couple more questions and we'll have everything we need!",
      },
    },
    {
      id: "lifestyle",
      label: "Lifestyle Factors",
      question: "Which lifestyle factors apply to you?",
      type: "multiple",
      required: false,
      options: [
        "Regular exercise (3+ times per week)",
        "Sedentary lifestyle",
        "Occasional alcohol consumption",
        "Regular alcohol consumption",
        "Current smoker",
        "Former smoker",
        "High-stress job/lifestyle",
        "None of the above",
      ],
      insight: {
        icon: "📊",
        title: "Personalized Medicine",
        text: "Lifestyle factors can affect medication effectiveness by up to 40%. This helps us optimize your dosage and timing.",
      },
    },
    {
      id: "concerns",
      label: "Treatment Concerns",
      question: "Do you have any concerns about this medication?",
      type: "multiple",
      required: false,
      options: [
        "Potential side effects",
        "Drug interactions",
        "Cost and affordability",
        "Effectiveness",
        "Long-term use",
        "Dosing schedule",
        "No specific concerns",
        "Other concerns",
      ],
      encouragement: {
        icon: "🎉",
        title: "Excellent work!",
        text: "You've completed the assessment! Our AI is now ready to analyze your profile and provide personalized recommendations.",
      },
    },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    const requiredFields = questionnaire.filter((q) => q.required);
    return requiredFields.every(
      (field) =>
        formData[field.id as keyof typeof formData] &&
        formData[field.id as keyof typeof formData].trim() !== "",
    );
  };

  const handleAIAnalysis = async () => {
    setIsAnalyzing(true);

    // Simulate AI analysis
    setTimeout(() => {
      const mockAIResponse = {
        approved: true,
        confidence: 92,
        riskLevel: "low",
        recommendations: [
          "Start with lowest effective dose (5mg once daily)",
          "Take with food to reduce stomach upset",
          "Monitor blood pressure weekly for first month",
          "Avoid grapefruit juice while taking this medication",
        ],
        contraindications: [],
        dosageRecommendation: "5mg once daily",
        duration: "3 months with follow-up",
        warnings: [
          "May cause dizziness when standing up quickly",
          "Report any unusual muscle pain or weakness",
        ],
        monitoringRequired: [
          "Blood pressure monitoring",
          "Liver function tests in 3 months",
        ],
        estimatedDelivery: "2-3 business days",
        totalCost: medication.price,
      };

      setAiRecommendation(mockAIResponse);
      setIsAnalyzing(false);
      setCurrentStep(3);
    }, 3000);
  };

  const handleApproveOrder = () => {
    const orderData = {
      medication: medication,
      consultation: {
        questionnaire: formData,
        aiAnalysis: aiRecommendation,
        timestamp: new Date().toISOString(),
      },
      status: "approved",
      orderId: `TH-${Date.now()}`,
    };

    onOrderApproved(orderData);
    onClose();
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center space-x-4 mb-8">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              currentStep >= step
                ? "bg-primary text-white"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {step === 1 && <FileText className="w-5 h-5" />}
            {step === 2 && <Brain className="w-5 h-5" />}
            {step === 3 && <CheckCircle className="w-5 h-5" />}
          </div>
          {step < 3 && (
            <div
              className={`w-12 h-1 ml-2 ${
                currentStep > step ? "bg-primary" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center">
            <Video className="w-6 h-6 text-primary mr-3" />
            Telehealth Consultation for {medication.name}
          </DialogTitle>
        </DialogHeader>

        {renderStepIndicator()}

        {/* Step 1: Questionnaire */}
        {currentStep === 1 && (
          <div className="space-y-6">
            {/* Progress Indicator */}
            <div className="glass-morphism p-4 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Health Assessment for {medication.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Question {currentQuestionIndex + 1} of{" "}
                      {questionnaire.length}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {Math.round(
                      ((currentQuestionIndex + 1) / questionnaire.length) * 100,
                    )}
                    %
                  </div>
                  <div className="text-xs text-muted-foreground">Complete</div>
                </div>
              </div>
              <Progress
                value={
                  ((currentQuestionIndex + 1) / questionnaire.length) * 100
                }
                className="w-full"
              />
            </div>

            {/* Current Question */}
            <div className="glass-morphism p-6 rounded-xl">
              <div className="mb-6">
                <Label className="text-lg font-semibold text-foreground mb-3 block">
                  {questionnaire[currentQuestionIndex].label}
                  {questionnaire[currentQuestionIndex].required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </Label>
                <p className="text-foreground mb-4">
                  {questionnaire[currentQuestionIndex].question}
                </p>

                {/* Multiple Choice Options */}
                <div className="grid grid-cols-1 gap-3">
                  {questionnaire[currentQuestionIndex].options.map(
                    (option, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover-lift ${
                          formData[
                            questionnaire[currentQuestionIndex]
                              .id as keyof typeof formData
                          ]
                            .split(",")
                            .map((s) => s.trim())
                            .includes(option)
                            ? "border-primary bg-primary/10"
                            : "border-border bg-background hover:border-primary/50"
                        }`}
                        onClick={() => {
                          const field = questionnaire[currentQuestionIndex].id;
                          const currentValues = formData[
                            field as keyof typeof formData
                          ]
                            .split(",")
                            .map((s) => s.trim())
                            .filter((s) => s);

                          let newValues;
                          if (currentValues.includes(option)) {
                            newValues = currentValues.filter(
                              (v) => v !== option,
                            );
                          } else {
                            newValues = [...currentValues, option];
                          }

                          handleInputChange(field, newValues.join(", "));
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              formData[
                                questionnaire[currentQuestionIndex]
                                  .id as keyof typeof formData
                              ]
                                .split(",")
                                .map((s) => s.trim())
                                .includes(option)
                                ? "border-primary bg-primary"
                                : "border-muted-foreground"
                            }`}
                          >
                            {formData[
                              questionnaire[currentQuestionIndex]
                                .id as keyof typeof formData
                            ]
                              .split(",")
                              .map((s) => s.trim())
                              .includes(option) && (
                              <CheckCircle className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <span className="text-foreground font-medium">
                            {option}
                          </span>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (currentQuestionIndex > 0) {
                      setCurrentQuestionIndex(currentQuestionIndex - 1);
                    } else {
                      onClose();
                    }
                  }}
                >
                  {currentQuestionIndex === 0 ? "Cancel" : "Previous"}
                </Button>

                <Button
                  onClick={() => {
                    if (currentQuestionIndex < questionnaire.length - 1) {
                      setCurrentQuestionIndex(currentQuestionIndex + 1);
                    } else {
                      setCurrentStep(2);
                    }
                  }}
                  className="gradient-bg text-white border-0"
                  disabled={
                    questionnaire[currentQuestionIndex].required &&
                    !formData[
                      questionnaire[currentQuestionIndex]
                        .id as keyof typeof formData
                    ]
                  }
                >
                  {currentQuestionIndex === questionnaire.length - 1 ? (
                    <>
                      Complete Assessment
                      <Brain className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    <>
                      Next Question
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Clinical Insight or Encouragement */}
            {(questionnaire[currentQuestionIndex].insight ||
              questionnaire[currentQuestionIndex].encouragement) && (
              <div className="glass-morphism p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-l-4 border-primary">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">
                    {questionnaire[currentQuestionIndex].insight?.icon ||
                      questionnaire[currentQuestionIndex].encouragement?.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      {questionnaire[currentQuestionIndex].insight?.title ||
                        questionnaire[currentQuestionIndex].encouragement
                          ?.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {questionnaire[currentQuestionIndex].insight?.text ||
                        questionnaire[currentQuestionIndex].encouragement?.text}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: AI Analysis */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="glass-morphism p-6 rounded-xl text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                AI Health Assessment
              </h3>
              <p className="text-muted-foreground mb-6">
                Our advanced AI is analyzing your responses and medical data to
                provide personalized recommendations
              </p>

              {!isAnalyzing ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <div className="flex items-center justify-center space-x-2 text-blue-600 dark:text-blue-400">
                      <Sparkles className="w-5 h-5" />
                      <span className="font-medium">
                        Ready to analyze your health profile
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={handleAIAnalysis}
                    className="gradient-bg text-white border-0 w-full"
                    size="lg"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Start AI Analysis
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-2 text-primary">
                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
                    <span>Analyzing health data...</span>
                  </div>
                  <Progress value={65} className="w-full" />
                  <div className="text-sm text-muted-foreground">
                    Checking drug interactions, contraindications, and dosage
                    recommendations...
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Results & Approval */}
        {currentStep === 3 && aiRecommendation && (
          <div className="space-y-6">
            <div className="glass-morphism p-6 rounded-xl">
              <div className="flex items-center space-x-3 mb-6">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    aiRecommendation.approved ? "bg-green-500" : "bg-red-500"
                  }`}
                >
                  {aiRecommendation.approved ? (
                    <CheckCircle className="w-6 h-6 text-white" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">
                    {aiRecommendation.approved
                      ? "Consultation Approved"
                      : "Consultation Required"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    AI Confidence: {aiRecommendation.confidence}% • Risk Level:{" "}
                    {aiRecommendation.riskLevel}
                  </p>
                </div>
              </div>

              {aiRecommendation.approved && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <Card className="glass-morphism">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-foreground mb-3 flex items-center">
                          <Pill className="w-4 h-4 mr-2 text-primary" />
                          Recommended Dosage
                        </h4>
                        <p className="text-foreground font-medium">
                          {aiRecommendation.dosageRecommendation}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {aiRecommendation.duration}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="glass-morphism">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-foreground mb-3 flex items-center">
                          <Shield className="w-4 h-4 mr-2 text-primary" />
                          Safety Profile
                        </h4>
                        <Badge className="bg-green-100 text-green-800">
                          {aiRecommendation.riskLevel} Risk
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-2">
                          No major contraindications detected
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">
                        AI Recommendations
                      </h4>
                      <ul className="space-y-1">
                        {aiRecommendation.recommendations.map(
                          (rec: string, index: number) => (
                            <li
                              key={index}
                              className="flex items-start space-x-2 text-sm"
                            >
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-muted-foreground">
                                {rec}
                              </span>
                            </li>
                          ),
                        )}
                      </ul>
                    </div>

                    {aiRecommendation.warnings.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-foreground mb-2 flex items-center">
                          <AlertTriangle className="w-4 h-4 text-yellow-500 mr-2" />
                          Important Warnings
                        </h4>
                        <ul className="space-y-1">
                          {aiRecommendation.warnings.map(
                            (warning: string, index: number) => (
                              <li
                                key={index}
                                className="flex items-start space-x-2 text-sm"
                              >
                                <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                <span className="text-muted-foreground">
                                  {warning}
                                </span>
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    )}

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-2">
                        Order Summary
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Medication:
                          </span>
                          <span className="font-medium">
                            {medication.name} ({medication.brand})
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Dosage:</span>
                          <span className="font-medium">
                            {aiRecommendation.dosageRecommendation}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Estimated Delivery:
                          </span>
                          <span className="font-medium">
                            {aiRecommendation.estimatedDelivery}
                          </span>
                        </div>
                        <div className="flex justify-between font-semibold">
                          <span>Total Cost:</span>
                          <span>${aiRecommendation.totalCost}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between mt-8">
                    <Button variant="outline" onClick={() => setCurrentStep(1)}>
                      Back to Form
                    </Button>
                    <Button
                      onClick={handleApproveOrder}
                      className="gradient-bg text-white border-0"
                      size="lg"
                    >
                      Approve & Order Medication
                      <CheckCircle className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
