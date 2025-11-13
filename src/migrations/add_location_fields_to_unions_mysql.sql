-- Migration: Add location fields to unions table
-- Date: 2025-01-XX
-- Description: Adds region, zone, city, sub_city, woreda, and location_area fields to unions table

ALTER TABLE `unions` 
ADD COLUMN `region` VARCHAR(100) NULL AFTER `external_audit_date`,
ADD COLUMN `zone` VARCHAR(100) NULL AFTER `region`,
ADD COLUMN `city` VARCHAR(100) NULL AFTER `zone`,
ADD COLUMN `sub_city` VARCHAR(100) NULL AFTER `city`,
ADD COLUMN `woreda` VARCHAR(100) NULL AFTER `sub_city`,
ADD COLUMN `location_area` VARCHAR(255) NULL AFTER `woreda`;

