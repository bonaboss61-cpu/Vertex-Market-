const fs = require('fs');
let code = fs.readFileSync('src/services/marketData.ts', 'utf8');

code = code.replace(
  "      const data = await res.json();",
  "      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);\n      const data = await res.json();\n      if (!Array.isArray(data)) throw new Error('Data is not an array');"
);

code = code.replace(
  "      console.error(`Failed to fetch history for ${asset.id}`, err);",
  "      console.warn(`Failed to fetch history for ${asset.id}, falling back to simulation.`);"
);

fs.writeFileSync('src/services/marketData.ts', code);
