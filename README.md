# 🚀 AI Idea-to-Startup Feasibility Predictor

An advanced AI-powered dashboard designed to help entrepreneurs validate their business concepts. This tool provides deep insights into the technical and market feasibility of a startup idea using Large Language Models (LLMs) and data-driven analysis.

## 🌟 Key Features

1. **Secure Authentication**: Multi-step signup with Supabase OTP verification and Google OAuth integration.

2. **Intelligent Idea Submission**: Submit ideas via descriptive text or by uploading business documents (PDF/DOCX).

3. **AI Feasibility Score**: Generates a comprehensive score based on market trends, technical requirements, and execution risks.

4. **Dynamic Visualizations**: View feasibility data through interactive Radar Charts and Tech Stack breakdowns.

5. **Password Recovery**: Secure OTP-based password reset flow ensuring high account security.

6. **User Profiles**: Manage personal information and upload custom avatars.

## 🛠️ Tech Stack

### Frontend:
1. **Framework**: React.js (Vite)
2. **Routing**: React Router DOM
3. **State Management**: React Hooks (useState, useEffect)
4. **Styling**: Custom CSS3 (Modern Dark Theme)

### Backend:
1. **Environment**: Node.js & Express
2. **Database**: MongoDB & Mongoose
3. **Authentication**: Passport.js & Bcrypt.js
4. **Communication**: Supabase (Email OTP & Password Recovery)
5. **File Handling**: Multer (Avatar & Document uploads)

## 📂 Project Structure

```
idea-to-startup/                                         # Root Project Folder
├── README.md                                            # Documentation and Project Overview
├── .gitignore                                           # Ignored files (node_modules, .env, etc.)
└── startup/                                             # Main Source Code Folder
    ├── backend/                                         # Node.js & Express API Server
    │   ├── config/                                      # Configuration Files
    │   │   ├── emailConfig.js                           # Supabase/SMTP Configuration
    │   │   └── passport.js                              # Google & Local Auth Strategies
    │   ├── controllers/                                 # Request Handling Logic
    │   │   ├── authController.js                        # Logic for Signup & Login
    │   │   ├── otpController.js                         # Logic for OTP Generation/Verification
    │   │   ├── resetPassword.js                         # Logic for Password Reset Comparison
    │   │   └── uploadController.js                      # Logic for Document/Avatar Uploads
    │   ├── models/                                      # Database Schemas (MongoDB/Mongoose)
    │   │   ├── Feasibility.js                           # AI Analysis Schema
    │   │   └── User.js                                  # User Profile & Auth Schema
    │   ├── routes/                                      # API Route Definitions
    │   │   ├── auth.js                                  # Authentication Endpoints
    │   │   ├── feasibility.js                           # AI Analysis Endpoints
    │   │   └── uploadRoutes.js                          # File Upload Endpoints
    │   ├── uploads/                                     # Local File Storage
    │   │   └── avatars/                                 # User Profile Pictures
    │   ├── utils/                                       # Shared Utility Functions
    │   │   └── downloadPdf.js                           # PDF Generation Utility
    │   ├── .env                                         # Server Environment Variables (Private)
    │   ├── server.js                                    # Main Entry Point for Backend
    │   └── package.json                                 # Backend Dependencies & Scripts
    │
    └── frontend/                                        # React.js Client (Vite)
        ├── public/                                      # Static Assets (Publicly accessible)
        │   ├── _redirects                               # Routing rules for SPA hosting
        │   ├── logo.png                                 # App Logo
        │   └── feasibility-template.png
        ├── src/                                         # Application Source Code
        │   ├── assets/                                  # Static media (Images, Fonts)
        │   ├── components/                              # Reusable UI Modules
        │   │   ├── AuthRoutes.jsx                       # Private/Public Route Guards
        │   │   ├── DeepAnalysis.jsx                     # AI Detail Component
        │   │   ├── FeasibilityRadar.jsx                 # Visualization Component
        │   │   └── FeasibilityTechStack.jsx
        │   ├── pages/                                   # Main Application Screens
        │   │   ├── Homepage.jsx                         # Landing Page
        │   │   ├── Signup.jsx                           # Registration Flow
        │   │   ├── Login.jsx                            # Login Screen
        │   │   ├── VerifyOtp.jsx                        # OTP Verification Screen
        │   │   ├── ForgotPassword.jsx                   # OTP Request Screen
        │   │   ├── ResetPassword.jsx                    # New Password Entry Screen
        │   │   ├── SelectionPage.jsx                    # Method Selection Screen
        │   │   ├── IdeaSubmission.jsx                   # Text Input Screen
        │   │   ├── UploadDocument.jsx                   # File Upload Screen
        │   │   ├── Feasibility.jsx                      # Results/Analysis Screen
        │   │   └── Profile.jsx                          # User Account Settings
        │   ├── services/                                # API Communication Layer
        │   │   └── feasibilityApi.js                    # Axios/Fetch API Wrappers
        │   ├── styles/                                  # Global and Component Styling
        │   │   ├── Feasibility.css                      # Analysis Screen Styles
        │   │   ├── ForgotPassword.css 
        │   │   ├── Login.css                            # Shared Auth Styles
        │   │   ├── ResetPassword.css
        │   │   └── FeasibilityReport.css
        │   ├── App.jsx                                  # Main Component & Router Setup
        │   ├── main.jsx                                 # React Entry Point
        │   ├── index.css                                # Base Styles (Tailwind/Reset)
        │   └── App.css                                  # Main Layout Styles
        ├── .env                                         # Frontend Environment Variables
        └── package.json                                 # Frontend Dependencies & Scripts
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas or Local Instance
- Supabase Project (for Authentication & OTP)

### Installation

#### Clone the Repository
```bash
git clone https://github.com/your-username/idea-to-startup.git
cd idea-to-startup/startup
```

#### Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SESSION_SECRET=your_secret_key
```

Start the server:
```bash
npm start
```

#### Frontend Setup
```bash
cd ../frontend
npm install
```

Create a `.env` file in `frontend/`:
```
VITE_API_BASE_URL=http://localhost:5000
```

Start the client:
```bash
npm run dev
```

## 🔒 Security & Auth Flow

1. The application implements a robust security architecture:
2. **Password Hashing**: All manual passwords are encrypted using bcrypt before database storage.
3. **OTP Verification**: Signup and Password Reset are protected by 6-digit OTP codes sent via Supabase.
4. **State Inheritance**: Reset flows pass verification data through React Router state to prevent unauthorized URL access.
5. **Duplicate Prevention**: Backend logic prevents users from resetting passwords to their current existing password.

## 🤝 Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request