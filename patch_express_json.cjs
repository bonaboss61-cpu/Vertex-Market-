const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace("app.use(express.json());", "app.use(express.json({ limit: '50mb' }));\napp.use(express.urlencoded({ limit: '50mb', extended: true }));");

fs.writeFileSync('server.ts', code);
