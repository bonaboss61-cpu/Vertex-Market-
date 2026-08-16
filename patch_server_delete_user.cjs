const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const deleteEndpoint = `
app.delete('/api/admin/users/:email', (req, res) => {
  const { email } = req.params;
  const db = readDb();
  const initialLength = db.accounts.length;
  db.accounts = db.accounts.filter((u: any) => u.email.toLowerCase() !== email.toLowerCase());
  
  if (db.accounts.length < initialLength) {
    writeDb(db);
    res.json({ success: true, message: 'User deleted' });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});
`;

code = code.replace(
  "// 4. Admin API: Get All System Data",
  deleteEndpoint + "\n// 4. Admin API: Get All System Data"
);

fs.writeFileSync('server.ts', code);
