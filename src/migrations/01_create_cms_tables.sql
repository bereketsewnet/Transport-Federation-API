-- CMS Database Tables Migration
-- Creates tables for storing website content (Home, About, Executives, Contact)

-- 1. Home Content Table (Singleton - only 1 row)
CREATE TABLE IF NOT EXISTS home_content (
  id SERIAL PRIMARY KEY,
  
  -- Hero Section
  hero_title_en TEXT NOT NULL DEFAULT 'Transport & Communication Workers Federation',
  hero_title_am TEXT NOT NULL DEFAULT 'የትራንስፖርትና መገናኛ ሠራተኞች ማኅበራት ፌዴሬሽን',
  hero_subtitle_en TEXT NOT NULL DEFAULT 'Empowering workers across Ethiopia''s transport and communication sectors',
  hero_subtitle_am TEXT NOT NULL DEFAULT 'በኢትዮጵያ የትራንስፖርትና መገናኛ ዘርፎች ውስጥ የሰራተኞችን አቅም ማሳደግ',
  
  -- Overview Section
  overview_en TEXT NOT NULL DEFAULT 'The Industrial Federation of Transport and Communication Workers of Ethiopia (TCWF) is a national trade union federation representing workers in the transport and communication sectors.',
  overview_am TEXT NOT NULL DEFAULT 'የኢትዮጵያ የትራንስፖርትና መገናኛ ሠራተኞች የኢንዱስትሪ ፌዴሬሽን (TCWF) በትራንስፖርትና መገናኛ ዘርፎች ውስጥ የሚሰሩ ሠራተኞችን የሚወክል የብሔራዊ የሠራተኛ ማኅበር ፌዴሬሽን ነው።',
  
  -- Statistics (4 stats)
  stat1_label_en VARCHAR(100) DEFAULT 'Active Members',
  stat1_label_am VARCHAR(100) DEFAULT 'ንቁ አባላት',
  stat1_value INTEGER DEFAULT 1250,
  
  stat2_label_en VARCHAR(100) DEFAULT 'Worker Unions',
  stat2_label_am VARCHAR(100) DEFAULT 'የሰራተኛ ማህበራት',
  stat2_value INTEGER DEFAULT 19,
  
  stat3_label_en VARCHAR(100) DEFAULT 'Years of Service',
  stat3_label_am VARCHAR(100) DEFAULT 'የአገልግሎት ዓመታት',
  stat3_value INTEGER DEFAULT 50,
  
  stat4_label_en VARCHAR(100) DEFAULT 'Protection Rate (%)',
  stat4_label_am VARCHAR(100) DEFAULT 'የጥበቃ መጠን (%)',
  stat4_value INTEGER DEFAULT 100,
  
  -- Hero Image (file path)
  hero_image VARCHAR(500),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by INTEGER REFERENCES login_accounts(id)
);

-- Only one row should exist (singleton pattern)
CREATE UNIQUE INDEX IF NOT EXISTS idx_home_content_singleton ON home_content ((TRUE));

-- 2. About Content Table (Singleton - only 1 row)
CREATE TABLE IF NOT EXISTS about_content (
  id SERIAL PRIMARY KEY,
  
  -- Mission & Vision
  mission_en TEXT NOT NULL DEFAULT 'To organize workers in unions and federations to protect their rights and improve their working conditions.',
  mission_am TEXT NOT NULL DEFAULT 'ሠራተኛዉን በማኅበርና ፌዴሬሽን ውስጥ በማደራጀት የእነሱን መብት በመጠበቅና የስራ ሁኔታቸውን በማሻሻል።',
  vision_en TEXT NOT NULL DEFAULT 'To see workers with guaranteed rights, fair wages, and safe working conditions across all transport and communication sectors.',
  vision_am TEXT NOT NULL DEFAULT 'የሥራ ዋስትናው የተረጋገጠ፣ ፍትሃዊ ደሞዝ፣ እና ደህንነቱ የተጠበቀ የስራ ሁኔታ ያላቸው ሠራተኞች በሁሉም የትራንስፖርትና መገናኛ ዘርፎች ውስጥ እንዲታዩ።',
  
  -- Values (stored as JSON array)
  values_en JSONB DEFAULT '["Humanity", "Commitment", "Democratic Culture", "Transparency", "Unity"]'::jsonb,
  values_am JSONB DEFAULT '["ሰበዓዊነት", "ቁርጠኝነት", "የዲሞክራሲ ባህል", "ግልጽነት", "አንድነት"]'::jsonb,
  
  -- History
  history_en TEXT NOT NULL DEFAULT 'The Industrial Federation of Transport and Communication Workers of Ethiopia was established to represent and protect the rights of workers in these vital sectors.',
  history_am TEXT NOT NULL DEFAULT 'የኢትዮጵያ የትራንስፖርትና መገናኛ ሠራተኞች የኢንዱስትሪ ፌዴሬሽን በእነዚህ አስፈላጊ ዘርፎች ውስጥ የሚሰሩ ሠራተኞችን ለመወከልና መብታቸውን ለመጠበቅ ተመሠርቷል።',
  
  -- Objectives (stored as JSON array)
  objectives_en JSONB DEFAULT '["To organize unions and federations", "To protect workers rights", "To improve working conditions", "To provide training and education"]'::jsonb,
  objectives_am JSONB DEFAULT '["በአገሪቱ የአሠሪና ሠራተኛ ግንኙነት ውስጥ የሠራተኛውን አቅም ማሳደግ", "የሠራተኛውን መብት መጠበቅ", "የስራ ሁኔታ ማሻሻል", "ስልጠናና ትምህርት መስጠት"]'::jsonb,
  
  -- Structure
  structure_title_en VARCHAR(200) DEFAULT 'Federation Structure',
  structure_title_am VARCHAR(200) DEFAULT 'የፌዴሬሽኑ አወቃቀር',
  structure_departments_en JSONB DEFAULT '["President", "Secretary General", "Treasurer", "Organizing Secretary"]'::jsonb,
  structure_departments_am JSONB DEFAULT '["ፕሬዝዳንት", "ዋና ፀሀፊ", "ክፍያ አስተዳዳሪ", "የማደራጀት ፀሀፊ"]'::jsonb,
  
  -- Stakeholders
  stakeholders_title_en VARCHAR(200) DEFAULT 'Key Stakeholders',
  stakeholders_title_am VARCHAR(200) DEFAULT 'ባለድርሻ አካላት',
  stakeholders_list_en JSONB DEFAULT '["Affiliated basic unions", "Peer Federations", "Government agencies", "International organizations"]'::jsonb,
  stakeholders_list_am JSONB DEFAULT '["በፌዴሬሽኑ ሥር የተደራጁ መሰረታዊ ማኅበራት", "አቻ ፌዴሬሽኖች", "የመንግሥት አገልግሎቶች", "ዓለም አቀፍ ድርጅቶች"]'::jsonb,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by INTEGER REFERENCES login_accounts(id)
);

-- Only one row should exist (singleton pattern)
CREATE UNIQUE INDEX IF NOT EXISTS idx_about_content_singleton ON about_content ((TRUE));

-- 3. Executives Table (Multiple rows)
CREATE TABLE IF NOT EXISTS executives (
  id SERIAL PRIMARY KEY,
  
  -- Names
  name_en VARCHAR(200) NOT NULL,
  name_am VARCHAR(200) NOT NULL,
  
  -- Position/Title
  position_en VARCHAR(200) NOT NULL,
  position_am VARCHAR(200) NOT NULL,
  
  -- Bio (optional)
  bio_en TEXT,
  bio_am TEXT,
  
  -- Photo (file path)
  image VARCHAR(500),
  
  -- Type: 'executive' or 'expert' (for carousel)
  type VARCHAR(20) NOT NULL DEFAULT 'executive',
  
  -- Display order
  display_order INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES login_accounts(id)
);

CREATE INDEX IF NOT EXISTS idx_executives_type ON executives(type);
CREATE INDEX IF NOT EXISTS idx_executives_order ON executives(display_order);

-- 4. Contact Info Table (Singleton - only 1 row)
CREATE TABLE IF NOT EXISTS contact_info (
  id SERIAL PRIMARY KEY,
  
  -- Contact Details
  address_en TEXT NOT NULL DEFAULT 'Addis Ababa, Ethiopia',
  address_am TEXT NOT NULL DEFAULT 'አዲስ አበባ፣ ኢትዮጵያ',
  phone VARCHAR(50) NOT NULL DEFAULT '+251-11-XXX-XXXX',
  phone2 VARCHAR(50),
  email VARCHAR(100) NOT NULL DEFAULT 'info@tcwf-ethiopia.org',
  fax VARCHAR(50),
  po_box VARCHAR(50),
  
  -- Location
  map_url TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Social Media
  facebook_url VARCHAR(200),
  twitter_url VARCHAR(200),
  linkedin_url VARCHAR(200),
  telegram_url VARCHAR(200),
  youtube_url VARCHAR(200),
  
  -- Working Hours
  working_hours_en TEXT DEFAULT 'Monday - Friday: 8:30 AM - 5:00 PM',
  working_hours_am TEXT DEFAULT 'ሰኞ - አርብ: 8:30 ጠዋት - 5:00 ከሰዓት',
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by INTEGER REFERENCES login_accounts(id)
);

-- Only one row should exist (singleton pattern)
CREATE UNIQUE INDEX IF NOT EXISTS idx_contact_info_singleton ON contact_info ((TRUE));

-- Create trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all CMS tables
CREATE TRIGGER update_home_content_updated_at BEFORE UPDATE ON home_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_about_content_updated_at BEFORE UPDATE ON about_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_executives_updated_at BEFORE UPDATE ON executives FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contact_info_updated_at BEFORE UPDATE ON contact_info FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
