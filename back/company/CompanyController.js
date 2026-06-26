const { pool } = require('../config/database');

exports.getCompanies = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM companies ORDER BY created_at DESC'); //
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

exports.getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM companies WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Entreprise non trouvée.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

exports.createCompany = async (req, res) => {
  try {
    const { name, sector, employees_count, servers_count, workstations_count, exposed_services } = req.body;
    const [result] = await pool.query(
      `INSERT INTO companies (name, sector, employees_count, servers_count, workstations_count, exposed_services) VALUES (?, ?, ?, ?, ?, ?)`,
      [name, sector, employees_count || 0, servers_count || 0, workstations_count || 0, exposed_services || '']
    );
    const [rows] = await pool.query('SELECT * FROM companies WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
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

// DELETE /companies/:id
// Supprime une entreprise, ses utilisateurs liés, et cascade sur les actifs/vulnérabilités
exports.deleteCompany = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM users WHERE company_id = ?', [id]);
    const [result] = await pool.query('DELETE FROM companies WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Entreprise non trouvée.' });
    }
    res.json({ 
      message: 'Entreprise, utilisateurs associés, actifs et vulnérabilités supprimés avec succès.' 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur lors de la suppression de l\'entreprise.' });
  }
};