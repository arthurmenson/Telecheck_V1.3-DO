import React from "react";
import { FeatureExplainer, presets } from "./FeatureExplainer";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { 
  Stethoscope, 
  Brain, 
  Users, 
  Heart,
  Info,
  HelpCircle,
  AlertCircle
} from "lucide-react";

export function ExampleFeatureExplainers() {
  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold">FeatureExplainer Usage Examples</h2>
      
      {/* Example 1: Simple info dot next to title */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Medical Scribe
            <FeatureExplainer
              {...presets.aiScribe}
              size="sm"
              variant="info"
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>This shows a simple info dot next to a feature title.</p>
        </CardContent>
      </Card>

      {/* Example 2: Help icon with custom content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Care Team Management
            <FeatureExplainer
              title="Care Team Management"
              description="Coordinate care across multiple healthcare providers with shared responsibilities and communication tools."
              features={[
                "Multi-provider collaboration",
                "Role-based permissions",
                "Task assignment and tracking",
                "Real-time communication"
              ]}
              benefits={[
                "Improved care coordination",
                "Reduced care gaps",
                "Better patient outcomes",
                "Enhanced provider satisfaction"
              ]}
              examples={[
                "Assign tasks to specific team members",
                "Share patient updates across providers",
                "Coordinate appointment scheduling"
              ]}
              category="Team Collaboration"
              complexity="Intermediate"
              estimatedTime="20 min setup"
              icon={HelpCircle}
              size="sm"
              variant="help"
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>This shows a help icon with comprehensive custom content.</p>
        </CardContent>
      </Card>

      {/* Example 3: Minimal style for subtle information */}
      <div className="flex items-center gap-2 p-4 border rounded">
        <Heart className="w-5 h-5 text-red-500" />
        <span className="font-medium">Patient Vitals Monitor</span>
        <FeatureExplainer
          title="Patient Vitals Monitor"
          description="Real-time monitoring of patient vital signs with configurable alert thresholds."
          features={[
            "Real-time data streaming",
            "Customizable alert thresholds", 
            "Historical trend analysis",
            "Multi-device support"
          ]}
          benefits={[
            "Early detection of health changes",
            "Reduced emergency visits",
            "Improved patient safety"
          ]}
          category="Monitoring"
          complexity="Beginner"
          estimatedTime="5 min"
          size="sm"
          variant="minimal"
        />
        <Badge variant="secondary" className="ml-auto">Real-time</Badge>
      </div>

      {/* Example 4: Large size with warning style */}
      <Card className="border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <AlertCircle className="w-6 h-6" />
            Critical Alert System
            <FeatureExplainer
              title="Critical Alert System"
              description="Immediate notification system for urgent patient conditions requiring immediate attention."
              features={[
                "Instant notifications",
                "Escalation protocols",
                "Multiple delivery channels",
                "Acknowledgment tracking"
              ]}
              benefits={[
                "Faster response times",
                "Improved patient safety",
                "Reduced liability",
                "Better outcomes"
              ]}
              examples={[
                "Blood pressure spike alerts",
                "Medication allergy warnings",
                "Critical lab value notifications"
              ]}
              category="Emergency Response"
              complexity="Advanced"
              estimatedTime="30 min setup"
              prerequisites={[
                "Emergency contact setup",
                "Alert threshold configuration",
                "Team notification protocols"
              ]}
              icon={AlertCircle}
              size="lg"
              variant="info"
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>This shows a larger info icon for important features.</p>
        </CardContent>
      </Card>

      {/* Example 5: Using preset configurations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              Clinical Tools
              <FeatureExplainer
                {...presets.clinicalTools}
                size="sm"
              />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">Using preset configuration</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              Care Coordination
              <FeatureExplainer
                {...presets.careCoordination}
                size="sm"
              />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">Another preset example</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              AI Medical Scribe
              <FeatureExplainer
                {...presets.aiScribe}
                size="sm"
                learnMoreUrl="/docs/ai-scribe"
                videoUrl="/demo/ai-scribe"
              />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">Preset with custom URLs</p>
          </CardContent>
        </Card>
      </div>

      {/* Usage Guidelines */}
      <Card className="bg-blue-50 dark:bg-blue-900/20">
        <CardHeader>
          <CardTitle className="text-blue-800 dark:text-blue-200">
            Usage Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
          <p><strong>When to use:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Complex features that need explanation</li>
            <li>New features users might not understand</li>
            <li>Features with multiple configuration options</li>
            <li>Medical tools requiring clinical context</li>
          </ul>
          
          <p><strong>Best practices:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Keep explanations concise but comprehensive</li>
            <li>Use appropriate complexity levels</li>
            <li>Include real-world examples</li>
            <li>Provide learning resources when available</li>
            <li>Use consistent placement (usually after titles)</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
