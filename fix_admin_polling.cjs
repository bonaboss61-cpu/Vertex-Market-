const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const replacement = `
  useEffect(() => {
    if (isOpen) {
      fetchData();
      onPlaySound('PLACE');
      
      const interval = setInterval(() => {
        apiService.getAdminData().then(data => {
          if (data) {
            setAccounts(data.accounts || []);
            setTransactions(data.transactions || []);
            setSettings(data.settings || null);
          }
        }).catch(console.error);
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [isOpen]);
`;

code = code.replace(/useEffect\(\(\) => \{\n\s*if \(isOpen\) \{\n\s*fetchData\(\);\n\s*onPlaySound\('PLACE'\);\n\s*\}\n\s*\}, \[isOpen\]\);/g, replacement);

fs.writeFileSync('src/components/AdminPanel.tsx', code);
