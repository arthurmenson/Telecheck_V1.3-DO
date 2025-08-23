import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { useToast } from '../hooks/use-toast';
import {
  Brain,
  Heart,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Target,
  Zap,
  Shield,
  Activity,
  TestTube,
  Pill,
  Eye,
  RefreshCw,
  Download,
  Sparkles,
  BarChart3,
  LineChart,
  PieChart,
  Info,
  CheckCircle,
  Clock,
  ArrowRight
} from 'lucide-react';

interface AdvancedAIPanelProps {
  userId?: string;
}

export function AdvancedAIPanel({ userId = 'user-1' }: AdvancedAIPanelProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [cardiovascularRisk, setCardiovascularRisk] = useState<any>(null);
  const [drugInteractions, setDrugInteractions] = useState<any>(null);
  const [predictiveAnalytics, setPredictiveAnalytics] = useState<any>(null);
  const [healthScore, setHealthScore] = useState<any>(null);
  const [clinicalRecommendations, setClinicalRecommendations] = useState<any>(null);

  useEffect(() => {
    loadAdvancedAnalytics();
  }, [userId]);

  const loadAdvancedAnalytics = async () => {
    setLoading(true);
    try {
      const [cvRisk, interactions, analytics, score, clinical] = await Promise.all([
        fetch(`/api/ai/cardiovascular-risk/${userId}`).then(r => r.json()),
        fetch(`/api/ai/drug-interactions/${userId}`).then(r => r.json()),
        fetch(`/api/ai/predictive-analytics/${userId}`).then(r => r.json()),
        fetch(`/api/ai/health-score/${userId}`).then(r => r.json()),
        fetch(`/api/ai/clinical-recommendations/${userId}`).then(r => r.json())
      ]);

      setCardiovascularRisk(cvRisk.data);
      setDrugInteractions(interactions.data);
      setPredictiveAnalytics(analytics.data);
      setHealthScore(score.data);
      setClinicalRecommendations(clinical.data);
    } catch (error) {
      console.error('Error loading advanced analytics:', error);
      toast({
        title: "Error Loading Analytics",
        description: "Failed to load advanced AI analytics. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'borderline': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'intermediate': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <Card className="glass-morphism border border-border/20">
        <CardContent className="p-8 text-center">
          <div className="flex items-center justify-center space-x-3">
            <Brain className="w-8 h-8 text-primary animate-pulse" />
            <div className="text-lg font-semibold text-foreground">Loading Advanced AI Analytics...</div>
          </div>
          <Progress value={65} className="mt-4 h-2" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Advanced AI Analytics</h2>
            <p className="text-muted-foreground">Sophisticated medical AI analysis and predictions</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={loadAdvancedAnalytics}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Cardiovascular Risk Assessment */}
      {cardiovascularRisk && (
        <Card className="glass-morphism border border-border/20">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="w-6 h-6 text-red-500 mr-2" />
              Cardiovascular Risk Assessment
              <Badge className="ml-2 gradient-bg text-white border-0">
                <Zap className="w-3 h-3 mr-1" />
                AI Powered
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-foreground mb-2">
                  {cardiovascularRisk.tenYearRisk.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground mb-3">10-Year Risk</div>
                <Badge className={getRiskColor(cardiovascularRisk.riskCategory)}>
                  {cardiovascularRisk.riskCategory} risk
                </Badge>
              </div>
              <div className="md:col-span-2">
                <h4 className="font-semibold text-foreground mb-3">AI Recommendations</h4>
                <div className="space-y-2">
                  {cardiovascularRisk.recommendations.map((rec: string, index: number) => (
                    <div key={index} className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{rec}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-primary/5 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">
                      Confidence: {cardiovascularRisk.confidence}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Drug Interactions */}
      {drugInteractions && (
        <Card className="glass-morphism border border-border/20">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Pill className="w-6 h-6 text-blue-500 mr-2" />
              Advanced Drug Interaction Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-foreground mb-3">Drug-Drug Interactions</h4>
                {drugInteractions.interactions.length > 0 ? (
                  <div className="space-y-3">
                    {drugInteractions.interactions.map((interaction: any, index: number) => (
                      <div key={index} className="glass-morphism p-4 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className={getSeverityColor(interaction.severity)}>
                            {interaction.severity} risk
                          </Badge>
                          <div className="text-xs text-muted-foreground">
                            Risk Level: {interaction.riskLevel}/3
                          </div>
                        </div>
                        <div className="text-sm font-medium text-foreground mb-1">
                          {interaction.medications.join(' + ')}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {interaction.description}
                        </p>
                        <div className="text-xs text-primary">
                          <strong>Management:</strong> {interaction.management}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                    <p>No significant drug interactions detected</p>
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-3">Pharmacogenomic Alerts</h4>
                {drugInteractions.pgxAlerts.length > 0 ? (
                  <div className="space-y-3">
                    {drugInteractions.pgxAlerts.map((alert: any, index: number) => (
                      <div key={index} className="glass-morphism p-4 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-xs">
                            {alert.gene} {alert.variant}
                          </Badge>
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                        </div>
                        <div className="text-sm font-medium text-foreground mb-1">
                          {alert.medication}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {alert.effect}
                        </p>
                        <div className="text-xs text-primary">
                          <strong>Recommendation:</strong> {alert.recommendation}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <Sparkles className="w-12 h-12 mx-auto mb-3 text-purple-500" />
                    <p>No PGx alerts for current medications</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 p-4 bg-primary/5 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-foreground">Overall Risk Score</div>
                  <div className="text-2xl font-bold text-foreground">{drugInteractions.riskScore}/100</div>
                </div>
                <Progress value={drugInteractions.riskScore} className="w-32 h-3" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Predictive Analytics */}
      {predictiveAnalytics && (
        <Card className="glass-morphism border border-border/20">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-6 h-6 text-purple-500 mr-2" />
              Predictive Health Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Predictions */}
              <div>
                <h4 className="font-semibold text-foreground mb-3">Health Predictions</h4>
                <div className="space-y-3">
                  {predictiveAnalytics.predictions.map((prediction: any, index: number) => (
                    <div key={index} className="glass-morphism p-4 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">{prediction.metric}</span>
                        <Badge variant="outline" className="text-xs">
                          {prediction.confidence}% confidence
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{prediction.prediction}</p>
                      <div className="flex items-center space-x-2 text-xs text-primary">
                        <Clock className="w-3 h-3" />
                        <span>{prediction.timeframe}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Factors */}
              <div>
                <h4 className="font-semibold text-foreground mb-3">Emerging Risk Factors</h4>
                <div className="space-y-3">
                  {predictiveAnalytics.riskFactors.map((risk: any, index: number) => (
                    <div key={index} className="glass-morphism p-4 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">{risk.factor}</span>
                        <Badge className={getRiskColor(risk.risk)}>
                          {risk.risk} risk
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>Probability: {risk.probability}%</div>
                        <div>Timeframe: {risk.timeframe}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interventions */}
              <div>
                <h4 className="font-semibold text-foreground mb-3">Recommended Interventions</h4>
                <div className="space-y-3">
                  {predictiveAnalytics.interventions.map((intervention: any, index: number) => (
                    <div key={index} className="glass-morphism p-4 rounded-xl">
                      <div className="text-sm font-medium text-foreground mb-2">
                        {intervention.intervention}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {intervention.expectedBenefit}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-primary">
                        <Activity className="w-3 h-3" />
                        <span>{intervention.timeToEffect}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Health Score Breakdown */}
      {healthScore && (
        <Card className="glass-morphism border border-border/20">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-6 h-6 text-green-500 mr-2" />
              Advanced Health Score Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50" cy="50" r="40"
                      stroke="currentColor" strokeWidth="8" fill="none"
                      className="text-muted/20"
                    />
                    <circle
                      cx="50" cy="50" r="40"
                      stroke="currentColor" strokeWidth="8" fill="none"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - healthScore.overallScore / 100)}`}
                      className="text-primary transition-all duration-1000 ease-out"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-foreground">{healthScore.overallScore}</div>
                      <div className="text-xs text-muted-foreground">Overall</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="glass-morphism p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-muted-foreground">Cardiovascular</span>
                    <Heart className="w-4 h-4 text-red-500" />
                  </div>
                  <div className="text-xl font-bold text-foreground">{healthScore.categoryScores.cardiovascular}</div>
                  <Progress value={healthScore.categoryScores.cardiovascular} className="h-2 mt-1" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="glass-morphism p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-muted-foreground">Metabolic</span>
                    <TestTube className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="text-xl font-bold text-foreground">{healthScore.categoryScores.metabolic}</div>
                  <Progress value={healthScore.categoryScores.metabolic} className="h-2 mt-1" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="glass-morphism p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-muted-foreground">Lifestyle</span>
                    <Activity className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="text-xl font-bold text-foreground">{healthScore.categoryScores.lifestyle}</div>
                  <Progress value={healthScore.categoryScores.lifestyle} className="h-2 mt-1" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <h4 className="font-semibold text-foreground mb-3">Areas for Improvement</h4>
                <div className="space-y-2">
                  {healthScore.improvements.map((improvement: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-muted-foreground">{improvement}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-3">Identified Risks</h4>
                <div className="space-y-2">
                  {healthScore.risks.map((risk: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm text-muted-foreground">{risk}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clinical Recommendations */}
      {clinicalRecommendations && (
        <Card className="glass-morphism border border-border/20">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-6 h-6 text-primary mr-2" />
              Clinical Decision Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-foreground mb-3">Treatment Recommendations</h4>
                <div className="space-y-3">
                  {clinicalRecommendations.recommendations.map((rec: any, index: number) => (
                    <div key={index} className="glass-morphism p-4 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs">{rec.category}</Badge>
                        <Badge className={rec.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                          {rec.priority}
                        </Badge>
                      </div>
                      <div className="text-sm font-medium text-foreground mb-2">
                        {rec.recommendation}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {rec.rationale}
                      </p>
                      <div className="text-xs text-primary">
                        <strong>Evidence:</strong> {rec.evidence}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-3">Clinical Alerts</h4>
                <div className="space-y-3">
                  {clinicalRecommendations.alerts.map((alert: any, index: number) => (
                    <div key={index} className="glass-morphism p-4 rounded-xl">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertTriangle className={`w-4 h-4 ${alert.severity === 'high' ? 'text-red-500' : 'text-yellow-500'}`} />
                        <span className="text-sm font-medium text-foreground">{alert.message}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{alert.action}</p>
                      <div className="text-xs text-primary">
                        Follow-up in {alert.followUpDays} days
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-3">Follow-up Testing</h4>
                <div className="space-y-3">
                  {clinicalRecommendations.followUp.map((followUp: any, index: number) => (
                    <div key={index} className="glass-morphism p-4 rounded-xl">
                      <div className="text-sm font-medium text-foreground mb-2">
                        {followUp.test}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {followUp.reason}
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-primary">
                          <strong>Timeframe:</strong> {followUp.timeframe}
                        </span>
                        <Badge className={followUp.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}>
                          {followUp.priority}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}