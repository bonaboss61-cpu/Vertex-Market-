const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldKlines = `app.get('/api/klines', async (req, res) => {
  try {
    const symbol = req.query.symbol;
    const fetchRes = await fetch(\`https://api.binance.com/api/v3/klines?symbol=\${symbol}&interval=1m&limit=1000\`);
    const data = await fetchRes.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});`;

const newKlines = `app.get('/api/klines', async (req, res) => {
  try {
    const symbol = req.query.symbol;
    const fetchRes = await fetch(\`https://api.binance.com/api/v3/klines?symbol=\${symbol}&interval=1m&limit=1000\`);
    if (!fetchRes.ok) {
      return res.status(fetchRes.status).json({ error: \`Binance API error: \${fetchRes.statusText}\` });
    }
    const data = await fetchRes.json();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});`;

code = code.replace(oldKlines, newKlines);
fs.writeFileSync('server.ts', code);
