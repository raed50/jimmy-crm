# Jimmy's Fitness — CRM Multi-Clubs 🔒

Dashboard CRM sécurisé hébergé sur Vercel.

## 🚀 Setup

### 1. Variables d'environnement (Vercel Dashboard)

Va dans **Settings → Environment Variables** et ajoute :

| Variable | Description | Exemple |
|----------|-------------|---------|
| `JWT_SECRET` | Secret pour les tokens (change-le !) | `mon-secret-ultra-long-2024` |
| `ADMIN_USER` | Nom d'utilisateur admin | `admin` |
| `ADMIN_PASS` | Mot de passe admin | `jimmy2024` |
| `GOOGLE_API_KEY` | Clé API Google Sheets | `AIzaSy...` |
| `GOOGLE_SHEET_ID` | ID de ton Google Sheet | `1USgLyBRK...` |
| `APPS_SCRIPT_URL` | URL du Google Apps Script | `https://script.google.com/macros/s/.../exec` |

### 2. Déploiement

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer
cd JIMMY-VERCEL
vercel --prod
```

### 3. Sécurité

- ✅ Login vérifié côté serveur (pas de bypass possible)
- ✅ JWT token (expiration 24h)
- ✅ API Google Sheets cachée côté serveur
- ✅ Apps Script sécurisé via proxy
- ✅ Headers de sécurité (X-Frame-Options, CSP, etc.)
- ✅ HTTPS automatique sur Vercel

## 📁 Structure

```
JIMMY-VERCEL/
├── api/
│   ├── login.js      ← Authentification + JWT
│   ├── sheets.js     ← Proxy Google Sheets
│   └── validate.js   ← Écriture via Apps Script
├── public/
│   └── index.html    ← Dashboard frontend
├── vercel.json       ← Configuration
└── package.json      ← Dépendances
```
