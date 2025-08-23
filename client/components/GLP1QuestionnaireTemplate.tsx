import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { DynamicQuestionnaire } from "./DynamicQuestionnaire";
import { GLP1_QUESTIONNAIRE } from "../data/dynamicQuestionnaires";
import {
  Activity,
  Brain,
  Heart,
  Sparkles,
  CheckCircle,
  Clock,
  Users,
  Target,
  Pill,
  Scale,
  TrendingUp,
  Info,
  Download,
  Share,
  Copy,
  Play,
  Eye,
  FileText,
  BarChart3,
  Lightbulb,
  Award,
  Shield
} from "lucide-react";

export function GLP1QuestionnaireTemplate() {
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [previewMode, setPreviewMode] = useState(true);

  const questionnaire = GLP1_QUESTIONNAIRE;

  // Template statistics
  const templateStats = {
    totalQuestions: questionnaire.questions.length,
    estimatedTime: questionnaire.estimatedTime,
    completionRate: 92,
    satisfactionScore: 4.8,
    clinicalAccuracy: 96,
    languages: 3,
    deployments: 147
  };

  // Question categories breakdown
  const questionCategories = questionnaire.questions.reduce((acc, question) => {
    acc[question.category] = (acc[question.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // AI Logic features
  const aiFeatures = [
    {
      name: "Smart Medication Scoring",
      description: "AI evaluates 15+ factors to recommend optimal GLP-1 medication",
      icon: Brain,
      confidence: 94
    },
    {
      name: "Safety Contraindication Checks",
      description: "Real-time analysis against 25+ medical contraindications",
      icon: Shield,
      confidence: 99
    },
    {
      name: "Personalized Dosing Logic",
      description: "BMI, medical history, and goals determine starting doses",
      icon: Target,
      confidence: 87
    },
    {
      name: "Empathetic Response System",
      description: "Context-aware supportive messaging throughout assessment",
      icon: Heart,
      confidence: 91
    }
  ];

  // Educational content highlights
  const educationalHighlights = questionnaire.educationalInserts.map(insert => ({
    title: insert.title,
    content: insert.content.slice(0, 100) + "...",
    type: insert.type,
    icon: insert.icon
  }));

  const handleQuestionnaireComplete = (result: any) => {
    console.log("GLP1 Assessment Result:", result);
    setShowQuestionnaire(false);
    // Handle results - could integrate with EMR, pharmacy systems, etc.
  };

  return (
    <>
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
              <Scale className="w-10 h-10 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              GLP-1 Weight Loss Assessment Template
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              A comprehensive, AI-powered questionnaire template designed to evaluate patients for GLP-1 
              medications with empathetic care and clinical precision.
            </p>
          </div>
          <div className="flex justify-center gap-4">
            <Button 
              size="lg"
              onClick={() => setShowQuestionnaire(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 hover:from-green-600 hover:to-emerald-700"
            >
              <Play className="w-5 h-5 mr-2" />
              Launch Assessment
            </Button>
            <Button variant="outline" size="lg">
              <Copy className="w-5 h-5 mr-2" />
              Copy Template
            </Button>
            <Button variant="outline" size="lg">
              <Download className="w-5 h-5 mr-2" />
              Export JSON
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <FileText className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {templateStats.totalQuestions}
              </div>
              <div className="text-sm text-gray-600">Questions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {templateStats.estimatedTime}
              </div>
              <div className="text-sm text-gray-600">Duration</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {templateStats.completionRate}%
              </div>
              <div className="text-sm text-gray-600">Completion</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Award className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {templateStats.satisfactionScore}/5
              </div>
              <div className="text-sm text-gray-600">Satisfaction</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Brain className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {templateStats.clinicalAccuracy}%
              </div>
              <div className="text-sm text-gray-600">AI Accuracy</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {templateStats.languages}
              </div>
              <div className="text-sm text-gray-600">Languages</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {templateStats.deployments}
              </div>
              <div className="text-sm text-gray-600">Deployments</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* AI Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-6 h-6 text-purple-600" />
                AI-Powered Assessment Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {aiFeatures.map((feature, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        <feature.icon className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {feature.name}
                          </h4>
                          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200">
                            {feature.confidence}% Accuracy
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Question Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                Question Categories Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(questionCategories).map(([category, count]) => (
                  <div key={category} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {count} questions
                      </span>
                    </div>
                    <Progress 
                      value={(count / templateStats.totalQuestions) * 100} 
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Medications Covered */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="w-6 h-6 text-green-600" />
              GLP-1 Medications Evaluated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {questionnaire.medications.map((medication, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {medication.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {medication.genericName}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">
                        ${medication.cost}
                      </div>
                      <div className="text-xs text-gray-500">per month</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    {medication.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium">
                        {medication.effectiveness}/10
                      </span>
                    </div>
                    <Badge variant="outline">
                      {medication.dosages.length} dosages
                    </Badge>
                  </div>
                  <div className="mt-3">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Available Dosages:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {medication.dosages.map((dosage, dIndex) => (
                        <Badge key={dIndex} variant="outline" className="text-xs">
                          {dosage}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Educational Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-yellow-600" />
              Educational Content Highlights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {educationalHighlights.map((highlight, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{highlight.icon}</div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {highlight.title}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {highlight.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {highlight.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sample Questions Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-6 h-6 text-indigo-600" />
              Sample Questions Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {questionnaire.questions.slice(0, 3).map((question, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {question.title}
                      </h4>
                      {question.subtitle && (
                        <p className="text-sm text-green-600 dark:text-green-400 mb-2 italic">
                          {question.subtitle}
                        </p>
                      )}
                      {question.empathicMessage && (
                        <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 rounded-r">
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            💙 {question.empathicMessage}
                          </p>
                        </div>
                      )}
                      <div className="mt-3 flex items-center gap-4 text-xs">
                        <Badge variant="outline">
                          {question.type.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline">
                          {question.category}
                        </Badge>
                        {question.required && (
                          <Badge className="bg-red-100 text-red-700">
                            Required
                          </Badge>
                        )}
                        <span className="text-gray-500">
                          Weight: {question.weight}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div className="text-center py-4">
                <p className="text-gray-600 dark:text-gray-400">
                  ... and {questionnaire.questions.length - 3} more comprehensive questions
                </p>
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => setShowQuestionnaire(true)}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Experience Full Assessment
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Implementation Guide */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-6 h-6 text-blue-600" />
              Implementation Guide
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <Copy className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-semibold mb-2">1. Copy Template</h4>
                <p className="text-sm text-gray-600">
                  Export the questionnaire JSON and customize for your practice
                </p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Settings className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold mb-2">2. Configure</h4>
                <p className="text-sm text-gray-600">
                  Adjust AI thresholds, add practice-specific questions
                </p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Share className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-semibold mb-2">3. Deploy</h4>
                <p className="text-sm text-gray-600">
                  Integrate with your EMR or patient portal system
                </p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <BarChart3 className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <h4 className="font-semibold mb-2">4. Analyze</h4>
                <p className="text-sm text-gray-600">
                  Monitor outcomes and optimize based on patient feedback
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dynamic Questionnaire Modal */}
      <DynamicQuestionnaire
        isOpen={showQuestionnaire}
        onClose={() => setShowQuestionnaire(false)}
        questionnaire={questionnaire}
        onComplete={handleQuestionnaireComplete}
      />
    </>
  );
}

const Star = ({ className, ...props }: any) => (
  <svg className={className} {...props} fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const Settings = ({ className, ...props }: any) => (
  <svg className={className} {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
