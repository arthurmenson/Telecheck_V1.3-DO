import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Switch } from "./ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
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
} from "./ui/dialog";
import {
  Edit3,
  Save,
  Copy,
  Download,
  Upload,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Settings,
  Palette,
  Layout,
  Type,
  MessageSquare,
  CheckSquare,
  Hash,
  Calendar,
  Star,
  FileText,
  Brain,
  Heart,
  Shield,
  Lightbulb,
  Target,
  Activity,
  Users,
  Clock,
  Award,
  BarChart3,
  Pill,
  Sparkles,
  Info,
  AlertTriangle,
  CheckCircle,
  Globe,
  Code,
  Database,
  Zap,
  Eye,
  Search,
} from "lucide-react";

interface TemplateEditorProps {
  template: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: any) => void;
}

interface EditableQuestion {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  description?: string;
  empathicMessage?: string;
  required: boolean;
  options?: string[];
  category: string;
  weight: number;
  validationRules?: any;
  conditionalLogic?: any;
}

interface EditableMedication {
  id: string;
  name: string;
  genericName: string;
  dosages: string[];
  description: string;
  sideEffects: string[];
  contraindications: string[];
  cost: number;
  effectiveness: number;
  suitabilityFactors?: any;
}

interface EditableEducationalInsert {
  id: string;
  type: string;
  title: string;
  content: string;
  icon: string;
  background: string;
  afterQuestion?: string;
}

export function TemplateEditor({
  template,
  isOpen,
  onClose,
  onSave,
}: TemplateEditorProps) {
  const [editedTemplate, setEditedTemplate] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<
    number | null
  >(null);
  const [selectedMedicationIndex, setSelectedMedicationIndex] = useState<
    number | null
  >(null);
  const [selectedEducationalIndex, setSelectedEducationalIndex] = useState<
    number | null
  >(null);
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [selectedProductType, setSelectedProductType] = useState("all");

  useEffect(() => {
    if (template) {
      const templateCopy = JSON.parse(JSON.stringify(template));
      // Ensure questions is always an array
      if (!Array.isArray(templateCopy.questions)) {
        templateCopy.questions = [];
      }
      // Ensure medications is always an array
      if (!Array.isArray(templateCopy.medications)) {
        templateCopy.medications = [];
      }
      // Ensure educationalInserts is always an array
      if (!Array.isArray(templateCopy.educationalInserts)) {
        templateCopy.educationalInserts = [];
      }
      setEditedTemplate(templateCopy);
    }
  }, [template]);

  // Load available products
  useEffect(() => {
    import("../data/products").then((module) => {
      const medications = module.SAMPLE_PRODUCTS.filter(
        (product) =>
          product.type === "prescription" ||
          product.type === "otc" ||
          product.type === "supplement",
      ).map((product) => ({
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
        category: product.category.name,
        manufacturer: product.manufacturer,
        strength: product.strength,
        activeIngredients: product.activeIngredients,
        indications: product.indications,
        interactions: product.interactions,
      }));
      setAvailableProducts(medications);
    });
  }, []);

  // Filter available products - must be before early return to follow Rules of Hooks
  const filteredProducts = React.useMemo(() => {
    let products = availableProducts;

    if (productSearchQuery) {
      products = products.filter(
        (product) =>
          product.name
            .toLowerCase()
            .includes(productSearchQuery.toLowerCase()) ||
          product.genericName
            .toLowerCase()
            .includes(productSearchQuery.toLowerCase()) ||
          product.description
            .toLowerCase()
            .includes(productSearchQuery.toLowerCase()) ||
          product.category
            .toLowerCase()
            .includes(productSearchQuery.toLowerCase()),
      );
    }

    if (selectedProductType !== "all") {
      products = products.filter(
        (product) => product.type === selectedProductType,
      );
    }

    return products.sort((a, b) => a.name.localeCompare(b.name));
  }, [availableProducts, productSearchQuery, selectedProductType]);

  if (!editedTemplate) return null;

  const questionTypes = [
    { value: "multiple_choice", label: "Multiple Choice", icon: CheckSquare },
    { value: "checkbox", label: "Checkboxes", icon: CheckSquare },
    { value: "boolean", label: "Yes/No", icon: CheckSquare },
    { value: "number", label: "Number Input", icon: Hash },
    { value: "scale", label: "Rating Scale", icon: Star },
    { value: "text", label: "Text Input", icon: Type },
    { value: "textarea", label: "Long Text", icon: FileText },
    { value: "date", label: "Date Picker", icon: Calendar },
  ];

  const educationalTypes = [
    { value: "fact", label: "Medical Fact", icon: Brain },
    { value: "statistic", label: "Statistical Data", icon: BarChart3 },
    { value: "encouragement", label: "Encouragement", icon: Heart },
    { value: "education", label: "Educational Content", icon: Lightbulb },
  ];

  const categories = [
    "demographics",
    "symptoms",
    "medical_history",
    "medications",
    "lifestyle",
    "psychological",
    "goals",
    "preferences",
    "concerns",
    "behavior",
  ];

  const updateBasicInfo = (field: string, value: any) => {
    setEditedTemplate((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addQuestion = () => {
    const newQuestion: EditableQuestion = {
      id: `question_${Date.now()}`,
      type: "multiple_choice",
      title: "New Question",
      required: false,
      category: "general",
      weight: 1.0,
      options: ["Option 1", "Option 2"],
    };

    setEditedTemplate((prev) => ({
      ...prev,
      questions: Array.isArray(prev.questions)
        ? [...prev.questions, newQuestion]
        : [newQuestion],
    }));
  };

  const updateQuestion = (
    index: number,
    updates: Partial<EditableQuestion>,
  ) => {
    setEditedTemplate((prev) => ({
      ...prev,
      questions: Array.isArray(prev.questions)
        ? prev.questions.map((q, i) => (i === index ? { ...q, ...updates } : q))
        : [],
    }));
  };

  const deleteQuestion = (index: number) => {
    setEditedTemplate((prev) => ({
      ...prev,
      questions: Array.isArray(prev.questions)
        ? prev.questions.filter((_, i) => i !== index)
        : [],
    }));
    setSelectedQuestionIndex(null);
  };

  const moveQuestion = (index: number, direction: "up" | "down") => {
    if (!Array.isArray(editedTemplate.questions)) return;

    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= editedTemplate.questions.length) return;

    setEditedTemplate((prev) => {
      if (!Array.isArray(prev.questions)) return prev;
      const questions = [...prev.questions];
      [questions[index], questions[newIndex]] = [
        questions[newIndex],
        questions[index],
      ];
      return { ...prev, questions };
    });
  };

  const addQuestionOption = (questionIndex: number) => {
    if (
      !Array.isArray(editedTemplate.questions) ||
      !editedTemplate.questions[questionIndex]
    )
      return;

    const question = editedTemplate.questions[questionIndex];
    if (!Array.isArray(question.options)) question.options = [];

    updateQuestion(questionIndex, {
      options: [...question.options, `Option ${question.options.length + 1}`],
    });
  };

  const updateQuestionOption = (
    questionIndex: number,
    optionIndex: number,
    value: string,
  ) => {
    if (
      !Array.isArray(editedTemplate.questions) ||
      !editedTemplate.questions[questionIndex]
    )
      return;

    const question = editedTemplate.questions[questionIndex];
    if (!Array.isArray(question.options)) return;

    const newOptions = [...question.options];
    newOptions[optionIndex] = value;

    updateQuestion(questionIndex, { options: newOptions });
  };

  const removeQuestionOption = (questionIndex: number, optionIndex: number) => {
    if (
      !Array.isArray(editedTemplate.questions) ||
      !editedTemplate.questions[questionIndex]
    )
      return;

    const question = editedTemplate.questions[questionIndex];
    if (!Array.isArray(question.options)) return;

    const newOptions = question.options.filter((_, i) => i !== optionIndex);

    updateQuestion(questionIndex, { options: newOptions });
  };

  const addMedication = () => {
    setShowProductSelector(true);
  };

  const addProductAsMedication = (product: any) => {
    const newMedication: EditableMedication = {
      id: product.id,
      name: product.name,
      genericName: product.genericName,
      dosages: product.dosages || [],
      description: product.description,
      sideEffects: product.sideEffects || [],
      contraindications: product.contraindications || [],
      cost: product.cost,
      effectiveness: product.effectiveness,
      suitabilityFactors: {
        // Default suitability factors that can be customized
        medical_conditions: 1.5,
        current_medications: 1.3,
        treatment_goals: 1.2,
      },
    };

    setEditedTemplate((prev) => ({
      ...prev,
      medications: [...(prev.medications || []), newMedication],
    }));
    setShowProductSelector(false);
  };

  const addCustomMedication = () => {
    const newMedication: EditableMedication = {
      id: `custom_medication_${Date.now()}`,
      name: "Custom Medication",
      genericName: "",
      dosages: [""],
      description: "",
      sideEffects: [""],
      contraindications: [""],
      cost: 0,
      effectiveness: 5,
    };

    setEditedTemplate((prev) => ({
      ...prev,
      medications: [...(prev.medications || []), newMedication],
    }));
  };

  const updateMedication = (
    index: number,
    updates: Partial<EditableMedication>,
  ) => {
    setEditedTemplate((prev) => ({
      ...prev,
      medications: Array.isArray(prev.medications)
        ? prev.medications.map((m, i) =>
            i === index ? { ...m, ...updates } : m,
          )
        : [],
    }));
  };

  const deleteMedication = (index: number) => {
    setEditedTemplate((prev) => ({
      ...prev,
      medications: Array.isArray(prev.medications)
        ? prev.medications.filter((_, i) => i !== index)
        : [],
    }));
    setSelectedMedicationIndex(null);
  };

  const addEducationalInsert = () => {
    const newInsert: EditableEducationalInsert = {
      id: `educational_${Date.now()}`,
      type: "fact",
      title: "New Educational Content",
      content: "",
      icon: "💡",
      background: "bg-blue-50 dark:bg-blue-900/20",
    };

    setEditedTemplate((prev) => ({
      ...prev,
      educationalInserts: [...(prev.educationalInserts || []), newInsert],
    }));
  };

  const updateEducationalInsert = (
    index: number,
    updates: Partial<EditableEducationalInsert>,
  ) => {
    setEditedTemplate((prev) => ({
      ...prev,
      educationalInserts: prev.educationalInserts.map((e, i) =>
        i === index ? { ...e, ...updates } : e,
      ),
    }));
  };

  const deleteEducationalInsert = (index: number) => {
    setEditedTemplate((prev) => ({
      ...prev,
      educationalInserts: prev.educationalInserts.filter((_, i) => i !== index),
    }));
    setSelectedEducationalIndex(null);
  };

  const handleSave = () => {
    onSave(editedTemplate);
    onClose();
  };

  const exportTemplate = () => {
    const dataStr = JSON.stringify(editedTemplate, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `${editedTemplate.id}_template.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="w-5 h-5" />
            Edit Template: {editedTemplate.title}
          </DialogTitle>
          <DialogDescription>
            Customize and configure your questionnaire template
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="h-full flex flex-col"
          >
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="basic" className="flex items-center gap-1">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Basic</span>
              </TabsTrigger>
              <TabsTrigger
                value="questions"
                className="flex items-center gap-1"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Questions</span>
              </TabsTrigger>
              <TabsTrigger
                value="medications"
                className="flex items-center gap-1"
              >
                <Pill className="w-4 h-4" />
                <span className="hidden sm:inline">Medications</span>
              </TabsTrigger>
              <TabsTrigger
                value="educational"
                className="flex items-center gap-1"
              >
                <Lightbulb className="w-4 h-4" />
                <span className="hidden sm:inline">Educational</span>
              </TabsTrigger>
              <TabsTrigger value="ai-logic" className="flex items-center gap-1">
                <Brain className="w-4 h-4" />
                <span className="hidden sm:inline">AI Logic</span>
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">Preview</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto mt-4">
              {/* Basic Info Tab */}
              <TabsContent value="basic" className="space-y-6 mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Template Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="template-title">Title</Label>
                        <Input
                          id="template-title"
                          value={editedTemplate.title}
                          onChange={(e) =>
                            updateBasicInfo("title", e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="template-description">
                          Description
                        </Label>
                        <Textarea
                          id="template-description"
                          value={editedTemplate.description}
                          onChange={(e) =>
                            updateBasicInfo("description", e.target.value)
                          }
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="template-category">Category</Label>
                        <Select
                          value={editedTemplate.category}
                          onValueChange={(value) =>
                            updateBasicInfo("category", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Weight Management">
                              Weight Management
                            </SelectItem>
                            <SelectItem value="Men's Health">
                              Men's Health
                            </SelectItem>
                            <SelectItem value="Women's Health">
                              Women's Health
                            </SelectItem>
                            <SelectItem value="Dermatology">
                              Dermatology
                            </SelectItem>
                            <SelectItem value="Hair Restoration">
                              Hair Restoration
                            </SelectItem>
                            <SelectItem value="Mental Health">
                              Mental Health
                            </SelectItem>
                            <SelectItem value="General Health">
                              General Health
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="template-time">Estimated Time</Label>
                        <Input
                          id="template-time"
                          value={editedTemplate.estimatedTime}
                          onChange={(e) =>
                            updateBasicInfo("estimatedTime", e.target.value)
                          }
                          placeholder="e.g., 5-7 minutes"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Empathetic Content</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="empathic-intro">
                          Introduction Message
                        </Label>
                        <Textarea
                          id="empathic-intro"
                          value={editedTemplate.empathicIntro}
                          onChange={(e) =>
                            updateBasicInfo("empathicIntro", e.target.value)
                          }
                          rows={4}
                          placeholder="Welcoming, empathetic introduction..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="supportive-closing">
                          Closing Message
                        </Label>
                        <Textarea
                          id="supportive-closing"
                          value={editedTemplate.supportiveClosing || ""}
                          onChange={(e) =>
                            updateBasicInfo("supportiveClosing", e.target.value)
                          }
                          rows={3}
                          placeholder="Supportive conclusion message..."
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Questions Tab */}
              <TabsContent value="questions" className="space-y-6 mt-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    Questions (
                    {Array.isArray(editedTemplate.questions)
                      ? editedTemplate.questions.length
                      : 0}
                    )
                  </h3>
                  <Button onClick={addQuestion}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Questions List */}
                  <div className="space-y-3">
                    {Array.isArray(editedTemplate.questions) &&
                      editedTemplate.questions.map(
                        (question: any, index: number) => (
                          <Card
                            key={question.id}
                            className={`cursor-pointer transition-colors ${
                              selectedQuestionIndex === index
                                ? "border-primary bg-primary/5"
                                : ""
                            }`}
                            onClick={() => setSelectedQuestionIndex(index)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {question.type}
                                    </Badge>
                                    {question.required && (
                                      <Badge className="bg-red-100 text-red-800 text-xs">
                                        Required
                                      </Badge>
                                    )}
                                  </div>
                                  <h4 className="font-medium">
                                    {question.title}
                                  </h4>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {question.category} • Weight:{" "}
                                    {question.weight}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      moveQuestion(index, "up");
                                    }}
                                    disabled={index === 0}
                                  >
                                    <ArrowUp className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      moveQuestion(index, "down");
                                    }}
                                    disabled={
                                      !Array.isArray(
                                        editedTemplate.questions,
                                      ) ||
                                      index ===
                                        editedTemplate.questions.length - 1
                                    }
                                  >
                                    <ArrowDown className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteQuestion(index);
                                    }}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ),
                      )}
                  </div>

                  {/* Question Editor */}
                  <div>
                    {selectedQuestionIndex !== null &&
                    Array.isArray(editedTemplate.questions) &&
                    editedTemplate.questions[selectedQuestionIndex] ? (
                      <Card>
                        <CardHeader>
                          <CardTitle>Edit Question</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label>Question Type</Label>
                            <Select
                              value={
                                editedTemplate.questions[selectedQuestionIndex]
                                  .type
                              }
                              onValueChange={(value) =>
                                updateQuestion(selectedQuestionIndex, {
                                  type: value,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {questionTypes.map((type) => (
                                  <SelectItem
                                    key={type.value}
                                    value={type.value}
                                  >
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Title</Label>
                            <Textarea
                              value={
                                editedTemplate.questions[selectedQuestionIndex]
                                  .title
                              }
                              onChange={(e) =>
                                updateQuestion(selectedQuestionIndex, {
                                  title: e.target.value,
                                })
                              }
                              rows={2}
                            />
                          </div>

                          <div>
                            <Label>Subtitle (Optional)</Label>
                            <Input
                              value={
                                editedTemplate.questions[selectedQuestionIndex]
                                  .subtitle || ""
                              }
                              onChange={(e) =>
                                updateQuestion(selectedQuestionIndex, {
                                  subtitle: e.target.value,
                                })
                              }
                              placeholder="Supporting text..."
                            />
                          </div>

                          <div>
                            <Label>Empathetic Message (Optional)</Label>
                            <Textarea
                              value={
                                editedTemplate.questions[selectedQuestionIndex]
                                  .empathicMessage || ""
                              }
                              onChange={(e) =>
                                updateQuestion(selectedQuestionIndex, {
                                  empathicMessage: e.target.value,
                                })
                              }
                              rows={2}
                              placeholder="Supportive, empathetic guidance..."
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Category</Label>
                              <Select
                                value={
                                  editedTemplate.questions[
                                    selectedQuestionIndex
                                  ].category
                                }
                                onValueChange={(value) =>
                                  updateQuestion(selectedQuestionIndex, {
                                    category: value,
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {categories.map((cat) => (
                                    <SelectItem key={cat} value={cat}>
                                      {cat.replace("_", " ")}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Weight</Label>
                              <Input
                                type="number"
                                step="0.1"
                                min="0"
                                max="5"
                                value={
                                  editedTemplate.questions[
                                    selectedQuestionIndex
                                  ].weight
                                }
                                onChange={(e) =>
                                  updateQuestion(selectedQuestionIndex, {
                                    weight: parseFloat(e.target.value),
                                  })
                                }
                              />
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={
                                editedTemplate.questions[selectedQuestionIndex]
                                  .required
                              }
                              onCheckedChange={(checked) =>
                                updateQuestion(selectedQuestionIndex, {
                                  required: checked,
                                })
                              }
                            />
                            <Label>Required Question</Label>
                          </div>

                          {/* Options for choice-based questions */}
                          {["multiple_choice", "checkbox", "dropdown"].includes(
                            editedTemplate.questions[selectedQuestionIndex]
                              .type,
                          ) && (
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <Label>Options</Label>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    addQuestionOption(selectedQuestionIndex)
                                  }
                                >
                                  <Plus className="w-3 h-3 mr-1" />
                                  Add
                                </Button>
                              </div>
                              <div className="space-y-2">
                                {Array.isArray(
                                  editedTemplate.questions[
                                    selectedQuestionIndex
                                  ]?.options,
                                ) &&
                                  editedTemplate.questions[
                                    selectedQuestionIndex
                                  ].options.map(
                                    (option: string, optionIndex: number) => (
                                      <div
                                        key={optionIndex}
                                        className="flex gap-2"
                                      >
                                        <Input
                                          value={option}
                                          onChange={(e) =>
                                            updateQuestionOption(
                                              selectedQuestionIndex,
                                              optionIndex,
                                              e.target.value,
                                            )
                                          }
                                          placeholder={`Option ${optionIndex + 1}`}
                                        />
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() =>
                                            removeQuestionOption(
                                              selectedQuestionIndex,
                                              optionIndex,
                                            )
                                          }
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    ),
                                  )}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ) : (
                      <Card>
                        <CardContent className="p-8 text-center text-muted-foreground">
                          <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>Select a question to edit its properties</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Medications Tab */}
              <TabsContent value="medications" className="space-y-6 mt-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    Medications (
                    {Array.isArray(editedTemplate.medications)
                      ? editedTemplate.medications.length
                      : 0}
                    )
                  </h3>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={addCustomMedication}>
                      <Plus className="w-4 h-4 mr-2" />
                      Custom Medication
                    </Button>
                    <Button onClick={addMedication}>
                      <Database className="w-4 h-4 mr-2" />
                      From Products
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Medications List */}
                  <div className="space-y-3">
                    {Array.isArray(editedTemplate.medications) &&
                    editedTemplate.medications.length > 0 ? (
                      editedTemplate.medications.map(
                        (medication: any, index: number) => (
                          <Card
                            key={medication.id}
                            className={`cursor-pointer transition-colors ${
                              selectedMedicationIndex === index
                                ? "border-primary bg-primary/5"
                                : ""
                            }`}
                            onClick={() => setSelectedMedicationIndex(index)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Pill className="w-4 h-4 text-blue-600" />
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      ${medication.cost}/month
                                    </Badge>
                                    <Badge className="bg-green-100 text-green-800 text-xs">
                                      {medication.effectiveness}/10
                                    </Badge>
                                  </div>
                                  <h4 className="font-medium">
                                    {medication.name}
                                  </h4>
                                  {medication.genericName &&
                                    medication.genericName !==
                                      medication.name && (
                                      <p className="text-sm text-muted-foreground">
                                        Generic: {medication.genericName}
                                      </p>
                                    )}
                                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                    {medication.description}
                                  </p>
                                  {medication.dosages?.length > 0 && (
                                    <div className="mt-2">
                                      <span className="text-xs font-medium text-muted-foreground">
                                        Dosages:{" "}
                                      </span>
                                      <span className="text-xs text-foreground">
                                        {medication.dosages
                                          .slice(0, 3)
                                          .join(", ")}
                                      </span>
                                      {medication.dosages.length > 3 && (
                                        <span className="text-xs text-muted-foreground">
                                          {" "}
                                          +{medication.dosages.length - 3} more
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteMedication(index);
                                    }}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ),
                      )
                    ) : (
                      <Card>
                        <CardContent className="p-8 text-center text-muted-foreground">
                          <Pill className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <h4 className="font-medium mb-2">
                            No medications added
                          </h4>
                          <p className="text-sm mb-4">
                            Add medications from your product catalog or create
                            custom entries
                          </p>
                          <div className="flex gap-2 justify-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={addCustomMedication}
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Custom
                            </Button>
                            <Button size="sm" onClick={addMedication}>
                              <Database className="w-3 h-3 mr-1" />
                              From Products
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Medication Editor */}
                  <div>
                    {selectedMedicationIndex !== null &&
                    Array.isArray(editedTemplate.medications) &&
                    editedTemplate.medications[selectedMedicationIndex] ? (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Pill className="w-5 h-5 text-blue-600" />
                            Edit Medication
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Medication Name</Label>
                              <Input
                                value={
                                  editedTemplate.medications[
                                    selectedMedicationIndex
                                  ].name
                                }
                                onChange={(e) =>
                                  updateMedication(selectedMedicationIndex, {
                                    name: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div>
                              <Label>Generic Name</Label>
                              <Input
                                value={
                                  editedTemplate.medications[
                                    selectedMedicationIndex
                                  ].genericName
                                }
                                onChange={(e) =>
                                  updateMedication(selectedMedicationIndex, {
                                    genericName: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>

                          <div>
                            <Label>Description</Label>
                            <Textarea
                              value={
                                editedTemplate.medications[
                                  selectedMedicationIndex
                                ].description
                              }
                              onChange={(e) =>
                                updateMedication(selectedMedicationIndex, {
                                  description: e.target.value,
                                })
                              }
                              rows={3}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Monthly Cost ($)</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={
                                  editedTemplate.medications[
                                    selectedMedicationIndex
                                  ].cost
                                }
                                onChange={(e) =>
                                  updateMedication(selectedMedicationIndex, {
                                    cost: parseFloat(e.target.value) || 0,
                                  })
                                }
                              />
                            </div>
                            <div>
                              <Label>Effectiveness (1-10)</Label>
                              <Input
                                type="number"
                                min="1"
                                max="10"
                                value={
                                  editedTemplate.medications[
                                    selectedMedicationIndex
                                  ].effectiveness
                                }
                                onChange={(e) =>
                                  updateMedication(selectedMedicationIndex, {
                                    effectiveness:
                                      parseInt(e.target.value) || 5,
                                  })
                                }
                              />
                            </div>
                          </div>

                          <div>
                            <Label>Dosages</Label>
                            <Textarea
                              value={editedTemplate.medications[
                                selectedMedicationIndex
                              ].dosages?.join(", ")}
                              onChange={(e) =>
                                updateMedication(selectedMedicationIndex, {
                                  dosages: e.target.value
                                    .split(",")
                                    .map((d) => d.trim())
                                    .filter(Boolean),
                                })
                              }
                              placeholder="Enter dosages separated by commas (e.g., 25mg, 50mg, 100mg)"
                              rows={2}
                            />
                          </div>

                          <div>
                            <Label>Side Effects</Label>
                            <Textarea
                              value={editedTemplate.medications[
                                selectedMedicationIndex
                              ].sideEffects?.join(", ")}
                              onChange={(e) =>
                                updateMedication(selectedMedicationIndex, {
                                  sideEffects: e.target.value
                                    .split(",")
                                    .map((s) => s.trim())
                                    .filter(Boolean),
                                })
                              }
                              placeholder="Enter side effects separated by commas"
                              rows={3}
                            />
                          </div>

                          <div>
                            <Label>Contraindications</Label>
                            <Textarea
                              value={editedTemplate.medications[
                                selectedMedicationIndex
                              ].contraindications?.join(", ")}
                              onChange={(e) =>
                                updateMedication(selectedMedicationIndex, {
                                  contraindications: e.target.value
                                    .split(",")
                                    .map((c) => c.trim())
                                    .filter(Boolean),
                                })
                              }
                              placeholder="Enter contraindications separated by commas"
                              rows={3}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card>
                        <CardContent className="p-8 text-center text-muted-foreground">
                          <Pill className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>Select a medication to edit its properties</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>

                {/* Product Selector Dialog */}
                <Dialog
                  open={showProductSelector}
                  onOpenChange={setShowProductSelector}
                >
                  <DialogContent className="max-w-6xl max-h-[80vh] overflow-hidden">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Database className="w-5 h-5 text-blue-600" />
                        Select Medication from Products
                      </DialogTitle>
                      <DialogDescription>
                        Choose from your available product catalog to add to
                        this template
                      </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-hidden">
                      {/* Search and Filters */}
                      <div className="flex gap-4 mb-4">
                        <div className="flex-1">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                              placeholder="Search medications..."
                              value={productSearchQuery}
                              onChange={(e) =>
                                setProductSearchQuery(e.target.value)
                              }
                              className="pl-10"
                            />
                          </div>
                        </div>
                        <Select
                          value={selectedProductType}
                          onValueChange={setSelectedProductType}
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Product Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="prescription">
                              Prescription
                            </SelectItem>
                            <SelectItem value="otc">
                              Over-the-Counter
                            </SelectItem>
                            <SelectItem value="supplement">
                              Supplements
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Products Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                        {filteredProducts.map((product) => (
                          <Card
                            key={product.id}
                            className="hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => addProductAsMedication(product)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                  <Pill className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold text-foreground truncate">
                                      {product.name}
                                    </h3>
                                    <Badge
                                      className={`text-xs ${
                                        product.type === "prescription"
                                          ? "bg-red-100 text-red-800"
                                          : product.type === "otc"
                                            ? "bg-green-100 text-green-800"
                                            : "bg-blue-100 text-blue-800"
                                      }`}
                                    >
                                      {product.type === "prescription"
                                        ? "Rx"
                                        : product.type === "otc"
                                          ? "OTC"
                                          : "Supplement"}
                                    </Badge>
                                  </div>
                                  {product.genericName &&
                                    product.genericName !== product.name && (
                                      <p className="text-sm text-muted-foreground mb-1">
                                        Generic: {product.genericName}
                                      </p>
                                    )}
                                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                    {product.description}
                                  </p>
                                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span>
                                      Effectiveness: {product.effectiveness}/10
                                    </span>
                                    <span>${product.cost}/month</span>
                                  </div>
                                  <div className="mt-2">
                                    <span className="text-xs font-medium text-muted-foreground">
                                      Category:{" "}
                                    </span>
                                    <span className="text-xs text-blue-600">
                                      {product.category}
                                    </span>
                                  </div>
                                  {product.dosages?.length > 0 && (
                                    <div className="mt-1">
                                      <span className="text-xs font-medium text-muted-foreground">
                                        Dosages:{" "}
                                      </span>
                                      <span className="text-xs text-foreground">
                                        {product.dosages.slice(0, 3).join(", ")}
                                      </span>
                                      {product.dosages.length > 3 && (
                                        <span className="text-xs text-muted-foreground">
                                          {" "}
                                          +{product.dosages.length - 3} more
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      {filteredProducts.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No products found matching your criteria</p>
                        </div>
                      )}
                    </div>

                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setShowProductSelector(false)}
                      >
                        Cancel
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </TabsContent>

              <TabsContent value="educational" className="space-y-6 mt-0">
                <div className="text-center py-8 text-muted-foreground">
                  <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">
                    Educational Content
                  </h3>
                  <p className="text-sm">
                    Add educational inserts between questions
                  </p>
                  <Button className="mt-4" onClick={addEducationalInsert}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Educational Content
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="ai-logic" className="space-y-6 mt-0">
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">
                    AI Logic Configuration
                  </h3>
                  <p className="text-sm">
                    Configure AI scoring weights and contraindication rules
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="preview" className="space-y-6 mt-0">
                <div className="text-center py-8 text-muted-foreground">
                  <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">
                    Template Preview
                  </h3>
                  <p className="text-sm">
                    Preview how your template will look to users
                  </p>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <DialogFooter className="border-t pt-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportTemplate}>
                <Download className="w-4 h-4 mr-2" />
                Export JSON
              </Button>
              <Button variant="outline">
                <Copy className="w-4 h-4 mr-2" />
                Duplicate
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save Template
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
