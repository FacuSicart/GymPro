CREATE TYPE "AiLogType" AS ENUM ('ROUTINE_GENERATION');

CREATE TYPE "AiLogStatus" AS ENUM ('SUCCESS', 'REJECTED_SCHEMA', 'REJECTED_RULES', 'ERROR');

CREATE TABLE "ai_logs" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "student_id" UUID,
    "routine_id" UUID,
    "type" "AiLogType" NOT NULL,
    "status" "AiLogStatus" NOT NULL,
    "model" TEXT NOT NULL,
    "prompt_version" TEXT NOT NULL,
    "strategy_version" TEXT NOT NULL,
    "input_summary" JSONB,
    "output_summary" JSONB,
    "error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ai_logs_tenant_id_idx" ON "ai_logs"("tenant_id");
CREATE INDEX "ai_logs_user_id_idx" ON "ai_logs"("user_id");
CREATE INDEX "ai_logs_student_id_idx" ON "ai_logs"("student_id");
CREATE INDEX "ai_logs_routine_id_idx" ON "ai_logs"("routine_id");
CREATE INDEX "ai_logs_type_status_idx" ON "ai_logs"("type", "status");

ALTER TABLE "ai_logs" ADD CONSTRAINT "ai_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ai_logs" ADD CONSTRAINT "ai_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ai_logs" ADD CONSTRAINT "ai_logs_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ai_logs" ADD CONSTRAINT "ai_logs_routine_id_fkey" FOREIGN KEY ("routine_id") REFERENCES "routines"("id") ON DELETE SET NULL ON UPDATE CASCADE;
