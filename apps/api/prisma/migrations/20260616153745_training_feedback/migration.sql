-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "StudentHistoryEventType" ADD VALUE 'TRAINING_FEEDBACK_SUBMITTED';
ALTER TYPE "StudentHistoryEventType" ADD VALUE 'TRAINING_FEEDBACK_DISCOMFORT_REPORTED';

-- CreateTable
CREATE TABLE "training_feedback" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "trainer_id" UUID NOT NULL,
    "routine_id" UUID NOT NULL,
    "routine_version_id" UUID NOT NULL,
    "training_session_id" UUID NOT NULL,
    "public_routine_link_id" UUID,
    "difficulty_score" INTEGER NOT NULL,
    "energy_score" INTEGER NOT NULL,
    "completed_workout" BOOLEAN NOT NULL,
    "incomplete_reason" TEXT,
    "had_discomfort" BOOLEAN NOT NULL,
    "discomfort_area" TEXT,
    "discomfort_intensity" INTEGER,
    "discomfort_description" TEXT,
    "general_comment" TEXT,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "training_feedback_training_session_id_key" ON "training_feedback"("training_session_id");

-- CreateIndex
CREATE INDEX "training_feedback_tenant_id_idx" ON "training_feedback"("tenant_id");

-- CreateIndex
CREATE INDEX "training_feedback_student_id_idx" ON "training_feedback"("student_id");

-- CreateIndex
CREATE INDEX "training_feedback_trainer_id_idx" ON "training_feedback"("trainer_id");

-- CreateIndex
CREATE INDEX "training_feedback_routine_id_idx" ON "training_feedback"("routine_id");

-- AddForeignKey
ALTER TABLE "training_feedback" ADD CONSTRAINT "training_feedback_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_feedback" ADD CONSTRAINT "training_feedback_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_feedback" ADD CONSTRAINT "training_feedback_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_feedback" ADD CONSTRAINT "training_feedback_routine_id_fkey" FOREIGN KEY ("routine_id") REFERENCES "routines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_feedback" ADD CONSTRAINT "training_feedback_routine_version_id_fkey" FOREIGN KEY ("routine_version_id") REFERENCES "routine_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_feedback" ADD CONSTRAINT "training_feedback_training_session_id_fkey" FOREIGN KEY ("training_session_id") REFERENCES "training_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_feedback" ADD CONSTRAINT "training_feedback_public_routine_link_id_fkey" FOREIGN KEY ("public_routine_link_id") REFERENCES "public_routine_links"("id") ON DELETE SET NULL ON UPDATE CASCADE;
