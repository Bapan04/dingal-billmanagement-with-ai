# Dingal Institute - Billing & AI Management System

A comprehensive MERN-like stack (React, Node.js, Express) application powered by **Supabase (PostgreSQL)** and **Google's Gemini 2.5 AI**. This system is designed to streamline student admissions, course enrollments, automated fee management (including EMI tracking), PDF receipt generation, and intelligent financial insights.

## 🚀 Key Features

- **Student Management & Admissions**: Register students, assign courses, and track their complete profile.
- **Smart Payment Processing**: Handle full payments and installment (EMI) plans seamlessly.
- **Automated Billing**: Generates branded PDF receipts instantly upon payment and automatically emails them to students.
- **Dingal AI Analyzer (Powered by Gemini)**:
  - **Weekly Bill Review**: AI-driven analysis of the past 7 days' financial performance.
  - **Course Spending**: Intelligent insights on revenue generated per course.
  - **Popular Courses**: Ranking and marketing strategies for top-performing courses.
  - **Smart Bill Separation**: Categorizes raw payment records logically.
- **Secure Authentication**: Role-based access control using JWT and Supabase.

## 🛠 Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, React Router, Lucide React, React Markdown (for AI reports).
- **Backend**: Node.js, Express.js, Supabase JS Client, Nodemailer (Email), PDFKit (Receipts), Google Generative AI SDK.
- **Database**: Supabase (PostgreSQL)

## 📦 Installation & Setup

1. **Setup Environment Variables**:
   Create a `.env` file in the `backend/` directory:
   ```env
   PORT=5000
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_service_role_key
   JWT_SECRET=your_jwt_secret
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email
   SMTP_PASS=your_app_password
   GEMINI_API_KEY=your_gemini_api_key
   ```

2. **Run the application**:
   Start both the frontend and backend servers concurrently from the root directory:
   ```bash
   npm install
   npm run dev
   ```

## 📝 License
Proprietary software - Designed for Dingal Institute.
