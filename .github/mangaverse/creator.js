/* ── creator.js: Creator Hub, Analytics, Upload ── */
const Creator = {
  activeTab: 'dashboard',

  render() {
    const u = APP.user;
    if (u.role !== 'creator') {
      document.getElementById('mainContent').innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">✏️</div>
          <div class="empty-title">Become a Creator</div>
          <div class="empty-desc">Switch to creator mode to upload manga and start earning VP Coins!</div>
          <button class="btn-primary" onclick="switchRole('creator');navigate('creator')">Enable Creator Mode</button>
        </div>`;
      return;
    }
    this.renderTab(this.activeTab);
  },

  renderTab(tab) {
    this.activeTab = tab;
    const tabs = ['dashboard','upload','manage','earnings'];
    const myMangas = APP.mangas.filter(m => m.creatorId === APP.user.id);
    const u = APP.user;

    let tabContent = '';
    if (tab === 'dashboard')  tabContent = this.renderDashboard(myMangas, u);
    if (tab === 'upload')     tabContent = this.renderUpload();
    if (tab === 'manage')     tabContent = this.renderManage(myMangas);
    if (tab === 'earnings')   tabContent = this.renderEarnings(u);

    document.getElementById('mainContent').innerHTML = `
      <div class="creator-tabs">
        ${tabs.map(t=>`<button class="creator-tab ${this.activeTab===t?'active':''}" onclick="Creator.renderTab('${t}')">${{dashboard:'📊 Dashboard',upload:'➕ Upload',manage:'📚 My Works',earnings:'💰 Earnings'}[t]}</button>`).join('')}
      </div>
      ${tabContent}
    `;
    if (tab === 'dashboard') this.drawCharts(myMangas);
  },

  // ── DASHBOARD ─────────────────────────
  renderDashboard(myMangas, u) {
    const totalViews = myMangas.reduce((s,m)=>s+(m.totalViews||0),0);
    const totalChapters = myMangas.reduce((s,m)=>s+(m.chapters?.length||0),0);
    const tier = getTier(u.vpCoins||0);
    const inr = Math.floor((u.vpCoins||0)*0.7);

    return `
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-val" style="color:var(--accent3)">${(u.vpCoins||0).toLocaleString()}</div><div class="stat-lbl">VP Coins Earned</div><div class="stat-change">≈ ₹${inr}</div></div>
        <div class="stat-card"><div class="stat-val">${myMangas.length}</div><div class="stat-lbl">Manga Published</div></div>
        <div class="stat-card"><div class="stat-val">${totalChapters}</div><div class="stat-lbl">Chapters Uploaded</div></div>
        <div class="stat-card"><div class="stat-val">${totalViews.toLocaleString()}</div><div class="stat-lbl">Total Views</div></div>
        <div class="stat-card"><div class="stat-val"><span class="tier-badge ${tier.cls}">${tier.label}</span></div><div class="stat-lbl">Creator Tier</div></div>
      </div>
      <div class="chart-wrap"><div class="chart-wrap-title">📈 Views This Week</div><canvas id="chartViews" height="120"></canvas></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
        <div class="chart-wrap"><div class="chart-wrap-title">🪙 VP Earnings Breakdown</div><canvas id="chartVP" height="180"></canvas></div>
        <div class="chart-wrap"><div class="chart-wrap-title">📊 Chapter Performance</div><canvas id="chartChapters" height="180"></canvas></div>
      </div>
      <div class="card" style="margin-top:16px;">
        <div class="section-title" style="margin-bottom:12px;">🚀 Tips to Grow</div>
        ${['Post new chapters regularly (3x more views!)', 'Reply to comments to build community', 'Set first 2 chapters free to attract readers', 'Use season events for double VP earnings', 'Share your manga link on social media'].map(t=>`<div style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,.05);font-size:.85rem;color:var(--text-2);">✅ ${t}</div>`).join('')}
      </div>`;
  },

  drawCharts(myMangas) {
    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const viewsData = days.map(()=>Math.floor(Math.random()*500+100));
    const chartOpts = {
      plugins:{legend:{labels:{color:'#a8a4c8',font:{family:'Outfit'}}}},
      scales:{x:{ticks:{color:'#5e5a7e'},grid:{color:'rgba(255,255,255,.05)'}},y:{ticks:{color:'#5e5a7e'},grid:{color:'rgba(255,255,255,.05)'}}}
    };

    try {
      const cv = document.getElementById('chartViews');
      if (cv) new Chart(cv,{type:'line',data:{labels:days,datasets:[{label:'Views',data:viewsData,borderColor:'#c026d3',backgroundColor:'rgba(192,38,211,.1)',tension:.4,fill:true}]},options:{...chartOpts,plugins:{legend:{display:false}}}});

      const cvp = document.getElementById('chartVP');
      if (cvp) new Chart(cvp,{type:'doughnut',data:{labels:['Tips (70%)','Chapter Unlocks (70%)','Bonuses'],datasets:[{data:[60,30,10],backgroundColor:['#c026d3','#06b6d4','#f59e0b'],borderWidth:0}]},options:{plugins:{legend:{labels:{color:'#a8a4c8',font:{family:'Outfit'}}}}}});

      const cch = document.getElementById('chartChapters');
      if (myMangas.length && cch) {
        const labels = myMangas.flatMap(m=>m.chapters.map(c=>c.title.slice(0,10)));
        const data   = myMangas.flatMap(m=>m.chapters.map(c=>c.views||0));
        new Chart(cch,{type:'bar',data:{labels,datasets:[{label:'Views',data,backgroundColor:'rgba(6,182,212,.6)',borderRadius:4}]},options:{...chartOpts,plugins:{legend:{display:false}}}});
      }
    } catch(e) {}
  },

  // ── UPLOAD ─────────────────────────────
  renderUpload() {
    return `
      <div class="card">
        <div class="section-title" style="margin-bottom:20px;">📤 Upload New Manga</div>
        <div class="form-group"><label>Manga Title *</label><input type="text" id="upTitle" placeholder="e.g. Shadow Blade Vol.1" /></div>
        <div class="form-group"><label>Genre *</label>
          <select id="upGenre">
            ${['Action','Romance','Fantasy','SciFi','Horror','SliceOfLife','Comedy','Drama','Mystery'].map(g=>`<option>${g}</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label>Synopsis *</label><textarea id="upDesc" placeholder="Tell readers what your manga is about..."></textarea></div>
        <div class="form-group">
          <label>Cover Image</label>
          <div class="upload-area" id="coverUploadArea" onclick="document.getElementById('coverFileInput').click()">
            <div class="upload-icon">🖼️</div>
            <div class="upload-text">Click to upload cover image</div>
            <div class="upload-hint">JPG, PNG or WEBP • Max 2MB</div>
            <img id="coverPreview" class="upload-preview" style="display:none;" />
          </div>
          <input type="file" id="coverFileInput" accept="image/*" style="display:none" onchange="Creator.previewCover(this)" />
        </div>
        <div class="form-group">
          <label>Emoji Icon (if no cover)</label>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px;">
            ${['⚔️','🌸','⚡','🌲','👊','👻','🐉','🔮','💀','🦅','🌙','🔥'].map(e=>`<button class="tip-amount-btn" onclick="Creator.selectEmoji('${e}',this)" style="font-size:1.4rem;padding:8px;">${e}</button>`).join('')}
          </div>
        </div>
        <div class="form-group">
          <label>First Chapter Title *</label>
          <input type="text" id="upChTitle" placeholder="e.g. The Beginning" />
        </div>
        <div class="form-group">
          <label>Chapter Type</label>
          <div style="display:flex;gap:10px;margin-top:6px;">
            <button class="tip-amount-btn selected" id="chFreeBtn" onclick="Creator.setChFree(true)">🔓 Free</button>
            <button class="tip-amount-btn" id="chPaidBtn" onclick="Creator.setChFree(false)">🔒 Paid</button>
          </div>
        </div>
        <div class="form-group" id="chPriceGroup" style="display:none">
          <label>Price (VP Coins)</label>
          <input type="number" id="upChPrice" value="10" min="5" max="200" />
        </div>
        <div class="form-group">
          <label>Chapter Pages (Images)</label>
          <div class="upload-area" id="pagesUploadArea" onclick="document.getElementById('pagesFileInput').click()">
            <div class="upload-icon">📄</div>
            <div class="upload-text">Upload page images (select multiple)</div>
            <div class="upload-hint">Select multiple images for each page</div>
          </div>
          <input type="file" id="pagesFileInput" accept="image/*" multiple style="display:none" onchange="Creator.previewPages(this)" />
          <div id="pagesPreviewList" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;"></div>
        </div>
        <button class="btn-primary w-full" style="margin-top:8px;" onclick="Creator.publishManga()">🚀 Publish Manga</button>
      </div>`;
  },

  selectedEmoji: '📖',
  chapterFree: true,
  coverDataURL: null,
  pageDataURLs: [],

  selectEmoji(e, btn) {
    this.selectedEmoji = e;
    document.querySelectorAll('#upGenre ~ div .tip-amount-btn').forEach(b=>b.classList.remove('selected'));
    btn.classList.add('selected');
  },

  setChFree(free) {
    this.chapterFree = free;
    document.getElementById('chFreeBtn').classList.toggle('selected', free);
    document.getElementById('chPaidBtn').classList.toggle('selected', !free);
    document.getElementById('chPriceGroup').style.display = free ? 'none' : 'block';
  },

  previewCover(input) {
    const file = input.files[0];
    if (!file) return;
    if (file.size > 2*1024*1024) return showToast('Image too large (max 2MB)','error');
    const r = new FileReader();
    r.onload = e => {
      this.coverDataURL = e.target.result;
      const img = document.getElementById('coverPreview');
      img.src = e.target.result;
      img.style.display = 'block';
    };
    r.readAsDataURL(file);
  },

  previewPages(input) {
    const files = Array.from(input.files);
    this.pageDataURLs = [];
    const preview = document.getElementById('pagesPreviewList');
    preview.innerHTML = '';
    let loaded = 0;
    files.forEach((file, i) => {
      const r = new FileReader();
      r.onload = e => {
        this.pageDataURLs[i] = e.target.result;
        loaded++;
        const thumb = document.createElement('div');
        thumb.style.cssText = 'width:50px;height:66px;border-radius:4px;overflow:hidden;border:1px solid rgba(255,255,255,.1);';
        thumb.innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;" />`;
        preview.appendChild(thumb);
        if (loaded === files.length) showToast(`${files.length} pages loaded!`,'success');
      };
      r.readAsDataURL(file);
    });
  },

  publishManga() {
    const title  = document.getElementById('upTitle').value.trim();
    const genre  = document.getElementById('upGenre').value;
    const desc   = document.getElementById('upDesc').value.trim();
    const chTitle= document.getElementById('upChTitle').value.trim();
    if (!title || !desc || !chTitle) return showToast('Fill in all required fields','error');

    const price = this.chapterFree ? null : (parseInt(document.getElementById('upChPrice')?.value)||10);
    const u = APP.user;
    const mangaId = 'm_'+Date.now();
    const chId = 'c1_'+Date.now();

    const newManga = {
      id: mangaId,
      title, genre, description: desc,
      creator: u.name,
      creatorId: u.id,
      emoji: this.selectedEmoji,
      coverData: this.coverDataURL || null,
      chapters: [{
        id: chId,
        title: chTitle,
        free: this.chapterFree,
        price: price,
        views: 0,
        pageImages: this.pageDataURLs.length ? this.pageDataURLs : null
      }],
      totalViews: 0,
      rating: 4.5,
      isHot: false,
      createdAt: Date.now(),
      comments: []
    };

    const mangas = APP.mangas;
    mangas.unshift(newManga);
    APP.mangas = mangas;

    // Update creator stats
    u.works = (u.works||0) + 1;
    APP.user = u;
    // milestone bonus
    if (u.works === 1) {
      VPCoin.earn(100, 'First manga published! Milestone bonus');
      Notifications.add('🎉','You published your first manga! +100 VP bonus!');
      showToast('+100 VP First Manga Bonus!','vp');
    }

    Notifications.add('🚀',`"${title}" published successfully! Start sharing it with readers.`);
    showToast(`"${title}" published! 🎉`,'success');
    this.coverDataURL = null;
    this.pageDataURLs = [];
    this.renderTab('manage');
  },

  // ── MANAGE ─────────────────────────────
  renderManage(myMangas) {
    if (!myMangas.length) return `<div class="empty-state"><div class="empty-icon">📚</div><div class="empty-title">No manga yet</div><div class="empty-desc">Upload your first manga to get started!</div><button class="btn-primary" onclick="Creator.renderTab('upload')">+ Upload Manga</button></div>`;
    return `
      <div class="manage-list">
        ${myMangas.map(m=>`
          <div class="manage-item">
            <div class="manage-thumb">${m.coverData?`<img src="${m.coverData}" style="width:100%;height:100%;object-fit:cover;">`:m.emoji||'📖'}</div>
            <div class="manage-info">
              <div class="manage-title">${m.title}</div>
              <div class="manage-meta">
                <span>${m.chapters.length} chapters</span>
                <span>👁 ${(m.totalViews||0).toLocaleString()} views</span>
                <span class="tag">${m.genre}</span>
                <span>${m.chapters.some(c=>!c.free)?'<span class="badge-paid">Has Paid</span>':'<span class="badge-free">All Free</span>'}</span>
              </div>
            </div>
            <div class="manage-actions">
              <button class="btn-secondary btn-sm" onclick="Creator.openAddChapter('${m.id}')">+ Chapter</button>
              <button class="btn-danger btn-sm" onclick="Creator.deleteManga('${m.id}')">🗑</button>
            </div>
          </div>`).join('')}
      </div>`;
  },

  openAddChapter(mangaId) {
    openModal(`<div class="modal-box">
      <button class="modal-close" onclick="closeModal()">✕</button>
      <div class="modal-title">➕ Add Chapter</div>
      <div class="form-group"><label>Chapter Title</label><input type="text" id="newChTitle" placeholder="Chapter title..." /></div>
      <div style="display:flex;gap:10px;margin:10px 0;">
        <button class="tip-amount-btn selected" id="nchFree" onclick="this.classList.add('selected');document.getElementById('nchPaid').classList.remove('selected');document.getElementById('nchPriceG').style.display='none'">🔓 Free</button>
        <button class="tip-amount-btn" id="nchPaid" onclick="this.classList.add('selected');document.getElementById('nchFree').classList.remove('selected');document.getElementById('nchPriceG').style.display='block'">🔒 Paid</button>
      </div>
      <div class="form-group" id="nchPriceG" style="display:none"><label>Price (VP)</label><input type="number" id="newChPrice" value="10" min="5" /></div>
      <div class="form-group">
        <label>Pages (images)</label>
        <input type="file" accept="image/*" multiple id="nchPages" style="color:var(--text-1)" onchange="Creator.storeNewChPages(this)" />
      </div>
      <div class="modal-actions">
        <button class="btn-ghost" onclick="closeModal()">Cancel</button>
        <button class="btn-primary" onclick="Creator.addChapter('${mangaId}')">Add Chapter</button>
      </div>
    </div>`);
    window._nchPageURLs = [];
  },

  storeNewChPages(input) {
    const files = Array.from(input.files);
    window._nchPageURLs = [];
    let loaded = 0;
    files.forEach((f,i)=>{
      const r = new FileReader();
      r.onload = e => { window._nchPageURLs[i] = e.target.result; loaded++; if(loaded===files.length) showToast(`${files.length} pages ready`,'success'); };
      r.readAsDataURL(f);
    });
  },

  addChapter(mangaId) {
    const title = document.getElementById('newChTitle').value.trim();
    if (!title) return showToast('Enter chapter title','error');
    const isFree = document.getElementById('nchFree').classList.contains('selected');
    const price = isFree ? null : (parseInt(document.getElementById('newChPrice')?.value)||10);
    const mangas = APP.mangas;
    const idx = mangas.findIndex(m=>m.id===mangaId);
    if (idx===-1) return;
    const chId = 'c_'+Date.now();
    mangas[idx].chapters.push({ id:chId, title, free:isFree, price, views:0, pageImages: window._nchPageURLs?.length ? window._nchPageURLs : null });
    APP.mangas = mangas;
    APP.currentManga = mangas[idx];
    closeModal();
    showToast(`Chapter "${title}" added!`,'success');
    Notifications.add('📖',`New chapter in "${mangas[idx].title}" is live!`);
    this.renderTab('manage');
  },

  deleteManga(mangaId) {
    if (!confirm('Delete this manga? This cannot be undone.')) return;
    const mangas = APP.mangas.filter(m=>m.id!==mangaId);
    APP.mangas = mangas;
    const u = APP.user;
    u.works = Math.max(0,(u.works||1)-1);
    APP.user = u;
    showToast('Manga deleted','');
    this.renderTab('manage');
  },

  // ── EARNINGS ─────────────────────────────
  renderEarnings(u) {
    const inr = Math.floor((u.vpCoins||0)*0.7);
    const ledger = VPCoin.getLedger();
    return `
      <div class="withdraw-card">
        <div class="withdraw-title">💰 Total Earnings</div>
        <div class="withdraw-bal">${(u.vpCoins||0).toLocaleString()} VP</div>
        <div class="withdraw-inr">= ₹${inr} withdrawable (70% share)</div>
        ${(u.vpCoins||0)>=500
          ? `<button class="btn-primary" onclick="openWithdrawModal()">💸 Withdraw to UPI/Bank</button>`
          : `<p style="color:var(--text-3);font-size:.84rem;margin-top:8px;">Need 500 VP min. You have ${u.vpCoins||0} VP (${500-(u.vpCoins||0)} more needed)</p>`}
      </div>
      <div class="card">
        <div class="section-title" style="margin-bottom:4px">Earning Structure</div>
        <p style="font-size:.8rem;color:var(--text-3);margin-bottom:16px">All VP credited after 30% platform commission</p>
        <div style="display:grid;gap:8px">
          ${[['🪙 Tips from readers','70% of every tip goes to you'],['🔓 Paid chapter unlock','70% per unlock — set your own price'],['⭐ Super Comments','70% of Super Comment VP'],['🏆 Top-10 monthly bonus','+500 VP from platform pool'],['🎯 Milestones','100 readers=+100VP, 500=+250VP, 1000=+500VP']].map(([t,d])=>`<div style="background:var(--bg-glass);border:1px solid var(--border);border-radius:var(--radius-sm);padding:12px;"><div style="font-size:.85rem;font-weight:600;">${t}</div><div style="font-size:.78rem;color:var(--text-3);margin-top:2px;">${d}</div></div>`).join('')}
        </div>
      </div>
      <div class="card" style="margin-top:16px;">
        <div class="section-title" style="margin-bottom:12px">📋 Transaction History</div>
        ${ledger.length
          ? ledger.slice(0,20).map(l=>`<div class="ledger-item"><div><div class="ledger-desc">${l.desc}</div><div class="ledger-meta">${timeAgo(l.time)}</div></div><div class="${l.amount>=0?'ledger-amt-earn':'ledger-amt-spend'}">${l.amount>=0?'+':''} ${l.amount} VP</div></div>`).join('')
          : '<div class="empty-state" style="padding:20px"><div class="empty-desc">No transactions yet</div></div>'}
      </div>`;
  }
};
