/* ── auth.js: Firebase Auth ── */

// Detect mobile (touch devices / small screen)
const isMobile = () => /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || window.innerWidth < 768;

// Google Sign-In: popup on desktop, redirect on mobile
async function googleSignIn() {
  const provider = new window.FB.GoogleAuthProvider();
  showLoading();
  try {
    if (isMobile()) {
      // Mobile: redirect (no popup blocker issue)
      await window.FB.signInWithRedirect(window.auth, provider);
      // Page will reload after Google auth — handled in index.html getRedirectResult
    } else {
      // Desktop: popup
      const res = await window.FB.signInWithPopup(window.auth, provider);
      const userRef = window.FB.doc(window.db, 'users', res.user.uid);
      const snap = await window.FB.getDoc(userRef);
      if (!snap.exists()) {
        await window.FB.setDoc(userRef, {
          name: res.user.displayName,
          email: res.user.email,
          role: 'reader',
          createdAt: window.FB.serverTimestamp()
        });
      }
      showToast('Welcome! 🎉', 'success');
    }
  } catch (e) {
    hideLoading();
    showToast('Google sign in failed: ' + (e.message || ''), 'error');
  }
}

document.getElementById('loginBtn').addEventListener('click', async () => {
  const email = document.getElementById('loginEmail').value.trim();
  const pass  = document.getElementById('loginPassword').value;
  if (!email || !pass) return showToast('Fill in all fields', 'error');
  showLoading();
  try {
    await window.FB.signInWithEmailAndPassword(window.auth, email, pass);
    showToast('Welcome back! 🎉', 'success');
  } catch (e) {
    showToast(e.code === 'auth/user-not-found' ? 'No account with this email' : e.code === 'auth/wrong-password' ? 'Wrong password' : 'Sign in failed', 'error');
  }
  hideLoading();
});

document.getElementById('googleLoginBtn').addEventListener('click', () => googleSignIn());

document.getElementById('registerBtn').addEventListener('click', async () => {
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const pass  = document.getElementById('regPassword').value;
  const role  = window.getSelectedRole();
  if (!name || !email || !pass) return showToast('Fill in all fields', 'error');
  if (pass.length < 6) return showToast('Password min 6 characters', 'error');
  showLoading();
  try {
    const res = await window.FB.createUserWithEmailAndPassword(window.auth, email, pass);
    await window.FB.updateProfile(res.user, { displayName: name });
    await window.FB.setDoc(window.FB.doc(window.db, 'users', res.user.uid), {
      name, email, role,
      createdAt: window.FB.serverTimestamp()
    });
    showToast(`Welcome, ${name}! 🌸`, 'success');
  } catch (e) {
    showToast(e.code === 'auth/email-already-in-use' ? 'Email already registered' : 'Registration failed', 'error');
  }
  hideLoading();
});

document.getElementById('googleRegisterBtn').addEventListener('click', () => googleSignIn());

