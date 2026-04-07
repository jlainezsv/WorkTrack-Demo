ALTER TABLE "time_entries"
ADD COLUMN IF NOT EXISTS "has_lunch" boolean NOT NULL DEFAULT false;
