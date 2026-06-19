ALTER TABLE "exercises"
ADD COLUMN "goals" "ExerciseGoal"[] NOT NULL DEFAULT ARRAY[]::"ExerciseGoal"[],
ADD COLUMN "levels" "ExerciseLevel"[] NOT NULL DEFAULT ARRAY[]::"ExerciseLevel"[];

UPDATE "exercises"
SET
  "goals" = ARRAY["goal"]::"ExerciseGoal"[],
  "levels" = ARRAY["level"]::"ExerciseLevel"[];

DROP INDEX IF EXISTS "exercises_goal_idx";
DROP INDEX IF EXISTS "exercises_level_idx";

ALTER TABLE "exercises"
DROP COLUMN "goal",
DROP COLUMN "level";

CREATE INDEX "exercises_goals_idx" ON "exercises" USING GIN ("goals");
CREATE INDEX "exercises_levels_idx" ON "exercises" USING GIN ("levels");
