// src/scripts/simple-reset.js
// Simple Database Reset - Drop all, recreate, and seed admin

require('dotenv').config();
const sequelize = require('../config/db');
const bcrypt = require('bcrypt');

async function resetDatabase() {
  console.log('\n🚀 Resetting database...\n');

  try {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // Drop all tables
    const tables = [
      'osh_incidents', 'reports_cache', 'photos', 'galleries', 'news',
      'contacts', 'visitors', 'archives', 'organization_leaders',
      'login_accounts', 'terminated_unions', 'cbas', 'union_executives',
      'members', 'unions', 'organizations', 'sectors', 'executives', 'contact_info',
      'about_content', 'home_content', 'documents'
    ];

    for (const table of tables) {
      await sequelize.query(`DROP TABLE IF EXISTS ${table}`);
      console.log(`✅ Dropped: ${table}`);
    }

    // Recreate core tables manually
    console.log('\n📋 Creating tables...');
    
    // Core tables - Sectors and Organizations first
    await sequelize.query(`CREATE TABLE sectors (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL UNIQUE, description TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)`);
    
    await sequelize.query(`CREATE TABLE organizations (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL UNIQUE, description TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)`);
    
    await sequelize.query(`CREATE TABLE unions (union_id INT AUTO_INCREMENT PRIMARY KEY, union_code VARCHAR(50) UNIQUE, name_en TEXT NOT NULL, name_am TEXT, sector VARCHAR(50), organization TEXT, established_date DATE, terms_of_election INT, general_assembly_date DATE, strategic_plan_in_place TINYINT(1) DEFAULT 0, external_audit_date DATE, region VARCHAR(100), zone VARCHAR(100), city VARCHAR(100), sub_city VARCHAR(100), woreda VARCHAR(100), location_area VARCHAR(255), created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)`);
    
    await sequelize.query(`CREATE TABLE members (mem_id INT AUTO_INCREMENT PRIMARY KEY, mem_uuid CHAR(36), union_id INT, member_code VARCHAR(100) UNIQUE, first_name VARCHAR(200) NOT NULL, father_name VARCHAR(200), surname VARCHAR(200), sex VARCHAR(10), birthdate DATE, education VARCHAR(50), phone VARCHAR(50), email VARCHAR(255), salary DECIMAL(12,2), registry_date DATE, is_active TINYINT(1) DEFAULT 1, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, FOREIGN KEY (union_id) REFERENCES unions(union_id))`);
    
    await sequelize.query(`CREATE TABLE union_executives (id INT AUTO_INCREMENT PRIMARY KEY, union_id INT NOT NULL, member_code VARCHAR(100), position VARCHAR(100), appointed_date DATE, term_start_date DATE, term_end_date DATE, term_length_years INT, is_current TINYINT(1) DEFAULT 1, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (union_id) REFERENCES unions(union_id) ON DELETE CASCADE)`);
    
    await sequelize.query(`CREATE TABLE cbas (id INT AUTO_INCREMENT PRIMARY KEY, union_id INT NOT NULL, duration_years INT, status VARCHAR(50), registration_date DATE, next_end_date DATE, renewed_date DATE, round VARCHAR(20), notes TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (union_id) REFERENCES unions(union_id))`);
    
    await sequelize.query(`CREATE TABLE terminated_unions (id INT AUTO_INCREMENT PRIMARY KEY, union_id INT, name_en TEXT, name_am TEXT, sector VARCHAR(50), organization TEXT, established_date DATE, terms_of_election INT, general_assembly_date DATE, strategic_plan_in_place TINYINT(1), external_audit_date DATE, region VARCHAR(100), zone VARCHAR(100), city VARCHAR(100), sub_city VARCHAR(100), woreda VARCHAR(100), location_area VARCHAR(255), terminated_date DATE, termination_reason TEXT, archived_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (union_id) REFERENCES unions(union_id))`);
    
    await sequelize.query(`CREATE TABLE login_accounts (id INT AUTO_INCREMENT PRIMARY KEY, mem_id INT, username VARCHAR(100) UNIQUE NOT NULL, password_hash TEXT NOT NULL, must_change_password TINYINT(1) DEFAULT 1, security_question_1_id INT, security_answer_1_hash TEXT, security_question_2_id INT, security_answer_2_hash TEXT, security_question_3_id INT, security_answer_3_hash TEXT, role VARCHAR(50) DEFAULT 'member', last_login DATETIME, is_locked TINYINT(1) DEFAULT 0, password_reset_required TINYINT(1) DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (mem_id) REFERENCES members(mem_id) ON DELETE CASCADE)`);
    
    await sequelize.query(`CREATE TABLE organization_leaders (id INT AUTO_INCREMENT PRIMARY KEY, union_id INT, title VARCHAR(50), first_name VARCHAR(200), father_name VARCHAR(200), surname VARCHAR(200), position VARCHAR(100), phone VARCHAR(50), email VARCHAR(255), sector VARCHAR(50), organization TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (union_id) REFERENCES unions(union_id))`);
    
    await sequelize.query(`CREATE TABLE archives (id INT AUTO_INCREMENT PRIMARY KEY, mem_id INT, union_id INT, member_code VARCHAR(100), first_name VARCHAR(200), father_name VARCHAR(200), surname VARCHAR(200), sex VARCHAR(10), birthdate DATE, education VARCHAR(50), phone VARCHAR(50), email VARCHAR(255), salary DECIMAL(12,2), registry_date DATE, resigned_date DATE, reason TEXT, archived_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
    
    await sequelize.query(`CREATE TABLE visitors (id INT AUTO_INCREMENT PRIMARY KEY, visit_date DATE NOT NULL, count INT DEFAULT 0)`);
    
    await sequelize.query(`CREATE TABLE contacts (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), email_or_phone VARCHAR(255), subject VARCHAR(255), message TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
    
    await sequelize.query(`CREATE TABLE news (id INT AUTO_INCREMENT PRIMARY KEY, title TEXT NOT NULL, body TEXT, summary TEXT, published_at DATETIME, is_published TINYINT(1) DEFAULT 0, image_filename VARCHAR(500), is_local TINYINT(1) DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
    
    await sequelize.query(`CREATE TABLE galleries (id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255), description TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
    
    await sequelize.query(`CREATE TABLE photos (id INT AUTO_INCREMENT PRIMARY KEY, gallery_id INT, filename VARCHAR(255), is_local TINYINT(1) DEFAULT 0, caption TEXT, taken_at DATE, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (gallery_id) REFERENCES galleries(id))`);
    
    await sequelize.query(`CREATE TABLE reports_cache (id INT AUTO_INCREMENT PRIMARY KEY, report_name VARCHAR(255), payload JSON, generated_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
    
    // CMS tables
    await sequelize.query(`CREATE TABLE home_content (id INT AUTO_INCREMENT PRIMARY KEY, hero_title_en TEXT NOT NULL, hero_title_am TEXT NOT NULL, hero_subtitle_en TEXT NOT NULL, hero_subtitle_am TEXT NOT NULL, hero_image VARCHAR(500), overview_en TEXT NOT NULL, overview_am TEXT NOT NULL, stat1_label_en VARCHAR(100), stat1_label_am VARCHAR(100), stat1_value INT, stat2_label_en VARCHAR(100), stat2_label_am VARCHAR(100), stat2_value INT, stat3_label_en VARCHAR(100), stat3_label_am VARCHAR(100), stat3_value INT, stat4_label_en VARCHAR(100), stat4_label_am VARCHAR(100), stat4_value INT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, updated_by INT)`);
    
    await sequelize.query(`CREATE TABLE about_content (id INT AUTO_INCREMENT PRIMARY KEY, mission_en TEXT, mission_am TEXT, vision_en TEXT, vision_am TEXT, values_en JSON, values_am JSON, history_en TEXT, history_am TEXT, objectives_en JSON, objectives_am JSON, structure_title_en VARCHAR(255), structure_title_am VARCHAR(255), structure_departments_en JSON, structure_departments_am JSON, stakeholders_title_en VARCHAR(255), stakeholders_title_am VARCHAR(255), stakeholders_list_en JSON, stakeholders_list_am JSON, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, updated_by INT)`);
    
    await sequelize.query(`CREATE TABLE executives (id INT AUTO_INCREMENT PRIMARY KEY, name_en VARCHAR(255) NOT NULL, name_am VARCHAR(255), position_en VARCHAR(255), position_am VARCHAR(255), bio_en TEXT, bio_am TEXT, image VARCHAR(500), type ENUM('executive', 'expert') DEFAULT 'executive', display_order INT DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, created_by INT)`);
    
    await sequelize.query(`CREATE TABLE contact_info (id INT AUTO_INCREMENT PRIMARY KEY, address_en TEXT, address_am TEXT, phone VARCHAR(50), phone2 VARCHAR(50), email VARCHAR(255), fax VARCHAR(50), po_box VARCHAR(50), map_url TEXT, latitude DECIMAL(10,8), longitude DECIMAL(11,8), facebook_url VARCHAR(500), twitter_url VARCHAR(500), linkedin_url VARCHAR(500), telegram_url VARCHAR(500), youtube_url VARCHAR(500), working_hours_en TEXT, working_hours_am TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, updated_by INT)`);
    
    await sequelize.query(`CREATE TABLE documents (id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255) NOT NULL, category VARCHAR(100) NOT NULL, document_type VARCHAR(50) NOT NULL, file_url VARCHAR(500) NOT NULL, file_name VARCHAR(255), file_size INT, tags JSON, description TEXT, is_public TINYINT(1) DEFAULT 0, created_by INT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)`);
    
    // OSH table
    await sequelize.query(`CREATE TABLE osh_incidents (id INT AUTO_INCREMENT PRIMARY KEY, union_id INT NOT NULL, accident_category VARCHAR(255) NOT NULL, date_time_occurred DATETIME NOT NULL, location_site VARCHAR(255), location_building VARCHAR(255), location_area VARCHAR(255), location_gps_latitude DECIMAL(10,8), location_gps_longitude DECIMAL(11,8), injury_severity VARCHAR(255) DEFAULT 'None', damage_severity VARCHAR(255) DEFAULT 'None', root_cause_unsafe_act BOOLEAN DEFAULT FALSE, root_cause_equipment_failure BOOLEAN DEFAULT FALSE, root_cause_environmental BOOLEAN DEFAULT FALSE, root_cause_other TEXT, description TEXT NOT NULL, regulatory_report_required BOOLEAN DEFAULT FALSE, regulatory_report_date DATE, status ENUM('open', 'investigating', 'action_pending', 'closed') DEFAULT 'open', reported_by VARCHAR(255), reported_date DATETIME DEFAULT CURRENT_TIMESTAMP, investigation_notes TEXT, corrective_actions TEXT, preventive_measures TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, created_by INT, updated_by INT, FOREIGN KEY (union_id) REFERENCES unions(union_id), FOREIGN KEY (created_by) REFERENCES login_accounts(id), FOREIGN KEY (updated_by) REFERENCES login_accounts(id))`);
    
    console.log('✅ All tables created!\n');

    // Seed sectors
    console.log('📋 Seeding sectors...');
    const sectors = [
      'Aviation',
      'Road transport',
      'Urban transport',
      'Railway',
      'Inland transport',
      'Maritime',
      'Communication'
    ];
    for (const sectorName of sectors) {
      await sequelize.query(`INSERT INTO sectors (name) VALUES (?)`, { replacements: [sectorName] });
    }
    console.log(`✅ Seeded ${sectors.length} sectors`);

    // Seed organizations
    console.log('📋 Seeding organizations...');
    const organizations = [
      'Ethiopian Airlines Group',
      'Ethiopian Maritime Transport and Logistics',
      'Addis Ababa City Bus Service Enterprise',
      'Ethio Telecom',
      'Ethiopia Posta',
      'Public Service Transport',
      'DHL World Wide Express Ethiopia',
      'Ethiopian Tool Road Enterprise',
      'International Cargo and Aviation Service',
      'ISON Experience Ethio call PLC',
      'Moti Engineering P.L.C',
      'Addis Ababa Light Railway Transport Service Enterprise',
      'East West Ethio Transport PLC',
      'Abyssinia Transport S/C',
      'Bekelcha Transport S/C',
      'Geda Transport S/C',
      'Selam Bus Public Transport PLC',
      'Ethiopian Railway Corporation',
      'Dire Dawa Dewele Railway',
      'Trans Ethiopia PLC',
      'Demtsu Woyan',
      'Bahir Dar Public Service Transport',
      'Hararge Anestgn Melestegn Public Transport',
      'Hararge Keftegn Public Transport',
      'Kinfe Rufael Geda',
      'Tekur Abay Transport S/C',
      'National Transport',
      'Elet Derash Erdata Transport',
      'Derba Transport S/C',
      'Hohot Transport',
      'Ethiopian Maritime Training Institute',
      'Adama Drivers Training Institute'
    ];
    for (const orgName of organizations) {
      await sequelize.query(`INSERT INTO organizations (name) VALUES (?)`, { replacements: [orgName] });
    }
    console.log(`✅ Seeded ${organizations.length} organizations\n`);

    // Insert default CMS data
    await sequelize.query(`INSERT INTO home_content (hero_title_en, hero_title_am, hero_subtitle_en, hero_subtitle_am, overview_en, overview_am, stat2_label_en, stat2_label_am, stat2_value, stat3_label_en, stat3_label_am, stat3_value, stat4_label_en, stat4_label_am, stat4_value) VALUES ('Transport & Communication Workers Federation', 'የትራንስፖርትና መገናኛ ሠራተኞች ማኅበራት ፌዴሬሽን', 'Empowering workers across Ethiopia''s transport and communication sectors', 'በኢትዮጵያ የትራንስፖርትና መገናኛ ዘርፎች ውስጥ የሰራተኞችን አቅም ማሳደግ', 'The Industrial Federation of Transport and Communication Workers of Ethiopia (TCWF) is a national trade union federation.', 'የኢትዮጵያ የትራንስፖርትና መገናኛ ሠራተኞች የኢንዱስትሪ ፌዴሬሽን', 'Worker Unions', 'የሰራተኛ ማህበራት', 19, 'Years of Service', 'የአገልግሎት ዓመታት', 50, 'Protection Rate', 'የጥበቃ መጠን', 100)`);
    
    await sequelize.query(`INSERT INTO contact_info (address_en, address_am, phone, email) VALUES ('Addis Ababa, Ethiopia', 'አዲስ አበባ፣ ኢትዮጵያ', '+251-11-XXX-XXXX', 'info@tcwf-ethiopia.org')`)

    // // Create admin
    // console.log('📋 Creating admin account...');
    
    // // Create a default union for admin
    // await sequelize.query(`
    //   INSERT INTO unions (union_code, name_en, name_am) VALUES ('ADMIN', 'Admin Union', 'Admin Union')
    // `);
    
    // // Get the union ID
    // const [unions] = await sequelize.query(`SELECT union_id FROM unions WHERE union_code = 'ADMIN'`);
    // const unionId = unions[0].union_id;

    // // Create member
    // await sequelize.query(`
    //   INSERT INTO members (union_id, first_name, surname) VALUES (${unionId}, 'Admin', 'User')
    // `);
    
    // // Get the member ID
    // const [members] = await sequelize.query(`SELECT mem_id FROM members WHERE union_id = ${unionId}`);
    // const memberId = members[0].mem_id;

    // // Hash password
    // const password = process.env.ADMIN_DEFAULT_PASSWORD || 'Admin@2024';
    // const passHash = await bcrypt.hash(password, 10);

    // // Create login account
    // await sequelize.query(`
    //   INSERT INTO login_accounts (mem_id, username, password_hash, role, must_change_password) 
    //   VALUES (${memberId}, 'admin', '${passHash}', 'admin', 0)
    // `);

    // await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

    // console.log('\n🎉 ============================================');
    // console.log('🎉   DATABASE RESET COMPLETED!');
    // console.log('🎉 ============================================\n');
    // console.log('📝 Login as:');
    // console.log(`   Username: admin`);
    // console.log(`   Password: ${password}`);
    // console.log('\n✅ Run: npm run dev\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

resetDatabase();
