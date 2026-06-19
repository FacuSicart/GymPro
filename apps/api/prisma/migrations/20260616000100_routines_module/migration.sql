-- AlterEnum
ALTER TYPE "StudentHistoryEventType" ADD VALUE 'ROUTINE_CREATED';
ALTER TYPE "StudentHistoryEventType" ADD VALUE 'ROUTINE_UPDATED';
ALTER TYPE "StudentHistoryEventType" ADD VALUE 'ROUTINE_PUBLISHED';
ALTER TYPE "StudentHistoryEventType" ADD VALUE 'ROUTINE_ARCHIVED';

-- CreateEnum
CREATE TYPE "RoutineStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateTable
CREATE TABLE "routines" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "trainer_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "goal" "ExerciseGoal",
    "status" "RoutineStatus" NOT NULL DEFAULT 'DRAFT',
    "start_date" DATE,
    "end_date" DATE,
    "version" INTEGER NOT NULL DEFAULT 0,
    "published_at" TIMESTAMP(3),
    "archived_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "routines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_days" (
    "id" UUID NOT NULL,
    "routine_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_days_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routine_exercises" (
    "id" UUID NOT NULL,
    "training_day_id" UUID NOT NULL,
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

    CONSTRAINT "routine_exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routine_versions" (
    "id" UUID NOT NULL,
    "routine_id" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "created_by_user_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "routine_versions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "routines_tenant_id_idx" ON "routines"("tenant_id");
CREATE INDEX "routines_student_id_idx" ON "routines"("student_id");
CREATE INDEX "routines_trainer_id_idx" ON "routines"("trainer_id");
CREATE INDEX "routines_status_idx" ON "routines"("status");

-- CreateIndex
CREATE UNIQUE INDEX "training_days_routine_id_order_key" ON "training_days"("routine_id", "order");
CREATE INDEX "training_days_routine_id_idx" ON "training_days"("routine_id");

-- CreateIndex
CREATE UNIQUE INDEX "routine_exercises_training_day_id_order_key" ON "routine_exercises"("training_day_id", "order");
CREATE INDEX "routine_exercises_training_day_id_idx" ON "routine_exercises"("training_day_id");
CREATE INDEX "routine_exercises_exercise_id_idx" ON "routine_exercises"("exercise_id");

-- CreateIndex
CREATE UNIQUE INDEX "routine_versions_routine_id_version_key" ON "routine_versions"("routine_id", "version");
CREATE INDEX "routine_versions_routine_id_idx" ON "routine_versions"("routine_id");

-- AddForeignKey
ALTER TABLE "routines" ADD CONSTRAINT "routines_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "routines" ADD CONSTRAINT "routines_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "routines" ADD CONSTRAINT "routines_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_days" ADD CONSTRAINT "training_days_routine_id_fkey" FOREIGN KEY ("routine_id") REFERENCES "routines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routine_exercises" ADD CONSTRAINT "routine_exercises_training_day_id_fkey" FOREIGN KEY ("training_day_id") REFERENCES "training_days"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "routine_exercises" ADD CONSTRAINT "routine_exercises_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routine_versions" ADD CONSTRAINT "routine_versions_routine_id_fkey" FOREIGN KEY ("routine_id") REFERENCES "routines"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "routine_versions" ADD CONSTRAINT "routine_versions_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
