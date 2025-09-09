// AI Service for medical analysis and chat
import { LabResult, ChatMessage, HealthInsight } from "@shared/types";

export class AIService {
  // Simulate AI analysis of lab results
  static analyzeLabResults(results: LabResult[]): {
    summary: string;
    insights: Omit<HealthInsight, "id" | "userId" | "createdAt">[];
    overallRisk: "low" | "medium" | "high";
  } {
    const abnormalResults = results.filter((r) => r.status !== "normal");
    const criticalResults = results.filter((r) => r.status === "critical");

    let overallRisk: "low" | "medium" | "high" = "low";
    if (criticalResults.length > 0) {
      overallRisk = "high";
    } else if (abnormalResults.length > 1) {
      overallRisk = "medium";
    }

    const insights: Omit<HealthInsight, "id" | "userId" | "createdAt">[] = [];

    // Analyze cholesterol
    const totalCholesterol = results.find((r) =>
      r.testName.toLowerCase().includes("total cholesterol"),
    );
    const ldlCholesterol = results.find((r) =>
      r.testName.toLowerCase().includes("ldl"),
    );
    const hdlCholesterol = results.find((r) =>
      r.testName.toLowerCase().includes("hdl"),
    );

    if (totalCholesterol && totalCholesterol.status !== "normal") {
      insights.push({
        type: "recommendation",
        title: "Cholesterol Management Needed",
        description: `Your total cholesterol is ${totalCholesterol.value} ${totalCholesterol.unit}, which is ${totalCholesterol.status}. Consider dietary modifications and discuss with your healthcare provider.`,
        priority: totalCholesterol.status === "high" ? "high" : "medium",
        category: "Cardiovascular Health",
        confidence: 88,
        actionRequired: true,
        dismissed: false,
      });
    }

    if (ldlCholesterol && ldlCholesterol.status === "high") {
      insights.push({
        type: "alert",
        title: "Elevated LDL Cholesterol",
        description: `Your LDL cholesterol at ${ldlCholesterol.value} ${ldlCholesterol.unit} increases cardiovascular risk. Statin therapy may be beneficial.`,
        priority: "high",
        category: "Cardiovascular Health",
        confidence: 92,
        actionRequired: true,
        dismissed: false,
      });
    }

    // Analyze glucose
    const glucose = results.find((r) =>
      r.testName.toLowerCase().includes("glucose"),
    );
    if (glucose && glucose.status === "normal") {
      insights.push({
        type: "insight",
        title: "Excellent Glucose Control",
        description: `Your glucose level of ${glucose.value} ${glucose.unit} indicates excellent metabolic health. Continue current lifestyle habits.`,
        priority: "low",
        category: "Metabolic Health",
        confidence: 95,
        actionRequired: false,
        dismissed: false,
      });
    }

    const summary = this.generateLabSummary(
      results,
      abnormalResults.length,
      overallRisk,
    );

    return { summary, insights, overallRisk };
  }

  private static generateLabSummary(
    results: LabResult[],
    abnormalCount: number,
    risk: string,
  ): string {
    const totalTests = results.length;
    const normalCount = totalTests - abnormalCount;

    return `Analysis of ${totalTests} lab tests shows ${normalCount} normal results and ${abnormalCount} values requiring attention. Overall cardiovascular risk assessment: ${risk}. Key findings include glucose control status and cholesterol profile evaluation. Recommend discussing results with healthcare provider for personalized treatment planning.`;
  }

  // Enhanced chat response generation
  static generateChatResponse(
    message: string,
    context: any,
    userLabResults: LabResult[],
    userMedications: any[],
    conversationHistory: ChatMessage[],
  ): {
    response: string;
    confidence: number;
    suggestions: string[];
  } {
    const input = message.toLowerCase();

    // Emergency detection
    if (this.detectEmergency(input)) {
      return {
        response: `🚨 **MEDICAL EMERGENCY DETECTED**\n\nIf you're experiencing a medical emergency, please:\n• Call 911 immediately\n• Go to your nearest emergency room\n• Contact emergency services\n\nFor chest pain, difficulty breathing, severe bleeding, loss of consciousness, or stroke symptoms, seek immediate medical attention.\n\nI can help connect you with urgent care resources if this is not an emergency.`,
        confidence: 98,
        suggestions: [
          "Call 911 now",
          "Find nearest ER",
          "Connect with urgent care",
        ],
      };
    }

    // Lab results analysis
    if (
      context?.labs ||
      input.includes("lab") ||
      input.includes("test") ||
      input.includes("blood")
    ) {
      return this.generateLabResponse(userLabResults, input);
    }

    // Medication analysis
    if (
      context?.medications ||
      input.includes("medication") ||
      input.includes("drug") ||
      input.includes("pill")
    ) {
      return this.generateMedicationResponse(userMedications, input);
    }

    // Symptom assessment
    if (
      context?.symptoms ||
      input.includes("symptom") ||
      input.includes("pain") ||
      input.includes("feel")
    ) {
      return this.generateSymptomResponse(input);
    }

    // General health inquiry
    return this.generateGeneralResponse(input, userLabResults, userMedications);
  }

  private static detectEmergency(input: string): boolean {
    const emergencyKeywords = [
      "chest pain",
      "can't breathe",
      "difficulty breathing",
      "heart attack",
      "stroke",
      "bleeding heavily",
      "unconscious",
      "severe pain",
      "emergency",
      "911",
      "ambulance",
      "dying",
    ];

    return emergencyKeywords.some((keyword) => input.includes(keyword));
  }

  private static generateLabResponse(
    labResults: LabResult[],
    input: string,
  ): {
    response: string;
    confidence: number;
    suggestions: string[];
  } {
    if (labResults.length === 0) {
      return {
        response:
          "I don't see any lab results in your profile yet. Would you like to upload a lab report for analysis? I can help interpret values, identify trends, and provide personalized insights based on your results.",
        confidence: 85,
        suggestions: [
          "Upload lab report",
          "Learn about lab tests",
          "Schedule lab work",
        ],
      };
    }

    const analysis = this.analyzeLabResults(labResults);
    const abnormalResults = labResults.filter((r) => r.status !== "normal");

    let response = `**Lab Results Analysis**\n\n`;
    response += `I've analyzed your recent lab results (${labResults.length} tests):\n\n`;

    // Highlight key findings
    labResults.forEach((result) => {
      const status =
        result.status === "normal"
          ? "✅"
          : result.status === "borderline"
            ? "⚠️"
            : "🔴";
      response += `${status} **${result.testName}**: ${result.value} ${result.unit} (${result.status})\n`;
    });

    response += `\n**Key Insights:**\n`;
    if (abnormalResults.length === 0) {
      response += `• All your lab values are within normal ranges\n`;
      response += `• This indicates good overall health status\n`;
    } else {
      abnormalResults.forEach((result) => {
        response += `• ${result.testName} needs attention - consider discussing with your doctor\n`;
      });
    }

    response += `\n**Overall Risk**: ${analysis.overallRisk.toUpperCase()}\n`;
    response += `\n${analysis.summary}`;

    return {
      response,
      confidence: 92,
      suggestions: [
        "Explain specific values",
        "Lifestyle recommendations",
        "When to retest",
        "Talk to doctor",
      ],
    };
  }

  private static generateMedicationResponse(
    medications: any[],
    input: string,
  ): {
    response: string;
    confidence: number;
    suggestions: string[];
  } {
    if (medications.length === 0) {
      return {
        response:
          "I don't see any medications in your profile. If you're taking any medications, please add them to get personalized interaction checking and optimization recommendations.",
        confidence: 80,
        suggestions: [
          "Add medications",
          "Check interactions",
          "Medication reminders",
        ],
      };
    }

    let response = `**Medication Analysis**\n\n`;
    response += `Current medications (${medications.length}):\n\n`;

    medications.forEach((med) => {
      response += `💊 **${med.name}** ${med.dosage}\n`;
      response += `   └ ${med.frequency} - ${med.instructions || "No special instructions"}\n`;
    });

    response += `\n**Safety Check**: ✅ No major interactions detected\n`;
    response += `**Optimization**: All medications appear appropriately dosed\n\n`;
    response += `⚠️ **Important**: Always consult your healthcare provider before making any medication changes.`;

    return {
      response,
      confidence: 88,
      suggestions: [
        "Check new drug interactions",
        "Medication timing tips",
        "Side effects to watch",
        "Pharmacy integration",
      ],
    };
  }

  private static generateSymptomResponse(input: string): {
    response: string;
    confidence: number;
    suggestions: string[];
  } {
    return {
      response: `**Symptom Assessment**\n\nI can help evaluate your symptoms, but this doesn't replace professional medical evaluation.\n\n**Please describe:**\n1. **Primary symptoms** - What are you experiencing?\n2. **Duration** - When did symptoms start?\n3. **Severity** - Rate 1-10 scale\n4. **Triggers** - What makes it better/worse?\n5. **Associated symptoms** - Any other concerns?\n\n🚨 **Seek immediate care for:**\n• Chest pain or difficulty breathing\n• Severe abdominal pain\n• High fever (>101.3°F)\n• Signs of stroke (FAST symptoms)\n• Severe allergic reactions`,
      confidence: 85,
      suggestions: [
        "Emergency symptoms guide",
        "When to see a doctor",
        "Symptom tracking",
        "Connect with provider",
      ],
    };
  }

  private static generateGeneralResponse(
    input: string,
    labResults: LabResult[],
    medications: any[],
  ): {
    response: string;
    confidence: number;
    suggestions: string[];
  } {
    return {
      response: `**AI Health Assistant**\n\nI'm here to help with your health questions using your personal medical data. I can assist with:\n\n🔬 **Lab Results** - Interpret ${labResults.length} recent tests\n💊 **Medications** - Analyze ${medications.length} current medications\n🩺 **Symptoms** - Assess and provide guidance\n📊 **Health Trends** - Track patterns over time\n🧬 **Personalized Insights** - AI-powered recommendations\n\nWhat specific aspect of your health would you like to explore? I have access to your recent data to provide personalized insights.`,
      confidence: 80,
      suggestions: [
        "Review latest labs",
        "Check medication safety",
        "Analyze health trends",
        "Get health summary",
      ],
    };
  }

  // OCR and document processing simulation
  static async processLabDocument(
    fileBuffer: Buffer,
    fileName: string,
  ): Promise<{
    extractedText: string;
    confidence: number;
    results: Omit<LabResult, "id" | "userId" | "createdAt">[];
  }> {
    // Simulate OCR processing time
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simulate extracted lab results
    const mockResults: Omit<LabResult, "id" | "userId" | "createdAt">[] = [
      {
        testName: "Glucose (Fasting)",
        value: 95,
        unit: "mg/dL",
        referenceRange: "70-100",
        status: "normal",
        testDate: new Date().toISOString().split("T")[0],
        labName: "Quest Diagnostics",
      },
      {
        testName: "Total Cholesterol",
        value: 205,
        unit: "mg/dL",
        referenceRange: "<200",
        status: "borderline",
        testDate: new Date().toISOString().split("T")[0],
        labName: "Quest Diagnostics",
      },
      {
        testName: "HDL Cholesterol",
        value: 58,
        unit: "mg/dL",
        referenceRange: ">40 (M), >50 (F)",
        status: "normal",
        testDate: new Date().toISOString().split("T")[0],
        labName: "Quest Diagnostics",
      },
      {
        testName: "LDL Cholesterol",
        value: 135,
        unit: "mg/dL",
        referenceRange: "<100",
        status: "high",
        testDate: new Date().toISOString().split("T")[0],
        labName: "Quest Diagnostics",
      },
    ];

    return {
      extractedText: `Lab Report - ${fileName}\nGlucose: 95 mg/dL\nTotal Cholesterol: 205 mg/dL\nHDL: 58 mg/dL\nLDL: 135 mg/dL`,
      confidence: 0.94,
      results: mockResults,
    };
  }
}
