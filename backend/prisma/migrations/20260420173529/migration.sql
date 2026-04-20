-- Create project type enum for PERSONAL/TEAM split.
DO $$
BEGIN
  CREATE TYPE "ProjectType" AS ENUM ('PERSONAL', 'TEAM');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add project type with PERSONAL default.
ALTER TABLE "projects"
ADD COLUMN IF NOT EXISTS "type" "ProjectType" NOT NULL DEFAULT 'PERSONAL';

-- Keep exactly one PERSONAL project per owner for existing data.
WITH ranked_projects AS (
  SELECT
    p."id",
    ROW_NUMBER() OVER (
      PARTITION BY p."owner_id"
      ORDER BY p."created_at" ASC, p."id" ASC
    ) AS rn
  FROM "projects" p
)
UPDATE "projects" p
SET "type" = CASE WHEN rp.rn = 1 THEN 'PERSONAL'::"ProjectType" ELSE 'TEAM'::"ProjectType" END
FROM ranked_projects rp
WHERE p."id" = rp."id";

-- Ensure owner membership exists for all owned projects.
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

-- Add indexes for common filters.
CREATE INDEX IF NOT EXISTS "projects_owner_id_idx" ON "projects"("owner_id");
CREATE INDEX IF NOT EXISTS "projects_type_idx" ON "projects"("type");

-- Keep workflow schema updates in sync without data loss.
DROP INDEX IF EXISTS "workflow_nodes_type_idx";

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'workflow_nodes'
      AND column_name = 'type'
  ) THEN
    ALTER TABLE "workflow_nodes" RENAME COLUMN "type" TO "typeCode";
  END IF;
END $$;

ALTER TABLE "workflows"
ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "workflows"
ALTER COLUMN "status" TYPE "WorkflowStatus"
USING ("status"::text::"WorkflowStatus");

ALTER TABLE "workflows"
ALTER COLUMN "status" SET DEFAULT 'draft';

CREATE INDEX IF NOT EXISTS "workflow_nodes_typeCode_idx" ON "workflow_nodes"("typeCode");
