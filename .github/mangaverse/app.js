/* ── app.js: Router + Helpers ── */

// ── NAVIGATE ──
window.navigate = function(page, data = {}) {
  if (data.manga)   window._manga   = data.manga;
  if (data.chapter) window._chapter = data.chapter;

  // Update active nav
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const navEl = document.getElementById('nav-' + page.split('-')[0]);
  if (navEl) navEl.classList.add('active');

  const titles = { discover: 'Discover', creator: 'Creator Hub', profile: 'Profile', mangaDetail: '', reader: 'Reader' };
  document.getElementById('pageTitle').textContent = titles[page] || '';
  document.getElementById('mainContent').innerHTML = '<div class="loading-state"><div class="spinner"></div></div>';

  if (page === 'discover')    Discover.render();
  if (page === 'creator')     Creator.render();
  if (page === 'profile')     Profile.render();
  if (page === 'mangaDetail') Reader.renderDetail(window._manga);
  if (page === 'reader')      Reader.renderChapter(window._manga, window._chapter);
};

// ── TOAST ──
window.showToast = function(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast ' + type;
  t.classList.remove('hidden');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => t.classList.add('hidden'), 2800);
};

// ── MODAL ──
window.openModal = function(html) {
  document.getElementById('modalContent').innerHTML = html;
  document.getElementById('modalOverlay').classList.remove('hidden');
};
window.closeModal = function() {
  document.getElementById('modalOverlay').classList.add('hidden');
};

// ── LOADING ──
window.showLoading = function() { document.getElementById('loadingOverlay').classList.remove('hidden'); };
window.hideLoading = function() { document.getElementById('loadingOverlay').classList.add('hidden'); };

// ── SIDEBAR TOGGLE ──
window.toggleSidebar = function() {
  document.querySelector('.sidebar').classList.toggle('open');
};

// ── AUTH HELPERS (called from HTML) ──
window.showRegister = () => {
  document.getElementById('loginForm').classList.add('hidden');
  document.getElementById('registerForm').classList.remove('hidden');
};
window.showLogin = () => {
  document.getElementById('registerForm').classList.add('hidden');
  document.getElementById('loginForm').classList.remove('hidden');
};

let _selectedRole = 'reader';
window.selectRole = (role) => {
  _selectedRole = role;
  document.getElementById('roleReader').classList.toggle('active', role === 'reader');
  document.getElementById('roleCreator').classList.toggle('active', role === 'creator');
};
window.getSelectedRole = () => _selectedRole;

// ── SEARCH ──
let _searchTimer;
window.handleSearch = function(q) {
  clearTimeout(_searchTimer);
  _searchTimer = setTimeout(() => {
    if (q.trim().length > 1) Discover.renderSearch(q.trim());
    else navigate('discover');
  }, 400);
};

// ── SIGN OUT ──
window.signOut = async function() {
  await window.FB.fbSignOut(window.auth);
  showToast('Signed out');
};

// ── TIME HELPER ──
window.timeAgo = function(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const diff = Date.now() - d.getTime();
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
  if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
  return Math.floor(diff / 86400000) + 'd ago';
};
