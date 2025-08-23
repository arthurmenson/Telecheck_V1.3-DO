import React, { useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Switch } from "../components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Progress } from "../components/ui/progress";
import {
  Clipboard,
  Type,
  FileText,
  MessageSquare,
  CheckSquare,
  Circle,
  ToggleLeft,
  Calendar,
  Hash,
  Star,
  Upload,
  Link2,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  Copy,
  Edit,
  Eye,
  Save,
  Play,
  Pause,
  Settings,
  Download,
  Share,
  BarChart3,
  Filter,
  Search,
  Users,
  Clock,
  Brain,
  Zap,
  Target,
  AlertTriangle,
  CheckCircle,
  Info,
  Sparkles,
  Workflow,
  GitBranch,
  MousePointer,
  Layers,
  Move,
  GripVertical,
  Heart,
  ShieldCheck,
  Lightbulb,
  HelpCircle,
  ChevronRight,
  Smile,
  Pill,
  Shield,
  Edit3,
  Tablets,
  Stethoscope,
  Database
} from "lucide-react";

// Question Types
const QUESTION_TYPES = [
  { 
    id: 'text', 
    name: 'Text Input', 
    icon: Type, 
    description: 'Single line text input',
    category: 'input'
  },
  { 
    id: 'textarea', 
    name: 'Long Text', 
    icon: FileText, 
    description: 'Multi-line text area',
    category: 'input'
  },
  { 
    id: 'multiple_choice', 
    name: 'Multiple Choice', 
    icon: CheckSquare, 
    description: 'Single selection from options',
    category: 'choice'
  },
  { 
    id: 'checkbox', 
    name: 'Checkboxes', 
    icon: Circle, 
    description: 'Multiple selections allowed',
    category: 'choice'
  },
  { 
    id: 'dropdown', 
    name: 'Dropdown', 
    icon: ArrowRight, 
    description: 'Select from dropdown list',
    category: 'choice'
  },
  { 
    id: 'rating', 
    name: 'Rating Scale', 
    icon: Star, 
    description: 'Star or numeric rating',
    category: 'scale'
  },
  { 
    id: 'number', 
    name: 'Number Input', 
    icon: Hash, 
    description: 'Numeric input with validation',
    category: 'input'
  },
  { 
    id: 'date', 
    name: 'Date Picker', 
    icon: Calendar, 
    description: 'Date selection',
    category: 'input'
  },
  { 
    id: 'boolean', 
    name: 'Yes/No', 
    icon: ToggleLeft, 
    description: 'Boolean toggle',
    category: 'choice'
  },
  { 
    id: 'file_upload', 
    name: 'File Upload', 
    icon: Upload, 
    description: 'Document or image upload',
    category: 'media'
  },
  { 
    id: 'section_break', 
    name: 'Section Break', 
    icon: Layers, 
    description: 'Visual separator with title',
    category: 'layout'
  },
  {
    id: 'conditional',
    name: 'Conditional Logic',
    icon: GitBranch,
    description: 'Show/hide based on answers',
    category: 'logic'
  },
  {
    id: 'medication_selector',
    name: 'Medication Selector',
    icon: Pill,
    description: 'Allow selection of medications',
    category: 'medical'
  },
  {
    id: 'medication_dosage',
    name: 'Medication Dosage',
    icon: Tablets,
    description: 'Select medication dosage options',
    category: 'medical'
  },
  {
    id: 'medical_history',
    name: 'Medical History',
    icon: Heart,
    description: 'Medical conditions and history',
    category: 'medical'
  }
];

// Import MCQ Templates
import { CONSULTATION_MCQ_TEMPLATES, calculateRiskScore, requiresConsultation, calculateProgress, getEmpatheticResponse } from '../data/consultationMCQTemplates';
import { GLP1QuestionnaireTemplate } from '../components/GLP1QuestionnaireTemplate';
import { MensEDQuestionnaireTemplate } from '../components/MensEDQuestionnaireTemplate';
import { AdvancedLogicBuilder } from '../components/AdvancedLogicBuilder';
import { TemplateEditor } from '../components/TemplateEditor';
import { GLP1_QUESTIONNAIRE, MENS_ED_QUESTIONNAIRE } from '../data/dynamicQuestionnaires';
import { ProductQuestionnaireAssignment } from '../components/ProductQuestionnaireAssignment';

// Convert MCQ templates to questionnaire templates format
const QUESTIONNAIRE_TEMPLATES = [
  // Add GLP1 Questionnaire as featured template
  {
    id: 'glp1_weight_loss',
    name: 'GLP-1 Weight Loss Assessment',
    description: 'Comprehensive AI-powered questionnaire for GLP-1 medication evaluation with empathetic care',
    category: 'Weight Management',
    questions: GLP1_QUESTIONNAIRE.questions.length,
    estimatedTime: GLP1_QUESTIONNAIRE.estimatedTime,
    completionRate: 92,
    isPublic: true,
    isFeatured: true,
    dynamicData: GLP1_QUESTIONNAIRE,
    aiPowered: true,
    medicationsCount: GLP1_QUESTIONNAIRE.medications.length,
    educationalInserts: GLP1_QUESTIONNAIRE.educationalInserts.length
  },
  // Add Men's ED Ro.co-style template
  {
    id: 'mens_ed_roco_style',
    name: 'Men\'s ED Assessment (Ro.co Style)',
    description: 'Professional, discrete erectile dysfunction evaluation following clinical standards used by specialists',
    category: 'Men\'s Health',
    questions: 16,
    estimatedTime: '5-7 minutes',
    completionRate: 94,
    isPublic: true,
    isFeatured: true,
    isRocoStyle: true,
    aiPowered: true,
    medicationsCount: 4,
    clinicalValidated: true
  },
  // Add consultation MCQ templates
  ...CONSULTATION_MCQ_TEMPLATES.map(mcq => ({
    id: mcq.id,
    name: mcq.name,
    description: mcq.description,
    category: mcq.category,
    questions: mcq.questions.length,
    estimatedTime: mcq.estimatedTime,
    completionRate: Math.floor(Math.random() * 15) + 85, // Random completion rate between 85-100%
    isPublic: true,
    mcqData: mcq, // Store the full MCQ data
    riskThreshold: mcq.riskThreshold,
    consultationCriteria: mcq.consultationCriteria
  }))
];

// Sample Question Data
interface Question {
  id: string;
  type: string;
  title: string;
  description?: string;
  subtitle?: string;
  supportiveMessage?: string;
  required: boolean;
  options?: string[];
  validation?: any;
  logic?: any;
  order: number;
  riskWeight?: number;
  category?: string;
  followUpLogic?: any;
  progressWeight?: number;
  medications?: {
    id: string;
    name: string;
    genericName: string;
    dosages: string[];
    description: string;
    sideEffects: string[];
    contraindications: string[];
    cost: number;
    effectiveness: number;
  }[];
  allowMultiple?: boolean;
  showDosage?: boolean;
  medicationType?: 'prescription' | 'otc' | 'supplement' | 'any';
}

export function QuestionnaireBuilder() {
  const [activeTab, setActiveTab] = useState("builder");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [questionnaireName, setQuestionnaireName] = useState("New Questionnaire");
  const [draggedType, setDraggedType] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showLogicPanel, setShowLogicPanel] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<any>(null);
  const [previewResponses, setPreviewResponses] = useState<Record<string, any>>({});
  const [showEmpatheticMessages, setShowEmpatheticMessages] = useState(true);
  const [showGLP1Template, setShowGLP1Template] = useState(false);
  const [showMensEDTemplate, setShowMensEDTemplate] = useState(false);
  const [logicRules, setLogicRules] = useState<any[]>([]);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [showMedicationLibrary, setShowMedicationLibrary] = useState(false);
  const [availableMedications, setAvailableMedications] = useState<any[]>([]);
  const [showProductAssignments, setShowProductAssignments] = useState(false);
  const dragCounter = useRef(0);

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, type: string) => {
    setDraggedType(type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedType) {
      const questionType = QUESTION_TYPES.find(type => type.id === draggedType);
      if (questionType) {
        addQuestion(draggedType);
      }
    }
    setDraggedType(null);
    dragCounter.current = 0;
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current++;
  };

  const handleDragLeave = (e: React.DragEvent) => {
    dragCounter.current--;
  };

  // Question Management
  const addQuestion = (type: string) => {
    const questionTypeData = QUESTION_TYPES.find(t => t.id === type);
    const newQuestion: Question = {
      id: `question_${Date.now()}`,
      type,
      title: `New ${questionTypeData?.name} Question`,
      required: false,
      order: questions.length,
      ...(type === 'multiple_choice' || type === 'checkbox' || type === 'dropdown' ? {
        options: ['Option 1', 'Option 2', 'Option 3']
      } : {}),
      ...(type === 'medication_selector' ? {
        medications: [],
        allowMultiple: false,
        medicationType: 'any' as const
      } : {}),
      ...(type === 'medication_dosage' ? {
        medications: [],
        showDosage: true
      } : {}),
      ...(type === 'medical_history' ? {
        options: ['High Blood Pressure', 'Diabetes', 'Heart Disease', 'Kidney Disease', 'Liver Disease']
      } : {})
    };
    setQuestions([...questions, newQuestion]);
    setSelectedQuestion(newQuestion.id);
  };

  // Load sample medications from product data
  React.useEffect(() => {
    import('../data/products').then(module => {
      const medications = module.SAMPLE_PRODUCTS
        .filter(product => product.type === 'prescription' || product.type === 'otc')
        .map(product => ({
          id: product.id,
          name: product.name,
          genericName: product.genericName || product.name,
          dosages: product.dosages,
          description: product.shortDescription,
          sideEffects: product.sideEffects,
          contraindications: product.contraindications,
          cost: product.price,
          effectiveness: Math.round(product.rating * 2), // Convert 5-star to 10-point scale
          type: product.type,
          category: product.category.name
        }));
      setAvailableMedications(medications);
    });
  }, []);

  const addMedicationToQuestion = (questionId: string, medication: any) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const existingMeds = q.medications || [];
        const medicationExists = existingMeds.find(med => med.id === medication.id);
        if (!medicationExists) {
          return {
            ...q,
            medications: [...existingMeds, medication]
          };
        }
      }
      return q;
    }));
  };

  const removeMedicationFromQuestion = (questionId: string, medicationId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.medications) {
        return {
          ...q,
          medications: q.medications.filter(med => med.id !== medicationId)
        };
      }
      return q;
    }));
  };

  // Load MCQ Template
  const loadMCQTemplate = (templateId: string) => {
    const template = QUESTIONNAIRE_TEMPLATES.find(t => t.id === templateId);

    // Handle GLP1 Dynamic Questionnaire
    if (template && template.dynamicData) {
      if (templateId === 'glp1_weight_loss') {
        setShowGLP1Template(true);
        return;
      }
    }

    // Handle Men's ED Ro.co-style template
    if (template && template.isRocoStyle) {
      if (templateId === 'mens_ed_roco_style') {
        setShowMensEDTemplate(true);
        return;
      }
    }

    // Handle other dynamic questionnaires
    if (template && template.dynamicData) {

      const dynamicQuestions = template.dynamicData.questions.map((q: any, index: number) => ({
        id: q.id,
        type: q.type,
        title: q.title,
        description: q.description,
        subtitle: q.subtitle,
        supportiveMessage: q.empathicMessage,
        required: q.required,
        options: q.options,
        order: index,
        riskWeight: q.weight,
        category: q.category,
        progressWeight: q.weight || 1
      }));

      setQuestions(dynamicQuestions);
      setQuestionnaireName(template.name);
      setCurrentTemplate(template.dynamicData);
      setActiveTab('builder');
      setSelectedQuestion(null);
      setPreviewResponses({});
      return;
    }

    // Handle MCQ Templates
    if (template && template.mcqData) {
      const mcqQuestions = template.mcqData.questions.map((q, index) => ({
        id: q.id,
        type: q.type,
        title: q.title,
        description: q.description,
        subtitle: (q as any).subtitle,
        supportiveMessage: (q as any).supportiveMessage,
        required: q.required,
        options: q.options,
        order: index,
        riskWeight: q.riskWeight,
        category: q.category,
        followUpLogic: q.followUpLogic,
        progressWeight: (q as any).progressWeight || 1
      }));

      setQuestions(mcqQuestions);
      setQuestionnaireName(template.name);
      setCurrentTemplate(template.mcqData);
      setActiveTab('builder');
      setSelectedQuestion(null);
      setPreviewResponses({});
    }
  };

  // Preview response handler
  const handlePreviewResponse = (questionId: string, value: any) => {
    setPreviewResponses(prev => ({ ...prev, [questionId]: value }));
  };

  // Calculate current progress
  const progress = questions.length > 0 ? calculateProgress(previewResponses, questions as any) : 0;

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, ...updates } : q
    ));
  };

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
    if (selectedQuestion === id) {
      setSelectedQuestion(null);
    }
  };

  const duplicateQuestion = (id: string) => {
    const question = questions.find(q => q.id === id);
    if (question) {
      const newQuestion = {
        ...question,
        id: `question_${Date.now()}`,
        title: `${question.title} (Copy)`,
        order: questions.length
      };
      setQuestions([...questions, newQuestion]);
    }
  };

  const moveQuestion = (id: string, direction: 'up' | 'down') => {
    const index = questions.findIndex(q => q.id === id);
    if (index === -1) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= questions.length) return;
    
    const newQuestions = [...questions];
    [newQuestions[index], newQuestions[newIndex]] = [newQuestions[newIndex], newQuestions[index]];
    
    // Update order
    newQuestions.forEach((q, i) => q.order = i);
    setQuestions(newQuestions);
  };

  // Get selected question
  const selectedQuestionData = questions.find(q => q.id === selectedQuestion);

  // Show GLP1 Template if selected
  if (showGLP1Template) {
    return (
      <div className="min-h-screen aurora-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              onClick={() => setShowGLP1Template(false)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Builder
            </Button>
            <h1 className="text-2xl font-bold text-foreground">
              GLP-1 Questionnaire Template
            </h1>
          </div>
          <GLP1QuestionnaireTemplate />
        </div>
      </div>
    );
  }

  // Show Men's ED Template if selected
  if (showMensEDTemplate) {
    return (
      <div className="min-h-screen aurora-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              onClick={() => setShowMensEDTemplate(false)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Builder
            </Button>
            <h1 className="text-2xl font-bold text-foreground">
              Men's ED Assessment Template (Ro.co Style)
            </h1>
          </div>
          <MensEDQuestionnaireTemplate />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen aurora-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-emerald-100 to-blue-100 dark:from-emerald-900/30 dark:to-blue-900/30 rounded-xl">
                <Heart className="w-8 h-8 text-emerald-600" />
              </div>
              Empathetic Care Builder
            </h1>
            <p className="text-muted-foreground mt-2">
              Create compassionate patient assessments that prioritize comfort and understanding
            </p>
            {currentTemplate && (
              <div className="mt-3 flex items-center gap-2">
                <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  Clinical Template
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Based on {currentTemplate.name}
                </span>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowEmpatheticMessages(!showEmpatheticMessages)}>
              <Smile className="w-4 h-4 mr-2" />
              {showEmpatheticMessages ? 'Hide' : 'Show'} Support
            </Button>
            <Button variant="outline" onClick={() => setIsPreviewMode(!isPreviewMode)}>
              <Eye className="w-4 h-4 mr-2" />
              {isPreviewMode ? 'Edit Mode' : 'Patient View'}
            </Button>
            <Button variant="outline">
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            <Button className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white border-0 hover:from-emerald-600 hover:to-blue-600">
              <Share className="w-4 h-4 mr-2" />
              Publish
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="builder">Builder</TabsTrigger>
            <TabsTrigger value="logic">Logic & Flow</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="assignments">Product Links</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Builder Tab */}
          <TabsContent value="builder" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Question Types Palette */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Layers className="w-5 h-5" />
                      Question Types
                    </CardTitle>
                    <CardDescription>Drag and drop to add questions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {['input', 'choice', 'scale', 'medical', 'media', 'layout', 'logic'].map(category => {
                        const categoryQuestions = QUESTION_TYPES.filter(type => type.category === category);
                        if (categoryQuestions.length === 0) return null;
                        
                        return (
                          <div key={category}>
                            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                              {category}
                            </h4>
                            <div className="space-y-2">
                              {categoryQuestions.map(type => {
                                const Icon = type.icon;
                                return (
                                  <div
                                    key={type.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, type.id)}
                                    className="flex items-center gap-3 p-3 border border-border/50 rounded-lg cursor-grab hover:bg-accent/50 hover:border-primary/30 transition-all group"
                                  >
                                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                      <Icon className="w-4 h-4 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-foreground">{type.name}</p>
                                      <p className="text-xs text-muted-foreground truncate">{type.description}</p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Form Builder Canvas */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          <Input
                            value={questionnaireName}
                            onChange={(e) => setQuestionnaireName(e.target.value)}
                            className="text-lg font-semibold border-none p-0 h-auto focus-visible:ring-0"
                          />
                        </CardTitle>
                        <CardDescription>
                          {questions.length} questions • Est. {currentTemplate?.estimatedTime || '5-8 min'}
                          {isPreviewMode && questions.length > 0 && (
                            <div className="mt-2">
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-emerald-600">Progress: {progress}%</span>
                                <Progress value={progress} className="h-2 w-32" />
                              </div>
                            </div>
                          )}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {isPreviewMode && currentTemplate && (
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                            <Brain className="w-3 h-3 mr-1" />
                            AI Assessment
                          </Badge>
                        )}
                        <Button variant="outline" size="sm" onClick={() => setShowLogicPanel(!showLogicPanel)}>
                          <GitBranch className="w-4 h-4 mr-1" />
                          Logic
                        </Button>
                        <Badge variant="outline">Draft</Badge>
                      </div>
                    </div>
                    {currentTemplate && showEmpatheticMessages && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                        <div className="flex items-start gap-3">
                          <Heart className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="text-sm font-semibold text-emerald-800 dark:text-emerald-200 mb-1">
                              Welcome Message
                            </h4>
                            <p className="text-sm text-emerald-700 dark:text-emerald-300">
                              {currentTemplate.empathicIntro}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div 
                      className={`min-h-96 border-2 border-dashed border-border/50 rounded-lg p-6 transition-all ${
                        draggedType ? 'border-primary/50 bg-primary/5' : ''
                      }`}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                    >
                      {questions.length === 0 ? (
                        <div className="text-center text-muted-foreground py-12">
                          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-emerald-100 to-blue-100 dark:from-emerald-900/30 dark:to-blue-900/30 rounded-full flex items-center justify-center">
                            <Heart className="w-8 h-8 text-emerald-600" />
                          </div>
                          <h3 className="text-lg font-semibold mb-2">Create Compassionate Care</h3>
                          <p className="text-sm mb-4">Start with an empathetic template or build your own supportive questionnaire</p>
                          <div className="flex justify-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => setActiveTab('templates')}>
                              <Lightbulb className="w-4 h-4 mr-1" />
                              Browse Templates
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {questions.map((question, index) => {
                            const questionType = QUESTION_TYPES.find(t => t.id === question.type);
                            const Icon = questionType?.icon || Type;
                            const isSelected = selectedQuestion === question.id;
                            
                            return (
                              <div
                                key={question.id}
                                className={`p-4 border rounded-lg transition-all ${
                                  isPreviewMode ? 'border-emerald-200 dark:border-emerald-800 bg-gradient-to-r from-emerald-50/50 to-blue-50/50 dark:from-emerald-900/10 dark:to-blue-900/10' :
                                  isSelected ? 'border-primary bg-primary/5 cursor-pointer' : 'border-border hover:border-primary/30 cursor-pointer'
                                }`}
                                onClick={() => !isPreviewMode && setSelectedQuestion(question.id)}
                              >
                                <div className="flex items-start gap-3">
                                  {!isPreviewMode && (
                                    <div className="flex items-center gap-2">
                                      <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                                      <div className="w-6 h-6 bg-primary/10 rounded flex items-center justify-center">
                                        <Icon className="w-3 h-3 text-primary" />
                                      </div>
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    {!isPreviewMode && (
                                      <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs font-medium text-muted-foreground">
                                          #{index + 1}
                                        </span>
                                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                          {questionType?.name}
                                        </span>
                                        {question.required && (
                                          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                                            Required
                                          </span>
                                        )}
                                        {(question as any).riskWeight && (
                                          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                                            Risk: {(question as any).riskWeight}/5
                                          </span>
                                        )}
                                      </div>
                                    )}
                                    <h4 className={`font-medium text-foreground mb-1 ${
                                      isPreviewMode ? 'text-lg' : ''
                                    }`}>{question.title}</h4>
                                    {(question as any).subtitle && isPreviewMode && (
                                      <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-2 italic">
                                        {(question as any).subtitle}
                                      </p>
                                    )}
                                    {question.description && (
                                      <p className="text-sm text-muted-foreground mb-2">{question.description}</p>
                                    )}
                                    
                                    {/* Question Preview/Interactive */}
                                    <div className={`mt-3 p-3 rounded ${
                                      isPreviewMode ? 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700' : 'bg-muted/30'
                                    }`}>
                                      {question.type === 'text' && (
                                        <Input
                                          placeholder={isPreviewMode ? "Your answer..." : "Text input preview"}
                                          disabled={!isPreviewMode}
                                          value={previewResponses[question.id] || ''}
                                          onChange={(e) => isPreviewMode && handlePreviewResponse(question.id, e.target.value)}
                                        />
                                      )}
                                      {question.type === 'textarea' && (
                                        <Textarea
                                          placeholder={isPreviewMode ? "Share your thoughts..." : "Long text preview"}
                                          disabled={!isPreviewMode}
                                          rows={2}
                                          value={previewResponses[question.id] || ''}
                                          onChange={(e) => isPreviewMode && handlePreviewResponse(question.id, e.target.value)}
                                        />
                                      )}
                                      {(question.type === 'multiple_choice' || question.type === 'checkbox') && question.options && (
                                        <div className="space-y-3">
                                          {question.options.map((option, i) => (
                                            <div key={i} className={`flex items-center gap-3 p-2 rounded transition-colors ${
                                              isPreviewMode ? 'hover:bg-emerald-50 dark:hover:bg-emerald-900/20 cursor-pointer' : ''
                                            }`}>
                                              <input
                                                type={question.type === 'multiple_choice' ? 'radio' : 'checkbox'}
                                                disabled={!isPreviewMode}
                                                name={question.type === 'multiple_choice' ? question.id : undefined}
                                                checked={isPreviewMode ?
                                                  (question.type === 'multiple_choice' ?
                                                    previewResponses[question.id] === option :
                                                    Array.isArray(previewResponses[question.id]) && previewResponses[question.id].includes(option)
                                                  ) : false
                                                }
                                                onChange={(e) => {
                                                  if (!isPreviewMode) return;
                                                  if (question.type === 'multiple_choice') {
                                                    handlePreviewResponse(question.id, option);
                                                  } else {
                                                    const current = previewResponses[question.id] || [];
                                                    if (e.target.checked) {
                                                      handlePreviewResponse(question.id, [...current, option]);
                                                    } else {
                                                      handlePreviewResponse(question.id, current.filter((item: string) => item !== option));
                                                    }
                                                  }
                                                }}
                                                className="w-4 h-4 text-emerald-600"
                                              />
                                              <span className={`text-sm ${
                                                isPreviewMode ? 'text-foreground' : 'text-muted-foreground'
                                              }`}>{option}</span>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                      {question.type === 'dropdown' && question.options && (
                                        <Select
                                          disabled={!isPreviewMode}
                                          value={previewResponses[question.id] || ''}
                                          onValueChange={(value) => isPreviewMode && handlePreviewResponse(question.id, value)}
                                        >
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select an option..." />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {question.options.map((option, i) => (
                                              <SelectItem key={i} value={option}>{option}</SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      )}
                                      {question.type === 'boolean' && (
                                        <div className="flex items-center gap-4">
                                          <Button
                                            variant={previewResponses[question.id] === 'Yes' ? 'default' : 'outline'}
                                            size="sm"
                                            disabled={!isPreviewMode}
                                            onClick={() => isPreviewMode && handlePreviewResponse(question.id, 'Yes')}
                                            className={isPreviewMode ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                                          >
                                            Yes
                                          </Button>
                                          <Button
                                            variant={previewResponses[question.id] === 'No' ? 'default' : 'outline'}
                                            size="sm"
                                            disabled={!isPreviewMode}
                                            onClick={() => isPreviewMode && handlePreviewResponse(question.id, 'No')}
                                            className={isPreviewMode ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                                          >
                                            No
                                          </Button>
                                        </div>
                                      )}
                                      {question.type === 'rating' && (
                                        <div className="flex gap-1">
                                          {[1,2,3,4,5].map(i => (
                                            <Star
                                              key={i}
                                              className={`w-6 h-6 cursor-pointer transition-colors ${
                                                isPreviewMode && previewResponses[question.id] >= i ?
                                                  'text-yellow-400 fill-yellow-400' :
                                                  isPreviewMode ? 'text-gray-300 hover:text-yellow-300' : 'text-muted-foreground'
                                              }`}
                                              onClick={() => isPreviewMode && handlePreviewResponse(question.id, i)}
                                            />
                                          ))}
                                        </div>
                                      )}
                                      {(question.type === 'medication_selector' || question.type === 'medication_dosage') && (
                                        <div className="space-y-3">
                                          {question.medications && question.medications.length > 0 ? (
                                            question.medications.map((medication: any, medIndex: number) => (
                                              <div key={medIndex} className={`p-3 border rounded-lg transition-colors ${
                                                isPreviewMode ? 'hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer' : 'bg-muted/50'
                                              }`}>
                                                <div className="flex items-start gap-3">
                                                  {isPreviewMode && (
                                                    <input
                                                      type={question.allowMultiple ? 'checkbox' : 'radio'}
                                                      name={question.allowMultiple ? undefined : question.id}
                                                      checked={isPreviewMode ?
                                                        (question.allowMultiple ?
                                                          Array.isArray(previewResponses[question.id]) && previewResponses[question.id].includes(medication.id) :
                                                          previewResponses[question.id] === medication.id
                                                        ) : false
                                                      }
                                                      onChange={(e) => {
                                                        if (!isPreviewMode) return;
                                                        if (question.allowMultiple) {
                                                          const current = previewResponses[question.id] || [];
                                                          if (e.target.checked) {
                                                            handlePreviewResponse(question.id, [...current, medication.id]);
                                                          } else {
                                                            handlePreviewResponse(question.id, current.filter((id: string) => id !== medication.id));
                                                          }
                                                        } else {
                                                          handlePreviewResponse(question.id, medication.id);
                                                        }
                                                      }}
                                                      className="w-4 h-4 text-blue-600 mt-1"
                                                    />
                                                  )}
                                                  <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                      <Pill className="w-4 h-4 text-blue-600" />
                                                      <h4 className="font-medium text-foreground">{medication.name}</h4>
                                                      {medication.genericName && medication.genericName !== medication.name && (
                                                        <span className="text-sm text-muted-foreground">({medication.genericName})</span>
                                                      )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mt-1">{medication.description}</p>
                                                    {question.showDosage && medication.dosages && (
                                                      <div className="mt-2">
                                                        <span className="text-xs font-medium text-muted-foreground">Available dosages: </span>
                                                        <span className="text-xs text-foreground">{medication.dosages.join(', ')}</span>
                                                      </div>
                                                    )}
                                                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                                      <span>Effectiveness: {medication.effectiveness}/10</span>
                                                      <span>~${medication.cost}/month</span>
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            ))
                                          ) : (
                                            <div className="text-center py-4 text-muted-foreground">
                                              <Pill className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                              <p className="text-sm">No medications added yet</p>
                                              {!isPreviewMode && (
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  className="mt-2"
                                                  onClick={() => setShowMedicationLibrary(true)}
                                                >
                                                  Browse Medications
                                                </Button>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                      {question.type === 'medical_history' && question.options && (
                                        <div className="space-y-3">
                                          {question.options.map((condition, i) => (
                                            <div key={i} className={`flex items-center gap-3 p-2 rounded transition-colors ${
                                              isPreviewMode ? 'hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer' : ''
                                            }`}>
                                              <input
                                                type="checkbox"
                                                disabled={!isPreviewMode}
                                                checked={isPreviewMode ?
                                                  Array.isArray(previewResponses[question.id]) && previewResponses[question.id].includes(condition) : false
                                                }
                                                onChange={(e) => {
                                                  if (!isPreviewMode) return;
                                                  const current = previewResponses[question.id] || [];
                                                  if (e.target.checked) {
                                                    handlePreviewResponse(question.id, [...current, condition]);
                                                  } else {
                                                    handlePreviewResponse(question.id, current.filter((item: string) => item !== condition));
                                                  }
                                                }}
                                                className="w-4 h-4 text-red-600"
                                              />
                                              <Heart className="w-4 h-4 text-red-600" />
                                              <span className={`text-sm ${
                                                isPreviewMode ? 'text-foreground' : 'text-muted-foreground'
                                              }`}>{condition}</span>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>

                                    {/* Supportive Message */}
                                    {(question as any).supportiveMessage && isPreviewMode && showEmpatheticMessages && (
                                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 rounded-r">
                                        <div className="flex items-start gap-2">
                                          <HelpCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                          <p className="text-sm text-blue-700 dark:text-blue-300">
                                            {(question as any).supportiveMessage}
                                          </p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  {!isPreviewMode && (
                                    <div className="flex items-center gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          moveQuestion(question.id, 'up');
                                        }}
                                        disabled={index === 0}
                                      >
                                        <ArrowLeft className="w-3 h-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          moveQuestion(question.id, 'down');
                                        }}
                                        disabled={index === questions.length - 1}
                                      >
                                        <ArrowRight className="w-3 h-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          duplicateQuestion(question.id);
                                        }}
                                      >
                                        <Copy className="w-3 h-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          deleteQuestion(question.id);
                                        }}
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  )}
                                  {isPreviewMode && index < questions.length - 1 && (
                                    <ChevronRight className="w-5 h-5 text-emerald-600" />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* End of questionnaire message */}
                      {isPreviewMode && questions.length > 0 && currentTemplate && showEmpatheticMessages && (
                        <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                          <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <h4 className="text-sm font-semibold text-emerald-800 dark:text-emerald-200 mb-1">
                                Thank You
                              </h4>
                              <p className="text-sm text-emerald-700 dark:text-emerald-300 mb-2">
                                {currentTemplate.supportiveClosing}
                              </p>
                              <p className="text-sm text-emerald-600 dark:text-emerald-400">
                                {currentTemplate.nextStepsMessage}
                              </p>
                              {Object.keys(previewResponses).length > 0 && currentTemplate && (
                                <div className="mt-3 p-2 bg-white dark:bg-gray-800 rounded border">
                                  <div className="text-xs text-muted-foreground mb-1">Assessment Summary:</div>
                                  <div className="text-xs">
                                    {(() => {
                                      const riskScore = calculateRiskScore(previewResponses, currentTemplate.questions);
                                      const needsConsultation = requiresConsultation(previewResponses, currentTemplate);
                                      const riskLevel = riskScore > currentTemplate.riskThreshold * 1.5 ? 'high' :
                                                       riskScore > currentTemplate.riskThreshold ? 'medium' : 'low';
                                      return (
                                        <div className="space-y-1">
                                          <div className={`inline-block px-2 py-1 rounded text-xs ${
                                            needsConsultation ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                                          }`}>
                                            {needsConsultation ? 'Consultation Recommended' : 'Self-Care Appropriate'}
                                          </div>
                                          <div className="text-muted-foreground">
                                            Risk Score: {riskScore}/{currentTemplate.riskThreshold} • {getEmpatheticResponse(riskLevel)}
                                          </div>
                                        </div>
                                      );
                                    })()}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Question Properties Panel */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Properties
                    </CardTitle>
                    <CardDescription>
                      {selectedQuestionData ? 'Configure selected question' : 'Select a question to edit'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {selectedQuestionData ? (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="question-title">Question Title</Label>
                          <Input
                            id="question-title"
                            value={selectedQuestionData.title}
                            onChange={(e) => updateQuestion(selectedQuestionData.id, { title: e.target.value })}
                            placeholder="Enter question title..."
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="question-description">Description (Optional)</Label>
                          <Textarea
                            id="question-description"
                            value={selectedQuestionData.description || ''}
                            onChange={(e) => updateQuestion(selectedQuestionData.id, { description: e.target.value })}
                            placeholder="Add helper text..."
                            rows={2}
                          />
                        </div>

                        <div>
                          <Label htmlFor="question-subtitle">Supportive Subtitle (Optional)</Label>
                          <Input
                            id="question-subtitle"
                            value={selectedQuestionData.subtitle || ''}
                            onChange={(e) => updateQuestion(selectedQuestionData.id, { subtitle: e.target.value })}
                            placeholder="Add reassuring subtitle..."
                          />
                        </div>

                        <div>
                          <Label htmlFor="question-supportive">Empathetic Message (Optional)</Label>
                          <Textarea
                            id="question-supportive"
                            value={selectedQuestionData.supportiveMessage || ''}
                            onChange={(e) => updateQuestion(selectedQuestionData.id, { supportiveMessage: e.target.value })}
                            placeholder="Add supportive, empathetic guidance..."
                            rows={2}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label htmlFor="required">Required Field</Label>
                          <Switch
                            id="required"
                            checked={selectedQuestionData.required}
                            onCheckedChange={(checked) => updateQuestion(selectedQuestionData.id, { required: checked })}
                          />
                        </div>

                        {/* Question-specific options */}
                        {(selectedQuestionData.type === 'multiple_choice' ||
                          selectedQuestionData.type === 'checkbox' ||
                          selectedQuestionData.type === 'dropdown') && (
                          <div>
                            <Label>Options</Label>
                            <div className="space-y-2 mt-2">
                              {selectedQuestionData.options?.map((option, index) => (
                                <div key={index} className="flex gap-2">
                                  <Input
                                    value={option}
                                    onChange={(e) => {
                                      const newOptions = [...(selectedQuestionData.options || [])];
                                      newOptions[index] = e.target.value;
                                      updateQuestion(selectedQuestionData.id, { options: newOptions });
                                    }}
                                    placeholder={`Option ${index + 1}`}
                                  />
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const newOptions = selectedQuestionData.options?.filter((_, i) => i !== index);
                                      updateQuestion(selectedQuestionData.id, { options: newOptions });
                                    }}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              ))}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const newOptions = [...(selectedQuestionData.options || []), 'New Option'];
                                  updateQuestion(selectedQuestionData.id, { options: newOptions });
                                }}
                                className="w-full"
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Add Option
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Medication-specific options */}
                        {(selectedQuestionData.type === 'medication_selector' || selectedQuestionData.type === 'medication_dosage') && (
                          <div className="space-y-4">
                            <div>
                              <Label>Medication Type</Label>
                              <Select
                                value={selectedQuestionData.medicationType || 'any'}
                                onValueChange={(value) => updateQuestion(selectedQuestionData.id, { medicationType: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type..." />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="any">Any Medication</SelectItem>
                                  <SelectItem value="prescription">Prescription Only</SelectItem>
                                  <SelectItem value="otc">Over-the-Counter</SelectItem>
                                  <SelectItem value="supplement">Supplements</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {selectedQuestionData.type === 'medication_selector' && (
                              <div className="flex items-center justify-between">
                                <Label htmlFor="allow-multiple">Allow Multiple Selection</Label>
                                <Switch
                                  id="allow-multiple"
                                  checked={selectedQuestionData.allowMultiple}
                                  onCheckedChange={(checked) => updateQuestion(selectedQuestionData.id, { allowMultiple: checked })}
                                />
                              </div>
                            )}

                            {selectedQuestionData.type === 'medication_dosage' && (
                              <div className="flex items-center justify-between">
                                <Label htmlFor="show-dosage">Show Dosage Information</Label>
                                <Switch
                                  id="show-dosage"
                                  checked={selectedQuestionData.showDosage}
                                  onCheckedChange={(checked) => updateQuestion(selectedQuestionData.id, { showDosage: checked })}
                                />
                              </div>
                            )}

                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <Label>Selected Medications</Label>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setShowMedicationLibrary(true)}
                                >
                                  <Plus className="w-3 h-3 mr-1" />
                                  Add Medication
                                </Button>
                              </div>
                              <div className="space-y-2 max-h-40 overflow-y-auto">
                                {selectedQuestionData.medications?.length ? (
                                  selectedQuestionData.medications.map((medication: any, index: number) => (
                                    <div key={index} className="flex items-center gap-2 p-2 border rounded">
                                      <Pill className="w-4 h-4 text-blue-600" />
                                      <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium truncate">{medication.name}</div>
                                        <div className="text-xs text-muted-foreground">${medication.cost}/month</div>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeMedicationFromQuestion(selectedQuestionData.id, medication.id)}
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-sm text-muted-foreground text-center py-4">
                                    No medications selected
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Medical History specific options */}
                        {selectedQuestionData.type === 'medical_history' && (
                          <div>
                            <Label>Medical Conditions</Label>
                            <div className="space-y-2 mt-2">
                              {selectedQuestionData.options?.map((condition, index) => (
                                <div key={index} className="flex gap-2">
                                  <Input
                                    value={condition}
                                    onChange={(e) => {
                                      const newOptions = [...(selectedQuestionData.options || [])];
                                      newOptions[index] = e.target.value;
                                      updateQuestion(selectedQuestionData.id, { options: newOptions });
                                    }}
                                    placeholder={`Condition ${index + 1}`}
                                  />
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const newOptions = selectedQuestionData.options?.filter((_, i) => i !== index);
                                      updateQuestion(selectedQuestionData.id, { options: newOptions });
                                    }}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              ))}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const newOptions = [...(selectedQuestionData.options || []), 'New Condition'];
                                  updateQuestion(selectedQuestionData.id, { options: newOptions });
                                }}
                                className="w-full"
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Add Condition
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* AI Enhancement Section */}
                        <div className="pt-4 border-t">
                          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                            <Brain className="w-4 h-4 text-purple-600" />
                            AI Enhancement
                          </h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs">Smart Validation</Label>
                              <Switch size="sm" />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label className="text-xs">Auto-categorization</Label>
                              <Switch size="sm" />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label className="text-xs">Response Insights</Label>
                              <Switch size="sm" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        <MousePointer className="w-8 h-8 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">Select a question to configure its properties</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Logic Tab */}
          <TabsContent value="logic" className="space-y-6">
            <AdvancedLogicBuilder
              questions={questions}
              logicRules={logicRules}
              onRulesChange={setLogicRules}
              onFlowChange={(flow) => {
                // Handle flow diagram changes
                console.log('Flow updated:', flow);
              }}
            />
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Heart className="w-6 h-6 text-emerald-600" />
                  Empathetic Care Templates
                </h2>
                <p className="text-muted-foreground">Start with compassionate, clinically-validated assessments designed to support patient comfort</p>
              </div>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search templates..." className="pl-10 w-64" />
                </div>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {QUESTIONNAIRE_TEMPLATES.map((template) => (
                <Card key={template.id} className={`hover:shadow-lg transition-shadow ${
                  template.isFeatured ? 'ring-2 ring-emerald-500 shadow-lg' : ''
                }`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-foreground">{template.name}</h3>
                          {template.isFeatured && (
                            <Badge className="bg-emerald-100 text-emerald-800 text-xs">
                              <Sparkles className="w-3 h-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="secondary" className="text-xs">
                            {template.category}
                          </Badge>
                          {(template.mcqData || template.aiPowered) && (
                            <Badge className="bg-purple-100 text-purple-800 text-xs">
                              <Brain className="w-3 h-3 mr-1" />
                              AI-Powered
                            </Badge>
                          )}
                          {template.medicationsCount && (
                            <Badge className="bg-blue-100 text-blue-800 text-xs">
                              <Pill className="w-3 h-3 mr-1" />
                              {template.medicationsCount} Medications
                            </Badge>
                          )}
                          {template.educationalInserts && (
                            <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                              <Lightbulb className="w-3 h-3 mr-1" />
                              Educational
                            </Badge>
                          )}
                          {template.isRocoStyle && (
                            <Badge className="bg-indigo-100 text-indigo-800 text-xs">
                              <Shield className="w-3 h-3 mr-1" />
                              Ro.co Style
                            </Badge>
                          )}
                          {template.clinicalValidated && (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Clinical
                            </Badge>
                          )}
                        </div>
                      </div>
                      {template.isPublic && !template.isFeatured && (
                        <Badge className="bg-green-100 text-green-800">Consultation MCQ</Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Questions</div>
                        <div className="font-medium">{template.questions}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Est. Time</div>
                        <div className="font-medium">{template.estimatedTime}</div>
                      </div>
                    </div>

                    {template.mcqData && (
                      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          Consultation Triggers
                        </h4>
                        <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                          {template.consultationCriteria.slice(0, 3).map((criteria, index) => (
                            <div key={index} className="flex items-start gap-1">
                              <span className="text-blue-500">•</span>
                              <span>{criteria}</span>
                            </div>
                          ))}
                          {template.consultationCriteria.length > 3 && (
                            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                              +{template.consultationCriteria.length - 3} more criteria
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Completion Rate</span>
                        <span className="font-medium">{template.completionRate}%</span>
                      </div>
                      <Progress value={template.completionRate} className="h-2" />
                    </div>

                    {template.mcqData && (
                      <div className="mb-4 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Risk Threshold</span>
                          <span className="font-medium text-orange-600">{template.riskThreshold} points</span>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        className="flex-1 gradient-bg text-white border-0"
                        onClick={() => loadMCQTemplate(template.id)}
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Load MCQ
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingTemplate(template.dynamicData || template.mcqData || template);
                          setShowTemplateEditor(true);
                        }}
                      >
                        <Edit3 className="w-3 h-3" />
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="w-3 h-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>{template.name}</DialogTitle>
                            <DialogDescription>{template.description}</DialogDescription>
                          </DialogHeader>
                          {template.mcqData && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div className="text-center p-2 bg-blue-50 rounded">
                                  <div className="font-bold text-blue-600">{template.questions}</div>
                                  <div className="text-blue-600/70">Questions</div>
                                </div>
                                <div className="text-center p-2 bg-orange-50 rounded">
                                  <div className="font-bold text-orange-600">{template.riskThreshold}</div>
                                  <div className="text-orange-600/70">Risk Threshold</div>
                                </div>
                                <div className="text-center p-2 bg-green-50 rounded">
                                  <div className="font-bold text-green-600">{template.completionRate}%</div>
                                  <div className="text-green-600/70">Completion</div>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-semibold mb-2">Consultation Criteria</h4>
                                <div className="space-y-1">
                                  {template.consultationCriteria.map((criteria, index) => (
                                    <div key={index} className="flex items-start gap-2 text-sm">
                                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                      <span>{criteria}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <h4 className="font-semibold mb-2">Sample Questions Preview</h4>
                                <div className="space-y-2">
                                  {template.mcqData.questions.slice(0, 3).map((question, index) => (
                                    <div key={index} className="p-3 border rounded-lg">
                                      <div className="font-medium text-sm mb-1">{question.title}</div>
                                      <div className="text-xs text-muted-foreground mb-2">
                                        {question.category} • Risk Weight: {question.riskWeight}/5
                                        {question.required && ' • Required'}
                                      </div>
                                      {question.options && (
                                        <div className="space-y-1">
                                          {question.options.slice(0, 2).map((option, optIndex) => (
                                            <div key={optIndex} className="text-xs text-muted-foreground flex items-center gap-2">
                                              <input type={question.type === 'multiple_choice' ? 'radio' : 'checkbox'} disabled />
                                              {option}
                                            </div>
                                          ))}
                                          {question.options.length > 2 && (
                                            <div className="text-xs text-muted-foreground">...and {question.options.length - 2} more options</div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                  <div className="text-xs text-muted-foreground text-center py-2">
                                    ...and {template.questions - 3} more questions
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Product Assignments Tab */}
          <TabsContent value="assignments" className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
                <Link2 className="w-6 h-6 text-blue-600" />
                Product-Questionnaire Assignments
              </h2>
              <p className="text-muted-foreground mb-6">
                Configure which questionnaires are automatically linked to specific products for personalized patient assessments
              </p>
              <Button
                onClick={() => setShowProductAssignments(true)}
                className="gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                size="lg"
              >
                <Plus className="w-5 h-5" />
                Manage Product-Questionnaire Links
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Link2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Smart Assignment</h3>
                  <p className="text-sm text-muted-foreground">
                    Automatically show relevant questionnaires when customers select specific products or medications
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Target className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Personalized Care</h3>
                  <p className="text-sm text-muted-foreground">
                    Ensure patients receive the most appropriate assessment based on their product selections
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Workflow className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Streamlined Workflow</h3>
                  <p className="text-sm text-muted-foreground">
                    Reduce manual work by automatically triggering the right questionnaires at the right time
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Product-Questionnaire Assignment Manager Dialog */}
            <ProductQuestionnaireAssignment
              isOpen={showProductAssignments}
              onClose={() => setShowProductAssignments(false)}
            />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Responses</p>
                      <p className="text-2xl font-bold text-foreground">1,247</p>
                      <p className="text-xs text-green-600">+12% this week</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                      <p className="text-2xl font-bold text-foreground">87.3%</p>
                      <p className="text-xs text-green-600">+2.4% this week</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Avg. Time</p>
                      <p className="text-2xl font-bold text-foreground">6.4m</p>
                      <p className="text-xs text-muted-foreground">Within target</p>
                    </div>
                    <Clock className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">AI Insights</p>
                      <p className="text-2xl font-bold text-foreground">342</p>
                      <p className="text-xs text-purple-600">Generated</p>
                    </div>
                    <Brain className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Response Analytics
                </CardTitle>
                <CardDescription>Detailed breakdown of questionnaire performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Analytics Dashboard</h3>
                  <p className="text-sm">Response data and insights will appear here once you publish your questionnaire</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Template Editor */}
      <TemplateEditor
        template={editingTemplate}
        isOpen={showTemplateEditor}
        onClose={() => {
          setShowTemplateEditor(false);
          setEditingTemplate(null);
        }}
        onSave={(updatedTemplate) => {
          // Handle template save
          console.log('Template saved:', updatedTemplate);
          // Update the template in the list or questionnaire
        }}
      />

      {/* Medication Library Modal */}
      <Dialog open={showMedicationLibrary} onOpenChange={setShowMedicationLibrary}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600" />
              Medication Library
            </DialogTitle>
            <DialogDescription>
              Browse and select medications to add to your questionnaire
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            {selectedQuestion ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Clipboard className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-blue-900 dark:text-blue-100">
                      Adding to: {questions.find(q => q.id === selectedQuestion)?.title}
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      Type: {QUESTION_TYPES.find(t => t.id === questions.find(q => q.id === selectedQuestion)?.type)?.name}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableMedications
                    .filter(med => {
                      const questionData = questions.find(q => q.id === selectedQuestion);
                      if (!questionData?.medicationType || questionData.medicationType === 'any') return true;
                      return med.type === questionData.medicationType;
                    })
                    .map((medication) => (
                    <Card key={medication.id} className="hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => {
                            addMedicationToQuestion(selectedQuestion, medication);
                            setShowMedicationLibrary(false);
                          }}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                            <Pill className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-foreground truncate">{medication.name}</h3>
                              <Badge className={`text-xs ${
                                medication.type === 'prescription' ? 'bg-red-100 text-red-800' :
                                medication.type === 'otc' ? 'bg-green-100 text-green-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {medication.type === 'prescription' ? 'Rx' : medication.type === 'otc' ? 'OTC' : 'Supplement'}
                              </Badge>
                            </div>
                            {medication.genericName && medication.genericName !== medication.name && (
                              <p className="text-sm text-muted-foreground mb-1">Generic: {medication.genericName}</p>
                            )}
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{medication.description}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Effectiveness: {medication.effectiveness}/10</span>
                              <span>${medication.cost}/month</span>
                              <span className="text-blue-600">{medication.category}</span>
                            </div>
                            <div className="mt-2">
                              <span className="text-xs font-medium text-muted-foreground">Dosages: </span>
                              <span className="text-xs text-foreground">{medication.dosages?.slice(0, 3).join(', ')}</span>
                              {medication.dosages?.length > 3 && <span className="text-xs text-muted-foreground"> +{medication.dosages.length - 3} more</span>}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a medication question to add medications</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMedicationLibrary(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
