/* ── profile.js ── */
const Profile = {
  async render() {
    const uid  = window.currentUser?.uid;
    const name = window.currentUser?.displayName || 'User';
    const email= window.currentUser?.email || '';

    // Load user doc
    let userDoc = {};
    try {
      const snap = await window.FB.getDoc(window.FB.doc(window.db, 'users', uid));
      if (snap.exists()) userDoc = snap.data();
    } catch (_) {}

    // Load my manga count
    let mangaCount = 0;
    try {
      const snap = await window.FB.getDocs(window.FB.query(window.FB.collection(window.db, 'manga'), window.FB.where('creatorId', '==', uid)));
      mangaCount = snap.size;
    } catch (_) {}

    const role = userDoc.role || 'reader';

    document.getElementById('mainContent').innerHTML = `
      <div class="profile-header">
        <div class="profile-ava">${name[0].toUpperCase()}</div>
        <div>
          <div class="profile-name">${name}</div>
          <div class="profile-role">${role === 'creator' ? '✏️ Creator' : '📖 Reader'} · ${email}</div>
          <div class="profile-stats">
            ${role === 'creator' ? `<div class="profile-stat"><strong>${mangaCount}</strong> Manga</div>` : ''}
            <div class="profile-stat"><strong>${userDoc.joined || new Date(window.currentUser.metadata.creationTime).toLocaleDateString('en-IN', {month:'short', year:'numeric'})}</strong> Joined</div>
          </div>
        </div>
      </div>

      <div class="upload-card">
        <h3>⚙️ Account Settings</h3>
        <div class="form-group">
          <label>Display Name</label>
          <input type="text" id="profName" value="${name}" />
        </div>
        <div class="form-group">
          <label>Your Role</label>
          <div class="role-selector">
            <button class="role-btn ${role==='reader'?'active':''}" onclick="Profile.setRole('reader')">📖 Reader</button>
            <button class="role-btn ${role==='creator'?'active':''}" onclick="Profile.setRole('creator')">✏️ Creator</button>
          </div>
        </div>
        <button class="btn-primary" onclick="Profile.saveProfile()">Save Changes</button>
      </div>

      ${role === 'creator' ? `
      <div class="upload-card" style="margin-top:16px">
        <h3>📊 Your Stats</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px;margin-top:8px;" id="statsGrid">
          <div class="loading-state"><div class="spinner"></div></div>
        </div>
      </div>` : ''}
    `;

    if (role === 'creator') this.loadStats(uid);
    window._profileRole = role;
  },

  _pendingRole: null,
  setRole(role) {
    window._profileRole = role;
    document.querySelectorAll('.role-btn').forEach((b,i) => b.classList.toggle('active', ['reader','creator'][i]===role));
  },

  async saveProfile() {
    const name = document.getElementById('profName').value.trim();
    const role = window._profileRole;
    if (!name) return showToast('Enter a name', 'error');
    showLoading();
    try {
      await window.FB.updateProfile(window.currentUser, { displayName: name });
      await window.FB.updateDoc(window.FB.doc(window.db, 'users', window.currentUser.uid), { name, role });
      hideLoading();
      showToast('Profile saved!', 'success');
      document.getElementById('userAvatar').textContent = name[0].toUpperCase();
    } catch (e) {
      hideLoading();
      showToast('Error: ' + e.message, 'error');
    }
  },

  async loadStats(uid) {
    try {
      const snap = await window.FB.getDocs(window.FB.query(window.FB.collection(window.db, 'manga'), window.FB.where('creatorId', '==', uid)));
      const mangas = snap.docs.map(d => d.data());
      const totalViews = mangas.reduce((s,m) => s + (m.views||0), 0);
      const totalChapters = mangas.reduce((s,m) => s + (m.totalChapters||0), 0);
      document.getElementById('statsGrid').innerHTML = `
        <div style="background:var(--card);border-radius:var(--radius-sm);padding:16px;border:1px solid var(--border)">
          <div style="font-size:1.6rem;font-weight:800;color:var(--accent2)">${mangas.length}</div>
          <div style="font-size:.8rem;color:var(--text3)">Manga Series</div>
        </div>
        <div style="background:var(--card);border-radius:var(--radius-sm);padding:16px;border:1px solid var(--border)">
          <div style="font-size:1.6rem;font-weight:800;color:var(--accent2)">${totalChapters}</div>
          <div style="font-size:.8rem;color:var(--text3)">Chapters</div>
        </div>
        <div style="background:var(--card);border-radius:var(--radius-sm);padding:16px;border:1px solid var(--border)">
          <div style="font-size:1.6rem;font-weight:800;color:var(--accent2)">${totalViews.toLocaleString()}</div>
          <div style="font-size:.8rem;color:var(--text3)">Total Views</div>
        </div>
      `;
    } catch (_) {}
  }
};
