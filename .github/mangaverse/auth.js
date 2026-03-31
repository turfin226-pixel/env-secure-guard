/* ── auth.js ── */
const Auth = {
  selectedRole: 'reader',

  selectRole(role) {
    this.selectedRole = role;
    document.getElementById('roleReader').classList.toggle('active', role === 'reader');
    document.getElementById('roleCreator').classList.toggle('active', role === 'creator');
  },

  showRegister() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.remove('hidden');
  },

  showLogin() {
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('loginForm').classList.remove('hidden');
  },

  login() {
    const email = document.getElementById('loginEmail').value.trim();
    const pass  = document.getElementById('loginPassword').value;
    if (!email || !pass) return showToast('Fill in all fields','error');

    const users = APP.users;
    let user = users.find(u => u.email === email);

    if (!user) {
      // demo: auto-create if doesn't exist
      if (pass.length < 6) return showToast('Password min 6 chars','error');
      user = {
        id: 'u_' + Date.now(),
        name: email.split('@')[0],
        email, pass,
        role: 'reader',
        vpCoins: 50,
        loginStreak: 1,
        lastLogin: null,
        readCount: 0,
        works: 0,
        joinedAt: Date.now(),
        ledger: [],
        bookmarks: [],
        readHistory: [],
        notifications: []
      };
      users.push(user);
      APP.users = users;
      VPCoin.addLedger('Welcome bonus!', 50, user.id);
    }

    APP.user = user;
    showApp(user);
    showToast(`Welcome back, ${user.name}! 🎉`,'success');
  },

  register() {
    const name  = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const pass  = document.getElementById('regPassword').value;
    const role  = this.selectedRole;

    if (!name || !email || !pass) return showToast('Fill in all fields','error');
    if (pass.length < 6) return showToast('Password min 6 chars','error');

    const users = APP.users;
    if (users.find(u => u.email === email)) return showToast('Email already registered','error');

    const newUser = {
      id: 'u_' + Date.now(),
      name, email, pass, role,
      vpCoins: 50,
      loginStreak: 1,
      lastLogin: null,
      readCount: 0,
      works: 0,
      joinedAt: Date.now(),
      ledger: [],
      bookmarks: [],
      readHistory: [],
      notifications: []
    };

    users.push(newUser);
    APP.users = users;
    APP.user = newUser;

    VPCoin.addLedger('Welcome bonus!', 50, newUser.id);
    Notifications.add('🎉', `Welcome to MangaVerse, ${name}! You received 50 VP as a welcome bonus.`, newUser.id);

    showApp(newUser);
    showToast(`Welcome, ${name}! 🌸 You got 50 VP free!`, 'vp');
  },

  logout() {
    APP.user = null;
    document.getElementById('appShell').classList.add('hidden');
    document.getElementById('authScreen').classList.remove('hidden');
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
  }
};
