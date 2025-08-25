// Dynamic Questionnaires with AI Prescription Logic for Real-World Scenarios

export interface QuestionnaireQuestion {
  id: string;
  type: "multiple_choice" | "boolean" | "number" | "scale" | "checkbox";
  title: string;
  subtitle?: string;
  empathicMessage?: string;
  options?: string[];
  required: boolean;
  category: string;
  weight: number; // For AI scoring
  conditionalLogic?: {
    showIf?: { questionId: string; value: any };
    hideIf?: { questionId: string; value: any };
  };
  validationRules?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface EducationalInsert {
  id: string;
  type: "fact" | "statistic" | "encouragement" | "education";
  title: string;
  content: string;
  icon: string;
  background: string;
  afterQuestion?: string; // Show after specific question ID
}

export interface Medication {
  id: string;
  name: string;
  genericName: string;
  dosages: string[];
  description: string;
  sideEffects: string[];
  contraindications: string[];
  cost: number;
  effectiveness: number; // 1-10
  suitabilityFactors: {
    [key: string]: number; // Question weights for this medication
  };
}

export interface DynamicQuestionnaire {
  id: string;
  category: string;
  title: string;
  description: string;
  empathicIntro: string;
  estimatedTime: string;
  questions: QuestionnaireQuestion[];
  educationalInserts: EducationalInsert[];
  medications: Medication[];
  aiLogic: {
    scoringWeights: { [questionId: string]: number };
    contraIndicationRules: Array<{
      condition: string;
      result: "consultation_required" | "medication_contraindicated";
      message: string;
    }>;
  };
}

// GLP-1 Weight Loss Questionnaire
export const GLP1_QUESTIONNAIRE: DynamicQuestionnaire = {
  id: "glp1_weight_loss",
  category: "Weight Management",
  title: "Personalized GLP-1 Weight Loss Assessment",
  description:
    "A comprehensive evaluation to determine the most suitable GLP-1 medication for your weight loss journey",
  empathicIntro:
    "Starting a weight loss journey takes courage. We're here to support you every step of the way with safe, effective treatment options tailored to your unique needs and health profile.",
  estimatedTime: "8-12 minutes",
  questions: [
    {
      id: "current_weight",
      type: "number",
      title: "What is your current weight?",
      subtitle:
        "This helps us calculate your BMI and determine appropriate dosing",
      empathicMessage:
        "Remember, this is a safe space. Your weight is just one data point in your health journey.",
      required: true,
      category: "demographics",
      weight: 1.0,
      validationRules: { min: 80, max: 600 },
    },
    {
      id: "current_height",
      type: "number",
      title: "What is your height in inches?",
      subtitle: "We need this to calculate your BMI accurately",
      required: true,
      category: "demographics",
      weight: 1.0,
      validationRules: { min: 48, max: 84 },
    },
    {
      id: "weight_loss_goal",
      type: "multiple_choice",
      title: "What is your weight loss goal?",
      subtitle:
        "Be realistic and kind to yourself - sustainable loss is 1-2 pounds per week",
      empathicMessage:
        "Every journey starts with a single step. Your goals matter, and we're here to help you achieve them safely.",
      options: [
        "10-20 pounds",
        "21-40 pounds",
        "41-60 pounds",
        "61-80 pounds",
        "More than 80 pounds",
      ],
      required: true,
      category: "goals",
      weight: 1.2,
    },
    {
      id: "previous_attempts",
      type: "checkbox",
      title: "Which weight loss methods have you tried before?",
      subtitle:
        "Your past experiences help us understand what might work best for you",
      empathicMessage:
        "Previous attempts aren't failures - they're valuable learning experiences that inform better treatment.",
      options: [
        "Diet and exercise alone",
        "Commercial weight loss programs (Weight Watchers, Jenny Craig)",
        "Prescription weight loss medications",
        "Bariatric surgery consultation",
        "Meal replacement shakes",
        "Intermittent fasting",
        "Low-carb/Keto diets",
        "Personal trainer/nutritionist",
      ],
      required: true,
      category: "history",
      weight: 1.1,
    },
    {
      id: "diabetes_status",
      type: "multiple_choice",
      title: "What is your diabetes status?",
      subtitle:
        "GLP-1 medications can help with both weight loss and diabetes management",
      empathicMessage:
        "Managing diabetes is challenging. GLP-1 medications may offer dual benefits for your health.",
      options: [
        "No diabetes",
        "Pre-diabetes (A1C 5.7-6.4%)",
        "Type 2 diabetes - well controlled",
        "Type 2 diabetes - needs improvement",
        "Type 2 diabetes - recently diagnosed",
        "Type 1 diabetes",
      ],
      required: true,
      category: "medical_history",
      weight: 2.0,
    },
    {
      id: "eating_patterns",
      type: "checkbox",
      title: "Which eating patterns do you struggle with?",
      subtitle: "GLP-1 medications can help address these specific challenges",
      empathicMessage:
        "Food relationships are complex and personal. There's no judgment here - only support for healthier patterns.",
      options: [
        "Frequent snacking throughout the day",
        "Large portion sizes at meals",
        "Emotional eating when stressed",
        "Late-night eating",
        "Fast food/convenience food reliance",
        "Binge eating episodes",
        "Constant food cravings",
        "Eating when not hungry",
      ],
      required: true,
      category: "behavior",
      weight: 1.5,
    },
    {
      id: "medical_conditions",
      type: "checkbox",
      title: "Do you have any of these medical conditions?",
      subtitle:
        "Some conditions may affect which GLP-1 medication is safest for you",
      empathicMessage:
        "Your complete health picture helps us choose the safest, most effective treatment option.",
      options: [
        "High blood pressure",
        "High cholesterol",
        "Heart disease",
        "Kidney disease",
        "Liver disease",
        "Thyroid disorders",
        "Depression or anxiety",
        "Sleep apnea",
        "PCOS (women)",
        "Gastroparesis",
        "Pancreatitis history",
      ],
      required: true,
      category: "medical_history",
      weight: 2.0,
    },
    {
      id: "current_medications",
      type: "checkbox",
      title: "Are you currently taking any of these medications?",
      subtitle: "Drug interactions are important for your safety",
      empathicMessage:
        "Medication interactions matter. Full transparency helps us keep you safe.",
      options: [
        "Insulin",
        "Metformin",
        "Other diabetes medications",
        "Blood pressure medications",
        "Antidepressants",
        "Blood thinners",
        "Thyroid medications",
        "Birth control pills",
        "None of the above",
      ],
      required: true,
      category: "medications",
      weight: 1.8,
    },
    {
      id: "lifestyle_factors",
      type: "multiple_choice",
      title: "How would you describe your current activity level?",
      subtitle: "Exercise enhances the effectiveness of GLP-1 medications",
      empathicMessage:
        "Any movement is good movement. We can help you build from wherever you are now.",
      options: [
        "Sedentary - little to no exercise",
        "Lightly active - light exercise 1-3 days/week",
        "Moderately active - moderate exercise 3-5 days/week",
        "Very active - hard exercise 6-7 days/week",
        "Extremely active - hard daily exercise",
      ],
      required: true,
      category: "lifestyle",
      weight: 1.3,
    },
    {
      id: "side_effect_concerns",
      type: "checkbox",
      title: "Which potential side effects concern you most?",
      subtitle: "Different GLP-1 medications have varying side effect profiles",
      empathicMessage:
        "Your concerns are valid. We'll help you choose a medication that minimizes your specific worries.",
      options: [
        "Nausea and vomiting",
        "Diarrhea or stomach upset",
        "Injection site reactions",
        "Fatigue or low energy",
        "Cost of medication",
        "Weekly injection schedule",
        "Long-term safety unknown",
        "Hair loss",
        "Gallbladder issues",
      ],
      required: false,
      category: "preferences",
      weight: 1.0,
    },
    {
      id: "support_system",
      type: "multiple_choice",
      title: "How would you describe your support system for weight loss?",
      subtitle: "Having support significantly improves success rates",
      empathicMessage:
        "You don't have to do this alone. Support systems are crucial for sustainable success.",
      options: [
        "Strong family/friend support",
        "Some support but limited",
        "Minimal support system",
        "Feel like I'm on my own",
        "Have professional support (nutritionist, trainer)",
      ],
      required: true,
      category: "psychosocial",
      weight: 1.2,
    },
    {
      id: "treatment_commitment",
      type: "multiple_choice",
      title: "How long are you willing to commit to GLP-1 treatment?",
      subtitle: "GLP-1 medications work best with long-term commitment",
      empathicMessage:
        "Realistic expectations lead to better outcomes. Long-term thinking is key to sustainable results.",
      options: [
        "3-6 months to see if it works",
        "6-12 months for significant results",
        "1-2 years for comprehensive weight loss",
        "As long as it takes to reach my goal",
        "Uncertain about timeline",
      ],
      required: true,
      category: "commitment",
      weight: 1.4,
    },
  ],
  educationalInserts: [
    {
      id: "bmi_education",
      type: "education",
      title: "Understanding BMI and Health",
      content:
        "BMI is calculated as weight (kg) divided by height (m²). While not perfect, it helps doctors assess health risks. A BMI of 30+ qualifies for weight loss medication, but individual factors matter more than numbers alone.",
      icon: "📊",
      background: "bg-blue-50 dark:bg-blue-900/20",
      afterQuestion: "current_height",
    },
    {
      id: "glp1_mechanism",
      type: "education",
      title: "How GLP-1 Medications Work",
      content:
        "GLP-1 medications mimic hormones your body naturally produces after eating. They slow digestion, reduce appetite, and help you feel full longer. This leads to natural portion control and sustainable weight loss.",
      icon: "🧬",
      background: "bg-green-50 dark:bg-green-900/20",
      afterQuestion: "weight_loss_goal",
    },
    {
      id: "success_statistics",
      type: "statistic",
      title: "Real Success Rates",
      content:
        "Clinical trials show 15-20% average weight loss with GLP-1 medications. 85% of people lose at least 5% of their body weight, and 50% lose 15% or more when combined with lifestyle changes.",
      icon: "📈",
      background: "bg-emerald-50 dark:bg-emerald-900/20",
      afterQuestion: "previous_attempts",
    },
    {
      id: "diabetes_benefit",
      type: "fact",
      title: "Dual Benefits for Diabetes",
      content:
        "GLP-1 medications were originally developed for diabetes. They can lower A1C by 1-2%, reduce heart disease risk, and may protect kidney function - all while promoting weight loss.",
      icon: "💙",
      background: "bg-purple-50 dark:bg-purple-900/20",
      afterQuestion: "diabetes_status",
    },
    {
      id: "lifestyle_synergy",
      type: "encouragement",
      title: "Medication + Lifestyle = Success",
      content:
        "GLP-1 medications work best when combined with healthy eating and regular movement. Think of the medication as a tool that makes healthy choices easier, not a magic solution.",
      icon: "💪",
      background: "bg-orange-50 dark:bg-orange-900/20",
      afterQuestion: "lifestyle_factors",
    },
  ],
  medications: [
    {
      id: "semaglutide",
      name: "Semaglutide",
      genericName: "semaglutide",
      dosages: ["0.25mg", "0.5mg", "1.0mg", "1.7mg", "2.4mg"],
      description:
        "Weekly injection with proven weight loss and cardiovascular benefits",
      sideEffects: [
        "Nausea",
        "Vomiting",
        "Diarrhea",
        "Constipation",
        "Injection site reactions",
      ],
      contraindications: [
        "Personal/family history of medullary thyroid cancer",
        "Multiple endocrine neoplasia syndrome type 2",
        "Severe gastroparesis",
      ],
      cost: 1200,
      effectiveness: 9,
      suitabilityFactors: {
        diabetes_status: 2.0,
        medical_conditions: 1.5,
        weight_loss_goal: 1.8,
        eating_patterns: 1.7,
      },
    },
    {
      id: "tirzepatide",
      name: "Tirzepatide",
      genericName: "tirzepatide",
      dosages: ["2.5mg", "5mg", "7.5mg", "10mg", "12.5mg", "15mg"],
      description:
        "Dual-action weekly injection with the highest weight loss efficacy",
      sideEffects: [
        "Nausea",
        "Vomiting",
        "Diarrhea",
        "Decreased appetite",
        "Fatigue",
      ],
      contraindications: [
        "Personal/family history of medullary thyroid cancer",
        "Multiple endocrine neoplasia syndrome type 2",
      ],
      cost: 1400,
      effectiveness: 10,
      suitabilityFactors: {
        diabetes_status: 2.2,
        weight_loss_goal: 2.0,
        medical_conditions: 1.6,
        treatment_commitment: 1.8,
      },
    },
    {
      id: "liraglutide",
      name: "Liraglutide",
      genericName: "liraglutide",
      dosages: ["0.6mg", "1.2mg", "1.8mg", "2.4mg", "3.0mg"],
      description:
        "Daily injection with established safety profile and cardiovascular benefits",
      sideEffects: [
        "Nausea",
        "Hypoglycemia",
        "Diarrhea",
        "Headache",
        "Injection site reactions",
      ],
      contraindications: [
        "Personal/family history of medullary thyroid cancer",
        "Multiple endocrine neoplasia syndrome type 2",
      ],
      cost: 900,
      effectiveness: 7,
      suitabilityFactors: {
        medical_conditions: 2.0,
        current_medications: 1.5,
        side_effect_concerns: 1.8,
        treatment_commitment: 1.2,
      },
    },
  ],
  aiLogic: {
    scoringWeights: {
      diabetes_status: 2.0,
      medical_conditions: 1.8,
      weight_loss_goal: 1.5,
      eating_patterns: 1.3,
      treatment_commitment: 1.4,
    },
    contraIndicationRules: [
      {
        condition: 'medical_conditions includes "Pancreatitis history"',
        result: "consultation_required",
        message:
          "History of pancreatitis requires careful medical evaluation before starting GLP-1 therapy.",
      },
      {
        condition: 'medical_conditions includes "Gastroparesis"',
        result: "medication_contraindicated",
        message:
          "GLP-1 medications can worsen gastroparesis and are not recommended.",
      },
    ],
  },
};

// Men's ED Questionnaire
export const MENS_ED_QUESTIONNAIRE: DynamicQuestionnaire = {
  id: "mens_ed_treatment",
  category: "Men's Health",
  title: "Confidential ED Treatment Assessment",
  description:
    "A private, comprehensive evaluation to find the most effective ED treatment for you",
  empathicIntro:
    "Erectile dysfunction is more common than you might think, affecting 40% of men over 40. You're taking a positive step toward better intimate health and overall wellbeing. This assessment is completely confidential.",
  estimatedTime: "6-10 minutes",
  questions: [
    {
      id: "age_range",
      type: "multiple_choice",
      title: "What is your age range?",
      subtitle:
        "Age helps us understand the most likely causes and best treatments",
      empathicMessage:
        "ED affects men of all ages. Younger men often have psychological causes, while older men may have physical causes.",
      options: ["18-29", "30-39", "40-49", "50-59", "60-69", "70+"],
      required: true,
      category: "demographics",
      weight: 1.5,
    },
    {
      id: "ed_severity",
      type: "multiple_choice",
      title: "How would you describe your erectile difficulties?",
      subtitle:
        "The International Index of Erectile Function helps standardize assessment",
      empathicMessage:
        "Honest assessment helps us provide the most effective treatment. There's no shame in any answer.",
      options: [
        "Mild - occasional difficulty (can achieve erection 60-80% of the time)",
        "Moderate - regular difficulty (can achieve erection 40-60% of the time)",
        "Severe - frequent difficulty (can achieve erection 20-40% of the time)",
        "Complete - unable to achieve erection suitable for penetration",
      ],
      required: true,
      category: "symptoms",
      weight: 2.0,
    },
    {
      id: "duration",
      type: "multiple_choice",
      title: "How long have you been experiencing ED symptoms?",
      subtitle:
        "Duration helps distinguish between temporary and chronic conditions",
      empathicMessage:
        "Recent onset may indicate treatable causes like stress or medication changes.",
      options: [
        "Less than 3 months",
        "3-6 months",
        "6-12 months",
        "1-2 years",
        "More than 2 years",
      ],
      required: true,
      category: "history",
      weight: 1.3,
    },
    {
      id: "onset_type",
      type: "multiple_choice",
      title: "How did your ED symptoms begin?",
      subtitle: "Sudden vs. gradual onset suggests different underlying causes",
      empathicMessage:
        "Sudden onset often has psychological triggers, while gradual onset may indicate physical causes.",
      options: [
        "Suddenly - was fine, then problems started",
        "Gradually - slowly worsened over time",
        "Situational - only with certain partners/situations",
        "Always had some difficulty",
      ],
      required: true,
      category: "symptoms",
      weight: 1.4,
    },
    {
      id: "cardiovascular_health",
      type: "checkbox",
      title: "Do you have any cardiovascular conditions?",
      subtitle:
        "Heart health directly affects erectile function and medication safety",
      empathicMessage:
        "Cardiovascular health and erectile function are closely linked. This helps us choose safe medications.",
      options: [
        "High blood pressure",
        "High cholesterol",
        "Heart disease/heart attack",
        "Chest pain (angina)",
        "Irregular heartbeat",
        "Stroke",
        "Peripheral artery disease",
        "None of the above",
      ],
      required: true,
      category: "medical_history",
      weight: 2.5,
    },
    {
      id: "diabetes_status",
      type: "multiple_choice",
      title: "Do you have diabetes?",
      subtitle:
        "Diabetes is a leading cause of ED and affects treatment choices",
      empathicMessage:
        "Diabetes affects 50% of men with ED. Good diabetes control often improves erectile function.",
      options: [
        "No diabetes",
        "Pre-diabetes",
        "Type 2 diabetes - well controlled",
        "Type 2 diabetes - poorly controlled",
        "Type 1 diabetes",
      ],
      required: true,
      category: "medical_history",
      weight: 2.0,
    },
    {
      id: "medications",
      type: "checkbox",
      title: "Are you taking any of these medications?",
      subtitle: "Some medications can cause or worsen ED",
      empathicMessage:
        "Many common medications affect erectile function. Don't stop medications - we can work around them.",
      options: [
        "Blood pressure medications",
        "Antidepressants",
        "Anti-anxiety medications",
        "Prostate medications",
        "Blood thinners",
        "Heart medications (nitrates)",
        "Seizure medications",
        "None of the above",
      ],
      required: true,
      category: "medications",
      weight: 2.2,
    },
    {
      id: "lifestyle_factors",
      type: "checkbox",
      title: "Which lifestyle factors apply to you?",
      subtitle: "Lifestyle factors significantly impact erectile function",
      empathicMessage:
        "Lifestyle changes can dramatically improve ED. Small changes can make a big difference.",
      options: [
        "Regular smoking",
        "Regular alcohol use (more than 2 drinks/day)",
        "Regular exercise (3+ times/week)",
        "Overweight/obese",
        "High stress job/life",
        "Poor sleep quality",
        "Recreational drug use",
        "Sedentary lifestyle",
      ],
      required: true,
      category: "lifestyle",
      weight: 1.8,
    },
    {
      id: "psychological_factors",
      type: "checkbox",
      title: "Have you experienced any of these psychological factors?",
      subtitle: "Mental health significantly affects erectile function",
      empathicMessage:
        "The mind and body are connected. Addressing psychological factors often improves physical symptoms.",
      options: [
        "Depression",
        "Anxiety",
        "Relationship stress",
        "Work/financial stress",
        "Performance anxiety",
        "Low self-esteem",
        "Previous traumatic experiences",
        "None of the above",
      ],
      required: true,
      category: "psychological",
      weight: 1.6,
    },
    {
      id: "morning_erections",
      type: "multiple_choice",
      title: "How often do you wake up with an erection?",
      subtitle:
        "Morning erections indicate healthy blood flow and hormone levels",
      empathicMessage:
        "Morning erections are a good sign of physical erectile health. Their presence suggests psychological factors.",
      options: [
        "Daily or almost daily",
        "A few times per week",
        "Once a week or less",
        "Rarely or never",
      ],
      required: true,
      category: "symptoms",
      weight: 1.7,
    },
    {
      id: "masturbation_function",
      type: "multiple_choice",
      title: "Can you achieve erection during masturbation?",
      subtitle:
        "This helps distinguish between physical and psychological causes",
      empathicMessage:
        "This intimate question helps us understand if the issue is physical, psychological, or both.",
      options: [
        "Yes, without difficulty",
        "Yes, but with some difficulty",
        "Sometimes, inconsistently",
        "Rarely or never",
      ],
      required: true,
      category: "symptoms",
      weight: 1.8,
    },
    {
      id: "treatment_goals",
      type: "multiple_choice",
      title: "What is your primary goal for ED treatment?",
      subtitle: "Understanding your goals helps us recommend the best approach",
      empathicMessage:
        "Your goals matter. Whether it's spontaneity, reliability, or confidence - we'll help you achieve them.",
      options: [
        "Reliable erections for planned intimacy",
        "Spontaneous ability without planning",
        "Improved confidence and self-esteem",
        "Better relationship satisfaction",
        "Return to previous function level",
      ],
      required: true,
      category: "goals",
      weight: 1.3,
    },
  ],
  educationalInserts: [
    {
      id: "ed_prevalence",
      type: "statistic",
      title: "You're Not Alone",
      content:
        "40% of men over 40 experience some form of ED. By age 70, nearly 70% of men have some degree of erectile dysfunction. It's one of the most common health issues men face.",
      icon: "👥",
      background: "bg-blue-50 dark:bg-blue-900/20",
      afterQuestion: "age_range",
    },
    {
      id: "blood_flow_education",
      type: "education",
      title: "Understanding Erectile Function",
      content:
        "Erections require healthy blood vessels, nerves, hormones, and psychology. ED medications like Viagra and Cialis work by improving blood flow to the penis during arousal.",
      icon: "🩺",
      background: "bg-red-50 dark:bg-red-900/20",
      afterQuestion: "ed_severity",
    },
    {
      id: "heart_connection",
      type: "fact",
      title: "ED and Heart Health Connection",
      content:
        "ED is often an early warning sign of heart disease. The blood vessels in the penis are smaller than those around the heart, so they show problems first. Treating ED can improve overall cardiovascular health.",
      icon: "❤️",
      background: "bg-rose-50 dark:bg-rose-900/20",
      afterQuestion: "cardiovascular_health",
    },
    {
      id: "success_rates",
      type: "statistic",
      title: "Treatment Success Rates",
      content:
        "ED medications are highly effective: Viagra works for 80% of men, Cialis for 85%, and Levitra for 80%. Most men find a medication that works well for them.",
      icon: "📊",
      background: "bg-green-50 dark:bg-green-900/20",
      afterQuestion: "medications",
    },
    {
      id: "lifestyle_impact",
      type: "encouragement",
      title: "Lifestyle Changes Make a Difference",
      content:
        "Simple changes can dramatically improve ED: 30 minutes of walking daily, quitting smoking, limiting alcohol, and managing stress. These changes work synergistically with medications.",
      icon: "💪",
      background: "bg-emerald-50 dark:bg-emerald-900/20",
      afterQuestion: "lifestyle_factors",
    },
  ],
  medications: [
    {
      id: "sildenafil",
      name: "Sildenafil (Viagra)",
      genericName: "sildenafil",
      dosages: ["25mg", "50mg", "100mg"],
      description:
        "The original ED medication with 4-hour effectiveness window",
      sideEffects: [
        "Headache",
        "Flushing",
        "Nasal congestion",
        "Visual changes",
        "Muscle aches",
      ],
      contraindications: [
        "Nitrate medications",
        "Severe heart disease",
        "Recent stroke/heart attack",
      ],
      cost: 70,
      effectiveness: 8,
      suitabilityFactors: {
        cardiovascular_health: -2.0,
        medications: -1.5,
        treatment_goals: 1.2,
      },
    },
    {
      id: "tadalafil",
      name: "Tadalafil (Cialis)",
      genericName: "tadalafil",
      dosages: ["2.5mg daily", "5mg daily", "10mg", "20mg"],
      description: "36-hour effectiveness window allowing for spontaneity",
      sideEffects: [
        "Headache",
        "Back pain",
        "Muscle aches",
        "Flushing",
        "Nasal congestion",
      ],
      contraindications: [
        "Nitrate medications",
        "Severe liver disease",
        "Severe heart disease",
      ],
      cost: 85,
      effectiveness: 9,
      suitabilityFactors: {
        treatment_goals: 2.0,
        cardiovascular_health: -1.8,
        lifestyle_factors: 1.5,
      },
    },
    {
      id: "vardenafil",
      name: "Vardenafil (Levitra)",
      genericName: "vardenafil",
      dosages: ["5mg", "10mg", "20mg"],
      description: "Fast-acting with fewer food interactions",
      sideEffects: ["Headache", "Flushing", "Nasal congestion", "Dizziness"],
      contraindications: [
        "Nitrate medications",
        "Severe heart disease",
        "QT prolongation",
      ],
      cost: 75,
      effectiveness: 8,
      suitabilityFactors: {
        diabetes_status: 1.8,
        cardiovascular_health: -2.0,
        age_range: 1.3,
      },
    },
  ],
  aiLogic: {
    scoringWeights: {
      cardiovascular_health: 2.5,
      medications: 2.2,
      ed_severity: 2.0,
      diabetes_status: 2.0,
      treatment_goals: 1.5,
    },
    contraIndicationRules: [
      {
        condition: 'medications includes "Heart medications (nitrates)"',
        result: "medication_contraindicated",
        message:
          "ED medications cannot be safely combined with nitrate medications due to dangerous blood pressure drops.",
      },
      {
        condition: 'cardiovascular_health includes "Recent heart attack"',
        result: "consultation_required",
        message:
          "Recent cardiovascular events require cardiology clearance before starting ED medications.",
      },
    ],
  },
};

// Continue with Skin Care and Hair Growth questionnaires...
export const SKIN_CARE_QUESTIONNAIRE: DynamicQuestionnaire = {
  id: "prescription_skincare",
  category: "Dermatology",
  title: "Personalized Prescription Skincare Assessment",
  description:
    "Professional evaluation to determine the most effective prescription treatments for your skin concerns",
  empathicIntro:
    "Your skin is unique, and so should be your treatment. We understand that skin concerns can affect confidence and self-esteem. Our goal is to help you achieve healthy, clear skin with safe, effective prescription treatments.",
  estimatedTime: "5-8 minutes",
  questions: [
    {
      id: "primary_concern",
      type: "multiple_choice",
      title: "What is your primary skin concern?",
      subtitle: "This helps us focus on the most effective treatments",
      empathicMessage:
        "Every skin concern is valid and treatable. The first step is identifying your main priority.",
      options: [
        "Acne and breakouts",
        "Signs of aging (wrinkles, fine lines)",
        "Hyperpigmentation and dark spots",
        "Melasma",
        "Rosacea and redness",
        "Rough texture and large pores",
        "Sun damage and age spots",
        "Combination of multiple concerns",
      ],
      required: true,
      category: "concerns",
      weight: 2.0,
    },
    {
      id: "skin_type",
      type: "multiple_choice",
      title: "How would you describe your skin type?",
      subtitle:
        "Skin type affects which products and concentrations are safest",
      empathicMessage:
        "Understanding your skin type prevents irritation and maximizes treatment effectiveness.",
      options: [
        "Oily - shiny, enlarged pores, frequent breakouts",
        "Dry - tight, flaky, rarely breaks out",
        "Combination - oily T-zone, dry cheeks",
        "Normal - balanced, few concerns",
        "Sensitive - easily irritated, reactive",
      ],
      required: true,
      category: "skin_type",
      weight: 1.8,
    },
    {
      id: "acne_severity",
      type: "multiple_choice",
      title: "If you have acne, how would you describe its severity?",
      subtitle: "Acne severity determines appropriate treatment strength",
      empathicMessage:
        "Acne affects people of all ages. The right treatment can dramatically improve your skin and confidence.",
      options: [
        "No current acne",
        "Mild - occasional pimples, mostly blackheads/whiteheads",
        "Moderate - regular breakouts, some inflammation",
        "Severe - frequent cystic acne, scarring",
        "Hormonal - breakouts around menstrual cycle",
      ],
      required: true,
      category: "acne",
      weight: 1.9,
      conditionalLogic: {
        showIf: { questionId: "primary_concern", value: "Acne and breakouts" },
      },
    },
    {
      id: "current_routine",
      type: "checkbox",
      title: "What does your current skincare routine include?",
      subtitle: "Current products affect how we introduce new prescriptions",
      empathicMessage:
        "Any routine is better than none. We'll help you optimize what you're already doing.",
      options: [
        "Daily cleanser",
        "Moisturizer",
        "Sunscreen (daily use)",
        "Retinol/retinoid products",
        "Vitamin C serum",
        "Salicylic acid/BHA",
        "Glycolic acid/AHA",
        "Benzoyl peroxide",
        "Prescription medications",
        "Just water and basic soap",
      ],
      required: true,
      category: "routine",
      weight: 1.4,
    },
    {
      id: "sun_exposure",
      type: "multiple_choice",
      title: "How much sun exposure do you typically get?",
      subtitle: "Sun exposure affects treatment choices and safety",
      empathicMessage:
        "Sun protection is crucial for healthy skin and maximizing treatment results.",
      options: [
        "Minimal - mostly indoors, always wear sunscreen",
        "Moderate - some outdoor time, usually wear sunscreen",
        "High - frequently outdoors, sometimes forget sunscreen",
        "Very high - work outside or frequent sun exposure",
        "Tanning bed use",
      ],
      required: true,
      category: "lifestyle",
      weight: 1.6,
    },
    {
      id: "age_range",
      type: "multiple_choice",
      title: "What is your age range?",
      subtitle: "Age influences skin concerns and treatment recommendations",
      empathicMessage:
        "Great skin is achievable at any age. Different life stages may need different approaches.",
      options: ["18-25", "26-35", "36-45", "46-55", "56-65", "65+"],
      required: true,
      category: "demographics",
      weight: 1.3,
    },
    {
      id: "hormonal_factors",
      type: "checkbox",
      title: "Do any of these hormonal factors apply to you?",
      subtitle: "Hormones significantly impact skin health",
      empathicMessage:
        "Hormonal influences on skin are completely normal and can be effectively managed.",
      options: [
        "Pregnancy or trying to conceive",
        "Breastfeeding",
        "Menopause or perimenopause",
        "PCOS (polycystic ovary syndrome)",
        "Irregular menstrual cycles",
        "Birth control use",
        "Hormone replacement therapy",
        "None of the above",
      ],
      required: true,
      category: "hormonal",
      weight: 1.7,
    },
    {
      id: "previous_treatments",
      type: "checkbox",
      title: "Which prescription treatments have you tried before?",
      subtitle: "Previous treatments guide our recommendations",
      empathicMessage:
        "Previous experiences, whether positive or negative, help us find what works best for you.",
      options: [
        "Tretinoin (Retin-A)",
        "Adapalene (Differin)",
        "Hydroquinone",
        "Topical antibiotics",
        "Oral antibiotics",
        "Birth control for acne",
        "Accutane (isotretinoin)",
        "Chemical peels",
        "Laser treatments",
        "None of the above",
      ],
      required: true,
      category: "history",
      weight: 1.5,
    },
    {
      id: "skin_sensitivity",
      type: "multiple_choice",
      title: "How does your skin typically react to new products?",
      subtitle: "Sensitivity level determines how to introduce treatments",
      empathicMessage:
        "Sensitive skin just needs a gentler approach. We can still achieve great results with patience.",
      options: [
        "Very tolerant - rarely have reactions",
        "Somewhat tolerant - occasional mild irritation",
        "Moderately sensitive - react to some products",
        "Very sensitive - react to many products",
        "Extremely sensitive - react to most new products",
      ],
      required: true,
      category: "sensitivity",
      weight: 1.8,
    },
    {
      id: "treatment_goals",
      type: "checkbox",
      title: "What are your main goals for prescription skincare?",
      subtitle: "Clear goals help us measure success",
      empathicMessage:
        "Your goals are our roadmap. Realistic expectations lead to the most satisfying results.",
      options: [
        "Clear existing acne",
        "Prevent future breakouts",
        "Reduce fine lines and wrinkles",
        "Even out skin tone",
        "Fade dark spots and hyperpigmentation",
        "Improve skin texture",
        "Minimize pore appearance",
        "Boost overall skin radiance",
        "Slow signs of aging",
      ],
      required: true,
      category: "goals",
      weight: 1.4,
    },
  ],
  educationalInserts: [
    {
      id: "prescription_benefits",
      type: "education",
      title: "Why Prescription Skincare?",
      content:
        "Prescription treatments contain higher concentrations of active ingredients than over-the-counter products. They're FDA-regulated for safety and efficacy, providing faster, more dramatic results.",
      icon: "💊",
      background: "bg-purple-50 dark:bg-purple-900/20",
      afterQuestion: "primary_concern",
    },
    {
      id: "retinoid_facts",
      type: "fact",
      title: "The Gold Standard: Retinoids",
      content:
        "Tretinoin is the only FDA-approved topical treatment proven to reverse signs of aging. It increases cell turnover, builds collagen, and is effective for both acne and anti-aging.",
      icon: "✨",
      background: "bg-yellow-50 dark:bg-yellow-900/20",
      afterQuestion: "skin_type",
    },
    {
      id: "patience_message",
      type: "encouragement",
      title: "Good Things Take Time",
      content:
        "Prescription skincare requires patience. Most people see initial results in 4-6 weeks, with significant improvement by 3-4 months. Consistency is key to success.",
      icon: "⏰",
      background: "bg-blue-50 dark:bg-blue-900/20",
      afterQuestion: "current_routine",
    },
    {
      id: "sun_protection_critical",
      type: "fact",
      title: "Sunscreen: Your Best Anti-Aging Tool",
      content:
        "90% of visible aging is caused by UV damage. Daily broad-spectrum SPF 30+ prevents further damage and allows treatments to work effectively. Non-negotiable for prescription retinoids.",
      icon: "☀️",
      background: "bg-orange-50 dark:bg-orange-900/20",
      afterQuestion: "sun_exposure",
    },
  ],
  medications: [
    {
      id: "tretinoin",
      name: "Tretinoin",
      genericName: "tretinoin",
      dosages: ["0.025%", "0.05%", "0.1%"],
      description: "The gold standard retinoid for acne and anti-aging",
      sideEffects: [
        "Initial dryness",
        "Peeling",
        "Redness",
        "Increased sun sensitivity",
      ],
      contraindications: ["Pregnancy", "Breastfeeding", "Eczema flares"],
      cost: 60,
      effectiveness: 9,
      suitabilityFactors: {
        primary_concern: 2.0,
        skin_sensitivity: -1.5,
        hormonal_factors: -2.0,
        treatment_goals: 1.8,
      },
    },
    {
      id: "hydroquinone",
      name: "Hydroquinone",
      genericName: "hydroquinone",
      dosages: ["2%", "4%"],
      description:
        "Prescription-strength lightening agent for hyperpigmentation",
      sideEffects: [
        "Mild irritation",
        "Temporary redness",
        "Increased sun sensitivity",
      ],
      contraindications: ["Pregnancy", "Breastfeeding", "Sensitive skin"],
      cost: 45,
      effectiveness: 8,
      suitabilityFactors: {
        primary_concern: 1.8,
        skin_type: 1.2,
        sun_exposure: -1.8,
        age_range: 1.5,
      },
    },
    {
      id: "clindamycin",
      name: "Clindamycin",
      genericName: "clindamycin phosphate",
      dosages: ["1% gel", "1% solution", "1% lotion"],
      description: "Topical antibiotic for inflammatory acne",
      sideEffects: ["Mild dryness", "Peeling", "Burning sensation"],
      contraindications: ["History of antibiotic-associated colitis"],
      cost: 35,
      effectiveness: 7,
      suitabilityFactors: {
        acne_severity: 2.0,
        skin_type: 1.3,
        previous_treatments: 1.5,
      },
    },
  ],
  aiLogic: {
    scoringWeights: {
      primary_concern: 2.0,
      skin_sensitivity: 1.8,
      hormonal_factors: 1.7,
      acne_severity: 1.9,
      treatment_goals: 1.4,
    },
    contraIndicationRules: [
      {
        condition: 'hormonal_factors includes "Pregnancy"',
        result: "medication_contraindicated",
        message:
          "Retinoids and hydroquinone are not safe during pregnancy. Alternative treatments are available.",
      },
      {
        condition: 'skin_sensitivity equals "Extremely sensitive"',
        result: "consultation_required",
        message:
          "Very sensitive skin requires careful product selection and monitoring by a dermatologist.",
      },
    ],
  },
};

export const HAIR_GROWTH_QUESTIONNAIRE: DynamicQuestionnaire = {
  id: "hair_growth_treatment",
  category: "Hair Restoration",
  title: "Comprehensive Hair Loss Treatment Assessment",
  description:
    "Personalized evaluation to determine the most effective hair restoration treatments",
  empathicIntro:
    "Hair loss affects confidence and self-image. You're not alone - 85% of men and 40% of women experience significant hair loss. The good news is that modern treatments can slow, stop, and even reverse hair loss when started early.",
  estimatedTime: "6-9 minutes",
  questions: [
    {
      id: "gender",
      type: "multiple_choice",
      title: "What is your gender?",
      subtitle:
        "Hair loss patterns and treatments differ between men and women",
      empathicMessage:
        "Hair loss affects all genders, but treatment approaches may differ based on hormonal factors.",
      options: ["Male", "Female", "Non-binary", "Prefer not to say"],
      required: true,
      category: "demographics",
      weight: 1.8,
    },
    {
      id: "age_range",
      type: "multiple_choice",
      title: "What is your age range?",
      subtitle: "Age affects hair loss progression and treatment options",
      empathicMessage:
        "Hair loss can start as early as the teens or as late as the 60s. Earlier treatment generally yields better results.",
      options: ["18-25", "26-35", "36-45", "46-55", "56-65", "65+"],
      required: true,
      category: "demographics",
      weight: 1.5,
    },
    {
      id: "hair_loss_pattern",
      type: "multiple_choice",
      title: "How would you describe your hair loss pattern?",
      subtitle: "Different patterns suggest different causes and treatments",
      empathicMessage:
        "Identifying your pattern helps us understand the underlying cause and choose the most effective treatment.",
      options: [
        "Receding hairline and crown thinning (male pattern)",
        "Diffuse thinning all over (female pattern)",
        "Patchy round spots (alopecia areata)",
        "Sudden overall thinning",
        "Hair loss after illness/stress",
        "Gradual thinning over years",
        "Mostly crown/vertex thinning",
        "Frontal hairline recession only",
      ],
      required: true,
      category: "pattern",
      weight: 2.0,
    },
    {
      id: "hair_loss_severity",
      type: "multiple_choice",
      title: "How would you rate your current hair loss?",
      subtitle:
        "The Norwood (men) or Ludwig (women) scale helps standardize assessment",
      empathicMessage:
        "Honest assessment helps us understand what results to expect and which treatments will be most effective.",
      options: [
        "Minimal - slight recession or thinning",
        "Mild - noticeable but still good coverage",
        "Moderate - obvious thinning, some scalp visible",
        "Advanced - significant loss, scalp clearly visible",
        "Severe - very little hair remaining",
      ],
      required: true,
      category: "severity",
      weight: 2.0,
    },
    {
      id: "duration",
      type: "multiple_choice",
      title: "How long have you been losing hair?",
      subtitle: "Duration affects treatment urgency and expected outcomes",
      empathicMessage:
        "Whether recent or long-standing, there are effective treatments available. Early intervention is ideal.",
      options: [
        "Less than 6 months",
        "6 months to 1 year",
        "1-3 years",
        "3-5 years",
        "More than 5 years",
      ],
      required: true,
      category: "timeline",
      weight: 1.6,
    },
    {
      id: "family_history",
      type: "checkbox",
      title: "Who in your family has experienced hair loss?",
      subtitle: "Genetics play a major role in pattern hair loss",
      empathicMessage:
        "Family history helps predict your hair loss progression, but genetics isn't destiny - treatments can change the outcome.",
      options: [
        "Father",
        "Mother",
        "Maternal grandfather",
        "Paternal grandfather",
        "Brothers",
        "Sisters",
        "Aunts/uncles",
        "No family history of hair loss",
      ],
      required: true,
      category: "genetics",
      weight: 1.7,
    },
    {
      id: "medical_conditions",
      type: "checkbox",
      title: "Do you have any of these medical conditions?",
      subtitle: "Medical conditions can cause or worsen hair loss",
      empathicMessage:
        "Many medical conditions affect hair growth. Treating underlying conditions often improves hair loss.",
      options: [
        "Thyroid disorders",
        "Autoimmune conditions",
        "PCOS (women)",
        "Diabetes",
        "Iron deficiency/anemia",
        "Hormonal imbalances",
        "Scalp conditions (psoriasis, seborrheic dermatitis)",
        "Recent major surgery/illness",
        "None of the above",
      ],
      required: true,
      category: "medical_history",
      weight: 1.9,
    },
    {
      id: "medications",
      type: "checkbox",
      title: "Are you taking any medications that might affect hair?",
      subtitle: "Some medications can cause temporary or permanent hair loss",
      empathicMessage:
        "Many medications affect hair growth. Don't stop medications, but understanding their effects helps guide treatment.",
      options: [
        "Blood thinners",
        "Antidepressants",
        "Blood pressure medications",
        "Cholesterol medications",
        "Birth control pills",
        "Hormone replacement therapy",
        "Chemotherapy (current or past)",
        "Steroids",
        "Seizure medications",
        "None of the above",
      ],
      required: true,
      category: "medications",
      weight: 1.7,
    },
    {
      id: "lifestyle_factors",
      type: "checkbox",
      title: "Which lifestyle factors might be affecting your hair?",
      subtitle:
        "Lifestyle factors can accelerate hair loss or slow treatment response",
      empathicMessage:
        "Lifestyle factors are within your control. Small changes can significantly improve hair health.",
      options: [
        "High stress levels",
        "Poor diet/nutrition",
        "Frequent tight hairstyles",
        "Excessive heat styling",
        "Chemical treatments (bleach, perms)",
        "Smoking",
        "Excessive alcohol consumption",
        "Lack of sleep",
        "Crash dieting/eating disorders",
        "Healthy lifestyle overall",
      ],
      required: true,
      category: "lifestyle",
      weight: 1.4,
    },
    {
      id: "current_treatments",
      type: "checkbox",
      title: "What hair loss treatments have you tried?",
      subtitle: "Previous treatments guide our recommendations",
      empathicMessage:
        "Every treatment attempt provides valuable information about what works for your specific type of hair loss.",
      options: [
        "Over-the-counter minoxidil (Rogaine)",
        "Prescription finasteride (Propecia)",
        "Biotin/hair vitamins",
        "Hair transplant surgery",
        "Laser therapy",
        "Platelet-rich plasma (PRP)",
        "Hair growth shampoos",
        "Essential oils/natural remedies",
        "None - this is my first treatment attempt",
      ],
      required: true,
      category: "treatment_history",
      weight: 1.5,
    },
    {
      id: "treatment_goals",
      type: "multiple_choice",
      title: "What is your primary goal for hair loss treatment?",
      subtitle: "Clear goals help us recommend the most appropriate treatments",
      empathicMessage:
        "Your goals are important. Realistic expectations lead to better satisfaction with treatment outcomes.",
      options: [
        "Stop further hair loss",
        "Regrow lost hair",
        "Improve hair thickness/density",
        "Restore hairline",
        "Maintain current hair",
        "Boost confidence and self-esteem",
        "Look younger/more attractive",
      ],
      required: true,
      category: "goals",
      weight: 1.3,
    },
    {
      id: "treatment_commitment",
      type: "multiple_choice",
      title: "How long are you willing to commit to treatment?",
      subtitle:
        "Hair growth treatments require long-term commitment for best results",
      empathicMessage:
        "Hair growth is a slow process. Most treatments need 6-12 months to show results, with continued use for maintenance.",
      options: [
        "3-6 months to try it out",
        "6-12 months for initial results",
        "1-2 years for significant improvement",
        "Long-term commitment as needed",
        "Uncertain about timeline",
      ],
      required: true,
      category: "commitment",
      weight: 1.4,
    },
  ],
  educationalInserts: [
    {
      id: "hair_loss_statistics",
      type: "statistic",
      title: "Hair Loss is Common",
      content:
        "85% of men will have significantly thinning hair by age 50. 40% of women will experience hair loss by age 40. You're joining millions who are taking action to address this common concern.",
      icon: "📊",
      background: "bg-blue-50 dark:bg-blue-900/20",
      afterQuestion: "gender",
    },
    {
      id: "hair_growth_cycle",
      type: "education",
      title: "Understanding Hair Growth",
      content:
        "Hair grows in cycles: growth (anagen), transition (catagen), and rest (telogen). DHT hormone shortens the growth phase in pattern baldness. Treatments work by blocking DHT or extending the growth phase.",
      icon: "🔄",
      background: "bg-green-50 dark:bg-green-900/20",
      afterQuestion: "hair_loss_pattern",
    },
    {
      id: "early_treatment_benefits",
      type: "fact",
      title: "Early Treatment = Better Results",
      content:
        "Hair follicles that have been dormant for less than 2 years have the best chance of responding to treatment. Starting early can prevent further loss and potentially regrow hair.",
      icon: "⏰",
      background: "bg-yellow-50 dark:bg-yellow-900/20",
      afterQuestion: "duration",
    },
    {
      id: "treatment_success_rates",
      type: "statistic",
      title: "Treatment Success Rates",
      content:
        "Finasteride stops hair loss in 90% of men and regrows hair in 65%. Minoxidil stops loss in 85% and regrows hair in 40%. Combining treatments increases success rates significantly.",
      icon: "📈",
      background: "bg-emerald-50 dark:bg-emerald-900/20",
      afterQuestion: "current_treatments",
    },
    {
      id: "patience_required",
      type: "encouragement",
      title: "Patience Brings Results",
      content:
        "Hair growth is slow - it takes 6 months to see initial results, 12 months for significant improvement. The hair you save today and the hair you regrow is worth the wait.",
      icon: "🌱",
      background: "bg-purple-50 dark:bg-purple-900/20",
      afterQuestion: "treatment_commitment",
    },
  ],
  medications: [
    {
      id: "finasteride",
      name: "Finasteride",
      genericName: "finasteride",
      dosages: ["1mg daily"],
      description:
        "Oral DHT blocker that stops hair loss and promotes regrowth",
      sideEffects: [
        "Decreased libido",
        "Erectile dysfunction",
        "Decreased ejaculation volume",
        "Breast tenderness",
      ],
      contraindications: ["Women of childbearing age", "Liver disease"],
      cost: 30,
      effectiveness: 9,
      suitabilityFactors: {
        gender: 2.0,
        hair_loss_severity: 1.8,
        age_range: 1.5,
        treatment_goals: 1.7,
      },
    },
    {
      id: "minoxidil",
      name: "Minoxidil",
      genericName: "minoxidil",
      dosages: ["5% solution", "5% foam"],
      description: "Topical vasodilator that stimulates hair growth",
      sideEffects: [
        "Scalp irritation",
        "Unwanted facial hair growth",
        "Initial increased shedding",
      ],
      contraindications: ["Scalp conditions", "Heart conditions"],
      cost: 25,
      effectiveness: 7,
      suitabilityFactors: {
        hair_loss_pattern: 1.5,
        medical_conditions: 1.3,
        treatment_commitment: 1.4,
      },
    },
    {
      id: "dutasteride",
      name: "Dutasteride",
      genericName: "dutasteride",
      dosages: ["0.5mg daily"],
      description: "More potent DHT blocker for advanced hair loss",
      sideEffects: [
        "Decreased libido",
        "Erectile dysfunction",
        "Breast enlargement",
      ],
      contraindications: ["Women", "Liver disease", "Prostate cancer"],
      cost: 45,
      effectiveness: 9,
      suitabilityFactors: {
        hair_loss_severity: 2.0,
        previous_treatments: 1.8,
        age_range: 1.6,
      },
    },
  ],
  aiLogic: {
    scoringWeights: {
      hair_loss_severity: 2.0,
      gender: 1.8,
      hair_loss_pattern: 1.7,
      medical_conditions: 1.9,
      treatment_goals: 1.3,
    },
    contraIndicationRules: [
      {
        condition:
          'gender equals "Female" AND medications includes "None of the above"',
        result: "consultation_required",
        message:
          "Women's hair loss requires specialized evaluation as finasteride is not recommended for women of childbearing age.",
      },
      {
        condition: 'medical_conditions includes "Recent major surgery/illness"',
        result: "consultation_required",
        message:
          "Acute hair loss after illness may be temporary and require different treatment approaches.",
      },
    ],
  },
};

// AI Prescription Logic
export class PrescriptionAI {
  static calculateMedicationScore(
    responses: Record<string, any>,
    medication: Medication,
    questionnaire: DynamicQuestionnaire,
  ): number {
    let score = medication.effectiveness;

    // Apply suitability factors
    Object.entries(medication.suitabilityFactors).forEach(
      ([questionId, factor]) => {
        const response = responses[questionId];
        if (response) {
          if (Array.isArray(response)) {
            score += response.length * factor * 0.1;
          } else if (typeof response === "string") {
            score += factor * 0.2;
          }
        }
      },
    );

    // Apply AI logic weights
    Object.entries(questionnaire.aiLogic.scoringWeights).forEach(
      ([questionId, weight]) => {
        const response = responses[questionId];
        if (response) {
          if (Array.isArray(response)) {
            score += response.length * weight * 0.15;
          } else {
            score += weight * 0.1;
          }
        }
      },
    );

    return Math.max(0, Math.min(10, score));
  }

  static checkContraindications(
    responses: Record<string, any>,
    questionnaire: DynamicQuestionnaire,
  ): { hasContraindications: boolean; message?: string; result?: string } {
    for (const rule of questionnaire.aiLogic.contraIndicationRules) {
      if (this.evaluateCondition(rule.condition, responses)) {
        return {
          hasContraindications: true,
          message: rule.message,
          result: rule.result,
        };
      }
    }
    return { hasContraindications: false };
  }

  private static evaluateCondition(
    condition: string,
    responses: Record<string, any>,
  ): boolean {
    // Simple condition parser - in real implementation, use a proper parser
    if (condition.includes("includes")) {
      const [field, value] = condition
        .split(" includes ")
        .map((s) => s.trim().replace(/"/g, ""));
      const response = responses[field];
      return Array.isArray(response) && response.includes(value);
    }

    if (condition.includes("equals")) {
      const [field, value] = condition
        .split(" equals ")
        .map((s) => s.trim().replace(/"/g, ""));
      return responses[field] === value;
    }

    return false;
  }

  static generateRecommendation(
    responses: Record<string, any>,
    questionnaire: DynamicQuestionnaire,
  ) {
    // Check contraindications first
    const contraCheck = this.checkContraindications(responses, questionnaire);
    if (contraCheck.hasContraindications) {
      return {
        type: contraCheck.result,
        message: contraCheck.message,
        medications: [],
        confidence: 95,
      };
    }

    // Score all medications
    const scoredMedications = questionnaire.medications
      .map((med) => ({
        ...med,
        score: this.calculateMedicationScore(responses, med, questionnaire),
      }))
      .sort((a, b) => b.score - a.score);

    const topMedication = scoredMedications[0];
    const confidence = Math.min(95, Math.max(60, topMedication.score * 10));

    return {
      type: "approved",
      primaryRecommendation: topMedication,
      alternativeOptions: scoredMedications.slice(1, 3),
      confidence,
      reasoning: this.generateReasoning(
        responses,
        topMedication,
        questionnaire,
      ),
    };
  }

  private static generateReasoning(
    responses: Record<string, any>,
    medication: Medication,
    questionnaire: DynamicQuestionnaire,
  ): string[] {
    const reasons = [
      `${medication.name} is recommended based on your specific health profile`,
      `Clinical effectiveness rating: ${medication.effectiveness}/10`,
      `Cost-effective option at $${medication.cost} per month`,
    ];

    // Add specific reasoning based on responses
    const primaryConcern =
      responses[
        questionnaire.questions.find((q) => q.category === "concerns")?.id || ""
      ];
    if (primaryConcern) {
      reasons.push(
        `Specifically effective for ${primaryConcern.toLowerCase()}`,
      );
    }

    return reasons;
  }
}

export const ALL_QUESTIONNAIRES = [
  GLP1_QUESTIONNAIRE,
  MENS_ED_QUESTIONNAIRE,
  SKIN_CARE_QUESTIONNAIRE,
  HAIR_GROWTH_QUESTIONNAIRE,
];
