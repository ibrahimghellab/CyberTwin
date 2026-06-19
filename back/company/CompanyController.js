// controllers/companyController.js
const { pool } = require('../config/database');

// GET /company
// Récupère la fiche de l'entreprise (id=1 par défaut, app mono-entreprise)
exports.getCompany = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM companies LIMIT 1');
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Aucune entreprise trouvée.' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération de l\'entreprise.' });
  }
};

// POST /company
// Crée l'entreprise (à utiliser une seule fois normalement)
exports.createCompany = async (req, res) => {
  try {
    const { name, sector, employees_count, servers_count, workstations_count, exposed_services } = req.body;

    if (!name || !sector) {
      return res.status(400).json({ error: 'Les champs "name" et "sector" sont obligatoires.' });
    }

    const [result] = await pool.query(
      `INSERT INTO companies (name, sector, employees_count, servers_count, workstations_count, exposed_services)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, sector, employees_count || 0, servers_count || 0, workstations_count || 0, exposed_services || '']
    );

    const [rows] = await pool.query('SELECT * FROM companies WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur lors de la création de l\'entreprise.' });
  }
};

// PUT /company/:id
// Modifie les informations de l'entreprise
exports.updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sector, employees_count, servers_count, workstations_count, exposed_services } = req.body;

    const [existing] = await pool.query('SELECT * FROM companies WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Entreprise non trouvée.' });
    }

    await pool.query(
      `UPDATE companies SET
        name = ?, sector = ?, employees_count = ?, servers_count = ?, workstations_count = ?, exposed_services = ?
       WHERE id = ?`,
      [
        name ?? existing[0].name,
        sector ?? existing[0].sector,
        employees_count ?? existing[0].employees_count,
        servers_count ?? existing[0].servers_count,
        workstations_count ?? existing[0].workstations_count,
        exposed_services ?? existing[0].exposed_services,
        id,
      ]
    );

    const [rows] = await pool.query('SELECT * FROM companies WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur lors de la mise à jour de l\'entreprise.' });
  }
};