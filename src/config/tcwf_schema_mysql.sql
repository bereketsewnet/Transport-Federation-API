-- tcwf_schema_mysql.sql
-- MySQL dialect (suitable for phpMyAdmin / cPanel servers running MySQL 5.7+ / 8.0)
SET FOREIGN_KEY_CHECKS = 0;

-- Sectors table
CREATE TABLE IF NOT EXISTS `sectors` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `description` TEXT,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Organizations table
CREATE TABLE IF NOT EXISTS `organizations` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL UNIQUE,
  `description` TEXT,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Unions table
CREATE TABLE IF NOT EXISTS `unions` (
  `union_id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `union_code` VARCHAR(50) UNIQUE,
  `name_en` TEXT NOT NULL,
  `name_am` TEXT,
  `sector` VARCHAR(50),
  `organization` TEXT,
  `established_date` DATE,
  `terms_of_election` INT,
  `general_assembly_date` DATE,
  `strategic_plan_in_place` TINYINT(1) NOT NULL DEFAULT 0,
  `external_audit_date` DATE,
  `region` VARCHAR(100),
  `zone` VARCHAR(100),
  `city` VARCHAR(100),
  `sub_city` VARCHAR(100),
  `woreda` VARCHAR(100),
  `location_area` VARCHAR(255),
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Members table
CREATE TABLE IF NOT EXISTS `members` (
  `mem_id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `mem_uuid` CHAR(36),
  `union_id` INT,
  `member_code` VARCHAR(100) UNIQUE,
  `first_name` VARCHAR(200) NOT NULL,
  `father_name` VARCHAR(200),
  `surname` VARCHAR(200),
  `sex` VARCHAR(10),
  `birthdate` DATE,
  `education` VARCHAR(50),
  `phone` VARCHAR(50),
  `email` VARCHAR(255),
  `salary` DECIMAL(12,2),
  `registry_date` DATE,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`union_id`) REFERENCES `unions`(`union_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- create trigger to auto-populate mem_uuid if not provided
DROP TRIGGER IF EXISTS trg_members_uuid;
DELIMITER $$
CREATE TRIGGER trg_members_uuid
BEFORE INSERT ON `members`
FOR EACH ROW
BEGIN
  IF NEW.mem_uuid IS NULL OR NEW.mem_uuid = '' THEN
    SET NEW.mem_uuid = UUID();
  END IF;
END$$
DELIMITER ;

-- Union executives (leadership positions)
CREATE TABLE IF NOT EXISTS `union_executives` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `union_id` INT NOT NULL,
  `member_code` VARCHAR(100),
  `position` VARCHAR(100),
  `appointed_date` DATE,
  `term_start_date` DATE,
  `term_end_date` DATE,
  `term_length_years` INT,
  `is_current` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`union_id`) REFERENCES `unions`(`union_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Collective Bargaining Agreements (CBAs)
CREATE TABLE IF NOT EXISTS `cbas` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `union_id` INT NOT NULL,
  `duration_years` INT,
  `status` VARCHAR(50),
  `registration_date` DATE,
  `next_end_date` DATE,
  `renewed_date` DATE,
  `round` VARCHAR(20),
  `notes` TEXT,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`union_id`) REFERENCES `unions`(`union_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Terminated unions
CREATE TABLE IF NOT EXISTS `terminated_unions` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `union_id` INT,
  `name_en` TEXT,
  `name_am` TEXT,
  `sector` VARCHAR(50),
  `organization` TEXT,
  `established_date` DATE,
  `terms_of_election` INT,
  `general_assembly_date` DATE,
  `strategic_plan_in_place` TINYINT(1),
  `external_audit_date` DATE,
  `region` VARCHAR(100),
  `zone` VARCHAR(100),
  `city` VARCHAR(100),
  `sub_city` VARCHAR(100),
  `woreda` VARCHAR(100),
  `location_area` VARCHAR(255),
  `terminated_date` DATE,
  `termination_reason` TEXT,
  `archived_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`union_id`) REFERENCES `unions`(`union_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Login accounts (members)
CREATE TABLE IF NOT EXISTS `login_accounts` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `mem_id` INT,
  `username` VARCHAR(100) UNIQUE NOT NULL,
  `password_hash` TEXT NOT NULL,
  `must_change_password` TINYINT(1) NOT NULL DEFAULT 1,
  `security_question_1_id` INT,
  `security_answer_1_hash` TEXT,
  `security_question_2_id` INT,
  `security_answer_2_hash` TEXT,
  `security_question_3_id` INT,
  `security_answer_3_hash` TEXT,
  `role` VARCHAR(50) NOT NULL DEFAULT 'member',
  `last_login` DATETIME,
  `is_locked` TINYINT(1) NOT NULL DEFAULT 0,
  `password_reset_required` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`mem_id`) REFERENCES `members`(`mem_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Organization leaders / CEOs
CREATE TABLE IF NOT EXISTS `organization_leaders` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `union_id` INT,
  `title` VARCHAR(50),
  `first_name` VARCHAR(200),
  `father_name` VARCHAR(200),
  `surname` VARCHAR(200),
  `position` VARCHAR(100),
  `phone` VARCHAR(50),
  `email` VARCHAR(255),
  `sector` VARCHAR(50),
  `organization` TEXT,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`union_id`) REFERENCES `unions`(`union_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Archive (inactive/resigned members snapshot)
CREATE TABLE IF NOT EXISTS `archives` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `mem_id` INT,
  `union_id` INT,
  `member_code` VARCHAR(100),
  `first_name` VARCHAR(200),
  `father_name` VARCHAR(200),
  `surname` VARCHAR(200),
  `sex` VARCHAR(10),
  `birthdate` DATE,
  `education` VARCHAR(50),
  `phone` VARCHAR(50),
  `email` VARCHAR(255),
  `salary` DECIMAL(12,2),
  `registry_date` DATE,
  `resigned_date` DATE,
  `reason` TEXT,
  `archived_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Visitors counter
CREATE TABLE IF NOT EXISTS `visitors` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `visit_date` DATE NOT NULL,
  `count` INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Contacts / messages
CREATE TABLE IF NOT EXISTS `contacts` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255),
  `email_or_phone` VARCHAR(255),
  `subject` VARCHAR(255),
  `message` TEXT,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- News / Announcements
CREATE TABLE IF NOT EXISTS `news` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `title` TEXT NOT NULL,
  `body` TEXT,
  `summary` TEXT,
  `published_at` DATETIME,
  `is_published` TINYINT(1) NOT NULL DEFAULT 0,
  `image_filename` VARCHAR(500),
  `is_local` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Galleries and photos
CREATE TABLE IF NOT EXISTS `galleries` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255),
  `description` TEXT,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `photos` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `gallery_id` INT,
  `filename` VARCHAR(255),
  `is_local` TINYINT(1) NOT NULL DEFAULT 0,
  `caption` TEXT,
  `taken_at` DATE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`gallery_id`) REFERENCES `galleries`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Reports cache (JSON)
CREATE TABLE IF NOT EXISTS `reports_cache` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `report_name` VARCHAR(255),
  `payload` JSON,
  `generated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Indexes
CREATE INDEX idx_members_union ON `members`(`union_id`);
CREATE INDEX idx_executives_union ON `union_executives`(`union_id`);
CREATE INDEX idx_cbas_union ON `cbas`(`union_id`);
CREATE INDEX idx_login_mem ON `login_accounts`(`mem_id`);

SET FOREIGN_KEY_CHECKS = 1;
