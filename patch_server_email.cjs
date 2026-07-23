const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldSendMail = `  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD
        }
      });

      await transporter.sendMail({
        from: \`"Vertex Market" <\${process.env.GMAIL_USER}>\`,
        to: email,
        subject: 'Your Vertex Market Verification Code',
        text: \`Your verification code is: \${otp}\\n\\nPlease enter this code to continue.\`,
      });
      console.log(\`OTP email sent successfully to \${email}\`);
    } catch (err) {
      console.error('Failed to send OTP via Gmail:', err);
    }
  }
  
  res.json({ success: true, otp: process.env.GMAIL_USER ? undefined : otp });`;

const newSendMail = `  let emailSent = false;
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD
        }
      });

      await transporter.sendMail({
        from: \`"Vertex Market" <\${process.env.GMAIL_USER}>\`,
        to: email,
        subject: 'Your Vertex Market Verification Code',
        text: \`Your verification code is: \${otp}\\n\\nPlease enter this code to continue.\`,
      });
      console.log(\`OTP email sent successfully to \${email}\`);
      emailSent = true;
    } catch (err) {
      console.error('Failed to send OTP via Gmail:', err);
    }
  }
  
  // If email failed to send (due to bad credentials, etc.) or no config, fallback to returning OTP to client
  res.json({ success: true, otp: emailSent ? undefined : otp });`;

if (code.includes(oldSendMail)) {
   code = code.replace(oldSendMail, newSendMail);
   fs.writeFileSync('server.ts', code);
   console.log("Patched server email logic to fallback to returning OTP");
} else {
   console.log("Could not find oldSendMail block, let's search dynamically.");
}
