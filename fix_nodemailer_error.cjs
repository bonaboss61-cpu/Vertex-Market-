const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = "console.error('Failed to send OTP via Gmail:', err);";
const replacement = "console.log('Failed to send OTP via Gmail. Falling back to Demo Mode OTP.');";

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('server.ts', code);
    console.log("Patched server to suppress nodemailer console.error.");
} else {
    console.log("Could not find target to patch.");
}
