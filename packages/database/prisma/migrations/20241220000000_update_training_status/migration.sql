-- Update existing COMPLETED status to FINISHED
UPDATE "training_programs" 
SET status = 'FINISHED' 
WHERE status = 'COMPLETED';

-- Alter the enum to replace COMPLETED with FINISHED
ALTER TYPE "TrainingProgramStatus" RENAME VALUE 'COMPLETED' TO 'FINISHED';
