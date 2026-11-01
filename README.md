# 🎓 EdTech CRM & Inquiry System

A full-stack, responsive CRM and inquiry management platform for educational institutions, parents, students, and schools. Anyone can submit inquiries across different categories and user types, and administrators can securely manage, search, filter, and track tickets through a custom JWT-protected dashboard connected directly to a **Supabase PostgreSQL** database.

---

## 📌 Assessment Highlights & Constraints Satisfied

- **Frontend**: Modern React 18, Vite, Tailwind CSS, Lucide icons.
- **Backend**: Node.js & Express REST API with standard PostgreSQL client (`pg`).
- **Database**: Supabase PostgreSQL connected via standard connection strings with SSL support.
- **Custom Authentication**: Implemented from scratch using `bcryptjs` password hashing, signed `jsonwebtoken` (JWT), and custom protected middleware. **Strictly bypassed Supabase Auth as mandated in the assessment instructions.**
- **Public Inquiry Form**: Clean, validated submission form with User Type (`Parent`, `Student`, `School`) and Category (`Scholarship`, `Concert`, `Admission`, `General Query`).
- **Admin Dashboard**: Tabular view displaying all submitted inquiries with Name, Phone, Email, User Type, Category, Date, and Status.
- **Filters & Search**: Mandatory filters by Category, User Type, and real-time Search by Name or Phone number.

---

## 🏗️ Architecture & Tech Stack

```
                     ┌─────────────────────────────────────────┐
                     │            React Frontend               │
                     │  - Public Inquiry Form                  │
                     │  - Admin Login (JWT stored in Local)    │
                     │  - Protected Admin CRM Dashboard        │
                     │  - Live Filters & Search Bar            │
                     └────────────────────┬────────────────────┘
                                          │ HTTP / Bearer JWT
                                          ▼
                     ┌─────────────────────────────────────────┐
                     │             Express Backend             │
                     │  - POST /api/inquiries (Public)         │
                     │  - POST /api/auth/login (Custom Auth)   │
                     │  - GET  /api/inquiries (Protected)      │
                     │  - PATCH /api/inquiries/:id/status      │
                     │  - GET  /api/inquiries/stats            │
                     │  - Middleware: authenticateToken        │
                     └────────────────────┬────────────────────┘
                                          │ pg Pool (SSL enabled)
                                          ▼
                     ┌─────────────────────────────────────────┐
                     │       Supabase (PostgreSQL)             │
                     │  - Table: admins (bcrypt hash)          │
                     │  - Table: inquiries (Indexed)           │
                     └─────────────────────────────────────────┘
```

---

## 📁 Repository Structure

```
.
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # PostgreSQL connection pool with Supabase SSL handling
│   │   ├── controllers/
│   │   │   ├── authController.js     # Admin custom login, profile, register
│   │   │   └── inquiryController.js  # Inquiries CRUD, filters, search, analytics stats
│   │   ├── middleware/
│   │   │   └── authMiddleware.js     # Custom JWT verification middleware (scratch implementation)
│   │   ├── routes/
│   │   │   ├── authRoutes.js         # /api/auth routes
│   │   │   └── inquiryRoutes.js      # /api/inquiries routes
│   │   ├── scripts/
│   │   │   └── seed.js               # Auto-creates tables and seeds default admin & records
│   │   └── server.js                 # Express server entry point
│   ├── .env.example                  # Backend environment template
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx            # Brand navigation, session state & logout
│   │   │   ├── PublicInquiryForm.jsx # Public responsive inquiry form
│   │   │   ├── AdminLogin.jsx        # Admin custom JWT modal with 1-click test credentials
│   │   │   ├── AdminDashboard.jsx    # Inquiry management, metrics cards, CSV export
│   │   │   ├── FilterBar.jsx         # Mandatory Category, User Type & Search filters
│   │   │   ├── InquiryTable.jsx      # Mandatory Tabular view with status selector
│   │   │   └── InquiryDetailModal.jsx# Full message inspection & remarks updater
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Custom JWT auth provider
│   │   ├── services/
│   │   │   └── api.js                # Axios client with Authorization: Bearer interceptor
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example                  # Frontend environment template
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── schema.sql                        # SQL DDL script for Supabase SQL Editor
├── .env.example                      # Root centralized environment variables template
└── README.md                         # Detailed documentation and setup guide
```

---

## 🗄️ Database Setup (Supabase PostgreSQL)

1. Log into your [Supabase Dashboard](https://supabase.com).
2. Create a new project (e.g. `edtech-crm`).
3. Open the **SQL Editor** from the left sidebar.
4. Copy the entire contents of [`schema.sql`](./schema.sql) and click **Run**.
   - This creates the `admins` and `inquiries` tables, indexes, triggers, and default test data.
5. In Supabase, navigate to **Project Settings** -> **Database**.
6. Scroll down to **Connection string** and select **URI** (or **Nodejs**).
   - Format:
     ```
     postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
     ```
   - Alternatively, you can use the connection pooler URL (port 6543).

---

## ⚙️ Environment Variables Configuration

### 1. Root & Backend Configuration
Copy `.env.example` in `backend/` to `backend/.env`:
```bash
cp backend/.env.example backend/.env
```

Configure your `backend/.env` with your Supabase connection string and custom JWT secret:
```env
PORT=5000
NODE_ENV=development

# Paste your Supabase Database URI
DATABASE_URL=postgresql://postgres:YourActualPassword@db.yourprojectref.supabase.co:5432/postgres

# Custom JWT Authentication (Supabase Auth bypassed)
JWT_SECRET=super_secret_jwt_edtech_crm_key_assessment_2026_replace_in_prod
JWT_EXPIRES_IN=24h

# Allowed Client Origin
CLIENT_URL=http://localhost:5173

# Default Admin Credentials
ADMIN_DEFAULT_EMAIL=admin@edtech.com
ADMIN_DEFAULT_PASSWORD=AdminPassword@123
```

### 2. Frontend Configuration
Copy `frontend/.env.example` to `frontend/.env`:
```bash
cp frontend/.env.example frontend/.env
```
Default content:
```env
VITE_API_BASE_URL=/api
```

---

## 🚀 Running the Application Locally

### Step 1: Install Dependencies
Open two terminal windows (or run commands sequentially):

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Seed the Database (Optional if you already ran schema.sql)
```bash
cd backend
npm run seed
```
This script checks the database tables and creates the default admin user (`admin@edtech.com` / `AdminPassword@123`) and initial sample inquiries.

### Step 3: Start the Backend Server
```bash
cd backend
npm run dev
# or npm start
```
The server will start at: `http://localhost:5000`

### Step 4: Start the Frontend Application
```bash
cd frontend
npm run dev
```
The frontend will start at: `http://localhost:5173`

---

## 🧪 How to Test the Custom JWT Authentication

As specified in the assessment requirements:
> *"Candidate must implement custom JWT-based authentication from scratch in their backend (password hashing using bcrypt, JWT generation, and protected routes middleware. Using Supabase Auth is not allowed for this assessment"*

Here is how you can verify and test this:

### Default Admin Credentials
- **Email**: `admin@edtech.com`
- **Password**: `AdminPassword@123`

### 1. Test via cURL / Postman (Direct Backend API)

#### A. Attempt to access protected dashboard endpoint without a token (Expect 401 Unauthorized):
```bash
curl -X GET http://localhost:5000/api/inquiries
```
**Response:**
```json
{
  "success": false,
  "message": "Access denied. No authorization header provided. Please login as admin."
}
```

#### B. Admin Login to receive custom JWT:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@edtech.com",
    "password": "AdminPassword@123"
  }'
```
**Response:**
```json
{
  "success": true,
  "message": "Admin authentication successful.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": 1,
    "name": "Super Admin",
    "email": "admin@edtech.com",
    "role": "admin"
  }
}
```

#### C. Access protected inquiries list using the returned Bearer Token:
```bash
curl -X GET "http://localhost:5000/api/inquiries" \
  -H "Authorization: Bearer <PASTE_YOUR_JWT_TOKEN_HERE>"
```
**Response:** Returns all inquiries directly from Supabase PostgreSQL!

#### D. Test Filters and Search parameters via API:
- Filter by Category:
  ```bash
  curl -X GET "http://localhost:5000/api/inquiries?category=Scholarship" \
    -H "Authorization: Bearer <TOKEN>"
  ```
- Filter by User Type:
  ```bash
  curl -X GET "http://localhost:5000/api/inquiries?user_type=Parent" \
    -H "Authorization: Bearer <TOKEN>"
  ```
- Search by Name or Phone:
  ```bash
  curl -X GET "http://localhost:5000/api/inquiries?search=Sharma" \
    -H "Authorization: Bearer <TOKEN>"
  ```

---

## 🖥️ Testing the Web UI Workflow

1. **Submit Public Inquiry**:
   - Navigate to `http://localhost:5173`.
   - Fill in User Type (`Parent`, `Student`, `School`).
   - Select Category (`Scholarship`, `Concert`, `Admission`, `General Query`).
   - Enter Name, Email, Phone number, and your Query message.
   - Click **Submit Inquiry**. The submission is stored directly in Supabase PostgreSQL, and an inquiry reference ID is displayed.
2. **Access Admin Portal**:
   - Click **Admin Dashboard** or **Admin Login** in the top navigation.
   - Enter `admin@edtech.com` and `AdminPassword@123` (or click the convenient **Auto-fill** button).
   - Click **Sign In to Dashboard**.
3. **Verify Dashboard Features**:
   - **Metrics Bar**: Live counts for total inquiries and breakdowns by Student, Parent, and School.
   - **Tabular View**: Shows Name, Phone, Email, User Type, Category, Date, and Status for each inquiry.
   - **Filters**: Select different categories and user types to filter inquiries.
   - **Search Bar**: Type any student/parent name or phone number to filter instantly.
   - **Status Management**: Change the status of an inquiry inline (e.g. `Pending` -> `In Review` -> `Resolved`).
   - **Detail Modal**: Click any table row to view the full query text and save internal counselor remarks.
   - **Export**: Click **Export CSV** to download inquiries as a spreadsheet.

---

## 🌐 Deployment Guide (Live Demo Link)

### Backend Deployment (Render / Railway)
1. Push the code to a GitHub repository.
2. In Render, create a new **Web Service** and connect your repository.
3. Set **Root Directory** to `backend`.
4. Set **Build Command** to `npm install`.
5. Set **Start Command** to `npm start`.
6. Add the following Environment Variables in Render:
   - `DATABASE_URL`: Your Supabase connection string.
   - `JWT_SECRET`: A secure random secret.
   - `CLIENT_URL`: Your deployed frontend Vercel URL.
   - `PORT`: `5000`.

### Frontend Deployment (Vercel / Netlify)
1. In Vercel, import the same GitHub repository.
2. Set **Root Directory** to `frontend`.
3. Set **Framework Preset** to `Vite`.
4. Add Environment Variable:
   - `VITE_API_BASE_URL`: `https://your-backend-app.onrender.com/api`
5. Deploy!
