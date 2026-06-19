// routes/riskRoutes.js
const express = require('express');
const router = express.Router();
const riskController = require('./RiskController');
 
router.post('/calculate', riskController.calculateRiskScore);
 
module.exports = router;