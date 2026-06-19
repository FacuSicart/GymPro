CREATE TYPE "ExerciseApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TYPE "ExerciseOperationalStatus" AS ENUM ('ACTIVE', 'INACTIVE');

CREATE TYPE "ExerciseLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

CREATE TYPE "ExerciseGoal" AS ENUM ('STRENGTH', 'HYPERTROPHY', 'MOBILITY', 'ENDURANCE', 'CONDITIONING');

CREATE TABLE "exercises" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "primary_muscle_group" TEXT NOT NULL,
    "secondary_muscle_groups" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "movement_pattern" TEXT NOT NULL,
    "level" "ExerciseLevel" NOT NULL,
    "equipment_needed" TEXT NOT NULL,
    "goal" "ExerciseGoal" NOT NULL,
    "technical_instructions" TEXT NOT NULL,
    "common_mistakes" TEXT,
    "contraindications" TEXT,
    "video_url" TEXT,
    "image_url" TEXT,
    "approval_status" "ExerciseApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "operational_status" "ExerciseOperationalStatus" NOT NULL DEFAULT 'INACTIVE',
    "created_by_user_id" UUID NOT NULL,
    "reviewed_by_user_id" UUID,
    "reviewed_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exercises_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "exercises_approval_status_operational_status_idx" ON "exercises"("approval_status", "operational_status");
CREATE INDEX "exercises_primary_muscle_group_idx" ON "exercises"("primary_muscle_group");
CREATE INDEX "exercises_goal_idx" ON "exercises"("goal");
CREATE INDEX "exercises_level_idx" ON "exercises"("level");
CREATE INDEX "exercises_movement_pattern_idx" ON "exercises"("movement_pattern");
CREATE INDEX "exercises_created_by_user_id_idx" ON "exercises"("created_by_user_id");

ALTER TABLE "exercises" ADD CONSTRAINT "exercises_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_reviewed_by_user_id_fkey" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
