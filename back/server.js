const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { testConnection } = require('./config/database');

const companyRoutes = require('./company/CompanyRoutes');
const assetRoutes = require('./assets/Assetroutes');
const vulnerabilityRoutes = require('./vulnerability/Vulnerabilityroutes');
const riskRoutes = require('./risks/RiskRoutes');
const dashboardRoutes = require('./Dashboard/dashboardRoutes');
const reportRoutes = require('./report/reportRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.json({ message: 'API CyberTwin opérationnelle 🚀' }));

// L'URL passe au pluriel pour respecter les standards REST
app.use('/companies', companyRoutes); 
app.use('/assets', assetRoutes);
app.use('/vulnerabilities', vulnerabilityRoutes);
app.use('/risk', riskRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/report', reportRoutes);

app.use((req, res) => res.status(404).json({ error: 'Route non trouvée.' }));

app.listen(PORT, async () => {
  console.log(`🚀 Serveur CyberTwin démarré sur http://localhost:${PORT}`);
  await testConnection();
});