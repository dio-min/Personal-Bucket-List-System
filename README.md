# Personal Bucket List System

A web application for creating, tracking, and completing personal bucket list goals. 

## Tech Stack

**Frontend (`client/`)**
- React 19 + Vite
- Firebase (Authentication)
- React Router
- Material UI (MUI) + HeroUI + Tailwind CSS
- Chart.js / react-chartjs-2 for progress/analytics visualizations
- GSAP / Motion for animation
- Axios for API calls

**Backend (`server/`)**
- Node.js + Express 5
- MongoDB with Mongoose
- Multer + Cloudinary for image uploads (avatars, completed-goal photos)
- dotenv for configuration
- CORS configured against a specific `FRONTEND_URL`

## Project Structure

```
Personal-Bucket-List-System/
├── client/
│   └── src/
│       ├── lib/
│       │   ├── firebase.js      # Firebase app/auth initialization
│       │   └── config.js
│       ├── pages/
│       │   ├── Login.jsx, Register.jsx, ForgetPassword.jsx, Logout.jsx
│       │   ├── Welcome.jsx, Navigate.jsx
│       │   ├── Dashboard.jsx / Dashboard/
│       │   └── User/            # Goal list, completed items, profile views
│       └── component/           # Shared UI components (BorderGlow, Particles, TextType, etc.)
└── server/
    ├── server.js                # Express app entry point
    ├── uploads/                  # Local upload storage
    └── src/
        ├── controllers/          # userController, goalController, completeController
        ├── models/                # User, Item (goal), Complete (completed goal)
        ├── routers/               # userRoutes, goalRoutes, completeRoutes
        ├── middleware/            # Multer upload config
        └── database/               # MongoDB connection setup
```

## Core Modules

| Module | Description |
|---|---|
| Auth (Firebase → MongoDB) | User signs in via Firebase; backend creates/looks up a matching MongoDB `User` document by `firebaseUid` |
| Users | Registration, login/sync, profile picture upload, username updates, soft delete |
| Goals ("Items") | Create bucket-list goals, fetch by title/ID, update goal details, update status (`in-progress` / `completed`) |
| Completed Goals | Mark a goal as completed with a photo, description, date, and rating; fetch completed goals per user |

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- A MongoDB database (local or Atlas)
- A Firebase project (Authentication enabled)
- A Cloudinary account (for image uploads)

### Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in `server/`:

```env
PORT=5050
MONGO_URI=your_mongodb_connection_string
FRONTEND_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

Run the server:

```bash
npm start
```

The server exposes a health check at `GET /health`.

### Frontend Setup

```bash
cd client
npm install
```

Configure Firebase in `client/src/lib/firebase.js` (or via environment variables, depending on your setup) with your Firebase project's web app credentials, then run:

```bash
npm run dev
```

The frontend will run on Vite's default port (typically `http://localhost:5173`) and communicate with the backend API.

## API Overview

| Base Route | Purpose |
|---|---|
| `/api/user` | Register, login/sync with Firebase UID, profile fetch, avatar upload, username update, soft delete, lookup email by username |
| `/api/goal` | Add a goal, fetch goals by title/ID, update goal details/status |
| `/api/complete` | Mark a goal as completed (with photo/rating), fetch completed goals for a user |
| `/health` | Basic server health check |

## Notes

- Every data record (`Item`, `Complete`) is scoped to a `firebaseUid`, so authorization for "whose data is this" is effectively delegated to whatever `firebaseUid` the client sends — a simplification appropriate for a school project, but worth noting if extending this toward production (a production version would verify Firebase ID tokens server-side rather than trusting a UID passed in the request body).
- This is an academic project intended to demonstrate integrating a third-party auth provider with a custom backend/data layer, not a production-ready deployment.

## Authors

School project developed for the Software Engineering course.
