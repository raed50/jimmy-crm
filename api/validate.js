const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;

function verifyToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  try {
    return jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
  } catch { return null; }
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = verifyToken(req);
  if (!user) return res.status(401).json({ error: 'Token invalide' });

  if (!APPS_SCRIPT_URL) {
    return res.status(500).json({ error: 'APPS_SCRIPT_URL not configured' });
  }

  try {
    const { feuille, club, nom, numero } = req.body || {};
    if (!feuille || !club || !nom) {
      return res.status(400).json({ error: 'Paramètres manquants' });
    }

    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ feuille, club, nom, numero })
    });

    return res.status(200).json({ success: true });

  } catch (err) {
    return res.status(500).json({ error: 'Erreur validation', details: err.message });
  }
};
