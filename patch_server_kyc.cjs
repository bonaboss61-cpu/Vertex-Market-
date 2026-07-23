const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const newEndpoints = `
// Admin API: KYC Actions
app.post('/api/admin/kyc/approve', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  const db = readDb();
  const user = db.accounts.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
  
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  user.kycStatus = 'VERIFIED';
  user.xp = (user.xp || 0) + 150; // Grant XP for verification

  writeDb(db);
  res.json({ success: true });
});

app.post('/api/admin/kyc/reject', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  const db = readDb();
  const user = db.accounts.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
  
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  user.kycStatus = 'UNVERIFIED'; // Send back to unverified
  user.kycIdImage = undefined;
  user.kycSelfieImage = undefined;

  writeDb(db);
  res.json({ success: true });
});
`;

code = code.replace("// Configure static assets & development hot middleware", newEndpoints + "\n// Configure static assets & development hot middleware");

fs.writeFileSync('server.ts', code);
