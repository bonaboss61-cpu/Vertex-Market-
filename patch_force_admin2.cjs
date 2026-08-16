const fs = require('fs');
let code = fs.readFileSync('src/TradingApp.tsx', 'utf8');

// Remove the one we just added at the top
code = code.replace(
  /export default function App\(\{ forceAdmin = false \}: \{ forceAdmin\?: boolean \}\) \{\n  React\.useEffect\(\(\) => \{\n    if \(forceAdmin\) \{\n      setIsAdminAuthOpen\(true\);\n    \}\n  \}, \[forceAdmin\]\);/,
  "export default function App({ forceAdmin = false }: { forceAdmin?: boolean }) {"
);

// Insert it after `const [isAdminAuthOpen, setIsAdminAuthOpen] = useState<boolean>(false);`
code = code.replace(
  /const \[isAdminAuthOpen, setIsAdminAuthOpen\] = useState<boolean>\(false\);/,
  `const [isAdminAuthOpen, setIsAdminAuthOpen] = useState<boolean>(false);

  useEffect(() => {
    if (forceAdmin) {
      setIsAdminAuthOpen(true);
    }
  }, [forceAdmin]);`
);

fs.writeFileSync('src/TradingApp.tsx', code);
