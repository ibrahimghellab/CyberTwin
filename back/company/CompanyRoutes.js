const express = require('express');
const router = express.Router();
const companyController = require('./CompanyController');
 
router.get('/', companyController.getCompany);
router.post('/', companyController.createCompany);
router.put('/:id', companyController.updateCompany);
 
module.exports = router;
 