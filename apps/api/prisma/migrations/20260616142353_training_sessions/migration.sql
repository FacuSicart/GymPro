-- CreateEnum
CREATE TYPE "TrainingSessionStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "StudentHistoryEventType" ADD VALUE 'TRAINING_SESSION_CREATED';
ALTER TYPE "StudentHistoryEventType" ADD VALUE 'TRAINING_SESSION_STARTED';
ALTER TYPE "StudentHistoryEventType" ADD VALUE 'TRAINING_SESSION_COMPLETED';
ALTER TYPE "StudentHistoryEventType" ADD VALUE 'TRAINING_SESSION_CANCELLED';
ALTER TYPE "StudentHistoryEventType" ADD VALUE 'TRAINING_SESSION_EXERCISE_UPDATED';

-- DropIndex
DROP INDEX "exercises_goals_idx";

-- DropIndex
DROP INDEX "exercises_levels_idx";

-- AlterTable
ALTER TABLE "exercises" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "student_history_events" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "student_profiles" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "students" ALTER COLUMN "id" DROP DEFAULT;

-- CreateTable
CREATE TABLE "training_sessions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "trainer_id" UUID NOT NULL,
    "routine_id" UUID NOT NULL,
    "routine_version_id" UUID NOT NULL,
    "status" "TrainingSessionStatus" NOT NULL DEFAULT 'PLANNED',
    "scheduled_date" DATE,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_session_days" (
    "id" UUID NOT NULL,
    "training_session_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_session_days_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_session_exercises" (
    "id" UUID NOT NULL,
    "training_session_day_id" UUID NOT NULL,
    "order" INTEGER NOT NULL,
    "exercise_name" TEXT NOT NULL,
    "exercise_video_url" TEXT,
    "exercise_image_url" TEXT,
    "routine_exercise_snapshot" JSONB NOT NULL,
    "planned_sets" INTEGER,
    "planned_repetitions" TEXT,
    "planned_rest_seconds" INTEGER,
    "planned_intensity" TEXT,
    "planned_tempo" TEXT,
    "planned_rir" INTEGER,
    "planned_rpe" INTEGER,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "actual_sets" INTEGER,
    "actual_repetitions" TEXT,
    "actual_load" TEXT,
    "actual_rest_seconds" INTEGER,
    "actual_rir" INTEGER,
    "actual_rpe" INTEGER,
    "trainer_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_session_exercises_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "training_sessions_tenant_id_idx" ON "training_sessions"("tenant_id");

-- CreateIndex
CREATE INDEX "training_sessions_student_id_idx" ON "training_sessions"("student_id");

-- CreateIndex
CREATE INDEX "training_sessions_trainer_id_idx" ON "training_sessions"("trainer_id");

-- CreateIndex
CREATE INDEX "training_sessions_routine_id_idx" ON "training_sessions"("routine_id");

-- CreateIndex
CREATE INDEX "training_sessions_status_idx" ON "training_sessions"("status");

-- CreateIndex
CREATE INDEX "training_session_days_training_session_id_idx" ON "training_session_days"("training_session_id");

-- CreateIndex
CREATE UNIQUE INDEX "training_session_days_training_session_id_order_key" ON "training_session_days"("training_session_id", "order");

-- CreateIndex
CREATE INDEX "training_session_exercises_training_session_day_id_idx" ON "training_session_exercises"("training_session_day_id");

-- CreateIndex
CREATE UNIQUE INDEX "training_session_exercises_training_session_day_id_order_key" ON "training_session_exercises"("training_session_day_id", "order");

-- AddForeignKey
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_routine_id_fkey" FOREIGN KEY ("routine_id") REFERENCES "routines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_routine_version_id_fkey" FOREIGN KEY ("routine_version_id") REFERENCES "routine_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_session_days" ADD CONSTRAINT "training_session_days_training_session_id_fkey" FOREIGN KEY ("training_session_id") REFERENCES "training_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_session_exercises" ADD CONSTRAINT "training_session_exercises_training_session_day_id_fkey" FOREIGN KEY ("training_session_day_id") REFERENCES "training_session_days"("id") ON DELETE CASCADE ON UPDATE CASCADE;
