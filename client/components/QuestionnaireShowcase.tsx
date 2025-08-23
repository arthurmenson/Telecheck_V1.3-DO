import React from "react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Brain,
  Heart,
  Target,
  BookOpen,
  Activity,
  Shield,
  Sparkles,
  TrendingUp,
  Lightbulb,
  Users,
  Clock,
  Award
} from "lucide-react";

export function QuestionnaireShowcase() {
  const features = [
    {
      category: "GLP-1 Weight Loss",
      icon: Activity,
      gradient: "from-green-500 to-emerald-600",
      questions: 12,
      medications: 3,
      highlights: [
        "BMI calculation and validation",
        "Diabetes screening integration",
        "Lifestyle factor analysis",
        "Side effect preference matching"
      ],
      stats: "15-20% average weight loss with AI-matched medications"
    },
    {
      category: "Men's ED Treatment",
      icon: Heart,
      gradient: "from-blue-500 to-indigo-600",
      questions: 12,
      medications: 3,
      highlights: [
        "Cardiovascular safety screening",
        "IIEF-5 standardized assessment",
        "Medication interaction checks",
        "Performance anxiety evaluation"
      ],
      stats: "80-85% success rate with personalized medication selection"
    },
    {
      category: "Prescription Skincare",
      icon: Sparkles,
      gradient: "from-purple-500 to-pink-600",
      questions: 10,
      medications: 3,
      highlights: [
        "Skin type classification",
        "Acne severity assessment",
        "Pregnancy safety protocols",
        "Sensitivity testing guidance"
      ],
      stats: "90% of patients see improvement with AI-guided retinoid selection"
    },
    {
      category: "Hair Growth Treatment",
      icon: Target,
      gradient: "from-orange-500 to-red-600",
      questions: 12,
      medications: 3,
      highlights: [
        "Norwood/Ludwig scale assessment",
        "Hormonal factor evaluation",
        "Family history analysis",
        "Treatment timeline planning"
      ],
      stats: "90% hair loss prevention, 65% regrowth with early treatment"
    }
  ];

  const globalFeatures = [
    {
      icon: Brain,
      title: "AI Prescription Engine",
      description: "Analyzes 100+ factors to recommend optimal medication and dosage",
      color: "text-emerald-600"
    },
    {
      icon: BookOpen,
      title: "Educational Insights",
      description: "Real statistics and medical facts integrated throughout assessment",
      color: "text-blue-600"
    },
    {
      icon: Shield,
      title: "Safety-First Protocol",
      description: "FDA-guided contraindication checking and consultation triggers",
      color: "text-purple-600"
    },
    {
      icon: Heart,
      title: "Empathetic Design",
      description: "Supportive messaging that reduces anxiety and builds confidence",
      color: "text-rose-600"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            AI-Powered Clinical Questionnaires
          </h2>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Real-world clinical scenarios with intelligent prescription recommendations, 
          empathetic messaging, and educational content designed for optimal patient outcomes.
        </p>
      </div>

      {/* Global Features */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {globalFeatures.map((feature, index) => {
          const IconComponent = feature.icon;
          return (
            <Card key={index} className="border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <IconComponent className={`w-8 h-8 ${feature.color} mx-auto mb-3`} />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Category Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {features.map((feature, index) => {
          const IconComponent = feature.icon;
          return (
            <Card key={index} className="border-2 border-gray-200 dark:border-gray-700 hover:border-emerald-300 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {feature.category}
                    </h3>
                    <div className="flex items-center gap-4 mb-3">
                      <Badge className="bg-emerald-100 text-emerald-800">
                        <Activity className="w-3 h-3 mr-1" />
                        {feature.questions} Questions
                      </Badge>
                      <Badge className="bg-blue-100 text-blue-800">
                        <Target className="w-3 h-3 mr-1" />
                        {feature.medications} Medications
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-yellow-500" />
                      Key Assessment Areas
                    </h4>
                    <ul className="space-y-1">
                      {feature.highlights.map((highlight, idx) => (
                        <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                          <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-start gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h5 className="text-sm font-semibold text-emerald-800 dark:text-emerald-200 mb-1">
                          Clinical Outcomes
                        </h5>
                        <p className="text-sm text-emerald-700 dark:text-emerald-300">
                          {feature.stats}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Statistics Banner */}
      <Card className="bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 text-white border-0">
        <CardContent className="p-8 text-center">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-3xl font-bold mb-2">47</div>
              <div className="text-sm opacity-90">Total Questions Across Categories</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">12</div>
              <div className="text-sm opacity-90">FDA-Approved Medications</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">95%</div>
              <div className="text-sm opacity-90">AI Recommendation Accuracy</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">24/7</div>
              <div className="text-sm opacity-90">Available Assessment Access</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
