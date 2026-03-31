/* ── vpcoin.js: VP Coin Economy Engine ── */
const VPCoin = {

  // Add to user's VP balance
  earn(amount, reason, userId) {
    const uid = userId || APP.user?.id;
    const users = APP.users;
    const idx = users.findIndex(u => u.id === uid);
    if (idx === -1) return;
    users[idx].vpCoins = (users[idx].vpCoins || 0) + amount;
    APP.users = users;
    if (uid === APP.user?.id) {
      const u = APP.user;
      u.vpCoins = users[idx].vpCoins;
      APP.user = u;
      updateVPUI();
    }
    this.addLedger(reason, amount, uid);
  },

  // Spend VP (returns true if success)
  spend(amount, reason, userId) {
    const uid = userId || APP.user?.id;
    const users = APP.users;
    const idx = users.findIndex(u => u.id === uid);
    if (idx === -1 || (users[idx].vpCoins || 0) < amount) return false;
    users[idx].vpCoins -= amount;
    APP.users = users;
    if (uid === APP.user?.id) {
      const u = APP.user;
      u.vpCoins = users[idx].vpCoins;
      APP.user = u;
      updateVPUI();
    }
    this.addLedger(reason, -amount, uid);
    return true;
  },

  // Transfer VP from reader to creator (30/70 split)
  tip(fromId, toId, amount, reason) {
    const platformCut = Math.ceil(amount * 0.30);
    const creatorCut  = amount - platformCut;
    if (!this.spend(amount, reason, fromId)) return false;
    this.earn(creatorCut, `Tip received: ${reason}`, toId);
    Notifications.add('🪙', `You received ${creatorCut} VP from a tip! (${reason})`, toId);
    return true;
  },

  // Ledger — stored per user
  addLedger(desc, amount, userId) {
    const uid = userId || APP.user?.id;
    if (!uid) return;
    const users = APP.users;
    const idx = users.findIndex(u => u.id === uid);
    if (idx === -1) return;
    if (!users[idx].ledger) users[idx].ledger = [];
    users[idx].ledger.unshift({ desc, amount, time: Date.now() });
    if (users[idx].ledger.length > 50) users[idx].ledger.pop();
    APP.users = users;
    if (uid === APP.user?.id) {
      const u = APP.user;
      u.ledger = users[idx].ledger;
      APP.user = u;
    }
  },

  getLedger(userId) {
    const uid = userId || APP.user?.id;
    const users = APP.users;
    const user = users.find(u => u.id === uid);
    return user?.ledger || [];
  },

  // Daily Bonus
  checkDailyBonus() {
    const u = APP.user;
    if (!u) return;
    const now = Date.now();
    const last = u.lastLogin || 0;
    const sameDayMs = 86400000;
    if (now - last < sameDayMs) return; // already claimed today

    // Streak logic
    const streak = (now - last < sameDayMs * 2) ? (u.loginStreak || 0) + 1 : 1;
    const bonus = streak >= 7 ? 100 : 10;

    u.lastLogin = now;
    u.loginStreak = streak;
    APP.user = u;

    // Update in users array
    const users = APP.users;
    const idx = users.findIndex(x => x.id === u.id);
    if (idx !== -1) { users[idx].lastLogin = now; users[idx].loginStreak = streak; APP.users = users; }

    // Show popup
    const popup = document.getElementById('dailyBonusPopup');
    document.getElementById('bonusAmount').textContent = `+${bonus} VP${streak >= 7 ? ' 🔥 7-Day Streak!' : ''}`;
    popup.classList.remove('hidden');

    // Auto-claim stored
    window._pendingBonus = bonus;
  },

  claimDailyBonus() {
    const bonus = window._pendingBonus || 10;
    document.getElementById('dailyBonusPopup').classList.add('hidden');
    this.earn(bonus, 'Daily login bonus');
    Notifications.add('🎁', `Daily bonus claimed! +${bonus} VP`);
    showToast(`+${bonus} VP Daily Bonus!`, 'vp');
  },

  // Buy VP pack (simulate payment)
  buyPack(vp, price, bonus) {
    openModal(`<div class="modal-box">
      <button class="modal-close" onclick="closeModal()">✕</button>
      <div class="modal-title">🪙 Purchase VP Coins</div>
      <div class="modal-subtitle">You're buying <strong style="color:var(--accent3)">${vp + bonus} VP</strong> for <strong>₹${price}</strong></div>
      <div style="background:var(--bg-glass);border-radius:var(--radius-sm);padding:16px;margin:16px 0;font-size:.85rem;color:var(--text-2);line-height:1.7;">
        💳 In a live app, Razorpay/UPI would open here.<br>
        <span style="color:var(--accent3);">For demo: click Confirm to add VP instantly.</span>
      </div>
      <div class="modal-actions">
        <button class="btn-ghost" onclick="closeModal()">Cancel</button>
        <button class="btn-primary" onclick="VPCoin.confirmBuy(${vp+bonus},${price})">✅ Confirm Purchase (₹${price})</button>
      </div>
    </div>`);
  },

  confirmBuy(vp, price) {
    closeModal();
    this.earn(vp, `Purchased ${vp} VP for ₹${price}`);
    Notifications.add('🪙', `You bought ${vp} VP Coins for ₹${price}! Happy reading!`);
    showToast(`+${vp} VP added to your wallet! 🎉`, 'vp');
    updateVPUI();
    Store.render();
  },

  // Unlock paid chapter
  unlockChapter(manga, chapter) {
    const u = APP.user;
    const price = chapter.price || 10;
    if ((u.vpCoins || 0) < price) {
      showToast(`Not enough VP! Need ${price} VP.`, 'error');
      openModal(`<div class="modal-box">
        <button class="modal-close" onclick="closeModal()">✕</button>
        <div class="modal-title">🔒 Unlock Chapter</div>
        <div class="modal-subtitle">You need ${price} VP to unlock "${chapter.title}"</div>
        <p style="font-size:.85rem;color:var(--text-2);margin-bottom:16px;">You have ${u.vpCoins||0} VP. Buy more VP to continue reading!</p>
        <div class="modal-actions">
          <button class="btn-ghost" onclick="closeModal()">Cancel</button>
          <button class="btn-primary" onclick="closeModal();navigate('store')">Buy VP Coins</button>
        </div>
      </div>`);
      return false;
    }

    // Spend VP, give 70% to creator
    const spent = this.spend(price, `Unlocked "${chapter.title}" in ${manga.title}`);
    if (!spent) return false;

    // Give 70% to creator
    const creatorShare = Math.floor(price * 0.70);
    this.earn(creatorShare, `Chapter unlock: ${chapter.title}`, manga.creatorId);
    Notifications.add('🔓', `Someone unlocked "${chapter.title}" — you earned ${creatorShare} VP!`, manga.creatorId);

    // Mark as unlocked for this user
    const users = APP.users;
    const idx = users.findIndex(x => x.id === u.id);
    if (idx !== -1) {
      if (!users[idx].unlockedChapters) users[idx].unlockedChapters = [];
      users[idx].unlockedChapters.push(chapter.id);
      APP.users = users;
      const upd = APP.user;
      upd.unlockedChapters = users[idx].unlockedChapters;
      APP.user = upd;
    }

    showToast(`Chapter unlocked! -${price} VP`, 'success');
    return true;
  },

  isChapterUnlocked(chapterId) {
    const u = APP.user;
    return u?.unlockedChapters?.includes(chapterId) || false;
  }
};
