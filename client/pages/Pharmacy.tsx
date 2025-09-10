import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Progress } from "../components/ui/progress";
import {
  ShoppingCart,
  Package,
  Truck,
  Clock,
  CheckCircle,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  Pill,
  Calendar,
  CreditCard,
  MapPin,
  Bell,
  Star,
  RefreshCw,
  Download,
  Eye,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  Phone,
  MessageCircle,
  Settings,
  Store,
  Brain,
  Percent,
  Activity,
  Heart,
  Target,
  BookOpen,
} from "lucide-react";
import { MedicationCatalog } from "../components/MedicationCatalog";
import { TelehealthVisit } from "../components/TelehealthVisit";
import { EmpatheticConsultation } from "../components/EmpatheticConsultation";
import { DynamicQuestionnaire } from "../components/DynamicQuestionnaire";
import { RebateEngine } from "../components/RebateEngine";
import { ShoppingCart as ShoppingCartComponent } from "../components/ShoppingCart";
import { CheckoutSystem } from "../components/CheckoutSystem";
import { useCart } from "../contexts/CartContext";
import {
  ALL_QUESTIONNAIRES,
  GLP1_QUESTIONNAIRE,
  MENS_ED_QUESTIONNAIRE,
  SKIN_CARE_QUESTIONNAIRE,
  HAIR_GROWTH_QUESTIONNAIRE,
} from "../data/dynamicQuestionnaires";
import { useToast } from "../hooks/use-toast";

export function Pharmacy() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("shop");
  const [selectedMedication, setSelectedMedication] = useState<any>(null);
  const [showTelehealth, setShowTelehealth] = useState(false);
  const [showEmpatheticConsultation, setShowEmpatheticConsultation] =
    useState(false);
  const [showDynamicQuestionnaire, setShowDynamicQuestionnaire] =
    useState(false);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [productQuestionnaireAssignments, setProductQuestionnaireAssignments] =
    useState<any[]>([]);
  const { state: cartState, openCart, closeCart } = useCart();
  const { toast } = useToast();

  // Mock pharmacy data
  const currentOrders = [
    {
      id: "RX001",
      medication: "Atorvastatin 20mg",
      brand: "Lipitor",
      quantity: 30,
      refillsRemaining: 5,
      status: "in_transit",
      orderDate: "2024-02-10",
      expectedDelivery: "2024-02-15",
      pharmacy: "CVS Pharmacy",
      pharmacyAddress: "123 Main St, Your City",
      prescriber: "Dr. Smith",
      insurance: "Blue Cross",
      copay: 10.0,
      trackingNumber: "1Z999AA123456789",
    },
    {
      id: "RX002",
      medication: "Metformin 500mg",
      brand: "Glucophage",
      quantity: 60,
      refillsRemaining: 3,
      status: "ready_pickup",
      orderDate: "2024-02-08",
      expectedDelivery: "2024-02-12",
      pharmacy: "Walgreens",
      pharmacyAddress: "456 Oak Ave, Your City",
      prescriber: "Dr. Johnson",
      insurance: "Aetna",
      copay: 5.0,
      trackingNumber: null,
    },
  ];

  const prescriptionHistory = [
    {
      id: "RX003",
      medication: "Lisinopril 10mg",
      quantity: 30,
      filledDate: "2024-01-15",
      pharmacy: "CVS Pharmacy",
      copay: 8.0,
      status: "delivered",
    },
    {
      id: "RX004",
      medication: "Atorvastatin 20mg",
      quantity: 30,
      filledDate: "2024-01-10",
      pharmacy: "CVS Pharmacy",
      copay: 10.0,
      status: "delivered",
    },
  ];

  const autoRefillSettings = [
    {
      medication: "Atorvastatin 20mg",
      enabled: true,
      daysBeforeRefill: 7,
      nextRefill: "2024-03-15",
    },
    {
      medication: "Metformin 500mg",
      enabled: false,
      daysBeforeRefill: 5,
      nextRefill: "2024-03-20",
    },
  ];

  const pharmacyLocations = [
    {
      name: "CVS Pharmacy",
      address: "123 Main St, Your City",
      phone: "(555) 123-4567",
      hours: "8AM - 10PM",
      rating: 4.5,
      services: ["Drive-thru", "Delivery", "24hr Emergency"],
      distance: "0.5 miles",
    },
    {
      name: "Walgreens",
      address: "456 Oak Ave, Your City",
      phone: "(555) 987-6543",
      hours: "9AM - 9PM",
      rating: 4.2,
      services: ["Drive-thru", "Delivery", "Immunizations"],
      distance: "1.2 miles",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_transit":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "ready_pickup":
        return "bg-green-100 text-green-800 border-green-200";
      case "processing":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "in_transit":
        return <Truck className="w-4 h-4" />;
      case "ready_pickup":
        return <Package className="w-4 h-4" />;
      case "processing":
        return <Clock className="w-4 h-4" />;
      case "delivered":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatStatus = (status: string) => {
    return status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const handleMedicationSelect = (medication: any) => {
    setSelectedMedication(medication);

    // Check if there's a specific questionnaire assignment for this medication
    const assignment = productQuestionnaireAssignments.find(
      (a) => a.productId === medication.id && a.isActive,
    );

    if (medication.requiresConsultation || assignment) {
      let questionnaire = null;

      if (assignment) {
        // Use the assigned questionnaire
        switch (assignment.questionnaireId) {
          case "glp1_weight_loss":
            questionnaire = GLP1_QUESTIONNAIRE;
            break;
          case "mens_ed_treatment":
            questionnaire = MENS_ED_QUESTIONNAIRE;
            break;
          case "prescription_skincare":
            questionnaire = SKIN_CARE_QUESTIONNAIRE;
            break;
          case "hair_growth_treatment":
            questionnaire = HAIR_GROWTH_QUESTIONNAIRE;
            break;
          default:
            // Fallback to category-based selection
            questionnaire = getCategoryBasedQuestionnaire(medication.category);
        }
      } else {
        // Fallback to category-based questionnaire selection
        questionnaire = getCategoryBasedQuestionnaire(medication.category);
      }

      setSelectedQuestionnaire(questionnaire);
      setShowDynamicQuestionnaire(true);
    } else {
      // Direct add to cart for OTC medications
      const orderData = {
        medication: medication,
        status: "cart",
        orderId: `OTC-${Date.now()}`,
        timestamp: new Date().toISOString(),
      };
      setOrders((prev) => [...prev, orderData]);
      toast({
        title: "Added to Cart",
        description: `${medication.name} has been added to your cart.`,
      });
    }
  };

  const getCategoryBasedQuestionnaire = (category: string) => {
    switch (category) {
      case "Weight Loss":
      case "Diabetes":
        return GLP1_QUESTIONNAIRE;
      case "Men's Health":
        return MENS_ED_QUESTIONNAIRE;
      case "Dermatology":
        return SKIN_CARE_QUESTIONNAIRE;
      case "Hair Loss":
        return HAIR_GROWTH_QUESTIONNAIRE;
      default:
        return GLP1_QUESTIONNAIRE; // fallback
    }
  };

  const handleOrderApproved = (orderData: any) => {
    setOrders((prev) => [...prev, orderData]);
    toast({
      title: "Assessment Complete!",
      description: `Your personalized treatment plan for ${orderData.medication?.name || selectedMedication?.name} has been created.`,
    });
    setSelectedTab("current");
  };

  const handleQuestionnaireComplete = (result: any) => {
    const orderData = {
      medication: selectedMedication,
      questionnaire: selectedQuestionnaire,
      aiResult: result,
      status: result.type === "approved" ? "approved" : "consultation_required",
      orderId: `DQ-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    handleOrderApproved(orderData);
    setShowDynamicQuestionnaire(false);
    setSelectedMedication(null);
    setSelectedQuestionnaire(null);
  };

  return (
    <div className="min-h-screen aurora-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2 flex items-center">
                <ShoppingCart className="w-8 h-8 text-primary mr-3" />
                Pharmacy Hub
              </h1>
              <p className="text-muted-foreground text-lg">
                Seamless prescription management with delivery tracking and
                auto-refill
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              <Button
                variant="outline"
                size="sm"
                className="hover-lift relative"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Cart
                {cartState.items.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center p-0">
                    {cartState.items.reduce(
                      (total, item) => total + item.quantity,
                      0,
                    )}
                  </Badge>
                )}
              </Button>
              <Button variant="outline" size="sm" className="hover-lift">
                <Settings className="w-4 h-4 mr-2" />
                Preferences
              </Button>
              <Button
                size="sm"
                className="gradient-bg text-white border-0 hover-lift"
                onClick={() => setSelectedTab("shop")}
              >
                <Store className="w-4 h-4 mr-2" />
                Shop Medications
              </Button>
            </div>
          </div>

          {/* Search and Tabs */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex space-x-2 flex-wrap">
              {[
                "shop",
                "rebates",
                "current",
                "history",
                "refills",
                "locations",
              ].map((tab) => (
                <Button
                  key={tab}
                  variant={selectedTab === tab ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTab(tab)}
                  className={
                    selectedTab === tab ? "gradient-bg text-white border-0" : ""
                  }
                >
                  {tab === "shop" && <Store className="w-4 h-4 mr-1" />}
                  {tab === "rebates" && <Percent className="w-4 h-4 mr-1" />}
                  {tab === "current" && <Package className="w-4 h-4 mr-1" />}
                  {tab === "history" && <Clock className="w-4 h-4 mr-1" />}
                  {tab === "refills" && <RefreshCw className="w-4 h-4 mr-1" />}
                  {tab === "locations" && <MapPin className="w-4 h-4 mr-1" />}
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search prescriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass-morphism border border-border/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Available Medications
                  </p>
                  <p className="text-3xl font-bold text-foreground">2,500+</p>
                </div>
                <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center">
                  <Pill className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-morphism border border-border/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    AI Consultations Today
                  </p>
                  <p className="text-3xl font-bold text-foreground">24</p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-morphism border border-border/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Current Orders
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {currentOrders.length + orders.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-morphism border border-border/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Avg Delivery Time
                  </p>
                  <p className="text-3xl font-bold text-foreground">24h</p>
                </div>
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                  <Truck className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Content */}
        {selectedTab === "rebates" && (
          <div className="space-y-6">
            <RebateEngine />
          </div>
        )}

        {selectedTab === "shop" && (
          <div className="space-y-6">
            <div className="relative overflow-hidden">
              <Card className="glass-morphism border border-border/20 bg-gradient-to-r from-emerald-50/50 via-blue-50/50 to-purple-50/50 dark:from-emerald-900/10 dark:via-blue-900/10 dark:to-purple-900/10 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 via-blue-400/10 to-purple-400/10 animate-pulse"></div>
                <CardHeader className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-xl">
                          <Brain className="w-8 h-8 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                          <Sparkles className="w-3 h-3 text-white" />
                        </div>
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
                          AI-Powered Health Marketplace
                          <Badge className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white border-0 text-xs px-3 py-1">
                            <Zap className="w-3 h-3 mr-1" />
                            Next-Gen AI
                          </Badge>
                        </CardTitle>
                        <p className="text-lg text-muted-foreground mt-1">
                          Real-world clinical questionnaires with intelligent
                          prescription recommendations
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <div className="flex items-center gap-1 text-emerald-600">
                            <Activity className="w-4 h-4" />
                            <span>Dynamic Assessments</span>
                          </div>
                          <div className="flex items-center gap-1 text-blue-600">
                            <Shield className="w-4 h-4" />
                            <span>FDA-Guided Logic</span>
                          </div>
                          <div className="flex items-center gap-1 text-purple-600">
                            <Brain className="w-4 h-4" />
                            <span>AI Prescription Engine</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-3 border border-emerald-200">
                        <div className="text-sm text-muted-foreground mb-1">
                          Available 24/7
                        </div>
                        <div className="flex items-center space-x-1 text-emerald-600">
                          <Heart className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            Empathetic AI Ready
                          </span>
                        </div>
                        <div className="text-xs text-blue-600 mt-1">
                          ✨ Real-world scenarios
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="glass-morphism border border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Compassionate AI Care
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Empathetic health assessments designed to make you feel
                    heard, understood, and supported throughout your care
                    journey
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-morphism border border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Safety-First Approach
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Evidence-based risk assessments ensure you get the right
                    care recommendation, whether it's self-treatment or
                    professional consultation
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-morphism border border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Personalized Experience
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Each assessment adapts to your unique situation with
                    supportive guidance and clear next steps tailored just for
                    you
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Medication Categories */}
            <div className="space-y-6">
              {/* Medical Weight Loss (GLP-1s) */}
              <Card className="glass-morphism border border-border/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Activity className="w-6 h-6 text-green-500" />
                    Medical Weight Loss (GLP-1s)
                    <Badge className="bg-green-100 text-green-700">
                      Popular
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    FDA-approved GLP-1 receptor agonists for weight management
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      {
                        name: "Semaglutide",
                        brand: "Ozempic/Wegovy",
                        price: "$850",
                        dosage: "0.25-2.4mg weekly",
                        requiresConsultation: true,
                        category: "Weight Loss",
                        id: "semaglutide_1mg",
                      },
                      {
                        name: "Tirzepatide",
                        brand: "Mounjaro",
                        price: "$950",
                        dosage: "2.5-15mg weekly",
                        requiresConsultation: true,
                        category: "Weight Loss",
                        id: "tirzepatide_2.5mg",
                      },
                      {
                        name: "Liraglutide",
                        brand: "Saxenda",
                        price: "$750",
                        dosage: "0.6-3.0mg daily",
                        requiresConsultation: true,
                        category: "Weight Loss",
                        id: "liraglutide_3mg",
                      },
                      {
                        name: "Dulaglutide",
                        brand: "Trulicity",
                        price: "$800",
                        dosage: "0.75-4.5mg weekly",
                        requiresConsultation: true,
                        category: "Diabetes",
                        id: "dulaglutide_0.75mg",
                      },
                    ].map((med, idx) => {
                      const hasAssignment =
                        productQuestionnaireAssignments.find(
                          (a) => a.productId === med.id && a.isActive,
                        );

                      return (
                        <div
                          key={idx}
                          className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer hover:border-emerald-300 group relative"
                        >
                          {hasAssignment && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center z-10">
                              <Brain className="w-3 h-3 text-white" />
                            </div>
                          )}
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-sm">
                              {med.name}
                            </h4>
                            <div className="flex items-center gap-1">
                              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                                AI Assessment
                              </Badge>
                              {hasAssignment && (
                                <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs">
                                  Linked
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            {med.brand}
                          </p>
                          <p className="text-xs text-muted-foreground mb-3">
                            {med.dosage}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-primary">
                              {med.price}
                            </span>
                            <Button
                              size="sm"
                              onClick={() => handleMedicationSelect(med)}
                              className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white border-0 hover:from-emerald-600 hover:to-blue-600 group-hover:scale-105 transition-transform"
                            >
                              <Brain className="w-3 h-3 mr-1" />
                              AI Assessment
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Men's ED Treatment */}
              <Card className="glass-morphism border border-border/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Heart className="w-6 h-6 text-red-500" />
                    Men's ED Treatment
                    <Badge className="bg-blue-100 text-blue-700">
                      Confidential
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Effective treatments for erectile dysfunction
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      {
                        name: "Sildenafil",
                        brand: "Viagra",
                        price: "$120",
                        dosage: "25-100mg as needed",
                        requiresConsultation: true,
                        category: "Men's Health",
                        id: "sildenafil_50mg",
                      },
                      {
                        name: "Tadalafil",
                        brand: "Cialis",
                        price: "$140",
                        dosage: "5-20mg as needed",
                        requiresConsultation: true,
                        category: "Men's Health",
                        id: "tadalafil_20mg",
                      },
                      {
                        name: "Vardenafil",
                        brand: "Levitra",
                        price: "$130",
                        dosage: "5-20mg as needed",
                        requiresConsultation: true,
                        category: "Men's Health",
                        id: "vardenafil_20mg",
                      },
                      {
                        name: "Avanafil",
                        brand: "Stendra",
                        price: "$150",
                        dosage: "50-200mg as needed",
                        requiresConsultation: true,
                        category: "Men's Health",
                        id: "avanafil_100mg",
                      },
                    ].map((med, idx) => {
                      const hasAssignment =
                        productQuestionnaireAssignments.find(
                          (a) => a.productId === med.id && a.isActive,
                        );

                      return (
                        <div
                          key={idx}
                          className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer hover:border-emerald-300 group relative"
                        >
                          {hasAssignment && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center z-10">
                              <Brain className="w-3 h-3 text-white" />
                            </div>
                          )}
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-sm">
                              {med.name}
                            </h4>
                            <div className="flex items-center gap-1">
                              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                                AI Assessment
                              </Badge>
                              {hasAssignment && (
                                <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs">
                                  Linked
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            {med.brand}
                          </p>
                          <p className="text-xs text-muted-foreground mb-3">
                            {med.dosage}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-primary">
                              {med.price}
                            </span>
                            <Button
                              size="sm"
                              onClick={() => handleMedicationSelect(med)}
                              className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white border-0 hover:from-emerald-600 hover:to-blue-600 group-hover:scale-105 transition-transform"
                            >
                              <Brain className="w-3 h-3 mr-1" />
                              AI Assessment
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* NAD+ Supplements */}
              <Card className="glass-morphism border border-border/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Zap className="w-6 h-6 text-yellow-500" />
                    NAD+ Supplements
                    <Badge className="bg-yellow-100 text-yellow-700">
                      Anti-Aging
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Cellular energy and longevity support supplements
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      {
                        name: "IV Therapy",
                        brand: "NAD+ Infusion",
                        price: "$300",
                        dosage: "250-500mg IV",
                      },
                      {
                        name: "Nicotinamide Riboside",
                        brand: "NR Supplement",
                        price: "$80",
                        dosage: "300mg daily",
                      },
                      {
                        name: "Sublingual",
                        brand: "NAD+ Drops",
                        price: "$120",
                        dosage: "50mg sublingual",
                      },
                      {
                        name: "NMN",
                        brand: "Nicotinamide Mononucleotide",
                        price: "$100",
                        dosage: "250mg daily",
                      },
                    ].map((med, idx) => (
                      <div
                        key={idx}
                        className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-sm">{med.name}</h4>
                          <Badge variant="outline">Supplement</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {med.brand}
                        </p>
                        <p className="text-xs text-muted-foreground mb-3">
                          {med.dosage}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-primary">
                            {med.price}
                          </span>
                          <Button
                            size="sm"
                            onClick={() => handleMedicationSelect(med)}
                          >
                            Order
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Prescription Skin Care */}
              <Card className="glass-morphism border border-border/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-purple-500" />
                    Prescription Skin Care
                    <Badge className="bg-purple-100 text-purple-700">
                      Dermatology
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Professional-grade skincare treatments
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      {
                        name: "Tretinoin",
                        brand: "Retin-A",
                        price: "$60",
                        dosage: "0.025-0.1% cream",
                        requiresConsultation: true,
                        category: "Dermatology",
                        id: "tretinoin_0.1",
                      },
                      {
                        name: "Hydroquinone",
                        brand: "Tri-Luma",
                        price: "$45",
                        dosage: "2-4% cream",
                        requiresConsultation: true,
                        category: "Dermatology",
                        id: "hydroquinone_4",
                      },
                      {
                        name: "Clindamycin",
                        brand: "Cleocin T",
                        price: "$35",
                        dosage: "1% gel/solution",
                        requiresConsultation: true,
                        category: "Dermatology",
                        id: "clindamycin_1",
                      },
                      {
                        name: "Azelaic Acid",
                        brand: "Finacea",
                        price: "$50",
                        dosage: "15-20% gel",
                        requiresConsultation: true,
                        category: "Dermatology",
                        id: "azelaic_acid_15",
                      },
                    ].map((med, idx) => {
                      const hasAssignment =
                        productQuestionnaireAssignments.find(
                          (a) => a.productId === med.id && a.isActive,
                        );

                      return (
                        <div
                          key={idx}
                          className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer hover:border-emerald-300 group relative"
                        >
                          {hasAssignment && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center z-10">
                              <Brain className="w-3 h-3 text-white" />
                            </div>
                          )}
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-sm">
                              {med.name}
                            </h4>
                            <div className="flex items-center gap-1">
                              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                                AI Assessment
                              </Badge>
                              {hasAssignment && (
                                <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs">
                                  Linked
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            {med.brand}
                          </p>
                          <p className="text-xs text-muted-foreground mb-3">
                            {med.dosage}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-primary">
                              {med.price}
                            </span>
                            <Button
                              size="sm"
                              onClick={() => handleMedicationSelect(med)}
                              className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white border-0 hover:from-emerald-600 hover:to-blue-600 group-hover:scale-105 transition-transform"
                            >
                              <Brain className="w-3 h-3 mr-1" />
                              AI Assessment
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Hair Growth Treatment */}
              <Card className="glass-morphism border border-border/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Shield className="w-6 h-6 text-cyan-500" />
                    Hair Growth Treatment
                    <Badge className="bg-cyan-100 text-cyan-700">
                      Hair Restoration
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Proven treatments for hair loss and growth
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      {
                        name: "Finasteride",
                        brand: "Propecia",
                        price: "$25",
                        dosage: "1mg daily",
                        requiresConsultation: true,
                        category: "Hair Loss",
                        id: "finasteride_1mg",
                      },
                      {
                        name: "Minoxidil",
                        brand: "Rogaine",
                        price: "$30",
                        dosage: "5% solution BID",
                        requiresConsultation: true,
                        category: "Hair Loss",
                        id: "minoxidil_5",
                      },
                      {
                        name: "Dutasteride",
                        brand: "Avodart",
                        price: "$35",
                        dosage: "0.5mg daily",
                        requiresConsultation: true,
                        category: "Hair Loss",
                        id: "dutasteride_0.5mg",
                      },
                      {
                        name: "Biotin Complex",
                        brand: "Hair Vitamins",
                        price: "$20",
                        dosage: "5000mcg daily",
                        requiresConsultation: false,
                        category: "Supplements",
                        id: "biotin_5000mcg",
                      },
                    ].map((med, idx) => {
                      const hasAssignment =
                        productQuestionnaireAssignments.find(
                          (a) => a.productId === med.id && a.isActive,
                        );

                      return (
                        <div
                          key={idx}
                          className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer hover:border-emerald-300 group relative"
                        >
                          {hasAssignment && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center z-10">
                              <Brain className="w-3 h-3 text-white" />
                            </div>
                          )}
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-sm">
                              {med.name}
                            </h4>
                            <div className="flex items-center gap-1">
                              <Badge
                                className={
                                  med.requiresConsultation
                                    ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                    : "bg-blue-100 text-blue-800 border-blue-200"
                                }
                              >
                                {med.requiresConsultation
                                  ? "AI Assessment"
                                  : "Direct Order"}
                              </Badge>
                              {hasAssignment && (
                                <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs">
                                  Linked
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            {med.brand}
                          </p>
                          <p className="text-xs text-muted-foreground mb-3">
                            {med.dosage}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-primary">
                              {med.price}
                            </span>
                            <Button
                              size="sm"
                              onClick={() => handleMedicationSelect(med)}
                              className={
                                med.requiresConsultation
                                  ? "bg-gradient-to-r from-emerald-500 to-blue-500 text-white border-0 hover:from-emerald-600 hover:to-blue-600 group-hover:scale-105 transition-transform"
                                  : "bg-blue-500 text-white border-0 hover:bg-blue-600 group-hover:scale-105 transition-transform"
                              }
                            >
                              {med.requiresConsultation ? (
                                <>
                                  <Heart className="w-3 h-3 mr-1" />
                                  Start Care
                                </>
                              ) : (
                                <>
                                  <ShoppingCart className="w-3 h-3 mr-1" />
                                  Add to Cart
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {selectedTab === "current" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Current Orders */}
            <div className="lg:col-span-2">
              <Card className="glass-morphism border border-border/20">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-foreground">
                    Current Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* New MCQ-Assessed Orders */}
                    {orders
                      .filter(
                        (order) =>
                          order.status === "approved" ||
                          order.status === "consultation_required",
                      )
                      .map((order) => (
                        <div
                          key={order.orderId}
                          className={`glass-morphism p-6 rounded-xl border hover-lift ${
                            order.status === "consultation_required"
                              ? "border-orange-200 dark:border-orange-800 bg-gradient-to-r from-orange-50/50 to-red-50/50 dark:from-orange-900/10 dark:to-red-900/10"
                              : "border-emerald-200 dark:border-emerald-800 bg-gradient-to-r from-emerald-50/50 to-blue-50/50 dark:from-emerald-900/10 dark:to-blue-900/10"
                          }`}
                        >
                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-lg font-semibold text-foreground">
                                  {order.medication.name}
                                </h3>
                                {order.status === "approved" ? (
                                  <>
                                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                                      <Heart className="w-4 h-4 mr-1" />
                                      Care Approved
                                    </Badge>
                                    <Badge className="bg-green-100 text-green-800 border-green-200">
                                      <CheckCircle className="w-4 h-4 mr-1" />
                                      Processing
                                    </Badge>
                                  </>
                                ) : (
                                  <>
                                    <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                                      <AlertTriangle className="w-4 h-4 mr-1" />
                                      Consultation Required
                                    </Badge>
                                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                                      <Clock className="w-4 h-4 mr-1" />
                                      Pending
                                    </Badge>
                                  </>
                                )}
                              </div>
                              <p className="text-muted-foreground text-sm mb-1">
                                {order.medication.brand} •{" "}
                                {order.medication.category} •
                                {order.status === "approved"
                                  ? " Empathetic Assessment Completed"
                                  : " Professional Review Needed"}
                              </p>
                              <p className="text-muted-foreground text-xs">
                                Order #{order.orderId} • AI Confidence:{" "}
                                {Math.round(
                                  order.consultation?.assessment?.confidence ||
                                    95,
                                )}
                                % • Risk Level:{" "}
                                {order.consultation?.assessment?.riskLevel ||
                                  "low"}
                              </p>
                            </div>
                            <div className="mt-4 lg:mt-0 lg:text-right">
                              <div className="text-sm text-muted-foreground mb-1">
                                Total Cost
                              </div>
                              <div className="text-2xl font-bold text-foreground">
                                {order.consultation?.assessment?.totalCost ||
                                  order.medication.price}
                              </div>
                            </div>
                          </div>

                          {/* Supportive message for consultation required */}
                          {order.status === "consultation_required" && (
                            <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-400 rounded-r">
                              <div className="flex items-start gap-2">
                                <Heart className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                                <div>
                                  <h5 className="text-sm font-medium text-orange-800 dark:text-orange-200 mb-1">
                                    Your Health & Safety First
                                  </h5>
                                  <p className="text-xs text-orange-700 dark:text-orange-300">
                                    Based on your responses, we recommend a
                                    professional consultation to ensure the
                                    safest treatment plan for your unique
                                    situation.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="glass-morphism p-3 rounded-lg">
                              <div className="flex items-center space-x-2 mb-1">
                                <Calendar className="w-4 h-4 text-primary" />
                                <span className="text-xs font-medium text-muted-foreground">
                                  Order Date
                                </span>
                              </div>
                              <p className="text-sm font-semibold text-foreground">
                                {new Date(order.timestamp).toLocaleDateString()}
                              </p>
                            </div>

                            <div className="glass-morphism p-3 rounded-lg">
                              <div className="flex items-center space-x-2 mb-1">
                                <Brain className="w-4 h-4 text-primary" />
                                <span className="text-xs font-medium text-muted-foreground">
                                  Dosage
                                </span>
                              </div>
                              <p className="text-sm font-semibold text-foreground">
                                {order.consultation?.aiAnalysis
                                  ?.dosageRecommendation || "As prescribed"}
                              </p>
                            </div>

                            <div className="glass-morphism p-3 rounded-lg">
                              <div className="flex items-center space-x-2 mb-1">
                                <Truck className="w-4 h-4 text-primary" />
                                <span className="text-xs font-medium text-muted-foreground">
                                  Expected Delivery
                                </span>
                              </div>
                              <p className="text-sm font-semibold text-foreground">
                                {order.consultation?.aiAnalysis
                                  ?.estimatedDelivery || "2-3 business days"}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Assessment
                            </Button>
                            {order.status === "consultation_required" ? (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1 border-orange-300 text-orange-700 hover:bg-orange-50"
                                >
                                  <Calendar className="w-4 h-4 mr-2" />
                                  Schedule Consultation
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 flex-1 hover:from-orange-600 hover:to-red-600"
                                >
                                  <Phone className="w-4 h-4 mr-2" />
                                  Call Now
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                                >
                                  <MessageCircle className="w-4 h-4 mr-2" />
                                  Care Team
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white border-0 flex-1 hover:from-emerald-600 hover:to-blue-600"
                                >
                                  <Package className="w-4 h-4 mr-2" />
                                  Track Order
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}

                    {/* Existing Orders */}
                    {currentOrders.map((order) => (
                      <div
                        key={order.id}
                        className="glass-morphism p-6 rounded-xl border border-border/10 hover-lift"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-foreground">
                                {order.medication}
                              </h3>
                              <Badge className={getStatusColor(order.status)}>
                                {getStatusIcon(order.status)}
                                <span className="ml-1">
                                  {formatStatus(order.status)}
                                </span>
                              </Badge>
                            </div>
                            <p className="text-muted-foreground text-sm mb-1">
                              {order.brand} • Qty: {order.quantity} •{" "}
                              {order.refillsRemaining} refills remaining
                            </p>
                            <p className="text-muted-foreground text-xs">
                              Order #{order.id} • Prescribed by{" "}
                              {order.prescriber}
                            </p>
                          </div>
                          <div className="mt-4 lg:mt-0 lg:text-right">
                            <div className="text-sm text-muted-foreground mb-1">
                              Copay
                            </div>
                            <div className="text-2xl font-bold text-foreground">
                              ${order.copay}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="glass-morphism p-3 rounded-lg">
                            <div className="flex items-center space-x-2 mb-1">
                              <Calendar className="w-4 h-4 text-primary" />
                              <span className="text-xs font-medium text-muted-foreground">
                                Order Date
                              </span>
                            </div>
                            <p className="text-sm font-semibold text-foreground">
                              {new Date(order.orderDate).toLocaleDateString()}
                            </p>
                          </div>

                          <div className="glass-morphism p-3 rounded-lg">
                            <div className="flex items-center space-x-2 mb-1">
                              <Truck className="w-4 h-4 text-primary" />
                              <span className="text-xs font-medium text-muted-foreground">
                                Expected Delivery
                              </span>
                            </div>
                            <p className="text-sm font-semibold text-foreground">
                              {new Date(
                                order.expectedDelivery,
                              ).toLocaleDateString()}
                            </p>
                          </div>

                          <div className="glass-morphism p-3 rounded-lg">
                            <div className="flex items-center space-x-2 mb-1">
                              <MapPin className="w-4 h-4 text-primary" />
                              <span className="text-xs font-medium text-muted-foreground">
                                Pharmacy
                              </span>
                            </div>
                            <p className="text-sm font-semibold text-foreground">
                              {order.pharmacy}
                            </p>
                          </div>
                        </div>

                        {order.trackingNumber && (
                          <div className="glass-morphism p-3 rounded-lg mb-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-xs text-muted-foreground mb-1">
                                  Tracking Number
                                </div>
                                <div className="text-sm font-mono text-foreground">
                                  {order.trackingNumber}
                                </div>
                              </div>
                              <Button variant="outline" size="sm">
                                Track Package
                              </Button>
                            </div>
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            <Phone className="w-4 h-4 mr-2" />
                            Contact Pharmacy
                          </Button>
                          <Button
                            size="sm"
                            className="gradient-bg text-white border-0 flex-1"
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Message Doctor
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Quick Actions */}
            <div className="space-y-6">
              {/* Auto-Refill Settings */}
              <Card className="glass-morphism border border-border/20">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-foreground flex items-center">
                    <RefreshCw className="w-5 h-5 text-primary mr-2" />
                    Auto-Refill Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {autoRefillSettings.map((setting, index) => (
                      <div
                        key={index}
                        className="glass-morphism p-4 rounded-xl"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-foreground text-sm">
                            {setting.medication}
                          </span>
                          <Badge
                            className={
                              setting.enabled
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }
                          >
                            {setting.enabled ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>
                            Refill {setting.daysBeforeRefill} days before empty
                          </p>
                          <p>
                            Next refill:{" "}
                            {new Date(setting.nextRefill).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Preferences */}
              <Card className="glass-morphism border border-border/20">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-foreground flex items-center">
                    <Truck className="w-5 h-5 text-primary mr-2" />
                    Delivery Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="glass-morphism p-4 rounded-xl">
                      <div className="flex items-center space-x-2 mb-2">
                        <Shield className="w-4 h-4 text-green-500" />
                        <span className="font-medium text-foreground">
                          Discreet Packaging
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Enabled for all deliveries
                      </p>
                    </div>

                    <div className="glass-morphism p-4 rounded-xl">
                      <div className="flex items-center space-x-2 mb-2">
                        <Bell className="w-4 h-4 text-blue-500" />
                        <span className="font-medium text-foreground">
                          Delivery Notifications
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        SMS + Email alerts
                      </p>
                    </div>

                    <div className="glass-morphism p-4 rounded-xl">
                      <div className="flex items-center space-x-2 mb-2">
                        <Clock className="w-4 h-4 text-purple-500" />
                        <span className="font-medium text-foreground">
                          Preferred Time
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Weekdays 2-6 PM
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Insurance Info */}
              <Card className="glass-morphism border border-border/20">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-foreground flex items-center">
                    <CreditCard className="w-5 h-5 text-primary mr-2" />
                    Insurance & Payment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="glass-morphism p-3 rounded-lg">
                      <div className="text-sm font-medium text-foreground">
                        Primary Insurance
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Blue Cross Blue Shield
                      </div>
                    </div>
                    <div className="glass-morphism p-3 rounded-lg">
                      <div className="text-sm font-medium text-foreground">
                        Monthly Savings
                      </div>
                      <div className="text-lg font-bold text-green-600">
                        $45.00
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      Update Payment Method
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {selectedTab === "locations" && (
          <Card className="glass-morphism border border-border/20">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-foreground">
                Preferred Pharmacies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pharmacyLocations.map((pharmacy, index) => (
                  <div
                    key={index}
                    className="glass-morphism p-6 rounded-xl border border-border/10 hover-lift"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-foreground text-lg">
                          {pharmacy.name}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {pharmacy.address}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {pharmacy.phone}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">
                          {pharmacy.rating}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-xs text-muted-foreground">
                          Hours
                        </div>
                        <div className="text-sm font-medium text-foreground">
                          {pharmacy.hours}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">
                          Distance
                        </div>
                        <div className="text-sm font-medium text-foreground">
                          {pharmacy.distance}
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="text-xs text-muted-foreground mb-2">
                        Services
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {pharmacy.services.map((service, serviceIndex) => (
                          <Badge
                            key={serviceIndex}
                            variant="secondary"
                            className="text-xs"
                          >
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Phone className="w-4 h-4 mr-2" />
                        Call
                      </Button>
                      <Button
                        size="sm"
                        className="gradient-bg text-white border-0 flex-1"
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        Directions
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {selectedTab === "history" && (
          <Card className="glass-morphism border border-border/20">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-foreground">
                Prescription History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {prescriptionHistory.map((prescription) => (
                  <div
                    key={prescription.id}
                    className="glass-morphism p-4 rounded-xl border border-border/10 hover-lift"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {prescription.medication}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          Qty: {prescription.quantity} • Filled:{" "}
                          {new Date(
                            prescription.filledDate,
                          ).toLocaleDateString()}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {prescription.pharmacy}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-foreground">
                          ${prescription.copay}
                        </div>
                        <Badge className={getStatusColor(prescription.status)}>
                          {formatStatus(prescription.status)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empathetic Consultation Dialog */}
        {selectedMedication && (
          <EmpatheticConsultation
            isOpen={showEmpatheticConsultation}
            onClose={() => {
              setShowEmpatheticConsultation(false);
              setSelectedMedication(null);
            }}
            medication={selectedMedication}
            onOrderApproved={handleOrderApproved}
          />
        )}

        {/* Dynamic Questionnaire Dialog */}
        {selectedMedication && selectedQuestionnaire && (
          <DynamicQuestionnaire
            isOpen={showDynamicQuestionnaire}
            onClose={() => {
              setShowDynamicQuestionnaire(false);
              setSelectedMedication(null);
              setSelectedQuestionnaire(null);
            }}
            questionnaire={selectedQuestionnaire}
            onComplete={handleQuestionnaireComplete}
          />
        )}

        {/* Legacy Telehealth Visit Dialog (for non-MCQ medications) */}
        {selectedMedication && (
          <TelehealthVisit
            isOpen={showTelehealth}
            onClose={() => {
              setShowTelehealth(false);
              setSelectedMedication(null);
            }}
            medication={selectedMedication}
            onOrderApproved={handleOrderApproved}
          />
        )}

        {/* Shopping Cart Dialog */}
        <ShoppingCartComponent
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
        />

        {/* Checkout System Dialog */}
        <CheckoutSystem
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
        />
      </div>
    </div>
  );
}
