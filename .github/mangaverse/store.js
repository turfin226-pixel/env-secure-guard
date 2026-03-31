/* ── store.js: VP Coin Store ── */
const Store = {
  render() {
    const u = APP.user;
    const packs = [
      { vp:50,  bonus:0,   price:50,  emoji:'🪙', label:'Starter' },
      { vp:120, bonus:20,  price:100, emoji:'💰', label:'Reader',  popular:true },
      { vp:300, bonus:60,  price:200, emoji:'💎', label:'Fan' },
      { vp:650, bonus:150, price:400, emoji:'⚡', label:'Supporter' },
      { vp:1500,bonus:500, price:800, emoji:'👑', label:'Legend' },
    ];
    const ledger = VPCoin.getLedger();
    const today = new Date().toDateString();
    const alreadyClaimed = u.lastLogin && new Date(u.lastLogin).toDateString() === today;

    document.getElementById('mainContent').innerHTML = `
      <div class="store-hero">
        <div class="store-hero-left">
          <h2>🪙 VP Coin Store</h2>
          <p>Support creators · Unlock chapters · Gift Super Comments</p>
        </div>
        <div class="store-balance">
          <div class="store-balance-val">${(u.vpCoins||0).toLocaleString()} VP</div>
          <div class="store-balance-lbl">≈ ₹${Math.floor((u.vpCoins||0)*0.7)} value</div>
        </div>
      </div>

      <div class="daily-card">
        <div>
          <h3>🎁 Daily Bonus</h3>
          <p>${alreadyClaimed ? `✅ Already claimed today! Come back tomorrow.` : `Claim your free VP every day! Streak: 🔥${u.loginStreak||1} days`}</p>
          <p style="font-size:.78rem;color:var(--accent3);margin-top:4px;">7-day streak = 100 VP mega bonus!</p>
        </div>
        <button class="btn-primary" ${alreadyClaimed?'disabled style="opacity:.5"':''} onclick="${alreadyClaimed?'showToast(\"Already claimed!\",\"error\")':'VPCoin.claimDailyBonus()'}">
          ${alreadyClaimed ? '✅ Claimed' : '🎁 Claim 10 VP'}
        </button>
      </div>

      <div class="section-header"><div class="section-title">💎 VP Packs</div></div>
      <div class="pack-grid">
        ${packs.map(p=>`
          <div class="pack-card ${p.popular?'popular':''}" onclick="VPCoin.buyPack(${p.vp},${p.price},${p.bonus})">
            ${p.popular?'<div class="popular-tag">POPULAR</div>':''}
            <div class="pack-emoji">${p.emoji}</div>
            <div class="pack-vp-amount">${p.vp + p.bonus}</div>
            <div class="pack-vp-lbl">VP Coins</div>
            <div class="pack-bonus-txt">${p.bonus?`+${p.bonus} BONUS`:''}</div>
            <div class="pack-price-txt">₹${p.price}</div>
            <button class="btn-primary w-full">Buy Now</button>
          </div>`).join('')}
      </div>

      <div class="section-header"><div class="section-title">💡 What can I do with VP?</div></div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;margin-bottom:28px;">
        ${[['🔓','Unlock paid chapters','Read exclusive content from your fave creators'],['🪙','Tip creators','Give VP directly to creators (they get 70%)'],['⭐','Super Comment','Pin your comment on manga (creator earns 70%)'],['📈','Support rankings','Every VP sent = creator moves up the leaderboard']].map(([i,t,d])=>`<div class="card" style="padding:16px;"><div style="font-size:1.5rem;margin-bottom:8px;">${i}</div><div style="font-size:.88rem;font-weight:600;margin-bottom:4px;">${t}</div><div style="font-size:.78rem;color:var(--text-3);">${d}</div></div>`).join('')}
      </div>

      <div class="card">
        <div class="section-title" style="margin-bottom:12px">📋 Transaction History</div>
        ${ledger.length
          ? ledger.slice(0,15).map(l=>`<div class="ledger-item"><div><div class="ledger-desc">${l.desc}</div><div class="ledger-meta">${timeAgo(l.time)}</div></div><div class="${l.amount>=0?'ledger-amt-earn':'ledger-amt-spend'}">${l.amount>=0?'+':''}${l.amount} VP</div></div>`).join('')
          : '<div style="text-align:center;padding:20px;color:var(--text-3);font-size:.85rem;">No transactions yet</div>'}
      </div>
    `;
  }
};
