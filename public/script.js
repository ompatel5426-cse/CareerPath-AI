/**
 * CareerPath AI - Main Frontend Script
 * Handles: Auth, Navigation, Search, Filters, Roadmap Steps, API calls
 */

// ─── API Base URL ────────────────────────────────────────────────────────────
const API_BASE = '/api';

// ─── Auth Helpers ─────────────────────────────────────────────────────────────

/** Save auth token and user info to localStorage */
function saveAuth(token, user) {
  localStorage.setItem('cp_token', token);
  localStorage.setItem('cp_user', JSON.stringify(user));
}

/** Get stored token */
function getToken() {
  return localStorage.getItem('cp_token');
}

/** Get stored user */
function getUser() {
  const raw = localStorage.getItem('cp_user');
  try { return raw ? JSON.parse(raw) : null; } catch { return null; }
}

/** Check if user is logged in */
function isLoggedIn() {
  return !!getToken();
}

/** Logout: clear storage and redirect */
function logout() {
  localStorage.removeItem('cp_token');
  localStorage.removeItem('cp_user');
  localStorage.removeItem('cp_roadmap_draft');
  showToast('Logged out successfully.', 'success');
  setTimeout(() => { window.location.href = '/index.html'; }, 600);
}

// ─── API Request Helper ───────────────────────────────────────────────────────

/**
 * Make an API request.
 * @param {string} endpoint - API path (e.g. '/auth/login')
 * @param {object} options  - fetch options
 */
async function apiRequest(endpoint, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });
  const data = await response.json();
  return { ok: response.ok, status: response.status, data };
}

// ─── Toast Notifications ──────────────────────────────────────────────────────

/** Show a toast notification */
function showToast(message, type = 'info', duration = 3500) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = '0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

/** Update navbar based on login state */
function updateNavbar() {
  const user = getUser();
  const navLoginBtn = document.getElementById('navLoginBtn');
  const navSignupBtn = document.getElementById('navSignupBtn');
  const navUserArea = document.getElementById('navUserArea');
  const navUserName = document.getElementById('navUserName');
  const navLogoutBtn = document.getElementById('navLogoutBtn');

  if (user && isLoggedIn()) {
    // Show user info, hide login/signup
    if (navLoginBtn) navLoginBtn.style.display = 'none';
    if (navSignupBtn) navSignupBtn.style.display = 'none';
    if (navUserArea) navUserArea.style.display = 'flex';
    if (navLogoutBtn) navLogoutBtn.style.display = '';
    if (navUserName) navUserName.textContent = user.name.split(' ')[0]; // First name only
  } else {
    // Show login/signup, hide user area
    if (navLoginBtn) navLoginBtn.style.display = '';
    if (navSignupBtn) navSignupBtn.style.display = '';
    if (navUserArea) navUserArea.style.display = 'none';
    if (navLogoutBtn) navLogoutBtn.style.display = 'none';
  }

  // Attach logout handler (once, using onclick attribute already set in HTML as fallback)
  if (navLogoutBtn && !navLogoutBtn.dataset.listenerAdded) {
    navLogoutBtn.dataset.listenerAdded = 'true';
    navLogoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  }
}

/** Set active nav link based on current page */
function setActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href') || '';
    const linkPage = href.split('/').pop();
    if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/** Navbar scroll effect */
function initNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });
}

/** Mobile hamburger menu */
function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  const navActions = document.getElementById('navActions');

  if (!hamburger) return;

  hamburger.addEventListener('click', () => {
    navLinks?.classList.toggle('open');
    navActions?.classList.toggle('open');
  });

  // Close menu when a link is clicked
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks?.classList.remove('open');
      navActions?.classList.remove('open');
    });
  });
}

// ─── Animate on Scroll ────────────────────────────────────────────────────────

function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.card, .career-card, .step-card, .resource-card, .benefit-card, .stat-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });
}

// ─── Form Helpers ─────────────────────────────────────────────────────────────

/** Show error message below a field */
function showFieldError(fieldId, message) {
  const errEl = document.getElementById(fieldId + 'Error');
  if (errEl) { errEl.textContent = message; errEl.classList.add('visible'); }
}

/** Clear all field errors */
function clearErrors(formId) {
  document.querySelectorAll(`#${formId} .form-error`).forEach(el => {
    el.classList.remove('visible');
    el.textContent = '';
  });
}

/** Show/hide alert banner */
function showAlert(alertId, message, type = 'error') {
  const el = document.getElementById(alertId);
  if (!el) return;
  el.textContent = message;
  el.className = `alert alert-${type} visible`;
}
function hideAlert(alertId) {
  const el = document.getElementById(alertId);
  if (el) el.classList.remove('visible');
}

/** Toggle password visibility */
function initPasswordToggle(inputId, toggleId) {
  const input = document.getElementById(inputId);
  const toggle = document.getElementById(toggleId);
  if (!input || !toggle) return;
  toggle.addEventListener('click', () => {
    const isText = input.type === 'text';
    input.type = isText ? 'password' : 'text';
    toggle.querySelector('i').className = isText ? 'fas fa-eye' : 'fas fa-eye-slash';
  });
}

// ─── Signup Page ──────────────────────────────────────────────────────────────

function initSignupPage() {
  if (!document.getElementById('signupForm')) return;

  initPasswordToggle('signupPassword', 'togglePassword');
  initPasswordToggle('signupConfirm', 'toggleConfirm');

  document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors('signupForm');
    hideAlert('signupAlert');

    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirm = document.getElementById('signupConfirm').value;

    // Validate
    let hasError = false;
    if (!name || name.length < 2) {
      showFieldError('signupName', 'Please enter your full name (min 2 characters).');
      hasError = true;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      showFieldError('signupEmail', 'Please enter a valid email address.');
      hasError = true;
    }
    if (!password || password.length < 6) {
      showFieldError('signupPassword', 'Password must be at least 6 characters.');
      hasError = true;
    }
    if (password !== confirm) {
      showFieldError('signupConfirm', 'Passwords do not match.');
      hasError = true;
    }
    if (hasError) return;

    // Submit
    const submitBtn = document.getElementById('signupSubmitBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Creating Account...';

    try {
      const { ok, data } = await apiRequest('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
      });

      if (ok) {
        showAlert('signupAlert', 'Account created! Redirecting to login...', 'success');
        setTimeout(() => { window.location.href = '/login.html'; }, 1800);
      } else {
        showAlert('signupAlert', data.message || 'Signup failed. Please try again.', 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';
      }
    } catch (err) {
      showAlert('signupAlert', 'Connection error. Is the server running?', 'error');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';
    }
  });
}

// ─── Login Page ───────────────────────────────────────────────────────────────

function initLoginPage() {
  if (!document.getElementById('loginForm')) return;

  // Redirect if already logged in
  if (isLoggedIn()) { window.location.href = '/index.html'; return; }

  initPasswordToggle('loginPassword', 'toggleLoginPassword');

  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors('loginForm');
    hideAlert('loginAlert');

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
      showAlert('loginAlert', 'Please enter your email and password.', 'error');
      return;
    }

    const submitBtn = document.getElementById('loginSubmitBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Logging in...';

    try {
      const { ok, data } = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      if (ok) {
        saveAuth(data.token, data.user);
        showAlert('loginAlert', 'Login successful! Redirecting...', 'success');
        setTimeout(() => { window.location.href = '/index.html'; }, 1000);
      } else {
        showAlert('loginAlert', data.message || 'Login failed. Check your credentials.', 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
      }
    } catch (err) {
      showAlert('loginAlert', 'Connection error. Is the server running?', 'error');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
    }
  });
}

// ─── Explore Careers Page ─────────────────────────────────────────────────────

function initExplorePage() {
  const searchInput = document.getElementById('careerSearch');
  const filterTabs = document.querySelectorAll('.filter-tab');
  const cards = document.querySelectorAll('.career-card');
  const noResults = document.getElementById('noResults');

  if (!searchInput) return;

  let activeFilter = 'all';
  let searchTerm = '';

  function filterCards() {
    let visible = 0;
    cards.forEach(card => {
      const category = card.dataset.category || '';
      const text = card.textContent.toLowerCase();
      const matchesFilter = activeFilter === 'all' || category === activeFilter;
      const matchesSearch = !searchTerm || text.includes(searchTerm);
      const show = matchesFilter && matchesSearch;
      card.parentElement.style.display = show ? '' : 'none';
      if (show) visible++;
    });
    if (noResults) noResults.classList.toggle('visible', visible === 0);
  }

  searchInput.addEventListener('input', (e) => {
    searchTerm = e.target.value.toLowerCase().trim();
    filterCards();
  });

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeFilter = tab.dataset.filter || 'all';
      filterCards();
    });
  });
}

// ─── Resources Page ───────────────────────────────────────────────────────────

function initResourcesPage() {
  const searchInput = document.getElementById('resourceSearch');
  const filterTabs = document.querySelectorAll('.filter-tab');
  const cards = document.querySelectorAll('.resource-card');
  const noResults = document.getElementById('noResults');

  if (!searchInput) return;

  let activeFilter = 'all';
  let searchTerm = '';

  function filterResources() {
    let visible = 0;
    cards.forEach(card => {
      const category = card.dataset.category || '';
      const text = card.textContent.toLowerCase();
      const matchesFilter = activeFilter === 'all' || category === activeFilter;
      const matchesSearch = !searchTerm || text.includes(searchTerm);
      const show = matchesFilter && matchesSearch;
      card.closest('.resource-item')?.style ?
        (card.closest('.resource-item').style.display = show ? '' : 'none') :
        (card.style.display = show ? '' : 'none');
      if (show) visible++;
    });
    if (noResults) noResults.classList.toggle('visible', visible === 0);
  }

  searchInput.addEventListener('input', (e) => {
    searchTerm = e.target.value.toLowerCase().trim();
    filterResources();
  });

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeFilter = tab.dataset.filter || 'all';
      filterResources();
    });
  });
}

// ─── Roadmap Creator (3-Step) ─────────────────────────────────────────────────

function initRoadmapPage() {
  if (!document.getElementById('roadmapStep1')) return;

  // Require login
  if (!isLoggedIn()) {
    showToast('Please login to create a roadmap.', 'error');
    setTimeout(() => { window.location.href = '/login.html'; }, 800);
    return;
  }

  let currentStep = 1;
  let selectedBranch = '';
  let selectedInterests = [];

  const totalSteps = 3;

  // ── Step Navigation ──
  function goToStep(step) {
    // Validate before going forward
    if (step > currentStep) {
      if (currentStep === 1 && !selectedBranch) {
        showToast('Please select your branch.', 'error');
        return;
      }
      if (currentStep === 2 && selectedInterests.length === 0) {
        showToast('Please select at least one interest.', 'error');
        return;
      }
    }

    // Update step panels
    document.querySelectorAll('.step-content').forEach(el => el.classList.remove('active'));
    document.getElementById(`roadmapStep${step}`)?.classList.add('active');

    // Update progress indicators
    document.querySelectorAll('.progress-step').forEach((el, i) => {
      const stepNum = i + 1;
      el.classList.remove('active', 'done');
      if (stepNum < step) el.classList.add('done');
      if (stepNum === step) el.classList.add('active');
    });
    document.querySelectorAll('.progress-connector').forEach((el, i) => {
      el.classList.toggle('done', i < step - 1);
    });

    currentStep = step;

    // If going to step 3, update summary
    if (step === 3) updateSummary();
  }

  // ── Branch Selection ──
  document.querySelectorAll('.branch-option').forEach(option => {
    option.addEventListener('click', () => {
      document.querySelectorAll('.branch-option').forEach(o => o.classList.remove('selected'));
      option.classList.add('selected');
      selectedBranch = option.dataset.value;
    });
  });

  // ── Interest Selection ──
  document.querySelectorAll('.interest-card').forEach(card => {
    card.addEventListener('click', () => {
      const interest = card.dataset.interest;
      if (card.classList.contains('selected')) {
        card.classList.remove('selected');
        selectedInterests = selectedInterests.filter(i => i !== interest);
      } else {
        card.classList.add('selected');
        selectedInterests.push(interest);
      }
    });
  });

  // ── Summary Update ──
  function updateSummary() {
    const branchEl = document.getElementById('summaryBranch');
    const interestsEl = document.getElementById('summaryInterests');
    if (branchEl) branchEl.textContent = selectedBranch;
    if (interestsEl) {
      interestsEl.innerHTML = selectedInterests.map(i =>
        `<span class="tag">${i}</span>`
      ).join('');
    }
  }

  // ── Navigation Buttons ──
  document.getElementById('step1Next')?.addEventListener('click', () => goToStep(2));
  document.getElementById('step2Back')?.addEventListener('click', () => goToStep(1));
  document.getElementById('step2Next')?.addEventListener('click', () => goToStep(3));
  document.getElementById('step3Back')?.addEventListener('click', () => goToStep(2));

  // ── Generate Roadmap ──
  document.getElementById('generateBtn')?.addEventListener('click', async () => {
    const btn = document.getElementById('generateBtn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Generating...';

    try {
      const { ok, data } = await apiRequest('/roadmaps', {
        method: 'POST',
        body: JSON.stringify({ branch: selectedBranch, interests: selectedInterests })
      });

      if (ok) {
        // Save roadmap ID to sessionStorage for result page
        sessionStorage.setItem('cp_roadmap_id', data.roadmap.id);
        sessionStorage.setItem('cp_roadmap_data', JSON.stringify(data.roadmap));
        showToast('Roadmap generated!', 'success');
        setTimeout(() => { window.location.href = '/roadmap-result.html'; }, 600);
      } else {
        showToast(data.message || 'Failed to generate roadmap.', 'error');
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-magic"></i> Generate My Roadmap';
      }
    } catch (err) {
      showToast('Connection error. Is the server running?', 'error');
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-magic"></i> Generate My Roadmap';
    }
  });

  // Start at step 1
  goToStep(1);
}

// ─── Roadmap Result Page ──────────────────────────────────────────────────────

function initRoadmapResultPage() {
  const resultContainer = document.getElementById('roadmapResult');
  if (!resultContainer) return;

  // Require login
  if (!isLoggedIn()) {
    window.location.href = '/login.html';
    return;
  }

  // Load roadmap from sessionStorage first, else fetch from API
  const stored = sessionStorage.getItem('cp_roadmap_data');
  if (stored) {
    renderRoadmap(JSON.parse(stored));
  } else {
    // Fetch latest roadmap from API
    fetchLatestRoadmap();
  }

  // Edit button - go back to roadmap creator
  document.getElementById('editRoadmapBtn')?.addEventListener('click', () => {
    sessionStorage.removeItem('cp_roadmap_data');
    window.location.href = '/roadmap.html';
  });

  // Print button
  document.getElementById('printRoadmapBtn')?.addEventListener('click', () => {
    window.print();
  });

  // Share button
  document.getElementById('shareRoadmapBtn')?.addEventListener('click', async () => {
    const text = 'Check out my career roadmap from CareerPath AI! 🚀 ' + window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'My CareerPath AI Roadmap', text, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(text);
        showToast('Link copied to clipboard!', 'success');
      }
    } catch {
      showToast('Could not share. Try copying the URL manually.', 'error');
    }
  });
}

/** Fetch latest roadmap from API */
async function fetchLatestRoadmap() {
  const loadingEl = document.getElementById('roadmapLoading');
  if (loadingEl) loadingEl.style.display = 'block';

  try {
    const { ok, data } = await apiRequest('/roadmaps/latest');
    if (ok) {
      renderRoadmap(data.roadmap);
    } else {
      document.getElementById('roadmapResult').innerHTML = `
        <div class="empty-state">
          <i class="fas fa-map"></i>
          <h3>No Roadmap Found</h3>
          <p>You haven't generated a roadmap yet.</p>
          <a href="/roadmap.html" class="btn btn-primary" style="margin-top:16px;">
            <i class="fas fa-plus"></i> Create Roadmap
          </a>
        </div>`;
    }
  } catch {
    showToast('Failed to load roadmap.', 'error');
  } finally {
    if (loadingEl) loadingEl.style.display = 'none';
  }
}

/** Render the roadmap stages onto the page */
function renderRoadmap(roadmap) {
  // Update meta info
  const branchEl = document.getElementById('resultBranch');
  const dateEl = document.getElementById('resultDate');
  if (branchEl) branchEl.textContent = roadmap.branch;
  if (dateEl) dateEl.textContent = new Date(roadmap.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  // Update interest tags
  const interestsEl = document.getElementById('resultInterests');
  if (interestsEl && roadmap.interests) {
    interestsEl.innerHTML = roadmap.interests.map(i => `<span class="badge">${i}</span>`).join('');
  }

  // Render stages
  const container = document.getElementById('roadmapResult');
  if (!container) return;

  const loadingEl = document.getElementById('roadmapLoading');
  if (loadingEl) loadingEl.style.display = 'none';

  container.innerHTML = '';
  const stagesContainer = document.createElement('div');
  stagesContainer.className = 'roadmap-stages';

  roadmap.roadmap.forEach((stage, index) => {
    const stageEl = document.createElement('div');
    stageEl.className = 'roadmap-stage animate-fade-up';
    stageEl.style.animationDelay = `${index * 0.1}s`;

    const skillsHtml = stage.skills.map(skill =>
      `<span class="skill-pill">${skill}</span>`
    ).join('');

    stageEl.innerHTML = `
      <div class="stage-header">
        <div class="stage-number">${index + 1}</div>
        <div>
          <h3>${stage.title}</h3>
        </div>
      </div>
      <div class="stage-body">
        <p>${stage.description}</p>
        <div class="stage-skills">${skillsHtml}</div>
      </div>
    `;
    stagesContainer.appendChild(stageEl);
  });

  container.appendChild(stagesContainer);
}

// ─── Home Page ────────────────────────────────────────────────────────────────

function initHomePage() {
  // "Get Started" button - check login state
  const getStartedBtn = document.getElementById('getStartedBtn');
  if (getStartedBtn) {
    getStartedBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (isLoggedIn()) {
        window.location.href = '/roadmap.html';
      } else {
        window.location.href = '/login.html';
      }
    });
  }

  // "Create My Roadmap" CTA button
  const ctaBtn = document.getElementById('ctaRoadmapBtn');
  if (ctaBtn) {
    ctaBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (isLoggedIn()) {
        window.location.href = '/roadmap.html';
      } else {
        window.location.href = '/login.html';
      }
    });
  }
}

// ─── Global Initialization ────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  // Universal init
  updateNavbar();
  setActiveNavLink();
  initNavbarScroll();
  initHamburger();
  initScrollAnimations();

  // Page-specific init
  initHomePage();
  initSignupPage();
  initLoginPage();
  initExplorePage();
  initResourcesPage();
  initRoadmapPage();
  initRoadmapResultPage();
});
