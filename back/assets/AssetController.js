// controllers/assetController.js
const { pool } = require('../config/database');

const VALID_TYPES = [
  'Serveur Web',
  'Base de données',
  'Poste utilisateur',
  'Routeur',
  'Pare-feu',
  'Application métier',
];

// GET /assets
// Liste tous les actifs, avec le nombre de vulnérabilités associées
exports.getAssets = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT a.*,
             COUNT(v.id) AS vulnerabilities_count
      FROM assets a
      LEFT JOIN vulnerabilities v ON v.asset_id = a.id
      GROUP BY a.id
      ORDER BY a.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des actifs.' });
  }
};

// GET /assets/:id
exports.getAssetById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM assets WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Actif non trouvé.' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

// POST /assets
exports.createAsset = async (req, res) => {
  try {
    const { company_id, name, type, is_internet_facing, description } = req.body;

    if (!company_id || !name || !type) {
      return res.status(400).json({ error: 'Les champs "company_id", "name" et "type" sont obligatoires.' });
    }

    if (!VALID_TYPES.includes(type)) {
      return res.status(400).json({ error: `Type invalide. Valeurs acceptées : ${VALID_TYPES.join(', ')}` });
    }

    const [result] = await pool.query(
      `INSERT INTO assets (company_id, name, type, is_internet_facing, description)
       VALUES (?, ?, ?, ?, ?)`,
      [company_id, name, type, !!is_internet_facing, description || null]
    );

    const [rows] = await pool.query('SELECT * FROM assets WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur lors de la création de l\'actif.' });
  }
};

// PUT /assets/:id
exports.updateAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, is_internet_facing, description } = req.body;

    const [existing] = await pool.query('SELECT * FROM assets WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Actif non trouvé.' });
    }

    if (type && !VALID_TYPES.includes(type)) {
      return res.status(400).json({ error: `Type invalide. Valeurs acceptées : ${VALID_TYPES.join(', ')}` });
    }

    await pool.query(
      `UPDATE assets SET name = ?, type = ?, is_internet_facing = ?, description = ? WHERE id = ?`,
      [
        name ?? existing[0].name,
        type ?? existing[0].type,
        is_internet_facing ?? existing[0].is_internet_facing,
        description ?? existing[0].description,
        id,
      ]
    );

    const [rows] = await pool.query('SELECT * FROM assets WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur lors de la mise à jour de l\'actif.' });
  }
};

// DELETE /assets/:id
exports.deleteAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await pool.query('SELECT * FROM assets WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Actif non trouvé.' });
    }

    await pool.query('DELETE FROM assets WHERE id = ?', [id]);
    res.json({ message: 'Actif supprimé avec succès.', id: Number(id) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur lors de la suppression de l\'actif.' });
  }
};