-- Add image support to news table
ALTER TABLE news ADD COLUMN image_filename VARCHAR(500) NULL AFTER is_published;
ALTER TABLE news ADD COLUMN is_local TINYINT(1) DEFAULT 0 AFTER image_filename;

