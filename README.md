# 🧭 CareerPath AI

> **Your AI-powered roadmap to the right career.**

CareerPath AI is a full-stack web application that helps engineering students discover technology career paths and generate personalized, step-by-step learning roadmaps based on their branch and interests.

---

## ✨ Features

- 🔐 **User Authentication** — Secure signup, login, logout with bcrypt password hashing and JWT tokens
- 🗺️ **Personalized Roadmaps** — 3-step wizard that generates a 6-stage learning roadmap
- 🔭 **Career Explorer** — Browse 8 tech career paths with searchable, filterable cards
- 📚 **Learning Resources** — Curated courses, docs, and platforms for every career
- 📱 **Fully Responsive** — Works on desktop, laptop, tablet, and mobile
- 🌙 **Dark Navy/Purple Theme** — Modern glassmorphism design with purple glow accents
- 💾 **JSON File Database** — Runs locally without MongoDB or any external database setup

---

## 🛠️ Technology Stack

| Layer        | Technology                   |
|-------------|------------------------------|
| Frontend    | HTML5, CSS3, Vanilla JS       |
| Backend     | Node.js, Express.js           |
| Database    | JSON File (`data/db.json`)    |
| Auth        | bcryptjs + JWT                |
| Icons       | Font Awesome 6                |

---

## 📁 Folder Structure

```
CareerPath-AI/
│
├── server.js              ← Express backend server
├── package.json           ← Node.js project config
├── README.md              ← This file
│
├── data/
│   └── db.json            ← JSON file database (users + roadmaps)
│
└── public/                ← Frontend (served by Express)
    ├── index.html         ← Home page
    ├── explore.html       ← Explore careers
    ├── roadmap.html       ← 3-step roadmap creator
    ├── roadmap-result.html← Roadmap display page
    ├── resources.html     ← Learning resources
    ├── about.html         ← About page
    ├── login.html         ← Login page
    ├── signup.html        ← Signup page
    ├── style.css          ← Global styles
    └── script.js          ← All frontend JS
```

---

## 🚀 Installation

### Prerequisites
- Node.js v16+ installed ([Download here](https://nodejs.org))
- A terminal (PowerShell, Command Prompt, or bash)

### Steps

**1. Navigate to the project folder:**
```bash
cd CareerPath-AI
```

**2. Install dependencies:**
```bash
npm install
```

---

## ▶️ How to Run

**Start the backend server:**
```bash
npm start
```

The server will print:
```
✅ CareerPath AI server running at http://localhost:5000
```

**Open the website:**

Open your browser and go to:
```
http://localhost:5000
```

> ⚠️ Do NOT open `index.html` directly from the file system (file://) — always use the server URL above so API calls work correctly.

---

## 🔌 API Endpoints

| Method | Endpoint               | Auth Required | Description                      |
|--------|------------------------|---------------|----------------------------------|
| GET    | `/api/health`          | No            | Check if server is running       |
| POST   | `/api/auth/signup`     | No            | Register a new user              |
| POST   | `/api/auth/login`      | No            | Login and receive JWT token      |
| GET    | `/api/auth/me`         | Yes           | Get current logged-in user       |
| POST   | `/api/roadmaps`        | Yes           | Generate and save a roadmap      |
| GET    | `/api/roadmaps`        | Yes           | Get all roadmaps for current user|
| GET    | `/api/roadmaps/latest` | Yes           | Get most recent roadmap          |
| DELETE | `/api/roadmaps/:id`    | Yes           | Delete a roadmap by ID           |

### Authentication Header
For protected routes, send:
```
Authorization: Bearer <your-jwt-token>
```

---

## 💾 Database Setup

No external database setup needed! The app uses a JSON file at `data/db.json`.

**Initial file:**
```json
{
  "users": [],
  "roadmaps": []
}
```

The file is automatically updated as users sign up and create roadmaps.

### For Production (MongoDB)
If you want MongoDB for production:
1. Install `mongoose`: `npm install mongoose`
2. Set environment variable: `MONGODB_URI=your-mongodb-connection-string`
3. Refactor the `readDB`/`writeDB` functions in `server.js` to use Mongoose models

---

## 🔒 Security

- Passwords are hashed with **bcrypt** (10 salt rounds) — never stored in plaintext
- JWT tokens expire in **7 days**
- Input validation on both frontend and backend
- Password hashes are **never** returned in API responses
- For production, set these environment variables:

```bash
JWT_SECRET=your-very-strong-secret-key
PORT=5000
```

---

## 🌐 Pages

| Page                  | URL                          | Description                        |
|-----------------------|------------------------------|------------------------------------|
| Home                  | `/`                          | Landing page with hero, stats, CTA |
| Explore Careers       | `/explore.html`              | Searchable career cards            |
| Create Roadmap        | `/roadmap.html`              | 3-step roadmap wizard              |
| Roadmap Result        | `/roadmap-result.html`       | Display generated roadmap          |
| Learning Resources    | `/resources.html`            | Curated resource library           |
| About                 | `/about.html`                | Mission, benefits, why us          |
| Login                 | `/login.html`                | User login form                    |
| Sign Up               | `/signup.html`               | User registration form             |

---

## 🐛 Troubleshooting

**Port already in use:**
```bash
# Kill process on port 5000
npx kill-port 5000
# Or change port in server.js (PORT variable)
```

**"Cannot GET /api/...":**
- Make sure you're accessing `http://localhost:5000`, not opening the file directly

**"Cannot find module 'express'":**
```bash
npm install
```

**Login doesn't work:**
- Check that the server is running (`npm start`)
- Make sure you signed up first at `/signup.html`

**Roadmap not showing:**
- You must be logged in to generate/view roadmaps
- Try generating a new roadmap from `/roadmap.html`

---

## 📄 License

MIT License — Free to use, modify, and share for educational purposes.

---

*Built with ❤️ for CSE students by CareerPath AI*










// //     Open http://localhost:5000 in your browser.
