import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { 
  Brain, 
  Target, 
  Users, 
  TrendingUp, 
  Package, 
  Zap, 
  Settings, 
  Activity,
  Eye,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Clock,
  Star,
  Heart,
  ShoppingCart,
  AlertTriangle,
  CheckCircle,
  Filter,
  Search,
  BarChart3,
  Lightbulb,
  Database,
  Globe
} from "lucide-react";

interface RecommendationRule {
  id: string;
  name: string;
  type: 'collaborative' | 'content_based' | 'clinical' | 'behavioral' | 'seasonal';
  status: 'active' | 'draft' | 'paused';
  priority: number;
  triggers: {
    productViewed?: string[];
    categoryViewed?: string[];
    cartContains?: string[];
    customerSegment?: string[];
    medicalConditions?: string[];
    previousPurchases?: string[];
    timeSpent?: number;
    sessionCount?: number;
  };
  recommendations: {
    products: string[];
    maxRecommendations: number;
    personalizationWeight: number;
  };
  performance: {
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
    clickThroughRate: number;
    conversionRate: number;
  };
  createdDate: string;
  lastUpdated: string;
}

interface AIModel {
  id: string;
  name: string;
  type: 'deep_learning' | 'collaborative_filtering' | 'content_based' | 'hybrid';
  accuracy: number;
  trainingData: number;
  lastTrained: string;
  status: 'active' | 'training' | 'idle';
  features: string[];
  performance: {
    precision: number;
    recall: number;
    f1Score: number;
    coverage: number;
  };
}

interface CustomerInsight {
  segment: string;
  size: number;
  avgOrderValue: number;
  recommendationAcceptance: number;
  topCategories: string[];
  behaviorPatterns: {
    avgSessionTime: number;
    pagesPerSession: number;
    returnVisitRate: number;
    seasonalTrends: string[];
  };
}

export function RecommendationEngine() {
  const [activeTab, setActiveTab] = useState('overview');
  const [recommendationRules, setRecommendationRules] = useState<RecommendationRule[]>([]);
  const [aiModels, setAiModels] = useState<AIModel[]>([]);
  const [customerInsights, setCustomerInsights] = useState<CustomerInsight[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    // Initialize with sample data
    setRecommendationRules([
      {
        id: 'rule_1',
        name: 'Heart Health Cross-sell',
        type: 'clinical',
        status: 'active',
        priority: 1,
        triggers: {
          productViewed: ['atorvastatin_20mg'],
          medicalConditions: ['hypertension', 'high_cholesterol']
        },
        recommendations: {
          products: ['aspirin_81mg', 'omega3_1000mg', 'bp_monitor'],
          maxRecommendations: 3,
          personalizationWeight: 0.8
        },
        performance: {
          impressions: 2145,
          clicks: 387,
          conversions: 156,
          revenue: 8234.67,
          clickThroughRate: 18.0,
          conversionRate: 40.3
        },
        createdDate: '2024-01-15',
        lastUpdated: '2024-03-10'
      },
      {
        id: 'rule_2',
        name: 'Diabetes Management Recommendations',
        type: 'clinical',
        status: 'active',
        priority: 1,
        triggers: {
          productViewed: ['metformin_1000mg'],
          medicalConditions: ['diabetes', 'pre_diabetes']
        },
        recommendations: {
          products: ['glucose_monitor', 'diabetic_vitamins', 'test_strips'],
          maxRecommendations: 4,
          personalizationWeight: 0.9
        },
        performance: {
          impressions: 1876,
          clicks: 298,
          conversions: 134,
          revenue: 12456.89,
          clickThroughRate: 15.9,
          conversionRate: 45.0
        },
        createdDate: '2024-01-20',
        lastUpdated: '2024-03-12'
      },
      {
        id: 'rule_3',
        name: 'Frequently Bought Together',
        type: 'collaborative',
        status: 'active',
        priority: 2,
        triggers: {
          cartContains: ['any_prescription']
        },
        recommendations: {
          products: ['pill_organizer', 'medication_reminder', 'pharmacy_app'],
          maxRecommendations: 2,
          personalizationWeight: 0.6
        },
        performance: {
          impressions: 3421,
          clicks: 456,
          conversions: 89,
          revenue: 2345.12,
          clickThroughRate: 13.3,
          conversionRate: 19.5
        },
        createdDate: '2024-02-01',
        lastUpdated: '2024-03-08'
      }
    ]);

    setAiModels([
      {
        id: 'model_1',
        name: 'Clinical Recommendation Model',
        type: 'hybrid',
        accuracy: 87.4,
        trainingData: 145000,
        lastTrained: '2024-03-01',
        status: 'active',
        features: ['medical_conditions', 'medication_history', 'demographics', 'lab_results'],
        performance: {
          precision: 89.2,
          recall: 84.7,
          f1Score: 86.9,
          coverage: 92.1
        }
      },
      {
        id: 'model_2',
        name: 'Behavioral Pattern Model',
        type: 'deep_learning',
        accuracy: 82.1,
        trainingData: 89000,
        lastTrained: '2024-02-25',
        status: 'active',
        features: ['browsing_behavior', 'purchase_history', 'session_data', 'time_patterns'],
        performance: {
          precision: 85.3,
          recall: 78.9,
          f1Score: 82.0,
          coverage: 88.4
        }
      },
      {
        id: 'model_3',
        name: 'Collaborative Filtering Model',
        type: 'collaborative_filtering',
        accuracy: 79.6,
        trainingData: 234000,
        lastTrained: '2024-03-05',
        status: 'training',
        features: ['user_similarity', 'item_similarity', 'rating_matrix', 'implicit_feedback'],
        performance: {
          precision: 81.2,
          recall: 76.8,
          f1Score: 79.0,
          coverage: 94.7
        }
      }
    ]);

    setCustomerInsights([
      {
        segment: 'Health Conscious',
        size: 34.2,
        avgOrderValue: 186.45,
        recommendationAcceptance: 42.7,
        topCategories: ['Supplements', 'Wellness', 'Preventive Care'],
        behaviorPatterns: {
          avgSessionTime: 245,
          pagesPerSession: 8.4,
          returnVisitRate: 67.3,
          seasonalTrends: ['Spring detox', 'Summer vitamins', 'Winter immunity']
        }
      },
      {
        segment: 'Chronic Care Patients',
        size: 28.9,
        avgOrderValue: 234.67,
        recommendationAcceptance: 56.8,
        topCategories: ['Prescription', 'Monitoring', 'Support'],
        behaviorPatterns: {
          avgSessionTime: 189,
          pagesPerSession: 5.2,
          returnVisitRate: 89.4,
          seasonalTrends: ['Consistent year-round', 'Holiday adjustments']
        }
      },
      {
        segment: 'Cost Conscious',
        size: 22.1,
        avgOrderValue: 98.23,
        recommendationAcceptance: 28.4,
        topCategories: ['Generic', 'OTC', 'Bundles'],
        behaviorPatterns: {
          avgSessionTime: 156,
          pagesPerSession: 12.6,
          returnVisitRate: 45.7,
          seasonalTrends: ['Black Friday focus', 'End-of-year savings']
        }
      },
      {
        segment: 'New Patients',
        size: 14.8,
        avgOrderValue: 127.89,
        recommendationAcceptance: 38.2,
        topCategories: ['Starter Kits', 'Education', 'Basic Care'],
        behaviorPatterns: {
          avgSessionTime: 312,
          pagesPerSession: 15.8,
          returnVisitRate: 34.2,
          seasonalTrends: ['Gradual adoption', 'Learning-focused']
        }
      }
    ]);
  }, []);

  const formatPercent = (value: number) => `${value.toFixed(1)}%`;
  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  const formatNumber = (value: number) => value.toLocaleString();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'training': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'clinical': return <Heart className="w-4 h-4" />;
      case 'collaborative': return <Users className="w-4 h-4" />;
      case 'content_based': return <Package className="w-4 h-4" />;
      case 'behavioral': return <Activity className="w-4 h-4" />;
      case 'seasonal': return <Clock className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">AI Recommendation Engine</h2>
          <p className="text-muted-foreground">Manage AI-powered product recommendations and personalization</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retrain Models
          </Button>
          <Button>
            <Brain className="w-4 h-4 mr-2" />
            Create Rule
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Rules
          </TabsTrigger>
          <TabsTrigger value="models" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            AI Models
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Recommendation Revenue</p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatCurrency(recommendationRules.reduce((sum, r) => sum + r.performance.revenue, 0))}
                    </p>
                    <p className="text-sm text-green-600">+28% vs last month</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Click-Through Rate</p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatPercent(recommendationRules.reduce((sum, r) => sum + r.performance.clickThroughRate, 0) / recommendationRules.length)}
                    </p>
                    <p className="text-sm text-green-600">+5.2% vs last month</p>
                  </div>
                  <Eye className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Conversion Rate</p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatPercent(recommendationRules.reduce((sum, r) => sum + r.performance.conversionRate, 0) / recommendationRules.length)}
                    </p>
                    <p className="text-sm text-green-600">+12.4% vs last month</p>
                  </div>
                  <Target className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">AI Model Accuracy</p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatPercent(aiModels.reduce((sum, m) => sum + m.accuracy, 0) / aiModels.length)}
                    </p>
                    <p className="text-sm text-green-600">+3.1% vs last month</p>
                  </div>
                  <Brain className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Top Performing Rules
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendationRules
                    .sort((a, b) => b.performance.revenue - a.performance.revenue)
                    .slice(0, 5)
                    .map((rule, index) => (
                    <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">#{index + 1}</span>
                        </div>
                        <div>
                          <div className="font-medium">{rule.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            {getTypeIcon(rule.type)}
                            <span className="capitalize">{rule.type.replace('_', ' ')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(rule.performance.revenue)}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatPercent(rule.performance.conversionRate)} conv.
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Customer Segments Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {customerInsights.map((insight) => (
                    <div key={insight.segment} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{insight.segment}</span>
                        <span className="text-sm text-muted-foreground">{formatPercent(insight.size)}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">AOV: </span>
                          <span className="font-medium">{formatCurrency(insight.avgOrderValue)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Acceptance: </span>
                          <span className="font-medium">{formatPercent(insight.recommendationAcceptance)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Rules Tab */}
        <TabsContent value="rules" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h3 className="text-xl font-semibold">Recommendation Rules ({recommendationRules.length})</h3>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search rules..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="clinical">Clinical</SelectItem>
                    <SelectItem value="collaborative">Collaborative</SelectItem>
                    <SelectItem value="content_based">Content Based</SelectItem>
                    <SelectItem value="behavioral">Behavioral</SelectItem>
                    <SelectItem value="seasonal">Seasonal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button>
              <Brain className="w-4 h-4 mr-2" />
              Create Rule
            </Button>
          </div>

          <div className="space-y-4">
            {recommendationRules.map((rule) => (
              <Card key={rule.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h4 className="text-lg font-semibold">{rule.name}</h4>
                        <Badge className={getStatusColor(rule.status)}>
                          {rule.status}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          {getTypeIcon(rule.type)}
                          {rule.type.replace('_', ' ')}
                        </Badge>
                        <Badge className="bg-blue-100 text-blue-800">
                          Priority {rule.priority}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Impressions</div>
                          <div className="font-medium">{formatNumber(rule.performance.impressions)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Click-Through Rate</div>
                          <div className="font-medium">{formatPercent(rule.performance.clickThroughRate)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Conversion Rate</div>
                          <div className="font-medium text-green-600">{formatPercent(rule.performance.conversionRate)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Revenue</div>
                          <div className="font-medium text-primary">{formatCurrency(rule.performance.revenue)}</div>
                        </div>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        <span>Last updated: {new Date(rule.lastUpdated).toLocaleDateString()}</span>
                        <span className="mx-2">•</span>
                        <span>Max recommendations: {rule.recommendations.maxRecommendations}</span>
                        <span className="mx-2">•</span>
                        <span>Personalization: {formatPercent(rule.recommendations.personalizationWeight * 100)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 ml-4">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Settings className="w-3 h-3" />
                      </Button>
                      <Switch checked={rule.status === 'active'} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* AI Models Tab */}
        <TabsContent value="models" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">AI Models ({aiModels.length})</h3>
            <Button>
              <Database className="w-4 h-4 mr-2" />
              Train New Model
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {aiModels.map((model) => (
              <Card key={model.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{model.name}</CardTitle>
                    <Badge className={getStatusColor(model.status)}>
                      {model.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Accuracy</div>
                      <div className="text-xl font-bold text-primary">{formatPercent(model.accuracy)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Training Data</div>
                      <div className="text-xl font-bold">{formatNumber(model.trainingData)}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium">Performance Metrics</div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span>Precision:</span>
                        <span className="font-medium">{formatPercent(model.performance.precision)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Recall:</span>
                        <span className="font-medium">{formatPercent(model.performance.recall)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>F1 Score:</span>
                        <span className="font-medium">{formatPercent(model.performance.f1Score)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Coverage:</span>
                        <span className="font-medium">{formatPercent(model.performance.coverage)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium">Features</div>
                    <div className="flex flex-wrap gap-1">
                      {model.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Last trained: {new Date(model.lastTrained).toLocaleDateString()}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Retrain
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="w-3 h-3 mr-1" />
                      Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Customer Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <h3 className="text-xl font-semibold">Customer Insights</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {customerInsights.map((insight) => (
              <Card key={insight.segment} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{insight.segment}</span>
                    <Badge className="bg-blue-100 text-blue-800">
                      {formatPercent(insight.size)} of customers
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Avg Order Value</div>
                      <div className="text-xl font-bold text-primary">{formatCurrency(insight.avgOrderValue)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Recommendation Acceptance</div>
                      <div className="text-xl font-bold text-green-600">{formatPercent(insight.recommendationAcceptance)}</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-2">Top Categories</div>
                    <div className="flex flex-wrap gap-1">
                      {insight.topCategories.map((category, index) => (
                        <Badge key={index} variant="outline">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-2">Behavior Patterns</div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Avg Session Time:</span>
                        <span className="font-medium">{insight.behaviorPatterns.avgSessionTime}s</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pages per Session:</span>
                        <span className="font-medium">{insight.behaviorPatterns.pagesPerSession}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Return Visit Rate:</span>
                        <span className="font-medium">{formatPercent(insight.behaviorPatterns.returnVisitRate)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-2">Seasonal Trends</div>
                    <div className="flex flex-wrap gap-1">
                      {insight.behaviorPatterns.seasonalTrends.map((trend, index) => (
                        <Badge key={index} className="bg-purple-100 text-purple-800">
                          {trend}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <h3 className="text-xl font-semibold">Recommendation Engine Settings</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Global Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Recommendations</Label>
                    <p className="text-sm text-muted-foreground">Turn on/off the entire recommendation system</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Personalization</Label>
                    <p className="text-sm text-muted-foreground">Use customer data for personalized recommendations</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Real-time Updates</Label>
                    <p className="text-sm text-muted-foreground">Update recommendations based on current session</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>A/B Testing</Label>
                    <p className="text-sm text-muted-foreground">Enable recommendation A/B testing</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Thresholds</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Minimum Click-Through Rate (%)</Label>
                  <Input type="number" defaultValue="10" className="mt-1" />
                </div>

                <div>
                  <Label>Minimum Conversion Rate (%)</Label>
                  <Input type="number" defaultValue="5" className="mt-1" />
                </div>

                <div>
                  <Label>Auto-pause Underperforming Rules</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Switch />
                    <span className="text-sm text-muted-foreground">Pause rules below thresholds after 30 days</span>
                  </div>
                </div>

                <div>
                  <Label>Model Retraining Frequency</Label>
                  <Select defaultValue="weekly">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
