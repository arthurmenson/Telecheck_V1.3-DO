import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedHCWTestData() {
  console.log("🌱 Seeding HCW Test Data...\n");

  try {
    // Step 1: Create a test patient user
    console.log("1️⃣ Creating test patient...");
    const patient = await prisma.user.upsert({
      where: { email: "test.patient@telecheck.com" },
      update: {},
      create: {
        email: "test.patient@telecheck.com",
        firstName: "John",
        lastName: "Patient",
        role: "PATIENT",
        phone: "(555) 111-2222",
        dateOfBirth: new Date("1985-06-15"),
        address: "123 Main St",
        city: "San Francisco",
        state: "CA",
        zipCode: "94102",
      },
    });
    console.log(
      `   ✅ Created patient: ${patient.firstName} ${patient.lastName} (${patient.id})`,
    );

    // Step 2: Create test caregiver users
    console.log("\n2️⃣ Creating test caregivers...");

    const caregiverUser1 = await prisma.user.upsert({
      where: { email: "dr.johnson@telecheck.com" },
      update: {},
      create: {
        email: "dr.johnson@telecheck.com",
        firstName: "Sarah",
        lastName: "Johnson",
        role: "CAREGIVER",
        phone: "(555) 123-4567",
      },
    });

    const caregiverUser2 = await prisma.user.upsert({
      where: { email: "dr.chen@telecheck.com" },
      update: {},
      create: {
        email: "dr.chen@telecheck.com",
        firstName: "Michael",
        lastName: "Chen",
        role: "CAREGIVER",
        phone: "(555) 234-5678",
      },
    });

    console.log(
      `   ✅ Created caregiver user 1: ${caregiverUser1.firstName} ${caregiverUser1.lastName}`,
    );
    console.log(
      `   ✅ Created caregiver user 2: ${caregiverUser2.firstName} ${caregiverUser2.lastName}`,
    );

    // Step 3: Create caregiver profiles
    console.log("\n3️⃣ Creating caregiver profiles...");

    const caregiver1 = await prisma.hCWCaregiver.upsert({
      where: { userId: caregiverUser1.id },
      update: {},
      create: {
        userId: caregiverUser1.id,
        specialty: "Primary Care",
        credentials: "MD, FACP",
        bio: "Board-certified internist with 15 years of experience in primary care and chronic disease management. Passionate about preventive medicine and patient education.",
        phoneNumber: "(555) 123-4567",
        email: "dr.johnson@telecheck.com",
        isActive: true,
      },
    });

    const caregiver2 = await prisma.hCWCaregiver.upsert({
      where: { userId: caregiverUser2.id },
      update: {},
      create: {
        userId: caregiverUser2.id,
        specialty: "Cardiology",
        credentials: "MD, FACC",
        bio: "Cardiologist specializing in heart failure and preventive cardiology with expertise in advanced heart failure management and cardiac imaging.",
        phoneNumber: "(555) 234-5678",
        email: "dr.chen@telecheck.com",
        isActive: true,
      },
    });

    console.log(`   ✅ Created caregiver profile 1: ${caregiver1.id}`);
    console.log(`   ✅ Created caregiver profile 2: ${caregiver2.id}`);

    // Step 4: Create assignments (link patient to caregivers)
    console.log("\n4️⃣ Creating patient-caregiver assignments...");

    const assignment1 = await prisma.hCWAssignment.create({
      data: {
        patientId: patient.id,
        caregiverId: caregiver1.id,
        assignmentType: "primary_care",
        isActive: true,
        assignedDate: new Date(),
      },
    });

    const assignment2 = await prisma.hCWAssignment.create({
      data: {
        patientId: patient.id,
        caregiverId: caregiver2.id,
        assignmentType: "specialist",
        isActive: true,
        assignedDate: new Date(),
      },
    });

    console.log(`   ✅ Assigned Dr. Johnson (Primary Care) to patient`);
    console.log(`   ✅ Assigned Dr. Chen (Cardiologist) to patient`);

    // Step 5: Create test messages
    console.log("\n5️⃣ Creating test messages...");

    // Message from caregiver to patient
    const message1 = await prisma.hCWMessage.create({
      data: {
        senderId: caregiverUser1.id,
        senderType: "caregiver",
        recipientId: patient.id,
        recipientType: "patient",
        content:
          "Hello John! I've reviewed your recent lab results and everything looks great. Your cholesterol levels have improved significantly since our last visit.",
        messageType: "text",
        priority: "normal",
        isRead: true,
        readAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
      },
    });

    // Message from patient to caregiver
    const message2 = await prisma.hCWMessage.create({
      data: {
        senderId: patient.id,
        senderType: "patient",
        recipientId: caregiverUser1.id,
        recipientType: "caregiver",
        content:
          "Thank you Dr. Johnson! That's great news. Do I need to make any changes to my medication or diet?",
        messageType: "text",
        priority: "normal",
        isRead: true,
        readAt: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      },
    });

    // Recent message from caregiver
    const message3 = await prisma.hCWMessage.create({
      data: {
        senderId: caregiverUser1.id,
        senderType: "caregiver",
        recipientId: patient.id,
        recipientType: "patient",
        content:
          "No changes needed! Just continue with your current medication and diet plan. Keep up the excellent work with your exercise routine.",
        messageType: "text",
        priority: "normal",
        isRead: false, // Unread message
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
    });

    // Message from cardiologist
    const message4 = await prisma.hCWMessage.create({
      data: {
        senderId: caregiverUser2.id,
        senderType: "caregiver",
        recipientId: patient.id,
        recipientType: "patient",
        content:
          "Hi John, this is Dr. Chen. I'd like to schedule a follow-up appointment to discuss your cardiac imaging results. Please let me know your availability for next week.",
        messageType: "text",
        priority: "high",
        isRead: false, // Unread message
        createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
      },
    });

    console.log(`   ✅ Created 4 test messages (2 unread)`);

    // Step 6: Create test visits
    console.log("\n6️⃣ Creating test visits...");

    // Upcoming visit 1
    const upcomingVisit1 = await prisma.hCWVisit.create({
      data: {
        patientId: patient.id,
        caregiverId: caregiver1.id,
        scheduledTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        visitType: "routine",
        purpose: "Quarterly check-up and blood pressure monitoring",
        location: "Home Visit - 123 Main St, San Francisco, CA 94102",
        status: "scheduled",
      },
    });

    // Upcoming visit 2
    const upcomingVisit2 = await prisma.hCWVisit.create({
      data: {
        patientId: patient.id,
        caregiverId: caregiver2.id,
        scheduledTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        visitType: "follow_up",
        purpose: "Cardiology follow-up - discuss cardiac imaging results",
        location: "Telecheck Clinic - 456 Medical Plaza, San Francisco, CA",
        status: "scheduled",
      },
    });

    // Past completed visit
    const pastVisit = await prisma.hCWVisit.create({
      data: {
        patientId: patient.id,
        caregiverId: caregiver1.id,
        scheduledTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        actualStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        actualEnd: new Date(
          Date.now() - 30 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000,
        ), // 45 min duration
        visitType: "routine",
        purpose: "Annual physical examination",
        location: "Home Visit - 123 Main St, San Francisco, CA 94102",
        status: "completed",
        rating: 5,
        feedback:
          "Excellent visit! Dr. Johnson was very thorough and took the time to answer all my questions. Very professional and caring.",
        notes:
          "Patient is in good overall health. Blood pressure controlled. Continue current medications. Follow up in 3 months for routine check-up.",
      },
    });

    console.log(`   ✅ Created 2 upcoming visits`);
    console.log(`   ✅ Created 1 completed visit`);

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("✅ HCW TEST DATA SEEDED SUCCESSFULLY!");
    console.log("=".repeat(60));
    console.log("\n📊 Summary:");
    console.log(
      `   - Patient: ${patient.firstName} ${patient.lastName} (${patient.email})`,
    );
    console.log(`   - Patient ID: ${patient.id}`);
    console.log(`   - Caregivers: 2`);
    console.log(`   - Assignments: 2`);
    console.log(`   - Messages: 4 (2 unread)`);
    console.log(`   - Upcoming Visits: 2`);
    console.log(`   - Past Visits: 1`);
    console.log("\n🧪 Ready for testing!");
    console.log(
      `\n🔗 Test the patient UI: https://whale-app-bs3xa.ondigitalocean.app`,
    );
    console.log(`   Login as: ${patient.email}`);
  } catch (error) {
    console.error("\n❌ Error seeding data:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedHCWTestData().catch((error) => {
  console.error(error);
  process.exit(1);
});
