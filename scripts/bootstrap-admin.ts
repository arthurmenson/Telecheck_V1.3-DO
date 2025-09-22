import "dotenv/config";
import bcrypt from "bcrypt";
import { dbPool } from "../server/config/database";

const REQUIRED_PASSWORD_LENGTH = 12;
const ALLOWED_ROLES = new Set(["admin", "super_admin"]);

const assert = (condition: boolean, message: string): void => {
  if (!condition) {
    throw new Error(message);
  }
};

async function main() {
  const email = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim();
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  const firstName =
    process.env.ADMIN_BOOTSTRAP_FIRST_NAME?.trim() || "Telecheck";
  const lastName =
    process.env.ADMIN_BOOTSTRAP_LAST_NAME?.trim() || "Administrator";
  const role = process.env.ADMIN_BOOTSTRAP_ROLE?.trim() || "admin";
  const rotateExisting = process.env.ADMIN_BOOTSTRAP_ROTATE === "true";

  assert(!!email, "ADMIN_BOOTSTRAP_EMAIL must be provided.");
  assert(!!password, "ADMIN_BOOTSTRAP_PASSWORD must be provided.");
  assert(
    password!.length >= REQUIRED_PASSWORD_LENGTH,
    `ADMIN_BOOTSTRAP_PASSWORD must be at least ${REQUIRED_PASSWORD_LENGTH} characters long.`,
  );
  assert(
    /[A-Z]/.test(password!) &&
      /[a-z]/.test(password!) &&
      /[0-9]/.test(password!),
    "ADMIN_BOOTSTRAP_PASSWORD must include upper and lowercase letters and a number.",
  );
  assert(
    ALLOWED_ROLES.has(role),
    `ADMIN_BOOTSTRAP_ROLE must be one of: ${Array.from(ALLOWED_ROLES).join(", ")}`,
  );
  assert(!!dbPool, "Database connection pool is not configured.");

  const client = await dbPool!.connect();

  try {
    await client.query("BEGIN");

    const existingUser = await client.query(
      "SELECT id, role, is_active FROM users WHERE email = $1",
      [email],
    );

    if (existingUser.rowCount && !rotateExisting) {
      throw new Error(
        "Admin account already exists for this email. Set ADMIN_BOOTSTRAP_ROTATE=true to rotate credentials.",
      );
    }

    const passwordHash = await bcrypt.hash(password!, 12);

    if (existingUser.rowCount) {
      const userId = existingUser.rows[0].id;
      await client.query(
        `
          UPDATE users
          SET password_hash = $1, role = $2, is_active = true, updated_at = NOW()
          WHERE id = $3
        `,
        [passwordHash, role, userId],
      );
    } else {
      await client.query(
        `
          INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_active, created_at, updated_at)
          VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, true, NOW(), NOW())
        `,
        [email, passwordHash, firstName, lastName, role],
      );
    }

    await client.query("COMMIT");

    console.log("✅ Admin bootstrap completed successfully.");
    console.log(
      "➡️  Remember to remove ADMIN_BOOTSTRAP_* secrets from runtime environments after use.",
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(
      "❌ Failed to bootstrap admin account:",
      error instanceof Error ? error.message : error,
    );
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

main().catch((error) => {
  console.error(
    "❌ Unexpected bootstrap failure:",
    error instanceof Error ? error.stack : error,
  );
  process.exitCode = 1;
});
