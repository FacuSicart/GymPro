CREATE TYPE "StudentStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

CREATE TYPE "StudentHistoryEventType" AS ENUM ('STUDENT_CREATED', 'STUDENT_UPDATED', 'PROFILE_UPDATED');

CREATE TABLE "students" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "trainer_id" UUID NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "status" "StudentStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "student_profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "student_id" UUID NOT NULL,
    "goal" TEXT,
    "experience" TEXT,
    "age" INTEGER,
    "weight_kg" DECIMAL(5,2),
    "height_cm" DECIMAL(5,2),
    "previous_physical_notes" TEXT,
    "restrictions" TEXT,
    "recurrent_discomforts" TEXT,
    "observations" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_profiles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "student_history_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "student_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "trainer_id" UUID NOT NULL,
    "created_by_user_id" UUID NOT NULL,
    "type" "StudentHistoryEventType" NOT NULL,
    "summary" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_history_events_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "student_profiles_student_id_key" ON "student_profiles"("student_id");
CREATE INDEX "students_tenant_id_idx" ON "students"("tenant_id");
CREATE INDEX "students_trainer_id_idx" ON "students"("trainer_id");
CREATE INDEX "students_tenant_id_trainer_id_idx" ON "students"("tenant_id", "trainer_id");
CREATE INDEX "student_history_events_student_id_created_at_idx" ON "student_history_events"("student_id", "created_at");
CREATE INDEX "student_history_events_tenant_id_idx" ON "student_history_events"("tenant_id");
CREATE INDEX "student_history_events_trainer_id_idx" ON "student_history_events"("trainer_id");

ALTER TABLE "students" ADD CONSTRAINT "students_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "students" ADD CONSTRAINT "students_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "student_history_events" ADD CONSTRAINT "student_history_events_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "student_history_events" ADD CONSTRAINT "student_history_events_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "student_history_events" ADD CONSTRAINT "student_history_events_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "student_history_events" ADD CONSTRAINT "student_history_events_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
