-- Occupational Safety and Health (OSH) Incidents Table
CREATE TABLE IF NOT EXISTS osh_incidents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Basic Information
  union_id INT NOT NULL,
  accident_category ENUM('People', 'Property/Asset') NOT NULL,
  date_time_occurred DATETIME NOT NULL,
  
  -- Location Details
  location_site VARCHAR(255),
  location_building VARCHAR(255),
  location_area VARCHAR(255),
  location_gps_latitude DECIMAL(10, 8),
  location_gps_longitude DECIMAL(11, 8),
  
  -- Severity Levels
  injury_severity ENUM('Near-Miss', 'First Aid Case (FAC)', 'Medical Treatment Case (MTC)', 'Restricted Work Case (RWC)', 'Permanent Disability/Major Injury', 'Fatality', 'Minor', 'Moderate', 'Major', 'Fatal', 'None') DEFAULT 'None',
  damage_severity ENUM('Minor', 'Moderate', 'Major', 'Severe/Critical', 'None') DEFAULT 'None',
  
  -- Root Cause Analysis
  root_cause_unsafe_act BOOLEAN DEFAULT FALSE,
  root_cause_equipment_failure BOOLEAN DEFAULT FALSE,
  root_cause_environmental BOOLEAN DEFAULT FALSE,
  root_cause_other TEXT,
  
  -- Description and Details
  description TEXT NOT NULL,
  
  -- Regulatory Requirements
  regulatory_report_required BOOLEAN DEFAULT FALSE,
  regulatory_report_date DATE,
  
  -- Status and Management
  status ENUM('open', 'investigating', 'action_pending', 'closed') DEFAULT 'open',
  
  -- Additional Fields
  reported_by VARCHAR(255),
  reported_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  investigation_notes TEXT,
  corrective_actions TEXT,
  preventive_measures TEXT,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by INT,
  updated_by INT,
  
  -- Foreign Keys
  FOREIGN KEY (union_id) REFERENCES unions(union_id),
  FOREIGN KEY (created_by) REFERENCES login_accounts(id),
  FOREIGN KEY (updated_by) REFERENCES login_accounts(id),
  
  -- Indexes for better performance
  INDEX idx_osh_union_id (union_id),
  INDEX idx_osh_date_occurred (date_time_occurred),
  INDEX idx_osh_status (status),
  INDEX idx_osh_category (accident_category),
  INDEX idx_osh_injury_severity (injury_severity),
  INDEX idx_osh_damage_severity (damage_severity)
);
