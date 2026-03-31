/* ── app.js: Router + State + Seed Data ── */

// ═══════════════════════════════════
//  GLOBAL STATE
// ═══════════════════════════════════
const APP = {
  currentPage: 'discover',
  currentManga: null,
  currentChapter: null,
  searchQuery: '',

  get user() { return JSON.parse(localStorage.getItem('mv_user') || 'null'); },
  set user(v) { localStorage.setItem('mv_user', JSON.stringify(v)); },

  get mangas() { return JSON.parse(localStorage.getItem('mv_mangas') || '[]'); },
  set mangas(v) { localStorage.setItem('mv_mangas', JSON.stringify(v)); },

  get users() { return JSON.parse(localStorage.getItem('mv_users') || '[]'); },
  set users(v) { localStorage.setItem('mv_users', JSON.stringify(v)); },
};

// ═══════════════════════════════════
//  SEED DATA
// ═══════════════════════════════════
const SEED_MANGAS = [
  {id:'m1',title:'Shadow Blade Chronicles',genre:'Action',creator:'AkiraX',creatorId:'seed1',description:'A lone warrior discovers he wields the legendary shadow blade, drawn into a war between ancient clans.',chapters:[{id:'c1',title:'The Awakening',free:true,views:2840},{id:'c2',title:'First Blood',free:true,views:2100},{id:'c3',title:'Shadow Rising',free:false,price:10,views:1200},{id:'c4',title:"Hunter's Mark",free:false,price:10,views:880}],cover:null,emoji:'⚔️',totalViews:7020,rating:4.8,isHot:true,createdAt:Date.now()-7*86400000},
  {id:'m2',title:'Sakura Cafe Dreams',genre:'Romance',creator:'YukiDraw',creatorId:'seed2',description:'A barista with a secret talent for art finds love in the most unexpected corner of Tokyo.',chapters:[{id:'c1',title:'First Brew',free:true,views:3200},{id:'c2',title:'Latte Art',free:true,views:2900},{id:'c3',title:'Late Night Customer',free:false,price:15,views:1500}],cover:null,emoji:'🌸',totalViews:7600,rating:4.9,isHot:false,createdAt:Date.now()-14*86400000},
  {id:'m3',title:'Neon Demon City',genre:'SciFi',creator:'VoidMaster',creatorId:'seed3',description:'In 2099 Neo-Osaka, a hacker uncovers a conspiracy that links corporations to an alien signal.',chapters:[{id:'c1',title:'Boot Sequence',free:true,views:1800},{id:'c2',title:'Firewall',free:false,price:12,views:900}],cover:null,emoji:'⚡',totalViews:2700,rating:4.6,isHot:true,createdAt:Date.now()-3*86400000},
  {id:'m4',title:'Spirit Forest',genre:'Fantasy',creator:'MoonArtist',creatorId:'seed4',description:'A young girl ventures into a forest where spirits roam and ancient magic shapes destiny.',chapters:[{id:'c1',title:'Into the Woods',free:true,views:4100},{id:'c2',title:'The Spirit Well',free:true,views:3600},{id:'c3',title:"Forest Guardian's Trial",free:false,price:8,views:2200},{id:'c4',title:'Ancient Bond',free:false,price:8,views:1800}],cover:null,emoji:'🌲',totalViews:11700,rating:4.7,isHot:false,createdAt:Date.now()-21*86400000},
  {id:'m5',title:'Iron Fist Academy',genre:'Action',creator:'AkiraX',creatorId:'seed1',description:'A martial arts school hides a deadly secret — only the strongest student will survive its final exam.',chapters:[{id:'c1',title:'Enrollment Day',free:true,views:1600},{id:'c2',title:'The First Test',free:false,price:10,views:700}],cover:null,emoji:'👊',totalViews:2300,rating:4.4,isHot:false,createdAt:Date.now()-5*86400000},
  {id:'m6',title:'Ghost Protocol 7',genre:'Horror',creator:'DarkInk',creatorId:'seed5',description:'Seven friends stream themselves in an abandoned hospital — only to discover they are not alone.',chapters:[{id:'c1',title:'Live or Die',free:true,views:5500},{id:'c2',title:"Room 404",free:true,views:4900},{id:'c3',title:'The Watcher',free:false,price:20,views:3100}],cover:null,emoji:'👻',totalViews:13500,rating:4.5,isHot:true,createdAt:Date.now()-10*86400000},
];

const SEED_USERS = [
  {id:'seed1',name:'AkiraX',email:'akira@demo.com',role:'creator',vpCoins:18400,tier:'diamond',works:2,totalReaders:9320,joinedAt:Date.now()-90*86400000},
  {id:'seed2',name:'YukiDraw',email:'yuki@demo.com',role:'creator',vpCoins:12900,tier:'diamond',works:1,totalReaders:7600,joinedAt:Date.now()-120*86400000},
  {id:'seed3',name:'VoidMaster',email:'void@demo.com',role:'creator',vpCoins:5400,tier:'gold',works:1,totalReaders:2700,joinedAt:Date.now()-30*86400000},
  {id:'seed4',name:'MoonArtist',email:'moon@demo.com',role:'creator',vpCoins:9800,tier:'gold',works:1,totalReaders:11700,joinedAt:Date.now()-60*86400000},
  {id:'seed5',name:'DarkInk',email:'dark@demo.com',role:'creator',vpCoins:22000,tier:'legend',works:1,totalReaders:13500,joinedAt:Date.now()-180*86400000},
];

function seedIfNeeded() {
  if (!localStorage.getItem('mv_seeded')) {
    APP.mangas = SEED_MANGAS;
    const existing = APP.users;
    const ids = existing.map(u => u.id);
    SEED_USERS.forEach(u => { if (!ids.includes(u.id)) existing.push(u); });
    APP.users = existing;
    localStorage.setItem('mv_seeded','1');
  }
}

// ═══════════════════════════════════
//  ROUTER
// ═══════════════════════════════════
const PAGE_TITLES = {
  discover:'Discover', leaderboard:'🏆 Rankings', store:'🪙 VP Store',
  creator:'✏️ Creator Hub', profile:'👤 Profile',
  mangaDetail:'Manga Detail', reader:'Reader', searchResults:'Search Results'
};

function navigate(page, data) {
  if (!APP.user && page !== 'auth') return;
  APP.currentPage = page;
  if (data) APP.currentManga = data;

  // update active nav
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });

  const title = PAGE_TITLES[page] || page;
  document.getElementById('pageTitle').textContent = title;

  const content = document.getElementById('mainContent');
  content.innerHTML = '';
  content.className = 'content page-enter';

  switch(page) {
    case 'discover':    Reader.renderDiscover(); break;
    case 'leaderboard': Leaderboard.render(); break;
    case 'store':       Store.render(); break;
    case 'creator':     Creator.render(); break;
    case 'profile':     renderProfile(); break;
    case 'mangaDetail': Reader.renderMangaDetail(); break;
    case 'reader':      Reader.renderReader(); break;
    case 'searchResults': Reader.renderSearch(); break;
  }
  window.scrollTo(0,0);
}

// ═══════════════════════════════════
//  SIDEBAR TOGGLE
// ═══════════════════════════════════
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

// ═══════════════════════════════════
//  MODAL
// ═══════════════════════════════════
function openModal(html) {
  document.getElementById('modalContainer').innerHTML = html;
  document.getElementById('modalOverlay').classList.remove('hidden');
  document.getElementById('modalContainer').classList.remove('hidden');
}
function closeModal() {
  document.getElementById('modalOverlay').classList.add('hidden');
  document.getElementById('modalContainer').classList.add('hidden');
}

// ═══════════════════════════════════
//  TOAST
// ═══════════════════════════════════
function showToast(msg, type='') {
  const c = document.getElementById('toastContainer');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

// ═══════════════════════════════════
//  TIER HELPER
// ═══════════════════════════════════
function getTier(vp) {
  if (vp >= 50000) return {key:'legend', label:'👑 Legend', cls:'tier-legend'};
  if (vp >= 10000) return {key:'diamond', label:'💎 Diamond', cls:'tier-diamond'};
  if (vp >= 2000)  return {key:'gold',    label:'🥇 Gold',    cls:'tier-gold'};
  if (vp >= 500)   return {key:'silver',  label:'🥈 Silver',  cls:'tier-silver'};
  return              {key:'bronze',  label:'🥉 Bronze',  cls:'tier-bronze'};
}

// ═══════════════════════════════════
//  UPDATE VP UI
// ═══════════════════════════════════
function updateVPUI() {
  const u = APP.user;
  if (!u) return;
  const vp = u.vpCoins || 0;
  const inr = Math.floor(vp * 0.7);
  document.getElementById('sidebarVP').textContent = vp.toLocaleString() + ' VP';
  document.getElementById('sidebarVPInr').textContent = '≈ ₹' + inr;
  document.getElementById('topbarVP').textContent = vp.toLocaleString();
}

// ═══════════════════════════════════
//  PROFILE PAGE
// ═══════════════════════════════════
function renderProfile() {
  const u = APP.user;
  const tier = getTier(u.vpCoins || 0);
  const streak = u.loginStreak || 1;
  const initials = u.name.slice(0,2).toUpperCase();
  const isCreator = u.role === 'creator';

  document.getElementById('mainContent').innerHTML = `
    <div class="profile-hero">
      <div class="profile-ava">${initials}</div>
      <div class="profile-info">
        <div class="profile-name">${u.name}</div>
        <div class="profile-role">
          <span>${isCreator ? '✏️ Creator' : '📖 Reader'}</span>
          <span class="tier-badge ${tier.cls}">${tier.label}</span>
          <span class="streak-badge">🔥 ${streak} day streak</span>
        </div>
        <div class="profile-stats-row">
          <div><div class="p-stat-val">${(u.vpCoins||0).toLocaleString()}</div><div class="p-stat-lbl">VP Coins</div></div>
          <div><div class="p-stat-val">${isCreator?(u.works||0):( u.readCount||0)}</div><div class="p-stat-lbl">${isCreator?'Works':'Chapters Read'}</div></div>
          <div><div class="p-stat-val">₹${Math.floor((u.vpCoins||0)*0.7)}</div><div class="p-stat-lbl">Withdrawable</div></div>
        </div>
      </div>
    </div>

    ${isCreator ? `
    <div class="withdraw-card">
      <div class="withdraw-title">💸 Earnings Withdrawal</div>
      <div class="withdraw-bal">${(u.vpCoins||0).toLocaleString()} VP</div>
      <div class="withdraw-inr">= ₹${Math.floor((u.vpCoins||0)*0.7)} (after 30% platform fee)</div>
      ${(u.vpCoins||0) >= 500 ? `<button class="btn-primary" onclick="openWithdrawModal()">Withdraw to UPI/Bank</button>` : `<p style="color:var(--text-3);font-size:.85rem;">Need 500 VP minimum to withdraw. You have ${u.vpCoins||0} VP.</p>`}
    </div>` : ''}

    <div class="card mb-4">
      <div class="flex-between mb-4">
        <div class="section-title">Account Settings</div>
      </div>
      <div class="form-group">
        <label>Display Name</label>
        <input type="text" id="editName" value="${u.name}" />
      </div>
      <div class="flex-between" style="margin-top:12px;flex-wrap:wrap;gap:10px;">
        <div>
          <div style="font-size:.85rem;margin-bottom:6px;color:var(--text-2);">Switch Role</div>
          <div style="display:flex;gap:8px;">
            <button class="btn-secondary btn-sm ${!isCreator?'btn-primary':''}" onclick="switchRole('reader')">📖 Reader</button>
            <button class="btn-secondary btn-sm ${isCreator?'btn-primary':''}" onclick="switchRole('creator')">✏️ Creator</button>
          </div>
        </div>
        <button class="btn-primary" onclick="saveProfile()">Save Changes</button>
      </div>
    </div>

    <div class="card">
      <div class="section-title mb-4">How Earning Works</div>
      <div style="display:flex;flex-direction:column;gap:10px;">
        ${[['Reader tips you','Reader sends 50 VP → You get 35 VP (70%)'],['Paid chapter unlock','Reader pays 10 VP → You get 7 VP (70%)'],['Super Comment on your work','Reader pins comment → You get 70% of VP spent'],['Monthly Top-10 bonus','Platform gives +500 VP to top creators'],['Milestone reward (100 readers)','Auto-credited +100 VP']].map(([t,d])=>`
        <div style="background:var(--bg-glass);border:1px solid var(--border);border-radius:var(--radius-sm);padding:12px 16px;">
          <div style="font-size:.85rem;font-weight:600;">${t}</div>
          <div style="font-size:.78rem;color:var(--text-3);margin-top:2px;">${d}</div>
        </div>`).join('')}
      </div>
    </div>`;
}

function saveProfile() {
  const u = APP.user;
  const newName = document.getElementById('editName').value.trim();
  if (!newName) return showToast('Name cannot be empty','error');
  u.name = newName;
  APP.user = u;
  const initials = newName.slice(0,2).toUpperCase();
  document.getElementById('userAvatar').textContent = initials;
  showToast('Profile saved!','success');
  renderProfile();
}

function switchRole(role) {
  const u = APP.user;
  u.role = role;
  APP.user = u;
  updateCreatorNav();
  showToast(`Switched to ${role} mode!`,'success');
  renderProfile();
}

function updateCreatorNav() {
  const isCreator = APP.user && APP.user.role === 'creator';
  document.querySelectorAll('.creator-only').forEach(el => {
    el.classList.toggle('hidden', !isCreator);
  });
}

function openWithdrawModal() {
  const u = APP.user;
  const maxINR = Math.floor((u.vpCoins||0)*0.7);
  openModal(`<div class="modal-box">
    <button class="modal-close" onclick="closeModal()">✕</button>
    <div class="modal-title">💸 Withdraw Earnings</div>
    <div class="modal-subtitle">Minimum 500 VP | Rate: 100 VP = ₹70</div>
    <div class="form-group">
      <label>UPI ID or Bank Account</label>
      <input type="text" id="withdrawTo" placeholder="yourname@upi or Account No." />
    </div>
    <div class="form-group">
      <label>Amount (VP) — Max: ${u.vpCoins}</label>
      <input type="number" id="withdrawAmt" min="500" max="${u.vpCoins}" value="500" />
    </div>
    <div style="background:var(--bg-glass);border-radius:var(--radius-sm);padding:12px;margin:10px 0;font-size:.85rem;color:var(--text-2);">
      ₹ you'll receive: <strong style="color:var(--accent3);">₹<span id="withdrawINR">${Math.floor(500*0.7)}</span></strong>
    </div>
    <div class="modal-actions">
      <button class="btn-ghost" onclick="closeModal()">Cancel</button>
      <button class="btn-primary" onclick="processWithdraw()">Request Withdrawal</button>
    </div>
  </div>`);
  document.getElementById('withdrawAmt').addEventListener('input', function() {
    document.getElementById('withdrawINR').textContent = Math.floor(this.value*0.7);
  });
}

function processWithdraw() {
  const to = document.getElementById('withdrawTo').value.trim();
  const amt = parseInt(document.getElementById('withdrawAmt').value);
  const u = APP.user;
  if (!to) return showToast('Enter UPI/Bank details','error');
  if (amt < 500 || amt > u.vpCoins) return showToast('Invalid amount','error');
  u.vpCoins -= amt;
  APP.user = u;
  closeModal();
  updateVPUI();
  VPCoin.addLedger(`Withdrawal request: ₹${Math.floor(amt*0.7)} to ${to}`, -amt);
  Notifications.add('💸','Withdrawal request submitted! Processing in 3–5 business days.');
  showToast(`Withdrawal of ₹${Math.floor(amt*0.7)} requested!`,'success');
  renderProfile();
}

// ═══════════════════════════════════
//  APP INIT
// ═══════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  seedIfNeeded();
  const u = APP.user;
  if (u) {
    showApp(u);
  } else {
    document.getElementById('authScreen').classList.remove('hidden');
  }
});

function showApp(user) {
  document.getElementById('authScreen').classList.add('hidden');
  document.getElementById('appShell').classList.remove('hidden');
  const initials = user.name.slice(0,2).toUpperCase();
  document.getElementById('userAvatar').textContent = initials;
  updateVPUI();
  updateCreatorNav();
  Notifications.init();
  VPCoin.checkDailyBonus();
  navigate('discover');
}
