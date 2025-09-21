// Shopping Cart Types and Data for Medical Ecommerce

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  genericName?: string;
  brand?: string;
  dosage: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productType: "prescription" | "otc" | "supplement" | "device" | "bundle";
  prescriptionRequired: boolean;
  category: string;
  image?: string;

  // Subscription/Refill info
  isSubscription: boolean;
  subscriptionFrequency?: "weekly" | "monthly" | "quarterly" | "custom";
  refillsRemaining?: number;
  maxRefills?: number;
  autoRefill: boolean;
  nextRefillDate?: string;

  // Bundling
  bundleId?: string;
  bundleDiscount?: number;
  bundleItems?: string[];

  // Medical specific
  prescriberId?: string;
  prescriberName?: string;
  pharmacyId?: string;
  pharmacyName?: string;
  daysSupply?: number;
  instructions?: string;

  // Shipping & Insurance
  shippingMethod: "standard" | "express" | "overnight" | "pickup";
  insuranceCovered: boolean;
  copay?: number;
  deductible?: number;
  savings?: number;

  // AI recommendations
  aiRecommended: boolean;
  confidenceScore?: number;
  alternativeOptions?: AlternativeProduct[];
}

export interface AlternativeProduct {
  id: string;
  name: string;
  price: number;
  savings: number;
  reason: string;
  type: "generic" | "brand" | "alternative" | "supplement";
}

export interface Bundle {
  id: string;
  name: string;
  description: string;
  category: string;
  productIds: string[];
  originalPrice: number;
  bundlePrice: number;
  savings: number;
  discountPercentage: number;
  popularityRank: number;
  clinicallyRecommended: boolean;
  image: string;
  benefits: string[];
  duration: string;
  targetCondition: string[];
}

export interface Promotion {
  id: string;
  type:
    | "discount"
    | "bogo"
    | "free_shipping"
    | "bundle"
    | "loyalty"
    | "first_time";
  title: string;
  description: string;
  discountType: "percentage" | "fixed" | "free_item" | "shipping";
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  applicableProducts?: string[];
  applicableCategories?: string[];
  expiryDate: string;
  usageLimit?: number;
  userLimit?: number;
  code?: string;
  autoApply: boolean;
  priority: number;
}

export interface CartSummary {
  subtotal: number;
  discounts: number;
  shipping: number;
  tax: number;
  insurance: number;
  copays: number;
  totalSavings: number;
  finalTotal: number;
  estimatedDelivery: string;
  loyaltyPointsEarned: number;
}

export interface Upsell {
  id: string;
  title: string;
  description: string;
  productId: string;
  productName: string;
  originalPrice: number;
  upsellPrice: number;
  savings: number;
  type: "related" | "upgrade" | "bundle" | "complement" | "refill_optimization";
  urgency: "low" | "medium" | "high";
  clinicalBenefit: string;
  acceptanceRate: number;
  image: string;
}

export interface CrossSell {
  id: string;
  title: string;
  description: string;
  products: {
    id: string;
    name: string;
    price: number;
    image: string;
  }[];
  totalPrice: number;
  bundlePrice: number;
  savings: number;
  clinicalReason: string;
  popularity: number;
  type:
    | "frequently_bought"
    | "clinically_recommended"
    | "seasonal"
    | "lifestyle";
}

// Sample Data
export const SAMPLE_BUNDLES: Bundle[] = [
  {
    id: "heart_health_bundle",
    name: "Complete Heart Health Bundle",
    description:
      "Comprehensive cardiovascular support with prescription and supplements",
    category: "Cardiovascular",
    productIds: [
      "atorvastatin_20mg",
      "coq10_100mg",
      "omega3_1000mg",
      "blood_pressure_monitor",
    ],
    originalPrice: 289.99,
    bundlePrice: 219.99,
    savings: 70.0,
    discountPercentage: 24,
    popularityRank: 1,
    clinicallyRecommended: true,
    image: "/bundles/heart-health.jpg",
    benefits: [
      "Lower cholesterol by up to 50%",
      "Support heart muscle function",
      "Reduce inflammation",
      "Monitor progress at home",
    ],
    duration: "3 months supply",
    targetCondition: [
      "High Cholesterol",
      "Hypertension",
      "Cardiovascular Disease",
    ],
  },
  {
    id: "diabetes_management_bundle",
    name: "Diabetes Management Kit",
    description:
      "Complete diabetes care with medication, testing supplies, and support",
    category: "Endocrinology",
    productIds: [
      "metformin_500mg",
      "glucose_strips",
      "glucose_meter",
      "alpha_lipoic_acid",
    ],
    originalPrice: 234.99,
    bundlePrice: 179.99,
    savings: 55.0,
    discountPercentage: 23,
    popularityRank: 2,
    clinicallyRecommended: true,
    image: "/bundles/diabetes-kit.jpg",
    benefits: [
      "Better blood sugar control",
      "Daily monitoring made easy",
      "Antioxidant support",
      "Convenient all-in-one kit",
    ],
    duration: "1 month supply",
    targetCondition: ["Type 2 Diabetes", "Pre-diabetes", "Metabolic Syndrome"],
  },
  {
    id: "womens_wellness_bundle",
    name: "Women's Wellness Package",
    description: "Hormonal balance and reproductive health support",
    category: "Women's Health",
    productIds: [
      "birth_control",
      "prenatal_vitamins",
      "iron_supplement",
      "probiotics",
    ],
    originalPrice: 156.99,
    bundlePrice: 119.99,
    savings: 37.0,
    discountPercentage: 24,
    popularityRank: 3,
    clinicallyRecommended: true,
    image: "/bundles/womens-wellness.jpg",
    benefits: [
      "Hormone regulation support",
      "Essential nutrients for women",
      "Gut health optimization",
      "Reproductive wellness",
    ],
    duration: "1 month supply",
    targetCondition: ["Hormonal Imbalance", "PCOS", "Reproductive Health"],
  },
];

export const SAMPLE_PROMOTIONS: Promotion[] = [
  {
    id: "first_time_20",
    type: "first_time",
    title: "Welcome Bonus",
    description: "20% off your first order + free shipping",
    discountType: "percentage",
    value: 20,
    minPurchase: 50,
    maxDiscount: 100,
    expiryDate: "2024-12-31",
    autoApply: true,
    priority: 1,
  },
  {
    id: "bundle_save_30",
    type: "bundle",
    title: "Bundle & Save",
    description: "Extra 30% off when you buy 3+ items",
    discountType: "percentage",
    value: 30,
    minPurchase: 150,
    applicableCategories: ["bundles"],
    expiryDate: "2024-06-30",
    autoApply: true,
    priority: 2,
  },
  {
    id: "loyalty_free_shipping",
    type: "loyalty",
    title: "Loyalty Reward",
    description: "Free express shipping for loyalty members",
    discountType: "shipping",
    value: 15.99,
    expiryDate: "2024-12-31",
    autoApply: true,
    priority: 3,
  },
];

export const SAMPLE_UPSELLS: Upsell[] = [
  {
    id: "upgrade_to_90_day",
    title: "Upgrade to 90-Day Supply",
    description: "Save 25% and never run out",
    productId: "generic_medication",
    productName: "90-Day Supply",
    originalPrice: 89.97,
    upsellPrice: 67.48,
    savings: 22.49,
    type: "upgrade",
    urgency: "medium",
    clinicalBenefit: "Better medication adherence with longer supplies",
    acceptanceRate: 78,
    image: "/upsells/90-day-supply.jpg",
  },
  {
    id: "add_blood_pressure_monitor",
    title: "Monitor Your Progress",
    description: "Track your heart health at home",
    productId: "blood_pressure_monitor",
    productName: "Digital Blood Pressure Monitor",
    originalPrice: 79.99,
    upsellPrice: 59.99,
    savings: 20.0,
    type: "complement",
    urgency: "high",
    clinicalBenefit: "Early detection of blood pressure changes",
    acceptanceRate: 65,
    image: "/upsells/bp-monitor.jpg",
  },
  {
    id: "automatic_refills",
    title: "Set Up Auto-Refill",
    description: "Never miss a dose again",
    productId: "auto_refill_service",
    productName: "Auto-Refill Service",
    originalPrice: 4.99,
    upsellPrice: 0.0,
    savings: 4.99,
    type: "refill_optimization",
    urgency: "low",
    clinicalBenefit: "Improved medication adherence and health outcomes",
    acceptanceRate: 85,
    image: "/upsells/auto-refill.jpg",
  },
];

export const SAMPLE_CROSS_SELLS: CrossSell[] = [
  {
    id: "frequently_bought_with_statins",
    title: "Frequently Bought Together",
    description: "Patients taking statins often add these supplements",
    products: [
      {
        id: "coq10_100mg",
        name: "CoQ10 100mg",
        price: 29.99,
        image: "/products/coq10.jpg",
      },
      {
        id: "omega3_1000mg",
        name: "Omega-3 1000mg",
        price: 24.99,
        image: "/products/omega3.jpg",
      },
      {
        id: "vitamin_d3",
        name: "Vitamin D3 2000IU",
        price: 19.99,
        image: "/products/vitamin-d.jpg",
      },
    ],
    totalPrice: 74.97,
    bundlePrice: 59.99,
    savings: 14.98,
    clinicalReason:
      "Supports muscle health and reduces statin-related side effects",
    popularity: 89,
    type: "frequently_bought",
  },
  {
    id: "diabetes_support_supplements",
    title: "Complete Diabetes Support",
    description: "Enhance your diabetes management",
    products: [
      {
        id: "alpha_lipoic_acid",
        name: "Alpha Lipoic Acid",
        price: 34.99,
        image: "/products/ala.jpg",
      },
      {
        id: "chromium_picolinate",
        name: "Chromium Picolinate",
        price: 19.99,
        image: "/products/chromium.jpg",
      },
      {
        id: "berberine_500mg",
        name: "Berberine 500mg",
        price: 39.99,
        image: "/products/berberine.jpg",
      },
    ],
    totalPrice: 94.97,
    bundlePrice: 74.99,
    savings: 19.98,
    clinicalReason: "Natural blood sugar support and antioxidant protection",
    popularity: 76,
    type: "clinically_recommended",
  },
];

// Cart utilities
export class CartCalculator {
  static calculateItemTotal(item: CartItem): number {
    let total = item.unitPrice * item.quantity;

    // Apply bundle discount
    if (item.bundleDiscount) {
      total = total * (1 - item.bundleDiscount / 100);
    }

    return Math.round(total * 100) / 100;
  }

  static calculateCartSummary(
    items: CartItem[],
    promotions: Promotion[] = [],
  ): CartSummary {
    const subtotal = items.reduce(
      (sum, item) => sum + this.calculateItemTotal(item),
      0,
    );

    // Calculate discounts
    let discounts = 0;
    const applicablePromotions = promotions.filter(
      (promo) => promo.autoApply && subtotal >= (promo.minPurchase || 0),
    );

    applicablePromotions.forEach((promo) => {
      if (promo.discountType === "percentage") {
        const discount = Math.min(
          subtotal * (promo.value / 100),
          promo.maxDiscount || subtotal,
        );
        discounts += discount;
      } else if (promo.discountType === "fixed") {
        discounts += promo.value;
      }
    });

    // Calculate shipping
    const hasExpressShipping = items.some(
      (item) => item.shippingMethod === "express",
    );
    const hasOvernightShipping = items.some(
      (item) => item.shippingMethod === "overnight",
    );
    const freeShippingPromo = applicablePromotions.some(
      (promo) => promo.discountType === "shipping",
    );

    let shipping = 0;
    if (!freeShippingPromo) {
      if (hasOvernightShipping) shipping = 25.99;
      else if (hasExpressShipping) shipping = 15.99;
      else if (subtotal < 50) shipping = 7.99;
    }

    // Calculate insurance and copays
    const copays = items.reduce((sum, item) => sum + (item.copay || 0), 0);
    const insurance = items.reduce(
      (sum, item) =>
        sum +
        (item.insuranceCovered ? item.unitPrice * item.quantity * 0.8 : 0),
      0,
    );

    // Calculate tax (simplified)
    const tax = (subtotal - discounts) * 0.08;

    const finalTotal =
      subtotal - discounts + shipping + tax - insurance + copays;

    return {
      subtotal,
      discounts,
      shipping,
      tax,
      insurance,
      copays,
      totalSavings: discounts + insurance,
      finalTotal: Math.max(0, finalTotal),
      estimatedDelivery: hasOvernightShipping
        ? "Tomorrow"
        : hasExpressShipping
          ? "2-3 days"
          : "3-5 days",
      loyaltyPointsEarned: Math.floor(finalTotal / 10),
    };
  }
}
