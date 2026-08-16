const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /app\.post\('\/api\/kyc\/auto-verify', async \(req, res\) => \{[\s\S]*?\} catch \(error: any\) \{/m;

const replacement = `app.post('/api/kyc/auto-verify', async (req, res) => {
  const { email, idImage, idImageBack, selfieImage } = req.body;
  if (!email || !idImage || !selfieImage) {
    return res.status(400).json({ error: 'Missing required KYC payload' });
  }

  const db = readDb();
  const user = db.accounts.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
  
  if (!user) return res.status(404).json({ error: 'User not found' });

  // Update user with pending files immediately
  user.kycIdImage = idImage;
  user.kycIdImageBack = idImageBack;
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
    
    let parts = [
      { text: \`You are an expert KYC compliance AI. Analyze the provided ID document(s) and the user's selfie.
    Determine if:
    1. The ID looks like a genuine, valid government-issued document (not a fake, not a toy).
    2. The face in the selfie matches the face in the ID document.
    3. The images are clear enough to read.
    
    If the image is not clear enough (blurry, obscured), set "unclear" to true, and explain it.

    Return JSON strictly in this format:
    {
      "verified": boolean,
      "unclear": boolean,
      "reason": "short explanation of your decision"
    }\` },
      { inlineData: { mimeType: idMime || 'image/jpeg', data: idBase64 || '' } },
      { inlineData: { mimeType: selfieMime || 'image/jpeg', data: selfieBase64 || '' } }
    ];

    if (idImageBack) {
       const idBackBase64 = idImageBack.split(',')[1];
       const idBackMime = idImageBack.split(';')[0].split(':')[1];
       parts.splice(2, 0, { inlineData: { mimeType: idBackMime || 'image/jpeg', data: idBackBase64 || '' } });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [
        { role: 'user', parts: parts }
      ],
      config: {
        responseMimeType: "application/json"
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("Empty response from AI");
    
    const analysis = JSON.parse(resultText);

    if (analysis.unclear) {
      user.kycStatus = 'UNVERIFIED'; // Keep it unverified so they can retry
      writeDb(db);
      return res.json({ success: true, status: 'UNCLEAR', message: analysis.reason });
    } else if (analysis.verified) {
      user.kycStatus = 'VERIFIED';
      user.xp = (user.xp || 0) + 150; // XP reward
      writeDb(db);
      return res.json({ success: true, status: 'VERIFIED', message: analysis.reason });
    } else {
      user.kycStatus = 'PENDING'; // send to manual review
      writeDb(db);
      return res.json({ success: true, status: 'PENDING', message: analysis.reason });
    }
  } catch (error: any) {`;

code = code.replace(regex, replacement);
fs.writeFileSync('server.ts', code);
