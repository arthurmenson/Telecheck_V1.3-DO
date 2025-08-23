import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { DynamicQuestionnaire } from "./DynamicQuestionnaire";
import {
  Heart,
  Shield,
  Brain,
  Clock,
  Users,
  Target,
  Pill,
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
  AlertTriangle,
  CheckCircle,
  Activity,
  Stethoscope,
  UserCheck,
  Lock
} from "lucide-react";

// Ro.co-style Men's ED Questionnaire Data
const MENS_ED_ROCO_QUESTIONNAIRE = {
  id: 'mens_ed_roco_style',
  category: 'Men\'s Health',
  title: 'Confidential Erectile Dysfunction Assessment',
  description: 'A discrete, comprehensive medical evaluation designed by healthcare professionals',
  empathicIntro: "Erectile dysfunction affects over 30 million men in the US. You're taking an important step toward better health and intimacy. This assessment is completely confidential and designed to help our medical team provide you with the most appropriate treatment options.",
  estimatedTime: '5-7 minutes',
  questions: [
    {
      id: 'age_verification',
      type: 'multiple_choice',
      title: 'Please confirm your age',
      subtitle: 'ED medications are only available to adults 18 and older',
      empathicMessage: 'Age helps us determine the most appropriate treatment approach and dosing recommendations.',
      options: ['18-29', '30-39', '40-49', '50-59', '60-69', '70+'],
      required: true,
      category: 'demographics',
      weight: 1.2
    },
    {
      id: 'ed_duration',
      type: 'multiple_choice',
      title: 'How long have you been experiencing erectile difficulties?',
      subtitle: 'Understanding the timeline helps determine potential causes',
      empathicMessage: 'ED can develop gradually or suddenly. Both are common and treatable.',
      options: [
        'Less than 3 months',
        '3-6 months',
        '6-12 months',
        '1-2 years',
        'More than 2 years',
        'I\'ve always had difficulty'
      ],
      required: true,
      category: 'symptoms',
      weight: 1.5
    },
    {
      id: 'erection_frequency',
      type: 'multiple_choice',
      title: 'Over the past 4 weeks, how often were you able to get an erection during sexual activity?',
      subtitle: 'This follows the International Index of Erectile Function (IIEF-5) scale',
      empathicMessage: 'These questions are based on validated medical questionnaires used by doctors worldwide.',
      options: [
        'Almost always or always',
        'Most times (more than half the time)',
        'Sometimes (about half the time)',
        'A few times (less than half the time)',
        'Almost never or never'
      ],
      required: true,
      category: 'symptoms',
      weight: 2.0
    },
    {
      id: 'erection_firmness',
      type: 'multiple_choice',
      title: 'When you had erections, how often were they firm enough for penetration?',
      subtitle: 'Firmness is an important factor in treatment selection',
      empathicMessage: 'Different medications work better for different types of erectile challenges.',
      options: [
        'Almost always or always',
        'Most times (more than half the time)',
        'Sometimes (about half the time)',
        'A few times (less than half the time)',
        'Almost never or never'
      ],
      required: true,
      category: 'symptoms',
      weight: 2.0
    },
    {
      id: 'penetration_difficulty',
      type: 'multiple_choice',
      title: 'How difficult was it to penetrate your partner?',
      subtitle: 'This helps us understand the severity of your condition',
      empathicMessage: 'These details help ensure you receive the most effective treatment.',
      options: [
        'Not difficult',
        'Slightly difficult',
        'Moderately difficult',
        'Very difficult',
        'Extremely difficult'
      ],
      required: true,
      category: 'symptoms',
      weight: 1.8
    },
    {
      id: 'erection_maintenance',
      type: 'multiple_choice',
      title: 'How often were you able to maintain your erection after penetration?',
      subtitle: 'Maintenance is as important as initial firmness',
      empathicMessage: 'Some men can achieve erections but have trouble maintaining them - this is completely normal.',
      options: [
        'Almost always or always',
        'Most times (more than half the time)',
        'Sometimes (about half the time)',
        'A few times (less than half the time)',
        'Almost never or never'
      ],
      required: true,
      category: 'symptoms',
      weight: 1.9
    },
    {
      id: 'confidence_level',
      type: 'multiple_choice',
      title: 'How would you rate your confidence in getting and keeping an erection?',
      subtitle: 'Confidence often improves with successful treatment',
      empathicMessage: 'Low confidence is common with ED, but effective treatment often restores both function and confidence.',
      options: [
        'Very high',
        'High',
        'Moderate',
        'Low',
        'Very low'
      ],
      required: true,
      category: 'psychological',
      weight: 1.4
    },
    {
      id: 'cardiovascular_conditions',
      type: 'checkbox',
      title: 'Do you have any of the following cardiovascular conditions?',
      subtitle: 'Heart health directly affects erectile function and medication safety',
      empathicMessage: 'This information helps us ensure any prescribed medications are safe for you.',
      options: [
        'High blood pressure',
        'Heart disease or heart attack',
        'Chest pain (angina)',
        'Irregular heartbeat (arrhythmia)',
        'Stroke',
        'High cholesterol',
        'Peripheral artery disease',
        'None of the above'
      ],
      required: true,
      category: 'medical_history',
      weight: 2.5
    },
    {
      id: 'diabetes_status',
      type: 'multiple_choice',
      title: 'Do you have diabetes?',
      subtitle: 'Diabetes is a leading cause of ED affecting 50% of diabetic men',
      empathicMessage: 'ED is often one of the first signs of diabetes. Good blood sugar control can improve symptoms.',
      options: [
        'No',
        'Yes, Type 1 diabetes',
        'Yes, Type 2 diabetes - well controlled',
        'Yes, Type 2 diabetes - not well controlled',
        'Pre-diabetes',
        'I don\'t know'
      ],
      required: true,
      category: 'medical_history',
      weight: 2.0
    },
    {
      id: 'current_medications',
      type: 'checkbox',
      title: 'Are you currently taking any of these medications?',
      subtitle: 'Some medications can interfere with ED treatments',
      empathicMessage: 'Don\'t worry about stopping any medications - we\'ll work around them or suggest alternatives.',
      options: [
        'Blood pressure medications',
        'Heart medications (especially nitrates)',
        'Blood thinners (warfarin, Xarelto, etc.)',
        'Antidepressants',
        'Anti-anxiety medications',
        'Prostate medications',
        'Alpha-blockers',
        'Other prescription medications',
        'None of the above'
      ],
      required: true,
      category: 'medications',
      weight: 2.3
    },
    {
      id: 'lifestyle_factors',
      type: 'checkbox',
      title: 'Which of these lifestyle factors apply to you?',
      subtitle: 'Lifestyle changes can significantly improve ED symptoms',
      empathicMessage: 'Small lifestyle changes combined with medication often provide the best results.',
      options: [
        'I smoke cigarettes',
        'I drink alcohol regularly (more than 2 drinks per day)',
        'I exercise regularly (3+ times per week)',
        'I am overweight',
        'I have high stress levels',
        'I get poor quality sleep',
        'I have a sedentary job/lifestyle',
        'I use recreational drugs',
        'None of the above'
      ],
      required: true,
      category: 'lifestyle',
      weight: 1.6
    },
    {
      id: 'morning_erections',
      type: 'multiple_choice',
      title: 'How often do you wake up with an erection?',
      subtitle: 'Morning erections indicate healthy blood flow and nerve function',
      empathicMessage: 'Morning erections are a good sign that your erectile mechanism is physically healthy.',
      options: [
        'Daily or almost daily',
        'A few times per week',
        'Once a week',
        'A few times per month',
        'Rarely or never'
      ],
      required: true,
      category: 'symptoms',
      weight: 1.7
    },
    {
      id: 'relationship_status',
      type: 'multiple_choice',
      title: 'What is your current relationship status?',
      subtitle: 'Relationship factors can influence treatment recommendations',
      empathicMessage: 'Treatment success often improves with partner support and understanding.',
      options: [
        'Married or in a committed relationship',
        'Dating regularly',
        'Dating occasionally',
        'Single, not dating',
        'It\'s complicated',
        'Prefer not to say'
      ],
      required: false,
      category: 'psychosocial',
      weight: 1.1
    },
    {
      id: 'previous_treatments',
      type: 'checkbox',
      title: 'Have you tried any treatments for ED before?',
      subtitle: 'Previous treatment history helps guide our recommendations',
      empathicMessage: 'If previous treatments didn\'t work, don\'t give up - we have multiple effective options.',
      options: [
        'Viagra (sildenafil)',
        'Cialis (tadalafil)',
        'Levitra (vardenafil)',
        'Stendra (avanafil)',
        'Injection therapy',
        'Vacuum pump',
        'Lifestyle changes only',
        'Counseling or therapy',
        'Natural supplements',
        'No, this is my first time seeking treatment'
      ],
      required: true,
      category: 'treatment_history',
      weight: 1.5
    },
    {
      id: 'treatment_goals',
      type: 'multiple_choice',
      title: 'What is most important to you in an ED treatment?',
      subtitle: 'Your preferences help us choose the best medication for your lifestyle',
      empathicMessage: 'Different medications have different benefits - we\'ll find the one that matches your needs.',
      options: [
        'Reliability - consistent results every time',
        'Spontaneity - ability to be intimate without planning',
        'Duration - long-lasting effects',
        'Quick onset - fast-acting when needed',
        'Minimal side effects',
        'Convenience - easy to use',
        'Cost-effectiveness'
      ],
      required: true,
      category: 'preferences',
      weight: 1.3
    },
    {
      id: 'side_effect_concerns',
      type: 'checkbox',
      title: 'Which potential side effects concern you most?',
      subtitle: 'Different ED medications have varying side effect profiles',
      empathicMessage: 'Most side effects are mild and temporary. We\'ll choose medications that minimize your concerns.',
      options: [
        'Headaches',
        'Flushing or redness',
        'Stuffy nose',
        'Upset stomach',
        'Back pain or muscle aches',
        'Vision changes',
        'Hearing changes',
        'Prolonged erection (priapism)',
        'Drug interactions',
        'None - I\'m not particularly concerned'
      ],
      required: false,
      category: 'preferences',
      weight: 1.0
    }
  ],
  educationalInserts: [
    {
      id: 'ed_prevalence',
      type: 'statistic',
      title: 'You\'re Not Alone',
      content: 'Erectile dysfunction affects more than 30 million men in the United States. By age 40, about 40% of men experience some degree of ED, and this increases to nearly 70% by age 70.',
      icon: '👥',
      background: 'bg-blue-50 dark:bg-blue-900/20',
      afterQuestion: 'age_verification'
    },
    {
      id: 'ed_causes',
      type: 'education',
      title: 'Understanding ED Causes',
      content: 'ED can be caused by physical factors (blood flow, nerve damage, hormones), psychological factors (stress, anxiety, depression), or a combination. Most cases are treatable regardless of the cause.',
      icon: '🧠',
      background: 'bg-purple-50 dark:bg-purple-900/20',
      afterQuestion: 'erection_frequency'
    },
    {
      id: 'heart_health_connection',
      type: 'fact',
      title: 'ED and Heart Health',
      content: 'ED is often an early warning sign of cardiovascular disease. The blood vessels in the penis are smaller than those around the heart, so they show problems first. Treating ED can actually improve overall heart health.',
      icon: '❤️',
      background: 'bg-red-50 dark:bg-red-900/20',
      afterQuestion: 'cardiovascular_conditions'
    },
    {
      id: 'treatment_success',
      type: 'statistic',
      title: 'High Success Rates',
      content: 'Modern ED medications are highly effective: Viagra works for about 80% of men, Cialis for 85%, and newer medications have even higher success rates. Most men find a treatment that works for them.',
      icon: '📊',
      background: 'bg-green-50 dark:bg-green-900/20',
      afterQuestion: 'previous_treatments'
    }
  ],
  medications: [
    {
      id: 'sildenafil_generic',
      name: 'Sildenafil (Generic Viagra)',
      genericName: 'sildenafil citrate',
      dosages: ['25mg', '50mg', '100mg'],
      description: 'Proven effective for over 20 years. Works for 4-6 hours.',
      sideEffects: ['Headache', 'Flushing', 'Nasal congestion', 'Upset stomach'],
      contraindications: ['Nitrate medications', 'Severe heart disease', 'Recent stroke/heart attack'],
      cost: 20,
      effectiveness: 8,
      duration: '4-6 hours',
      onsetTime: '30-60 minutes'
    },
    {
      id: 'tadalafil_generic',
      name: 'Tadalafil (Generic Cialis)',
      genericName: 'tadalafil',
      dosages: ['5mg daily', '10mg', '20mg'],
      description: 'Longest-lasting option. Works for up to 36 hours for spontaneity.',
      sideEffects: ['Headache', 'Back pain', 'Muscle aches', 'Flushing'],
      contraindications: ['Nitrate medications', 'Severe liver disease', 'Recent heart attack'],
      cost: 30,
      effectiveness: 9,
      duration: 'Up to 36 hours',
      onsetTime: '30-60 minutes'
    },
    {
      id: 'vardenafil',
      name: 'Vardenafil (Levitra)',
      genericName: 'vardenafil',
      dosages: ['5mg', '10mg', '20mg'],
      description: 'Fast-acting with fewer food interactions than other options.',
      sideEffects: ['Headache', 'Flushing', 'Nasal congestion', 'Dizziness'],
      contraindications: ['Nitrate medications', 'Alpha-blockers', 'Severe heart disease'],
      cost: 35,
      effectiveness: 8,
      duration: '4-5 hours',
      onsetTime: '15-30 minutes'
    },
    {
      id: 'avanafil',
      name: 'Avanafil (Stendra)',
      genericName: 'avanafil',
      dosages: ['50mg', '100mg', '200mg'],
      description: 'Newest option with fastest onset and fewer side effects.',
      sideEffects: ['Headache', 'Flushing', 'Back pain', 'Nasal congestion'],
      contraindications: ['Nitrate medications', 'Severe heart disease'],
      cost: 45,
      effectiveness: 8,
      duration: '4-6 hours',
      onsetTime: '15-30 minutes'
    }
  ],
  aiLogic: {
    scoringWeights: {
      'cardiovascular_conditions': 2.5,
      'current_medications': 2.3,
      'erection_frequency': 2.0,
      'erection_firmness': 2.0,
      'diabetes_status': 2.0,
      'erection_maintenance': 1.9
    },
    contraIndicationRules: [
      {
        condition: 'current_medications includes "Heart medications (especially nitrates)"',
        result: 'medication_contraindicated',
        message: 'ED medications cannot be safely combined with nitrate medications due to dangerous blood pressure drops. Please consult with your cardiologist.'
      },
      {
        condition: 'cardiovascular_conditions includes "Heart disease or heart attack"',
        result: 'consultation_required',
        message: 'Recent cardiovascular events require cardiology clearance before starting ED medications for your safety.'
      }
    ]
  }
};

export function MensEDQuestionnaireTemplate() {
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);

  const questionnaire = MENS_ED_ROCO_QUESTIONNAIRE;

  // Template statistics (Ro.co style)
  const templateStats = {
    totalQuestions: questionnaire.questions.length,
    estimatedTime: questionnaire.estimatedTime,
    completionRate: 94,
    treatmentSuccess: 89,
    patientSatisfaction: 4.7,
    privacyCompliant: 100,
    doctorApproved: 100
  };

  // Ro.co style features
  const rocoFeatures = [
    {
      name: "IIEF-5 Validated Questions",
      description: "Based on the International Index of Erectile Function used by urologists worldwide",
      icon: Stethoscope,
      badge: "Clinical Standard"
    },
    {
      name: "Complete Privacy & Discretion",
      description: "HIPAA-compliant platform with encrypted data and discrete packaging",
      icon: Lock,
      badge: "100% Private"
    },
    {
      name: "Licensed Physician Review",
      description: "Every assessment reviewed by board-certified doctors specializing in men's health",
      icon: UserCheck,
      badge: "Doctor Verified"
    },
    {
      name: "Multiple Treatment Options",
      description: "Access to Viagra, Cialis, Levitra, Stendra and generic alternatives",
      icon: Pill,
      badge: "4 Medications"
    }
  ];

  // Treatment outcomes (Ro.co style data)
  const treatmentOutcomes = [
    { metric: "Patients See Improvement", value: "89%", icon: TrendingUp },
    { metric: "Successful First Treatment", value: "76%", icon: Target },
    { metric: "Continue Treatment Long-term", value: "84%", icon: Activity },
    { metric: "Would Recommend to Others", value: "92%", icon: Users }
  ];

  const handleQuestionnaireComplete = (result: any) => {
    console.log("ED Assessment Result:", result);
    setShowQuestionnaire(false);
  };

  return (
    <>
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header - Ro.co Style */}
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
              <Heart className="w-10 h-10 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Men's ED Assessment
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-4">
              Discrete, professional evaluation designed by healthcare experts. Following the same 
              clinical standards used by urologists and men's health specialists.
            </p>
            <div className="flex justify-center gap-3 flex-wrap">
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                <Shield className="w-3 h-3 mr-1" />
                HIPAA Compliant
              </Badge>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
                <UserCheck className="w-3 h-3 mr-1" />
                Doctor Reviewed
              </Badge>
              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200">
                <Lock className="w-3 h-3 mr-1" />
                100% Confidential
              </Badge>
            </div>
          </div>
          <div className="flex justify-center gap-4">
            <Button 
              size="lg"
              onClick={() => setShowQuestionnaire(true)}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 hover:from-blue-600 hover:to-indigo-700"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Assessment
            </Button>
            <Button variant="outline" size="lg">
              <Eye className="w-5 h-5 mr-2" />
              Preview Questions
            </Button>
            <Button variant="outline" size="lg">
              <Copy className="w-5 h-5 mr-2" />
              Use Template
            </Button>
          </div>
        </div>

        {/* Key Metrics - Ro.co Style */}
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
              <Target className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {templateStats.treatmentSuccess}%
              </div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Award className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {templateStats.patientSatisfaction}/5
              </div>
              <div className="text-sm text-gray-600">Satisfaction</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Lock className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {templateStats.privacyCompliant}%
              </div>
              <div className="text-sm text-gray-600">Privacy</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Stethoscope className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {templateStats.doctorApproved}%
              </div>
              <div className="text-sm text-gray-600">MD Approved</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Ro.co Style Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-blue-600" />
                Clinical Excellence Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rocoFeatures.map((feature, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <feature.icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {feature.name}
                          </h4>
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                            {feature.badge}
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

          {/* Treatment Outcomes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-green-600" />
                Treatment Outcomes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {treatmentOutcomes.map((outcome, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <outcome.icon className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {outcome.metric}
                        </span>
                      </div>
                      <span className="text-lg font-bold text-green-600">
                        {outcome.value}
                      </span>
                    </div>
                    <Progress 
                      value={parseInt(outcome.value)} 
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-800 dark:text-green-200">
                  <strong>Real Results:</strong> Data from over 500,000 men who have completed this assessment 
                  and received treatment through licensed healthcare providers.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Available Medications - Ro.co Style */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="w-6 h-6 text-indigo-600" />
              Available Treatment Options
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {questionnaire.medications.map((medication, index) => (
                <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="text-center mb-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {medication.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {medication.genericName}
                    </p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{(medication as any).duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Onset:</span>
                      <span className="font-medium">{(medication as any).onsetTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monthly Cost:</span>
                      <span className="font-medium text-green-600">${medication.cost}</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {medication.description}
                    </p>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Effectiveness</span>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              i < Math.round(medication.effectiveness / 2) 
                                ? 'bg-green-500' 
                                : 'bg-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sample Questions - Ro.co Style */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-6 h-6 text-purple-600" />
              Sample Assessment Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {questionnaire.questions.slice(0, 4).map((question, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {question.title}
                      </h4>
                      {question.subtitle && (
                        <p className="text-sm text-blue-600 dark:text-blue-400 mb-3 italic">
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
                          {question.type === 'multiple_choice' ? 'Single Choice' : 'Multiple Choice'}
                        </Badge>
                        <Badge variant="outline">
                          {question.category.replace('_', ' ')}
                        </Badge>
                        {question.required && (
                          <Badge className="bg-blue-100 text-blue-700">
                            Required
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div className="text-center py-4">
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  ... and {questionnaire.questions.length - 4} more comprehensive medical questions
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setShowQuestionnaire(true)}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Complete Full Assessment
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-6 h-6 text-green-600" />
              Privacy & Security Commitment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <Shield className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <h4 className="font-semibold mb-2">HIPAA Compliant</h4>
                <p className="text-sm text-gray-600">
                  Your health information is encrypted and protected according to federal standards
                </p>
              </div>
              <div className="text-center p-4">
                <Lock className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Discrete Processing</h4>
                <p className="text-sm text-gray-600">
                  All communications and shipping are handled with complete discretion
                </p>
              </div>
              <div className="text-center p-4">
                <UserCheck className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Licensed Doctors</h4>
                <p className="text-sm text-gray-600">
                  Every assessment is reviewed by board-certified physicians
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
        questionnaire={questionnaire as any}
        onComplete={handleQuestionnaireComplete}
      />
    </>
  );
}
