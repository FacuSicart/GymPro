ALTER TABLE "exercises" ADD COLUMN "equipment_type" TEXT NOT NULL DEFAULT 'otro';

CREATE INDEX "exercises_equipment_type_idx" ON "exercises"("equipment_type");
