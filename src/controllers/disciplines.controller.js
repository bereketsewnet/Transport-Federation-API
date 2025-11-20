// src/controllers/disciplines.controller.js
const Discipline = require('../models/discipline.model');
const Union = require('../models/union.model');
const Member = require('../models/member.model');
const { Op } = require('sequelize');

exports.list = async (req, res) => {
  try {
    const { 
      q, 
      union_id, 
      mem_id, 
      discipline_case, 
      judiciary_intermediate,
      resolution_method,
      verdict_for,
      page = 1, 
      per_page = 20, 
      sort_by = 'created_at', 
      order = 'DESC' 
    } = req.query;
    
    const where = {};
    
    if (q) {
      where[Op.or] = [
        { reason_of_discipline: { [Op.like]: `%${q}%` } }
      ];
    }
    
    if (union_id) where.union_id = union_id;
    if (mem_id) where.mem_id = mem_id;
    if (discipline_case) where.discipline_case = discipline_case;
    if (typeof judiciary_intermediate !== 'undefined') {
      where.judiciary_intermediate = judiciary_intermediate === 'true' ? 1 : 0;
    }
    if (resolution_method) where.resolution_method = resolution_method;
    if (verdict_for) where.verdict_for = verdict_for;
    
    const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(per_page);
    
    const { rows, count } = await Discipline.findAndCountAll({
      where,
      include: [
        { model: Union, as: 'union', attributes: ['union_id', 'union_code', 'name_en', 'name_am'] },
        { model: Member, as: 'member', attributes: ['mem_id', 'member_code', 'first_name', 'father_name', 'surname'] }
      ],
      limit: parseInt(per_page),
      offset,
      order: [[sort_by, order.toUpperCase()]]
    });
    
    res.json({ 
      data: rows, 
      meta: { 
        total: count, 
        page: parseInt(page), 
        per_page: parseInt(per_page) 
      } 
    });
  } catch (err) {
    console.error('Disciplines list error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const item = await Discipline.findByPk(req.params.id, {
      include: [
        { model: Union, as: 'union', attributes: ['union_id', 'union_code', 'name_en', 'name_am'] },
        { model: Member, as: 'member', attributes: ['mem_id', 'member_code', 'first_name', 'father_name', 'surname'] }
      ]
    });
    
    if (!item) return res.status(404).json({ message: 'Discipline case not found' });
    
    res.json(item);
  } catch (err) {
    console.error('Discipline getById error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.create = async (req, res) => {
  try {
    const {
      union_id,
      mem_id,
      discipline_case,
      reason_of_discipline,
      date_of_action_taken,
      judiciary_intermediate,
      resolution_method,
      verdict_for
    } = req.body;
    
    if (!union_id) return res.status(400).json({ message: 'union_id required' });
    if (!mem_id) return res.status(400).json({ message: 'mem_id required' });
    if (!discipline_case) return res.status(400).json({ message: 'discipline_case required' });
    if (!reason_of_discipline) return res.status(400).json({ message: 'reason_of_discipline required' });
    if (!date_of_action_taken) return res.status(400).json({ message: 'date_of_action_taken required' });
    
    // Validate enum values
    const validCases = ['Warning', 'Salary Penalty', 'Work Suspension', 'Termination'];
    if (!validCases.includes(discipline_case)) {
      return res.status(400).json({ message: `discipline_case must be one of: ${validCases.join(', ')}` });
    }
    
    if (resolution_method) {
      const validMethods = ['Social Dialog', 'Judiciary Body'];
      if (!validMethods.includes(resolution_method)) {
        return res.status(400).json({ message: `resolution_method must be one of: ${validMethods.join(', ')}` });
      }
    }
    
    if (verdict_for) {
      const validVerdicts = ['Worker', 'Employer'];
      if (!validVerdicts.includes(verdict_for)) {
        return res.status(400).json({ message: `verdict_for must be one of: ${validVerdicts.join(', ')}` });
      }
    }
    
    // Verify union exists
    const union = await Union.findByPk(union_id);
    if (!union) return res.status(404).json({ message: 'Union not found' });
    
    // Verify member exists
    const member = await Member.findByPk(mem_id);
    if (!member) return res.status(404).json({ message: 'Member not found' });
    
    const discipline = await Discipline.create({
      union_id,
      mem_id,
      discipline_case,
      reason_of_discipline,
      date_of_action_taken,
      judiciary_intermediate: judiciary_intermediate || false,
      resolution_method,
      verdict_for
    });
    
    const created = await Discipline.findByPk(discipline.id, {
      include: [
        { model: Union, as: 'union', attributes: ['union_id', 'union_code', 'name_en', 'name_am'] },
        { model: Member, as: 'member', attributes: ['mem_id', 'member_code', 'first_name', 'father_name', 'surname'] }
      ]
    });
    
    res.status(201).json(created);
  } catch (err) {
    console.error('Discipline create error:', err);
    res.status(400).json({ message: err.message || 'Server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const discipline = await Discipline.findByPk(req.params.id);
    if (!discipline) return res.status(404).json({ message: 'Discipline case not found' });
    
    const {
      union_id,
      mem_id,
      discipline_case,
      reason_of_discipline,
      date_of_action_taken,
      judiciary_intermediate,
      resolution_method,
      verdict_for
    } = req.body;
    
    // Validate enum values if provided
    if (discipline_case) {
      const validCases = ['Warning', 'Salary Penalty', 'Work Suspension', 'Termination'];
      if (!validCases.includes(discipline_case)) {
        return res.status(400).json({ message: `discipline_case must be one of: ${validCases.join(', ')}` });
      }
    }
    
    if (resolution_method) {
      const validMethods = ['Social Dialog', 'Judiciary Body'];
      if (!validMethods.includes(resolution_method)) {
        return res.status(400).json({ message: `resolution_method must be one of: ${validMethods.join(', ')}` });
      }
    }
    
    if (verdict_for) {
      const validVerdicts = ['Worker', 'Employer'];
      if (!validVerdicts.includes(verdict_for)) {
        return res.status(400).json({ message: `verdict_for must be one of: ${validVerdicts.join(', ')}` });
      }
    }
    
    // Verify union exists if provided
    if (union_id) {
      const union = await Union.findByPk(union_id);
      if (!union) return res.status(404).json({ message: 'Union not found' });
    }
    
    // Verify member exists if provided
    if (mem_id) {
      const member = await Member.findByPk(mem_id);
      if (!member) return res.status(404).json({ message: 'Member not found' });
    }
    
    await discipline.update({
      union_id: union_id !== undefined ? union_id : discipline.union_id,
      mem_id: mem_id !== undefined ? mem_id : discipline.mem_id,
      discipline_case: discipline_case || discipline.discipline_case,
      reason_of_discipline: reason_of_discipline || discipline.reason_of_discipline,
      date_of_action_taken: date_of_action_taken || discipline.date_of_action_taken,
      judiciary_intermediate: judiciary_intermediate !== undefined ? judiciary_intermediate : discipline.judiciary_intermediate,
      resolution_method: resolution_method !== undefined ? resolution_method : discipline.resolution_method,
      verdict_for: verdict_for !== undefined ? verdict_for : discipline.verdict_for
    });
    
    const updated = await Discipline.findByPk(discipline.id, {
      include: [
        { model: Union, as: 'union', attributes: ['union_id', 'union_code', 'name_en', 'name_am'] },
        { model: Member, as: 'member', attributes: ['mem_id', 'member_code', 'first_name', 'father_name', 'surname'] }
      ]
    });
    
    res.json(updated);
  } catch (err) {
    console.error('Discipline update error:', err);
    res.status(400).json({ message: err.message || 'Server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    if (req.query.confirm !== 'true') {
      return res.status(400).json({ message: 'To delete set ?confirm=true' });
    }
    
    const discipline = await Discipline.findByPk(req.params.id);
    if (!discipline) return res.status(404).json({ message: 'Discipline case not found' });
    
    await discipline.destroy();
    res.json({ message: 'Discipline case deleted' });
  } catch (err) {
    console.error('Discipline remove error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

