# 🇰🇪 SISI NDIO SIFUNA — Volunteer Mobilisation Web App

[![Live on GitHub Pages](https://img.shields.io/badge/Hosted-GitHub%20Pages-blue)](https://yourdomain.github.io/)
[![Backend](https://img.shields.io/badge/Backend-Google%20Apps%20Script-green)](https://script.google.com)
[![Database](https://img.shields.io/badge/Database-Google%20Sheets-brightgreen)](https://sheets.google.com)

A mobile-first volunteer web app for the **SISI NDIO SIFUNA** Kenyan presidential campaign. No app download needed — users open the URL in any browser.

---

## 🚀 Quick Start (Local Preview)

```bash
# Install serve (one-time)
npm install -g serve

# Run locally on port 8001
serve . -l 8001
```

Then open: `http://localhost:8001`

---

## 📦 Project Structure

```
SISI NDIO SIFUNA/
├── index.html              ← Landing page (hero + live counters + events)
├── about.html              ← Campaign mission & values
├── join.html               ← Volunteer registration form
├── rallies.html            ← Rally & event tracker
├── resources.html          ← Campaign resource downloads
├── tasks.html              ← Patriot Score task board
├── main.css                ← Full design system (Kenyan flag colours)
├── app.js                  ← Core logic (live stats, forms, task board)
├── iebc-data.js            ← All 47 counties, constituencies & wards
├── manifest.json           ← Browser theme config (no install prompts)
├── sw.js                   ← Silent service worker (cache for 3G speed)
├── favicon.svg             ← SVG logo and favicon
├── .gitignore
├── README.md
└── backend/
    ├── Code.gs             ← Google Apps Script REST API
    └── README.md           ← Backend setup instructions
```

---

## 🌐 Deploy to GitHub Pages

1. Create a GitHub repository (e.g. `sisi-ndio-sifuna`)
2. Push all files **except** the `backend/` folder:
   ```bash
   git init
   git add .
   git commit -m "Launch: SISI NDIO SIFUNA volunteer web app"
   git remote add origin https://github.com/YOUR_USERNAME/sisi-ndio-sifuna.git
   git push -u origin main
   ```
3. Go to **Settings → Pages → Source: Deploy from branch → main**
4. Your site is live at: `https://YOUR_USERNAME.github.io/sisi-ndio-sifuna/`

---

## ⚙️ Connect the Backend

See [`backend/README.md`](backend/README.md) for full instructions. In short:

1. Create a Google Sheet with 3 tabs: `Volunteers`, `Events`, `SiteStats`
2. Open Apps Script, paste `Code.gs`, and set `SHEET_ID`
3. Deploy as a Web App (access: Anyone)
4. In `app.js` Line 8, replace `YOUR_SCRIPT_ID` with your deployment URL

---

## 📱 Features

| Feature | Status |
|---------|--------|
| Live Volunteer Counter (30s refresh) | ✅ |
| Live Visitor Counter (since launch) | ✅ |
| IEBC County→Constituency→Ward dropdowns | ✅ |
| Volunteer Registration → Google Sheets | ✅ |
| Rally/Event Tracker (list + map view) | ✅ |
| Patriot Score Task Board (gamified) | ✅ |
| Resource Toolkit (posters, stickers, PDFs) | ✅ |
| Strategic Ad Banner (swappable) | ✅ |
| Silent Service Worker (3G caching) | ✅ |
| WhatsApp/Twilio broadcast stub | ✅ (stub — configure Twilio keys) |
| Mobile bottom navigation | ✅ |
| Desktop top navigation | ✅ |
| Accessible (ARIA labels, keyboard nav) | ✅ |

---

## 🎨 Colour Palette

| Name | Hex | Usage |
|------|-----|-------|
| Kenya Black | `#000000` | Headers, text, navbar |
| Kenya Red | `#BE0027` | Primary CTAs (Join, Sign Up) |
| Kenya Red Bright | `#CE1126` | Hero gradient, flag stripe |
| Kenya Green | `#006600` | Success, verified, accents |
| Kenya White | `#FFFFFF` | Background |
| Kenya Gold | `#F5C518` | Badges, Patriot Score |

---

## 🔧 Enterprise Migration

When scaling beyond Google Sheets (~50k rows):

| Layer | Current | Migration Target |
|-------|---------|------------------|
| Frontend | GitHub Pages | Vercel / AWS CloudFront |
| Backend | Google Apps Script | Node.js / FastAPI on Cloud Run |
| Database | Google Sheets | PostgreSQL / Firestore |
| Notifications | GAS stub | Live Twilio / Meta WhatsApp API |

Only `GAS_API_URL` in `app.js` needs updating — zero HTML changes.

---

## 📄 License

© 2026 SISI NDIO SIFUNA. All rights reserved.
