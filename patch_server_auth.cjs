const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Patch login
const loginOld = `app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const db = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'db.json'), 'utf-8'));
  const user = db.accounts.find((u) => u.email.toLowerCase() === email.toLowerCase());`;

const loginNew = `app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const db = readDb();
  const user = db.accounts.find((u: any) => u.email.toLowerCase() === email.toLowerCase());`;

code = code.replace(loginOld, loginNew);

// Patch reset-password
const resetOld = `app.post('/api/auth/reset-password', (req, res) => {
  const { email, otp, newPassword, securityAnswer } = req.body;
  const dbPath = path.join(process.cwd(), 'db.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
  const user = db.accounts.find((u) => u.email.toLowerCase() === email.toLowerCase());`;

const resetNew = `app.post('/api/auth/reset-password', (req, res) => {
  const { email, otp, newPassword, securityAnswer } = req.body;
  const dbPath = path.join(process.cwd(), 'db.json');
  const db = readDb();
  const user = db.accounts.find((u: any) => u.email.toLowerCase() === email.toLowerCase());`;

code = code.replace(resetOld, resetNew);

const resetWriteOld = `  user.password = newPassword;
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
  delete otpStore[email.toLowerCase()];`;

const resetWriteNew = `  user.password = newPassword;
  writeDb(db);
  delete otpStore[email.toLowerCase()];`;

code = code.replace(resetWriteOld, resetWriteNew);

fs.writeFileSync('server.ts', code);
