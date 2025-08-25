import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
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
  Package,
  Plus,
  Trash2,
  Edit,
  TrendingUp,
  Target,
  ShoppingCart,
  Percent,
  Users,
  BarChart3,
  Settings,
  Zap,
  Star,
  Award,
  Calendar,
  DollarSign,
  Activity,
  CheckCircle,
  AlertTriangle,
  Search,
  Filter,
  Save,
  Copy,
  Download,
  Upload,
  Eye,
  Brain,
  Heart,
  Shield,
  Pill,
  Sparkles,
  Clock,
  ArrowRight,
  X,
  Info,
  RefreshCw,
  Globe,
  Database,
} from "lucide-react";

// Types for sales optimization
interface Bundle {
  id: string;
  name: string;
  description: string;
  productIds: string[];
  originalPrice: number;
  bundlePrice: number;
  savings: number;
  discountPercentage: number;
  category: string;
  targetConditions: string[];
  clinicallyRecommended: boolean;
  status: "active" | "draft" | "paused";
  createdDate: string;
  performance: {
    views: number;
    conversions: number;
    revenue: number;
    conversionRate: number;
  };
}

interface UpsellRule {
  id: string;
  name: string;
  triggerProduct: string;
  targetProduct: string;
  conditions: {
    minCartValue?: number;
    customerSegment?: string;
    previousPurchases?: string[];
    medicalConditions?: string[];
  };
  offer: {
    type: "discount" | "upgrade" | "addon";
    value: number;
    description: string;
  };
  priority: number;
  isActive: boolean;
  performance: {
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
    clickThroughRate: number;
    conversionRate: number;
  };
}

interface CrossSellRule {
  id: string;
  name: string;
  triggerProducts: string[];
  recommendedProducts: string[];
  combination: {
    bundlePrice: number;
    savings: number;
    clinicalReason: string;
  };
  conditions: {
    frequency: number; // how often they're bought together
    clinicalRelevance: number; // 1-10 scale
    seasonality?: string;
  };
  isActive: boolean;
  performance: {
    impressions: number;
    conversions: number;
    revenue: number;
    frequency: number;
  };
}

interface CartOptimization {
  freeShippingThreshold: number;
  abandonmentEmailTrigger: number; // minutes
  autoRefillDiscount: number;
  loyaltyPointsMultiplier: number;
  newCustomerDiscount: number;
  bulkDiscountTiers: {
    quantity: number;
    discount: number;
  }[];
  urgencyTimers: boolean;
  stockLowWarnings: boolean;
  recommendationEngine: boolean;
}

export function SalesOptimization() {
  const [activeTab, setActiveTab] = useState("bundles");
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [upsellRules, setUpsellRules] = useState<UpsellRule[]>([]);
  const [crossSellRules, setCrossSellRules] = useState<CrossSellRule[]>([]);
  const [cartConfig, setCartConfig] = useState<CartOptimization>({
    freeShippingThreshold: 50,
    abandonmentEmailTrigger: 30,
    autoRefillDiscount: 15,
    loyaltyPointsMultiplier: 1.5,
    newCustomerDiscount: 20,
    bulkDiscountTiers: [
      { quantity: 3, discount: 10 },
      { quantity: 5, discount: 15 },
      { quantity: 10, discount: 25 },
    ],
    urgencyTimers: true,
    stockLowWarnings: true,
    recommendationEngine: true,
  });

  const [showBundleDialog, setShowBundleDialog] = useState(false);
  const [showUpsellDialog, setShowUpsellDialog] = useState(false);
  const [showCrossSellDialog, setShowCrossSellDialog] = useState(false);
  const [editingBundle, setEditingBundle] = useState<Bundle | null>(null);
  const [editingUpsell, setEditingUpsell] = useState<UpsellRule | null>(null);
  const [editingCrossSell, setEditingCrossSell] =
    useState<CrossSellRule | null>(null);
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");

  // Load sample data
  useEffect(() => {
    // Initialize with sample bundles
    setBundles([
      {
        id: "bundle_1",
        name: "Complete Heart Health Bundle",
        description: "Comprehensive cardiovascular support package",
        productIds: ["atorvastatin_20mg", "metoprolol_50mg", "aspirin_81mg"],
        originalPrice: 289.99,
        bundlePrice: 219.99,
        savings: 70.0,
        discountPercentage: 24,
        category: "Cardiovascular",
        targetConditions: ["Hypertension", "High Cholesterol", "Heart Disease"],
        clinicallyRecommended: true,
        status: "active",
        createdDate: "2024-01-15",
        performance: {
          views: 1247,
          conversions: 198,
          revenue: 43578.02,
          conversionRate: 15.9,
        },
      },
      {
        id: "bundle_2",
        name: "Diabetes Management Kit",
        description: "Complete diabetes care and monitoring solution",
        productIds: ["metformin_1000mg", "glucose_monitor", "test_strips"],
        originalPrice: 234.99,
        bundlePrice: 179.99,
        savings: 55.0,
        discountPercentage: 23,
        category: "Diabetes",
        targetConditions: ["Type 2 Diabetes", "Pre-diabetes"],
        clinicallyRecommended: true,
        status: "active",
        createdDate: "2024-01-10",
        performance: {
          views: 892,
          conversions: 134,
          revenue: 24118.66,
          conversionRate: 15.0,
        },
      },
    ]);

    // Initialize with sample upsell rules
    setUpsellRules([
      {
        id: "upsell_1",
        name: "90-Day Supply Upgrade",
        triggerProduct: "any_prescription",
        targetProduct: "90_day_supply",
        conditions: {
          minCartValue: 50,
          customerSegment: "recurring",
        },
        offer: {
          type: "discount",
          value: 25,
          description: "Save 25% with 90-day supply",
        },
        priority: 1,
        isActive: true,
        performance: {
          impressions: 5420,
          clicks: 423,
          conversions: 298,
          revenue: 8940.5,
          clickThroughRate: 7.8,
          conversionRate: 70.4,
        },
      },
      {
        id: "upsell_2",
        name: "Blood Pressure Monitor Add-on",
        triggerProduct: "hypertension_medication",
        targetProduct: "bp_monitor_premium",
        conditions: {
          medicalConditions: ["Hypertension"],
        },
        offer: {
          type: "addon",
          value: 20,
          description: "Add premium BP monitor for just $59.99",
        },
        priority: 2,
        isActive: true,
        performance: {
          impressions: 2134,
          clicks: 198,
          conversions: 87,
          revenue: 5219.13,
          clickThroughRate: 9.3,
          conversionRate: 43.9,
        },
      },
    ]);

    // Initialize with sample cross-sell rules
    setCrossSellRules([
      {
        id: "crosssell_1",
        name: "Heart Health Combo",
        triggerProducts: ["atorvastatin_20mg"],
        recommendedProducts: ["aspirin_81mg", "omega3_1000mg"],
        combination: {
          bundlePrice: 89.99,
          savings: 15.0,
          clinicalReason:
            "Combined therapy shown to reduce cardiovascular events by 34%",
        },
        conditions: {
          frequency: 78,
          clinicalRelevance: 9,
          seasonality: "year-round",
        },
        isActive: true,
        performance: {
          impressions: 1547,
          conversions: 234,
          revenue: 21057.66,
          frequency: 78,
        },
      },
      {
        id: "crosssell_2",
        name: "Diabetes Support Package",
        triggerProducts: ["metformin_1000mg"],
        recommendedProducts: ["glucose_monitor", "diabetic_vitamins"],
        combination: {
          bundlePrice: 124.99,
          savings: 25.0,
          clinicalReason:
            "Regular monitoring improves glycemic control and reduces complications",
        },
        conditions: {
          frequency: 65,
          clinicalRelevance: 10,
          seasonality: "year-round",
        },
        isActive: true,
        performance: {
          impressions: 987,
          conversions: 143,
          revenue: 17873.57,
          frequency: 65,
        },
      },
    ]);

    // Load available products
    import("../data/products")
      .then((module) => {
        const products = module.SAMPLE_PRODUCTS.map((product) => ({
          id: product.id,
          name: product.name,
          price: product.price,
          category: product.category.name,
          type: product.type,
        }));
        setAvailableProducts(products);
      })
      .catch(() => {
        // Fallback sample products if external data is not available
        setAvailableProducts([
          {
            id: "atorvastatin_20mg",
            name: "Atorvastatin 20mg",
            price: 89.99,
            category: "Cardiovascular",
            type: "prescription",
          },
          {
            id: "metformin_1000mg",
            name: "Metformin 1000mg",
            price: 25.99,
            category: "Diabetes",
            type: "prescription",
          },
          {
            id: "aspirin_81mg",
            name: "Aspirin 81mg",
            price: 8.99,
            category: "Cardiovascular",
            type: "otc",
          },
          {
            id: "omega3_1000mg",
            name: "Omega-3 1000mg",
            price: 24.99,
            category: "Supplements",
            type: "supplement",
          },
          {
            id: "glucose_monitor",
            name: "Glucose Monitor",
            price: 49.99,
            category: "Diabetes",
            type: "device",
          },
          {
            id: "bp_monitor",
            name: "Blood Pressure Monitor",
            price: 79.99,
            category: "Cardiovascular",
            type: "device",
          },
          {
            id: "pill_organizer",
            name: "7-Day Pill Organizer",
            price: 12.99,
            category: "Accessories",
            type: "otc",
          },
          {
            id: "vitamin_d3",
            name: "Vitamin D3 2000 IU",
            price: 15.99,
            category: "Supplements",
            type: "supplement",
          },
          {
            id: "magnesium_400mg",
            name: "Magnesium 400mg",
            price: 18.99,
            category: "Supplements",
            type: "supplement",
          },
          {
            id: "fish_oil",
            name: "Fish Oil Capsules",
            price: 22.99,
            category: "Supplements",
            type: "supplement",
          },
          {
            id: "multivitamin",
            name: "Daily Multivitamin",
            price: 19.99,
            category: "Supplements",
            type: "supplement",
          },
          {
            id: "probiotic",
            name: "Probiotic Complex",
            price: 29.99,
            category: "Supplements",
            type: "supplement",
          },
          {
            id: "coq10",
            name: "CoQ10 100mg",
            price: 34.99,
            category: "Supplements",
            type: "supplement",
          },
          {
            id: "turmeric",
            name: "Turmeric Curcumin",
            price: 21.99,
            category: "Supplements",
            type: "supplement",
          },
          {
            id: "test_strips",
            name: "Glucose Test Strips (50)",
            price: 24.99,
            category: "Diabetes",
            type: "otc",
          },
        ]);
      });
  }, []);

  // Bundle Creation/Editing
  const createBundle = () => {
    setEditingBundle({
      id: `bundle_${Date.now()}`,
      name: "",
      description: "",
      productIds: [],
      originalPrice: 0,
      bundlePrice: 0,
      savings: 0,
      discountPercentage: 0,
      category: "",
      targetConditions: [],
      clinicallyRecommended: false,
      status: "draft",
      createdDate: new Date().toISOString().split("T")[0],
      performance: {
        views: 0,
        conversions: 0,
        revenue: 0,
        conversionRate: 0,
      },
    });
    setShowBundleDialog(true);
  };

  const saveBundle = () => {
    if (!editingBundle) return;

    if (bundles.find((b) => b.id === editingBundle.id)) {
      setBundles((prev) =>
        prev.map((b) => (b.id === editingBundle.id ? editingBundle : b)),
      );
    } else {
      setBundles((prev) => [...prev, editingBundle]);
    }

    setShowBundleDialog(false);
    setEditingBundle(null);
  };

  // Upsell Rule Creation/Editing
  const createUpsellRule = () => {
    setEditingUpsell({
      id: `upsell_${Date.now()}`,
      name: "",
      triggerProduct: "",
      targetProduct: "",
      conditions: {},
      offer: {
        type: "discount",
        value: 0,
        description: "",
      },
      priority: 1,
      isActive: true,
      performance: {
        impressions: 0,
        clicks: 0,
        conversions: 0,
        revenue: 0,
        clickThroughRate: 0,
        conversionRate: 0,
      },
    });
    setShowUpsellDialog(true);
  };

  const saveUpsellRule = () => {
    if (!editingUpsell) return;

    if (upsellRules.find((u) => u.id === editingUpsell.id)) {
      setUpsellRules((prev) =>
        prev.map((u) => (u.id === editingUpsell.id ? editingUpsell : u)),
      );
    } else {
      setUpsellRules((prev) => [...prev, editingUpsell]);
    }

    setShowUpsellDialog(false);
    setEditingUpsell(null);
  };

  // Cross-sell Rule Creation/Editing
  const createCrossSellRule = () => {
    setEditingCrossSell({
      id: `crosssell_${Date.now()}`,
      name: "",
      triggerProducts: [],
      recommendedProducts: [],
      combination: {
        bundlePrice: 0,
        savings: 0,
        clinicalReason: "",
      },
      conditions: {
        frequency: 0,
        clinicalRelevance: 5,
      },
      isActive: true,
      performance: {
        impressions: 0,
        conversions: 0,
        revenue: 0,
        frequency: 0,
      },
    });
    setShowCrossSellDialog(true);
  };

  const saveCrossSellRule = () => {
    if (!editingCrossSell) return;

    if (crossSellRules.find((c) => c.id === editingCrossSell.id)) {
      setCrossSellRules((prev) =>
        prev.map((c) => (c.id === editingCrossSell.id ? editingCrossSell : c)),
      );
    } else {
      setCrossSellRules((prev) => [...prev, editingCrossSell]);
    }

    setShowCrossSellDialog(false);
    setEditingCrossSell(null);
  };

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  const formatPercent = (value: number) => `${value.toFixed(1)}%`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">
            Sales Optimization
          </h2>
          <p className="text-muted-foreground">
            Manage bundles, upsells, cross-sells, and cart optimization
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import Rules
          </Button>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="bundles" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Bundles
          </TabsTrigger>
          <TabsTrigger value="upsells" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Upsells
          </TabsTrigger>
          <TabsTrigger value="crosssells" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Cross-sells
          </TabsTrigger>
          <TabsTrigger value="cart" className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            Cart Config
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Bundle Management Tab */}
        <TabsContent value="bundles" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h3 className="text-xl font-semibold">
                Product Bundles ({bundles.length})
              </h3>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search bundles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
            <Button onClick={createBundle}>
              <Plus className="w-4 h-4 mr-2" />
              Create Bundle
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bundles.map((bundle) => (
              <Card
                key={bundle.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{bundle.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {bundle.description}
                      </p>
                    </div>
                    <Badge
                      className={
                        bundle.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }
                    >
                      {bundle.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Bundle Price
                      </div>
                      <div className="text-lg font-bold text-primary">
                        {formatCurrency(bundle.bundlePrice)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Savings
                      </div>
                      <div className="text-lg font-bold text-green-600">
                        {formatCurrency(bundle.savings)}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Conversion Rate</span>
                      <span className="font-medium">
                        {formatPercent(bundle.performance.conversionRate)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Revenue</span>
                      <span className="font-medium">
                        {formatCurrency(bundle.performance.revenue)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {bundle.targetConditions
                      .slice(0, 2)
                      .map((condition, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {condition}
                        </Badge>
                      ))}
                    {bundle.targetConditions.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{bundle.targetConditions.length - 2} more
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1">
                      {bundle.clinicallyRecommended && (
                        <Badge className="bg-blue-100 text-blue-800">
                          <Shield className="w-3 h-3 mr-1" />
                          Clinical
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingBundle(bundle);
                          setShowBundleDialog(true);
                        }}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Upsell Rules Tab */}
        <TabsContent value="upsells" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">
              Upsell Rules ({upsellRules.length})
            </h3>
            <Button onClick={createUpsellRule}>
              <Plus className="w-4 h-4 mr-2" />
              Create Upsell Rule
            </Button>
          </div>

          <div className="space-y-4">
            {upsellRules.map((rule) => (
              <Card key={rule.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold">{rule.name}</h4>
                        <Badge
                          className={
                            rule.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {rule.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline">
                          Priority {rule.priority}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">
                            Trigger
                          </div>
                          <div className="font-medium">
                            {rule.triggerProduct}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">
                            Target
                          </div>
                          <div className="font-medium">
                            {rule.targetProduct}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">
                            Offer
                          </div>
                          <div className="font-medium">
                            {rule.offer.value}
                            {rule.offer.type === "discount" ? "%" : ""}{" "}
                            {rule.offer.type}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">
                            Conversion Rate
                          </div>
                          <div className="font-medium text-green-600">
                            {formatPercent(rule.performance.conversionRate)}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-6 text-sm">
                        <div>
                          <span className="text-muted-foreground">
                            Impressions:{" "}
                          </span>
                          <span className="font-medium">
                            {rule.performance.impressions.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Clicks:{" "}
                          </span>
                          <span className="font-medium">
                            {rule.performance.clicks.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Conversions:{" "}
                          </span>
                          <span className="font-medium">
                            {rule.performance.conversions.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Revenue:{" "}
                          </span>
                          <span className="font-medium text-green-600">
                            {formatCurrency(rule.performance.revenue)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingUpsell(rule);
                          setShowUpsellDialog(true);
                        }}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Cross-sell Rules Tab */}
        <TabsContent value="crosssells" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">
              Cross-sell Rules ({crossSellRules.length})
            </h3>
            <Button onClick={createCrossSellRule}>
              <Plus className="w-4 h-4 mr-2" />
              Create Cross-sell Rule
            </Button>
          </div>

          <div className="space-y-4">
            {crossSellRules.map((rule) => (
              <Card key={rule.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h4 className="text-lg font-semibold">{rule.name}</h4>
                        <Badge
                          className={
                            rule.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {rule.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Badge className="bg-blue-100 text-blue-800">
                          {rule.conditions.frequency}% frequency
                        </Badge>
                        <Badge className="bg-purple-100 text-purple-800">
                          Clinical: {rule.conditions.clinicalRelevance}/10
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">
                            Trigger Products
                          </div>
                          <div className="space-y-1">
                            {rule.triggerProducts.map((product, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="mr-1"
                              >
                                {product}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">
                            Recommended Products
                          </div>
                          <div className="space-y-1">
                            {rule.recommendedProducts.map((product, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="mr-1"
                              >
                                {product}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">
                            Bundle Offer
                          </div>
                          <div className="font-medium">
                            {formatCurrency(rule.combination.bundlePrice)}
                          </div>
                          <div className="text-sm text-green-600">
                            Save {formatCurrency(rule.combination.savings)}
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4">
                        <div className="flex items-start gap-2">
                          <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                              Clinical Reasoning
                            </div>
                            <div className="text-sm text-blue-800 dark:text-blue-200">
                              {rule.combination.clinicalReason}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-sm">
                        <div>
                          <span className="text-muted-foreground">
                            Impressions:{" "}
                          </span>
                          <span className="font-medium">
                            {rule.performance.impressions.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Conversions:{" "}
                          </span>
                          <span className="font-medium">
                            {rule.performance.conversions.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Revenue:{" "}
                          </span>
                          <span className="font-medium text-green-600">
                            {formatCurrency(rule.performance.revenue)}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Frequency:{" "}
                          </span>
                          <span className="font-medium">
                            {rule.performance.frequency}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingCrossSell(rule);
                          setShowCrossSellDialog(true);
                        }}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Cart Configuration Tab */}
        <TabsContent value="cart" className="space-y-6">
          <h3 className="text-xl font-semibold">Cart Optimization Settings</h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  General Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Free Shipping Threshold</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <span>$</span>
                    <Input
                      type="number"
                      value={cartConfig.freeShippingThreshold}
                      onChange={(e) =>
                        setCartConfig((prev) => ({
                          ...prev,
                          freeShippingThreshold:
                            parseFloat(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label>Cart Abandonment Email Trigger (minutes)</Label>
                  <Input
                    type="number"
                    value={cartConfig.abandonmentEmailTrigger}
                    onChange={(e) =>
                      setCartConfig((prev) => ({
                        ...prev,
                        abandonmentEmailTrigger: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>New Customer Discount (%)</Label>
                  <Input
                    type="number"
                    value={cartConfig.newCustomerDiscount}
                    onChange={(e) =>
                      setCartConfig((prev) => ({
                        ...prev,
                        newCustomerDiscount: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Auto-Refill Discount (%)</Label>
                  <Input
                    type="number"
                    value={cartConfig.autoRefillDiscount}
                    onChange={(e) =>
                      setCartConfig((prev) => ({
                        ...prev,
                        autoRefillDiscount: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Loyalty Points Multiplier</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={cartConfig.loyaltyPointsMultiplier}
                    onChange={(e) =>
                      setCartConfig((prev) => ({
                        ...prev,
                        loyaltyPointsMultiplier:
                          parseFloat(e.target.value) || 1,
                      }))
                    }
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Percent className="w-5 h-5" />
                  Bulk Discount Tiers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartConfig.bulkDiscountTiers.map((tier, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <Label className="text-sm">Quantity</Label>
                      <Input
                        type="number"
                        value={tier.quantity}
                        onChange={(e) => {
                          const newTiers = [...cartConfig.bulkDiscountTiers];
                          newTiers[index].quantity =
                            parseInt(e.target.value) || 0;
                          setCartConfig((prev) => ({
                            ...prev,
                            bulkDiscountTiers: newTiers,
                          }));
                        }}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex-1">
                      <Label className="text-sm">Discount (%)</Label>
                      <Input
                        type="number"
                        value={tier.discount}
                        onChange={(e) => {
                          const newTiers = [...cartConfig.bulkDiscountTiers];
                          newTiers[index].discount =
                            parseFloat(e.target.value) || 0;
                          setCartConfig((prev) => ({
                            ...prev,
                            bulkDiscountTiers: newTiers,
                          }));
                        }}
                        className="mt-1"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newTiers = cartConfig.bulkDiscountTiers.filter(
                          (_, i) => i !== index,
                        );
                        setCartConfig((prev) => ({
                          ...prev,
                          bulkDiscountTiers: newTiers,
                        }));
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => {
                    const newTiers = [
                      ...cartConfig.bulkDiscountTiers,
                      { quantity: 0, discount: 0 },
                    ];
                    setCartConfig((prev) => ({
                      ...prev,
                      bulkDiscountTiers: newTiers,
                    }));
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Tier
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Feature Toggles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Urgency Timers</Label>
                    <p className="text-sm text-muted-foreground">
                      Show countdown timers for limited offers
                    </p>
                  </div>
                  <Switch
                    checked={cartConfig.urgencyTimers}
                    onCheckedChange={(checked) =>
                      setCartConfig((prev) => ({
                        ...prev,
                        urgencyTimers: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Stock Low Warnings</Label>
                    <p className="text-sm text-muted-foreground">
                      Alert customers when stock is running low
                    </p>
                  </div>
                  <Switch
                    checked={cartConfig.stockLowWarnings}
                    onCheckedChange={(checked) =>
                      setCartConfig((prev) => ({
                        ...prev,
                        stockLowWarnings: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Recommendation Engine</Label>
                    <p className="text-sm text-muted-foreground">
                      Show AI-powered product recommendations
                    </p>
                  </div>
                  <Switch
                    checked={cartConfig.recommendationEngine}
                    onCheckedChange={(checked) =>
                      setCartConfig((prev) => ({
                        ...prev,
                        recommendationEngine: checked,
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <div className="lg:col-span-1">
              <Button className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Save Cart Configuration
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <h3 className="text-xl font-semibold">
            Sales Optimization Analytics
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Bundle Revenue
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      $67,697
                    </p>
                    <p className="text-sm text-green-600">+23% vs last month</p>
                  </div>
                  <Package className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Upsell Revenue
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      $14,160
                    </p>
                    <p className="text-sm text-green-600">+18% vs last month</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Cross-sell Revenue
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      $38,931
                    </p>
                    <p className="text-sm text-green-600">+31% vs last month</p>
                  </div>
                  <Target className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Avg Order Value
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      $127.45
                    </p>
                    <p className="text-sm text-green-600">+12% vs last month</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Bundles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bundles.slice(0, 5).map((bundle, index) => (
                    <div
                      key={bundle.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            #{index + 1}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{bundle.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {bundle.performance.conversions} conversions
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {formatCurrency(bundle.performance.revenue)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatPercent(bundle.performance.conversionRate)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Upsells</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upsellRules.slice(0, 5).map((rule, index) => (
                    <div
                      key={rule.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-green-600">
                            #{index + 1}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{rule.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {rule.performance.conversions} conversions
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {formatCurrency(rule.performance.revenue)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatPercent(rule.performance.conversionRate)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Bundle Creation/Edit Dialog */}
      <Dialog open={showBundleDialog} onOpenChange={setShowBundleDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingBundle?.id.startsWith("bundle_") &&
              bundles.find((b) => b.id === editingBundle.id)
                ? "Edit Bundle"
                : "Create New Bundle"}
            </DialogTitle>
            <DialogDescription>
              Configure your product bundle with pricing, products, and
              targeting options
            </DialogDescription>
          </DialogHeader>

          {editingBundle && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Bundle Name</Label>
                  <Input
                    value={editingBundle.name}
                    onChange={(e) =>
                      setEditingBundle((prev) =>
                        prev ? { ...prev, name: e.target.value } : null,
                      )
                    }
                    placeholder="e.g., Complete Heart Health Bundle"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select
                    value={editingBundle.category}
                    onValueChange={(value) =>
                      setEditingBundle((prev) =>
                        prev ? { ...prev, category: value } : null,
                      )
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cardiovascular">
                        Cardiovascular
                      </SelectItem>
                      <SelectItem value="Diabetes">Diabetes</SelectItem>
                      <SelectItem value="Mental Health">
                        Mental Health
                      </SelectItem>
                      <SelectItem value="Women's Health">
                        Women's Health
                      </SelectItem>
                      <SelectItem value="Men's Health">Men's Health</SelectItem>
                      <SelectItem value="General Wellness">
                        General Wellness
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={editingBundle.description}
                  onChange={(e) =>
                    setEditingBundle((prev) =>
                      prev ? { ...prev, description: e.target.value } : null,
                    )
                  }
                  placeholder="Describe the bundle and its benefits..."
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Original Price</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <span>$</span>
                    <Input
                      type="number"
                      step="0.01"
                      value={editingBundle.originalPrice}
                      onChange={(e) => {
                        const originalPrice = parseFloat(e.target.value) || 0;
                        setEditingBundle((prev) => {
                          if (!prev) return null;
                          const savings = originalPrice - prev.bundlePrice;
                          const discountPercentage =
                            originalPrice > 0
                              ? (savings / originalPrice) * 100
                              : 0;
                          return {
                            ...prev,
                            originalPrice,
                            savings: Math.max(0, savings),
                            discountPercentage: Math.max(0, discountPercentage),
                          };
                        });
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const total = editingBundle.productIds.reduce(
                          (sum, productId) => {
                            const product = availableProducts.find(
                              (p) => p.id === productId,
                            );
                            return sum + (product?.price || 0);
                          },
                          0,
                        );
                        setEditingBundle((prev) => {
                          if (!prev) return null;
                          const savings = total - prev.bundlePrice;
                          const discountPercentage =
                            total > 0 ? (savings / total) * 100 : 0;
                          return {
                            ...prev,
                            originalPrice: total,
                            savings: Math.max(0, savings),
                            discountPercentage: Math.max(0, discountPercentage),
                          };
                        });
                      }}
                      title="Calculate from selected products"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Selected products total: $
                    {editingBundle.productIds
                      .reduce((sum, productId) => {
                        const product = availableProducts.find(
                          (p) => p.id === productId,
                        );
                        return sum + (product?.price || 0);
                      }, 0)
                      .toFixed(2)}
                  </p>
                </div>
                <div>
                  <Label>Bundle Price</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <span>$</span>
                    <Input
                      type="number"
                      step="0.01"
                      value={editingBundle.bundlePrice}
                      onChange={(e) => {
                        const bundlePrice = parseFloat(e.target.value) || 0;
                        setEditingBundle((prev) => {
                          if (!prev) return null;
                          const savings = prev.originalPrice - bundlePrice;
                          const discountPercentage =
                            prev.originalPrice > 0
                              ? (savings / prev.originalPrice) * 100
                              : 0;
                          return {
                            ...prev,
                            bundlePrice,
                            savings: Math.max(0, savings),
                            discountPercentage: Math.max(0, discountPercentage),
                          };
                        });
                      }}
                    />
                  </div>
                </div>
                <div>
                  <Label>Savings</Label>
                  <div className="mt-1 p-2 bg-green-50 dark:bg-green-900/20 rounded border">
                    <div className="text-lg font-semibold text-green-600">
                      ${editingBundle.savings.toFixed(2)} (
                      {editingBundle.discountPercentage.toFixed(1)}%)
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Assignment Section */}
              <div>
                <Label className="text-lg font-semibold">Bundle Products</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Select products to include in this bundle
                </p>

                <div className="border rounded-lg p-4">
                  {/* Currently Selected Products */}
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">
                      Selected Products ({editingBundle.productIds.length})
                    </h4>
                    {editingBundle.productIds.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {editingBundle.productIds.map((productId, index) => {
                          const product = availableProducts.find(
                            (p) => p.id === productId,
                          );
                          if (!product) return null;

                          return (
                            <div
                              key={productId}
                              className="flex items-center justify-between p-3 border rounded-lg bg-blue-50 dark:bg-blue-900/20"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                                  <Pill className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                  <div className="font-medium text-sm">
                                    {product.name}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {product.category} • ${product.price}
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingBundle((prev) =>
                                    prev
                                      ? {
                                          ...prev,
                                          productIds: prev.productIds.filter(
                                            (id) => id !== productId,
                                          ),
                                        }
                                      : null,
                                  );
                                }}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                        <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No products selected yet</p>
                        <p className="text-sm">
                          Choose products from the catalog below
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Product Catalog for Selection */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Available Products</h4>
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 w-48"
                          />
                        </div>
                        <Select
                          value={selectedType}
                          onValueChange={setSelectedType}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="prescription">
                              Prescription
                            </SelectItem>
                            <SelectItem value="otc">OTC</SelectItem>
                            <SelectItem value="supplement">
                              Supplement
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="max-h-64 overflow-y-auto border rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2">
                        {availableProducts
                          .filter((product) => {
                            const matchesSearch =
                              !searchQuery ||
                              product.name
                                .toLowerCase()
                                .includes(searchQuery.toLowerCase()) ||
                              product.category
                                .toLowerCase()
                                .includes(searchQuery.toLowerCase());
                            const matchesType =
                              selectedType === "all" ||
                              product.type === selectedType;
                            const notSelected =
                              !editingBundle.productIds.includes(product.id);
                            return matchesSearch && matchesType && notSelected;
                          })
                          .slice(0, 20) // Limit for performance
                          .map((product) => (
                            <div
                              key={product.id}
                              className="flex items-center justify-between p-2 border rounded hover:bg-accent cursor-pointer"
                              onClick={() => {
                                setEditingBundle((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        productIds: [
                                          ...prev.productIds,
                                          product.id,
                                        ],
                                      }
                                    : null,
                                );
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                                  <Pill className="w-3 h-3 text-gray-600" />
                                </div>
                                <div>
                                  <div className="font-medium text-sm">
                                    {product.name}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {product.category}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">
                                  ${product.price}
                                </span>
                                <Button variant="ghost" size="sm">
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                      </div>

                      {availableProducts.filter((product) => {
                        const matchesSearch =
                          !searchQuery ||
                          product.name
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()) ||
                          product.category
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase());
                        const matchesType =
                          selectedType === "all" ||
                          product.type === selectedType;
                        const notSelected = !editingBundle.productIds.includes(
                          product.id,
                        );
                        return matchesSearch && matchesType && notSelected;
                      }).length === 0 && (
                        <div className="text-center py-4 text-muted-foreground">
                          <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>No products found</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Add Suggestions */}
                  {editingBundle.productIds.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Suggested Add-ons</h4>
                      <div className="flex flex-wrap gap-2">
                        {[
                          {
                            id: "pill_organizer",
                            name: "Pill Organizer",
                            price: 12.99,
                          },
                          {
                            id: "medication_reminder",
                            name: "Medication Reminder App",
                            price: 4.99,
                          },
                          {
                            id: "blood_pressure_cuff",
                            name: "Blood Pressure Monitor",
                            price: 59.99,
                          },
                          {
                            id: "glucose_strips",
                            name: "Test Strips (50 count)",
                            price: 24.99,
                          },
                        ]
                          .filter(
                            (suggestion) =>
                              !editingBundle.productIds.includes(suggestion.id),
                          )
                          .slice(0, 3)
                          .map((suggestion) => (
                            <Button
                              key={suggestion.id}
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingBundle((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        productIds: [
                                          ...prev.productIds,
                                          suggestion.id,
                                        ],
                                      }
                                    : null,
                                );
                              }}
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              {suggestion.name} (${suggestion.price})
                            </Button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label>Target Conditions</Label>
                <div className="mt-1 space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {editingBundle.targetConditions.map((condition, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        {condition}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0"
                          onClick={() => {
                            setEditingBundle((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    targetConditions:
                                      prev.targetConditions.filter(
                                        (_, i) => i !== index,
                                      ),
                                  }
                                : null,
                            );
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add target condition..."
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          const value = e.currentTarget.value.trim();
                          if (
                            value &&
                            !editingBundle.targetConditions.includes(value)
                          ) {
                            setEditingBundle((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    targetConditions: [
                                      ...prev.targetConditions,
                                      value,
                                    ],
                                  }
                                : null,
                            );
                            e.currentTarget.value = "";
                          }
                        }
                      }}
                    />
                    <Button variant="outline" size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={editingBundle.clinicallyRecommended}
                  onCheckedChange={(checked) =>
                    setEditingBundle((prev) =>
                      prev ? { ...prev, clinicallyRecommended: checked } : null,
                    )
                  }
                />
                <Label>Clinically Recommended</Label>
              </div>

              <div>
                <Label>Status</Label>
                <Select
                  value={editingBundle.status}
                  onValueChange={(value: "active" | "draft" | "paused") =>
                    setEditingBundle((prev) =>
                      prev ? { ...prev, status: value } : null,
                    )
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowBundleDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={saveBundle}>
              <Save className="w-4 h-4 mr-2" />
              Save Bundle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upsell Rule Creation/Edit Dialog */}
      <Dialog open={showUpsellDialog} onOpenChange={setShowUpsellDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingUpsell?.id.startsWith("upsell_") &&
              upsellRules.find((u) => u.id === editingUpsell.id)
                ? "Edit Upsell Rule"
                : "Create New Upsell Rule"}
            </DialogTitle>
            <DialogDescription>
              Configure when and how to present upsell offers to customers
            </DialogDescription>
          </DialogHeader>

          {editingUpsell && (
            <div className="space-y-4">
              <div>
                <Label>Rule Name</Label>
                <Input
                  value={editingUpsell.name}
                  onChange={(e) =>
                    setEditingUpsell((prev) =>
                      prev ? { ...prev, name: e.target.value } : null,
                    )
                  }
                  placeholder="e.g., 90-Day Supply Upgrade"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Trigger Product</Label>
                  <Input
                    value={editingUpsell.triggerProduct}
                    onChange={(e) =>
                      setEditingUpsell((prev) =>
                        prev
                          ? { ...prev, triggerProduct: e.target.value }
                          : null,
                      )
                    }
                    placeholder="Product that triggers this upsell"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Target Product</Label>
                  <Input
                    value={editingUpsell.targetProduct}
                    onChange={(e) =>
                      setEditingUpsell((prev) =>
                        prev
                          ? { ...prev, targetProduct: e.target.value }
                          : null,
                      )
                    }
                    placeholder="Product to upsell to"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Offer Type</Label>
                  <Select
                    value={editingUpsell.offer.type}
                    onValueChange={(value: "discount" | "upgrade" | "addon") =>
                      setEditingUpsell((prev) =>
                        prev
                          ? {
                              ...prev,
                              offer: { ...prev.offer, type: value },
                            }
                          : null,
                      )
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="discount">Discount</SelectItem>
                      <SelectItem value="upgrade">Upgrade</SelectItem>
                      <SelectItem value="addon">Add-on</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Offer Value</Label>
                  <Input
                    type="number"
                    value={editingUpsell.offer.value}
                    onChange={(e) =>
                      setEditingUpsell((prev) =>
                        prev
                          ? {
                              ...prev,
                              offer: {
                                ...prev.offer,
                                value: parseFloat(e.target.value) || 0,
                              },
                            }
                          : null,
                      )
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Priority</Label>
                  <Input
                    type="number"
                    value={editingUpsell.priority}
                    onChange={(e) =>
                      setEditingUpsell((prev) =>
                        prev
                          ? { ...prev, priority: parseInt(e.target.value) || 1 }
                          : null,
                      )
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label>Offer Description</Label>
                <Textarea
                  value={editingUpsell.offer.description}
                  onChange={(e) =>
                    setEditingUpsell((prev) =>
                      prev
                        ? {
                            ...prev,
                            offer: {
                              ...prev.offer,
                              description: e.target.value,
                            },
                          }
                        : null,
                    )
                  }
                  placeholder="Describe the upsell offer..."
                  rows={2}
                  className="mt-1"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={editingUpsell.isActive}
                  onCheckedChange={(checked) =>
                    setEditingUpsell((prev) =>
                      prev ? { ...prev, isActive: checked } : null,
                    )
                  }
                />
                <Label>Active</Label>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowUpsellDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={saveUpsellRule}>
              <Save className="w-4 h-4 mr-2" />
              Save Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cross-sell Rule Creation/Edit Dialog */}
      <Dialog open={showCrossSellDialog} onOpenChange={setShowCrossSellDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {editingCrossSell?.id.startsWith("crosssell_") &&
              crossSellRules.find((c) => c.id === editingCrossSell.id)
                ? "Edit Cross-sell Rule"
                : "Create New Cross-sell Rule"}
            </DialogTitle>
            <DialogDescription>
              Configure product combinations and cross-selling recommendations
            </DialogDescription>
          </DialogHeader>

          {editingCrossSell && (
            <div className="space-y-4">
              <div>
                <Label>Rule Name</Label>
                <Input
                  value={editingCrossSell.name}
                  onChange={(e) =>
                    setEditingCrossSell((prev) =>
                      prev ? { ...prev, name: e.target.value } : null,
                    )
                  }
                  placeholder="e.g., Heart Health Combo"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Bundle Price</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <span>$</span>
                    <Input
                      type="number"
                      step="0.01"
                      value={editingCrossSell.combination.bundlePrice}
                      onChange={(e) =>
                        setEditingCrossSell((prev) =>
                          prev
                            ? {
                                ...prev,
                                combination: {
                                  ...prev.combination,
                                  bundlePrice: parseFloat(e.target.value) || 0,
                                },
                              }
                            : null,
                        )
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label>Savings</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <span>$</span>
                    <Input
                      type="number"
                      step="0.01"
                      value={editingCrossSell.combination.savings}
                      onChange={(e) =>
                        setEditingCrossSell((prev) =>
                          prev
                            ? {
                                ...prev,
                                combination: {
                                  ...prev.combination,
                                  savings: parseFloat(e.target.value) || 0,
                                },
                              }
                            : null,
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Purchase Frequency (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={editingCrossSell.conditions.frequency}
                    onChange={(e) =>
                      setEditingCrossSell((prev) =>
                        prev
                          ? {
                              ...prev,
                              conditions: {
                                ...prev.conditions,
                                frequency: parseInt(e.target.value) || 0,
                              },
                            }
                          : null,
                      )
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Clinical Relevance (1-10)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={editingCrossSell.conditions.clinicalRelevance}
                    onChange={(e) =>
                      setEditingCrossSell((prev) =>
                        prev
                          ? {
                              ...prev,
                              conditions: {
                                ...prev.conditions,
                                clinicalRelevance:
                                  parseInt(e.target.value) || 5,
                              },
                            }
                          : null,
                      )
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label>Clinical Reasoning</Label>
                <Textarea
                  value={editingCrossSell.combination.clinicalReason}
                  onChange={(e) =>
                    setEditingCrossSell((prev) =>
                      prev
                        ? {
                            ...prev,
                            combination: {
                              ...prev.combination,
                              clinicalReason: e.target.value,
                            },
                          }
                        : null,
                    )
                  }
                  placeholder="Explain the clinical benefit of this combination..."
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={editingCrossSell.isActive}
                  onCheckedChange={(checked) =>
                    setEditingCrossSell((prev) =>
                      prev ? { ...prev, isActive: checked } : null,
                    )
                  }
                />
                <Label>Active</Label>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCrossSellDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={saveCrossSellRule}>
              <Save className="w-4 h-4 mr-2" />
              Save Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
