# 🌸 MangaVerse

> **Read. Create. Earn.** — The ultimate manga & story creator platform with VP Coin economy.

## 🚀 Live Demo
Deploy to Vercel in 60 seconds (see below).

---

## ✨ Features

| Feature | Details |
|---------|---------|
| 🔐 Auth Guard | All content locked behind login — no public access |
| 📖 Manga Reader | Chapter-by-chapter reader with page uploads |
| ✏️ Creator Hub | Upload manga, add chapters, real image upload via FileReader |
| 🪙 VP Coin Economy | Buy, earn, tip, spend — full virtual currency |
| 💸 70/30 Split | Creator gets 70% of every transaction, platform gets 30% |
| ⭐ Super Comment | Pin your comment with VP — creator earns 70% |
| 📊 Analytics | Chart.js powered creator dashboard |
| 🔔 Notifications | Real-time in-app notification system |
| 🏆 Leaderboard | Creator rankings by VP with tier badges |
| 🎁 Daily Bonus | Login streak rewards (7-day = 100 VP mega bonus) |
| 📱 PWA | Installable on Android, works offline |

---

## 💰 Revenue Structure

### Platform Owner (You) Earns:
| Stream | Your Cut |
|--------|---------|
| VP Pack sales | 30% upfront |
| Every reader tip | 30% taken at source |
| Every chapter unlock | 30% taken at source |
| Every Super Comment | 30% taken at source |
| Premium subscriptions | 100% yours (add later) |

### Creator Earns:
| Stream | Creator Gets |
|--------|-------------|
| Reader tips | 70% of tip VP |
| Paid chapter unlocks | 70% per unlock |
| Super Comments | 70% of VP spent |
| Top-10 monthly bonus | +500 VP from platform |
| Milestones | +100/250/500 VP |
| Withdrawal | 100VP = ₹70 |

---

## 🛠 Tech Stack

- **HTML5 + CSS3 + Vanilla JS** — Zero dependencies, runs anywhere
- **Chart.js** — Analytics charts
- **FileReader API** — Actual image uploads (no backend needed)
- **LocalStorage** — Full data persistence
- **PWA** — Service Worker + Web Manifest

---

## 📁 File Structure

```
mangaverse/
├── index.html        # App shell + auth screen
├── styles.css        # Full design system
├── app.js            # Router + state + seed data + profile
├── auth.js           # Login / Register / Role switching
├── vpcoin.js         # VP economy engine (earn/spend/tip/unlock)
├── notifications.js  # Notification system
├── reader.js         # Discover + Detail + Chapter reader
├── creator.js        # Creator hub + upload + analytics
├── store.js          # VP store + daily bonus
├── leaderboard.js    # Rankings + tiers
├── manifest.json     # PWA manifest
├── sw.js             # Service worker (offline)
└── vercel.json       # Vercel deployment config
```

---

## 🌐 Deploy to Vercel (FREE Forever)

### Method 1: GitHub + Vercel Auto-Deploy
1. Push this folder to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project
3. Import your GitHub repo → Select `mangaverse/` as root
4. Click **Deploy** — Done! Live in 30 seconds.

### Method 2: Vercel CLI
```bash
cd mangaverse
npx vercel --prod
```

---

## 📱 Publish to PlayStore (Future)

1. Install Bubblewrap: `npm install -g @bubblewrap/cli`
2. `bubblewrap init --manifest https://your-vercel-url/manifest.json`
3. `bubblewrap build` → generates `.apk`
4. Upload to Google Play Console

---

## 🎮 Demo Credentials

- **Email:** any email (e.g. `demo@test.com`)
- **Password:** any 6+ chars (e.g. `demo123`)
- New accounts get **50 VP welcome bonus**

---

## 📖 VP Coin Quick Reference

| Action | VP Change |
|--------|-----------|
| Daily Login | +10 VP |
| 7-Day Streak | +100 VP |
| First read of day | +2 VP |
| Welcome bonus | +50 VP |
| Tip creator (100 VP) | You: -100 VP · Creator: +70 VP |
| Unlock chapter (10 VP) | You: -10 VP · Creator: +7 VP |
| Super Comment (50 VP) | You: -50 VP · Creator: +35 VP |
| Withdraw (100 VP) | = ₹70 cash |

---

## 🔮 Roadmap

- [ ] Real Razorpay payment integration
- [ ] MongoDB/Firebase backend
- [ ] React Native mobile app
- [ ] AI manga panel generator
- [ ] Multi-language manga support
- [ ] Creator subscription tiers

---

Made with ❤️ for the MangaVerse community.
