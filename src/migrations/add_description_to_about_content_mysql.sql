-- Add description_en and description_am columns to about_content table
-- This migration adds the About Us Description section

ALTER TABLE about_content 
ADD COLUMN IF NOT EXISTS description_en TEXT NULL AFTER vision_am,
ADD COLUMN IF NOT EXISTS description_am TEXT NULL AFTER description_en;

