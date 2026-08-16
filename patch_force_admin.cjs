const fs = require('fs');

let code = fs.readFileSync('src/TradingApp.tsx', 'utf8');

// Insert a useEffect that responds to forceAdmin
code = code.replace(
  /export default function App\(\{ forceAdmin = false \}: \{ forceAdmin\?: boolean \}\) \{/,
  `export default function App({ forceAdmin = false }: { forceAdmin?: boolean }) {
  React.useEffect(() => {
    if (forceAdmin) {
      setIsAdminAuthOpen(true);
    }
  }, [forceAdmin]);`
);

fs.writeFileSync('src/TradingApp.tsx', code);
