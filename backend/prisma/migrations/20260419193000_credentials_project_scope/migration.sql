-- Move credentials ownership from user scope to project scope.
ALTER TABLE "credentials" ADD COLUMN "project_id" UUID;

-- Ensure every user has at least one owned project for credential backfill.
INSERT INTO "projects" (
  "owner_id",
  "name",
  "description",
  "is_archived",
  "created_at",
  "updated_at"
)
SELECT
  u."id",
  'Personal Project',
  NULL,
  false,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "users" u
LEFT JOIN "projects" p
  ON p."owner_id" = u."id"
WHERE p."id" IS NULL;

-- Ensure owner membership exists for each owned project.
INSERT INTO "project_members" (
  "project_id",
  "user_id",
  "role",
  "created_at"
)
SELECT
  p."id",
  p."owner_id",
  'OWNER'::"ProjectMemberRole",
  CURRENT_TIMESTAMP
FROM "projects" p
LEFT JOIN "project_members" pm
  ON pm."project_id" = p."id"
 AND pm."user_id" = p."owner_id"
WHERE pm."id" IS NULL;

-- Backfill project_id for existing credentials.
UPDATE "credentials" c
SET "project_id" = (
  SELECT p2."id"
  FROM "projects" p2
  WHERE p2."owner_id" = c."user_id"
  ORDER BY p2."created_at" ASC
  LIMIT 1
)
WHERE c."project_id" IS NULL;

ALTER TABLE "credentials" ALTER COLUMN "project_id" SET NOT NULL;

CREATE INDEX "credentials_project_id_idx" ON "credentials"("project_id");

ALTER TABLE "credentials"
  ADD CONSTRAINT "credentials_project_id_fkey"
  FOREIGN KEY ("project_id") REFERENCES "projects"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "credentials" DROP CONSTRAINT "credentials_user_id_fkey";
DROP INDEX "credentials_user_id_idx";
ALTER TABLE "credentials" DROP COLUMN "user_id";
