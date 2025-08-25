import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Separator } from "./ui/separator";
import {
  Percent,
  Gift,
  Star,
  Trophy,
  Target,
  Zap,
  Calendar,
  CreditCard,
  Copy,
  Check,
  Download,
  Share,
  AlertCircle,
  TrendingUp,
  Users,
  Clock,
  Sparkles,
  Tag,
  Scissors,
  DollarSign,
  Plus,
  Settings,
  RefreshCw,
  Eye,
  EyeOff,
  ShoppingCart,
  Heart,
  Activity,
  Shield,
} from "lucide-react";

// Medication Categories
const medicationCategories = {
  weightLoss: {
    name: "Medical Weight Loss (GLP-1s)",
    icon: Activity,
    color: "#10b981",
    medications: [
      { name: "Semaglutide (Ozempic)", price: 850, rebateEligible: true },
      { name: "Tirzepatide (Mounjaro)", price: 950, rebateEligible: true },
      { name: "Liraglutide (Saxenda)", price: 750, rebateEligible: true },
      { name: "Dulaglutide (Trulicity)", price: 800, rebateEligible: true },
    ],
  },
  mensED: {
    name: "Men's ED Treatment",
    icon: Heart,
    color: "#ef4444",
    medications: [
      { name: "Sildenafil (Viagra)", price: 120, rebateEligible: true },
      { name: "Tadalafil (Cialis)", price: 140, rebateEligible: true },
      { name: "Vardenafil (Levitra)", price: 130, rebateEligible: true },
      { name: "Avanafil (Stendra)", price: 150, rebateEligible: true },
    ],
  },
  nadPlus: {
    name: "NAD+ Supplements",
    icon: Zap,
    color: "#f59e0b",
    medications: [
      { name: "NAD+ IV Therapy", price: 300, rebateEligible: true },
      { name: "Nicotinamide Riboside", price: 80, rebateEligible: true },
      { name: "NAD+ Sublingual", price: 120, rebateEligible: true },
      {
        name: "NMN (Nicotinamide Mononucleotide)",
        price: 100,
        rebateEligible: true,
      },
    ],
  },
  skinCare: {
    name: "Prescription Skin Care",
    icon: Sparkles,
    color: "#8b5cf6",
    medications: [
      { name: "Tretinoin Cream", price: 60, rebateEligible: true },
      { name: "Hydroquinone", price: 45, rebateEligible: true },
      { name: "Clindamycin Gel", price: 35, rebateEligible: true },
      { name: "Azelaic Acid", price: 50, rebateEligible: true },
    ],
  },
  hairGrowth: {
    name: "Hair Growth Treatment",
    icon: Shield,
    color: "#06b6d4",
    medications: [
      { name: "Finasteride", price: 25, rebateEligible: true },
      { name: "Minoxidil Solution", price: 30, rebateEligible: true },
      { name: "Dutasteride", price: 35, rebateEligible: true },
      { name: "Biotin Complex", price: 20, rebateEligible: false },
    ],
  },
};

// Rebate Rules Engine
const rebateRules = [
  {
    id: "first_time",
    name: "First Time Customer",
    description: "20% off first purchase",
    discount: 20,
    type: "percentage",
    minPurchase: 50,
    maxDiscount: 100,
    eligibleCategories: ["all"],
    conditions: ["first_purchase"],
    active: true,
  },
  {
    id: "bulk_glp1",
    name: "GLP-1 3-Month Supply",
    description: "15% off 3-month GLP-1 supply",
    discount: 15,
    type: "percentage",
    minPurchase: 2000,
    maxDiscount: 400,
    eligibleCategories: ["weightLoss"],
    conditions: ["quantity_3_months"],
    active: true,
  },
  {
    id: "combo_mens_health",
    name: "Men's Health Bundle",
    description: "$50 off ED + Hair Growth combo",
    discount: 50,
    type: "fixed",
    minPurchase: 200,
    maxDiscount: 50,
    eligibleCategories: ["mensED", "hairGrowth"],
    conditions: ["multi_category"],
    active: true,
  },
  {
    id: "loyalty_tier",
    name: "VIP Member Discount",
    description: "10% off for VIP members",
    discount: 10,
    type: "percentage",
    minPurchase: 100,
    maxDiscount: 200,
    eligibleCategories: ["all"],
    conditions: ["vip_member"],
    active: true,
  },
  {
    id: "seasonal_skincare",
    name: "Skincare Season Special",
    description: "25% off skincare products",
    discount: 25,
    type: "percentage",
    minPurchase: 80,
    maxDiscount: 75,
    eligibleCategories: ["skinCare"],
    conditions: ["seasonal"],
    active: true,
  },
];

// Coupon Generator Component
const CouponGenerator = ({
  rebate,
  customerInfo,
  onGenerate,
}: {
  rebate: any;
  customerInfo: any;
  onGenerate: (coupon: any) => void;
}) => {
  const [generatedCoupon, setGeneratedCoupon] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const generateCouponCode = () => {
    const prefix = rebate.type === "percentage" ? "PCT" : "FIX";
    const random = Math.random().toString(36).substr(2, 8).toUpperCase();
    return `${prefix}${rebate.discount}${random}`;
  };

  const handleGenerate = () => {
    const coupon = {
      id: Date.now().toString(),
      code: generateCouponCode(),
      rebateId: rebate.id,
      customerEmail: customerInfo.email,
      discount: rebate.discount,
      type: rebate.type,
      minPurchase: rebate.minPurchase,
      maxDiscount: rebate.maxDiscount,
      eligibleCategories: rebate.eligibleCategories,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      issuedAt: new Date(),
      used: false,
      usageLimit: 1,
    };

    setGeneratedCoupon(coupon);
    onGenerate(coupon);
  };

  const copyToClipboard = async () => {
    if (generatedCoupon) {
      await navigator.clipboard.writeText(generatedCoupon.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      {!generatedCoupon ? (
        <Button onClick={handleGenerate} className="w-full gap-2">
          <Gift className="w-4 h-4" />
          Generate Coupon
        </Button>
      ) : (
        <Card className="border-2 border-dashed border-primary bg-gradient-to-r from-primary/5 to-blue/5">
          <CardContent className="p-4">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2">
                <Scissors className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg">Your Coupon</h3>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-dashed">
                <div className="text-2xl font-mono font-bold text-primary mb-2">
                  {generatedCoupon.code}
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {rebate.description}
                </p>
                <div className="flex justify-center gap-2">
                  <Button size="sm" variant="outline" onClick={copyToClipboard}>
                    {copied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    {copied ? "Copied!" : "Copy Code"}
                  </Button>
                  <Button size="sm" variant="outline">
                    <Share className="w-4 h-4 mr-1" />
                    Share
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div>
                  <span className="font-medium">Min Purchase:</span>
                  <br />${generatedCoupon.minPurchase}
                </div>
                <div>
                  <span className="font-medium">Expires:</span>
                  <br />
                  {generatedCoupon.expiresAt.toLocaleDateString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Rebate Calculator
const RebateCalculator = ({
  cart,
  customerProfile,
}: {
  cart: any[];
  customerProfile: any;
}) => {
  const [applicableRebates, setApplicableRebates] = useState<any[]>([]);
  const [totalSavings, setTotalSavings] = useState(0);

  useEffect(() => {
    calculateRebates();
  }, [cart, customerProfile]);

  const calculateRebates = () => {
    const cartTotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const cartCategories = [...new Set(cart.map((item) => item.category))];

    const applicable = rebateRules.filter((rule) => {
      if (!rule.active) return false;

      // Check minimum purchase
      if (cartTotal < rule.minPurchase) return false;

      // Check category eligibility
      if (!rule.eligibleCategories.includes("all")) {
        const hasEligibleCategory = cartCategories.some((cat) =>
          rule.eligibleCategories.includes(cat),
        );
        if (!hasEligibleCategory) return false;
      }

      // Check conditions
      if (
        rule.conditions.includes("first_purchase") &&
        !customerProfile.isFirstTime
      )
        return false;
      if (rule.conditions.includes("vip_member") && !customerProfile.isVIP)
        return false;
      if (
        rule.conditions.includes("multi_category") &&
        cartCategories.length < 2
      )
        return false;

      return true;
    });

    setApplicableRebates(applicable);

    // Calculate total savings
    const savings = applicable.reduce((total, rebate) => {
      if (rebate.type === "percentage") {
        const discount = Math.min(
          cartTotal * (rebate.discount / 100),
          rebate.maxDiscount,
        );
        return total + discount;
      } else {
        return total + rebate.discount;
      }
    }, 0);

    setTotalSavings(savings);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Available Rebates</h3>
        <Badge variant="secondary">{applicableRebates.length} available</Badge>
      </div>

      {applicableRebates.length > 0 ? (
        <div className="space-y-3">
          {applicableRebates.map((rebate) => (
            <Card
              key={rebate.id}
              className="border-green-200 bg-green-50 dark:bg-green-900/20"
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Percent className="w-4 h-4 text-green-600" />
                    <div>
                      <p className="font-medium text-sm">{rebate.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {rebate.description}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-green-600">
                    {rebate.type === "percentage"
                      ? `${rebate.discount}%`
                      : `$${rebate.discount}`}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card className="border-primary bg-primary/5">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Total Potential Savings
                </p>
                <p className="text-2xl font-bold text-primary">
                  ${totalSavings.toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="p-4 text-center">
            <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No rebates available for current cart
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Main Rebate Engine Component
export function RebateEngine() {
  const [activeTab, setActiveTab] = useState("browse");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [cart, setCart] = useState<any[]>([]);
  const [generatedCoupons, setGeneratedCoupons] = useState<any[]>([]);
  const [customerProfile] = useState({
    email: "patient@example.com",
    isFirstTime: true,
    isVIP: false,
    purchaseHistory: [],
  });

  const addToCart = (medication: any, category: string) => {
    setCart((prev) => [
      ...prev,
      {
        ...medication,
        category,
        quantity: 1,
        id: Date.now(),
      },
    ]);
  };

  const handleCouponGenerated = (coupon: any) => {
    setGeneratedCoupons((prev) => [...prev, coupon]);
  };

  const tabs = [
    { id: "browse", label: "Browse Medications", icon: ShoppingCart },
    { id: "rebates", label: "Rebate Calculator", icon: Percent },
    { id: "coupons", label: "Generate Coupons", icon: Gift },
    { id: "analytics", label: "Rebate Analytics", icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="w-6 h-6 text-primary" />
            Pharmacy Rebate Engine & Coupon Generator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {rebateRules.filter((r) => r.active).length}
              </p>
              <p className="text-sm text-muted-foreground">Active Rebates</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                $
                {cart
                  .reduce((sum, item) => sum + item.price * item.quantity, 0)
                  .toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground">Cart Total</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {cart.length}
              </p>
              <p className="text-sm text-muted-foreground">Items in Cart</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {generatedCoupons.length}
              </p>
              <p className="text-sm text-muted-foreground">Generated Coupons</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 rounded-lg bg-muted p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all flex-1 justify-center ${
                activeTab === tab.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Browse Medications Tab */}
      {activeTab === "browse" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="grid gap-6">
              {Object.entries(medicationCategories).map(([key, category]) => {
                const Icon = category.icon;
                return (
                  <Card key={key}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Icon
                          className="w-5 h-5"
                          style={{ color: category.color }}
                        />
                        {category.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {category.medications.map((med, idx) => (
                          <div key={idx} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{med.name}</h4>
                              {med.rebateEligible && (
                                <Badge variant="secondary" className="text-xs">
                                  Rebate Eligible
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold text-primary">
                                ${med.price}
                              </span>
                              <Button
                                size="sm"
                                onClick={() => addToCart(med, key)}
                                className="gap-1"
                              >
                                <Plus className="w-3 h-3" />
                                Add to Cart
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Cart Sidebar */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Shopping Cart
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cart.length > 0 ? (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <div>
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <span className="font-bold">${item.price}</span>
                      </div>
                    ))}
                    <Separator />
                    <div className="flex items-center justify-between font-bold">
                      <span>Total:</span>
                      <span>
                        $
                        {cart
                          .reduce(
                            (sum, item) => sum + item.price * item.quantity,
                            0,
                          )
                          .toFixed(2)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    Cart is empty
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Rebate Calculator Tab */}
      {activeTab === "rebates" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RebateCalculator cart={cart} customerProfile={customerProfile} />

          <Card>
            <CardHeader>
              <CardTitle>Rebate Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {rebateRules.map((rule) => (
                  <div key={rule.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{rule.name}</h4>
                      <Badge variant={rule.active ? "default" : "secondary"}>
                        {rule.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {rule.description}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <span>Min Purchase: ${rule.minPurchase}</span>
                      <span>Max Discount: ${rule.maxDiscount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Generate Coupons Tab */}
      {activeTab === "coupons" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rebateRules
            .filter((rule) => rule.active)
            .map((rebate) => (
              <Card key={rebate.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="w-5 h-5 text-primary" />
                    {rebate.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {rebate.description}
                  </p>
                  <CouponGenerator
                    rebate={rebate}
                    customerInfo={customerProfile}
                    onGenerate={handleCouponGenerated}
                  />
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === "analytics" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Rebate Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">$12,450</p>
                  <p className="text-sm text-muted-foreground">
                    Total Rebates Issued
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">342</p>
                  <p className="text-sm text-muted-foreground">
                    Coupons Generated
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Weight Loss</span>
                  <span className="font-medium">45%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Men's ED</span>
                  <span className="font-medium">28%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Skin Care</span>
                  <span className="font-medium">15%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span>New GLP-1 rebate used</span>
                  <span className="text-muted-foreground">2 min ago</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>ED combo discount applied</span>
                  <span className="text-muted-foreground">5 min ago</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>First-time customer coupon</span>
                  <span className="text-muted-foreground">12 min ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
