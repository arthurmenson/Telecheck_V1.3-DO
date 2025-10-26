/**
 * Seed Medical Templates
 *
 * Seeds the database with common medical templates for various conditions
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const medicalTemplates = [
  {
    name: "Upper Respiratory Infection (URI)",
    category: "respiratory",
    specialty: "primary_care",
    chiefComplaintTemplate:
      "Patient presents with symptoms of upper respiratory infection",
    historyTemplate:
      "Patient reports onset of symptoms [X] days ago including: nasal congestion, runny nose, sore throat, cough. [No/Yes] fever. [No/Yes] shortness of breath. [No/Yes] chest pain.",
    assessmentTemplate:
      "Physical examination reveals: Nasal mucosa [pink/red/pale], [no/mild/moderate] nasal discharge. Throat [normal/erythematous] with [no/tonsillar] exudate. Lungs clear to auscultation bilaterally. No respiratory distress noted.",
    treatmentPlanTemplate:
      "1. Supportive care with rest and increased fluid intake\n2. Over-the-counter medications: acetaminophen or ibuprofen for pain/fever\n3. Decongestants as needed\n4. Throat lozenges for sore throat\n5. Return if symptoms worsen or persist beyond 10 days",
    followUpTemplate:
      "Follow up if symptoms persist beyond 10 days, worsen, or if patient develops high fever (>101.5°F), difficulty breathing, or chest pain. Seek immediate care for severe symptoms.",
    commonDiagnosisCodes: [
      {
        code: "J06.9",
        description: "Acute upper respiratory infection, unspecified",
      },
      { code: "J00", description: "Acute nasopharyngitis (common cold)" },
      { code: "J02.9", description: "Acute pharyngitis, unspecified" },
    ],
  },
  {
    name: "Hypertension Follow-up",
    category: "cardiovascular",
    specialty: "primary_care",
    chiefComplaintTemplate: "Follow-up visit for hypertension management",
    historyTemplate:
      "Patient currently taking [medication list]. Blood pressure readings at home: [values]. [No/Yes] headaches, [No/Yes] dizziness, [No/Yes] chest pain. Medication compliance: [good/fair/poor]. Lifestyle modifications: [diet, exercise, weight loss].",
    assessmentTemplate:
      "Blood pressure today: [systolic]/[diastolic] mmHg. Heart rate: [X] bpm, regular rhythm. Cardiovascular examination: [normal/abnormal findings]. No peripheral edema noted.",
    treatmentPlanTemplate:
      "1. Continue current antihypertensive medication\n2. Home blood pressure monitoring twice daily\n3. Dietary modifications: DASH diet, reduce sodium intake\n4. Regular exercise: 30 minutes daily, 5 days per week\n5. Weight management\n6. Limit alcohol consumption",
    followUpTemplate:
      "Follow-up in [4-8] weeks to reassess blood pressure control. Sooner if blood pressure >180/110 or symptoms of hypertensive urgency develop. Monitor for medication side effects.",
    commonDiagnosisCodes: [
      { code: "I10", description: "Essential (primary) hypertension" },
      {
        code: "I11.9",
        description: "Hypertensive heart disease without heart failure",
      },
    ],
  },
  {
    name: "Type 2 Diabetes Management",
    category: "endocrine",
    specialty: "primary_care",
    chiefComplaintTemplate: "Follow-up for Type 2 Diabetes Mellitus",
    historyTemplate:
      "Patient diagnosed with Type 2 Diabetes [duration]. Current medications: [list]. Home glucose monitoring: fasting [values], post-prandial [values]. Recent HbA1c: [value]. Adherence to diabetic diet: [good/fair/poor]. Exercise routine: [description]. [No/Yes] symptoms of hyperglycemia or hypoglycemia.",
    assessmentTemplate:
      "Physical examination: Weight [X] kg, BMI [X]. Cardiovascular: [normal/abnormal]. Feet examination: [normal/neuropathy/ulcers]. Visual acuity: [normal/requires referral].",
    treatmentPlanTemplate:
      "1. Continue current diabetes medications\n2. Home glucose monitoring as directed\n3. Diabetic diet adherence\n4. Regular physical activity\n5. Annual ophthalmology examination\n6. Annual foot examination\n7. Monitor for complications",
    followUpTemplate:
      "Follow-up in 3 months with HbA1c. Immediate follow-up if glucose consistently >300 mg/dL or <70 mg/dL, or symptoms of diabetic complications develop.",
    commonDiagnosisCodes: [
      {
        code: "E11.9",
        description: "Type 2 diabetes mellitus without complications",
      },
      {
        code: "E11.65",
        description: "Type 2 diabetes mellitus with hyperglycemia",
      },
    ],
  },
  {
    name: "Acute Anxiety",
    category: "mental_health",
    specialty: "primary_care",
    chiefComplaintTemplate: "Patient presents with symptoms of anxiety",
    historyTemplate:
      "Patient reports experiencing anxiety symptoms including: [worry, restlessness, difficulty concentrating, irritability, muscle tension, sleep disturbance]. Duration: [X weeks/months]. Triggers: [identified/none identified]. Impact on daily functioning: [minimal/moderate/severe]. Previous mental health treatment: [yes/no].",
    assessmentTemplate:
      "Mental status examination: Alert and oriented x3. Mood: anxious. Affect: [appropriate/restricted/labile]. Thought process: [organized/disorganized]. No suicidal or homicidal ideation. GAD-7 score: [X].",
    treatmentPlanTemplate:
      "1. Psychotherapy referral for CBT or other evidence-based therapy\n2. Lifestyle modifications: regular exercise, sleep hygiene, stress management\n3. Relaxation techniques: deep breathing, meditation\n4. Consider pharmacotherapy if symptoms moderate to severe\n5. Patient education about anxiety disorders",
    followUpTemplate:
      "Follow-up in 2-4 weeks to assess response to interventions. Immediate evaluation if symptoms worsen significantly or suicidal ideation develops. Crisis resources provided.",
    commonDiagnosisCodes: [
      { code: "F41.1", description: "Generalized anxiety disorder" },
      { code: "F41.9", description: "Anxiety disorder, unspecified" },
    ],
  },
  {
    name: "Acute Back Pain",
    category: "musculoskeletal",
    specialty: "primary_care",
    chiefComplaintTemplate: "Patient presents with acute lower back pain",
    historyTemplate:
      "Pain onset [X] days ago following [activity/no clear trigger]. Location: [lower back/radiating]. Character: [sharp/dull/aching]. Severity: [X/10]. Aggravating factors: [movement, sitting, standing]. Relieving factors: [rest, position]. [No/Yes] radiation to legs. [No/Yes] numbness/tingling. [No/Yes] bowel/bladder changes. Previous episodes: [yes/no].",
    assessmentTemplate:
      "Physical examination: Gait: [normal/antalgic]. Lumbar spine: [tenderness/muscle spasm]. Range of motion: [limited/normal]. Straight leg raise: [negative/positive] bilaterally. Neurological examination: [normal strength, sensation, reflexes/abnormal findings]. No signs of cauda equina syndrome.",
    treatmentPlanTemplate:
      "1. NSAIDs (ibuprofen) as needed for pain\n2. Remain active, avoid prolonged bed rest\n3. Ice/heat therapy\n4. Gentle stretching exercises\n5. Physical therapy referral if no improvement\n6. Ergonomic modifications",
    followUpTemplate:
      "Follow-up in 2 weeks if symptoms persist. Immediate evaluation if develops bowel/bladder dysfunction, progressive neurological deficits, or severe uncontrolled pain.",
    commonDiagnosisCodes: [
      { code: "M54.5", description: "Low back pain" },
      { code: "M54.50", description: "Low back pain, unspecified" },
    ],
  },
  {
    name: "Urinary Tract Infection (UTI)",
    category: "infectious",
    specialty: "primary_care",
    chiefComplaintTemplate:
      "Patient presents with symptoms of urinary tract infection",
    historyTemplate:
      "Patient reports [frequency, urgency, dysuria] for [X] days. [No/Yes] hematuria. [No/Yes] fever/chills. [No/Yes] flank pain. [No/Yes] nausea/vomiting. Previous UTIs: [yes/no]. Sexual activity: [relevant history]. Contraception: [relevant].",
    assessmentTemplate:
      "Vital signs: Temperature [X]°F. Abdominal examination: [suprapubic tenderness/no tenderness]. CVA tenderness: [negative/positive]. Urinalysis: [WBCs, bacteria, nitrites, blood]. [Urine culture sent/not sent].",
    treatmentPlanTemplate:
      "1. Antibiotic therapy: [specific antibiotic, duration]\n2. Increased fluid intake\n3. Cranberry products may help prevention\n4. Avoid bladder irritants (caffeine, alcohol, spicy foods)\n5. Complete full course of antibiotics\n6. Pain relief: phenazopyridine if needed",
    followUpTemplate:
      "Follow-up if symptoms not improving within 48-72 hours of starting antibiotics, or if symptoms worsen. Consider urine culture if recurrent infections. Seek immediate care for fever >101°F or severe flank pain.",
    commonDiagnosisCodes: [
      {
        code: "N39.0",
        description: "Urinary tract infection, site not specified",
      },
      { code: "N30.00", description: "Acute cystitis without hematuria" },
    ],
  },
  {
    name: "Migraine Headache",
    category: "neurological",
    specialty: "primary_care",
    chiefComplaintTemplate: "Patient presents with migraine headache",
    historyTemplate:
      "Headache onset [X] hours/days ago. Location: [unilateral/bilateral]. Character: [throbbing/pulsating]. Severity: [X/10]. Associated symptoms: [nausea, vomiting, photophobia, phonophobia, aura]. Duration: [X hours]. Frequency of migraines: [X per month]. Triggers identified: [stress, foods, hormonal, sleep]. Current medications: [abortive/preventive].",
    assessmentTemplate:
      "Neurological examination: Alert and oriented. Cranial nerves II-XII intact. Motor and sensory examination normal. Reflexes symmetric. No meningeal signs. No focal neurological deficits.",
    treatmentPlanTemplate:
      "1. Abortive therapy: [triptan, NSAID, or other medication]\n2. Anti-emetic if nausea present\n3. Rest in dark, quiet room\n4. Hydration\n5. Trigger avoidance strategies\n6. Consider preventive therapy if frequent migraines\n7. Headache diary to track patterns",
    followUpTemplate:
      "Follow-up in 4 weeks to assess frequency and response to treatment. Immediate evaluation for sudden severe headache, neurological changes, or 'worst headache of life'.",
    commonDiagnosisCodes: [
      {
        code: "G43.909",
        description:
          "Migraine, unspecified, not intractable, without status migrainosus",
      },
      {
        code: "G43.109",
        description:
          "Migraine with aura, not intractable, without status migrainosus",
      },
    ],
  },
  {
    name: "Dermatitis/Eczema",
    category: "dermatology",
    specialty: "primary_care",
    chiefComplaintTemplate: "Patient presents with skin rash/dermatitis",
    historyTemplate:
      "Rash onset [X] days/weeks ago. Location: [areas affected]. Symptoms: [itching, burning, pain]. Severity: [mild/moderate/severe]. Aggravating factors: [soaps, detergents, stress]. Previous episodes: [yes/no]. Treatments tried: [over-the-counter products]. Known allergies: [contact allergens].",
    assessmentTemplate:
      "Skin examination: [Location] shows [erythema, scaling, vesicles, lichenification]. Distribution: [symmetric/asymmetric]. [No/Yes] secondary infection signs. Remainder of skin examination: [normal/other findings].",
    treatmentPlanTemplate:
      "1. Topical corticosteroid: [strength, frequency]\n2. Moisturizer: frequent application\n3. Avoid triggers and irritants\n4. Gentle cleansers only\n5. Cool compresses for symptom relief\n6. Antihistamine for itching if needed\n7. Consider dermatology referral if severe or not responding",
    followUpTemplate:
      "Follow-up in 2 weeks if not improving or symptoms worsen. Earlier if signs of secondary infection develop (increased redness, warmth, drainage, fever).",
    commonDiagnosisCodes: [
      { code: "L30.9", description: "Dermatitis, unspecified" },
      { code: "L20.9", description: "Atopic dermatitis, unspecified" },
      {
        code: "L23.9",
        description: "Allergic contact dermatitis, unspecified cause",
      },
    ],
  },
  {
    name: "Gastroesophageal Reflux Disease (GERD)",
    category: "gastrointestinal",
    specialty: "primary_care",
    chiefComplaintTemplate: "Patient presents with symptoms of GERD",
    historyTemplate:
      "Patient reports [heartburn, regurgitation] for [duration]. Frequency: [daily/weekly]. Timing: [after meals, nighttime]. Severity: [mild/moderate/severe]. Aggravating factors: [specific foods, lying down, large meals]. [No/Yes] alarm symptoms (dysphagia, weight loss, bleeding). Previous treatment: [antacids, lifestyle modifications].",
    assessmentTemplate:
      "Vital signs stable. Abdominal examination: soft, non-tender. No epigastric masses. No signs of complications. [Consider/Not indicated] endoscopy for alarm symptoms.",
    treatmentPlanTemplate:
      "1. Proton pump inhibitor (PPI) therapy\n2. Lifestyle modifications:\n   - Elevate head of bed\n   - Avoid eating 2-3 hours before bedtime\n   - Small, frequent meals\n   - Avoid trigger foods (caffeine, alcohol, spicy, fatty foods)\n   - Weight loss if overweight\n   - Smoking cessation\n3. Avoid tight clothing\n4. Antacids for breakthrough symptoms",
    followUpTemplate:
      "Follow-up in 4-8 weeks to assess response. If symptoms persist despite treatment, consider endoscopy. Immediate evaluation for severe chest pain, difficulty swallowing, or vomiting blood.",
    commonDiagnosisCodes: [
      {
        code: "K21.9",
        description: "Gastro-esophageal reflux disease without esophagitis",
      },
      {
        code: "K21.0",
        description: "Gastro-esophageal reflux disease with esophagitis",
      },
    ],
  },
  {
    name: "Acute Bronchitis",
    category: "respiratory",
    specialty: "primary_care",
    chiefComplaintTemplate:
      "Patient presents with cough and suspected bronchitis",
    historyTemplate:
      "Cough onset [X] days ago. Character: [productive/dry]. Sputum: [color, amount]. Associated symptoms: [fever, chest discomfort, wheezing]. [No/Yes] shortness of breath. Recent URI: [yes/no]. Smoking history: [pack-years/non-smoker]. [No/Yes] chronic lung disease.",
    assessmentTemplate:
      "Vital signs: Temperature [X]°F, O2 saturation [X]% on room air. Respiratory rate: [X]. Lung examination: [clear/rhonchi/wheezing] bilaterally. No focal consolidation. No respiratory distress. Cardiac examination: normal.",
    treatmentPlanTemplate:
      "1. Supportive care - cough typically resolves in 2-3 weeks\n2. Increased fluid intake\n3. Honey or cough suppressant for symptomatic relief\n4. Bronchodilator inhaler if wheezing present\n5. Antipyretic for fever\n6. Avoid smoking and irritants\n7. Antibiotics NOT indicated for uncomplicated acute bronchitis",
    followUpTemplate:
      "Follow-up if symptoms persist beyond 3 weeks, worsen, or if develops high fever, shortness of breath, or chest pain. Consider chest X-ray if concerned about pneumonia.",
    commonDiagnosisCodes: [
      { code: "J20.9", description: "Acute bronchitis, unspecified" },
      {
        code: "J40",
        description: "Bronchitis, not specified as acute or chronic",
      },
    ],
  },
];

async function main() {
  console.log("Seeding medical templates...");

  for (const template of medicalTemplates) {
    await prisma.medicalTemplate.upsert({
      where: { name: template.name },
      update: template,
      create: template,
    });
    console.log(`✓ Created/updated template: ${template.name}`);
  }

  console.log("✓ Medical templates seeded successfully");
}

main()
  .catch((e) => {
    console.error("Error seeding templates:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
