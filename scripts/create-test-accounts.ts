/**
 * Create Test Accounts for TeleVisit Testing
 *
 * Creates:
 * 1. Test Provider (Doctor) with full profile
 * 2. Test Patient with basic profile
 *
 * Usage: tsx scripts/create-test-accounts.ts
 */

import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function createTestAccounts() {
  console.log("🚀 Creating test accounts for TeleVisit testing...\n");

  try {
    // ============================================================================
    // 1. CREATE TEST PROVIDER (DOCTOR)
    // ============================================================================
    console.log("👨‍⚕️ Creating test provider account...");

    const providerEmail = "testdoctor-20251027@telecheck.test";
    const providerPassword = "TestDoctor123!";

    // Check if provider already exists
    const existingProvider = await prisma.user.findUnique({
      where: { email: providerEmail },
    });

    if (existingProvider) {
      console.log(`⚠️  Provider already exists: ${providerEmail}`);
      console.log(`   User ID: ${existingProvider.id}`);
    } else {
      // Hash password
      const hashedProviderPassword = await bcrypt.hash(providerPassword, 10);

      // Create provider user
      const provider = await prisma.user.create({
        data: {
          email: providerEmail,
          password: hashedProviderPassword,
          role: "DOCTOR",
          name: "Dr. Test Provider",
          dateOfBirth: new Date("1980-05-15"),
          phone: "+1-555-TEST-DOC",
        },
      });

      console.log(`✅ Provider user created: ${provider.email}`);
      console.log(`   User ID: ${provider.id}`);

      // Create doctor profile
      const doctorProfile = await prisma.doctorProfile.create({
        data: {
          userId: provider.id,
          specialty: "Family Medicine",
          credentials: "MD, FAAFP",
          bio: "Board-certified family medicine physician with 10 years of experience. Specializes in preventive care, chronic disease management, and telehealth services. Dedicated to providing compassionate, patient-centered care.",
          experience: 10,
          rating: 4.8,
          languages: ["English", "Spanish"],
          videoEnabled: true,
          phoneEnabled: true,
          inPersonEnabled: true,
          location: "New York, NY",
          availability: {
            monday: ["09:00-17:00"],
            tuesday: ["09:00-17:00"],
            wednesday: ["09:00-17:00"],
            thursday: ["09:00-17:00"],
            friday: ["09:00-17:00"],
          },
        },
      });

      console.log(`✅ Doctor profile created`);
      console.log(`   Specialty: ${doctorProfile.specialty}`);
      console.log(`   Rating: ${doctorProfile.rating}`);
    }

    // ============================================================================
    // 2. CREATE TEST PATIENT
    // ============================================================================
    console.log("\n👤 Creating test patient account...");

    const patientEmail = "testpatient-20251027@telecheck.test";
    const patientPassword = "TestPatient123!";

    // Check if patient already exists
    const existingPatient = await prisma.user.findUnique({
      where: { email: patientEmail },
    });

    if (existingPatient) {
      console.log(`⚠️  Patient already exists: ${patientEmail}`);
      console.log(`   User ID: ${existingPatient.id}`);
    } else {
      // Hash password
      const hashedPatientPassword = await bcrypt.hash(patientPassword, 10);

      // Create patient user
      const patient = await prisma.user.create({
        data: {
          email: patientEmail,
          password: hashedPatientPassword,
          role: "PATIENT",
          name: "Test Patient",
          dateOfBirth: new Date("1990-01-15"),
          phone: "+1-555-TEST-001",
          address: {
            street: "123 Test Street",
            city: "Test City",
            state: "NY",
            zipCode: "10001",
          },
        },
      });

      console.log(`✅ Patient user created: ${patient.email}`);
      console.log(`   User ID: ${patient.id}`);
    }

    // ============================================================================
    // 3. SUMMARY
    // ============================================================================
    console.log("\n" + "=".repeat(70));
    console.log("📋 TEST ACCOUNTS SUMMARY");
    console.log("=".repeat(70));

    console.log("\n👨‍⚕️ TEST PROVIDER (DOCTOR)");
    console.log("   Email:    testdoctor-20251027@telecheck.test");
    console.log("   Password: TestDoctor123!");
    console.log("   Role:     DOCTOR");
    console.log("   Name:     Dr. Test Provider");
    console.log("   Specialty: Family Medicine");

    console.log("\n👤 TEST PATIENT");
    console.log("   Email:    testpatient-20251027@telecheck.test");
    console.log("   Password: TestPatient123!");
    console.log("   Role:     PATIENT");
    console.log("   Name:     Test Patient");

    console.log("\n" + "=".repeat(70));
    console.log("✅ Test accounts ready for testing!");
    console.log("=".repeat(70));

    console.log("\n📝 Next Steps:");
    console.log("   1. Login as patient: testpatient-20251027@telecheck.test");
    console.log("   2. Navigate to Schedule Appointment");
    console.log("   3. Complete the 8-step booking flow");
    console.log(
      '   4. Verify "Dr. Test Provider" appears in provider list (Step 5)',
    );
    console.log("   5. Complete booking and verify database persistence");
    console.log("   6. Login as provider to test video consultation");

    console.log("\n🔗 Application URL:");
    console.log("   https://whale-app-bs3xa.ondigitalocean.app");

    console.log("\n📖 Test Plan:");
    console.log("   See TELEVISIT_TEST_PLAN.md for detailed test cases");
  } catch (error) {
    console.error("❌ Error creating test accounts:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createTestAccounts()
  .then(() => {
    console.log("\n✅ Script completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Script failed:", error);
    process.exit(1);
  });
