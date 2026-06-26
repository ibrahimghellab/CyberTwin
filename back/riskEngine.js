
const CRITICALITY_WEIGHTS = {
  faible: 1,
  moyenne: 2,
  'élevée': 4,
  critique: 7,
};

const INTERNET_EXPOSURE_MULTIPLIER = 1.5;

/**
 * Calcule le score de risque brut à partir d'une liste d'actifs et de vulnérabilités.
 * @param {Array} assets - liste des actifs (avec is_internet_facing)
 * @param {Array} vulnerabilities - liste des vulnérabilités (avec asset_id et criticality)
 * @returns {{ score: number, level: string, details: object }}
 */
function calculateRisk(assets, vulnerabilities) {
  if (!assets || assets.length === 0) {
    return {
      score: 0,
      level: 'faible',
      details: { reason: 'Aucun actif enregistré.' },
    };
  }

  const assetsById = new Map(assets.map((a) => [a.id, a]));
  let rawScore = 0;

  for (const vuln of vulnerabilities) {
    const weight = CRITICALITY_WEIGHTS[vuln.criticality] ?? CRITICALITY_WEIGHTS.moyenne;
    const asset = assetsById.get(vuln.asset_id);
    const exposureMultiplier = asset?.is_internet_facing ? INTERNET_EXPOSURE_MULTIPLIER : 1;
    rawScore += weight * exposureMultiplier;
  }

 
  const maxExpectedScore = Math.max(assets.length * 5, 10);
  const normalizedScore = Math.min(100, Math.round((rawScore / maxExpectedScore) * 100));

  let level;
  if (normalizedScore < 30) {
    level = 'faible';
  } else if (normalizedScore < 65) {
    level = 'moyen';
  } else {
    level = 'élevé';
  }

  return {
    score: normalizedScore,
    level,
    details: {
      assets_count: assets.length,
      vulnerabilities_count: vulnerabilities.length,
      internet_facing_assets: assets.filter((a) => a.is_internet_facing).length,
      raw_score: Math.round(rawScore * 100) / 100,
    },
  };
}

/**
 * Génère des recommandations de sécurité à partir des vulnérabilités détectées.
 * @param {Array} vulnerabilities
 * @returns {Array<string>}
 */
function generateRecommendations(vulnerabilities) {
  const recommendations = new Set();

  for (const vuln of vulnerabilities) {
    const title = (vuln.title || '').toLowerCase();

    if (title.includes('obsolète')) {
      recommendations.add('Mettre à jour les logiciels et systèmes obsolètes vers les dernières versions stables.');
    }
    if (title.includes('mot de passe')) {
      recommendations.add('Renforcer la politique de mots de passe et activer l\'authentification multi-facteurs.');
    }
    if (title.includes('port')) {
      recommendations.add('Auditer les ports exposés et fermer ceux qui ne sont pas strictement nécessaires.');
    }
    if (title.includes('sauvegarde')) {
      recommendations.add('Mettre en place une politique de sauvegarde régulière et testée.');
    }
    if (vuln.criticality === 'critique') {
      recommendations.add('Traiter en priorité les vulnérabilités critiques avant toute autre action.');
    }
  }

  if (recommendations.size === 0) {
    recommendations.add('Aucune vulnérabilité majeure détectée. Maintenir une surveillance régulière.');
  }

  return Array.from(recommendations);
}

module.exports = { calculateRisk, generateRecommendations };