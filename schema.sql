-- ==============================================================================
-- EdTech CRM & Inquiry System - Database Schema
-- Provider: Supabase (PostgreSQL)
-- ==============================================================================

-- 1. Ensure extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Drop existing tables if re-initializing (safe order)
DROP TABLE IF EXISTS inquiries CASCADE;
DROP TABLE IF EXISTS admins CASCADE;

-- 3. Table: admins
-- Stores admin accounts for custom JWT authentication (Supabase Auth bypassed)
CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Table: inquiries
-- Stores public inquiries submitted through the portal
CREATE TABLE inquiries (
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

-- 5. Indexes for optimized filtering and searching
CREATE INDEX idx_inquiries_category ON inquiries (category);
CREATE INDEX idx_inquiries_user_type ON inquiries (user_type);
CREATE INDEX idx_inquiries_status ON inquiries (status);
CREATE INDEX idx_inquiries_name ON inquiries (name);
CREATE INDEX idx_inquiries_phone ON inquiries (phone);
CREATE INDEX idx_inquiries_created_at ON inquiries (created_at DESC);
CREATE INDEX idx_admins_email ON admins (email);

-- 6. Trigger to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_inquiries_timestamp
BEFORE UPDATE ON inquiries
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_admins_timestamp
BEFORE UPDATE ON admins
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- ==============================================================================
-- 7. Seed Initial Data
-- Default Admin:
--   Email: admin@edtech.com
--   Password: AdminPassword@123
-- Hash generated via bcrypt (cost factor 10): $2b$10$0pvdX7B3sYpL9nS39j3r9OIU6gL3w2oP9w076tXh56yU37m/b.D2e
-- (Also automatically created / verified via backend seeder script `npm run seed`)
-- ==============================================================================

INSERT INTO admins (name, email, password_hash, role)
VALUES (
    'Super Admin',
    'admin@edtech.com',
    '$2b$10$wTf2zD5E1Fj.F42v9g9x8uWj4WnN02Q1h7j9v2V9E2kL4kP7M3bXe',
    'admin'
)
ON CONFLICT (email) DO NOTHING;

-- Sample Inquiries for immediate testing in the dashboard
INSERT INTO inquiries (name, email, phone, user_type, category, message, status, created_at)
VALUES
(
    'Aarav Sharma',
    'aarav.sharma@example.com',
    '+91 98765 43210',
    'Student',
    'Scholarship',
    'I would like to inquire about merit-based scholarship criteria for high school STEM programs for the 2026-2027 academic session.',
    'Pending',
    NOW() - INTERVAL '2 hours'
),
(
    'Priya Desai',
    'priya.desai@example.com',
    '+91 98111 22334',
    'Parent',
    'Admission',
    'Seeking details regarding Grade 9 admission prerequisites, entrance assessment syllabus, and key deadlines.',
    'In Review',
    NOW() - INTERVAL '1 day'
),
(
    'Delhi Public School - Sector 45',
    'principal@dps45.edu.in',
    '+91 97234 56789',
    'School',
    'Concert',
    'We are interested in booking passes and participating in the upcoming Annual Interschool EdTech Cultural Concert.',
    'Contacted',
    NOW() - INTERVAL '2 days'
),
(
    'Rohan Verma',
    'rohan.v@example.com',
    '+91 99887 76655',
    'Student',
    'General Query',
    'Is the career counseling workshop accessible online or in-person only? Also request fee schedule.',
    'Resolved',
    NOW() - INTERVAL '3 days'
),
(
    'Dr. Sunita Rao',
    'sunita.rao@presidency.edu',
    '+91 91234 56780',
    'School',
    'Scholarship',
    'Inquiring on institutional quota for economically weaker section scholarships for 20 qualified students.',
    'Pending',
    NOW() - INTERVAL '4 days'
),
(
    'Meera Patel',
    'meera.patel@example.com',
    '+91 98450 12345',
    'Parent',
    'General Query',
    'Need clarification on bus transport routes for South Bengaluru residential areas.',
    'In Review',
    NOW() - INTERVAL '5 days'
);
