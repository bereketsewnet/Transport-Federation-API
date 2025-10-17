-- Migration: Add is_local column to photos table
-- This allows tracking whether a photo is stored locally or is an external URL

ALTER TABLE photos 
ADD COLUMN is_local BOOLEAN DEFAULT FALSE AFTER taken_at;

-- Update existing records (assume they are URLs since they were added before file upload support)
UPDATE photos SET is_local = FALSE WHERE is_local IS NULL;

-- Add comment
ALTER TABLE photos 
MODIFY COLUMN is_local BOOLEAN DEFAULT FALSE COMMENT 'TRUE for uploaded files, FALSE for external URLs';

