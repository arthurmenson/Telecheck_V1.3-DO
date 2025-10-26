import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function seedDoctors() {
  console.log("Starting doctor seeding...");

  const sampleDoctors = [
    {
      email: "sarah.johnson@telecheck.health",
      password: await bcrypt.hash("Doctor123!", 10),
      firstName: "Sarah",
      lastName: "Johnson",
      role: "DOCTOR" as const,
      phone: "+1-555-0101",
      profile: {
        specialty: "Cardiology",
        credentials: "MD, FACC",
        bio: "Board-certified cardiologist with over 15 years of experience in preventive cardiology and cardiovascular disease management. Specializes in high cholesterol, heart disease, and drug interaction management.",
        experience: 15,
        rating: 4.9,
        reviewCount: 247,
        languages: ["English", "Spanish"],
        videoEnabled: true,
        phoneEnabled: true,
        inPersonEnabled: true,
        licenseNumber: "MD-12345",
        licenseState: "MA",
        location: "Heart Care Center, Downtown Boston",
        education: "Harvard Medical School",
      },
    },
    {
      email: "michael.chen@telecheck.health",
      password: await bcrypt.hash("Doctor123!", 10),
      firstName: "Michael",
      lastName: "Chen",
      role: "DOCTOR" as const,
      phone: "+1-555-0102",
      profile: {
        specialty: "Internal Medicine",
        credentials: "MD, FACP",
        bio: "Board-certified internist with expertise in preventive care, medication management, and comprehensive lab result interpretation. Committed to helping patients achieve optimal health through evidence-based medicine.",
        experience: 12,
        rating: 4.8,
        reviewCount: 189,
        languages: ["English", "Mandarin"],
        videoEnabled: true,
        phoneEnabled: true,
        inPersonEnabled: true,
        licenseNumber: "MD-23456",
        licenseState: "MA",
        location: "Medical Plaza, Main Street",
        education: "Johns Hopkins School of Medicine",
      },
    },
    {
      email: "emily.rodriguez@telecheck.health",
      password: await bcrypt.hash("Doctor123!", 10),
      firstName: "Emily",
      lastName: "Rodriguez",
      role: "DOCTOR" as const,
      phone: "+1-555-0103",
      profile: {
        specialty: "Endocrinology",
        credentials: "MD, FACE",
        bio: "Diabetes and metabolism specialist with 18 years of experience. Expert in diabetes management, metabolic disorders, and hormone therapy. Passionate about patient education and empowerment.",
        experience: 18,
        rating: 4.9,
        reviewCount: 312,
        languages: ["English", "Spanish"],
        videoEnabled: true,
        phoneEnabled: true,
        inPersonEnabled: false,
        licenseNumber: "MD-34567",
        licenseState: "MA",
        location: "Diabetes & Hormone Center, Cambridge",
        education: "Mayo Clinic",
      },
    },
    {
      email: "james.williams@telecheck.health",
      password: await bcrypt.hash("Doctor123!", 10),
      firstName: "James",
      lastName: "Williams",
      role: "DOCTOR" as const,
      phone: "+1-555-0104",
      profile: {
        specialty: "Primary Care",
        credentials: "MD",
        bio: "Family medicine physician providing comprehensive primary care for patients of all ages. Focus on preventive health, chronic disease management, and patient-centered care.",
        experience: 10,
        rating: 4.7,
        reviewCount: 156,
        languages: ["English"],
        videoEnabled: true,
        phoneEnabled: true,
        inPersonEnabled: true,
        licenseNumber: "MD-45678",
        licenseState: "MA",
        location: "Community Health Center, Somerville",
        education: "Boston University School of Medicine",
      },
    },
    {
      email: "lisa.patel@telecheck.health",
      password: await bcrypt.hash("Doctor123!", 10),
      firstName: "Lisa",
      lastName: "Patel",
      role: "DOCTOR" as const,
      phone: "+1-555-0105",
      profile: {
        specialty: "Nephrology",
        credentials: "MD, FASN",
        bio: "Kidney disease specialist with expertise in chronic kidney disease, hypertension management, and electrolyte disorders. Committed to helping patients preserve kidney function through comprehensive care.",
        experience: 14,
        rating: 4.8,
        reviewCount: 203,
        languages: ["English", "Hindi", "Gujarati"],
        videoEnabled: true,
        phoneEnabled: true,
        inPersonEnabled: true,
        licenseNumber: "MD-56789",
        licenseState: "MA",
        location: "Kidney Care Institute, Boston",
        education: "University of Pennsylvania",
      },
    },
  ];

  for (const doctorData of sampleDoctors) {
    try {
      // Check if doctor already exists
      const existingDoctor = await prisma.user.findUnique({
        where: { email: doctorData.email },
      });

      if (existingDoctor) {
        console.log(`Doctor ${doctorData.email} already exists, skipping...`);
        continue;
      }

      // Create doctor user
      const doctor = await prisma.user.create({
        data: {
          email: doctorData.email,
          firstName: doctorData.firstName,
          lastName: doctorData.lastName,
          role: doctorData.role,
          phone: doctorData.phone,
          doctorProfile: {
            create: doctorData.profile,
          },
        },
        include: {
          doctorProfile: true,
        },
      });

      console.log(
        `Created doctor: ${doctor.firstName} ${doctor.lastName} (${doctor.email})`,
      );
    } catch (error) {
      console.error(`Error creating doctor ${doctorData.email}:`, error);
    }
  }

  console.log("Doctor seeding completed!");
}

seedDoctors()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
