const db = require('../config/db');

// Allowed enum values according to task specification
const VALID_USER_TYPES = ['Parent', 'Student', 'School'];
const VALID_CATEGORIES = ['Scholarship', 'Concert', 'Admission', 'General Query'];
const VALID_STATUSES = ['Pending', 'In Review', 'Contacted', 'Resolved', 'Archived'];

/**
 * Public Endpoint: Submit an Inquiry
 * Saves directly into the Supabase PostgreSQL database
 */
const createInquiry = async (req, res) => {
  try {
    const { name, email, phone, user_type, category, message } = req.body;

    // Validation
    const errors = [];
    if (!name || typeof name !== 'string' || !name.trim()) {
      errors.push('Full name is required.');
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.push('A valid email address is required.');
    }
    if (!phone || typeof phone !== 'string' || !phone.trim()) {
      errors.push('Phone number is required.');
    }
    if (!user_type || !VALID_USER_TYPES.includes(user_type)) {
      errors.push(`User Type must be one of: ${VALID_USER_TYPES.join(', ')}.`);
    }
    if (!category || !VALID_CATEGORIES.includes(category)) {
      errors.push(`Category must be one of: ${VALID_CATEGORIES.join(', ')}.`);
    }
    if (!message || typeof message !== 'string' || !message.trim()) {
      errors.push('Inquiry message / query text is required.');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors
      });
    }

    // Insert into Supabase PostgreSQL table `inquiries`
    const insertQuery = `
      INSERT INTO inquiries (name, email, phone, user_type, category, message, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'Pending')
      RETURNING id, name, email, phone, user_type, category, message, status, created_at
    `;

    const values = [
      name.trim(),
      email.trim().toLowerCase(),
      phone.trim(),
      user_type,
      category,
      message.trim()
    ];

    const result = await db.query(insertQuery, values);
    const createdInquiry = result.rows[0];

    return res.status(201).json({
      success: true,
      message: 'Inquiry submitted successfully! Our EdTech admissions and advisory team will get in touch soon.',
      inquiry: createdInquiry
    });
  } catch (error) {
    console.error('Error submitting inquiry:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit inquiry. Please try again later.',
      error: error.message
    });
  }
};

/**
 * Protected Endpoint: Get Inquiries with Filtering & Search
 * Supports:
 *  - Filter by Category (Scholarship, Concert, Admission, General Query)
 *  - Filter by User Type (Parent, Student, School)
 *  - Search bar for Name or Phone Number (case-insensitive substring match)
 *  - Filter by Status (Pending, In Review, Contacted, Resolved)
 *  - Sorting and pagination
 */
const getInquiries = async (req, res) => {
  try {
    const {
      category,
      user_type,
      search,
      status,
      sort_by = 'created_at',
      order = 'DESC',
      page = 1,
      limit = 50
    } = req.query;

    const conditions = [];
    const params = [];
    let paramCounter = 1;

    // Filter by Category
    if (category && category !== 'All' && VALID_CATEGORIES.includes(category)) {
      conditions.push(`category = $${paramCounter++}`);
      params.push(category);
    }

    // Filter by User Type
    if (user_type && user_type !== 'All' && VALID_USER_TYPES.includes(user_type)) {
      conditions.push(`user_type = $${paramCounter++}`);
      params.push(user_type);
    }

    // Filter by Status
    if (status && status !== 'All' && VALID_STATUSES.includes(status)) {
      conditions.push(`status = $${paramCounter++}`);
      params.push(status);
    }

    // Search bar for Name or Phone Number
    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      conditions.push(`(name ILIKE $${paramCounter} OR phone ILIKE $${paramCounter})`);
      params.push(searchTerm);
      paramCounter++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Validate sort order
    const safeOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const allowedSortFields = ['created_at', 'name', 'category', 'user_type', 'status'];
    const safeSortBy = allowedSortFields.includes(sort_by) ? sort_by : 'created_at';

    // Count query for pagination totals
    const countQuery = `SELECT COUNT(*) AS total FROM inquiries ${whereClause}`;
    const countResult = await db.query(countQuery, params);
    const totalCount = parseInt(countResult.rows[0].total, 10);

    // Pagination calculations
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 50));
    const offset = (pageNum - 1) * limitNum;

    // Main data query
    const dataQuery = `
      SELECT id, name, email, phone, user_type, category, message, status, admin_notes, created_at, updated_at
      FROM inquiries
      ${whereClause}
      ORDER BY ${safeSortBy} ${safeOrder}
      LIMIT $${paramCounter++} OFFSET $${paramCounter++}
    `;

    const dataParams = [...params, limitNum, offset];
    const dataResult = await db.query(dataQuery, dataParams);

    return res.status(200).json({
      success: true,
      total: totalCount,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalCount / limitNum) || 1,
      inquiries: dataResult.rows
    });
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve inquiries.',
      error: error.message
    });
  }
};

/**
 * Protected Endpoint: Get Single Inquiry by ID
 */
const getInquiryById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM inquiries WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found.'
      });
    }

    return res.status(200).json({
      success: true,
      inquiry: result.rows[0]
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch inquiry details.',
      error: error.message
    });
  }
};

/**
 * Protected Endpoint: Update Inquiry Status and Admin Notes
 */
const updateInquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${VALID_STATUSES.join(', ')}.`
      });
    }

    let queryText = 'UPDATE inquiries SET status = $1';
    const params = [status];
    let counter = 2;

    if (admin_notes !== undefined) {
      queryText += `, admin_notes = $${counter++}`;
      params.push(admin_notes);
    }

    queryText += ` WHERE id = $${counter} RETURNING *`;
    params.push(id);

    const result = await db.query(queryText, params);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Inquiry updated successfully.',
      inquiry: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating inquiry:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update inquiry status.',
      error: error.message
    });
  }
};

/**
 * Protected Endpoint: Delete Inquiry
 */
const deleteInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM inquiries WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Inquiry removed successfully.',
      deletedId: id
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete inquiry.',
      error: error.message
    });
  }
};

/**
 * Protected Endpoint: CRM Inquiry Overview Metrics & Statistics
 */
const getInquiryStats = async (req, res) => {
  try {
    // Total count
    const totalRes = await db.query('SELECT COUNT(*) as total FROM inquiries');

    // Count by User Type
    const userTypeRes = await db.query(`
      SELECT user_type, COUNT(*) as count 
      FROM inquiries 
      GROUP BY user_type
    `);

    // Count by Category
    const categoryRes = await db.query(`
      SELECT category, COUNT(*) as count 
      FROM inquiries 
      GROUP BY category
    `);

    // Count by Status
    const statusRes = await db.query(`
      SELECT status, COUNT(*) as count 
      FROM inquiries 
      GROUP BY status
    `);

    const userTypeMap = { Parent: 0, Student: 0, School: 0 };
    userTypeRes.rows.forEach(r => { userTypeMap[r.user_type] = parseInt(r.count, 10); });

    const categoryMap = { Scholarship: 0, Concert: 0, Admission: 0, 'General Query': 0 };
    categoryRes.rows.forEach(r => { categoryMap[r.category] = parseInt(r.count, 10); });

    const statusMap = { Pending: 0, 'In Review': 0, Contacted: 0, Resolved: 0, Archived: 0 };
    statusRes.rows.forEach(r => { statusMap[r.status] = parseInt(r.count, 10); });

    return res.status(200).json({
      success: true,
      stats: {
        total: parseInt(totalRes.rows[0].total, 10),
        byUserType: userTypeMap,
        byCategory: categoryMap,
        byStatus: statusMap
      }
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch inquiry statistics.',
      error: error.message
    });
  }
};

module.exports = {
  createInquiry,
  getInquiries,
  getInquiryById,
  updateInquiryStatus,
  deleteInquiry,
  getInquiryStats,
  VALID_USER_TYPES,
  VALID_CATEGORIES,
  VALID_STATUSES
};
