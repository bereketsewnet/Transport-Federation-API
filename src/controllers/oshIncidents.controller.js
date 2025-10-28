const OSHIncident = require('../models/oshIncident.model');
const { Op } = require('sequelize');

// Helper function to build root cause array
const buildRootCauses = (incident) => {
  const causes = [];
  if (incident.rootCauseUnsafeAct) causes.push('Unsafe Act');
  if (incident.rootCauseEquipmentFailure) causes.push('Equipment Failure');
  if (incident.rootCauseEnvironmental) causes.push('Environmental');
  if (incident.rootCauseOther) causes.push(incident.rootCauseOther);
  return causes;
};

// Helper function to parse root causes from request
const parseRootCauses = (rootCauses, incidentData) => {
  if (Array.isArray(rootCauses)) {
    incidentData.rootCauseUnsafeAct = rootCauses.includes('Unsafe Act');
    incidentData.rootCauseEquipmentFailure = rootCauses.includes('Equipment Failure');
    incidentData.rootCauseEnvironmental = rootCauses.includes('Environmental');
    incidentData.rootCauseOther = rootCauses.find(cause => 
      !['Unsafe Act', 'Equipment Failure', 'Environmental'].includes(cause)
    ) || null;
  }
};

// List OSH incidents with filtering and pagination
exports.list = async (req, res) => {
  try {
    const { 
      union_id, 
      accident_category, 
      injury_severity, 
      damage_severity, 
      status, 
      from_date, 
      to_date,
      q,
      page = 1, 
      per_page = 20 
    } = req.query;

    const where = {};
    
    if (union_id) where.unionId = union_id;
    if (accident_category) where.accidentCategory = accident_category;
    if (injury_severity) where.injurySeverity = injury_severity;
    if (damage_severity) where.damageSeverity = damage_severity;
    if (status) where.status = status;
    
    // Date range filtering
    if (from_date || to_date) {
      where.dateTimeOccurred = {};
      if (from_date) where.dateTimeOccurred[Op.gte] = new Date(from_date);
      if (to_date) where.dateTimeOccurred[Op.lte] = new Date(to_date);
    }
    
    // Search in description
    if (q) {
      where.description = { [Op.like]: `%${q}%` };
    }

    const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(per_page);
    
    const { rows, count } = await OSHIncident.findAndCountAll({
      where,
      limit: parseInt(per_page),
      offset,
      order: [['dateTimeOccurred', 'DESC'], ['createdAt', 'DESC']]
    });

    // Add root causes array to each incident
    const incidentsWithRootCauses = rows.map(incident => {
      const incidentData = incident.toJSON();
      incidentData.rootCauses = buildRootCauses(incidentData);
      return incidentData;
    });

    res.json({
      data: incidentsWithRootCauses,
      meta: {
        total: count,
        page: parseInt(page),
        per_page: parseInt(per_page),
        total_pages: Math.ceil(count / parseInt(per_page))
      }
    });
  } catch (err) {
    console.error('List OSH incidents error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get OSH incident by ID
exports.getById = async (req, res) => {
  try {
    const incident = await OSHIncident.findByPk(req.params.id);

    if (!incident) {
      return res.status(404).json({ message: 'OSH incident not found' });
    }

    const incidentData = incident.toJSON();
    incidentData.rootCauses = buildRootCauses(incidentData);

    res.json({ data: incidentData });
  } catch (err) {
    console.error('Get OSH incident by ID error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new OSH incident
exports.create = async (req, res) => {
  try {
    // Validate required fields - support both snake_case and camelCase
    const unionId = req.body.union_id || req.body.unionId;
    const accidentCategory = req.body.accident_category || req.body.accidentCategory;
    const dateTimeOccurred = req.body.date_time_occurred || req.body.dateTimeOccurred;
    const description = req.body.description;
    
    if (!unionId || !accidentCategory || !dateTimeOccurred || !description) {
      return res.status(400).json({ 
        message: 'union_id (or unionId), accident_category (or accidentCategory), date_time_occurred (or dateTimeOccurred), and description are required' 
      });
    }
    
    const incidentData = {
      unionId: unionId,
      accidentCategory: accidentCategory, // This will be mapped by Sequelize to accident_category field
      dateTimeOccurred: dateTimeOccurred,
      locationSite: req.body.location_site || req.body.locationSite || null,
      locationBuilding: req.body.location_building || req.body.locationBuilding || null,
      locationArea: req.body.location_area || req.body.locationArea || null,
      locationGpsLatitude: req.body.location_gps_latitude || req.body.locationGpsLatitude || null,
      locationGpsLongitude: req.body.location_gps_longitude || req.body.locationGpsLongitude || null,
      injurySeverity: req.body.injury_severity || req.body.injurySeverity || 'None',
      damageSeverity: req.body.damage_severity || req.body.damageSeverity || 'None',
      description: description,
      regulatoryReportRequired: req.body.regulatory_report_required || req.body.regulatoryReportRequired || false,
      regulatoryReportDate: req.body.regulatory_report_date || req.body.regulatoryReportDate || null,
      status: req.body.status || 'open',
      reportedBy: req.body.reported_by || req.body.reportedBy || null,
      investigationNotes: req.body.investigation_notes || req.body.investigationNotes || null,
      correctiveActions: req.body.corrective_actions || req.body.correctiveActions || null,
      preventiveMeasures: req.body.preventive_measures || req.body.preventiveMeasures || null,
      createdBy: req.user?.id || null
    };

    // Parse root causes
    if (req.body.root_causes) {
      parseRootCauses(req.body.root_causes, incidentData);
    }

    const created = await OSHIncident.create(incidentData);
    
    // Fetch the created incident
    const incident = await OSHIncident.findByPk(created.id);

    const incidentResponse = incident.toJSON();
    incidentResponse.rootCauses = buildRootCauses(incidentResponse);

    res.status(201).json({ data: incidentResponse });
  } catch (err) {
    console.error('Create OSH incident error:', err);
    res.status(400).json({ message: err.message || 'Failed to create OSH incident' });
  }
};

// Update OSH incident
exports.update = async (req, res) => {
  try {
    const incident = await OSHIncident.findByPk(req.params.id);
    if (!incident) {
      return res.status(404).json({ message: 'OSH incident not found' });
    }

    const updateData = {};
    
    // Update fields if provided - support both snake_case and camelCase
    if (req.body.union_id !== undefined || req.body.unionId !== undefined) {
      updateData.unionId = req.body.union_id || req.body.unionId;
    }
    if (req.body.accident_category !== undefined || req.body.accidentCategory !== undefined) {
      updateData.accidentCategory = req.body.accident_category || req.body.accidentCategory;
    }
    if (req.body.date_time_occurred !== undefined || req.body.dateTimeOccurred !== undefined) {
      updateData.dateTimeOccurred = req.body.date_time_occurred || req.body.dateTimeOccurred;
    }
    if (req.body.location_site !== undefined || req.body.locationSite !== undefined) {
      updateData.locationSite = req.body.location_site || req.body.locationSite;
    }
    if (req.body.location_building !== undefined || req.body.locationBuilding !== undefined) {
      updateData.locationBuilding = req.body.location_building || req.body.locationBuilding;
    }
    if (req.body.location_area !== undefined || req.body.locationArea !== undefined) {
      updateData.locationArea = req.body.location_area || req.body.locationArea;
    }
    if (req.body.location_gps_latitude !== undefined || req.body.locationGpsLatitude !== undefined) {
      updateData.locationGpsLatitude = req.body.location_gps_latitude || req.body.locationGpsLatitude;
    }
    if (req.body.location_gps_longitude !== undefined || req.body.locationGpsLongitude !== undefined) {
      updateData.locationGpsLongitude = req.body.location_gps_longitude || req.body.locationGpsLongitude;
    }
    if (req.body.injury_severity !== undefined || req.body.injurySeverity !== undefined) {
      updateData.injurySeverity = req.body.injury_severity || req.body.injurySeverity;
    }
    if (req.body.damage_severity !== undefined || req.body.damageSeverity !== undefined) {
      updateData.damageSeverity = req.body.damage_severity || req.body.damageSeverity;
    }
    if (req.body.description !== undefined) {
      updateData.description = req.body.description;
    }
    if (req.body.regulatory_report_required !== undefined || req.body.regulatoryReportRequired !== undefined) {
      updateData.regulatoryReportRequired = req.body.regulatory_report_required || req.body.regulatoryReportRequired;
    }
    if (req.body.regulatory_report_date !== undefined || req.body.regulatoryReportDate !== undefined) {
      updateData.regulatoryReportDate = req.body.regulatory_report_date || req.body.regulatoryReportDate;
    }
    if (req.body.status !== undefined) {
      updateData.status = req.body.status;
    }
    if (req.body.reported_by !== undefined || req.body.reportedBy !== undefined) {
      updateData.reportedBy = req.body.reported_by || req.body.reportedBy;
    }
    if (req.body.investigation_notes !== undefined || req.body.investigationNotes !== undefined) {
      updateData.investigationNotes = req.body.investigation_notes || req.body.investigationNotes;
    }
    if (req.body.corrective_actions !== undefined || req.body.correctiveActions !== undefined) {
      updateData.correctiveActions = req.body.corrective_actions || req.body.correctiveActions;
    }
    if (req.body.preventive_measures !== undefined || req.body.preventiveMeasures !== undefined) {
      updateData.preventiveMeasures = req.body.preventive_measures || req.body.preventiveMeasures;
    }
    
    updateData.updatedBy = req.user?.id || null;

    // Parse root causes if provided
    if (req.body.root_causes !== undefined) {
      parseRootCauses(req.body.root_causes, updateData);
    }

    await incident.update(updateData);

    // Fetch updated incident
    const updatedIncident = await OSHIncident.findByPk(incident.id);

    const incidentResponse = updatedIncident.toJSON();
    incidentResponse.rootCauses = buildRootCauses(incidentResponse);

    res.json({ data: incidentResponse });
  } catch (err) {
    console.error('Update OSH incident error:', err);
    res.status(400).json({ message: err.message || 'Failed to update OSH incident' });
  }
};

// Delete OSH incident
exports.remove = async (req, res) => {
  try {
    const incident = await OSHIncident.findByPk(req.params.id);
    if (!incident) {
      return res.status(404).json({ message: 'OSH incident not found' });
    }

    await incident.destroy();
    res.json({ message: 'OSH incident deleted successfully' });
  } catch (err) {
    console.error('Delete OSH incident error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get OSH incident statistics
exports.getStatistics = async (req, res) => {
  try {
    const { union_id, from_date, to_date } = req.query;
    
    const where = {};
    if (union_id) where.unionId = union_id;
    
    if (from_date || to_date) {
      where.dateTimeOccurred = {};
      if (from_date) where.dateTimeOccurred[Op.gte] = new Date(from_date);
      if (to_date) where.dateTimeOccurred[Op.lte] = new Date(to_date);
    }

    // Get all incidents and group manually
    const incidents = await OSHIncident.findAll({ where });

    // Group by category
    const byCategory = {};
    incidents.forEach(incident => {
      const category = incident.accidentCategory;
      byCategory[category] = (byCategory[category] || 0) + 1;
    });

    // Group by injury severity
    const byInjurySeverity = {};
    incidents.forEach(incident => {
      const severity = incident.injurySeverity || 'None';
      byInjurySeverity[severity] = (byInjurySeverity[severity] || 0) + 1;
    });

    // Group by damage severity
    const byDamageSeverity = {};
    incidents.forEach(incident => {
      const severity = incident.damageSeverity || 'None';
      byDamageSeverity[severity] = (byDamageSeverity[severity] || 0) + 1;
    });

    // Group by status
    const byStatus = {};
    incidents.forEach(incident => {
      const status = incident.status;
      byStatus[status] = (byStatus[status] || 0) + 1;
    });

    // Group by month
    const monthlyTrends = {};
    incidents.forEach(incident => {
      const month = incident.dateTimeOccurred.toISOString().substring(0, 7); // YYYY-MM
      monthlyTrends[month] = (monthlyTrends[month] || 0) + 1;
    });

    res.json({
      data: {
        byCategory: Object.entries(byCategory).map(([category, count]) => ({ category, count })),
        byInjurySeverity: Object.entries(byInjurySeverity).map(([severity, count]) => ({ severity, count })),
        byDamageSeverity: Object.entries(byDamageSeverity).map(([severity, count]) => ({ severity, count })),
        byStatus: Object.entries(byStatus).map(([status, count]) => ({ status, count })),
        monthlyTrends: Object.entries(monthlyTrends).map(([month, count]) => ({ month, count })),
        total: incidents.length
      }
    });
  } catch (err) {
    console.error('Get OSH statistics error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
