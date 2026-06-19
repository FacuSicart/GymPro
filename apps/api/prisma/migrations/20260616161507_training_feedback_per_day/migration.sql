-- DropIndex
DROP INDEX "training_feedback_training_session_id_key";

-- AlterTable
ALTER TABLE "training_feedback" ADD COLUMN     "training_session_day_id" UUID NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "training_feedback_training_session_day_id_key" ON "training_feedback"("training_session_day_id");

-- CreateIndex
CREATE INDEX "training_feedback_training_session_id_idx" ON "training_feedback"("training_session_id");

-- AddForeignKey
ALTER TABLE "training_feedback" ADD CONSTRAINT "training_feedback_training_session_day_id_fkey" FOREIGN KEY ("training_session_day_id") REFERENCES "training_session_days"("id") ON DELETE CASCADE ON UPDATE CASCADE;
