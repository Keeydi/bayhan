-- AlterEnum: Change 'MODERATE' to 'MED' in IncidentSeverity enum
DO $$ BEGIN
    -- Rename the enum value from MODERATE to MED
    ALTER TYPE "IncidentSeverity" RENAME VALUE 'MODERATE' TO 'MED';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
