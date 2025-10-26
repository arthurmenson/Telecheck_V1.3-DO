-- CreateTable
CREATE TABLE IF NOT EXISTS "doctor_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "credentials" TEXT NOT NULL,
    "bio" TEXT,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "review_count" INTEGER NOT NULL DEFAULT 0,
    "languages" TEXT[] DEFAULT ARRAY['English']::TEXT[],
    "video_enabled" BOOLEAN NOT NULL DEFAULT true,
    "phone_enabled" BOOLEAN NOT NULL DEFAULT true,
    "in_person_enabled" BOOLEAN NOT NULL DEFAULT false,
    "license_number" TEXT,
    "license_state" TEXT,
    "location" TEXT,
    "education" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "doctor_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "doctor_profiles_user_id_key" ON "doctor_profiles"("user_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "doctor_profiles_specialty_idx" ON "doctor_profiles"("specialty");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "doctor_profiles_video_enabled_idx" ON "doctor_profiles"("video_enabled");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "doctor_profiles_rating_idx" ON "doctor_profiles"("rating");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "doctor_profiles_user_id_idx" ON "doctor_profiles"("user_id");

-- AddForeignKey
ALTER TABLE "doctor_profiles" ADD CONSTRAINT "doctor_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
