const { pool } = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'cybertwin_super_secret_key_2026';

// POST /auth/register
exports.register = async (req, res) => {
  try {
    const { email, password, role, company_id } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis.' });
    }

    const [existingUser] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const userRole = role === 'admin' ? 'admin' : 'user';
    const finalCompanyId = userRole === 'admin' ? null : (company_id || null);

    await pool.query(
      'INSERT INTO users (email, password_hash, role, company_id) VALUES (?, ?, ?, ?)',
      [email, passwordHash, userRole, finalCompanyId]
    );

    res.status(201).json({ message: 'Utilisateur créé avec succès.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

// POST /auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) return res.status(401).json({ error: 'Identifiants incorrects.' });
    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ error: 'Identifiants incorrects.' });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, company_id: user.company_id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Connexion réussie',
      token,
      user: { id: user.id, email: user.email, role: user.role, company_id: user.company_id }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

// GET /auth/users
exports.getUsers = async (req, res) => {
  try {
    const query = `
      SELECT u.id, u.email, u.role, u.created_at, c.name as company_name 
      FROM users u 
      LEFT JOIN companies c ON u.company_id = c.id 
      ORDER BY u.created_at DESC
    `;
    const [users] = await pool.query(query);
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

// PUT /auth/users/:id
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, password, role, company_id } = req.body;

    const [existing] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Utilisateur non trouvé.' });

    let sql = 'UPDATE users SET email = ?, role = ?, company_id = ?';
    let params = [
      email || existing[0].email,
      role || existing[0].role,
      role === 'admin' ? null : (company_id !== undefined ? company_id : existing[0].company_id)
    ];

    // Si on a tapé un nouveau mot de passe, on le hache et on l'ajoute à la requête
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      sql += ', password_hash = ?';
      params.push(passwordHash);
    }

    sql += ' WHERE id = ?';
    params.push(id);

    await pool.query(sql, params);
    res.json({ message: 'Compte mis à jour avec succès.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur lors de la mise à jour.' });
  }
};

// DELETE /auth/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'Utilisateur supprimé.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur lors de la suppression.' });
  }
};