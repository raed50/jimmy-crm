const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY; // MUST be set in Vercel env
const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;

const CLUBS = [
  { name: 'Moulay Ismail', gid: '286298135' },
  { name: 'Zemouri', gid: '2041557846' },
  { name: 'Iberia', gid: '224653899' },
  { name: 'Kenitra', gid: '2076868623' },
  { name: 'Jimmy Rabat', gid: '130407440' }
];

function verifyToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  try {
    return jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
  } catch { return null; }
}

async function fetchSheet(sheetName, gid) {
  if (!GOOGLE_API_KEY) throw new Error('GOOGLE_API_KEY not configured');
  const range = gid ? `${sheetName}!A1:Z500` : `${sheetName}!A1:Z500`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}/values/${encodeURIComponent(range)}?key=${GOOGLE_API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Google API error: ${response.status}`);
  const data = await response.json();
  if (!data.values || data.values.length < 2) return [];
  const headers = data.values[0].map(h => h.trim());
  return data.values.slice(1).map(row => {
    const obj = { _club: sheetName };
    headers.forEach((h, i) => { obj[h] = (row[i] || '').trim(); });
    return obj;
  }).filter(r => {
    const vals = Object.entries(r).filter(([k]) => k !== '_club').map(([,v]) => v);
    return vals.some(v => v !== '');
  });
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = verifyToken(req);
  if (!user) return res.status(401).json({ error: 'Token invalide ou manquant' });

  try {
    const { club } = req.query;

    if (club) {
      const clubConfig = CLUBS.find(c => c.name === club);
      const gid = clubConfig ? clubConfig.gid : undefined;
      const data = await fetchSheet(club, gid);
      return res.status(200).json({ data, club });
    }

    const allData = {};
    for (const c of CLUBS) {
      allData[c.name] = await fetchSheet(c.name, c.gid);
    }
    allData['Abonnement'] = await fetchSheet('Abonnement');
    allData['VISITE'] = await fetchSheet('VISITE');
    return res.status(200).json({ data: allData });

  } catch (err) {
    return res.status(500).json({ error: 'Erreur chargement données', details: err.message });
  }
};
