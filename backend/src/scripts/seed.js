const bcrypt = require('bcryptjs');
const db = require('../config/db');

const seedDatabase = async () => {
  console.log('--- Initializing EdTech CRM Database & Seeding ---');

  try {
    const connTest = await db.testConnection();
    if (!connTest.connected) {
      throw new Error(`Cannot connect to database: ${connTest.error}`);
    }
    console.log(`✓ Connected to PostgreSQL (${connTest.database}) at ${connTest.time}`);

    // Create admins table
    await db.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'admin',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Verified table: admins');

    // Create inquiries table
    await db.query(`
      CREATE TABLE IF NOT EXISTS inquiries (
        id SERIAL PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        user_type VARCHAR(50) NOT NULL CHECK (user_type IN ('Parent', 'Student', 'School')),
        category VARCHAR(50) NOT NULL CHECK (category IN ('Scholarship', 'Concert', 'Admission', 'General Query')),
        message TEXT NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Review', 'Contacted', 'Resolved', 'Archived')),
        admin_notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Verified table: inquiries');

    // Create Indexes
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_inquiries_category ON inquiries (category);
      CREATE INDEX IF NOT EXISTS idx_inquiries_user_type ON inquiries (user_type);
      CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries (status);
      CREATE INDEX IF NOT EXISTS idx_inquiries_name ON inquiries (name);
      CREATE INDEX IF NOT EXISTS idx_inquiries_phone ON inquiries (phone);
      CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries (created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_admins_email ON admins (email);
    `);
    console.log('✓ Verified indexes');

    // Default admin account
    const defaultEmail = process.env.ADMIN_DEFAULT_EMAIL || 'admin@edtech.com';
    const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'AdminPassword@123';
    const defaultName = 'System Administrator';

    const checkAdmin = await db.query('SELECT id, email FROM admins WHERE LOWER(email) = LOWER($1)', [defaultEmail]);

    if (checkAdmin.rows.length === 0) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);
      await db.query(
        'INSERT INTO admins (name, email, password_hash, role) VALUES ($1, $2, $3, $4)',
        [defaultName, defaultEmail.toLowerCase(), hashedPassword, 'admin']
      );
      console.log(`✓ Seeded default admin account: ${defaultEmail} / ${defaultPassword}`);
    } else {
      console.log(`✓ Admin account already exists: ${defaultEmail}`);
    }

    // Seed sample inquiries if table is empty
    const countInquiries = await db.query('SELECT COUNT(*) as total FROM inquiries');
    if (parseInt(countInquiries.rows[0].total, 10) === 0) {
      console.log('Seeding sample inquiries for assessment testing...');
      const sampleInquiries = [
        ['Aarav Sharma', 'aarav.sharma@example.com', '+91 98765 43210', 'Student', 'Scholarship', 'I would like to inquire about merit-based scholarship criteria for high school STEM programs.', 'Pending'],
        ['Priya Desai', 'priya.desai@example.com', '+91 98111 22334', 'Parent', 'Admission', 'Seeking details regarding Grade 9 admission prerequisites, entrance assessment syllabus, and key deadlines.', 'In Review'],
        ['Delhi Public School - Sector 45', 'principal@dps45.edu.in', '+91 97234 56789', 'School', 'Concert', 'We are interested in booking passes and participating in the upcoming Annual Interschool EdTech Cultural Concert.', 'Contacted'],
        ['Rohan Verma', 'rohan.v@example.com', '+91 99887 76655', 'Student', 'General Query', 'Is the career counseling workshop accessible online or in-person only? Also request fee schedule.', 'Resolved'],
        ['Dr. Sunita Rao', 'sunita.rao@presidency.edu', '+91 91234 56780', 'School', 'Scholarship', 'Inquiring on institutional quota for economically weaker section scholarships for 20 qualified students.', 'Pending'],
        ['Meera Patel', 'meera.patel@example.com', '+91 98450 12345', 'Parent', 'General Query', 'Need clarification on bus transport routes for South Bengaluru residential areas.', 'In Review']
      ];

      for (const item of sampleInquiries) {
        await db.query(
          `INSERT INTO inquiries (name, email, phone, user_type, category, message, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          item
        );
      }
      console.log(`✓ Seeded ${sampleInquiries.length} sample inquiries`);
    } else {
      console.log(`✓ Inquiries table already contains ${countInquiries.rows[0].total} records`);
    }

    console.log('--- Database Initialization Complete ---');
    process.exit(0);
  } catch (error) {
    console.error('Database seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
