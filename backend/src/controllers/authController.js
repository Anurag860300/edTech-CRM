const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'edtech_crm_super_secret_jwt_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Admin Login
 * Custom authentication verifying bcrypt password against Supabase PostgreSQL `admins` table
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    // Query admin by normalized email
    const cleanEmail = email.trim().toLowerCase();
    const result = await db.query(
      'SELECT id, name, email, password_hash, role, created_at FROM admins WHERE LOWER(email) = $1',
      [cleanEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const admin = result.rows[0];

    // Verify bcrypt password hash
    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Generate custom JWT
    const payload = {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.status(200).json({
      success: true,
      message: 'Admin authentication successful.',
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        createdAt: admin.created_at
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.',
      error: error.message
    });
  }
};

/**
 * Admin Registration (Optional helper / Initial setup)
 */
const register = async (req, res) => {
  try {
    const { name, email, password, role = 'admin' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if email already exists
    const existing = await db.query(
      'SELECT id FROM admins WHERE LOWER(email) = $1',
      [cleanEmail]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An administrator with this email already exists.'
      });
    }

    // Hash password with bcrypt
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert new admin
    const insertResult = await db.query(
      'INSERT INTO admins (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at',
      [name.trim(), cleanEmail, passwordHash, role]
    );

    const newAdmin = insertResult.rows[0];

    // Generate JWT
    const token = jwt.sign(
      { id: newAdmin.id, name: newAdmin.name, email: newAdmin.email, role: newAdmin.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(201).json({
      success: true,
      message: 'Admin registered successfully.',
      token,
      admin: newAdmin
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to register admin account.',
      error: error.message
    });
  }
};

/**
 * Get Current Authenticated Admin Profile
 */
const getMe = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, name, email, role, created_at FROM admins WHERE id = $1',
      [req.admin.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Admin account not found.'
      });
    }

    return res.status(200).json({
      success: true,
      admin: result.rows[0]
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve admin profile.',
      error: error.message
    });
  }
};

module.exports = {
  login,
  register,
  getMe
};
