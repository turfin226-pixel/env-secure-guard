/* ── discover.js: Browse + Search ── */
const Discover = {
  _genre: 'All',

  async render() {
    const genres = ['All','Action','Romance','Fantasy','Horror','Comedy','SciFi','SliceOfLife'];
    document.getElementById('mainContent').innerHTML = `
      <div class="hero-section">
        <h1>Where Creators Share.<br><span>Readers Shape the Story.</span></h1>
        <p>Original manga. Interactive story votes. Every chapter, your voice matters.</p>
        <div class="hero-actions">
          <button class="btn-primary" onclick="navigate('creator')">✏️ Start Creating</button>
          <button class="btn-secondary" onclick="document.getElementById('searchInput').focus()">🔍 Explore Manga</button>
        </div>
      </div>

      <div class="section-row">
        <div class="section-title">📚 All Manga</div>
      </div>
      <div class="genre-pills">
        ${genres.map(g => `<div class="genre-pill ${this._genre === g ? 'active' : ''}" onclick="Discover.setGenre('${g}')">${g}</div>`).join('')}
      </div>
      <div id="mangaGrid" class="manga-grid">
        <div class="loading-state"><div class="spinner"></div></div>
      </div>
    `;
    await this.loadManga();
  },

  async loadManga() {
    try {
      const { collection, getDocs, query, orderBy, where } = window.FB;
      let q;
      if (this._genre === 'All') {
        q = query(collection(window.db, 'manga'), orderBy('createdAt', 'desc'));
      } else {
        q = query(collection(window.db, 'manga'), where('genre', '==', this._genre), orderBy('createdAt', 'desc'));
      }
      const snap = await getDocs(q);
      const mangas = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      this.renderGrid(mangas);
    } catch (e) {
      document.getElementById('mangaGrid').innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><div class="empty-title">Could not load manga</div><div class="empty-desc">${e.message}</div></div>`;
    }
  },

  renderGrid(mangas) {
    const grid = document.getElementById('mangaGrid');
    if (!mangas.length) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
        <div class="empty-icon">📭</div>
        <div class="empty-title">No manga yet</div>
        <div class="empty-desc">Be the first to upload!</div>
        <button class="btn-primary" onclick="navigate('creator')">+ Upload Manga</button>
      </div>`;
      return;
    }
    grid.innerHTML = mangas.map(m => this.cardHTML(m)).join('');
  },

  cardHTML(m) {
    const cover = m.coverURL
      ? `<img class="manga-cover" src="${m.coverURL}" alt="${m.title}" loading="lazy" />`
      : `<div class="manga-cover-ph"><span>📖</span><span class="cover-txt">${m.title}</span></div>`;
    return `<div class="manga-card" onclick="Discover.openManga('${m.id}')">
      ${cover}
      <div class="manga-card-info">
        <div class="manga-card-title">${m.title}</div>
        <div class="manga-card-meta">
          <span class="badge badge-genre">${m.genre || 'Manga'}</span>
          ${m.totalChapters ? `<span style="font-size:.72rem;color:var(--text3)">${m.totalChapters} ch</span>` : ''}
        </div>
      </div>
    </div>`;
  },

  async openManga(id) {
    showLoading();
    try {
      const snap = await window.FB.getDoc(window.FB.doc(window.db, 'manga', id));
      if (!snap.exists()) return showToast('Manga not found', 'error');
      const manga = { id: snap.id, ...snap.data() };
      hideLoading();
      navigate('mangaDetail', { manga });
    } catch (e) {
      hideLoading();
      showToast('Error loading manga', 'error');
    }
  },

  setGenre(g) {
    this._genre = g;
    this.render();
  },

  async renderSearch(q) {
    document.getElementById('pageTitle').textContent = `"${q}"`;
    document.getElementById('mainContent').innerHTML = `
      <div class="section-row">
        <div class="section-title">🔍 Search: "${q}"</div>
        <span class="section-link" onclick="navigate('discover')">← Back</span>
      </div>
      <div id="mangaGrid" class="manga-grid"><div class="loading-state"><div class="spinner"></div></div></div>
    `;
    try {
      const snap = await window.FB.getDocs(window.FB.collection(window.db, 'manga'));
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const lower = q.toLowerCase();
      const results = all.filter(m =>
        (m.title || '').toLowerCase().includes(lower) ||
        (m.genre || '').toLowerCase().includes(lower) ||
        (m.synopsis || '').toLowerCase().includes(lower) ||
        (m.creatorName || '').toLowerCase().includes(lower)
      );
      this.renderGrid(results);
    } catch (e) { showToast('Search failed', 'error'); }
  }
};
