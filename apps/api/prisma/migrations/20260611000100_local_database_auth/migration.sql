ALTER TABLE "users" ADD COLUMN "password_hash" TEXT;
ALTER TABLE "users" ALTER COLUMN "auth_provider_user_id" DROP NOT NULL;

UPDATE "users"
SET "password_hash" = 'pending-password-reset'
WHERE "password_hash" IS NULL;

ALTER TABLE "users" ALTER COLUMN "password_hash" SET NOT NULL;
