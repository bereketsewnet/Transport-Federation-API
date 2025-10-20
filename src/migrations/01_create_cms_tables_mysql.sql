-- CMS Database Tables Migration for MySQL
-- Creates tables for storing website content (Home, About, Executives, Contact)

-- 1. Home Content Table (Singleton - only 1 row)
CREATE TABLE IF NOT EXISTS home_content (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Hero Section
  hero_title_en TEXT NOT NULL,
  hero_title_am TEXT NOT NULL,
  hero_subtitle_en TEXT NOT NULL,
  hero_subtitle_am TEXT NOT NULL,
  
  -- Overview Section
  overview_en TEXT NOT NULL,
  overview_am TEXT NOT NULL,
  
  -- Statistics (4 stats)
  stat1_label_en VARCHAR(100) DEFAULT 'Active Members',
  stat1_label_am VARCHAR(100) DEFAULT 'ንቁ አባላት',
  stat1_value INT DEFAULT 1250,
  
  stat2_label_en VARCHAR(100) DEFAULT 'Worker Unions',
  stat2_label_am VARCHAR(100) DEFAULT 'የሰራተኛ ማህበራት',
  stat2_value INT DEFAULT 19,
  
  stat3_label_en VARCHAR(100) DEFAULT 'Years of Service',
  stat3_label_am VARCHAR(100) DEFAULT 'የአገልግሎት ዓመታት',
  stat3_value INT DEFAULT 50,
  
  stat4_label_en VARCHAR(100) DEFAULT 'Protection Rate (%)',
  stat4_label_am VARCHAR(100) DEFAULT 'የጥበቃ መጠን (%)',
  stat4_value INT DEFAULT 100,
  
  -- Hero Image (file path)
  hero_image VARCHAR(500),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by INT,
  FOREIGN KEY (updated_by) REFERENCES login_accounts(id)
);

-- 2. About Content Table (Singleton - only 1 row)
CREATE TABLE IF NOT EXISTS about_content (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Mission & Vision
  mission_en TEXT NOT NULL,
  mission_am TEXT NOT NULL,
  vision_en TEXT NOT NULL,
  vision_am TEXT NOT NULL,
  
  -- Values (stored as JSON)
  values_en JSON DEFAULT '["Humanity", "Commitment", "Democratic Culture", "Transparency", "Unity"]',
  values_am JSON DEFAULT '["ሰበዓዊነት", "ቁርጠኝነት", "የዲሞክራሲ ባህል", "ግልጽነት", "አንድነት"]',
  
  -- History
  history_en TEXT NOT NULL,
  history_am TEXT NOT NULL,
  
  -- Objectives (stored as JSON)
  objectives_en JSON DEFAULT '["To organize unions and federations", "To protect workers rights", "To improve working conditions", "To provide training and education"]',
  objectives_am JSON DEFAULT '["በአገሪቱ የአሠሪና ሠራተኛ ግንኙነት ውስጥ የሠራተኛውን አቅም ማሳደግ", "የሠራተኛውን መብት መጠበቅ", "የስራ ሁኔታ ማሻሻል", "ስልጠናና ትምህርት መስጠት"]',
  
  -- Structure
  structure_title_en VARCHAR(200) DEFAULT 'Federation Structure',
  structure_title_am VARCHAR(200) DEFAULT 'የፌዴሬሽኑ አወቃቀር',
  structure_departments_en JSON DEFAULT '["President", "Secretary General", "Treasurer", "Organizing Secretary"]',
  structure_departments_am JSON DEFAULT '["ፕሬዝዳንት", "ዋና ፀሀፊ", "ክፍያ አስተዳዳሪ", "የማደራጀት ፀሀፊ"]',
  
  -- Stakeholders
  stakeholders_title_en VARCHAR(200) DEFAULT 'Key Stakeholders',
  stakeholders_title_am VARCHAR(200) DEFAULT 'ባለድርሻ አካላት',
  stakeholders_list_en JSON DEFAULT '["Affiliated basic unions", "Peer Federations", "Government agencies", "International organizations"]',
  stakeholders_list_am JSON DEFAULT '["በፌዴሬሽኑ ሥር የተደራጁ መሰረታዊ ማኅበራት", "አቻ ፌዴሬሽኖች", "የመንግሥት አገልግሎቶች", "ዓለም አቀፍ ድርጅቶች"]',
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by INT,
  FOREIGN KEY (updated_by) REFERENCES login_accounts(id)
);

-- 3. Executives Table (Multiple rows)
CREATE TABLE IF NOT EXISTS executives (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
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
  display_order INT DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by INT,
  FOREIGN KEY (created_by) REFERENCES login_accounts(id),
  INDEX idx_executives_type (type),
  INDEX idx_executives_order (display_order)
);

-- 4. Contact Info Table (Singleton - only 1 row)
CREATE TABLE IF NOT EXISTS contact_info (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Contact Details
  address_en TEXT NOT NULL,
  address_am TEXT NOT NULL,
  phone VARCHAR(50) NOT NULL,
  phone2 VARCHAR(50),
  email VARCHAR(100) NOT NULL,
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
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by INT,
  FOREIGN KEY (updated_by) REFERENCES login_accounts(id)
);
