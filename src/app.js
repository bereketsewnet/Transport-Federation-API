// src/app.js
const express = require('express');
const app = express();
const path = require('path');
require('dotenv').config();
const cors = require('cors');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Serve uploaded files statically
app.use('/uploads/photos', express.static(path.join(__dirname, '../uploads/photos')));
app.use('/uploads/news', express.static(path.join(__dirname, '../uploads/news')));
app.use('/uploads/cms', express.static(path.join(__dirname, '../uploads/cms')));

// auth
app.use('/api/auth', require('./routes/auth.routes'));

// core resources
app.use('/api/unions', require('./routes/unions.routes'));
app.use('/api/members', require('./routes/members.routes'));
app.use('/api/union-executives', require('./routes/unionExecutives.routes'));
app.use('/api/cbas', require('./routes/cbas.routes'));
app.use('/api/terminated-unions', require('./routes/terminatedUnions.routes'));
app.use('/api/login-accounts', require('./routes/loginAccounts.routes'));
app.use('/api/org-leaders', require('./routes/orgLeaders.routes'));
app.use('/api/archives', require('./routes/archives.routes'));
app.use('/api/visitors', require('./routes/visitors.routes'));
app.use('/api/contacts', require('./routes/contacts.routes'));
app.use('/api/news', require('./routes/news.routes'));
app.use('/api/galleries', require('./routes/galleries.routes'));
app.use('/api/photos', require('./routes/photos.routes'));
app.use('/api/reports', require('./routes/reports.routes'));

// CMS routes
app.use('/api/cms', require('./routes/cms.routes'));

// health
app.get('/health', (req, res) => res.json({ status: 'ok' }));

module.exports = app;
