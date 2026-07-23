const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const newEndpoint = `
// Automated KYC Verification using Gemini
app.post('/api/kyc/auto-verify', async (req, res) => {
  const { email, idImage, selfieImage } = req.body;
  if (!email || !idImage || !selfieImage) {
    return res.status(400).json({ error: 'Missing required KYC payload' });
  }

  const db = readDb();
  const user = db.accounts.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
  
  if (!user) return res.status(404).json({ error: 'User not found' });

  // Update user with pending files immediately
  user.kycIdImage = idImage;
  user.kycSelfieImage = selfieImage;
  user.kycSubmittedAt = Date.now();
  
  // If Gemini is not configured, fall back to PENDING (manual review)
  if (!ai) {
    user.kycStatus = 'PENDING';
    writeDb(db);
    return res.json({ success: true, status: 'PENDING', message: 'Submitted for manual review.' });
  }

  try {
    // We expect base64 strings starting with "data:image/..."
    const idBase64 = idImage.split(',')[1];
    const selfieBase64 = selfieImage.split(',')[1];
    const idMime = idImage.split(';')[0].split(':')[1];
    const selfieMime = selfieImage.split(';')[0].split(':')[1];

    const prompt = \`You are an expert KYC compliance AI. Analyze the provided ID document and the user's selfie.
    Determine if:
    1. The ID looks like a genuine, valid government-issued document (not a fake, not a toy).
    2. The face in the selfie matches the face in the ID document.
    3. The images are clear enough to read.

    Return JSON strictly in this format:
    {
      "verified": boolean,
      "reason": "short explanation of your decision"
    }
    \`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [
          { text: prompt },
          { inlineData: { mimeType: idMime || 'image/jpeg', data: idBase64 || '' } },
          { inlineData: { mimeType: selfieMime || 'image/jpeg', data: selfieBase64 || '' } }
        ]}
      ],
      config: {
        responseMimeType: "application/json"
      }
    });

    const resultText = response.text();
    if (!resultText) throw new Error("Empty response from AI");
    
    const analysis = JSON.parse(resultText);

    if (analysis.verified) {
      user.kycStatus = 'VERIFIED';
      user.xp = (user.xp || 0) + 150; // XP reward
      writeDb(db);
      return res.json({ success: true, status: 'VERIFIED', message: analysis.reason });
    } else {
      user.kycStatus = 'PENDING'; // send to manual review
      writeDb(db);
      return res.json({ success: true, status: 'PENDING', message: analysis.reason });
    }

  } catch (err: any) {
    console.error('KYC Auto-Verify Error:', err);
    // On AI failure, default to pending for manual review
    user.kycStatus = 'PENDING';
    writeDb(db);
    return res.json({ success: true, status: 'PENDING', message: 'AI verification failed, falling back to manual review.' });
  }
});
`;

code = code.replace("// Configure static assets & development hot middleware", newEndpoint + "\n// Configure static assets & development hot middleware");

fs.writeFileSync('server.ts', code);
