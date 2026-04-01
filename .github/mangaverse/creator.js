/* ── creator.js: Upload Manga + Chapters + Polls ── */
// Cloudinary config (free image hosting — no billing needed)
const CLOUDINARY_CLOUD = 'df1n2npht';
const CLOUDINARY_PRESET = 'mangaverse_upload'; // unsigned preset

async function uploadToCloudinary(file) {
  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', CLOUDINARY_PRESET);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, { method: 'POST', body: form });
  if (!res.ok) throw new Error('Image upload failed');
  const data = await res.json();
  return data.secure_url;
}

const Creator = {
  _tab: 'my',

  async render() {
    const uid = window.currentUser?.uid;
    document.getElementById('mainContent').innerHTML = `
      <div class="creator-tabs">
        <button class="creator-tab ${this._tab==='my'?'active':''}" onclick="Creator.switchTab('my')">📚 My Manga</button>
        <button class="creator-tab ${this._tab==='upload'?'active':''}" onclick="Creator.switchTab('upload')">➕ Upload New</button>
      </div>
      <div id="creatorTabContent"></div>
    `;
    this.renderTab();
  },

  switchTab(tab) {
    this._tab = tab;
    document.querySelectorAll('.creator-tab').forEach((t,i) => t.classList.toggle('active', ['my','upload'][i]===tab));
    this.renderTab();
  },

  renderTab() {
    if (this._tab === 'upload') this.renderUpload();
    else this.renderMyManga();
  },

  // ── MY MANGA ──────────────────────────────────────────
  async renderMyManga() {
    const uid = window.currentUser?.uid;
    const el = document.getElementById('creatorTabContent');
    el.innerHTML = '<div class="loading-state"><div class="spinner"></div></div>';
    try {
      const snap = await window.FB.getDocs(
        window.FB.query(window.FB.collection(window.db, 'manga'), window.FB.where('creatorId', '==', uid), window.FB.orderBy('createdAt', 'desc'))
      );
      const mangas = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (!mangas.length) {
        el.innerHTML = `<div class="empty-state">
          <div class="empty-icon">✏️</div>
          <div class="empty-title">No manga yet</div>
          <div class="empty-desc">Upload your first manga and start your creator journey!</div>
          <button class="btn-primary" onclick="Creator.switchTab('upload')">+ Upload First Manga</button>
        </div>`;
        return;
      }
      el.innerHTML = `<div class="manga-manage-list">${mangas.map(m => this.manageItemHTML(m)).join('')}</div>`;
    } catch (e) {
      el.innerHTML = `<div class="empty-state"><div class="empty-desc">Error: ${e.message}</div></div>`;
    }
  },

  manageItemHTML(m) {
    const cover = m.coverURL
      ? `<img src="${m.coverURL}" style="width:100%;height:100%;object-fit:cover">`
      : `<span style="font-size:1.5rem">📖</span>`;
    return `<div class="manga-manage-item">
      <div class="manga-manage-thumb">${cover}</div>
      <div class="manga-manage-info">
        <div class="manga-manage-title">${m.title}</div>
        <div class="manga-manage-meta">
          <span>📖 ${m.totalChapters || 0} chapters</span>
          <span>👁 ${m.views || 0} views</span>
          <span class="badge badge-genre">${m.genre}</span>
        </div>
      </div>
      <div class="manga-manage-actions">
        <button class="btn-secondary btn-sm" onclick="Creator.openAddChapter('${m.id}')">+ Chapter</button>
        <button class="btn-secondary btn-sm" onclick="Discover.openManga('${m.id}')">View</button>
      </div>
    </div>`;
  },

  // ── UPLOAD MANGA ──────────────────────────────────────────
  renderUpload() {
    document.getElementById('creatorTabContent').innerHTML = `
      <div class="upload-card">
        <h3>📤 Create New Manga Series</h3>
        <div class="form-group">
          <label>Title *</label>
          <input type="text" id="upTitle" placeholder="e.g. Shadow Blade Chronicles" />
        </div>
        <div class="form-group">
          <label>Genre *</label>
          <select id="upGenre">
            ${['Action','Romance','Fantasy','Horror','Comedy','SciFi','SliceOfLife','Drama','Mystery','Thriller'].map(g=>`<option>${g}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Synopsis *</label>
          <textarea id="upSynopsis" placeholder="Tell readers what your manga is about..."></textarea>
        </div>
        <div class="form-group">
          <label>Status</label>
          <select id="upStatus"><option>Ongoing</option><option>Completed</option><option>Hiatus</option></select>
        </div>
        <div class="form-group">
          <label>Cover Image</label>
          <div class="upload-zone" id="coverZone" onclick="document.getElementById('coverFile').click()">
            <div class="upload-zone-icon">🖼️</div>
            <div class="upload-zone-text">Click to upload cover image</div>
            <div class="upload-zone-hint">JPG, PNG or WEBP</div>
          </div>
          <input type="file" id="coverFile" accept="image/*" style="display:none" onchange="Creator.previewCover(this)" />
          <img id="coverPreview" style="width:120px;border-radius:8px;margin-top:10px;display:none" />
        </div>
        <button class="btn-primary w-full" onclick="Creator.publishManga()">🚀 Create Manga Series</button>
      </div>
    `;
  },

  _coverFile: null,

  previewCover(input) {
    const file = input.files[0];
    if (!file) return;
    this._coverFile = file;
    const reader = new FileReader();
    reader.onload = e => {
      const img = document.getElementById('coverPreview');
      img.src = e.target.result;
      img.style.display = 'block';
    };
    reader.readAsDataURL(file);
  },

  async publishManga() {
    const title    = document.getElementById('upTitle').value.trim();
    const genre    = document.getElementById('upGenre').value;
    const synopsis = document.getElementById('upSynopsis').value.trim();
    const status   = document.getElementById('upStatus').value;
    if (!title || !synopsis) return showToast('Fill in title and synopsis', 'error');

    const uid  = window.currentUser?.uid;
    const name = window.currentUser?.displayName || 'Creator';
    showLoading();
    try {
      let coverURL = null;
      if (this._coverFile) {
        try {
          coverURL = await uploadToCloudinary(this._coverFile);
        } catch(e) { hideLoading(); return showToast('Cover upload failed: ' + e.message, 'error'); }
      }
      await window.FB.addDoc(window.FB.collection(window.db, 'manga'), {
        title, genre, synopsis, status, coverURL,
        creatorId: uid, creatorName: name,
        totalChapters: 0, views: 0,
        createdAt: window.FB.serverTimestamp()
      });
      this._coverFile = null;
      hideLoading();
      showToast(`"${title}" created! Now add chapters.`, 'success');
      this.switchTab('my');
    } catch (e) {
      hideLoading();
      showToast('Error: ' + e.message, 'error');
    }
  },

  // ── ADD CHAPTER ──────────────────────────────────────────
  openAddChapter(mangaId) {
    openModal(`<div class="modal-box">
      <button class="modal-close" onclick="closeModal()">✕</button>
      <div class="modal-title">📖 Add New Chapter</div>
      <div class="modal-sub">Upload chapter pages and optionally add a story vote poll</div>

      <div class="form-group">
        <label>Chapter Title *</label>
        <input type="text" id="chTitle" placeholder="e.g. The Awakening" />
      </div>
      <div class="form-group">
        <label>Chapter Number *</label>
        <input type="number" id="chNum" value="1" min="1" />
      </div>
      <div class="form-group">
        <label>Chapter Pages (Images) *</label>
        <div class="upload-zone" onclick="document.getElementById('chPages').click()">
          <div class="upload-zone-icon">📄</div>
          <div class="upload-zone-text">Click to upload pages (select multiple)</div>
          <div class="upload-zone-hint">Images will be shown in order — name them 01.jpg, 02.jpg etc.</div>
        </div>
        <input type="file" id="chPages" accept="image/*" multiple style="display:none" onchange="Creator.previewPages(this)" />
        <div id="pagesPreview" class="upload-preview-grid"></div>
      </div>

      <div style="border-top:1px solid var(--border);margin:20px 0;padding-top:20px;">
        <div style="font-size:.85rem;font-weight:600;margin-bottom:4px;">🗳️ Story Vote (Optional)</div>
        <div style="font-size:.78rem;color:var(--text2);margin-bottom:12px;">Ask readers what they want to happen next. The poll stays open until the next chapter is published.</div>

        <div class="form-group">
          <label>Poll Question</label>
          <input type="text" id="pollQ" placeholder="e.g. What should Ryu do next?" />
        </div>
        <div id="pollOptions">
          <div class="poll-option-row"><input type="text" class="poll-opt" placeholder="Option A" /></div>
          <div class="poll-option-row"><input type="text" class="poll-opt" placeholder="Option B" /></div>
        </div>
        <button class="btn-secondary btn-sm" onclick="Creator.addPollOption()">+ Add Option</button>
      </div>

      <div class="modal-actions">
        <button class="btn-secondary" onclick="closeModal()">Cancel</button>
        <button class="btn-primary" onclick="Creator.publishChapter('${mangaId}')">📤 Publish Chapter</button>
      </div>
    </div>`);
    window._chPageFiles = [];
  },

  previewPages(input) {
    const files = Array.from(input.files).sort((a,b) => a.name.localeCompare(b.name));
    window._chPageFiles = files;
    const preview = document.getElementById('pagesPreview');
    preview.innerHTML = '';
    files.slice(0, 10).forEach(f => {
      const reader = new FileReader();
      reader.onload = e => {
        const img = document.createElement('img');
        img.className = 'upload-thumb';
        img.src = e.target.result;
        preview.appendChild(img);
      };
      reader.readAsDataURL(f);
    });
    if (files.length > 10) {
      const more = document.createElement('div');
      more.style.cssText = 'align-self:center;font-size:.78rem;color:var(--text3)';
      more.textContent = `+${files.length-10} more`;
      preview.appendChild(more);
    }
    showToast(`${files.length} pages ready`, 'success');
  },

  addPollOption() {
    const container = document.getElementById('pollOptions');
    const opts = container.querySelectorAll('.poll-opt');
    if (opts.length >= 4) return showToast('Max 4 options', 'error');
    const row = document.createElement('div');
    row.className = 'poll-option-row';
    const labels = ['A','B','C','D'];
    row.innerHTML = `<input type="text" class="poll-opt" placeholder="Option ${labels[opts.length]}" />`;
    container.appendChild(row);
  },

  async publishChapter(mangaId) {
    const title  = document.getElementById('chTitle').value.trim();
    const chNum  = parseInt(document.getElementById('chNum').value) || 1;
    const files  = window._chPageFiles || [];
    const pollQ  = document.getElementById('pollQ').value.trim();
    const pollOpts = Array.from(document.querySelectorAll('.poll-opt')).map(i => i.value.trim()).filter(Boolean);

    if (!title) return showToast('Enter chapter title', 'error');
    if (!files.length) return showToast('Upload at least 1 page', 'error');
    if (pollQ && pollOpts.length < 2) return showToast('Add at least 2 poll options', 'error');

    const uid = window.currentUser?.uid;
    showLoading();
    try {
      // Upload pages to Cloudinary
      const pageURLs = [];
      for (let i = 0; i < files.length; i++) {
        showToast(`Uploading page ${i+1}/${files.length}...`, '');
        try {
          const url = await uploadToCloudinary(files[i]);
          pageURLs.push(url);
        } catch(e) { hideLoading(); return showToast('Page upload failed: ' + e.message, 'error'); }
      }

      // Build poll object
      const poll = pollQ ? { question: pollQ, options: pollOpts, votes: {}, isOpen: true } : null;

      // Save chapter
      await window.FB.addDoc(window.FB.collection(window.db, 'chapters'), {
        mangaId, title, chapterNumber: chNum,
        pageURLs, poll,
        views: 0, likes: 0,
        creatorId: uid,
        publishedAt: window.FB.serverTimestamp()
      });

      // Update manga chapter count + close previous poll
      await window.FB.updateDoc(window.FB.doc(window.db, 'manga', mangaId), {
        totalChapters: window.FB.increment(1),
        updatedAt: window.FB.serverTimestamp()
      });

      window._chPageFiles = [];
      closeModal();
      hideLoading();
      showToast(`Chapter ${chNum}: "${title}" published! 🎉`, 'success');
      this.switchTab('my');
    } catch (e) {
      hideLoading();
      showToast('Error: ' + e.message, 'error');
    }
  }
};
