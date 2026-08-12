ALTER TABLE "projects"
ADD CONSTRAINT "projects_exactly_one_owner_check"
CHECK (
  (
    "owner_session_id" IS NOT NULL
    AND "owner_user_id" IS NULL
  )
  OR
  (
    "owner_session_id" IS NULL
    AND "owner_user_id" IS NOT NULL
  )
);