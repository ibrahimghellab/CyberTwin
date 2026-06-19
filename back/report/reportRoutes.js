// routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const riskController = require('../risks/RiskController');

router.get('/', riskController.getReport);

module.exports = router;