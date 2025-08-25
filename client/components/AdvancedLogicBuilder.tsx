import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Switch } from "./ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  GitBranch,
  Plus,
  Trash2,
  ArrowRight,
  ArrowDown,
  Settings,
  Eye,
  Code,
  Zap,
  Target,
  Filter,
  Copy,
  Move,
  AlertTriangle,
  CheckCircle,
  Play,
  Pause,
  RotateCcw,
  Save,
  Download,
  Upload,
  Workflow,
  Split,
  Merge,
  Route,
  Link,
  Unlink,
  Edit3,
  Brain,
  Calculator,
  BarChart3,
} from "lucide-react";

interface LogicRule {
  id: string;
  type: "show_if" | "hide_if" | "skip_to" | "calculate" | "validate" | "branch";
  name: string;
  description: string;
  enabled: boolean;
  conditions: LogicCondition[];
  actions: LogicAction[];
  priority: number;
}

interface LogicCondition {
  id: string;
  questionId: string;
  operator:
    | "equals"
    | "not_equals"
    | "contains"
    | "greater_than"
    | "less_than"
    | "in_range"
    | "is_empty"
    | "is_not_empty";
  value: any;
  logicalOperator?: "AND" | "OR";
}

interface LogicAction {
  id: string;
  type:
    | "show"
    | "hide"
    | "skip_to"
    | "set_value"
    | "calculate"
    | "validate"
    | "alert"
    | "redirect";
  targetId: string;
  value?: any;
  formula?: string;
  message?: string;
}

interface LogicFlow {
  nodes: FlowNode[];
  connections: FlowConnection[];
}

interface FlowNode {
  id: string;
  type:
    | "question"
    | "condition"
    | "action"
    | "branch"
    | "merge"
    | "start"
    | "end";
  position: { x: number; y: number };
  data: any;
  size: { width: number; height: number };
}

interface FlowConnection {
  id: string;
  from: string;
  to: string;
  condition?: string;
  label?: string;
}

interface AdvancedLogicBuilderProps {
  questions: any[];
  logicRules: LogicRule[];
  onRulesChange: (rules: LogicRule[]) => void;
  onFlowChange?: (flow: LogicFlow) => void;
}

export function AdvancedLogicBuilder({
  questions,
  logicRules,
  onRulesChange,
  onFlowChange,
}: AdvancedLogicBuilderProps) {
  const [activeTab, setActiveTab] = useState<"rules" | "flow" | "testing">(
    "rules",
  );
  const [selectedRule, setSelectedRule] = useState<string | null>(null);
  const [showRuleDialog, setShowRuleDialog] = useState(false);
  const [editingRule, setEditingRule] = useState<LogicRule | null>(null);
  const [flowNodes, setFlowNodes] = useState<FlowNode[]>([]);
  const [flowConnections, setFlowConnections] = useState<FlowConnection[]>([]);
  const [testMode, setTestMode] = useState(false);
  const [testResponses, setTestResponses] = useState<Record<string, any>>({});

  // Logic rule templates
  const ruleTemplates = [
    {
      type: "show_if",
      name: "Show Question If...",
      description: "Display a question based on previous answer",
      icon: Eye,
      color: "bg-blue-100 text-blue-600",
    },
    {
      type: "hide_if",
      name: "Hide Question If...",
      description: "Hide a question based on conditions",
      icon: Settings,
      color: "bg-gray-100 text-gray-600",
    },
    {
      type: "skip_to",
      name: "Skip To Question",
      description: "Jump to specific question based on answer",
      icon: ArrowRight,
      color: "bg-green-100 text-green-600",
    },
    {
      type: "branch",
      name: "Branch Logic",
      description: "Create different paths through questionnaire",
      icon: GitBranch,
      color: "bg-purple-100 text-purple-600",
    },
    {
      type: "calculate",
      name: "Calculate Score",
      description: "Perform calculations based on responses",
      icon: Calculator,
      color: "bg-orange-100 text-orange-600",
    },
    {
      type: "validate",
      name: "Validate Response",
      description: "Check response against validation rules",
      icon: CheckCircle,
      color: "bg-emerald-100 text-emerald-600",
    },
  ];

  const operators = [
    { value: "equals", label: "Equals", description: "Exactly matches value" },
    {
      value: "not_equals",
      label: "Not Equals",
      description: "Does not match value",
    },
    { value: "contains", label: "Contains", description: "Includes the value" },
    {
      value: "greater_than",
      label: "Greater Than",
      description: "Numeric comparison >",
    },
    {
      value: "less_than",
      label: "Less Than",
      description: "Numeric comparison <",
    },
    { value: "in_range", label: "In Range", description: "Between two values" },
    { value: "is_empty", label: "Is Empty", description: "No value entered" },
    {
      value: "is_not_empty",
      label: "Is Not Empty",
      description: "Has a value",
    },
  ];

  const createNewRule = (templateType: string) => {
    const template = ruleTemplates.find((t) => t.type === templateType);
    const newRule: LogicRule = {
      id: `rule_${Date.now()}`,
      type: templateType as any,
      name: template?.name || "New Rule",
      description: template?.description || "",
      enabled: true,
      conditions: [
        {
          id: `condition_${Date.now()}`,
          questionId: "",
          operator: "equals",
          value: "",
        },
      ],
      actions: [
        {
          id: `action_${Date.now()}`,
          type:
            templateType === "show_if"
              ? "show"
              : templateType === "hide_if"
                ? "hide"
                : templateType === "skip_to"
                  ? "skip_to"
                  : "show",
          targetId: "",
        },
      ],
      priority: logicRules.length + 1,
    };

    setEditingRule(newRule);
    setShowRuleDialog(true);
  };

  const saveRule = () => {
    if (!editingRule) return;

    const existingIndex = logicRules.findIndex((r) => r.id === editingRule.id);
    let updatedRules;

    if (existingIndex >= 0) {
      updatedRules = [...logicRules];
      updatedRules[existingIndex] = editingRule;
    } else {
      updatedRules = [...logicRules, editingRule];
    }

    onRulesChange(updatedRules);
    setShowRuleDialog(false);
    setEditingRule(null);
  };

  const deleteRule = (ruleId: string) => {
    const updatedRules = logicRules.filter((r) => r.id !== ruleId);
    onRulesChange(updatedRules);
  };

  const duplicateRule = (rule: LogicRule) => {
    const duplicated = {
      ...rule,
      id: `rule_${Date.now()}`,
      name: `${rule.name} (Copy)`,
      priority: logicRules.length + 1,
    };
    onRulesChange([...logicRules, duplicated]);
  };

  const toggleRuleEnabled = (ruleId: string) => {
    const updatedRules = logicRules.map((rule) =>
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule,
    );
    onRulesChange(updatedRules);
  };

  const addCondition = () => {
    if (!editingRule) return;

    const newCondition: LogicCondition = {
      id: `condition_${Date.now()}`,
      questionId: "",
      operator: "equals",
      value: "",
      logicalOperator: "AND",
    };

    setEditingRule({
      ...editingRule,
      conditions: [...editingRule.conditions, newCondition],
    });
  };

  const removeCondition = (conditionId: string) => {
    if (!editingRule) return;

    setEditingRule({
      ...editingRule,
      conditions: editingRule.conditions.filter((c) => c.id !== conditionId),
    });
  };

  const updateCondition = (
    conditionId: string,
    updates: Partial<LogicCondition>,
  ) => {
    if (!editingRule) return;

    setEditingRule({
      ...editingRule,
      conditions: editingRule.conditions.map((c) =>
        c.id === conditionId ? { ...c, ...updates } : c,
      ),
    });
  };

  const addAction = () => {
    if (!editingRule) return;

    const newAction: LogicAction = {
      id: `action_${Date.now()}`,
      type: "show",
      targetId: "",
    };

    setEditingRule({
      ...editingRule,
      actions: [...editingRule.actions, newAction],
    });
  };

  const removeAction = (actionId: string) => {
    if (!editingRule) return;

    setEditingRule({
      ...editingRule,
      actions: editingRule.actions.filter((a) => a.id !== actionId),
    });
  };

  const updateAction = (actionId: string, updates: Partial<LogicAction>) => {
    if (!editingRule) return;

    setEditingRule({
      ...editingRule,
      actions: editingRule.actions.map((a) =>
        a.id === actionId ? { ...a, ...updates } : a,
      ),
    });
  };

  const generateFlowDiagram = () => {
    // Auto-generate flow diagram from rules
    const nodes: FlowNode[] = [];
    const connections: FlowConnection[] = [];

    // Add start node
    nodes.push({
      id: "start",
      type: "start",
      position: { x: 50, y: 50 },
      data: { label: "Start" },
      size: { width: 120, height: 60 },
    });

    // Add question nodes
    questions.forEach((question, index) => {
      nodes.push({
        id: question.id,
        type: "question",
        position: {
          x: 50 + (index % 3) * 200,
          y: 150 + Math.floor(index / 3) * 120,
        },
        data: {
          label: question.title,
          question: question,
        },
        size: { width: 180, height: 80 },
      });
    });

    // Add logic nodes based on rules
    logicRules.forEach((rule, index) => {
      if (rule.enabled) {
        nodes.push({
          id: rule.id,
          type: "condition",
          position: { x: 300 + (index % 2) * 200, y: 200 + index * 100 },
          data: {
            label: rule.name,
            rule: rule,
          },
          size: { width: 160, height: 100 },
        });
      }
    });

    // Add end node
    nodes.push({
      id: "end",
      type: "end",
      position: { x: 400, y: 600 },
      data: { label: "End" },
      size: { width: 120, height: 60 },
    });

    setFlowNodes(nodes);
    setFlowConnections(connections);
  };

  const testLogicRules = (responses: Record<string, any>) => {
    const results: any[] = [];

    logicRules.forEach((rule) => {
      if (!rule.enabled) return;

      const conditionResults = rule.conditions.map((condition) => {
        const response = responses[condition.questionId];
        let result = false;

        switch (condition.operator) {
          case "equals":
            result = response === condition.value;
            break;
          case "not_equals":
            result = response !== condition.value;
            break;
          case "contains":
            result = Array.isArray(response)
              ? response.includes(condition.value)
              : String(response).includes(condition.value);
            break;
          case "greater_than":
            result = Number(response) > Number(condition.value);
            break;
          case "less_than":
            result = Number(response) < Number(condition.value);
            break;
          case "is_empty":
            result = !response || response === "";
            break;
          case "is_not_empty":
            result = !!response && response !== "";
            break;
          default:
            result = false;
        }

        return result;
      });

      // Evaluate combined conditions (simplified - assumes all AND for now)
      const allConditionsMet = conditionResults.every((r) => r);

      if (allConditionsMet) {
        results.push({
          rule: rule,
          triggered: true,
          actions: rule.actions,
        });
      }
    });

    return results;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <GitBranch className="w-6 h-6 text-purple-600" />
            Advanced Logic Builder
          </h2>
          <p className="text-muted-foreground mt-1">
            Create intelligent questionnaire flows with conditional logic and
            branching
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={generateFlowDiagram}>
            <Workflow className="w-4 h-4 mr-2" />
            Generate Flow
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Logic
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Rule
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex space-x-8">
          {[
            { id: "rules", label: "Logic Rules", icon: Settings },
            { id: "flow", label: "Visual Flow", icon: Workflow },
            { id: "testing", label: "Test Logic", icon: Play },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rules Tab */}
      {activeTab === "rules" && (
        <div className="space-y-6">
          {/* Rule Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Quick Start Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ruleTemplates.map((template) => (
                  <div
                    key={template.type}
                    onClick={() => createNewRule(template.type)}
                    className="border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg ${template.color} flex items-center justify-center`}
                      >
                        <template.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">
                          {template.name}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {template.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Existing Rules */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Active Logic Rules ({logicRules.length})
                </span>
                <Badge variant="outline">
                  {logicRules.filter((r) => r.enabled).length} enabled
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {logicRules.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <GitBranch className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">
                    No Logic Rules Yet
                  </h3>
                  <p className="text-sm mb-4">
                    Create your first rule using the templates above
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {logicRules.map((rule) => {
                    const template = ruleTemplates.find(
                      (t) => t.type === rule.type,
                    );
                    return (
                      <div
                        key={rule.id}
                        className={`border rounded-lg p-4 ${
                          selectedRule === rule.id
                            ? "border-primary bg-primary/5"
                            : ""
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div
                              className={`w-8 h-8 rounded ${template?.color || "bg-gray-100 text-gray-600"} flex items-center justify-center`}
                            >
                              {template?.icon && (
                                <template.icon className="w-4 h-4" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-foreground">
                                  {rule.name}
                                </h4>
                                <Badge
                                  variant={
                                    rule.enabled ? "default" : "secondary"
                                  }
                                >
                                  {rule.enabled ? "Enabled" : "Disabled"}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  Priority {rule.priority}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {rule.description}
                              </p>
                              <div className="text-xs text-muted-foreground">
                                {rule.conditions.length} condition(s) →{" "}
                                {rule.actions.length} action(s)
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={rule.enabled}
                              onCheckedChange={() => toggleRuleEnabled(rule.id)}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingRule(rule);
                                setShowRuleDialog(true);
                              }}
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => duplicateRule(rule)}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteRule(rule.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Flow Tab */}
      {activeTab === "flow" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Workflow className="w-5 h-5" />
              Visual Logic Flow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-border rounded-lg p-8 min-h-96 bg-muted/20">
              {flowNodes.length === 0 ? (
                <div className="text-center text-muted-foreground">
                  <Workflow className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">
                    Visual Flow Diagram
                  </h3>
                  <p className="text-sm mb-4">
                    Generate a visual representation of your logic rules
                  </p>
                  <Button onClick={generateFlowDiagram}>
                    <Workflow className="w-4 h-4 mr-2" />
                    Generate Flow Diagram
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <svg width="100%" height="400" className="border rounded">
                    {/* Render flow nodes */}
                    {flowNodes.map((node) => (
                      <g key={node.id}>
                        <rect
                          x={node.position.x}
                          y={node.position.y}
                          width={node.size.width}
                          height={node.size.height}
                          fill={
                            node.type === "start"
                              ? "#10b981"
                              : node.type === "end"
                                ? "#ef4444"
                                : node.type === "condition"
                                  ? "#8b5cf6"
                                  : "#3b82f6"
                          }
                          stroke="#6b7280"
                          strokeWidth="2"
                          rx="8"
                          className="opacity-90"
                        />
                        <text
                          x={node.position.x + node.size.width / 2}
                          y={node.position.y + node.size.height / 2}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="white"
                          fontSize="12"
                          className="font-medium"
                        >
                          {node.data.label}
                        </text>
                      </g>
                    ))}

                    {/* Render connections */}
                    {flowConnections.map((connection) => {
                      const fromNode = flowNodes.find(
                        (n) => n.id === connection.from,
                      );
                      const toNode = flowNodes.find(
                        (n) => n.id === connection.to,
                      );
                      if (!fromNode || !toNode) return null;

                      return (
                        <line
                          key={connection.id}
                          x1={fromNode.position.x + fromNode.size.width}
                          y1={fromNode.position.y + fromNode.size.height / 2}
                          x2={toNode.position.x}
                          y2={toNode.position.y + toNode.size.height / 2}
                          stroke="#6b7280"
                          strokeWidth="2"
                          markerEnd="url(#arrowhead)"
                        />
                      );
                    })}

                    {/* Arrow marker */}
                    <defs>
                      <marker
                        id="arrowhead"
                        markerWidth="10"
                        markerHeight="7"
                        refX="10"
                        refY="3.5"
                        orient="auto"
                      >
                        <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
                      </marker>
                    </defs>
                  </svg>
                  <div className="mt-4 flex justify-center gap-3">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export SVG
                    </Button>
                    <Button variant="outline" size="sm">
                      <Move className="w-4 h-4 mr-2" />
                      Edit Layout
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Testing Tab */}
      {activeTab === "testing" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              Test Logic Rules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">
                  Test your logic rules with sample responses
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setTestMode(!testMode)}
                  >
                    {testMode ? (
                      <Pause className="w-4 h-4 mr-2" />
                    ) : (
                      <Play className="w-4 h-4 mr-2" />
                    )}
                    {testMode ? "Stop Test" : "Start Test"}
                  </Button>
                  <Button variant="outline">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </div>

              {testMode && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Sample Responses</h4>
                    <div className="space-y-3">
                      {questions.slice(0, 5).map((question) => (
                        <div key={question.id} className="border rounded p-3">
                          <Label className="text-sm font-medium">
                            {question.title}
                          </Label>
                          <Input
                            className="mt-1"
                            placeholder="Enter test response..."
                            value={testResponses[question.id] || ""}
                            onChange={(e) =>
                              setTestResponses((prev) => ({
                                ...prev,
                                [question.id]: e.target.value,
                              }))
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Logic Results</h4>
                    <div className="space-y-2">
                      {testLogicRules(testResponses).map((result, index) => (
                        <div
                          key={index}
                          className="border rounded p-3 bg-green-50 dark:bg-green-900/20"
                        >
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="font-medium text-green-800 dark:text-green-200">
                              {result.rule.name}
                            </span>
                          </div>
                          <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                            Rule triggered: {result.actions.length} action(s)
                            will execute
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rule Editor Dialog */}
      <Dialog open={showRuleDialog} onOpenChange={setShowRuleDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRule?.id.startsWith("rule_") ? "Edit" : "Create"} Logic
              Rule
            </DialogTitle>
            <DialogDescription>
              Configure conditions and actions for your logic rule
            </DialogDescription>
          </DialogHeader>

          {editingRule && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rule-name">Rule Name</Label>
                  <Input
                    id="rule-name"
                    value={editingRule.name}
                    onChange={(e) =>
                      setEditingRule({ ...editingRule, name: e.target.value })
                    }
                    placeholder="Enter rule name..."
                  />
                </div>
                <div>
                  <Label htmlFor="rule-priority">Priority</Label>
                  <Input
                    id="rule-priority"
                    type="number"
                    value={editingRule.priority}
                    onChange={(e) =>
                      setEditingRule({
                        ...editingRule,
                        priority: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="rule-description">Description</Label>
                <Textarea
                  id="rule-description"
                  value={editingRule.description}
                  onChange={(e) =>
                    setEditingRule({
                      ...editingRule,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe what this rule does..."
                  rows={2}
                />
              </div>

              {/* Conditions */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">Conditions</h4>
                  <Button variant="outline" size="sm" onClick={addCondition}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Condition
                  </Button>
                </div>
                <div className="space-y-3">
                  {editingRule.conditions.map((condition, index) => (
                    <div key={condition.id} className="border rounded p-3">
                      <div className="grid grid-cols-12 gap-3 items-end">
                        {index > 0 && (
                          <div className="col-span-2">
                            <Select
                              value={condition.logicalOperator || "AND"}
                              onValueChange={(value) =>
                                updateCondition(condition.id, {
                                  logicalOperator: value as any,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="AND">AND</SelectItem>
                                <SelectItem value="OR">OR</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        <div
                          className={index > 0 ? "col-span-3" : "col-span-5"}
                        >
                          <Label>Question</Label>
                          <Select
                            value={condition.questionId}
                            onValueChange={(value) =>
                              updateCondition(condition.id, {
                                questionId: value,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select question..." />
                            </SelectTrigger>
                            <SelectContent>
                              {questions.map((q) => (
                                <SelectItem key={q.id} value={q.id}>
                                  {q.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-3">
                          <Label>Operator</Label>
                          <Select
                            value={condition.operator}
                            onValueChange={(value) =>
                              updateCondition(condition.id, {
                                operator: value as any,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {operators.map((op) => (
                                <SelectItem key={op.value} value={op.value}>
                                  {op.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-3">
                          <Label>Value</Label>
                          <Input
                            value={condition.value}
                            onChange={(e) =>
                              updateCondition(condition.id, {
                                value: e.target.value,
                              })
                            }
                            placeholder="Enter value..."
                          />
                        </div>
                        <div className="col-span-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCondition(condition.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">Actions</h4>
                  <Button variant="outline" size="sm" onClick={addAction}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Action
                  </Button>
                </div>
                <div className="space-y-3">
                  {editingRule.actions.map((action) => (
                    <div key={action.id} className="border rounded p-3">
                      <div className="grid grid-cols-12 gap-3 items-end">
                        <div className="col-span-3">
                          <Label>Action Type</Label>
                          <Select
                            value={action.type}
                            onValueChange={(value) =>
                              updateAction(action.id, { type: value as any })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="show">Show</SelectItem>
                              <SelectItem value="hide">Hide</SelectItem>
                              <SelectItem value="skip_to">Skip To</SelectItem>
                              <SelectItem value="set_value">
                                Set Value
                              </SelectItem>
                              <SelectItem value="calculate">
                                Calculate
                              </SelectItem>
                              <SelectItem value="alert">Show Alert</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-4">
                          <Label>Target</Label>
                          <Select
                            value={action.targetId}
                            onValueChange={(value) =>
                              updateAction(action.id, { targetId: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select target..." />
                            </SelectTrigger>
                            <SelectContent>
                              {questions.map((q) => (
                                <SelectItem key={q.id} value={q.id}>
                                  {q.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-4">
                          <Label>Value/Formula</Label>
                          <Input
                            value={
                              action.value ||
                              action.formula ||
                              action.message ||
                              ""
                            }
                            onChange={(e) => {
                              const value = e.target.value;
                              if (action.type === "calculate") {
                                updateAction(action.id, { formula: value });
                              } else if (action.type === "alert") {
                                updateAction(action.id, { message: value });
                              } else {
                                updateAction(action.id, { value: value });
                              }
                            }}
                            placeholder={
                              action.type === "calculate"
                                ? "Enter formula..."
                                : action.type === "alert"
                                  ? "Enter message..."
                                  : "Enter value..."
                            }
                          />
                        </div>
                        <div className="col-span-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAction(action.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRuleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveRule}>
              <Save className="w-4 h-4 mr-2" />
              Save Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
