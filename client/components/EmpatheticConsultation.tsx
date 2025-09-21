import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { Progress } from "./ui/progress";
import {
  Heart,
  Brain,
  Shield,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  HelpCircle,
  Star,
  Clock,
  Pill,
  Target,
  ChevronRight,
  Smile,
  ThumbsUp,
} from "lucide-react";

import {
  CONSULTATION_MCQ_TEMPLATES,
  calculateRiskScore,
  requiresConsultation,
  getConsultationRecommendations,
  calculateProgress,
  getEmpatheticResponse,
  type ConsultationMCQ,
  type MCQQuestion,
} from "../data/consultationMCQTemplates";

interface EmpatheticConsultationProps {
  isOpen: boolean;
  onClose: () => void;
  medication: {
    name: string;
    brand: string;
    price: string;
    dosage: string;
    category?: string;
  };
  onOrderApproved: (orderData: any) => void;
}

// Mapping medications to MCQ templates
const MEDICATION_MCQ_MAPPING: Record<string, string> = {
  // Weight loss medications -> mental health screening (often related)
  Semaglutide: "mental_health_screening",
  Tirzepatide: "mental_health_screening",
  Liraglutide: "mental_health_screening",
  Dulaglutide: "diabetes_management",

  // ED medications -> cardiovascular screening
  Sildenafil: "cardiovascular_risk",
  Tadalafil: "cardiovascular_risk",
  Vardenafil: "cardiovascular_risk",
  Avanafil: "cardiovascular_risk",

  // Skin medications -> dermatology
  Tretinoin: "dermatology_consultation",
  Hydroquinone: "dermatology_consultation",
  Clindamycin: "dermatology_consultation",
  "Azelaic Acid": "dermatology_consultation",

  // Hair medications -> general health
  Finasteride: "cardiovascular_risk",
  Dutasteride: "cardiovascular_risk",
  Minoxidil: "cardiovascular_risk",

  // Default fallback
  default: "mental_health_screening",
};

export function EmpatheticConsultation({
  isOpen,
  onClose,
  medication,
  onOrderApproved,
}: EmpatheticConsultationProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mcqTemplate, setMcqTemplate] = useState<ConsultationMCQ | null>(null);
  const [assessmentResult, setAssessmentResult] = useState<any>(null);
  const [showSupportiveMessages, setShowSupportiveMessages] = useState(true);

  // Initialize MCQ template based on medication
  useEffect(() => {
    const templateId =
      MEDICATION_MCQ_MAPPING[medication.name] ||
      MEDICATION_MCQ_MAPPING["default"];
    const template = CONSULTATION_MCQ_TEMPLATES.find(
      (t) => t.id === templateId,
    );
    if (template) {
      setMcqTemplate(template);
    }
  }, [medication.name]);

  const progress = mcqTemplate
    ? calculateProgress(responses, mcqTemplate.questions)
    : 0;
  const currentQuestion = mcqTemplate?.questions[currentQuestionIndex];

  const handleResponse = (questionId: string, value: any) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleNextQuestion = () => {
    if (!mcqTemplate) return;

    if (currentQuestionIndex < mcqTemplate.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setCurrentStep(2);
      handleAIAnalysis();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else {
      onClose();
    }
  };

  const handleAIAnalysis = async () => {
    if (!mcqTemplate) return;

    setIsAnalyzing(true);

    // Simulate AI analysis with actual risk calculation
    setTimeout(() => {
      const riskScore = calculateRiskScore(responses, mcqTemplate.questions);
      const needsConsultation = requiresConsultation(responses, mcqTemplate);
      const recommendations = getConsultationRecommendations(
        responses,
        mcqTemplate,
      );

      const result = {
        approved: !needsConsultation,
        needsConsultation,
        riskScore,
        confidence: Math.min(95, 80 + Math.random() * 15),
        riskLevel: recommendations.urgency,
        supportiveMessage: recommendations.supportiveMessage,
        nextSteps: recommendations.nextSteps,
        recommendations: needsConsultation
          ? mcqTemplate.consultationCriteria
          : [
              `${medication.name} appears appropriate for your situation`,
              "Start with the lowest effective dose",
              "Monitor for side effects during first week",
              "Follow up if symptoms persist or worsen",
            ],
        dosageRecommendation: medication.dosage,
        duration: "As needed with 3-month review",
        warnings: needsConsultation
          ? [
              "Professional consultation required before treatment",
              "Do not start medication without medical supervision",
            ]
          : [
              "Take exactly as prescribed",
              "Contact healthcare provider if side effects occur",
            ],
        estimatedDelivery: needsConsultation
          ? "After consultation approval"
          : "2-3 business days",
        totalCost: medication.price,
        category: mcqTemplate.category,
      };

      setAssessmentResult(result);
      setIsAnalyzing(false);
      setCurrentStep(3);
    }, 2500);
  };

  const handleApproveOrder = () => {
    const orderData = {
      medication: medication,
      consultation: {
        mcqTemplate: mcqTemplate?.id,
        responses: responses,
        assessment: assessmentResult,
        timestamp: new Date().toISOString(),
      },
      status: assessmentResult?.needsConsultation
        ? "consultation_required"
        : "approved",
      orderId: `MCQ-${Date.now()}`,
    };

    onOrderApproved(orderData);
    onClose();
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center space-x-4 mb-8">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              currentStep >= step
                ? "bg-gradient-to-r from-emerald-500 to-blue-500 text-white"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {step === 1 && <Heart className="w-5 h-5" />}
            {step === 2 && <Brain className="w-5 h-5" />}
            {step === 3 && <CheckCircle className="w-5 h-5" />}
          </div>
          {step < 3 && (
            <div
              className={`w-12 h-1 ml-2 transition-all ${
                currentStep > step
                  ? "bg-gradient-to-r from-emerald-500 to-blue-500"
                  : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  if (!mcqTemplate) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            Personalized Care Assessment
          </DialogTitle>
          <p className="text-muted-foreground">
            for {medication.name} ({medication.brand})
          </p>
        </DialogHeader>

        {renderStepIndicator()}

        {/* Step 1: Empathetic MCQ Assessment */}
        {currentStep === 1 && (
          <div className="space-y-6">
            {/* Welcome Message (only for first question) */}
            {currentQuestionIndex === 0 && showSupportiveMessages && (
              <div className="p-6 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-start gap-3">
                  <Heart className="w-6 h-6 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-lg font-semibold text-emerald-800 dark:text-emerald-200 mb-2">
                      Welcome to Your Personal Health Assessment
                    </h4>
                    <p className="text-emerald-700 dark:text-emerald-300">
                      {mcqTemplate.empathicIntro}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Progress Indicator */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {mcqTemplate.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Question {currentQuestionIndex + 1} of{" "}
                      {mcqTemplate.questions.length}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-emerald-600">
                    {Math.round(
                      ((currentQuestionIndex + 1) /
                        mcqTemplate.questions.length) *
                        100,
                    )}
                    %
                  </div>
                  <div className="text-xs text-muted-foreground">Complete</div>
                </div>
              </div>
              <Progress
                value={
                  ((currentQuestionIndex + 1) / mcqTemplate.questions.length) *
                  100
                }
                className="w-full h-3"
              />
            </div>

            {/* Current Question */}
            {currentQuestion && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {currentQuestion.title}
                    {currentQuestion.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </h3>

                  {/* Supportive subtitle */}
                  {(currentQuestion as any).subtitle &&
                    showSupportiveMessages && (
                      <p className="text-emerald-600 dark:text-emerald-400 mb-3 italic">
                        {(currentQuestion as any).subtitle}
                      </p>
                    )}

                  {currentQuestion.description && (
                    <p className="text-muted-foreground mb-4">
                      {currentQuestion.description}
                    </p>
                  )}

                  {/* Question Input */}
                  {currentQuestion.type === "text" && (
                    <Input
                      value={responses[currentQuestion.id] || ""}
                      onChange={(e) =>
                        handleResponse(currentQuestion.id, e.target.value)
                      }
                      placeholder="Your answer..."
                      className="text-lg"
                    />
                  )}

                  {currentQuestion.type === "textarea" && (
                    <Textarea
                      value={responses[currentQuestion.id] || ""}
                      onChange={(e) =>
                        handleResponse(currentQuestion.id, e.target.value)
                      }
                      placeholder="Share your thoughts..."
                      rows={3}
                    />
                  )}

                  {(currentQuestion.type === "multiple_choice" ||
                    currentQuestion.type === "checkbox") &&
                    currentQuestion.options && (
                      <div className="space-y-3">
                        {currentQuestion.options.map((option, index) => (
                          <div
                            key={index}
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:bg-emerald-50 dark:hover:bg-emerald-900/20 ${
                              currentQuestion.type === "multiple_choice"
                                ? responses[currentQuestion.id] === option
                                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                                  : "border-gray-200 dark:border-gray-700 hover:border-emerald-300"
                                : Array.isArray(
                                      responses[currentQuestion.id],
                                    ) &&
                                    responses[currentQuestion.id].includes(
                                      option,
                                    )
                                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                                  : "border-gray-200 dark:border-gray-700 hover:border-emerald-300"
                            }`}
                            onClick={() => {
                              if (currentQuestion.type === "multiple_choice") {
                                handleResponse(currentQuestion.id, option);
                              } else {
                                const current =
                                  responses[currentQuestion.id] || [];
                                if (current.includes(option)) {
                                  handleResponse(
                                    currentQuestion.id,
                                    current.filter(
                                      (item: string) => item !== option,
                                    ),
                                  );
                                } else {
                                  handleResponse(currentQuestion.id, [
                                    ...current,
                                    option,
                                  ]);
                                }
                              }
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                  (
                                    currentQuestion.type === "multiple_choice"
                                      ? responses[currentQuestion.id] === option
                                      : Array.isArray(
                                          responses[currentQuestion.id],
                                        ) &&
                                        responses[currentQuestion.id].includes(
                                          option,
                                        )
                                  )
                                    ? "border-emerald-500 bg-emerald-500"
                                    : "border-gray-300"
                                }`}
                              >
                                {(currentQuestion.type === "multiple_choice"
                                  ? responses[currentQuestion.id] === option
                                  : Array.isArray(
                                      responses[currentQuestion.id],
                                    ) &&
                                    responses[currentQuestion.id].includes(
                                      option,
                                    )) && (
                                  <CheckCircle className="w-3 h-3 text-white" />
                                )}
                              </div>
                              <span className="text-foreground font-medium">
                                {option}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                  {currentQuestion.type === "boolean" && (
                    <div className="flex gap-4">
                      <Button
                        variant={
                          responses[currentQuestion.id] === "Yes"
                            ? "default"
                            : "outline"
                        }
                        size="lg"
                        onClick={() =>
                          handleResponse(currentQuestion.id, "Yes")
                        }
                        className={
                          responses[currentQuestion.id] === "Yes"
                            ? "bg-emerald-600 hover:bg-emerald-700"
                            : ""
                        }
                      >
                        Yes
                      </Button>
                      <Button
                        variant={
                          responses[currentQuestion.id] === "No"
                            ? "default"
                            : "outline"
                        }
                        size="lg"
                        onClick={() => handleResponse(currentQuestion.id, "No")}
                        className={
                          responses[currentQuestion.id] === "No"
                            ? "bg-emerald-600 hover:bg-emerald-700"
                            : ""
                        }
                      >
                        No
                      </Button>
                    </div>
                  )}

                  {currentQuestion.type === "rating" && (
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <Star
                          key={rating}
                          className={`w-8 h-8 cursor-pointer transition-colors ${
                            responses[currentQuestion.id] >= rating
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300 hover:text-yellow-300"
                          }`}
                          onClick={() =>
                            handleResponse(currentQuestion.id, rating)
                          }
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center">
                  <Button variant="outline" onClick={handlePreviousQuestion}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {currentQuestionIndex === 0 ? "Cancel" : "Previous"}
                  </Button>

                  <Button
                    onClick={handleNextQuestion}
                    className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white border-0 hover:from-emerald-600 hover:to-blue-600"
                    disabled={
                      currentQuestion.required && !responses[currentQuestion.id]
                    }
                  >
                    {currentQuestionIndex ===
                    mcqTemplate.questions.length - 1 ? (
                      <>
                        Complete Assessment
                        <Brain className="w-4 h-4 ml-2" />
                      </>
                    ) : (
                      <>
                        Continue
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Supportive Message */}
            {currentQuestion &&
              (currentQuestion as any).supportiveMessage &&
              showSupportiveMessages && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 rounded-r-lg">
                  <div className="flex items-start gap-3">
                    <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                        We're here to help
                      </h5>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        {(currentQuestion as any).supportiveMessage}
                      </p>
                    </div>
                  </div>
                </div>
              )}

            {/* Settings */}
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setShowSupportiveMessages(!showSupportiveMessages)
                }
              >
                <Smile className="w-4 h-4 mr-2" />
                {showSupportiveMessages ? "Hide" : "Show"} Support Messages
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: AI Analysis */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-3">
                Personalized Health Analysis
              </h3>
              <p className="text-muted-foreground mb-8">
                Our AI is carefully reviewing your responses to provide safe,
                personalized care recommendations for {medication.name}
              </p>

              {!isAnalyzing ? (
                <div className="space-y-4">
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg">
                    <div className="flex items-center justify-center space-x-2 text-emerald-600 dark:text-emerald-400">
                      <Sparkles className="w-5 h-5" />
                      <span className="font-medium">
                        Ready to analyze your health profile
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-center space-x-3 text-primary">
                    <div className="animate-spin w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full"></div>
                    <span className="text-lg">Analyzing your responses...</span>
                  </div>
                  <Progress value={75} className="w-full h-3" />
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>
                        Checking safety profile and contraindications...
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Shield className="w-4 h-4" />
                      <span>Calculating risk assessment...</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Target className="w-4 h-4" />
                      <span>Generating personalized recommendations...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Results & Recommendations */}
        {currentStep === 3 && assessmentResult && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-4 mb-6">
                <div
                  className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                    assessmentResult.approved
                      ? "bg-gradient-to-r from-emerald-500 to-green-500"
                      : "bg-gradient-to-r from-orange-500 to-red-500"
                  }`}
                >
                  {assessmentResult.approved ? (
                    <ThumbsUp className="w-8 h-8 text-white" />
                  ) : (
                    <AlertTriangle className="w-8 h-8 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-foreground">
                    {assessmentResult.approved
                      ? "Treatment Approved"
                      : "Consultation Recommended"}
                  </h3>
                  <p className="text-muted-foreground">
                    AI Confidence: {Math.round(assessmentResult.confidence)}% •
                    Risk Level: {assessmentResult.riskLevel} • Category:{" "}
                    {assessmentResult.category}
                  </p>
                </div>
              </div>

              {/* Supportive Message */}
              <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-start gap-3">
                  <Heart className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-emerald-800 dark:text-emerald-200 mb-1">
                      Your Health Matters
                    </h4>
                    <p className="text-emerald-700 dark:text-emerald-300">
                      {assessmentResult.supportiveMessage}
                    </p>
                  </div>
                </div>
              </div>

              {assessmentResult.approved ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <Card className="border border-emerald-200 dark:border-emerald-800">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-foreground mb-3 flex items-center">
                          <Pill className="w-5 h-5 mr-2 text-emerald-600" />
                          Recommended Treatment
                        </h4>
                        <p className="text-foreground font-medium mb-1">
                          {assessmentResult.dosageRecommendation}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {assessmentResult.duration}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border border-emerald-200 dark:border-emerald-800">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-foreground mb-3 flex items-center">
                          <Shield className="w-5 h-5 mr-2 text-emerald-600" />
                          Safety Assessment
                        </h4>
                        <Badge className="bg-emerald-100 text-emerald-800 mb-2">
                          {assessmentResult.riskLevel} Risk
                        </Badge>
                        <p className="text-sm text-muted-foreground">
                          Based on your responses, this medication appears safe
                          for you
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-foreground mb-3 flex items-center">
                        <CheckCircle className="w-5 h-5 text-emerald-600 mr-2" />
                        Personalized Recommendations
                      </h4>
                      <ul className="space-y-2">
                        {assessmentResult.recommendations.map(
                          (rec: string, index: number) => (
                            <li
                              key={index}
                              className="flex items-start space-x-3 text-sm"
                            >
                              <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                              <span className="text-muted-foreground">
                                {rec}
                              </span>
                            </li>
                          ),
                        )}
                      </ul>
                    </div>

                    {assessmentResult.warnings.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-foreground mb-3 flex items-center">
                          <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
                          Important Information
                        </h4>
                        <ul className="space-y-2">
                          {assessmentResult.warnings.map(
                            (warning: string, index: number) => (
                              <li
                                key={index}
                                className="flex items-start space-x-3 text-sm"
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
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">
                      Professional Consultation Required
                    </h4>
                    <p className="text-orange-700 dark:text-orange-300 text-sm">
                      Based on your responses, we recommend speaking with a
                      healthcare professional before starting this medication.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-foreground mb-3">
                      Why a consultation is recommended:
                    </h4>
                    <ul className="space-y-2">
                      {assessmentResult.recommendations.map(
                        (reason: string, index: number) => (
                          <li
                            key={index}
                            className="flex items-start space-x-3 text-sm"
                          >
                            <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground">
                              {reason}
                            </span>
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                </div>
              )}

              {/* Order Summary */}
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-foreground mb-3">
                  Order Summary
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Medication:</span>
                    <span className="font-medium">
                      {medication.name} ({medication.brand})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dosage:</span>
                    <span className="font-medium">
                      {assessmentResult.dosageRecommendation}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Estimated Delivery:
                    </span>
                    <span className="font-medium">
                      {assessmentResult.estimatedDelivery}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold text-base">
                    <span>Total Cost:</span>
                    <span>{assessmentResult.totalCost}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Review Responses
                </Button>
                <Button
                  onClick={handleApproveOrder}
                  className={`${
                    assessmentResult.approved
                      ? "bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
                      : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  } text-white border-0`}
                  size="lg"
                >
                  {assessmentResult.approved ? (
                    <>
                      Approve & Order Medication
                      <CheckCircle className="w-5 h-5 ml-2" />
                    </>
                  ) : (
                    <>
                      Schedule Consultation
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </div>

              {/* Closing message */}
              {mcqTemplate && showSupportiveMessages && (
                <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-start gap-3">
                    <Heart className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h5 className="font-medium text-emerald-800 dark:text-emerald-200 mb-1">
                        Thank You
                      </h5>
                      <p className="text-sm text-emerald-700 dark:text-emerald-300">
                        {mcqTemplate.supportiveClosing}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
