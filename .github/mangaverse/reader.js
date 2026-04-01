/* ── reader.js: Manga Detail + Chapter Reader + Story Vote ── */
const Reader = {

  // ── MANGA DETAIL ──────────────────────────────────────────
  async renderDetail(manga) {
    if (!manga) return navigate('discover');
    document.getElementById('pageTitle').textContent = manga.title || '';

    // Increment views
    try {
      await window.FB.updateDoc(window.FB.doc(window.db, 'manga', manga.id), { views: window.FB.increment(1) });
    } catch (_) {}

    // Load chapters
    let chapters = [];
    try {
      const snap = await window.FB.getDocs(
        window.FB.query(
          window.FB.collection(window.db, 'chapters'),
          window.FB.where('mangaId', '==', manga.id),
          window.FB.orderBy('chapterNumber', 'asc')
        )
      );
      chapters = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (_) {}

    const cover = manga.coverURL
      ? `<img src="${manga.coverURL}" alt="${manga.title}" style="width:100%;border-radius:var(--radius);display:block;" />`
      : `<div class="manga-cover-ph" style="aspect-ratio:2/3;border-radius:var(--radius)"><span style="font-size:4rem">📖</span><span class="cover-txt">${manga.title}</span></div>`;

    const isCreator = window.currentUser?.uid === manga.creatorId;

    document.getElementById('mainContent').innerHTML = `
      <button class="btn-secondary btn-sm" onclick="navigate('discover')" style="margin-bottom:20px">← Back</button>

      <div class="detail-hero">
        <div class="detail-cover">${cover}</div>
        <div class="detail-info">
          <h1 class="detail-title">${manga.title}</h1>
          <div class="detail-creator">
            <div class="creator-ava">${(manga.creatorName || 'A')[0].toUpperCase()}</div>
            <span>by <strong>${manga.creatorName || 'Unknown'}</strong></span>
          </div>
          <div class="stat-row">
            <div class="stat-item"><strong>${manga.views || 0}</strong> views</div>
            <div class="stat-item"><strong>${chapters.length}</strong> chapters</div>
          </div>
          <div class="detail-tags">
            <span class="badge badge-genre">${manga.genre || 'Manga'}</span>
            ${manga.status ? `<span class="badge badge-new">${manga.status}</span>` : ''}
          </div>
          <p class="detail-synopsis">${manga.synopsis || 'No synopsis provided.'}</p>
          <div class="detail-actions">
            ${chapters.length ? `<button class="btn-primary" onclick="Reader.openChapter('${chapters[0].id}','${manga.id}')">📖 Read Chapter 1</button>` : ''}
            ${isCreator ? `<button class="btn-secondary" onclick="Creator.openAddChapter('${manga.id}')">+ Add Chapter</button>` : ''}
          </div>
        </div>
      </div>

      <div class="section-row"><div class="section-title">📋 Chapters</div></div>
      <div class="chapter-list">
        ${chapters.length
          ? chapters.map((ch, i) => `
            <div class="chapter-item" onclick="Reader.openChapter('${ch.id}','${manga.id}')">
              <div class="chapter-item-left">
                <span class="ch-num">Ch. ${ch.chapterNumber || (i+1)}</span>
                <div>
                  <div class="ch-title">${ch.title}</div>
                  ${ch.poll?.question ? '<div style="font-size:.72rem;color:var(--accent2);margin-top:2px">🗳️ Has story vote</div>' : ''}
                </div>
              </div>
              <div class="ch-meta">
                <span>👁 ${ch.views || 0}</span>
                <span>${timeAgo(ch.publishedAt)}</span>
              </div>
            </div>`).join('')
          : `<div class="empty-state" style="padding:30px"><div class="empty-desc">No chapters yet. ${isCreator ? '<br><button class="btn-primary btn-sm" onclick="Creator.openAddChapter(\''+manga.id+'\')">+ Add First Chapter</button>' : 'Check back soon!'}</div></div>`
        }
      </div>
    `;
  },

  // ── CHAPTER READER ──────────────────────────────────────────
  async renderChapter(manga, chapter) {
    if (!manga || !chapter) { navigate('discover'); return; }

    // Get latest chapter data (with poll)
    let ch = chapter;
    try {
      const snap = await window.FB.getDoc(window.FB.doc(window.db, 'chapters', chapter.id));
      if (snap.exists()) ch = { id: snap.id, ...snap.data() };
    } catch (_) {}

    // Increment chapter views
    try { await window.FB.updateDoc(window.FB.doc(window.db, 'chapters', ch.id), { views: window.FB.increment(1) }); } catch (_) {}

    // Load all chapters for prev/next
    let allChapters = [];
    try {
      const snap = await window.FB.getDocs(
        window.FB.query(window.FB.collection(window.db, 'chapters'), window.FB.where('mangaId', '==', manga.id), window.FB.orderBy('chapterNumber', 'asc'))
      );
      allChapters = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (_) {}

    const idx = allChapters.findIndex(c => c.id === ch.id);
    const prevCh = idx > 0 ? allChapters[idx - 1] : null;
    const nextCh = idx < allChapters.length - 1 ? allChapters[idx + 1] : null;
    const pages = ch.pageURLs || [];

    document.getElementById('mainContent').innerHTML = `
      <div class="reader-nav">
        <button class="btn-secondary btn-sm" ${prevCh ? `onclick="Reader.openChapter('${prevCh.id}','${manga.id}')"` : 'disabled style="opacity:.3"'}>← Prev</button>
        <div class="reader-info">
          <h3>${manga.title}</h3>
          <p>Chapter ${ch.chapterNumber || (idx+1)}: ${ch.title}</p>
        </div>
        <button class="btn-secondary btn-sm" ${nextCh ? `onclick="Reader.openChapter('${nextCh.id}','${manga.id}')"` : 'disabled style="opacity:.3"'}>Next →</button>
      </div>

      <div class="reader-pages">
        ${pages.length
          ? pages.map(url => `<div class="reader-page"><img src="${url}" alt="page" loading="lazy" /></div>`).join('')
          : `<div class="page-placeholder"><div class="page-num-big">?</div><p style="color:var(--text3)">No pages uploaded for this chapter yet.</p></div>`
        }
      </div>

      <!-- Story Vote -->
      <div id="voteSection"></div>

      <!-- Comments -->
      <div id="commentsSection"></div>

      <div class="reader-footer">
        ${prevCh ? `<button class="btn-secondary" onclick="Reader.openChapter('${prevCh.id}','${manga.id}')">← Prev Chapter</button>` : ''}
        <button class="btn-secondary" onclick="navigate('mangaDetail',{manga:window._manga})">📋 All Chapters</button>
        ${nextCh ? `<button class="btn-primary" onclick="Reader.openChapter('${nextCh.id}','${manga.id}')">Next Chapter →</button>` : ''}
      </div>
    `;

    // Render poll + comments async
    this.renderVote(ch, manga, nextCh);
    this.renderComments(ch.id);
  },

  async openChapter(chapterId, mangaId) {
    showLoading();
    try {
      let manga = window._manga;
      if (!manga || manga.id !== mangaId) {
        const snap = await window.FB.getDoc(window.FB.doc(window.db, 'manga', mangaId));
        manga = { id: snap.id, ...snap.data() };
        window._manga = manga;
      }
      const chSnap = await window.FB.getDoc(window.FB.doc(window.db, 'chapters', chapterId));
      const chapter = { id: chSnap.id, ...chSnap.data() };
      window._chapter = chapter;
      hideLoading();
      navigate('reader', { manga, chapter });
    } catch (e) {
      hideLoading();
      showToast('Error loading chapter', 'error');
    }
  },

  // ── STORY VOTE ──────────────────────────────────────────────
  async renderVote(ch, manga, nextCh) {
    const voteEl = document.getElementById('voteSection');
    if (!voteEl) return;
    const poll = ch.poll;
    if (!poll || !poll.question) { voteEl.innerHTML = ''; return; }

    const uid = window.currentUser?.uid;
    const myVote = uid && poll.votes ? poll.votes[uid] : null;
    const hasVoted = myVote !== null && myVote !== undefined;
    const totalVotes = poll.votes ? Object.keys(poll.votes).length : 0;
    const isClosed = !poll.isOpen;
    const showResults = hasVoted || isClosed;

    const optionCounts = (poll.options || []).map((_, i) =>
      Object.values(poll.votes || {}).filter(v => v === i).length
    );
    const maxCount = Math.max(...optionCounts, 1);

    voteEl.innerHTML = `
      <div class="vote-section">
        <div class="vote-label">🗳️ Story Vote${isClosed ? ' — Closed' : ''}</div>
        <div class="vote-question">${poll.question}</div>
        <div class="vote-options" id="voteOptions">
          ${(poll.options || []).map((opt, i) => {
            const pct = totalVotes > 0 ? Math.round((optionCounts[i] / totalVotes) * 100) : 0;
            const isWon = isClosed && optionCounts[i] === maxCount;
            const isMine = hasVoted && myVote === i;
            if (showResults) {
              return `<div class="vote-option-btn ${isMine ? 'voted' : ''} ${isWon ? 'won' : ''}" style="cursor:default">
                <div class="vote-bar ${isWon ? 'won-bar' : ''}" style="width:${pct}%"></div>
                <div class="vote-option-text">
                  <span>${isWon ? '🏆 ' : ''}${opt}${isMine ? ' ✓' : ''}</span>
                  <span class="vote-pct">${pct}%</span>
                </div>
              </div>`;
            } else {
              return `<button class="vote-option-btn" onclick="Reader.castVote('${ch.id}','${manga.id}',${i})">
                <div class="vote-option-text"><span>${opt}</span></div>
              </button>`;
            }
          }).join('')}
        </div>
        <div class="vote-meta">
          <span>👥 ${totalVotes} reader${totalVotes !== 1 ? 's' : ''} voted</span>
          ${isClosed ? '<span class="vote-closed-badge">✅ Closed</span>' : '<span style="color:var(--accent2)">⏳ Vote closes with next chapter</span>'}
          ${nextCh && !isClosed ? `<span>→ Chapter ${nextCh.chapterNumber} coming</span>` : ''}
        </div>
      </div>
    `;
  },

  async castVote(chapterId, mangaId, optionIndex) {
    const uid = window.currentUser?.uid;
    if (!uid) return showToast('Sign in to vote', 'error');
    showLoading();
    try {
      const chRef = window.FB.doc(window.db, 'chapters', chapterId);
      await window.FB.updateDoc(chRef, {
        [`poll.votes.${uid}`]: optionIndex
      });
      // Refresh render
      const snap = await window.FB.getDoc(chRef);
      const ch = { id: snap.id, ...snap.data() };
      window._chapter = ch;

      let allChapters = [];
      try {
        const s = await window.FB.getDocs(
          window.FB.query(window.FB.collection(window.db, 'chapters'), window.FB.where('mangaId', '==', mangaId), window.FB.orderBy('chapterNumber', 'asc'))
        );
        allChapters = s.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (_) {}
      const idx = allChapters.findIndex(c => c.id === chapterId);
      const nextCh = idx < allChapters.length - 1 ? allChapters[idx + 1] : null;

      hideLoading();
      showToast('Vote cast! 🗳️', 'success');
      this.renderVote(ch, window._manga, nextCh);
    } catch (e) {
      hideLoading();
      showToast('Vote failed: ' + e.message, 'error');
    }
  },

  // ── COMMENTS ───────────────────────────────────────────────
  async renderComments(chapterId) {
    const el = document.getElementById('commentsSection');
    if (!el) return;

    let comments = [];
    try {
      const snap = await window.FB.getDocs(
        window.FB.query(window.FB.collection(window.db, 'comments'), window.FB.where('chapterId', '==', chapterId), window.FB.orderBy('createdAt', 'desc'))
      );
      comments = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (_) {}

    el.innerHTML = `
      <div class="comments-section">
        <div class="comments-header">💬 Comments (${comments.length})</div>
        <div class="comment-input-row">
          <textarea id="commentText" placeholder="Share your thoughts..." rows="2"></textarea>
          <button class="btn-primary btn-sm" onclick="Reader.postComment('${chapterId}')">Post</button>
        </div>
        <div id="commentsList">
          ${comments.length
            ? comments.map(c => `
              <div class="comment-item">
                <div class="comment-ava">${(c.userName || 'A')[0].toUpperCase()}</div>
                <div class="comment-body">
                  <span class="comment-name">${c.userName || 'Anonymous'}</span>
                  <span class="comment-time">${timeAgo(c.createdAt)}</span>
                  <div class="comment-text">${c.text}</div>
                </div>
              </div>`).join('')
            : '<div class="comment-empty">No comments yet. Be the first!</div>'
          }
        </div>
      </div>
    `;
  },

  async postComment(chapterId) {
    const text = document.getElementById('commentText')?.value?.trim();
    const uid  = window.currentUser?.uid;
    const name = window.currentUser?.displayName || 'Anonymous';
    if (!uid) return showToast('Sign in to comment', 'error');
    if (!text) return showToast('Write something first', 'error');
    showLoading();
    try {
      await window.FB.addDoc(window.FB.collection(window.db, 'comments'), {
        chapterId, text, userId: uid, userName: name,
        createdAt: window.FB.serverTimestamp()
      });
      hideLoading();
      showToast('Comment posted!', 'success');
      this.renderComments(chapterId);
    } catch (e) {
      hideLoading();
      showToast('Failed to post comment', 'error');
    }
  }
};
