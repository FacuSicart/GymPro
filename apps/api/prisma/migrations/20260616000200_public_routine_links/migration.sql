-- CreateEnum
CREATE TYPE "PublicRoutineLinkStatus" AS ENUM ('ACTIVE', 'REVOKED');

-- CreateTable
CREATE TABLE "public_routine_links" (
    "id" UUID NOT NULL,
    "routine_id" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "status" "PublicRoutineLinkStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_by_user_id" UUID NOT NULL,
    "revoked_by_user_id" UUID,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "public_routine_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "public_routine_links_token_key" ON "public_routine_links"("token");
CREATE INDEX "public_routine_links_routine_id_idx" ON "public_routine_links"("routine_id");
CREATE INDEX "public_routine_links_status_idx" ON "public_routine_links"("status");

-- AddForeignKey
ALTER TABLE "public_routine_links" ADD CONSTRAINT "public_routine_links_routine_id_fkey" FOREIGN KEY ("routine_id") REFERENCES "routines"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public_routine_links" ADD CONSTRAINT "public_routine_links_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public_routine_links" ADD CONSTRAINT "public_routine_links_revoked_by_user_id_fkey" FOREIGN KEY ("revoked_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
