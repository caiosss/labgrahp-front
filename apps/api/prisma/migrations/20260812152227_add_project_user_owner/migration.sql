-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "owner_user_id" TEXT,
ALTER COLUMN "owner_session_id" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "projects_owner_user_id_updated_at_idx" ON "projects"("owner_user_id", "updated_at");