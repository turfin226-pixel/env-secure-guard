/* ── notifications.js ── */
const Notifications = {
  init() {
    this.render();
    this.updateBadge();
  },

  add(icon, text, userId) {
    const uid = userId || APP.user?.id;
    const users = APP.users;
    const idx = users.findIndex(u => u.id === uid);
    if (idx === -1) return;
    if (!users[idx].notifications) users[idx].notifications = [];
    users[idx].notifications.unshift({ icon, text, time: Date.now(), read: false });
    if (users[idx].notifications.length > 30) users[idx].notifications.pop();
    APP.users = users;
    if (uid === APP.user?.id) {
      const u = APP.user;
      u.notifications = users[idx].notifications;
      APP.user = u;
      this.render();
      this.updateBadge();
    }
  },

  getAll() {
    return APP.user?.notifications || [];
  },

  markAllRead() {
    const u = APP.user;
    if (!u) return;
    (u.notifications || []).forEach(n => n.read = true);
    APP.user = u;
    const users = APP.users;
    const idx = users.findIndex(x => x.id === u.id);
    if (idx !== -1) { users[idx].notifications = u.notifications; APP.users = users; }
    this.updateBadge();
  },

  clearAll() {
    const u = APP.user;
    if (!u) return;
    u.notifications = [];
    APP.user = u;
    const users = APP.users;
    const idx = users.findIndex(x => x.id === u.id);
    if (idx !== -1) { users[idx].notifications = []; APP.users = users; }
    this.render();
    this.updateBadge();
  },

  updateBadge() {
    const unread = this.getAll().filter(n => !n.read).length;
    const badge = document.getElementById('notifBadge');
    if (!badge) return;
    badge.textContent = unread;
    badge.classList.toggle('hidden', unread === 0);
  },

  toggle() {
    const panel = document.getElementById('notifPanel');
    const isHidden = panel.classList.toggle('hidden');
    if (!isHidden) {
      this.markAllRead();
      this.render();
    }
  },

  render() {
    const list = document.getElementById('notifList');
    if (!list) return;
    const notifs = this.getAll();
    if (!notifs.length) {
      list.innerHTML = '<div class="notif-empty">No notifications yet 🔔</div>';
      return;
    }
    list.innerHTML = notifs.map(n => `
      <div class="notif-item ${n.read ? '' : 'unread'}">
        <div class="notif-item-icon">${n.icon}</div>
        <div class="notif-item-body">
          <div class="notif-item-text">${n.text}</div>
          <div class="notif-item-time">${timeAgo(n.time)}</div>
        </div>
      </div>`).join('');
  }
};

function timeAgo(ts) {
  const diff = Date.now() - ts;
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return Math.floor(diff/60000) + 'm ago';
  if (diff < 86400000) return Math.floor(diff/3600000) + 'h ago';
  return Math.floor(diff/86400000) + 'd ago';
}
