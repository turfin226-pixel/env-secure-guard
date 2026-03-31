/* ── reader.js: Discover, Manga Detail, Chapter Reader ── */
const Reader = {

  activeGenre: 'All',
  activeSearch: '',

  // ── DISCOVER ──────────────────────────────
  renderDiscover() {
    const mangas = APP.mangas;
    const genres = ['All','Action','Romance','Fantasy','SciFi','Horror','SliceOfLife'];
    const filtered = this.activeGenre === 'All' ? mangas : mangas.filter(m => m.genre === this.activeGenre);
    const hot = mangas.filter(m => m.isHot);
    const newThis = [...mangas].sort((a,b) => b.createdAt - a.createdAt).slice(0,6);
    const featured = mangas[0];

    document.getElementById('mainContent').innerHTML = `
      <div class="hero-banner">
        <div class="hero-content">
          <div class="hero-tag">⚡ MangaVerse Trending</div>
          <div class="hero-title">${featured.title}</div>
          <div class="hero-desc">${featured.description}</div>
          <div class="hero-actions">
            <button class="btn-primary" onclick="Reader.openManga('${featured.id}')">📖 Start Reading</button>
            <button class="btn-secondary" onclick="Reader.openManga('${featured.id}')">+ Bookmark</button>
          </div>
        </div>
      </div>

      ${hot.length ? `
      <div class="section-header"><div class="section-title">🔥 Hot Right Now</div></div>
      <div class="manga-grid" style="margin-bottom:28px;">${hot.map(m=>this.mangaCard(m)).join('')}</div>` : ''}

      <div class="section-header">
        <div class="section-title">📚 All Manga</div>
        <span class="section-link" onclick="navigate('discover')">View All</span>
      </div>
      <div class="genre-pills">
        ${genres.map(g=>`<div class="genre-pill ${this.activeGenre===g?'active':''}" onclick="Reader.filterGenre('${g}')">${g}</div>`).join('')}
      </div>
      <div class="manga-grid">${filtered.map(m=>this.mangaCard(m)).join('')}</div>

      <div class="section-header" style="margin-top:28px;"><div class="section-title">🆕 New This Week</div></div>
      <div class="manga-grid">${newThis.map(m=>this.mangaCard(m)).join('')}</div>
    `;
  },

  mangaCard(m) {
    const cover = m.coverData
      ? `<img class="manga-card-img" src="${m.coverData}" alt="${m.title}" />`
      : `<div class="manga-cover-placeholder"><span>${m.emoji||'📖'}</span><span class="cover-title-text">${m.title}</span></div>`;
    const hasPaid = m.chapters.some(c=>!c.free);
    const badge = m.isHot ? '<span class="badge-hot">HOT</span>' : (hasPaid ? '<span class="badge-paid">PAID</span>' : '<span class="badge-free">FREE</span>');
    return `<div class="manga-card" onclick="Reader.openManga('${m.id}')">
      ${cover}
      <div class="manga-card-body">
        <div class="manga-card-title">${m.title}</div>
        <div class="manga-card-meta">${badge}<span>${m.genre}</span><span>⭐${m.rating}</span></div>
      </div>
    </div>`;
  },

  filterGenre(g) {
    this.activeGenre = g;
    this.renderDiscover();
  },

  search(q) {
    const query = (q||'').trim().toLowerCase();
    if (!query) { navigate('discover'); return; }
    APP.currentPage = 'searchResults';
    this.activeSearch = query;
    document.getElementById('pageTitle').textContent = `Search: "${q}"`;
    this.renderSearch();
  },

  renderSearch() {
    const q = this.activeSearch;
    const results = APP.mangas.filter(m =>
      m.title.toLowerCase().includes(q) ||
      m.genre.toLowerCase().includes(q) ||
      m.creator.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q)
    );
    document.getElementById('mainContent').innerHTML = `
      <div class="section-header">
        <div class="section-title">🔍 Results for "${q}"</div>
        <span class="section-link" onclick="navigate('discover')">← Back</span>
      </div>
      ${results.length
        ? `<div class="manga-grid">${results.map(m=>this.mangaCard(m)).join('')}</div>`
        : `<div class="empty-state"><div class="empty-icon">🔍</div><div class="empty-title">No results found</div><div class="empty-desc">Try different keywords or browse genres.</div></div>`
      }
    `;
  },

  // ── MANGA DETAIL ──────────────────────────
  openManga(id) {
    const m = APP.mangas.find(x => x.id === id);
    if (!m) return;
    APP.currentManga = m;
    navigate('mangaDetail');
    // track read history
    const u = APP.user;
    if (u) {
      if (!u.readHistory) u.readHistory = [];
      if (!u.readHistory.includes(id)) { u.readHistory.unshift(id); APP.user = u; }
    }
  },

  renderMangaDetail() {
    const m = APP.currentManga;
    if (!m) return navigate('discover');
    const u = APP.user;
    const allUsers = APP.users;
    const creatorUser = allUsers.find(x => x.id === m.creatorId);
    const tier = creatorUser ? getTier(creatorUser.vpCoins||0) : getTier(0);
    const isBookmarked = u?.bookmarks?.includes(m.id);

    const cover = m.coverData
      ? `<img src="${m.coverData}" alt="${m.title}" style="width:100%;aspect-ratio:2/3;object-fit:cover;display:block;" />`
      : `<div class="manga-cover-placeholder" style="aspect-ratio:2/3;">${m.emoji||'📖'}<span class="cover-title-text">${m.title}</span></div>`;

    const comments = (m.comments||[]).slice().sort((a,b)=>(b.isSuper?1:-1)-(a.isSuper?1:-1));

    document.getElementById('mainContent').innerHTML = `
      <button class="btn-ghost btn-sm" onclick="navigate('discover')" style="margin-bottom:16px;">← Back</button>
      <div class="manga-detail-hero">
        <div class="manga-detail-cover">${cover}</div>
        <div class="manga-detail-info">
          <div class="manga-detail-title">${m.title}</div>
          <div class="manga-detail-meta">
            <span class="tag">${m.genre}</span>
            <span class="tag">⭐ ${m.rating}</span>
            <span class="tag">👁 ${(m.totalViews||0).toLocaleString()} views</span>
            ${m.isHot?'<span class="badge-hot">HOT</span>':''}
          </div>
          <div class="creator-mini">
            <div class="creator-mini-avatar">${m.creator.slice(0,2).toUpperCase()}</div>
            <div class="creator-mini-name">@${m.creator}</div>
            <span class="tier-badge ${tier.cls}">${tier.label}</span>
          </div>
          <p class="manga-desc">${m.description}</p>
          <div class="manga-actions">
            <button class="btn-primary" onclick="Reader.startReading('${m.id}')">📖 Start Reading</button>
            <button class="btn-vp" onclick="Reader.openTipModal('${m.id}')">🪙 Tip Creator</button>
            <button class="btn-secondary btn-sm" onclick="Reader.toggleBookmark('${m.id}')">
              ${isBookmarked ? '🔖 Bookmarked' : '+ Bookmark'}
            </button>
          </div>
        </div>
      </div>

      <div class="section-header"><div class="section-title">📋 Chapters (${m.chapters.length})</div></div>
      <div class="chapter-list" style="margin-bottom:28px;">
        ${m.chapters.map((ch,i) => {
          const unlocked = ch.free || VPCoin.isChapterUnlocked(ch.id);
          return `<div class="chapter-item" onclick="Reader.openChapter('${m.id}','${ch.id}')">
            <div class="chapter-item-left">
              <span class="chapter-num">Chapter ${i+1}</span>
              <span class="chapter-title-text">${ch.title}</span>
            </div>
            <div class="chapter-item-right">
              ${ch.free ? '<span class="badge-free">FREE</span>' : (unlocked ? '<span class="badge-free">UNLOCKED</span>' : `<span class="badge-paid">🔒 ${ch.price} VP</span>`)}
              <span style="color:var(--text-3)">${(ch.views||0).toLocaleString()} views</span>
            </div>
          </div>`;}).join('')}
      </div>

      <div class="comments-section">
        <div class="comments-title">💬 Comments (${(m.comments||[]).length})</div>
        <div class="comment-form-row">
          <textarea id="commentInput" placeholder="Write a comment..." class="form-group"></textarea>
          <div class="comment-form-btns">
            <button class="btn-secondary btn-sm" onclick="Reader.postComment('${m.id}',false)">Post</button>
            <button class="btn-vp btn-sm" onclick="Reader.openSuperCommentModal('${m.id}')">⭐ Super</button>
          </div>
        </div>
        <div id="commentsList">
          ${comments.length ? comments.map(c=>this.commentHTML(c)).join('') : '<div class="empty-state" style="padding:20px"><div class="empty-icon">💬</div><div class="empty-title">No comments yet</div><div class="empty-desc">Be the first to comment!</div></div>'}
        </div>
      </div>
    `;
  },

  commentHTML(c) {
    const superClass = c.isSuper ? 'super-comment' : '';
    return `<div class="comment-item">
      <div class="comment-ava">${c.author.slice(0,2).toUpperCase()}</div>
      <div class="comment-body">
        <div class="${superClass}">
          ${c.isSuper ? `<div class="super-tag">⭐ Super Comment · Pinned ${c.duration} days</div>` : ''}
          <div class="comment-header">
            <span class="comment-name">${c.author}</span>
            <span class="comment-time">${timeAgo(c.time)}</span>
            ${c.isSuper ? '<span class="tag" style="background:rgba(245,158,11,.1);color:var(--accent3)">👑 Supporter</span>' : ''}
          </div>
          <div class="comment-text">${c.text}</div>
        </div>
      </div>
    </div>`;
  },

  postComment(mangaId, isSuper, superDuration) {
    const text = document.getElementById('commentInput')?.value?.trim();
    if (!text) return showToast('Write something first!','error');
    const u = APP.user;
    const mangas = APP.mangas;
    const idx = mangas.findIndex(m => m.id === mangaId);
    if (idx === -1) return;
    if (!mangas[idx].comments) mangas[idx].comments = [];
    mangas[idx].comments.unshift({ author: u.name, text, time: Date.now(), isSuper: !!isSuper, duration: superDuration||0 });
    APP.mangas = mangas;
    APP.currentManga = mangas[idx];
    closeModal();
    showToast(isSuper ? '⭐ Super Comment posted!' : 'Comment posted!', 'success');
    if (isSuper) Notifications.add('⭐', `${u.name} posted a Super Comment on "${mangas[idx].title}"`, mangas[idx].creatorId);
    this.renderMangaDetail();
  },

  openSuperCommentModal(mangaId) {
    openModal(`<div class="modal-box">
      <button class="modal-close" onclick="closeModal()">✕</button>
      <div class="modal-title">⭐ Super Comment</div>
      <div class="modal-subtitle">Pin your comment — creator earns 70% of VP spent!</div>
      <div class="tip-amount-btns" id="scDurationBtns">
        <button class="tip-amount-btn selected" onclick="selectSCDuration(1,10,this)">📌 1 Day — 10 VP</button>
        <button class="tip-amount-btn" onclick="selectSCDuration(7,50,this)">📌 7 Days — 50 VP</button>
        <button class="tip-amount-btn" onclick="selectSCDuration(30,150,this)">📌 30 Days — 150 VP</button>
      </div>
      <div class="form-group">
        <label>Your comment</label>
        <textarea id="superCommentText" placeholder="Write an amazing comment..." style="min-height:80px;width:100%;padding:12px;background:rgba(255,255,255,.06);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text-1);font-family:inherit;font-size:.9rem;outline:none;resize:vertical;"></textarea>
      </div>
      <div style="font-size:.82rem;color:var(--text-2);margin-top:4px;">Your balance: <strong style="color:var(--accent3)">${APP.user?.vpCoins||0} VP</strong></div>
      <div class="modal-actions">
        <button class="btn-ghost" onclick="closeModal()">Cancel</button>
        <button class="btn-vp" onclick="Reader.postSuperComment('${mangaId}')">⭐ Post Super Comment</button>
      </div>
    </div>`);
    window._scDuration = 1; window._scPrice = 10;
  },

  postSuperComment(mangaId) {
    const text = document.getElementById('superCommentText')?.value?.trim();
    if (!text) return showToast('Write your comment!','error');
    const price = window._scPrice || 10;
    const duration = window._scDuration || 1;
    const m = APP.mangas.find(x=>x.id===mangaId);
    if (!m) return;
    const creatorShare = Math.floor(price * 0.70);
    if (!VPCoin.spend(price, `Super Comment on "${m.title}"`)) return showToast('Not enough VP!','error');
    VPCoin.earn(creatorShare, `Super Comment earned: "${m.title}"`, m.creatorId);
    // post comment
    const mangas = APP.mangas;
    const idx = mangas.findIndex(x=>x.id===mangaId);
    if (!mangas[idx].comments) mangas[idx].comments = [];
    mangas[idx].comments.unshift({ author:APP.user.name, text, time:Date.now(), isSuper:true, duration });
    APP.mangas = mangas;
    APP.currentManga = mangas[idx];
    closeModal();
    showToast(`⭐ Super Comment posted! Creator earned ${creatorShare} VP`, 'vp');
    Notifications.add('⭐',`Super Comment on "${m.title}" — you earned ${creatorShare} VP!`, m.creatorId);
    this.renderMangaDetail();
  },

  startReading(mangaId) {
    const m = APP.mangas.find(x=>x.id===mangaId);
    if (!m || !m.chapters.length) return;
    APP.currentManga = m;
    APP.currentChapter = m.chapters[0];
    navigate('reader');
    // Award reading VP
    const u = APP.user;
    const today = new Date().toDateString();
    if (u.lastReadDate !== today) {
      VPCoin.earn(2, 'First read of the day bonus');
      u.lastReadDate = today;
      APP.user = u;
      showToast('+2 VP First Read Bonus!','vp');
    }
  },

  openChapter(mangaId, chapterId) {
    const m = APP.mangas.find(x=>x.id===mangaId);
    if (!m) return;
    const ch = m.chapters.find(x=>x.id===chapterId);
    if (!ch) return;
    if (!ch.free && !VPCoin.isChapterUnlocked(ch.id)) {
      if (!VPCoin.unlockChapter(m, ch)) return;
    }
    APP.currentManga = m;
    APP.currentChapter = ch;
    navigate('reader');
    // increment views
    const mangas = APP.mangas;
    const mi = mangas.findIndex(x=>x.id===mangaId);
    const ci = mangas[mi].chapters.findIndex(x=>x.id===chapterId);
    mangas[mi].chapters[ci].views = (mangas[mi].chapters[ci].views||0)+1;
    mangas[mi].totalViews = (mangas[mi].totalViews||0)+1;
    APP.mangas = mangas;
    // count reads
    const u = APP.user;
    u.readCount = (u.readCount||0)+1;
    APP.user = u;
  },

  toggleBookmark(mangaId) {
    const u = APP.user;
    if (!u.bookmarks) u.bookmarks = [];
    const idx = u.bookmarks.indexOf(mangaId);
    if (idx === -1) { u.bookmarks.push(mangaId); showToast('Bookmarked!','success'); }
    else { u.bookmarks.splice(idx,1); showToast('Bookmark removed',''); }
    APP.user = u;
    this.renderMangaDetail();
  },

  openTipModal(mangaId) {
    const m = APP.mangas.find(x=>x.id===mangaId);
    if (!m) return;
    openModal(`<div class="modal-box">
      <button class="modal-close" onclick="closeModal()">✕</button>
      <div class="modal-title">🪙 Tip @${m.creator}</div>
      <div class="modal-subtitle">Show your support! Creator gets 70%, platform keeps 30%.</div>
      <div style="font-size:.82rem;color:var(--text-2);margin-bottom:10px;">Your VP: <strong style="color:var(--accent3)">${APP.user?.vpCoins||0}</strong></div>
      <div class="tip-amount-btns" id="tipBtns">
        ${[10,25,50,100,200].map(a=>`<button class="tip-amount-btn ${a===25?'selected':''}" onclick="selectTip(${a},this)">${a} VP</button>`).join('')}
      </div>
      <div class="modal-actions">
        <button class="btn-ghost" onclick="closeModal()">Cancel</button>
        <button class="btn-vp" onclick="Reader.sendTip('${mangaId}')">🪙 Send Tip</button>
      </div>
    </div>`);
    window._tipAmt = 25;
  },

  sendTip(mangaId) {
    const amt = window._tipAmt || 25;
    const m = APP.mangas.find(x=>x.id===mangaId);
    if (!m) return;
    if (VPCoin.tip(APP.user.id, m.creatorId, amt, `Tip for "${m.title}"`)) {
      closeModal();
      showToast(`Tipped ${amt} VP to @${m.creator}! ❤️`,'vp');
    } else {
      showToast('Not enough VP!','error');
    }
  },

  // ── READER ──────────────────────────────
  renderReader() {
    const m = APP.currentManga;
    const ch = APP.currentChapter;
    if (!m || !ch) return navigate('discover');
    const chIdx = m.chapters.findIndex(x=>x.id===ch.id);
    const hasPrev = chIdx > 0;
    const hasNext = chIdx < m.chapters.length - 1;

    // 5 placeholder pages per chapter
    const pages = ch.pages || Array.from({length:5},(_,i)=>({num:i+1}));

    document.getElementById('mainContent').innerHTML = `
      <div class="reader-nav">
        <button class="btn-ghost btn-sm" onclick="Reader.goReaderChapter(${chIdx-1})" ${hasPrev?'':'disabled style="opacity:.3"'}>← Prev</button>
        <div class="reader-chapter-info">
          <h3>${m.title}</h3>
          <p>Chapter ${chIdx+1}: ${ch.title}</p>
        </div>
        <button class="btn-ghost btn-sm" onclick="Reader.goReaderChapter(${chIdx+1})" ${hasNext?'':'disabled style="opacity:.3"'}>Next →</button>
      </div>
      <div class="reader-pages">
        ${pages.map(p=> ch.pageImages?.[p.num-1]
          ? `<div class="reader-page"><img src="${ch.pageImages[p.num-1]}" alt="Page ${p.num}" /></div>`
          : `<div class="reader-page">
              <div class="page-placeholder">
                <div class="page-num-big">${p.num}</div>
                <p>📖 Page ${p.num} of ${pages.length}</p>
                <p style="margin-top:6px;font-size:.75rem;opacity:.6">${ch.title}</p>
              </div>
             </div>`
        ).join('')}
      </div>
      <div style="text-align:center;padding:20px 0;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
        ${hasPrev?`<button class="btn-ghost" onclick="Reader.goReaderChapter(${chIdx-1})">← Prev Chapter</button>`:''}
        <button class="btn-secondary" onclick="Reader.openManga('${m.id}')">📋 All Chapters</button>
        ${hasNext?`<button class="btn-primary" onclick="Reader.goReaderChapter(${chIdx+1})">Next Chapter →</button>`:''}
      </div>
      <button class="reader-support-btn" onclick="Reader.openTipModal('${m.id}')">🪙 Support Creator</button>
    `;
  },

  goReaderChapter(idx) {
    const m = APP.currentManga;
    if (!m || idx < 0 || idx >= m.chapters.length) return;
    const ch = m.chapters[idx];
    if (!ch.free && !VPCoin.isChapterUnlocked(ch.id)) {
      if(!VPCoin.unlockChapter(m, ch)) return;
    }
    APP.currentChapter = ch;
    navigate('reader');
  }
};

// tip/supercomment helper fns
function selectTip(amt, btn) {
  window._tipAmt = amt;
  document.querySelectorAll('#tipBtns .tip-amount-btn').forEach(b=>b.classList.remove('selected'));
  btn.classList.add('selected');
}
function selectSCDuration(days, price, btn) {
  window._scDuration = days; window._scPrice = price;
  document.querySelectorAll('#scDurationBtns .tip-amount-btn').forEach(b=>b.classList.remove('selected'));
  btn.classList.add('selected');
}
