import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
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
import { Switch } from "./ui/switch";
import {
  Package,
  Pill,
  Link,
  Unlink,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Brain,
  Target,
  Activity,
  ClipboardList,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Heart,
  Shield,
  Sparkles,
  Settings,
} from "lucide-react";

interface ProductQuestionnaireAssignment {
  id: string;
  productId: string;
  questionnaireId: string;
  isRequired: boolean;
  triggerConditions: {
    minAge?: number;
    maxAge?: number;
    riskFactors?: string[];
    medicalConditions?: string[];
  };
  assignedBy: string;
  assignedDate: string;
  lastUpdated: string;
  isActive: boolean;
}

interface Product {
  id: string;
  name: string;
  genericName?: string;
  brand?: string;
  category: string;
  type: "prescription" | "otc" | "supplement" | "device";
  requiresConsultation: boolean;
  price: number;
  image?: string;
}

interface Questionnaire {
  id: string;
  title: string;
  category: string;
  description: string;
  estimatedTime: string;
  questions: number;
  aiPowered: boolean;
  clinicalValidated?: boolean;
}

interface ProductQuestionnaireAssignmentProps {
  isOpen: boolean;
  onClose: () => void;
  onAssignmentChange?: (assignments: ProductQuestionnaireAssignment[]) => void;
}

export function ProductQuestionnaireAssignment({
  isOpen,
  onClose,
  onAssignmentChange,
}: ProductQuestionnaireAssignmentProps) {
  const [activeTab, setActiveTab] = useState("assignments");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [assignments, setAssignments] = useState<
    ProductQuestionnaireAssignment[]
  >([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [availableQuestionnaires, setAvailableQuestionnaires] = useState<
    Questionnaire[]
  >([]);
  const [showCreateAssignment, setShowCreateAssignment] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedQuestionnaire, setSelectedQuestionnaire] =
    useState<Questionnaire | null>(null);
  const [editingAssignment, setEditingAssignment] =
    useState<ProductQuestionnaireAssignment | null>(null);

  // Load data on component mount
  useEffect(() => {
    loadProducts();
    loadQuestionnaires();
    loadExistingAssignments();
  }, []);

  const loadProducts = async () => {
    try {
      const module = await import("../data/products");
      const products = module.SAMPLE_PRODUCTS.map((product) => ({
        id: product.id,
        name: product.name,
        genericName: product.genericName,
        brand: product.brand,
        category: product.category.name,
        type: product.type,
        requiresConsultation: product.prescriptionRequired || false,
        price: product.price,
        image: product.images?.[0],
      }));
      setAvailableProducts(products);
    } catch (error) {
      console.error("Failed to load products:", error);
    }
  };

  const loadQuestionnaires = async () => {
    try {
      const module = await import("../data/dynamicQuestionnaires");
      const questionnaires = module.ALL_QUESTIONNAIRES.map((q) => ({
        id: q.id,
        title: q.title,
        category: q.category,
        description: q.description,
        estimatedTime: q.estimatedTime,
        questions: q.questions.length,
        aiPowered: true,
        clinicalValidated: true,
      }));
      setAvailableQuestionnaires(questionnaires);
    } catch (error) {
      console.error("Failed to load questionnaires:", error);
    }
  };

  const loadExistingAssignments = () => {
    // Mock existing assignments - in real app this would come from API
    const mockAssignments: ProductQuestionnaireAssignment[] = [
      {
        id: "1",
        productId: "semaglutide_1mg",
        questionnaireId: "glp1_weight_loss",
        isRequired: true,
        triggerConditions: {
          minAge: 18,
          riskFactors: ["obesity", "diabetes"],
        },
        assignedBy: "admin",
        assignedDate: "2024-01-15",
        lastUpdated: "2024-01-20",
        isActive: true,
      },
      {
        id: "2",
        productId: "sildenafil_50mg",
        questionnaireId: "mens_ed_treatment",
        isRequired: true,
        triggerConditions: {
          minAge: 18,
          medicalConditions: ["erectile_dysfunction"],
        },
        assignedBy: "admin",
        assignedDate: "2024-01-15",
        lastUpdated: "2024-01-20",
        isActive: true,
      },
    ];
    setAssignments(mockAssignments);
  };

  const filteredProducts = useMemo(() => {
    let filtered = availableProducts;

    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.genericName
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          product.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (product) => product.category === selectedCategory,
      );
    }

    if (selectedType !== "all") {
      filtered = filtered.filter((product) => product.type === selectedType);
    }

    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [availableProducts, searchQuery, selectedCategory, selectedType]);

  const getProductAssignments = (productId: string) => {
    return assignments.filter((a) => a.productId === productId && a.isActive);
  };

  const getQuestionnaireAssignments = (questionnaireId: string) => {
    return assignments.filter(
      (a) => a.questionnaireId === questionnaireId && a.isActive,
    );
  };

  const createAssignment = (product: Product, questionnaire: Questionnaire) => {
    const newAssignment: ProductQuestionnaireAssignment = {
      id: `assignment_${Date.now()}`,
      productId: product.id,
      questionnaireId: questionnaire.id,
      isRequired: true,
      triggerConditions: {
        minAge: 18,
        riskFactors: [],
        medicalConditions: [],
      },
      assignedBy: "admin",
      assignedDate: new Date().toISOString().split("T")[0],
      lastUpdated: new Date().toISOString().split("T")[0],
      isActive: true,
    };

    setAssignments((prev) => [...prev, newAssignment]);
    setShowCreateAssignment(false);
    setSelectedProduct(null);
    setSelectedQuestionnaire(null);

    if (onAssignmentChange) {
      onAssignmentChange([...assignments, newAssignment]);
    }
  };

  const removeAssignment = (assignmentId: string) => {
    setAssignments((prev) =>
      prev.map((a) => (a.id === assignmentId ? { ...a, isActive: false } : a)),
    );

    if (onAssignmentChange) {
      const updatedAssignments = assignments.map((a) =>
        a.id === assignmentId ? { ...a, isActive: false } : a,
      );
      onAssignmentChange(updatedAssignments);
    }
  };

  const getProductById = (productId: string) => {
    return availableProducts.find((p) => p.id === productId);
  };

  const getQuestionnaireById = (questionnaireId: string) => {
    return availableQuestionnaires.find((q) => q.id === questionnaireId);
  };

  const productCategories = [
    ...new Set(availableProducts.map((p) => p.category)),
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link className="w-5 h-5 text-blue-600" />
            Product-Questionnaire Assignment System
          </DialogTitle>
          <DialogDescription>
            Link questionnaires to products/medications to create personalized
            assessment workflows
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="h-full flex flex-col"
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger
                value="assignments"
                className="flex items-center gap-1"
              >
                <Link className="w-4 h-4" />
                <span className="hidden sm:inline">Current Assignments</span>
              </TabsTrigger>
              <TabsTrigger value="products" className="flex items-center gap-1">
                <Package className="w-4 h-4" />
                <span className="hidden sm:inline">Products</span>
              </TabsTrigger>
              <TabsTrigger
                value="questionnaires"
                className="flex items-center gap-1"
              >
                <ClipboardList className="w-4 h-4" />
                <span className="hidden sm:inline">Questionnaires</span>
              </TabsTrigger>
              <TabsTrigger value="create" className="flex items-center gap-1">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Create Assignment</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto mt-4">
              {/* Current Assignments Tab */}
              <TabsContent value="assignments" className="space-y-4 mt-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    Active Assignments (
                    {assignments.filter((a) => a.isActive).length})
                  </h3>
                  <Button onClick={() => setActiveTab("create")}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Assignment
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {assignments
                    .filter((a) => a.isActive)
                    .map((assignment) => {
                      const product = getProductById(assignment.productId);
                      const questionnaire = getQuestionnaireById(
                        assignment.questionnaireId,
                      );

                      if (!product || !questionnaire) return null;

                      return (
                        <Card
                          key={assignment.id}
                          className="border border-border/20"
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                  <Pill className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-foreground">
                                    {product.name}
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    {product.category}
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    setEditingAssignment(assignment)
                                  }
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    removeAssignment(assignment.id)
                                  }
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 mb-3">
                              <ArrowRight className="w-4 h-4 text-blue-600" />
                              <div className="flex items-center gap-2">
                                <Brain className="w-4 h-4 text-purple-600" />
                                <span className="text-sm font-medium">
                                  {questionnaire.title}
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-3">
                              <div>
                                <div className="text-xs text-muted-foreground">
                                  Category
                                </div>
                                <div className="text-sm font-medium">
                                  {questionnaire.category}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">
                                  Est. Time
                                </div>
                                <div className="text-sm font-medium">
                                  {questionnaire.estimatedTime}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 mb-3">
                              <Badge
                                className={
                                  assignment.isRequired
                                    ? "bg-red-100 text-red-800"
                                    : "bg-blue-100 text-blue-800"
                                }
                              >
                                {assignment.isRequired
                                  ? "Required"
                                  : "Optional"}
                              </Badge>
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Active
                              </Badge>
                              {questionnaire.aiPowered && (
                                <Badge className="bg-purple-100 text-purple-800">
                                  <Brain className="w-3 h-3 mr-1" />
                                  AI-Powered
                                </Badge>
                              )}
                            </div>

                            <div className="text-xs text-muted-foreground">
                              Assigned:{" "}
                              {new Date(
                                assignment.assignedDate,
                              ).toLocaleDateString()}{" "}
                              by {assignment.assignedBy}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>

                {assignments.filter((a) => a.isActive).length === 0 && (
                  <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                      <Link className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <h4 className="font-medium mb-2">No assignments yet</h4>
                      <p className="text-sm mb-4">
                        Start by creating product-questionnaire assignments to
                        enable personalized healthcare workflows
                      </p>
                      <Button onClick={() => setActiveTab("create")}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create First Assignment
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Products Tab */}
              <TabsContent value="products" className="space-y-4 mt-0">
                <div className="flex flex-col lg:flex-row gap-4 mb-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {productCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="prescription">Prescription</SelectItem>
                      <SelectItem value="otc">OTC</SelectItem>
                      <SelectItem value="supplement">Supplement</SelectItem>
                      <SelectItem value="device">Device</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProducts.map((product) => {
                    const productAssignments = getProductAssignments(
                      product.id,
                    );

                    return (
                      <Card
                        key={product.id}
                        className="border border-border/20 hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                              <Package className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-foreground truncate">
                                {product.name}
                              </h3>
                              {product.genericName &&
                                product.genericName !== product.name && (
                                  <p className="text-sm text-muted-foreground">
                                    Generic: {product.genericName}
                                  </p>
                                )}
                              <div className="flex items-center gap-2 mt-1">
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
                                <span className="text-xs text-muted-foreground">
                                  {product.category}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="mb-3">
                            <div className="flex items-center gap-2 mb-2">
                              <ClipboardList className="w-4 h-4 text-purple-600" />
                              <span className="text-sm font-medium">
                                Linked Questionnaires (
                                {productAssignments.length})
                              </span>
                            </div>
                            {productAssignments.length > 0 ? (
                              <div className="space-y-1">
                                {productAssignments
                                  .slice(0, 2)
                                  .map((assignment) => {
                                    const questionnaire = getQuestionnaireById(
                                      assignment.questionnaireId,
                                    );
                                    return questionnaire ? (
                                      <div
                                        key={assignment.id}
                                        className="text-xs text-muted-foreground flex items-center gap-1"
                                      >
                                        <Brain className="w-3 h-3" />
                                        {questionnaire.title}
                                      </div>
                                    ) : null;
                                  })}
                                {productAssignments.length > 2 && (
                                  <div className="text-xs text-muted-foreground">
                                    +{productAssignments.length - 2} more
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-xs text-muted-foreground">
                                No questionnaires linked
                              </div>
                            )}
                          </div>

                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                            onClick={() => {
                              setSelectedProduct(product);
                              setActiveTab("create");
                            }}
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Link Questionnaire
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              {/* Questionnaires Tab */}
              <TabsContent value="questionnaires" className="space-y-4 mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableQuestionnaires.map((questionnaire) => {
                    const questionnaireAssignments =
                      getQuestionnaireAssignments(questionnaire.id);

                    return (
                      <Card
                        key={questionnaire.id}
                        className="border border-border/20 hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                              <Brain className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-foreground">
                                {questionnaire.title}
                              </h3>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {questionnaire.description}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {questionnaire.category}
                                </Badge>
                                {questionnaire.aiPowered && (
                                  <Badge className="bg-purple-100 text-purple-800 text-xs">
                                    <Brain className="w-3 h-3 mr-1" />
                                    AI-Powered
                                  </Badge>
                                )}
                                {questionnaire.clinicalValidated && (
                                  <Badge className="bg-green-100 text-green-800 text-xs">
                                    <Shield className="w-3 h-3 mr-1" />
                                    Clinical
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                              <div className="text-xs text-muted-foreground">
                                Questions
                              </div>
                              <div className="text-sm font-medium">
                                {questionnaire.questions}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">
                                Est. Time
                              </div>
                              <div className="text-sm font-medium">
                                {questionnaire.estimatedTime}
                              </div>
                            </div>
                          </div>

                          <div className="mb-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Package className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium">
                                Linked Products (
                                {questionnaireAssignments.length})
                              </span>
                            </div>
                            {questionnaireAssignments.length > 0 ? (
                              <div className="space-y-1">
                                {questionnaireAssignments
                                  .slice(0, 2)
                                  .map((assignment) => {
                                    const product = getProductById(
                                      assignment.productId,
                                    );
                                    return product ? (
                                      <div
                                        key={assignment.id}
                                        className="text-xs text-muted-foreground flex items-center gap-1"
                                      >
                                        <Pill className="w-3 h-3" />
                                        {product.name}
                                      </div>
                                    ) : null;
                                  })}
                                {questionnaireAssignments.length > 2 && (
                                  <div className="text-xs text-muted-foreground">
                                    +{questionnaireAssignments.length - 2} more
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-xs text-muted-foreground">
                                No products linked
                              </div>
                            )}
                          </div>

                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                            onClick={() => {
                              setSelectedQuestionnaire(questionnaire);
                              setActiveTab("create");
                            }}
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Link to Product
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              {/* Create Assignment Tab */}
              <TabsContent value="create" className="space-y-6 mt-0">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">
                    Create New Assignment
                  </h3>
                  <p className="text-muted-foreground">
                    Link a product/medication to a questionnaire to create
                    personalized assessment workflows
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Product Selection */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-blue-600" />
                        Select Product/Medication
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedProduct ? (
                        <div className="flex items-center gap-3 p-3 border rounded-lg">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                            <Pill className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">
                              {selectedProduct.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {selectedProduct.category} • $
                              {selectedProduct.price}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedProduct(null)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <div className="mb-4">
                            <Input
                              placeholder="Search products..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                            />
                          </div>
                          <div className="max-h-60 overflow-y-auto space-y-2">
                            {filteredProducts.slice(0, 10).map((product) => (
                              <div
                                key={product.id}
                                className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent/50"
                                onClick={() => setSelectedProduct(product)}
                              >
                                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                  <Pill className="w-4 h-4 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium text-sm">
                                    {product.name}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {product.category}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Questionnaire Selection */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="w-5 h-5 text-purple-600" />
                        Select Questionnaire
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedQuestionnaire ? (
                        <div className="flex items-center gap-3 p-3 border rounded-lg">
                          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                            <Brain className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">
                              {selectedQuestionnaire.title}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {selectedQuestionnaire.category} •{" "}
                              {selectedQuestionnaire.estimatedTime}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedQuestionnaire(null)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="max-h-60 overflow-y-auto space-y-2">
                          {availableQuestionnaires.map((questionnaire) => (
                            <div
                              key={questionnaire.id}
                              className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent/50"
                              onClick={() =>
                                setSelectedQuestionnaire(questionnaire)
                              }
                            >
                              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                                <Brain className="w-4 h-4 text-purple-600" />
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-sm">
                                  {questionnaire.title}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {questionnaire.category} •{" "}
                                  {questionnaire.questions} questions
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {selectedProduct && selectedQuestionnaire && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5 text-green-600" />
                        Assignment Preview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                            <Pill className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">
                              {selectedProduct.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {selectedProduct.category}
                            </div>
                          </div>
                        </div>

                        <ArrowRight className="w-6 h-6 text-blue-600" />

                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                            <Brain className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <div className="font-medium">
                              {selectedQuestionnaire.title}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {selectedQuestionnaire.estimatedTime}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="text-sm text-muted-foreground mb-4">
                        <p>
                          When customers select "{selectedProduct.name}", they
                          will be prompted to complete the "
                          {selectedQuestionnaire.title}" questionnaire for
                          personalized treatment recommendations.
                        </p>
                      </div>

                      <Button
                        onClick={() =>
                          createAssignment(
                            selectedProduct,
                            selectedQuestionnaire,
                          )
                        }
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                      >
                        <Link className="w-4 h-4 mr-2" />
                        Create Assignment
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
