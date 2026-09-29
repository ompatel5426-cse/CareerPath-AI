/**
 * CareerPath AI - Backend Server
 * Node.js + Express with JSON file database
 * Run: npm install && npm start
 * Then open: http://localhost:5000
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// JWT secret - use environment variable in production
const JWT_SECRET = process.env.JWT_SECRET || 'careerpath-ai-secret-key-2024';

// Path to JSON database file
const DB_PATH = path.join(__dirname, 'data', 'db.json');

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── Database Helpers ──────────────────────────────────────────────────────────

/** Read the JSON database */
function readDB() {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return { users: [], roadmaps: [] };
  }
}

/** Write to the JSON database */
function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
}

// ─── Auth Middleware ───────────────────────────────────────────────────────────

/** Verify JWT token and attach user to request */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required. Please login.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token. Please login again.' });
  }
}

// ─── Roadmap Generation Logic ─────────────────────────────────────────────────

/**
 * Generate a personalized roadmap based on branch and selected interests.
 * Returns an array of stages with titles, descriptions, and skills.
 */
function generateRoadmap(branch, interests) {
  // Base skills every CS student needs
  const baseSkills = {
    title: 'Stage 1: Programming Fundamentals',
    description: 'Build a solid foundation in programming logic and computer science basics.',
    skills: ['C / C++ Basics', 'Data Structures', 'Algorithms', 'Problem Solving', 'Git & GitHub', 'Linux Basics']
  };

  // Interest-specific skill sets
  const interestMap = {
    'Web Development': {
      core: ['HTML5', 'CSS3', 'JavaScript (ES6+)', 'Responsive Design', 'Git/GitHub'],
      advanced: ['React.js / Vue.js', 'Node.js + Express', 'MongoDB / MySQL', 'REST APIs', 'Deployment (Netlify/Vercel)'],
      projects: ['Portfolio Website', 'Full-Stack Blog App', 'E-Commerce Frontend', 'REST API Backend']
    },
    'AI / Machine Learning': {
      core: ['Python', 'NumPy & Pandas', 'Matplotlib / Seaborn', 'Statistics & Probability', 'Linear Algebra'],
      advanced: ['Machine Learning (Scikit-learn)', 'Deep Learning (TensorFlow/PyTorch)', 'NLP Basics', 'Model Deployment'],
      projects: ['Sentiment Analysis', 'Image Classifier', 'Price Prediction Model', 'Chatbot']
    },
    'Data Science': {
      core: ['Python', 'SQL', 'Excel/Sheets', 'Pandas & NumPy', 'Data Visualization'],
      advanced: ['Power BI / Tableau', 'Machine Learning', 'Big Data (Spark)', 'Statistical Analysis'],
      projects: ['Sales Dashboard', 'EDA Project', 'Predictive Analytics', 'Data Pipeline']
    },
    'Cybersecurity': {
      core: ['Networking Fundamentals', 'Linux & CLI', 'Python Scripting', 'Security Concepts', 'Cryptography'],
      advanced: ['Ethical Hacking', 'Web Security (OWASP)', 'Penetration Testing', 'Security Tools (Wireshark, Nmap)', 'Certifications (CEH/CompTIA)'],
      projects: ['Network Scanner', 'CTF Challenges', 'Vulnerability Assessment', 'Security Audit Report']
    },
    'App Development': {
      core: ['Java / Kotlin (Android) or Swift (iOS)', 'UI/UX Basics', 'XML Layouts / SwiftUI', 'APIs & Networking'],
      advanced: ['React Native / Flutter', 'Firebase', 'App Store Deployment', 'Push Notifications', 'Authentication'],
      projects: ['To-Do App', 'Weather App', 'Chat App', 'E-Commerce Mobile App']
    },
    'Cloud Computing': {
      core: ['Networking Basics', 'Linux', 'Virtualization', 'AWS / Azure / GCP Fundamentals', 'Docker'],
      advanced: ['Kubernetes', 'Terraform (IaC)', 'CI/CD Pipelines', 'Microservices', 'Cloud Security'],
      projects: ['Deploy a Web App to AWS', 'Containerized App with Docker', 'Auto-Scaling Setup', 'Cloud Cost Optimization']
    },
    'Competitive Programming': {
      core: ['C++ STL', 'Arrays & Strings', 'Sorting & Searching', 'Recursion & Backtracking', 'Greedy Algorithms'],
      advanced: ['Dynamic Programming', 'Graph Algorithms', 'Trees & Heaps', 'Segment Trees', 'Number Theory'],
      projects: ['LeetCode Top 150', 'Codeforces Div 2', 'ICPC Practice', 'HackerRank Certifications']
    },
    'Game Development': {
      core: ['C# / C++', 'Unity / Unreal Engine Basics', 'Game Physics', '2D/3D Math', 'Game Design Principles'],
      advanced: ['Shader Programming', 'AI in Games', 'Multiplayer Networking', 'Asset Optimization', 'Publishing on Steam/Play Store'],
      projects: ['Platformer Game', '2D Puzzle Game', 'Endless Runner', '3D Exploration Game']
    }
  };

  const stages = [];

  // Stage 1: Always include fundamentals
  stages.push(baseSkills);

  // Stage 2: Core technologies for each interest
  const coreSkills = [];
  interests.forEach(interest => {
    if (interestMap[interest]) {
      coreSkills.push(...interestMap[interest].core);
    }
  });
  stages.push({
    title: 'Stage 2: Core Technologies',
    description: `Master the core technologies for your selected paths: ${interests.join(', ')}.`,
    skills: [...new Set(coreSkills)] // Remove duplicates
  });

  // Stage 3: Projects
  const projectSkills = [];
  interests.forEach(interest => {
    if (interestMap[interest]) {
      projectSkills.push(...interestMap[interest].projects);
    }
  });
  stages.push({
    title: 'Stage 3: Build Projects',
    description: 'Apply your skills by building real-world projects. Projects are essential for your portfolio.',
    skills: projectSkills.slice(0, 8) // Limit to 8 projects
  });

  // Stage 4: Advanced skills
  const advancedSkills = [];
  interests.forEach(interest => {
    if (interestMap[interest]) {
      advancedSkills.push(...interestMap[interest].advanced);
    }
  });
  stages.push({
    title: 'Stage 4: Advanced Skills',
    description: 'Level up with advanced concepts and industry-level tools.',
    skills: [...new Set(advancedSkills)]
  });

  // Stage 5: Internship & Portfolio
  stages.push({
    title: 'Stage 5: Internship & Portfolio',
    description: 'Build a professional portfolio and gain real experience through internships.',
    skills: [
      'Create GitHub Portfolio',
      'Build Personal Website',
      'Write Technical Blog Posts',
      'Contribute to Open Source',
      'Apply for Internships',
      'LinkedIn Profile Optimization',
      'Build 3-5 Showcase Projects'
    ]
  });

  // Stage 6: Job Preparation
  stages.push({
    title: 'Stage 6: Job Preparation',
    description: 'Prepare for placements and job applications with targeted preparation.',
    skills: [
      'DSA Practice (LeetCode/HackerRank)',
      'System Design Basics',
      'Mock Interviews',
      'Resume Building',
      'Aptitude & Reasoning',
      'Communication Skills',
      'Company-Specific Preparation',
      'Networking & Referrals'
    ]
  });

  return stages;
}

// ─── API Routes ────────────────────────────────────────────────────────────────

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'CareerPath AI server is running!', timestamp: new Date().toISOString() });
});

// ── Auth: Signup ──
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }
    if (name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Name must be at least 2 characters.' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const db = readDB();

    // Check if email already exists
    const existingUser = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = {
      id: uuidv4(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    writeDB(db);

    res.status(201).json({ success: true, message: 'Account created successfully! Please login.' });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// ── Auth: Login ──
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const db = readDB();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Generate JWT token (expires in 7 days)
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// ── Auth: Get Current User ──
app.get('/api/auth/me', authMiddleware, (req, res) => {
  const db = readDB();
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }
  // Never return password hash
  res.json({
    success: true,
    user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt }
  });
});

// ── Roadmaps: Create ──
app.post('/api/roadmaps', authMiddleware, (req, res) => {
  try {
    const { branch, interests } = req.body;

    if (!branch || !interests || !Array.isArray(interests) || interests.length === 0) {
      return res.status(400).json({ success: false, message: 'Branch and at least one interest are required.' });
    }

    const roadmapData = generateRoadmap(branch, interests);

    const db = readDB();
    const newRoadmap = {
      id: uuidv4(),
      userId: req.user.id,
      userName: req.user.name,
      branch,
      interests,
      roadmap: roadmapData,
      createdAt: new Date().toISOString()
    };

    db.roadmaps.push(newRoadmap);
    writeDB(db);

    res.status(201).json({ success: true, message: 'Roadmap generated successfully!', roadmap: newRoadmap });
  } catch (err) {
    console.error('Roadmap creation error:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// ── Roadmaps: Get All for User ──
app.get('/api/roadmaps', authMiddleware, (req, res) => {
  const db = readDB();
  const userRoadmaps = db.roadmaps
    .filter(r => r.userId === req.user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ success: true, roadmaps: userRoadmaps });
});

// ── Roadmaps: Get Latest ──
app.get('/api/roadmaps/latest', authMiddleware, (req, res) => {
  const db = readDB();
  const userRoadmaps = db.roadmaps
    .filter(r => r.userId === req.user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (userRoadmaps.length === 0) {
    return res.status(404).json({ success: false, message: 'No roadmaps found.' });
  }

  res.json({ success: true, roadmap: userRoadmaps[0] });
});

// ── Roadmaps: Delete ──
app.delete('/api/roadmaps/:id', authMiddleware, (req, res) => {
  const db = readDB();
  const index = db.roadmaps.findIndex(r => r.id === req.params.id && r.userId === req.user.id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Roadmap not found.' });
  }

  db.roadmaps.splice(index, 1);
  writeDB(db);
  res.json({ success: true, message: 'Roadmap deleted successfully.' });
});

// ─── Serve Frontend Pages ──────────────────────────────────────────────────────

// All non-API routes serve the frontend (SPA-style fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── Start Server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✅ CareerPath AI server running at http://localhost:${PORT}`);
  console.log(`📂 Serving frontend from: ${path.join(__dirname, 'public')}`);
  console.log(`💾 Database: ${DB_PATH}`);
  console.log(`\nOpen http://localhost:${PORT} in your browser.\n`);
});
