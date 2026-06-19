CREATE TYPE "RoutineTemplateStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

CREATE TABLE "routine_templates" (
    "id" UUID NOT NULL,
    "trainer_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "goal" "ExerciseGoal",
    "status" "RoutineTemplateStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "routine_templates_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "routine_template_days" (
    "id" UUID NOT NULL,
    "template_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "routine_template_days_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "routine_template_exercises" (
    "id" UUID NOT NULL,
    "template_day_id" UUID NOT NULL,
    "exercise_id" UUID NOT NULL,
    "order" INTEGER NOT NULL,
    "sets" INTEGER,
    "repetitions" TEXT,
    "rest_seconds" INTEGER,
    "intensity" TEXT,
    "tempo" TEXT,
    "rir" INTEGER,
    "rpe" INTEGER,
    "observations" TEXT,
    "exercise_snapshot" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "routine_template_exercises_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "routine_templates_tenant_id_idx" ON "routine_templates"("tenant_id");
CREATE INDEX "routine_templates_trainer_id_idx" ON "routine_templates"("trainer_id");
CREATE INDEX "routine_templates_status_idx" ON "routine_templates"("status");
CREATE UNIQUE INDEX "routine_template_days_template_id_order_key" ON "routine_template_days"("template_id", "order");
CREATE INDEX "routine_template_days_template_id_idx" ON "routine_template_days"("template_id");
CREATE UNIQUE INDEX "routine_template_exercises_template_day_id_order_key" ON "routine_template_exercises"("template_day_id", "order");
CREATE INDEX "routine_template_exercises_template_day_id_idx" ON "routine_template_exercises"("template_day_id");
CREATE INDEX "routine_template_exercises_exercise_id_idx" ON "routine_template_exercises"("exercise_id");

ALTER TABLE "routine_templates" ADD CONSTRAINT "routine_templates_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "routine_templates" ADD CONSTRAINT "routine_templates_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "routine_template_days" ADD CONSTRAINT "routine_template_days_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "routine_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "routine_template_exercises" ADD CONSTRAINT "routine_template_exercises_template_day_id_fkey" FOREIGN KEY ("template_day_id") REFERENCES "routine_template_days"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "routine_template_exercises" ADD CONSTRAINT "routine_template_exercises_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
