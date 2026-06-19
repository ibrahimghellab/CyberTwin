// routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const riskController = require('../risks/RiskController');

router.get('/', riskController.getDashboard);

module.exports = router;