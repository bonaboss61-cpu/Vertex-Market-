const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = "res.json({ success: true }); // do not send OTP to client to prevent cheating";
const replacement = "res.json({ success: true, otp: process.env.GMAIL_USER ? undefined : otp });";

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('server.ts', code);
    console.log("Patched server OTP return.");
}
