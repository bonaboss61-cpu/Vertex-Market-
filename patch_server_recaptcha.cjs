const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const route = `
app.post('/api/verify-recaptcha', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ success: false, error: 'No token provided' });
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  if (!secretKey) {
    // If not configured, just return success so dev isn't blocked
    return res.json({ success: true, message: 'ReCAPTCHA ignored (not configured)' });
  }

  try {
    const fetchRes = await fetch(\`https://www.google.com/recaptcha/api/siteverify\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: \`secret=\${secretKey}&response=\${token}\`
    });
    const data = await fetchRes.json();
    if (data.success) {
      return res.json({ success: true });
    } else {
      return res.status(400).json({ success: false, error: 'ReCAPTCHA validation failed' });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Error validating ReCAPTCHA' });
  }
});
`;

if (!code.includes('/api/verify-recaptcha')) {
  code = code.replace(/app\.post\('\/api\/auth\/send-otp'/g, route + "\napp.post('/api/auth/send-otp'");
  fs.writeFileSync('server.ts', code);
}
