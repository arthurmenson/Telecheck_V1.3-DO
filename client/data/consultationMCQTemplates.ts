// Comprehensive MCQ Templates for Treatments Requiring Consultation
// Designed with empathetic, reactive approach following Hims model

export interface MCQQuestion {
  id: string;
  type: "multiple_choice" | "checkbox" | "boolean" | "rating";
  title: string;
  subtitle?: string; // Supportive sub-message
  description?: string;
  supportiveMessage?: string; // Empathetic guidance
  required: boolean;
  options?: string[];
  riskWeight?: number; // 1-5 scale for risk assessment
  category: string;
  followUpLogic?: {
    condition: string;
    action: "require_consultation" | "continue" | "redirect_to_question";
    target?: string;
    supportMessage?: string; // Reassuring message for high-risk responses
  };
  progressWeight?: number; // For progress calculation
}

export interface ConsultationMCQ {
  id: string;
  name: string;
  description: string;
  empathicIntro: string; // Welcoming introduction
  category: string;
  estimatedTime: string;
  riskThreshold: number; // Total risk score threshold for requiring consultation
  questions: MCQQuestion[];
  consultationCriteria: string[];
  supportiveClosing: string; // Reassuring closing message
  nextStepsMessage: string; // What happens next
}

export const CONSULTATION_MCQ_TEMPLATES: ConsultationMCQ[] = [
  {
    id: "mental_health_screening",
    name: "Mental Health & Wellness Assessment",
    description:
      "A caring evaluation to understand your mental health needs and provide personalized support",
    empathicIntro:
      "We're here to support your mental wellness journey. This confidential assessment helps us understand how you're feeling and create a care plan that's right for you. Take your time - there are no wrong answers.",
    category: "Mental Health",
    estimatedTime: "8-12 minutes",
    riskThreshold: 15,
    consultationCriteria: [
      "Moderate to severe depression symptoms (PHQ-9 score ≥ 10)",
      "Significant anxiety levels (GAD-7 score ≥ 10)",
      "Thoughts of self-harm or suicide",
      "Substance use concerns affecting daily life",
      "Previous mental health hospitalizations",
    ],
    supportiveClosing:
      "Thank you for sharing openly with us. Your responses help us provide the best possible care for your unique situation.",
    nextStepsMessage:
      "Based on your responses, we'll connect you with the right mental health professional who understands your needs.",
    questions: [
      {
        id: "mh_001",
        type: "multiple_choice",
        title:
          "Over the past 2 weeks, how often have you been feeling down, depressed, or hopeless?",
        subtitle: "Your feelings are valid, and we're here to help",
        supportiveMessage:
          "Many people experience these feelings. Recognizing them is an important first step toward feeling better.",
        required: true,
        category: "depression_screening",
        riskWeight: 3,
        progressWeight: 1,
        options: [
          "Not at all",
          "Several days",
          "More than half the days",
          "Nearly every day",
        ],
        followUpLogic: {
          condition: "Nearly every day",
          action: "require_consultation",
          supportMessage:
            "It takes courage to share how you're feeling. A mental health professional can provide specialized support for what you're experiencing.",
        },
      },
      {
        id: "mh_002",
        type: "multiple_choice",
        title:
          "How often have you had little interest or pleasure in activities you usually enjoy?",
        subtitle: "It's common for mood changes to affect our interests",
        supportiveMessage:
          "Loss of interest in activities is a common experience that many people go through.",
        required: true,
        category: "depression_screening",
        riskWeight: 3,
        progressWeight: 1,
        options: [
          "Not at all",
          "Several days",
          "More than half the days",
          "Nearly every day",
        ],
      },
      {
        id: "mh_003",
        type: "multiple_choice",
        title: "How often have you been feeling nervous, anxious, or on edge?",
        subtitle: "Anxiety affects many people - you're not alone",
        supportiveMessage:
          "Feeling anxious is a natural response to stress. We can help you find ways to manage these feelings.",
        required: true,
        category: "anxiety_screening",
        riskWeight: 3,
        progressWeight: 1,
        options: [
          "Not at all",
          "Several days",
          "More than half the days",
          "Nearly every day",
        ],
      },
      {
        id: "mh_004",
        type: "multiple_choice",
        title: "How often have you been unable to stop or control worrying?",
        subtitle: "Persistent worry can be exhausting",
        supportiveMessage:
          "When worry feels uncontrollable, professional support can provide effective strategies to help.",
        required: true,
        category: "anxiety_screening",
        riskWeight: 3,
        progressWeight: 1,
        options: [
          "Not at all",
          "Several days",
          "More than half the days",
          "Nearly every day",
        ],
      },
      {
        id: "mh_005",
        type: "boolean",
        title:
          "Have you had thoughts that you would be better off dead or of hurting yourself?",
        subtitle: "This is a safe space to share difficult thoughts",
        supportiveMessage:
          "If you're having these thoughts, please know that help is available and you deserve support.",
        required: true,
        category: "suicide_risk",
        riskWeight: 5,
        progressWeight: 2,
        followUpLogic: {
          condition: "Yes",
          action: "require_consultation",
          supportMessage:
            "Thank you for trusting us with this. We want to ensure you get immediate professional support. You are not alone, and there are people who can help.",
        },
      },
      {
        id: "mh_006",
        type: "checkbox",
        title: "Which symptoms have you experienced recently?",
        subtitle: "Select any that apply to your recent experience",
        supportiveMessage:
          "These symptoms are more common than you might think, and they're all treatable.",
        required: true,
        category: "symptom_assessment",
        riskWeight: 2,
        progressWeight: 1,
        options: [
          "Changes in sleep (too much or too little)",
          "Feeling tired or low energy",
          "Changes in appetite",
          "Difficulty concentrating",
          "Feeling restless or slowed down",
          "Feelings of guilt or worthlessness",
          "Panic attacks",
          "Avoiding social situations",
          "None of these",
        ],
      },
      {
        id: "mh_007",
        type: "multiple_choice",
        title: "Have you ever received a mental health diagnosis?",
        subtitle: "Previous diagnoses help us understand your history",
        supportiveMessage:
          "Mental health conditions are medical conditions like any other, and treatment can be very effective.",
        required: true,
        category: "medical_history",
        riskWeight: 2,
        progressWeight: 1,
        options: [
          "No previous diagnoses",
          "Depression",
          "Anxiety disorder",
          "Bipolar disorder",
          "Other mental health condition",
          "Multiple conditions",
          "Prefer not to say",
        ],
      },
      {
        id: "mh_008",
        type: "boolean",
        title: "Are you currently taking any mental health medications?",
        subtitle: "This helps us understand your current treatment",
        supportiveMessage:
          "Medication can be an important part of mental health care when prescribed appropriately.",
        required: true,
        category: "medication_history",
        riskWeight: 1,
        progressWeight: 1,
      },
      {
        id: "mh_009",
        type: "multiple_choice",
        title: "How would you describe your current stress level?",
        subtitle: "Stress affects everyone differently",
        supportiveMessage:
          "High stress is incredibly common. Learning to manage stress is a skill we can help you develop.",
        required: true,
        category: "stress_assessment",
        riskWeight: 2,
        progressWeight: 1,
        options: [
          "Very manageable",
          "Somewhat manageable",
          "Moderately stressful",
          "Very stressful",
          "Overwhelming",
        ],
      },
      {
        id: "mh_010",
        type: "multiple_choice",
        title:
          "How often do you use alcohol or substances to cope with difficult emotions?",
        subtitle: "Honest answers help us provide better care",
        supportiveMessage:
          "Many people use substances to cope. There's no judgment here - only a desire to help you find healthier ways to feel better.",
        required: true,
        category: "substance_use",
        riskWeight: 3,
        progressWeight: 1,
        options: [
          "Never",
          "Rarely (less than once a month)",
          "Sometimes (1-3 times per month)",
          "Often (1-3 times per week)",
          "Daily or almost daily",
        ],
        followUpLogic: {
          condition: "Daily or almost daily",
          action: "require_consultation",
          supportMessage:
            "Using substances daily to cope can be concerning. A specialist can help you develop healthier coping strategies.",
        },
      },
    ],
  },
  {
    id: "cardiovascular_risk",
    name: "Heart Health Assessment",
    description:
      "A comprehensive evaluation to understand your cardiovascular health and risk factors",
    empathicIntro:
      "Your heart health is important to us. This assessment helps us understand your cardiovascular risk factors and create a personalized plan to keep your heart healthy. We'll take this journey together, one step at a time.",
    category: "Cardiology",
    estimatedTime: "6-10 minutes",
    riskThreshold: 12,
    consultationCriteria: [
      "Chest pain with physical activity",
      "Strong family history of early heart disease",
      "Multiple cardiovascular risk factors",
      "Previous heart-related events",
      "Diabetes with cardiovascular complications",
    ],
    supportiveClosing:
      "Thank you for providing detailed information about your heart health. This helps us create the most effective care plan for you.",
    nextStepsMessage:
      "We'll review your responses and connect you with a cardiovascular specialist if needed to ensure your heart stays healthy.",
    questions: [
      {
        id: "cv_001",
        type: "multiple_choice",
        title: "Do you experience any chest discomfort or pain?",
        subtitle: "Any chest symptoms are important to discuss",
        supportiveMessage:
          "Chest pain can have many causes. Sharing this information helps us determine the best next steps for your care.",
        required: true,
        category: "symptoms",
        riskWeight: 4,
        progressWeight: 2,
        options: [
          "No chest discomfort",
          "Only with very intense exercise",
          "With moderate exercise or stress",
          "With light activity",
          "Even at rest",
        ],
        followUpLogic: {
          condition: "Even at rest",
          action: "require_consultation",
          supportMessage:
            "Chest pain at rest needs prompt medical attention. We'll ensure you get the care you need right away.",
        },
      },
      {
        id: "cv_002",
        type: "multiple_choice",
        title: "What is your age?",
        subtitle: "Age is one factor in heart health risk",
        supportiveMessage:
          "While age affects heart health risk, there are many ways to maintain a healthy heart at any age.",
        required: true,
        category: "demographics",
        riskWeight: 2,
        progressWeight: 1,
        options: [
          "Under 40 years",
          "40-49 years",
          "50-59 years",
          "60-69 years",
          "70+ years",
        ],
      },
      {
        id: "cv_003",
        type: "boolean",
        title:
          "Has anyone in your immediate family had heart disease before age 60?",
        subtitle: "Family history helps us understand your risk",
        supportiveMessage:
          "Family history is just one piece of the puzzle. Many heart conditions are preventable with the right care.",
        required: true,
        category: "family_history",
        riskWeight: 3,
        progressWeight: 1,
      },
      {
        id: "cv_004",
        type: "multiple_choice",
        title: "What is your history with smoking?",
        subtitle: "Your honest answer helps us provide the best guidance",
        supportiveMessage:
          "Whether you smoke or have quit, we're here to support your heart health without judgment.",
        required: true,
        category: "lifestyle",
        riskWeight: 3,
        progressWeight: 1,
        options: [
          "Never smoked",
          "Quit more than a year ago",
          "Quit within the past year",
          "Currently smoke less than a pack a day",
          "Currently smoke a pack or more daily",
        ],
      },
      {
        id: "cv_005",
        type: "checkbox",
        title: "Do you have any of these health conditions?",
        subtitle: "These conditions can affect heart health",
        supportiveMessage:
          "Having these conditions doesn't mean you can't have a healthy heart. Proper management makes all the difference.",
        required: true,
        category: "medical_conditions",
        riskWeight: 3,
        progressWeight: 1,
        options: [
          "High blood pressure",
          "Diabetes",
          "High cholesterol",
          "Obesity (BMI over 30)",
          "Sleep apnea",
          "Kidney disease",
          "Previous stroke",
          "None of these",
        ],
      },
      {
        id: "cv_006",
        type: "multiple_choice",
        title: "How often do you get physical exercise?",
        subtitle: "Exercise is a powerful tool for heart health",
        supportiveMessage:
          "No matter your current activity level, we can help you find safe and enjoyable ways to move more.",
        required: true,
        category: "lifestyle",
        riskWeight: 2,
        progressWeight: 1,
        options: [
          "Daily vigorous exercise",
          "3-4 times per week",
          "1-2 times per week",
          "Rarely (less than weekly)",
          "Never exercise",
        ],
      },
      {
        id: "cv_007",
        type: "checkbox",
        title: "Have you experienced any of these symptoms recently?",
        subtitle: "These symptoms can be related to heart health",
        supportiveMessage:
          "Many of these symptoms have treatable causes. Sharing them helps us provide the best care.",
        required: true,
        category: "symptoms",
        riskWeight: 3,
        progressWeight: 1,
        options: [
          "Shortness of breath with activity",
          "Shortness of breath at rest",
          "Swelling in legs or ankles",
          "Irregular heartbeat",
          "Dizziness or lightheadedness",
          "Fatigue with minimal activity",
          "None of these",
        ],
      },
      {
        id: "cv_008",
        type: "multiple_choice",
        title: "How would you rate your stress level?",
        subtitle: "Stress can impact heart health",
        supportiveMessage:
          "Stress affects everyone. Learning to manage stress is an important part of heart health.",
        required: true,
        category: "lifestyle",
        riskWeight: 2,
        progressWeight: 1,
        options: [
          "Very low stress",
          "Low stress",
          "Moderate stress",
          "High stress",
          "Very high stress",
        ],
      },
    ],
  },
  {
    id: "diabetes_management",
    name: "Diabetes Care Assessment",
    description:
      "A supportive evaluation to help optimize your diabetes management and overall health",
    empathicIntro:
      "Managing diabetes can feel overwhelming, but you're not alone. This assessment helps us understand your current situation so we can support you in living well with diabetes. Every small step forward matters.",
    category: "Endocrinology",
    estimatedTime: "5-8 minutes",
    riskThreshold: 10,
    consultationCriteria: [
      "HbA1c above 9% or unknown levels",
      "Frequent low blood sugar episodes",
      "Diabetes-related complications",
      "Difficulty managing blood sugar",
      "Recent diabetes diagnosis needing support",
    ],
    supportiveClosing:
      "Thank you for sharing details about your diabetes management. This information helps us provide personalized support for your health goals.",
    nextStepsMessage:
      "We'll review your diabetes management and connect you with specialists who can help optimize your care and quality of life.",
    questions: [
      {
        id: "dm_001",
        type: "multiple_choice",
        title: "What was your most recent HbA1c level?",
        subtitle: "This number shows your average blood sugar over 2-3 months",
        supportiveMessage:
          "Your HbA1c is just one piece of information. We can work together to improve your numbers, no matter where you're starting.",
        required: true,
        category: "glucose_control",
        riskWeight: 4,
        progressWeight: 2,
        options: [
          "Under 7% (excellent control)",
          "7-8% (good control)",
          "8-9% (needs improvement)",
          "Over 9% (needs immediate attention)",
          "I don't know my HbA1c level",
        ],
        followUpLogic: {
          condition: "Over 9% (needs immediate attention)",
          action: "require_consultation",
          supportMessage:
            "An HbA1c over 9% means your diabetes needs more intensive management. A specialist can help you get back on track safely.",
        },
      },
      {
        id: "dm_002",
        type: "multiple_choice",
        title: "How often do you check your blood sugar?",
        subtitle: "Regular monitoring helps you stay in control",
        supportiveMessage:
          "Blood sugar monitoring can feel burdensome, but it's one of the most powerful tools you have for managing diabetes.",
        required: true,
        category: "monitoring",
        riskWeight: 2,
        progressWeight: 1,
        options: [
          "Multiple times daily as recommended",
          "Once daily",
          "A few times per week",
          "Rarely",
          "Never",
        ],
      },
      {
        id: "dm_003",
        type: "multiple_choice",
        title: "How often have you had low blood sugar episodes recently?",
        subtitle: "Low blood sugar can be scary and dangerous",
        supportiveMessage:
          "Frequent low blood sugar episodes are concerning but manageable with the right adjustments to your treatment plan.",
        required: true,
        category: "hypoglycemia",
        riskWeight: 3,
        progressWeight: 2,
        options: [
          "Never",
          "1-2 times this month",
          "3-5 times this month",
          "6-10 times this month",
          "More than 10 times this month",
        ],
        followUpLogic: {
          condition: "More than 10 times this month",
          action: "require_consultation",
          supportMessage:
            "Frequent low blood sugar episodes need immediate attention. A diabetes specialist can help adjust your treatment to prevent these dangerous episodes.",
        },
      },
      {
        id: "dm_004",
        type: "checkbox",
        title: "Do you have any diabetes-related complications?",
        subtitle: "Complications can be managed and prevented from worsening",
        supportiveMessage:
          "Having complications doesn't mean you can't live well with diabetes. Proper care can prevent them from getting worse.",
        required: true,
        category: "complications",
        riskWeight: 4,
        progressWeight: 1,
        options: [
          "Eye problems (diabetic retinopathy)",
          "Kidney problems (diabetic nephropathy)",
          "Nerve problems (diabetic neuropathy)",
          "Foot problems or slow-healing wounds",
          "Heart disease",
          "High blood pressure",
          "None of these",
        ],
      },
      {
        id: "dm_005",
        type: "boolean",
        title:
          "Are you taking your diabetes medications exactly as prescribed?",
        subtitle: "It's okay if this is challenging sometimes",
        supportiveMessage:
          "Taking medications consistently can be difficult. If you're struggling, we can find solutions that work better for your lifestyle.",
        required: true,
        category: "medication_adherence",
        riskWeight: 3,
        progressWeight: 1,
      },
      {
        id: "dm_006",
        type: "multiple_choice",
        title: "How confident do you feel managing your diabetes day-to-day?",
        subtitle: "Your confidence matters for successful management",
        supportiveMessage:
          "Feeling overwhelmed by diabetes management is normal. We can provide education and support to help you feel more confident.",
        required: true,
        category: "self_management",
        riskWeight: 2,
        progressWeight: 1,
        options: [
          "Very confident - I manage very well",
          "Somewhat confident - I do okay most days",
          "Neutral - some days are better than others",
          "Not very confident - I struggle often",
          "Not confident at all - I need lots of help",
        ],
      },
      {
        id: "dm_007",
        type: "checkbox",
        title: "Which symptoms have been bothering you lately?",
        subtitle: "These symptoms can indicate blood sugar changes",
        supportiveMessage:
          "These symptoms are your body's way of telling you something. Paying attention to them helps us adjust your care.",
        required: true,
        category: "symptoms",
        riskWeight: 3,
        progressWeight: 1,
        options: [
          "Excessive thirst",
          "Frequent urination",
          "Unexplained weight loss",
          "Blurred vision",
          "Cuts or bruises that heal slowly",
          "Frequent infections",
          "Feeling tired more than usual",
          "None of these",
        ],
      },
    ],
  },
  {
    id: "pain_management",
    name: "Pain Assessment & Care Plan",
    description:
      "A compassionate evaluation to understand your pain and find the best path to relief",
    empathicIntro:
      "Living with pain can be exhausting and frustrating. We believe you deserve relief and a better quality of life. This assessment helps us understand your unique pain experience so we can create a personalized plan to help you feel better.",
    category: "Pain Medicine",
    estimatedTime: "6-9 minutes",
    riskThreshold: 11,
    consultationCriteria: [
      "Severe pain levels (7-10/10)",
      "Chronic pain lasting more than 3 months",
      "Pain significantly affecting daily life",
      "History of pain medication concerns",
      "Warning signs requiring immediate attention",
    ],
    supportiveClosing:
      "Thank you for sharing details about your pain experience. Understanding your pain helps us find the most effective ways to provide relief.",
    nextStepsMessage:
      "We'll carefully review your pain assessment and connect you with pain specialists who understand your specific needs and can help you find relief.",
    questions: [
      {
        id: "pm_001",
        type: "multiple_choice",
        title: "On a scale of 0-10, how would you rate your pain right now?",
        subtitle: "Your pain rating helps us understand your experience",
        supportiveMessage:
          "Every person experiences pain differently. Your rating helps us understand what you're going through and how to help.",
        required: true,
        category: "pain_intensity",
        riskWeight: 3,
        progressWeight: 2,
        options: [
          "0-2 (No pain to mild discomfort)",
          "3-4 (Mild to moderate pain)",
          "5-6 (Moderate pain)",
          "7-8 (Severe pain)",
          "9-10 (Worst pain imaginable)",
        ],
        followUpLogic: {
          condition: "9-10 (Worst pain imaginable)",
          action: "require_consultation",
          supportMessage:
            "Severe pain at this level needs immediate professional attention. We want to help you get relief as quickly as possible.",
        },
      },
      {
        id: "pm_002",
        type: "multiple_choice",
        title: "How long have you been dealing with this pain?",
        subtitle: "The duration of pain affects treatment approaches",
        supportiveMessage:
          "Whether your pain is new or has been with you for a while, there are effective treatment options available.",
        required: true,
        category: "pain_duration",
        riskWeight: 2,
        progressWeight: 1,
        options: [
          "Less than 1 week",
          "1-4 weeks",
          "1-3 months",
          "3-6 months",
          "More than 6 months",
        ],
      },
      {
        id: "pm_003",
        type: "multiple_choice",
        title: "Where do you feel pain most often?",
        subtitle: "Location helps us understand the source",
        supportiveMessage:
          "Pinpointing where your pain occurs helps us identify the most effective treatments for that specific area.",
        required: true,
        category: "pain_location",
        riskWeight: 2,
        progressWeight: 1,
        options: [
          "Head or neck",
          "Upper back or shoulders",
          "Lower back",
          "Arms or hands",
          "Legs or feet",
          "Chest",
          "Abdomen",
          "Multiple areas",
        ],
      },
      {
        id: "pm_004",
        type: "multiple_choice",
        title: "How would you describe your pain?",
        subtitle: "The quality of pain gives us important clues",
        supportiveMessage:
          "Describing your pain helps us understand what might be causing it and which treatments are most likely to help.",
        required: true,
        category: "pain_quality",
        riskWeight: 2,
        progressWeight: 1,
        options: [
          "Sharp or stabbing",
          "Dull or aching",
          "Burning",
          "Throbbing",
          "Cramping",
          "Shooting or electric-like",
          "Pressure or squeezing",
        ],
      },
      {
        id: "pm_005",
        type: "multiple_choice",
        title: "How much does pain interfere with your daily activities?",
        subtitle: "Understanding impact on your life is crucial",
        supportiveMessage:
          "Pain shouldn't control your life. If it's interfering with activities you love, we can help you reclaim them.",
        required: true,
        category: "functional_impact",
        riskWeight: 3,
        progressWeight: 2,
        options: [
          "Not at all - I can do everything normally",
          "A little bit - minor limitations",
          "Moderately - some activities are difficult",
          "Quite a bit - many activities are hard",
          "Extremely - I can barely function",
        ],
        followUpLogic: {
          condition: "Extremely - I can barely function",
          action: "require_consultation",
          supportMessage:
            "When pain severely impacts your ability to function, you need specialized care. We'll ensure you get the intensive support you deserve.",
        },
      },
      {
        id: "pm_006",
        type: "checkbox",
        title:
          "Are you experiencing any concerning symptoms along with your pain?",
        subtitle: "Some symptoms need immediate medical attention",
        supportiveMessage:
          "These symptoms could indicate something that needs urgent care. Sharing them helps us ensure your safety.",
        required: true,
        category: "red_flags",
        riskWeight: 5,
        progressWeight: 2,
        options: [
          "Fever along with back pain",
          "Loss of bowel or bladder control",
          "Numbness in groin area",
          "Severe weakness in legs",
          "Recent significant injury or trauma",
          "History of cancer",
          "Unexplained weight loss",
          "None of these",
        ],
        followUpLogic: {
          condition: "Any concerning symptom selected",
          action: "require_consultation",
          supportMessage:
            "These symptoms need immediate professional evaluation to ensure you receive appropriate care right away.",
        },
      },
      {
        id: "pm_007",
        type: "boolean",
        title:
          "Have you ever had concerns with pain medications or other substances?",
        subtitle: "This helps us choose the safest treatment options",
        supportiveMessage:
          "Being honest about substance history helps us create a safe, effective treatment plan that works for you.",
        required: true,
        category: "substance_history",
        riskWeight: 3,
        progressWeight: 1,
      },
      {
        id: "pm_008",
        type: "checkbox",
        title: "What have you tried for your pain so far?",
        subtitle: "Knowing what you've tried helps us find new options",
        supportiveMessage:
          "Previous treatments give us valuable information about what might work best for you going forward.",
        required: true,
        category: "treatment_history",
        riskWeight: 1,
        progressWeight: 1,
        options: [
          "Over-the-counter pain relievers",
          "Prescription pain medications",
          "Physical therapy",
          "Chiropractic care",
          "Massage therapy",
          "Acupuncture",
          "Injections or procedures",
          "Surgery",
          "Nothing has helped so far",
        ],
      },
    ],
  },
  {
    id: "dermatology_consultation",
    name: "Skin Health Assessment",
    description:
      "A caring evaluation of your skin concerns to ensure you receive the right dermatological care",
    empathicIntro:
      "Your skin health matters, and we're here to help address any concerns you have. Skin issues can affect how you feel about yourself, and we want to ensure you get the care you need to feel confident and healthy.",
    category: "Dermatology",
    estimatedTime: "4-7 minutes",
    riskThreshold: 8,
    consultationCriteria: [
      "Changes in moles or spots that could indicate skin cancer",
      "Rapid changes in skin lesions",
      "Severe or persistent skin conditions",
      "Suspicious growths requiring evaluation",
      "Unexplained rashes that won't resolve",
    ],
    supportiveClosing:
      "Thank you for sharing information about your skin concerns. Taking care of your skin health is important for your overall well-being.",
    nextStepsMessage:
      "We'll review your skin assessment and connect you with dermatology specialists who can provide expert evaluation and treatment.",
    questions: [
      {
        id: "derm_001",
        type: "multiple_choice",
        title: "What brings you here today regarding your skin?",
        subtitle:
          "Understanding your main concern helps us focus on what matters most",
        supportiveMessage:
          "All skin concerns are valid and treatable. We're here to help you feel comfortable in your own skin.",
        required: true,
        category: "primary_concern",
        riskWeight: 2,
        progressWeight: 1,
        options: [
          "Acne or breakouts",
          "Rash or skin irritation",
          "Changes in a mole or spot",
          "Dry or itchy skin",
          "Hair loss or thinning",
          "Nail problems",
          "Possible skin infection",
          "Other skin concern",
        ],
      },
      {
        id: "derm_002",
        type: "checkbox",
        title: "Have you noticed any changes in your moles or spots?",
        subtitle: "Changes in moles can be important to evaluate",
        supportiveMessage:
          "Most mole changes are harmless, but it's always wise to have them checked by a professional for peace of mind.",
        required: true,
        category: "mole_changes",
        riskWeight: 4,
        progressWeight: 2,
        options: [
          "Getting larger in size",
          "Changing color",
          "Changing shape or becoming irregular",
          "Bleeding occasionally",
          "Itching or becoming tender",
          "New spots appearing",
          "Borders becoming less defined",
          "No changes that I've noticed",
        ],
        followUpLogic: {
          condition: "Any change noticed",
          action: "require_consultation",
          supportMessage:
            "Changes in moles should always be evaluated by a dermatologist to ensure they're not concerning. Early detection is key to good outcomes.",
        },
      },
      {
        id: "derm_003",
        type: "boolean",
        title: "Does anyone in your family have a history of skin cancer?",
        subtitle: "Family history helps us assess your risk level",
        supportiveMessage:
          "Family history is just one risk factor. With proper screening and care, skin cancer is highly treatable when caught early.",
        required: true,
        category: "family_history",
        riskWeight: 3,
        progressWeight: 1,
      },
      {
        id: "derm_004",
        type: "multiple_choice",
        title: "How long have you been dealing with this skin concern?",
        subtitle: "Duration helps us understand urgency and treatment needs",
        supportiveMessage:
          "Whether your concern is new or long-standing, there are effective treatments available to help.",
        required: true,
        category: "duration",
        riskWeight: 2,
        progressWeight: 1,
        options: [
          "Less than 1 week",
          "1-4 weeks",
          "1-3 months",
          "3-6 months",
          "More than 6 months",
        ],
      },
      {
        id: "derm_005",
        type: "multiple_choice",
        title: "How would you describe your skin's reaction to sun exposure?",
        subtitle: "Skin type affects both treatment and cancer risk",
        supportiveMessage:
          "Every skin type is beautiful and deserves protection. Understanding yours helps us provide the best care recommendations.",
        required: true,
        category: "skin_type",
        riskWeight: 2,
        progressWeight: 1,
        options: [
          "Very fair - I always burn and never tan",
          "Fair - I usually burn but can tan slightly",
          "Medium - I sometimes burn but tan gradually",
          "Olive - I rarely burn and tan easily",
          "Dark - I very rarely burn and tan deeply",
        ],
      },
      {
        id: "derm_006",
        type: "checkbox",
        title: "Which symptoms are you experiencing with your skin condition?",
        subtitle: "Symptoms help us understand severity and urgency",
        supportiveMessage:
          "These symptoms can be uncomfortable, but they also provide important clues about the best treatment approach.",
        required: true,
        category: "symptoms",
        riskWeight: 3,
        progressWeight: 1,
        options: [
          "Intense itching that disrupts sleep",
          "Pain or burning sensation",
          "Bleeding from the area",
          "Pus or unusual discharge",
          "Fever along with skin changes",
          "Rapidly spreading or growing",
          "None of these symptoms",
        ],
      },
      {
        id: "derm_007",
        type: "boolean",
        title:
          "Have you had significant sun exposure or used tanning beds regularly?",
        subtitle: "UV exposure history affects skin cancer risk",
        supportiveMessage:
          "Past sun exposure doesn't mean you're destined for problems. Regular skin checks and protection can prevent future issues.",
        required: true,
        category: "sun_exposure",
        riskWeight: 2,
        progressWeight: 1,
      },
    ],
  },
  {
    id: "womens_health",
    name: "Women's Health & Wellness Assessment",
    description:
      "A supportive evaluation of your reproductive and overall health needs as a woman",
    empathicIntro:
      "Your health as a woman is unique and important. This assessment helps us understand your specific needs so we can provide personalized, compassionate care that respects your body and your choices.",
    category: "Women's Health",
    estimatedTime: "7-10 minutes",
    riskThreshold: 9,
    consultationCriteria: [
      "Abnormal or concerning bleeding patterns",
      "Severe pelvic pain affecting quality of life",
      "Pregnancy-related concerns or complications",
      "Significant hormonal imbalances",
      "Reproductive health issues requiring specialist care",
    ],
    supportiveClosing:
      "Thank you for trusting us with intimate details about your health. This information helps us provide the most appropriate and respectful care.",
    nextStepsMessage:
      "We'll carefully review your responses and connect you with women's health specialists who understand your unique needs and concerns.",
    questions: [
      {
        id: "wh_001",
        type: "multiple_choice",
        title: "What is your age range?",
        subtitle: "Age helps us understand your life stage and health needs",
        supportiveMessage:
          "Women's health needs change throughout life. We provide age-appropriate care for every stage of your journey.",
        required: true,
        category: "demographics",
        riskWeight: 1,
        progressWeight: 1,
        options: [
          "18-25 years",
          "26-35 years",
          "36-45 years",
          "46-55 years",
          "Over 55 years",
        ],
      },
      {
        id: "wh_002",
        type: "multiple_choice",
        title: "What brings you here today for women's health care?",
        subtitle:
          "Understanding your main concern helps us focus on your needs",
        supportiveMessage:
          "All women's health concerns are important and deserve attention. We're here to support your health and well-being.",
        required: true,
        category: "primary_concern",
        riskWeight: 2,
        progressWeight: 1,
        options: [
          "Irregular or missed periods",
          "Heavy or painful periods",
          "Family planning or pregnancy questions",
          "Birth control consultation",
          "Menopause or perimenopause symptoms",
          "Pelvic pain or discomfort",
          "Vaginal symptoms or concerns",
          "Breast health concerns",
          "General women's wellness",
        ],
      },
      {
        id: "wh_003",
        type: "multiple_choice",
        title: "How would you describe your menstrual cycle lately?",
        subtitle: "Menstrual patterns tell us a lot about your health",
        supportiveMessage:
          "Every woman's cycle is different. Changes in your cycle can provide important information about your overall health.",
        required: true,
        category: "menstrual_health",
        riskWeight: 3,
        progressWeight: 2,
        options: [
          "Regular and predictable (21-35 days)",
          "Irregular timing but manageable",
          "Very heavy bleeding",
          "Very light or minimal bleeding",
          "Bleeding between regular periods",
          "No periods for more than 3 months",
          "Post-menopausal (no periods)",
          "Currently pregnant",
        ],
        followUpLogic: {
          condition: "No periods for more than 3 months",
          action: "require_consultation",
          supportMessage:
            "Missing periods for several months needs evaluation to understand the cause and ensure your health is protected.",
        },
      },
      {
        id: "wh_004",
        type: "multiple_choice",
        title: "Are you trying to become pregnant?",
        subtitle: "Your pregnancy intentions affect care recommendations",
        supportiveMessage:
          "Whether you want to conceive, prevent pregnancy, or are unsure, we can provide guidance and support for your goals.",
        required: true,
        category: "pregnancy_planning",
        riskWeight: 2,
        progressWeight: 1,
        options: [
          "Yes, actively trying to conceive",
          "Yes, but having difficulty conceiving",
          "No, using birth control",
          "No, not sexually active",
          "Unsure or not actively preventing",
        ],
      },
      {
        id: "wh_005",
        type: "checkbox",
        title: "Which symptoms have been concerning you?",
        subtitle: "Your symptoms guide us toward the right care",
        supportiveMessage:
          "These symptoms are more common than you might think, and most have effective treatments available.",
        required: true,
        category: "symptoms",
        riskWeight: 3,
        progressWeight: 1,
        options: [
          "Severe pelvic pain",
          "Pain during sexual activity",
          "Unusual vaginal discharge",
          "Vaginal itching or burning",
          "Breast pain or lumps",
          "Hot flashes or night sweats",
          "Mood changes or irritability",
          "Sleep problems",
          "None of these",
        ],
      },
      {
        id: "wh_006",
        type: "boolean",
        title:
          "Do you have a family history of breast cancer, ovarian cancer, or other reproductive cancers?",
        subtitle: "Family history helps us plan appropriate screening",
        supportiveMessage:
          "Family history doesn't determine your destiny. With proper screening and care, we can detect and prevent many health issues.",
        required: true,
        category: "family_history",
        riskWeight: 3,
        progressWeight: 1,
      },
      {
        id: "wh_007",
        type: "multiple_choice",
        title: "When was your last Pap smear (cervical cancer screening)?",
        subtitle:
          "Regular screening is important for preventing cervical cancer",
        supportiveMessage:
          "Pap smears save lives by catching problems early. If it's been a while, we can help you get back on track with screening.",
        required: true,
        category: "screening_history",
        riskWeight: 2,
        progressWeight: 1,
        options: [
          "Within the past year",
          "1-3 years ago",
          "3-5 years ago",
          "More than 5 years ago",
          "I've never had a Pap smear",
        ],
      },
      {
        id: "wh_008",
        type: "boolean",
        title:
          "Are you currently taking any hormonal medications (birth control, hormone replacement, etc.)?",
        subtitle: "Hormonal medications can affect many aspects of health",
        supportiveMessage:
          "Hormonal medications can be very beneficial. Understanding what you're taking helps us provide comprehensive care.",
        required: true,
        category: "medication_history",
        riskWeight: 1,
        progressWeight: 1,
      },
    ],
  },
];

// Enhanced risk assessment functions with empathetic feedback
export const calculateRiskScore = (
  responses: Record<string, any>,
  questions: MCQQuestion[],
): number => {
  let totalRisk = 0;

  questions.forEach((question) => {
    const response = responses[question.id];
    if (response && question.riskWeight) {
      if (question.type === "multiple_choice") {
        const optionIndex = question.options?.indexOf(response) || 0;
        totalRisk += (optionIndex + 1) * question.riskWeight;
      } else if (question.type === "boolean") {
        totalRisk += response === "Yes" ? question.riskWeight * 3 : 0;
      } else if (question.type === "checkbox" && Array.isArray(response)) {
        totalRisk += response.length * question.riskWeight;
      }
    }
  });

  return totalRisk;
};

export const requiresConsultation = (
  responses: Record<string, any>,
  mcq: ConsultationMCQ,
): boolean => {
  const riskScore = calculateRiskScore(responses, mcq.questions);

  if (riskScore >= mcq.riskThreshold) {
    return true;
  }

  for (const question of mcq.questions) {
    const response = responses[question.id];
    if (question.followUpLogic?.action === "require_consultation") {
      if (
        response === question.followUpLogic.condition ||
        (question.followUpLogic.condition.includes("Any") &&
          response &&
          response !== "None of these" &&
          response !== "No changes that I've noticed")
      ) {
        return true;
      }
    }
  }

  return false;
};

export const getConsultationRecommendations = (
  responses: Record<string, any>,
  mcq: ConsultationMCQ,
) => {
  const riskScore = calculateRiskScore(responses, mcq.questions);
  const needsConsultation = requiresConsultation(responses, mcq);

  return {
    riskScore,
    needsConsultation,
    urgency:
      riskScore > mcq.riskThreshold * 1.5
        ? "high"
        : riskScore > mcq.riskThreshold
          ? "medium"
          : "low",
    recommendations: needsConsultation ? mcq.consultationCriteria : [],
    category: mcq.category,
    supportiveMessage: needsConsultation
      ? "Based on your responses, we recommend connecting you with a specialist who can provide the focused care you need."
      : "Your responses suggest you're managing well. We're here if you need support in the future.",
    nextSteps: needsConsultation
      ? mcq.nextStepsMessage
      : "Continue with your current care plan and don't hesitate to reach out if anything changes.",
  };
};

// Progress calculation for better UX
export const calculateProgress = (
  responses: Record<string, any>,
  questions: MCQQuestion[],
): number => {
  const answeredQuestions = questions.filter(
    (q) => responses[q.id] !== undefined,
  );
  return Math.round((answeredQuestions.length / questions.length) * 100);
};

// Empathetic response suggestions based on risk level
export const getEmpatheticResponse = (
  riskLevel: "low" | "medium" | "high",
): string => {
  switch (riskLevel) {
    case "low":
      return "It looks like you're managing your health well. We're here to support you in maintaining your wellness.";
    case "medium":
      return "Thank you for sharing openly with us. We want to ensure you get the right level of care for your needs.";
    case "high":
      return "We appreciate your trust in sharing these concerns with us. Getting the right professional support is important for your health and well-being.";
    default:
      return "Thank you for taking the time to complete this assessment. Your health and comfort are our priority.";
  }
};
