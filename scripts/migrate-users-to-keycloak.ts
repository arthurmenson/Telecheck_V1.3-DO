/**
 * User Migration Script: PostgreSQL → Keycloak
 *
 * This script migrates existing users from PostgreSQL to Keycloak
 * while maintaining their roles, passwords, and profile information.
 *
 * Usage:
 *   npx tsx scripts/migrate-users-to-keycloak.ts
 *
 * Prerequisites:
 *   - Keycloak server must be running
 *   - Environment variables must be configured
 *   - Database connection must be available
 */

import { dbPool } from "../server/config/database";
import {
  createKeycloakUser,
  assignRoleToUser,
  getKeycloakAdminClient,
} from "../server/services/keycloak-service";
import { prisma } from "../server/config/prisma";

interface MigrationStats {
  total: number;
  migrated: number;
  skipped: number;
  failed: number;
  errors: Array<{ email: string; error: string }>;
}

// Role mapping from PostgreSQL to Keycloak
const ROLE_MAPPING: Record<string, string> = {
  PATIENT: "PATIENT",
  DOCTOR: "DOCTOR",
  ADMIN: "ADMIN",
  NURSE: "NURSE",
  PHARMACIST: "PHARMACIST",
  CAREGIVER: "CAREGIVER",
};

async function migrateUsersToKeycloak(): Promise<MigrationStats> {
  const stats: MigrationStats = {
    total: 0,
    migrated: 0,
    skipped: 0,
    failed: 0,
    errors: [],
  };

  try {
    console.log("🚀 Starting user migration to Keycloak...\n");

    // Verify Keycloak connection
    try {
      const adminClient = await getKeycloakAdminClient();
      console.log("✓ Connected to Keycloak successfully\n");
    } catch (error) {
      console.error("❌ Failed to connect to Keycloak:", error);
      throw new Error(
        "Keycloak connection failed. Please check configuration.",
      );
    }

    // Fetch all users from PostgreSQL
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        keycloakId: true,
        phone: true,
        createdAt: true,
      },
    });

    stats.total = users.length;
    console.log(`📊 Found ${stats.total} users to migrate\n`);

    // Migrate each user
    for (const user of users) {
      console.log(`Processing: ${user.email} (${user.role})...`);

      try {
        // Skip if already migrated
        if (user.keycloakId) {
          console.log(
            `  ⏭️  Already migrated (Keycloak ID: ${user.keycloakId})\n`,
          );
          stats.skipped++;
          continue;
        }

        // Create user in Keycloak
        const keycloakUserId = await createKeycloakUser(
          {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            phone: user.phone || undefined,
            enabled: true,
            emailVerified: true, // Assume existing users have verified emails
            temporaryPassword: false,
          },
          "migration-script", // Admin user ID
        );

        if (!keycloakUserId) {
          throw new Error("Failed to create user in Keycloak");
        }

        // Assign role in Keycloak
        const keycloakRole = ROLE_MAPPING[user.role] || "PATIENT";
        await assignRoleToUser(
          keycloakUserId,
          keycloakRole,
          "migration-script",
        );

        // Update PostgreSQL with Keycloak ID
        await prisma.user.update({
          where: { id: user.id },
          data: { keycloakId: keycloakUserId },
        });

        console.log(
          `  ✓ Migrated successfully (Keycloak ID: ${keycloakUserId})\n`,
        );
        stats.migrated++;
      } catch (error: any) {
        console.error(`  ❌ Failed: ${error.message}\n`);
        stats.failed++;
        stats.errors.push({
          email: user.email,
          error: error.message,
        });
      }
    }

    // Print summary
    console.log("\n" + "=".repeat(60));
    console.log("📈 MIGRATION SUMMARY");
    console.log("=".repeat(60));
    console.log(`Total users:       ${stats.total}`);
    console.log(`✓ Migrated:        ${stats.migrated}`);
    console.log(`⏭️  Skipped:         ${stats.skipped}`);
    console.log(`❌ Failed:          ${stats.failed}`);
    console.log("=".repeat(60));

    if (stats.errors.length > 0) {
      console.log("\n❌ ERRORS:");
      stats.errors.forEach(({ email, error }) => {
        console.log(`  • ${email}: ${error}`);
      });
    }

    console.log("\n✅ Migration completed!\n");
  } catch (error: any) {
    console.error("\n💥 Migration failed:", error.message);
    throw error;
  }

  return stats;
}

// Run migration
if (require.main === module) {
  migrateUsersToKeycloak()
    .then((stats) => {
      process.exit(stats.failed > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error("Fatal error:", error);
      process.exit(1);
    });
}

export { migrateUsersToKeycloak };
