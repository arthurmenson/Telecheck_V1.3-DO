import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { Progress } from "./ui/progress";
import {
  Heart,
  Brain,
  Sparkles,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Star,
  Shield,
  Lightbulb,
  TrendingUp,
  Award,
  Clock,
  Target,
  Info,
  ThumbsUp,
  ChevronRight,
  Zap,
  Activity,
  BookOpen,
  Users,
  Calendar
} from "lucide-react";

import {
  DynamicQuestionnaire as QuestionnaireType,
  QuestionnaireQuestion,
  EducationalInsert,
  PrescriptionAI
} from '../data/dynamicQuestionnaires';

interface DynamicQuestionnaireProps {
  isOpen: boolean;
  onClose: () => void;
  questionnaire: QuestionnaireType;
  onComplete: (result: any) => void;
}

export function DynamicQuestionnaire({
  isOpen,
  onClose,
  questionnaire,
  onComplete
}: DynamicQuestionnaireProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showEducational, setShowEducational] = useState<EducationalInsert | null>(null);
  const [result, setResult] = useState<any>(null);

  const currentQuestion = questionnaire.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questionnaire.questions.length) * 100;
  
  // Check if current question should be shown based on conditional logic
  const shouldShowQuestion = (question: QuestionnaireQuestion): boolean => {
    if (!question.conditionalLogic) return true;
    
    const { showIf, hideIf } = question.conditionalLogic;
    
    if (showIf) {
      return responses[showIf.questionId] === showIf.value;
    }
    
    if (hideIf) {
      return responses[hideIf.questionId] !== hideIf.value;
    }
    
    return true;
  };

  // Get next visible question index
  const getNextQuestionIndex = (currentIndex: number): number => {
    for (let i = currentIndex + 1; i < questionnaire.questions.length; i++) {
      if (shouldShowQuestion(questionnaire.questions[i])) {
        return i;
      }
    }
    return questionnaire.questions.length;
  };

  const getPreviousQuestionIndex = (currentIndex: number): number => {
    for (let i = currentIndex - 1; i >= 0; i--) {
      if (shouldShowQuestion(questionnaire.questions[i])) {
        return i;
      }
    }
    return -1;
  };

  const handleResponse = (questionId: string, value: any) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    // Check for educational insert after this question
    const educationalInsert = questionnaire.educationalInserts.find(
      insert => insert.afterQuestion === currentQuestion.id
    );
    
    if (educationalInsert) {
      setShowEducational(educationalInsert);
      return;
    }

    const nextIndex = getNextQuestionIndex(currentQuestionIndex);
    if (nextIndex >= questionnaire.questions.length) {
      handleAnalyze();
    } else {
      setCurrentQuestionIndex(nextIndex);
    }
  };

  const handlePrevious = () => {
    const prevIndex = getPreviousQuestionIndex(currentQuestionIndex);
    if (prevIndex >= 0) {
      setCurrentQuestionIndex(prevIndex);
    } else {
      onClose();
    }
  };

  const handleAnalyze = () => {
    setCurrentStep(2);
    setIsAnalyzing(true);

    setTimeout(() => {
      const recommendation = PrescriptionAI.generateRecommendation(responses, questionnaire);
      setResult(recommendation);
      setIsAnalyzing(false);
      setCurrentStep(3);
    }, 3000);
  };

  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, any> = {
      'Weight Management': Activity,
      'Men\'s Health': Heart,
      'Dermatology': Sparkles,
      'Hair Restoration': Star
    };
    return iconMap[category] || Brain;
  };

  const getCategoryGradient = (category: string) => {
    const gradientMap: Record<string, string> = {
      'Weight Management': 'from-green-500 to-emerald-600',
      'Men\'s Health': 'from-blue-500 to-indigo-600',
      'Dermatology': 'from-purple-500 to-pink-600',
      'Hair Restoration': 'from-orange-500 to-red-600'
    };
    return gradientMap[category] || 'from-emerald-500 to-blue-600';
  };

  const getEducationalIcon = (type: string) => {
    const iconMap: Record<string, any> = {
      'fact': Lightbulb,
      'statistic': TrendingUp,
      'encouragement': Heart,
      'education': BookOpen
    };
    return iconMap[type] || Info;
  };

  const renderQuestion = () => {
    if (!currentQuestion || !shouldShowQuestion(currentQuestion)) {
      return null;
    }

    return (
      <div className="space-y-6">
        {/* Question Card */}
        <Card className="border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-white to-emerald-50 dark:from-gray-800 dark:to-emerald-900/20">
          <CardContent className="p-8">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 bg-gradient-to-r ${getCategoryGradient(questionnaire.category)} rounded-xl flex items-center justify-center`}>
                  <span className="text-white font-bold text-lg">
                    {currentQuestionIndex + 1}
                  </span>
                </div>
                <div>
                  <Badge className="mb-2 bg-emerald-100 text-emerald-800 border-emerald-300">
                    {currentQuestion.category.replace('_', ' ')}
                  </Badge>
                  {currentQuestion.required && (
                    <Badge variant="outline" className="ml-2 border-red-300 text-red-700">
                      Required
                    </Badge>
                  )}
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                {currentQuestion.title}
              </h3>

              {currentQuestion.subtitle && (
                <p className="text-lg text-emerald-700 dark:text-emerald-300 mb-3 italic">
                  {currentQuestion.subtitle}
                </p>
              )}

              {currentQuestion.empathicMessage && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-400 rounded-r-lg">
                  <div className="flex items-start gap-3">
                    <Heart className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed">
                      {currentQuestion.empathicMessage}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Question Input */}
            <div className="space-y-4">
              {currentQuestion.type === 'multiple_choice' && (
                <div className="space-y-3">
                  {currentQuestion.options?.map((option, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                        responses[currentQuestion.id] === option
                          ? `border-emerald-500 bg-gradient-to-r ${getCategoryGradient(questionnaire.category).replace('to-', 'to-').replace('from-', 'from-')}/10 shadow-lg`
                          : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300 bg-white dark:bg-gray-800'
                      }`}
                      onClick={() => handleResponse(currentQuestion.id, option)}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            responses[currentQuestion.id] === option
                              ? 'border-emerald-500 bg-emerald-500'
                              : 'border-gray-300'
                          }`}
                        >
                          {responses[currentQuestion.id] === option && (
                            <CheckCircle className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <span className="text-gray-900 dark:text-white font-medium text-lg">
                          {option}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {currentQuestion.type === 'checkbox' && (
                <div className="space-y-3">
                  {currentQuestion.options?.map((option, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                        Array.isArray(responses[currentQuestion.id]) && responses[currentQuestion.id].includes(option)
                          ? `border-emerald-500 bg-gradient-to-r ${getCategoryGradient(questionnaire.category)}/10 shadow-lg`
                          : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300 bg-white dark:bg-gray-800'
                      }`}
                      onClick={() => {
                        const current = responses[currentQuestion.id] || [];
                        if (current.includes(option)) {
                          handleResponse(currentQuestion.id, current.filter((item: string) => item !== option));
                        } else {
                          handleResponse(currentQuestion.id, [...current, option]);
                        }
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                            Array.isArray(responses[currentQuestion.id]) && responses[currentQuestion.id].includes(option)
                              ? 'border-emerald-500 bg-emerald-500'
                              : 'border-gray-300'
                          }`}
                        >
                          {Array.isArray(responses[currentQuestion.id]) && responses[currentQuestion.id].includes(option) && (
                            <CheckCircle className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <span className="text-gray-900 dark:text-white font-medium text-lg">
                          {option}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {currentQuestion.type === 'boolean' && (
                <div className="flex gap-6 justify-center">
                  <Button
                    variant={responses[currentQuestion.id] === 'Yes' ? 'default' : 'outline'}
                    size="lg"
                    onClick={() => handleResponse(currentQuestion.id, 'Yes')}
                    className={`px-8 py-4 text-lg ${
                      responses[currentQuestion.id] === 'Yes' 
                        ? `bg-gradient-to-r ${getCategoryGradient(questionnaire.category)} text-white border-0 shadow-lg`
                        : 'border-2 border-gray-300 hover:border-emerald-400'
                    }`}
                  >
                    <ThumbsUp className="w-5 h-5 mr-2" />
                    Yes
                  </Button>
                  <Button
                    variant={responses[currentQuestion.id] === 'No' ? 'default' : 'outline'}
                    size="lg"
                    onClick={() => handleResponse(currentQuestion.id, 'No')}
                    className={`px-8 py-4 text-lg ${
                      responses[currentQuestion.id] === 'No' 
                        ? `bg-gradient-to-r ${getCategoryGradient(questionnaire.category)} text-white border-0 shadow-lg`
                        : 'border-2 border-gray-300 hover:border-emerald-400'
                    }`}
                  >
                    <Shield className="w-5 h-5 mr-2" />
                    No
                  </Button>
                </div>
              )}

              {currentQuestion.type === 'number' && (
                <div className="max-w-md mx-auto">
                  <Input
                    type="number"
                    value={responses[currentQuestion.id] || ''}
                    onChange={(e) => handleResponse(currentQuestion.id, parseFloat(e.target.value))}
                    placeholder="Enter your answer..."
                    className="text-lg p-4 text-center border-2 border-gray-300 focus:border-emerald-500 rounded-xl"
                    min={currentQuestion.validationRules?.min}
                    max={currentQuestion.validationRules?.max}
                  />
                </div>
              )}

              {currentQuestion.type === 'scale' && (
                <div className="space-y-4">
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rating => (
                      <Button
                        key={rating}
                        variant={responses[currentQuestion.id] === rating ? 'default' : 'outline'}
                        size="lg"
                        onClick={() => handleResponse(currentQuestion.id, rating)}
                        className={`w-12 h-12 rounded-full ${
                          responses[currentQuestion.id] === rating 
                            ? `bg-gradient-to-r ${getCategoryGradient(questionnaire.category)} text-white border-0 shadow-lg`
                            : 'border-2 border-gray-300 hover:border-emerald-400'
                        }`}
                      >
                        {rating}
                      </Button>
                    ))}
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Not at all</span>
                    <span>Extremely</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            className="px-6 py-3"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {currentQuestionIndex === 0 ? "Cancel" : "Previous"}
          </Button>

          <div className="text-center">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Question {currentQuestionIndex + 1} of {questionnaire.questions.length}
            </div>
            <Progress value={progress} className="w-48 h-2" />
          </div>

          <Button
            onClick={handleNext}
            disabled={currentQuestion.required && !responses[currentQuestion.id]}
            className={`px-6 py-3 bg-gradient-to-r ${getCategoryGradient(questionnaire.category)} text-white border-0 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {currentQuestionIndex >= questionnaire.questions.length - 1 ? (
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
    );
  };

  const renderEducationalInsert = () => {
    if (!showEducational) return null;

    const IconComponent = getEducationalIcon(showEducational.type);

    return (
      <div className="space-y-6">
        <Card className={`border-2 ${showEducational.background} border-opacity-50`}>
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-white/80 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-4xl">{showEducational.icon}</span>
              </div>
              <Badge className="mb-4 text-lg px-4 py-2">
                {showEducational.type.charAt(0).toUpperCase() + showEducational.type.slice(1)}
              </Badge>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {showEducational.title}
              </h3>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto">
                {showEducational.content}
              </p>
            </div>

            <Button
              onClick={() => {
                setShowEducational(null);
                const nextIndex = getNextQuestionIndex(currentQuestionIndex);
                if (nextIndex >= questionnaire.questions.length) {
                  handleAnalyze();
                } else {
                  setCurrentQuestionIndex(nextIndex);
                }
              }}
              className={`px-8 py-3 bg-gradient-to-r ${getCategoryGradient(questionnaire.category)} text-white border-0 hover:shadow-lg`}
            >
              Continue Assessment
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderAnalysis = () => (
    <div className="space-y-6">
      <Card className="border-2 border-emerald-200 dark:border-emerald-800">
        <CardContent className="p-8 text-center">
          <div className={`w-24 h-24 bg-gradient-to-r ${getCategoryGradient(questionnaire.category)} rounded-full flex items-center justify-center mx-auto mb-6`}>
            <Brain className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            AI Health Analysis in Progress
          </h3>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Our advanced AI is analyzing your responses against clinical guidelines and safety protocols to provide personalized treatment recommendations.
          </p>

          {isAnalyzing && (
            <div className="space-y-6">
              <div className="flex items-center justify-center space-x-3 text-emerald-600">
                <div className="animate-spin w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full"></div>
                <span className="text-lg font-medium">Processing your health profile...</span>
              </div>
              <Progress value={75} className="w-full h-3" />
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Analyzing medical history and current symptoms...</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>Checking safety contraindications and drug interactions...</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Target className="w-4 h-4" />
                  <span>Calculating personalized treatment recommendations...</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderResults = () => {
    if (!result) return null;

    const isApproved = result.type === 'approved';
    const IconComponent = getCategoryIcon(questionnaire.category);

    return (
      <div className="space-y-6">
        <Card className={`border-2 ${isApproved ? 'border-emerald-500' : 'border-orange-500'}`}>
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className={`w-20 h-20 bg-gradient-to-r ${
                isApproved ? 'from-emerald-500 to-green-600' : 'from-orange-500 to-red-600'
              } rounded-full flex items-center justify-center mx-auto mb-4`}>
                {isApproved ? (
                  <CheckCircle className="w-10 h-10 text-white" />
                ) : (
                  <Clock className="w-10 h-10 text-white" />
                )}
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {isApproved ? 'Treatment Approved!' : 'Consultation Recommended'}
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                AI Confidence: {result.confidence}%
              </p>
            </div>

            {isApproved && result.primaryRecommendation && (
              <div className="space-y-6">
                {/* Primary Recommendation */}
                <Card className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          Recommended: {result.primaryRecommendation.name}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400 mb-3">
                          {result.primaryRecommendation.description}
                        </p>
                        <div className="flex items-center gap-4">
                          <Badge className="bg-emerald-100 text-emerald-800">
                            <Award className="w-3 h-3 mr-1" />
                            Effectiveness: {result.primaryRecommendation.effectiveness}/10
                          </Badge>
                          <Badge className="bg-blue-100 text-blue-800">
                            <Target className="w-3 h-3 mr-1" />
                            AI Score: {result.primaryRecommendation.score?.toFixed(1) || 'N/A'}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-emerald-600">
                          ${result.primaryRecommendation.cost}
                        </div>
                        <div className="text-sm text-gray-600">per month</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Available Dosages:</h5>
                        <div className="flex flex-wrap gap-2">
                          {result.primaryRecommendation.dosages.map((dosage: string, index: number) => (
                            <Badge key={index} variant="outline">
                              {dosage}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Why This Medication:</h5>
                        <ul className="text-sm space-y-1">
                          {result.reasoning?.slice(0, 3).map((reason: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-600 dark:text-gray-400">{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Alternative Options */}
                {result.alternativeOptions?.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Alternative Options
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {result.alternativeOptions.slice(0, 2).map((alt: any, index: number) => (
                        <Card key={index} className="border border-gray-200">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-semibold text-gray-900 dark:text-white">
                                {alt.name}
                              </h5>
                              <span className="text-lg font-bold text-gray-600">
                                ${alt.cost}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {alt.description}
                            </p>
                            <Badge className="bg-gray-100 text-gray-800">
                              Score: {alt.score?.toFixed(1) || 'N/A'}
                            </Badge>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!isApproved && (
              <div className="text-center space-y-4">
                <div className="p-6 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200">
                  <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">
                    Professional Consultation Required
                  </h4>
                  <p className="text-orange-700 dark:text-orange-300">
                    {result.message}
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between mt-8">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Review Responses
              </Button>
              <Button
                onClick={() => onComplete(result)}
                className={`px-8 py-3 bg-gradient-to-r ${
                  isApproved ? getCategoryGradient(questionnaire.category) : 'from-orange-500 to-red-500'
                } text-white border-0 hover:shadow-lg`}
              >
                {isApproved ? (
                  <>
                    Approve & Order Treatment
                    <CheckCircle className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    Schedule Consultation
                    <Calendar className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const CategoryIcon = getCategoryIcon(questionnaire.category);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold flex items-center gap-3">
            <div className={`w-12 h-12 bg-gradient-to-r ${getCategoryGradient(questionnaire.category)} rounded-xl flex items-center justify-center`}>
              <CategoryIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              {questionnaire.title}
              <div className="text-sm font-normal text-gray-600 dark:text-gray-400 mt-1">
                {questionnaire.description}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Welcome Message (Step 1, First Question) */}
        {currentStep === 1 && currentQuestionIndex === 0 && (
          <div className="mb-6 p-6 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-lg border border-emerald-200">
            <div className="flex items-start gap-4">
              <Heart className="w-8 h-8 text-emerald-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="text-xl font-semibold text-emerald-800 dark:text-emerald-200 mb-3">
                  Welcome to Your Personal Health Assessment
                </h4>
                <p className="text-emerald-700 dark:text-emerald-300 leading-relaxed mb-4">
                  {questionnaire.empathicIntro}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2 text-emerald-600">
                    <Clock className="w-4 h-4" />
                    <span>Estimated time: {questionnaire.estimatedTime}</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-600">
                    <Users className="w-4 h-4" />
                    <span>Completely confidential</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-600">
                    <Shield className="w-4 h-4" />
                    <span>FDA-guided recommendations</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        {currentStep === 1 && !showEducational && renderQuestion()}
        {showEducational && renderEducationalInsert()}
        {currentStep === 2 && renderAnalysis()}
        {currentStep === 3 && renderResults()}
      </DialogContent>
    </Dialog>
  );
}
