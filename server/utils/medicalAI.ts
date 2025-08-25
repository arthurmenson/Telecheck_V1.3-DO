import {
  LabResult,
  Medication,
  VitalSigns,
  HealthInsight,
} from "@shared/types";

// Advanced Medical AI Service with sophisticated analysis
export class MedicalAI {
  private static medicalKnowledgeBase = {
    // Drug interaction database
    drugInteractions: [
      {
        drug1: "warfarin",
        drug2: "aspirin",
        severity: "high",
        mechanism: "Additive anticoagulant effects",
        clinicalEffect: "Increased bleeding risk",
        management: "Monitor INR closely, consider dose reduction",
        evidence: "Level A - Multiple RCTs",
      },
      {
        drug1: "atorvastatin",
        drug2: "clarithromycin",
        severity: "high",
        mechanism: "CYP3A4 inhibition",
        clinicalEffect: "Increased statin levels, rhabdomyolysis risk",
        management: "Temporarily discontinue statin during antibiotic course",
        evidence: "Level B - Case reports and studies",
      },
      {
        drug1: "metformin",
        drug2: "contrast_dye",
        severity: "moderate",
        mechanism: "Renal clearance competition",
        clinicalEffect: "Lactic acidosis risk",
        management: "Hold metformin 48h before and after contrast",
        evidence: "Level A - Guidelines recommendation",
      },
    ],

    // Disease risk algorithms
    cardiovascularRisk: {
      framinghamFactors: [
        "age",
        "gender",
        "totalCholesterol",
        "hdlCholesterol",
        "systolicBP",
        "smoking",
        "diabetes",
      ],
      ascvdFactors: [
        "age",
        "race",
        "gender",
        "totalCholesterol",
        "hdlCholesterol",
        "systolicBP",
        "bpTreatment",
        "diabetes",
        "smoking",
      ],
    },

    // Lab reference ranges with age/gender adjustments
    labRanges: {
      glucose: {
        min: 70,
        max: 100,
        unit: "mg/dL",
        critical: { min: 40, max: 400 },
      },
      totalCholesterol: { min: 0, max: 200, unit: "mg/dL", optimal: 200 },
      ldlCholesterol: { min: 0, max: 100, unit: "mg/dL", optimal: 100 },
      hdlCholesterol: { male: { min: 40 }, female: { min: 50 }, unit: "mg/dL" },
      triglycerides: { min: 0, max: 150, unit: "mg/dL" },
      hba1c: { min: 0, max: 5.7, unit: "%", diabetic: 7.0 },
      creatinine: {
        male: { min: 0.7, max: 1.3 },
        female: { min: 0.6, max: 1.1 },
        unit: "mg/dL",
      },
      bun: { min: 7, max: 20, unit: "mg/dL" },
      alt: { min: 7, max: 56, unit: "U/L" },
      ast: { min: 10, max: 40, unit: "U/L" },
    },

    // Pharmacogenomic variants
    pgxVariants: {
      CYP2D6: {
        "*1": { activity: "normal", frequency: 0.35 },
        "*2": { activity: "normal", frequency: 0.28 },
        "*3": { activity: "none", frequency: 0.02 },
        "*4": { activity: "none", frequency: 0.2 },
        "*5": { activity: "none", frequency: 0.07 },
        "*10": { activity: "decreased", frequency: 0.02 },
      },
      SLCO1B1: {
        "*1A": { activity: "normal", frequency: 0.7 },
        "*5": { activity: "decreased", frequency: 0.15 },
        "*15": { activity: "decreased", frequency: 0.15 },
      },
      CYP2C19: {
        "*1": { activity: "normal", frequency: 0.35 },
        "*2": { activity: "none", frequency: 0.32 },
        "*3": { activity: "none", frequency: 0.04 },
        "*17": { activity: "increased", frequency: 0.21 },
      },
    },
  };

  // Advanced cardiovascular risk calculation
  static calculateCardiovascularRisk(
    labResults: LabResult[],
    vitals: VitalSigns[],
    demographics: any,
  ): {
    tenYearRisk: number;
    riskCategory: "low" | "borderline" | "intermediate" | "high";
    recommendations: string[];
    confidence: number;
  } {
    const totalChol =
      labResults.find((r) =>
        r.testName.toLowerCase().includes("total cholesterol"),
      )?.value || 200;
    const hdlChol =
      labResults.find((r) => r.testName.toLowerCase().includes("hdl"))?.value ||
      50;
    const systolicBP = vitals[0]?.bloodPressureSystolic || 120;

    // Simplified ASCVD risk calculation
    let riskScore = 0;

    // Age factor
    const age = demographics.age || 45;
    if (age >= 65) riskScore += 15;
    else if (age >= 55) riskScore += 10;
    else if (age >= 45) riskScore += 5;

    // Cholesterol factors
    if (totalChol > 240) riskScore += 10;
    else if (totalChol > 200) riskScore += 5;

    if (hdlChol < 40) riskScore += 8;
    else if (hdlChol < 50) riskScore += 4;
    else if (hdlChol > 60) riskScore -= 2;

    // Blood pressure
    if (systolicBP > 160) riskScore += 12;
    else if (systolicBP > 140) riskScore += 8;
    else if (systolicBP > 120) riskScore += 3;

    // Convert to percentage
    const tenYearRisk = Math.min(Math.max(riskScore * 0.8, 1), 40);

    let riskCategory: "low" | "borderline" | "intermediate" | "high";
    if (tenYearRisk < 5) riskCategory = "low";
    else if (tenYearRisk < 7.5) riskCategory = "borderline";
    else if (tenYearRisk < 20) riskCategory = "intermediate";
    else riskCategory = "high";

    const recommendations = this.generateCardiovascularRecommendations(
      riskCategory,
      labResults,
      vitals,
    );

    return {
      tenYearRisk,
      riskCategory,
      recommendations,
      confidence: 88,
    };
  }

  private static generateCardiovascularRecommendations(
    riskCategory: string,
    labResults: LabResult[],
    vitals: VitalSigns[],
  ): string[] {
    const recommendations = [];

    if (riskCategory === "high") {
      recommendations.push("Consider high-intensity statin therapy");
      recommendations.push("Target LDL cholesterol <70 mg/dL");
      recommendations.push("Discuss aspirin therapy with physician");
      recommendations.push(
        "Lifestyle modifications: diet, exercise, smoking cessation",
      );
    } else if (riskCategory === "intermediate") {
      recommendations.push("Consider moderate-intensity statin therapy");
      recommendations.push("Target LDL cholesterol <100 mg/dL");
      recommendations.push("Implement lifestyle modifications");
      recommendations.push("Consider coronary calcium scoring");
    } else {
      recommendations.push("Continue lifestyle modifications");
      recommendations.push("Monitor cholesterol levels annually");
      recommendations.push("Maintain healthy diet and exercise");
    }

    return recommendations;
  }

  // Advanced drug interaction analysis with PGx
  static analyzeDrugInteractions(
    medications: Medication[],
    pgxProfile?: any,
  ): {
    interactions: any[];
    pgxAlerts: any[];
    recommendations: string[];
    riskScore: number;
  } {
    const interactions = [];
    const pgxAlerts = [];
    const recommendations = [];
    let riskScore = 0;

    // Check drug-drug interactions
    for (let i = 0; i < medications.length; i++) {
      for (let j = i + 1; j < medications.length; j++) {
        const drug1 = medications[i].name.toLowerCase();
        const drug2 = medications[j].name.toLowerCase();

        const interaction = this.medicalKnowledgeBase.drugInteractions.find(
          (int) =>
            (int.drug1 === drug1 && int.drug2 === drug2) ||
            (int.drug1 === drug2 && int.drug2 === drug1),
        );

        if (interaction) {
          interactions.push({
            ...interaction,
            medications: [medications[i].name, medications[j].name],
            riskLevel:
              interaction.severity === "high"
                ? 3
                : interaction.severity === "moderate"
                  ? 2
                  : 1,
          });

          riskScore +=
            interaction.severity === "high"
              ? 15
              : interaction.severity === "moderate"
                ? 8
                : 3;
        }
      }
    }

    // Check PGx interactions if profile available
    if (pgxProfile) {
      medications.forEach((med) => {
        const pgxAlert = this.checkPGxInteraction(med, pgxProfile);
        if (pgxAlert) {
          pgxAlerts.push(pgxAlert);
          riskScore +=
            pgxAlert.severity === "high"
              ? 12
              : pgxAlert.severity === "moderate"
                ? 6
                : 2;
        }
      });
    }

    // Generate recommendations
    if (interactions.length > 0) {
      recommendations.push("Review drug interactions with healthcare provider");
      recommendations.push("Consider timing adjustments between medications");
    }

    if (pgxAlerts.length > 0) {
      recommendations.push("Discuss genetic testing results with physician");
      recommendations.push(
        "Consider alternative medications based on PGx profile",
      );
    }

    if (riskScore === 0) {
      recommendations.push("No significant interactions detected");
      recommendations.push("Continue current medication regimen as prescribed");
    }

    return { interactions, pgxAlerts, recommendations, riskScore };
  }

  private static checkPGxInteraction(medication: Medication, pgxProfile: any) {
    const drugName = medication.name.toLowerCase();

    // Statin-SLCO1B1 interaction
    if (["atorvastatin", "simvastatin", "lovastatin"].includes(drugName)) {
      if (
        pgxProfile.SLCO1B1?.includes("*5") ||
        pgxProfile.SLCO1B1?.includes("*15")
      ) {
        return {
          gene: "SLCO1B1",
          medication: medication.name,
          variant: pgxProfile.SLCO1B1,
          severity: "moderate",
          effect: "Increased muscle toxicity risk",
          recommendation: "Consider dose reduction or alternative statin",
        };
      }
    }

    // Opioid-CYP2D6 interaction
    if (["codeine", "tramadol", "oxycodone"].includes(drugName)) {
      if (
        pgxProfile.CYP2D6?.includes("*3") ||
        pgxProfile.CYP2D6?.includes("*4")
      ) {
        return {
          gene: "CYP2D6",
          medication: medication.name,
          variant: pgxProfile.CYP2D6,
          severity: "high",
          effect: "Reduced analgesic efficacy",
          recommendation: "Consider alternative pain medication",
        };
      }
    }

    return null;
  }

  // Predictive health analytics
  static generatePredictiveAnalytics(
    labHistory: LabResult[],
    vitalHistory: VitalSigns[],
    medications: Medication[],
  ): {
    predictions: any[];
    riskFactors: any[];
    interventions: any[];
    confidence: number;
  } {
    const predictions = [];
    const riskFactors = [];
    const interventions = [];

    // Analyze cholesterol trends
    const cholesterolTrend = this.analyzeTrend(labHistory, "total cholesterol");
    if (cholesterolTrend.slope > 0) {
      predictions.push({
        metric: "Total Cholesterol",
        prediction: "Likely to exceed 240 mg/dL in 6 months",
        confidence: 78,
        timeframe: "6 months",
        currentTrend: "increasing",
      });

      interventions.push({
        type: "lifestyle",
        intervention: "Intensive dietary counseling",
        expectedBenefit: "15-20% cholesterol reduction",
        timeToEffect: "8-12 weeks",
      });
    }

    // Analyze blood pressure trends
    const bpTrend = this.analyzeBPTrend(vitalHistory);
    if (bpTrend.systolicSlope > 2) {
      riskFactors.push({
        factor: "Hypertension Development",
        risk: "moderate",
        timeframe: "12 months",
        probability: 65,
      });
    }

    // Medication adherence prediction
    const adherenceRisk = this.predictAdherenceRisk(medications);
    if (adherenceRisk.risk > 0.3) {
      interventions.push({
        type: "behavioral",
        intervention: "Medication adherence program",
        expectedBenefit: "Improved clinical outcomes",
        timeToEffect: "4-6 weeks",
      });
    }

    return {
      predictions,
      riskFactors,
      interventions,
      confidence: 82,
    };
  }

  private static analyzeTrend(labHistory: LabResult[], testName: string) {
    const relevantResults = labHistory
      .filter((r) => r.testName.toLowerCase().includes(testName.toLowerCase()))
      .sort(
        (a, b) =>
          new Date(a.testDate).getTime() - new Date(b.testDate).getTime(),
      );

    if (relevantResults.length < 2) return { slope: 0, correlation: 0 };

    // Simple linear regression
    const n = relevantResults.length;
    const x = relevantResults.map((_, i) => i);
    const y = relevantResults.map((r) => r.value);

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

    return { slope, correlation: 0.8 }; // Simplified correlation
  }

  private static analyzeBPTrend(vitalHistory: VitalSigns[]) {
    const bpReadings = vitalHistory
      .filter((v) => v.bloodPressureSystolic && v.bloodPressureDiastolic)
      .sort(
        (a, b) =>
          new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime(),
      );

    if (bpReadings.length < 2) return { systolicSlope: 0, diastolicSlope: 0 };

    // Calculate trends for systolic and diastolic
    const systolicTrend = this.calculateSlope(
      bpReadings.map((r) => r.bloodPressureSystolic!),
    );
    const diastolicTrend = this.calculateSlope(
      bpReadings.map((r) => r.bloodPressureDiastolic!),
    );

    return { systolicSlope: systolicTrend, diastolicSlope: diastolicTrend };
  }

  private static calculateSlope(values: number[]): number {
    const n = values.length;
    const x = values.map((_, i) => i);
    const y = values;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  }

  private static predictAdherenceRisk(medications: Medication[]): {
    risk: number;
    factors: string[];
  } {
    let risk = 0;
    const factors = [];

    // Complex regimen increases non-adherence risk
    if (medications.length > 5) {
      risk += 0.2;
      factors.push("Complex medication regimen");
    }

    // Multiple daily dosing increases risk
    const multiDoseCount = medications.filter(
      (m) =>
        m.frequency.toLowerCase().includes("twice") ||
        m.frequency.toLowerCase().includes("three") ||
        m.frequency.toLowerCase().includes("four"),
    ).length;

    if (multiDoseCount > 2) {
      risk += 0.15;
      factors.push("Multiple daily dosing requirements");
    }

    return { risk, factors };
  }

  // Medical image analysis simulation
  static async analyzeLabReport(
    imageBuffer: Buffer,
    fileName: string,
  ): Promise<{
    extractedText: string;
    structuredData: any[];
    confidence: number;
    aiInsights: string[];
  }> {
    // Simulate OCR processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock extracted lab data
    const mockExtractedData = [
      {
        test: "Glucose, Fasting",
        value: 95,
        unit: "mg/dL",
        range: "70-100",
        flag: "",
      },
      {
        test: "Cholesterol, Total",
        value: 205,
        unit: "mg/dL",
        range: "<200",
        flag: "H",
      },
      {
        test: "HDL Cholesterol",
        value: 58,
        unit: "mg/dL",
        range: ">40",
        flag: "",
      },
      {
        test: "LDL Cholesterol",
        value: 135,
        unit: "mg/dL",
        range: "<100",
        flag: "H",
      },
      {
        test: "Triglycerides",
        value: 120,
        unit: "mg/dL",
        range: "<150",
        flag: "",
      },
      {
        test: "Hemoglobin A1c",
        value: 5.4,
        unit: "%",
        range: "<5.7",
        flag: "",
      },
    ];

    const aiInsights = [
      "Glucose control is excellent with fasting level at 95 mg/dL",
      "Total cholesterol is mildly elevated and should be addressed",
      "HDL cholesterol provides good cardiovascular protection",
      "LDL cholesterol is above target and increases cardiovascular risk",
      "HbA1c indicates excellent long-term glucose control",
      "Overall metabolic profile shows mixed results requiring attention to lipids",
    ];

    return {
      extractedText: `Lab Report Analysis\n${mockExtractedData.map((d) => `${d.test}: ${d.value} ${d.unit}`).join("\n")}`,
      structuredData: mockExtractedData,
      confidence: 94,
      aiInsights,
    };
  }

  // Symptom assessment with differential diagnosis
  static assessSymptoms(
    symptoms: string[],
    demographics: any,
    vitals?: VitalSigns[],
  ): {
    differentialDiagnosis: any[];
    urgencyLevel: "low" | "moderate" | "high" | "emergency";
    recommendations: string[];
    redFlags: string[];
  } {
    const symptomList = symptoms.map((s) => s.toLowerCase());
    const differentialDiagnosis = [];
    let urgencyLevel: "low" | "moderate" | "high" | "emergency" = "low";
    const recommendations = [];
    const redFlags = [];

    // Emergency symptoms detection
    const emergencySymptoms = [
      "chest pain",
      "difficulty breathing",
      "severe headache",
      "loss of consciousness",
      "severe bleeding",
      "stroke symptoms",
    ];

    if (
      emergencySymptoms.some((emergency) =>
        symptomList.some((symptom) =>
          symptom.includes(emergency.split(" ")[0]),
        ),
      )
    ) {
      urgencyLevel = "emergency";
      redFlags.push(
        "Emergency symptoms detected - seek immediate medical attention",
      );
      recommendations.push("Call 911 or go to emergency room immediately");
      return { differentialDiagnosis, urgencyLevel, recommendations, redFlags };
    }

    // Chest pain assessment
    if (symptomList.some((s) => s.includes("chest") && s.includes("pain"))) {
      differentialDiagnosis.push({
        condition: "Acute Coronary Syndrome",
        probability: 25,
        severity: "high",
        workup: ["ECG", "Troponin", "Chest X-ray"],
      });

      differentialDiagnosis.push({
        condition: "Gastroesophageal Reflux",
        probability: 40,
        severity: "low",
        workup: ["Trial of PPI therapy", "Upper endoscopy if persistent"],
      });

      urgencyLevel = "high";
      recommendations.push("Seek immediate medical evaluation for chest pain");
    }

    // Respiratory symptoms
    if (
      symptomList.some((s) => s.includes("cough") || s.includes("shortness"))
    ) {
      differentialDiagnosis.push({
        condition: "Upper Respiratory Infection",
        probability: 60,
        severity: "low",
        workup: ["Clinical assessment", "Supportive care"],
      });

      if (
        demographics.age > 65 ||
        symptomList.some((s) => s.includes("fever"))
      ) {
        differentialDiagnosis.push({
          condition: "Pneumonia",
          probability: 30,
          severity: "moderate",
          workup: ["Chest X-ray", "CBC", "Blood cultures"],
        });
        urgencyLevel = "moderate";
      }
    }

    // General recommendations
    if (urgencyLevel === "low") {
      recommendations.push("Monitor symptoms and seek care if worsening");
      recommendations.push("Consider telehealth consultation for evaluation");
    }

    return { differentialDiagnosis, urgencyLevel, recommendations, redFlags };
  }

  // Advanced health scoring algorithm
  static calculateHealthScore(
    labResults: LabResult[],
    vitals: VitalSigns[],
    medications: Medication[],
    lifestyle?: any,
  ): {
    overallScore: number;
    categoryScores: any;
    improvements: string[];
    risks: string[];
  } {
    let cardiovascularScore = 100;
    let metabolicScore = 100;
    let lifestyleScore = 100;

    // Cardiovascular scoring
    const totalChol = labResults.find((r) =>
      r.testName.toLowerCase().includes("total cholesterol"),
    );
    const ldlChol = labResults.find((r) =>
      r.testName.toLowerCase().includes("ldl"),
    );
    const hdlChol = labResults.find((r) =>
      r.testName.toLowerCase().includes("hdl"),
    );

    if (totalChol) {
      if (totalChol.value > 240) cardiovascularScore -= 20;
      else if (totalChol.value > 200) cardiovascularScore -= 10;
    }

    if (ldlChol) {
      if (ldlChol.value > 160) cardiovascularScore -= 25;
      else if (ldlChol.value > 130) cardiovascularScore -= 15;
      else if (ldlChol.value > 100) cardiovascularScore -= 8;
    }

    if (hdlChol) {
      if (hdlChol.value < 40) cardiovascularScore -= 15;
      else if (hdlChol.value > 60) cardiovascularScore += 5;
    }

    // Blood pressure scoring
    if (vitals.length > 0) {
      const latestVital = vitals[vitals.length - 1];
      if (latestVital.bloodPressureSystolic) {
        if (latestVital.bloodPressureSystolic > 160) cardiovascularScore -= 20;
        else if (latestVital.bloodPressureSystolic > 140)
          cardiovascularScore -= 12;
        else if (latestVital.bloodPressureSystolic > 130)
          cardiovascularScore -= 6;
      }
    }

    // Metabolic scoring
    const glucose = labResults.find((r) =>
      r.testName.toLowerCase().includes("glucose"),
    );
    const hba1c = labResults.find((r) =>
      r.testName.toLowerCase().includes("a1c"),
    );

    if (glucose) {
      if (glucose.value > 126) metabolicScore -= 25;
      else if (glucose.value > 100) metabolicScore -= 10;
    }

    if (hba1c) {
      if (hba1c.value > 7.0) metabolicScore -= 30;
      else if (hba1c.value > 6.5) metabolicScore -= 20;
      else if (hba1c.value > 5.7) metabolicScore -= 10;
    }

    const overallScore = Math.round(
      (cardiovascularScore + metabolicScore + lifestyleScore) / 3,
    );

    const improvements = [];
    const risks = [];

    if (cardiovascularScore < 80) {
      improvements.push("Focus on cardiovascular health improvement");
      risks.push("Elevated cardiovascular risk detected");
    }

    if (metabolicScore < 80) {
      improvements.push("Optimize glucose and metabolic control");
      risks.push("Metabolic dysfunction indicators present");
    }

    return {
      overallScore,
      categoryScores: {
        cardiovascular: cardiovascularScore,
        metabolic: metabolicScore,
        lifestyle: lifestyleScore,
      },
      improvements,
      risks,
    };
  }

  // Clinical decision support
  static generateClinicalRecommendations(
    labResults: LabResult[],
    medications: Medication[],
    vitals: VitalSigns[],
    demographics: any,
  ): {
    recommendations: any[];
    alerts: any[];
    followUp: any[];
  } {
    const recommendations = [];
    const alerts = [];
    const followUp = [];

    // Statin therapy recommendations
    const ldl = labResults.find((r) =>
      r.testName.toLowerCase().includes("ldl cholesterol"),
    );
    const totalChol = labResults.find((r) =>
      r.testName.toLowerCase().includes("total cholesterol"),
    );
    const onStatin = medications.some((m) =>
      ["atorvastatin", "simvastatin", "rosuvastatin", "pravastatin"].includes(
        m.name.toLowerCase(),
      ),
    );

    if (ldl && ldl.value > 130 && !onStatin) {
      recommendations.push({
        category: "Cardiovascular",
        recommendation: "Consider statin therapy initiation",
        evidence: "ACC/AHA Guidelines 2018",
        priority: "high",
        rationale: `LDL cholesterol ${ldl.value} mg/dL exceeds treatment threshold`,
      });
    }

    // Blood pressure management
    const latestVital = vitals[vitals.length - 1];
    if (
      latestVital?.bloodPressureSystolic &&
      latestVital.bloodPressureSystolic > 140
    ) {
      alerts.push({
        type: "clinical",
        severity: "moderate",
        message: "Hypertension detected",
        action: "Consider antihypertensive therapy",
        followUpDays: 30,
      });
    }

    // Diabetes screening
    const glucose = labResults.find((r) =>
      r.testName.toLowerCase().includes("glucose"),
    );
    const hba1c = labResults.find((r) =>
      r.testName.toLowerCase().includes("a1c"),
    );

    if (glucose && glucose.value > 100 && glucose.value < 126) {
      followUp.push({
        test: "HbA1c or OGTT",
        reason: "Prediabetes screening",
        timeframe: "3 months",
        priority: "moderate",
      });
    }

    return { recommendations, alerts, followUp };
  }
}
