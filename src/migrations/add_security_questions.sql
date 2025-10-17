-- Migration: Add security questions to login_accounts table
-- This allows users to reset their password using 3 security questions

-- Drop old single question fields if they exist
ALTER TABLE login_accounts DROP COLUMN IF EXISTS security_question;
ALTER TABLE login_accounts DROP COLUMN IF EXISTS security_answer_hash;

-- Add new security question fields (3 questions)
ALTER TABLE login_accounts 
ADD COLUMN security_question_1_id INT AFTER must_change_password,
ADD COLUMN security_answer_1_hash TEXT AFTER security_question_1_id,
ADD COLUMN security_question_2_id INT AFTER security_answer_1_hash,
ADD COLUMN security_answer_2_hash TEXT AFTER security_question_2_id,
ADD COLUMN security_question_3_id INT AFTER security_answer_2_hash,
ADD COLUMN security_answer_3_hash TEXT AFTER security_question_3_id;

-- Add password reset flag
ALTER TABLE login_accounts 
ADD COLUMN password_reset_required BOOLEAN DEFAULT FALSE 
COMMENT 'Set to TRUE when admin resets password'
AFTER is_locked;

