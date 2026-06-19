// controllers/riskController.js
const { pool } = require('../config/database');
const { calculateRisk, generateRecommendations } = require('../riskEngine');

// Petite fonction interne réutilisée par plusieurs endpoints
async function getAssetsAndVulnerabilities(companyId) {
  const [assets] = await pool.query('SELECT * FROM assets WHERE company_id = ?', [companyId]);
  const assetIds = assets.map((a) => a.id);

  let vulnerabilities = [];
  if (assetIds.length > 0) {
    const [rows] = await pool.query(
      `SELECT * FROM vulnerabilities WHERE asset_id IN (?)`,
      [assetIds]
    );
    vulnerabilities = rows;
  }

  return { assets, vulnerabilities };
}

// POST /risk/calculate
// Calcule le score de risque pour l'entreprise et sauvegarde l'historique
exports.calculateRiskScore = async (req, res) => {
  try {
    const companyId = req.body.company_id || 1;

    const [company] = await pool.query('SELECT * FROM companies WHERE id = ?', [companyId]);
    if (company.length === 0) {
      return res.status(404).json({ error: 'Entreprise non trouvée.' });
    }

    const { assets, vulnerabilities } = await getAssetsAndVulnerabilities(companyId);
    const result = calculateRisk(assets, vulnerabilities);

    // Historisation du calcul (table risk_assessments)
    await pool.query(
      `INSERT INTO risk_assessments (company_id, score, level, assets_count, vulnerabilities_count)
       VALUES (?, ?, ?, ?, ?)`,
      [companyId, result.score, result.level, assets.length, vulnerabilities.length]
    );

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur lors du calcul du risque.' });
  }
};

// GET /dashboard
// Renvoie les données agrégées pour le tableau de bord
exports.getDashboard = async (req, res) => {
  try {
    const companyId = req.query.company_id || 1;
    const { assets, vulnerabilities } = await getAssetsAndVulnerabilities(companyId);
    const result = calculateRisk(assets, vulnerabilities);

    // Répartition des actifs par type (pour un graphique camembert/barres)
    const distribution = {};
    for (const asset of assets) {
      distribution[asset.type] = (distribution[asset.type] || 0) + 1;
    }

    // Répartition des vulnérabilités par criticité
    const criticalityDistribution = {};
    for (const vuln of vulnerabilities) {
      criticalityDistribution[vuln.criticality] = (criticalityDistribution[vuln.criticality] || 0) + 1;
    }

    res.json({
      total_assets: assets.length,
      total_vulnerabilities: vulnerabilities.length,
      assets_distribution: distribution,
      criticality_distribution: criticalityDistribution,
      risk_score: result.score,
      risk_level: result.level,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur lors de la génération du dashboard.' });
  }
};

// GET /report
// Génère le rapport complet (entreprise + actifs + vulnérabilités + risque + recommandations)
exports.getReport = async (req, res) => {
  try {
    const companyId = req.query.company_id || 1;

    const [company] = await pool.query('SELECT * FROM companies WHERE id = ?', [companyId]);
    if (company.length === 0) {
      return res.status(404).json({ error: 'Entreprise non trouvée.' });
    }

    const { assets, vulnerabilities } = await getAssetsAndVulnerabilities(companyId);
    const riskResult = calculateRisk(assets, vulnerabilities);
    const recommendations = generateRecommendations(vulnerabilities);

    // Associe chaque vulnérabilité à son actif pour un rapport lisible
    const assetsWithVulns = assets.map((asset) => ({
      ...asset,
      vulnerabilities: vulnerabilities.filter((v) => v.asset_id === asset.id),
    }));

    res.json({
      company: company[0],
      assets: assetsWithVulns,
      risk: riskResult,
      recommendations,
      generated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur lors de la génération du rapport.' });
  }
};