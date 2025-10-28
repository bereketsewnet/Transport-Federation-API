const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const OSHIncident = sequelize.define('OSHIncident', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  
  // Basic Information
  unionId: { type: DataTypes.INTEGER, field: 'union_id', allowNull: false },
  accidentCategory: { 
    type: DataTypes.STRING(255), 
    field: 'accident_category', 
    allowNull: false 
  },
  dateTimeOccurred: { type: DataTypes.DATE, field: 'date_time_occurred', allowNull: false },
  
  // Location Details
  locationSite: { type: DataTypes.STRING(255), field: 'location_site' },
  locationBuilding: { type: DataTypes.STRING(255), field: 'location_building' },
  locationArea: { type: DataTypes.STRING(255), field: 'location_area' },
  locationGpsLatitude: { type: DataTypes.DECIMAL(10, 8), field: 'location_gps_latitude' },
  locationGpsLongitude: { type: DataTypes.DECIMAL(11, 8), field: 'location_gps_longitude' },
  
  // Severity Levels
  injurySeverity: { 
    type: DataTypes.STRING(255), 
    field: 'injury_severity', 
    defaultValue: 'None' 
  },
  damageSeverity: { 
    type: DataTypes.STRING(255), 
    field: 'damage_severity', 
    defaultValue: 'None' 
  },
  
  // Root Cause Analysis
  rootCauseUnsafeAct: { type: DataTypes.BOOLEAN, field: 'root_cause_unsafe_act', defaultValue: false },
  rootCauseEquipmentFailure: { type: DataTypes.BOOLEAN, field: 'root_cause_equipment_failure', defaultValue: false },
  rootCauseEnvironmental: { type: DataTypes.BOOLEAN, field: 'root_cause_environmental', defaultValue: false },
  rootCauseOther: { type: DataTypes.TEXT, field: 'root_cause_other' },
  
  // Description and Details
  description: { type: DataTypes.TEXT, allowNull: false },
  
  // Regulatory Requirements
  regulatoryReportRequired: { type: DataTypes.BOOLEAN, field: 'regulatory_report_required', defaultValue: false },
  regulatoryReportDate: { type: DataTypes.DATEONLY, field: 'regulatory_report_date' },
  
  // Status and Management
  status: { 
    type: DataTypes.ENUM('open', 'investigating', 'action_pending', 'closed'), 
    defaultValue: 'open' 
  },
  
  // Additional Fields
  reportedBy: { type: DataTypes.STRING(255), field: 'reported_by' },
  reportedDate: { type: DataTypes.DATE, field: 'reported_date', defaultValue: DataTypes.NOW },
  investigationNotes: { type: DataTypes.TEXT, field: 'investigation_notes' },
  correctiveActions: { type: DataTypes.TEXT, field: 'corrective_actions' },
  preventiveMeasures: { type: DataTypes.TEXT, field: 'preventive_measures' },
  
  // Metadata
  createdAt: { type: DataTypes.DATE, field: 'created_at', defaultValue: DataTypes.NOW },
  updatedAt: { type: DataTypes.DATE, field: 'updated_at', defaultValue: DataTypes.NOW },
  createdBy: { type: DataTypes.INTEGER, field: 'created_by' },
  updatedBy: { type: DataTypes.INTEGER, field: 'updated_by' }
}, { 
  tableName: 'osh_incidents', 
  timestamps: true 
});

module.exports = OSHIncident;
