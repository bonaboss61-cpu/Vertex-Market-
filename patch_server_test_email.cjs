const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const newEndpoint = `
// Admin API: Diagnostic Test Email
app.post('/api/admin/test-email', async (req, res) => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    return res.status(400).json({ error: 'Gmail credentials not configured on the server.' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });

    await transporter.sendMail({
      from: \`"Vertex Market Diagnostics" <\${process.env.GMAIL_USER}>\`,
      to: process.env.GMAIL_USER, // Send to self
      subject: 'Server Diagnostics: Mail Transport Test',
      text: 'This is a test email sent from the Vertex Market admin panel to verify that mail transport is working correctly.',
    });
    
    res.json({ success: true, message: 'Test email sent successfully to ' + process.env.GMAIL_USER });
  } catch (err) {
    console.error('Test email failed:', err);
    res.status(500).json({ error: 'Failed to send test email: ' + (err.message || 'Unknown error') });
  }
});
`;

// Insert it right before "// Configure static assets"
code = code.replace("// Configure static assets & development hot middleware", newEndpoint + "\n// Configure static assets & development hot middleware");

fs.writeFileSync('server.ts', code);
