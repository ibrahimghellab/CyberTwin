// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { testConnection } = require('./config/database');

// Import des routes
const companyRoutes = require('./company/CompanyRoutes');
const assetRoutes = require('./assets/Assetroutes');
const vulnerabilityRoutes = require('./vulnerability/Vulnerabilityroutes');
const riskRoutes = require('./risks/RiskRoutes');
const dashboardRoutes = require('./Dashboard/dashboardRoutes');
const reportRoutes = require('./report/reportRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globaux
app.use(cors()); // autorise le frontend Vue.js (autre port) à appeler l'API
app.use(express.json()); // parse les corps de requête JSON

// Route de santé / vérification rapide
app.get('/', (req, res) => {
  res.json({ message: 'API CyberTwin opérationnelle 🚀' });
});

// Montage des routes
app.use('/company', companyRoutes);
app.use('/assets', assetRoutes);
app.use('/vulnerabilities', vulnerabilityRoutes);
app.use('/risk', riskRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/report', reportRoutes);

// Gestion des routes inconnues (404)
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée.' });
});

// Gestion d'erreurs globale (filet de sécurité)
app.use((err, req, res, next) => {
  console.error('Erreur non gérée :', err);
  res.status(500).json({ error: 'Erreur interne du serveur.' });
});

app.listen(PORT, async () => {
  console.log(`🚀 Serveur CyberTwin démarré sur http://localhost:${PORT}`);
  await testConnection();
});