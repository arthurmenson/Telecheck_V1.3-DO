// Product Catalog and Inventory Management Types and Data

export interface Product {
  id: string;
  name: string;
  genericName?: string;
  brand?: string;
  category: ProductCategory;
  type: 'prescription' | 'otc' | 'supplement' | 'device' | 'bundle';
  description: string;
  shortDescription: string;
  
  // Pricing
  price: number;
  compareAtPrice?: number;
  costPrice: number;
  
  // Inventory
  sku: string;
  stock: number;
  lowStockThreshold: number;
  reorderPoint: number;
  reorderQuantity: number;
  
  // Medical Information
  dosageForm: 'tablet' | 'capsule' | 'liquid' | 'injection' | 'topical' | 'inhaler' | 'device';
  strength?: string;
  dosages: string[];
  activeIngredients: string[];
  indications: string[];
  contraindications: string[];
  sideEffects: string[];
  interactions: string[];
  
  // Prescription Information
  prescriptionRequired: boolean;
  controlledSubstance?: boolean;
  dea_schedule?: 'I' | 'II' | 'III' | 'IV' | 'V';
  maxRefills?: number;
  daysSupply?: number[];
  
  // Product Details
  manufacturer: string;
  ndc?: string; // National Drug Code
  upc?: string;
  images: string[];
  rating: number;
  reviewCount: number;
  
  // Availability
  isActive: boolean;
  isDiscontinued: boolean;
  isOnBackorder: boolean;
  expectedRestockDate?: string;
  
  // SEO and Marketing
  metaTitle?: string;
  metaDescription?: string;
  tags: string[];
  features: string[];
  benefits: string[];
  
  // Shipping
  weight: number; // in grams
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  requiresRefrigeration: boolean;
  hazmat: boolean;
  
  // Created/Updated
  createdAt: string;
  updatedAt: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  parentId?: string;
  level: number;
  isActive: boolean;
  sortOrder: number;
  image?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  strength: string;
  dosageForm: string;
  packageSize: string;
  stock: number;
  image?: string;
  isDefault: boolean;
}

export interface InventoryTransaction {
  id: string;
  productId: string;
  variantId?: string;
  type: 'sale' | 'purchase' | 'adjustment' | 'return' | 'transfer' | 'waste';
  quantity: number;
  unitCost?: number;
  totalCost?: number;
  reason?: string;
  batchNumber?: string;
  expirationDate?: string;
  location?: string;
  userId: string;
  timestamp: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  leadTimeDays: number;
  minimumOrderValue: number;
  isActive: boolean;
  rating: number;
  paymentTerms: string;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  orderNumber: string;
  status: 'draft' | 'sent' | 'confirmed' | 'shipped' | 'received' | 'cancelled';
  orderDate: string;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  notes?: string;
  items: PurchaseOrderItem[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  receivedQuantity?: number;
  batchNumber?: string;
  expirationDate?: string;
}

// Sample Product Categories
export const PRODUCT_CATEGORIES: ProductCategory[] = [
  {
    id: 'cardiovascular',
    name: 'Cardiovascular',
    slug: 'cardiovascular',
    description: 'Heart health and blood pressure medications',
    level: 1,
    isActive: true,
    sortOrder: 1
  },
  {
    id: 'diabetes',
    name: 'Diabetes & Endocrine',
    slug: 'diabetes-endocrine',
    description: 'Diabetes management and hormone therapies',
    level: 1,
    isActive: true,
    sortOrder: 2
  },
  {
    id: 'pain_management',
    name: 'Pain Management',
    slug: 'pain-management',
    description: 'Pain relief and anti-inflammatory medications',
    level: 1,
    isActive: true,
    sortOrder: 3
  },
  {
    id: 'mental_health',
    name: 'Mental Health',
    slug: 'mental-health',
    description: 'Antidepressants, anxiety, and psychiatric medications',
    level: 1,
    isActive: true,
    sortOrder: 4
  },
  {
    id: 'antibiotics',
    name: 'Antibiotics & Anti-infectives',
    slug: 'antibiotics',
    description: 'Bacterial, viral, and fungal infection treatments',
    level: 1,
    isActive: true,
    sortOrder: 5
  },
  {
    id: 'respiratory',
    name: 'Respiratory',
    slug: 'respiratory',
    description: 'Asthma, COPD, and breathing medications',
    level: 1,
    isActive: true,
    sortOrder: 6
  },
  {
    id: 'gastrointestinal',
    name: 'Gastrointestinal',
    slug: 'gastrointestinal',
    description: 'Digestive health and stomach medications',
    level: 1,
    isActive: true,
    sortOrder: 7
  },
  {
    id: 'vitamins_supplements',
    name: 'Vitamins & Supplements',
    slug: 'vitamins-supplements',
    description: 'Nutritional supplements and vitamins',
    level: 1,
    isActive: true,
    sortOrder: 8
  },
  {
    id: 'dermatology',
    name: 'Dermatology',
    slug: 'dermatology',
    description: 'Skin care and dermatological treatments',
    level: 1,
    isActive: true,
    sortOrder: 9
  },
  {
    id: 'womens_health',
    name: "Women's Health",
    slug: 'womens-health',
    description: 'Reproductive health and hormonal treatments',
    level: 1,
    isActive: true,
    sortOrder: 10
  },
  {
    id: 'mens_health',
    name: "Men's Health",
    slug: 'mens-health',
    description: 'Male-specific health and wellness products',
    level: 1,
    isActive: true,
    sortOrder: 11
  },
  {
    id: 'medical_devices',
    name: 'Medical Devices',
    slug: 'medical-devices',
    description: 'Blood pressure monitors, glucose meters, and health devices',
    level: 1,
    isActive: true,
    sortOrder: 12
  }
];

// Sample Products Database
export const SAMPLE_PRODUCTS: Product[] = [
  // Cardiovascular Medications
  {
    id: 'atorvastatin_20mg',
    name: 'Atorvastatin',
    genericName: 'Atorvastatin',
    brand: 'Lipitor',
    category: PRODUCT_CATEGORIES[0],
    type: 'prescription',
    description: 'Atorvastatin is used to treat high cholesterol and to lower the risk of stroke, heart attack, or other heart complications in people with type 2 diabetes, coronary heart disease, or other risk factors.',
    shortDescription: 'Cholesterol-lowering statin medication',
    price: 29.99,
    compareAtPrice: 45.99,
    costPrice: 12.50,
    sku: 'ATOR-20-90',
    stock: 250,
    lowStockThreshold: 50,
    reorderPoint: 75,
    reorderQuantity: 500,
    dosageForm: 'tablet',
    strength: '20mg',
    dosages: ['10mg', '20mg', '40mg', '80mg'],
    activeIngredients: ['Atorvastatin Calcium'],
    indications: ['High Cholesterol', 'Cardiovascular Disease Prevention'],
    contraindications: ['Active liver disease', 'Pregnancy', 'Breastfeeding'],
    sideEffects: ['Muscle pain', 'Weakness', 'Nausea', 'Diarrhea'],
    interactions: ['Warfarin', 'Digoxin', 'Gemfibrozil'],
    prescriptionRequired: true,
    controlledSubstance: false,
    maxRefills: 5,
    daysSupply: [30, 60, 90],
    manufacturer: 'Pfizer Inc.',
    ndc: '0071-0156-23',
    images: ['/products/atorvastatin.jpg'],
    rating: 4.3,
    reviewCount: 1247,
    isActive: true,
    isDiscontinued: false,
    isOnBackorder: false,
    tags: ['cholesterol', 'statin', 'heart health', 'cardiovascular'],
    features: ['Once daily dosing', 'Proven cardiovascular protection', 'Generic available'],
    benefits: ['Lowers LDL cholesterol', 'Reduces heart attack risk', 'Prevents stroke'],
    weight: 15,
    dimensions: { length: 50, width: 30, height: 10 },
    requiresRefrigeration: false,
    hazmat: false,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z'
  },
  {
    id: 'lisinopril_10mg',
    name: 'Lisinopril',
    genericName: 'Lisinopril',
    brand: 'Prinivil',
    category: PRODUCT_CATEGORIES[0],
    type: 'prescription',
    description: 'Lisinopril is an ACE inhibitor used to treat high blood pressure (hypertension) and heart failure. It works by relaxing blood vessels so blood can flow more easily.',
    shortDescription: 'ACE inhibitor for blood pressure control',
    price: 19.99,
    compareAtPrice: 35.99,
    costPrice: 8.75,
    sku: 'LISI-10-90',
    stock: 180,
    lowStockThreshold: 40,
    reorderPoint: 60,
    reorderQuantity: 400,
    dosageForm: 'tablet',
    strength: '10mg',
    dosages: ['2.5mg', '5mg', '10mg', '20mg', '40mg'],
    activeIngredients: ['Lisinopril'],
    indications: ['Hypertension', 'Heart Failure', 'Post-MI Protection'],
    contraindications: ['Pregnancy', 'Angioedema history', 'Bilateral renal artery stenosis'],
    sideEffects: ['Dry cough', 'Dizziness', 'Hyperkalemia', 'Fatigue'],
    interactions: ['NSAIDs', 'Potassium supplements', 'Lithium'],
    prescriptionRequired: true,
    controlledSubstance: false,
    maxRefills: 5,
    daysSupply: [30, 60, 90],
    manufacturer: 'Merck & Co.',
    ndc: '0006-0207-68',
    images: ['/products/lisinopril.jpg'],
    rating: 4.1,
    reviewCount: 892,
    isActive: true,
    isDiscontinued: false,
    isOnBackorder: false,
    tags: ['blood pressure', 'ACE inhibitor', 'hypertension', 'heart failure'],
    features: ['Once daily dosing', 'Proven cardiovascular benefits', 'Well tolerated'],
    benefits: ['Lowers blood pressure', 'Protects kidneys', 'Reduces heart failure symptoms'],
    weight: 12,
    dimensions: { length: 45, width: 25, height: 8 },
    requiresRefrigeration: false,
    hazmat: false,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z'
  },

  // Diabetes Medications
  {
    id: 'metformin_500mg',
    name: 'Metformin',
    genericName: 'Metformin HCl',
    brand: 'Glucophage',
    category: PRODUCT_CATEGORIES[1],
    type: 'prescription',
    description: 'Metformin is used to treat type 2 diabetes. It helps control blood sugar levels by decreasing glucose production in the liver and improving insulin sensitivity.',
    shortDescription: 'First-line diabetes medication',
    price: 24.99,
    compareAtPrice: 42.99,
    costPrice: 9.50,
    sku: 'METF-500-180',
    stock: 320,
    lowStockThreshold: 75,
    reorderPoint: 100,
    reorderQuantity: 600,
    dosageForm: 'tablet',
    strength: '500mg',
    dosages: ['250mg', '500mg', '850mg', '1000mg'],
    activeIngredients: ['Metformin Hydrochloride'],
    indications: ['Type 2 Diabetes', 'Prediabetes', 'PCOS'],
    contraindications: ['Kidney disease', 'Metabolic acidosis', 'Dehydration'],
    sideEffects: ['Nausea', 'Diarrhea', 'Metallic taste', 'Vitamin B12 deficiency'],
    interactions: ['Alcohol', 'Contrast dye', 'Cimetidine'],
    prescriptionRequired: true,
    controlledSubstance: false,
    maxRefills: 5,
    daysSupply: [30, 60, 90],
    manufacturer: 'Bristol-Myers Squibb',
    ndc: '0003-0095-20',
    images: ['/products/metformin.jpg'],
    rating: 4.2,
    reviewCount: 2156,
    isActive: true,
    isDiscontinued: false,
    isOnBackorder: false,
    tags: ['diabetes', 'blood sugar', 'metformin', 'type 2'],
    features: ['Weight neutral', 'Cardiovascular benefits', 'First-line therapy'],
    benefits: ['Lowers blood sugar', 'Improves insulin sensitivity', 'May aid weight loss'],
    weight: 18,
    dimensions: { length: 55, width: 35, height: 12 },
    requiresRefrigeration: false,
    hazmat: false,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z'
  },

  // Pain Management
  {
    id: 'ibuprofen_200mg',
    name: 'Ibuprofen',
    genericName: 'Ibuprofen',
    brand: 'Advil',
    category: PRODUCT_CATEGORIES[2],
    type: 'otc',
    description: 'Ibuprofen is a nonsteroidal anti-inflammatory drug (NSAID) used to reduce fever and treat pain or inflammation caused by conditions such as headache, toothache, back pain, arthritis, or minor injury.',
    shortDescription: 'NSAID pain reliever and fever reducer',
    price: 12.99,
    compareAtPrice: 18.99,
    costPrice: 5.25,
    sku: 'IBU-200-100',
    stock: 450,
    lowStockThreshold: 100,
    reorderPoint: 150,
    reorderQuantity: 800,
    dosageForm: 'tablet',
    strength: '200mg',
    dosages: ['200mg', '400mg', '600mg', '800mg'],
    activeIngredients: ['Ibuprofen'],
    indications: ['Pain', 'Fever', 'Inflammation', 'Arthritis'],
    contraindications: ['Allergy to NSAIDs', 'Active GI bleeding', 'Severe heart failure'],
    sideEffects: ['Stomach upset', 'Nausea', 'Dizziness', 'Headache'],
    interactions: ['Warfarin', 'ACE inhibitors', 'Lithium'],
    prescriptionRequired: false,
    controlledSubstance: false,
    manufacturer: 'Pfizer Consumer Healthcare',
    upc: '305730164207',
    images: ['/products/ibuprofen.jpg'],
    rating: 4.4,
    reviewCount: 3421,
    isActive: true,
    isDiscontinued: false,
    isOnBackorder: false,
    tags: ['pain relief', 'fever', 'NSAID', 'anti-inflammatory'],
    features: ['Fast acting', 'Long lasting', 'Available without prescription'],
    benefits: ['Reduces pain', 'Lowers fever', 'Decreases inflammation'],
    weight: 25,
    dimensions: { length: 60, width: 40, height: 15 },
    requiresRefrigeration: false,
    hazmat: false,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z'
  },

  // Mental Health
  {
    id: 'sertraline_50mg',
    name: 'Sertraline',
    genericName: 'Sertraline HCl',
    brand: 'Zoloft',
    category: PRODUCT_CATEGORIES[3],
    type: 'prescription',
    description: 'Sertraline is a selective serotonin reuptake inhibitor (SSRI) antidepressant used to treat depression, anxiety disorders, and other mental health conditions.',
    shortDescription: 'SSRI antidepressant medication',
    price: 34.99,
    compareAtPrice: 89.99,
    costPrice: 15.75,
    sku: 'SERT-50-30',
    stock: 150,
    lowStockThreshold: 30,
    reorderPoint: 50,
    reorderQuantity: 300,
    dosageForm: 'tablet',
    strength: '50mg',
    dosages: ['25mg', '50mg', '100mg'],
    activeIngredients: ['Sertraline Hydrochloride'],
    indications: ['Major Depression', 'Anxiety Disorders', 'PTSD', 'OCD'],
    contraindications: ['MAOI use', 'Pimozide use', 'Hypersensitivity'],
    sideEffects: ['Nausea', 'Diarrhea', 'Insomnia', 'Sexual dysfunction'],
    interactions: ['MAOIs', 'Warfarin', 'NSAIDs'],
    prescriptionRequired: true,
    controlledSubstance: false,
    maxRefills: 5,
    daysSupply: [30, 60, 90],
    manufacturer: 'Pfizer Inc.',
    ndc: '0049-4910-66',
    images: ['/products/sertraline.jpg'],
    rating: 4.0,
    reviewCount: 756,
    isActive: true,
    isDiscontinued: false,
    isOnBackorder: false,
    tags: ['antidepressant', 'SSRI', 'anxiety', 'depression'],
    features: ['Once daily dosing', 'Well studied', 'Effective for multiple conditions'],
    benefits: ['Improves mood', 'Reduces anxiety', 'Enhances quality of life'],
    weight: 10,
    dimensions: { length: 40, width: 25, height: 8 },
    requiresRefrigeration: false,
    hazmat: false,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z'
  },

  // Supplements
  {
    id: 'omega3_1000mg',
    name: 'Omega-3 Fish Oil',
    genericName: 'Omega-3 Fatty Acids',
    category: PRODUCT_CATEGORIES[7],
    type: 'supplement',
    description: 'High-quality omega-3 fish oil supplement containing EPA and DHA to support heart health, brain function, and overall wellness.',
    shortDescription: 'Essential omega-3 fatty acids supplement',
    price: 24.99,
    compareAtPrice: 34.99,
    costPrice: 11.25,
    sku: 'OM3-1000-120',
    stock: 380,
    lowStockThreshold: 80,
    reorderPoint: 120,
    reorderQuantity: 500,
    dosageForm: 'capsule',
    strength: '1000mg',
    dosages: ['500mg', '1000mg', '1200mg'],
    activeIngredients: ['EPA (Eicosapentaenoic Acid)', 'DHA (Docosahexaenoic Acid)'],
    indications: ['Heart Health', 'Brain Health', 'Joint Health', 'General Wellness'],
    contraindications: ['Fish allergy', 'Bleeding disorders'],
    sideEffects: ['Fishy aftertaste', 'Mild stomach upset', 'Burping'],
    interactions: ['Blood thinners', 'High dose vitamin E'],
    prescriptionRequired: false,
    controlledSubstance: false,
    manufacturer: 'Nordic Naturals',
    upc: '768990018701',
    images: ['/products/omega3.jpg'],
    rating: 4.6,
    reviewCount: 2847,
    isActive: true,
    isDiscontinued: false,
    isOnBackorder: false,
    tags: ['omega-3', 'fish oil', 'heart health', 'supplement'],
    features: ['Third-party tested', 'Molecularly distilled', 'Enteric coated'],
    benefits: ['Supports heart health', 'Promotes brain function', 'Reduces inflammation'],
    weight: 200,
    dimensions: { length: 80, width: 50, height: 50 },
    requiresRefrigeration: false,
    hazmat: false,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z'
  },

  // Medical Devices
  {
    id: 'blood_pressure_monitor',
    name: 'Digital Blood Pressure Monitor',
    category: PRODUCT_CATEGORIES[11],
    type: 'device',
    description: 'Clinically validated automatic blood pressure monitor with large display, memory storage, and irregular heartbeat detection.',
    shortDescription: 'Automatic blood pressure monitor',
    price: 79.99,
    compareAtPrice: 129.99,
    costPrice: 45.00,
    sku: 'BPM-AUTO-001',
    stock: 85,
    lowStockThreshold: 15,
    reorderPoint: 25,
    reorderQuantity: 100,
    dosageForm: 'device',
    activeIngredients: [],
    indications: ['Hypertension Monitoring', 'Blood Pressure Tracking'],
    contraindications: ['Arrhythmias may affect accuracy', 'Not for pediatric use'],
    sideEffects: [],
    interactions: [],
    prescriptionRequired: false,
    controlledSubstance: false,
    manufacturer: 'Omron Healthcare',
    upc: '073796274610',
    images: ['/products/bp-monitor.jpg'],
    rating: 4.5,
    reviewCount: 1456,
    isActive: true,
    isDiscontinued: false,
    isOnBackorder: false,
    tags: ['blood pressure', 'monitor', 'medical device', 'hypertension'],
    features: ['Clinically validated', 'Memory for 2 users', 'Large display', 'Cuff size indicator'],
    benefits: ['Accurate readings', 'Easy to use', 'Track progress over time'],
    weight: 680,
    dimensions: { length: 150, width: 120, height: 80 },
    requiresRefrigeration: false,
    hazmat: false,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z'
  },

  // Women's Health
  {
    id: 'prenatal_vitamins',
    name: 'Prenatal Vitamins',
    category: PRODUCT_CATEGORIES[9],
    type: 'supplement',
    description: 'Complete prenatal vitamin with folic acid, iron, and DHA to support maternal and fetal health during pregnancy and breastfeeding.',
    shortDescription: 'Complete prenatal vitamin supplement',
    price: 29.99,
    compareAtPrice: 39.99,
    costPrice: 14.50,
    sku: 'PREN-VIT-90',
    stock: 200,
    lowStockThreshold: 40,
    reorderPoint: 60,
    reorderQuantity: 300,
    dosageForm: 'capsule',
    activeIngredients: ['Folic Acid', 'Iron', 'Calcium', 'DHA', 'Vitamin D'],
    indications: ['Pregnancy Support', 'Fetal Development', 'Maternal Health'],
    contraindications: ['Iron overload disorders', 'Specific vitamin allergies'],
    sideEffects: ['Mild nausea', 'Constipation', 'Dark stools'],
    interactions: ['Calcium may reduce iron absorption'],
    prescriptionRequired: false,
    controlledSubstance: false,
    manufacturer: 'Rainbow Light',
    upc: '021888110315',
    images: ['/products/prenatal.jpg'],
    rating: 4.7,
    reviewCount: 1892,
    isActive: true,
    isDiscontinued: false,
    isOnBackorder: false,
    tags: ['prenatal', 'pregnancy', 'vitamins', 'womens health'],
    features: ['Food-based nutrients', 'Gentle on stomach', 'Third-party tested'],
    benefits: ['Supports fetal development', 'Maintains maternal health', 'Easy to digest'],
    weight: 150,
    dimensions: { length: 70, width: 45, height: 45 },
    requiresRefrigeration: false,
    hazmat: false,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z'
  },

  // Men's Health - ED Medication
  {
    id: 'sildenafil_50mg',
    name: 'Sildenafil',
    genericName: 'Sildenafil Citrate',
    brand: 'Viagra',
    category: PRODUCT_CATEGORIES[10],
    type: 'prescription',
    description: 'Sildenafil is used to treat erectile dysfunction (ED) by increasing blood flow to the penis during sexual stimulation.',
    shortDescription: 'ED treatment medication',
    price: 89.99,
    compareAtPrice: 450.00,
    costPrice: 25.00,
    sku: 'SILD-50-4',
    stock: 120,
    lowStockThreshold: 25,
    reorderPoint: 40,
    reorderQuantity: 200,
    dosageForm: 'tablet',
    strength: '50mg',
    dosages: ['25mg', '50mg', '100mg'],
    activeIngredients: ['Sildenafil Citrate'],
    indications: ['Erectile Dysfunction', 'Pulmonary Arterial Hypertension'],
    contraindications: ['Nitrate medications', 'Severe heart disease', 'Hypotension'],
    sideEffects: ['Headache', 'Flushing', 'Nasal congestion', 'Visual changes'],
    interactions: ['Nitrates', 'Alpha blockers', 'CYP3A4 inhibitors'],
    prescriptionRequired: true,
    controlledSubstance: false,
    maxRefills: 5,
    daysSupply: [4, 8, 12],
    manufacturer: 'Pfizer Inc.',
    ndc: '0069-4200-30',
    images: ['/products/sildenafil.jpg'],
    rating: 4.3,
    reviewCount: 567,
    isActive: true,
    isDiscontinued: false,
    isOnBackorder: false,
    tags: ['ED', 'erectile dysfunction', 'mens health', 'sildenafil'],
    features: ['Rapid onset', 'Proven effective', 'Well tolerated'],
    benefits: ['Improves erectile function', 'Enhances sexual confidence', 'Reliable results'],
    weight: 5,
    dimensions: { length: 30, width: 20, height: 5 },
    requiresRefrigeration: false,
    hazmat: false,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z'
  },

  // Weight Management - GLP1
  {
    id: 'semaglutide_1mg',
    name: 'Semaglutide',
    genericName: 'Semaglutide',
    brand: 'Ozempic',
    category: PRODUCT_CATEGORIES[1],
    type: 'prescription',
    description: 'Semaglutide is a GLP-1 receptor agonist used for type 2 diabetes management and weight loss. It helps control blood sugar and reduces appetite.',
    shortDescription: 'GLP-1 medication for diabetes and weight loss',
    price: 899.99,
    compareAtPrice: 1200.00,
    costPrice: 450.00,
    sku: 'SEMA-1MG-PEN',
    stock: 45,
    lowStockThreshold: 10,
    reorderPoint: 15,
    reorderQuantity: 50,
    dosageForm: 'injection',
    strength: '1mg',
    dosages: ['0.25mg', '0.5mg', '1mg', '2mg'],
    activeIngredients: ['Semaglutide'],
    indications: ['Type 2 Diabetes', 'Weight Management', 'Cardiovascular Risk Reduction'],
    contraindications: ['Type 1 diabetes', 'Diabetic ketoacidosis', 'Personal/family history of MTC'],
    sideEffects: ['Nausea', 'Vomiting', 'Diarrhea', 'Injection site reactions'],
    interactions: ['Insulin', 'Oral medications'],
    prescriptionRequired: true,
    controlledSubstance: false,
    maxRefills: 5,
    daysSupply: [28],
    manufacturer: 'Novo Nordisk',
    ndc: '0169-2222-13',
    images: ['/products/semaglutide.jpg'],
    rating: 4.4,
    reviewCount: 234,
    isActive: true,
    isDiscontinued: false,
    isOnBackorder: false,
    tags: ['GLP-1', 'diabetes', 'weight loss', 'semaglutide'],
    features: ['Once weekly dosing', 'Significant weight loss', 'Cardiovascular benefits'],
    benefits: ['Controls blood sugar', 'Promotes weight loss', 'Reduces cardiovascular risk'],
    weight: 25,
    dimensions: { length: 120, width: 20, height: 20 },
    requiresRefrigeration: true,
    hazmat: false,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z'
  }
];

// Sample Suppliers
export const SAMPLE_SUPPLIERS: Supplier[] = [
  {
    id: 'mckesson',
    name: 'McKesson Corporation',
    contactName: 'Sarah Johnson',
    email: 'orders@mckesson.com',
    phone: '1-800-MCKESSON',
    address: {
      street: '6555 State Hwy 161',
      city: 'Irving',
      state: 'TX',
      zipCode: '75039',
      country: 'USA'
    },
    leadTimeDays: 2,
    minimumOrderValue: 500,
    isActive: true,
    rating: 4.5,
    paymentTerms: 'Net 30'
  },
  {
    id: 'cardinal_health',
    name: 'Cardinal Health',
    contactName: 'Michael Chen',
    email: 'procurement@cardinalhealth.com',
    phone: '1-800-234-8701',
    address: {
      street: '7000 Cardinal Place',
      city: 'Dublin',
      state: 'OH',
      zipCode: '43017',
      country: 'USA'
    },
    leadTimeDays: 3,
    minimumOrderValue: 750,
    isActive: true,
    rating: 4.3,
    paymentTerms: 'Net 30'
  },
  {
    id: 'amerisource_bergen',
    name: 'AmerisourceBergen',
    contactName: 'Lisa Rodriguez',
    email: 'orders@amerisourcebergen.com',
    phone: '1-800-746-6273',
    address: {
      street: '1300 Morris Drive',
      city: 'Chesterbrook',
      state: 'PA',
      zipCode: '19087',
      country: 'USA'
    },
    leadTimeDays: 2,
    minimumOrderValue: 600,
    isActive: true,
    rating: 4.4,
    paymentTerms: 'Net 30'
  }
];

// Utility functions for product management
export class ProductManager {
  static searchProducts(query: string, products: Product[] = SAMPLE_PRODUCTS): Product[] {
    const searchTerm = query.toLowerCase();
    return products.filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      product.genericName?.toLowerCase().includes(searchTerm) ||
      product.brand?.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      product.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      product.category.name.toLowerCase().includes(searchTerm)
    );
  }

  static filterByCategory(categoryId: string, products: Product[] = SAMPLE_PRODUCTS): Product[] {
    return products.filter(product => product.category.id === categoryId);
  }

  static filterByType(type: Product['type'], products: Product[] = SAMPLE_PRODUCTS): Product[] {
    return products.filter(product => product.type === type);
  }

  static getLowStockProducts(products: Product[] = SAMPLE_PRODUCTS): Product[] {
    return products.filter(product => product.stock <= product.lowStockThreshold);
  }

  static getReorderProducts(products: Product[] = SAMPLE_PRODUCTS): Product[] {
    return products.filter(product => product.stock <= product.reorderPoint);
  }

  static calculateInventoryValue(products: Product[] = SAMPLE_PRODUCTS): number {
    return products.reduce((total, product) => total + (product.costPrice * product.stock), 0);
  }

  static getTopSellingProducts(products: Product[] = SAMPLE_PRODUCTS): Product[] {
    return products
      .filter(product => product.reviewCount > 0)
      .sort((a, b) => b.reviewCount - a.reviewCount)
      .slice(0, 10);
  }

  static getProductsByRating(minRating: number, products: Product[] = SAMPLE_PRODUCTS): Product[] {
    return products.filter(product => product.rating >= minRating);
  }
}
