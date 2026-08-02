const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

code = code.replace(/const handleApprove = async \(txId: string\) => \{[\s\S]*?fetchData\(\);\n\s*\}\n\s*\} catch \(err\) \{\n\s*console\.error\(err\);\n\s*\}\n\s*\};/m,
`const handleApprove = async (txId: string) => {
    try {
      const data = await apiService.approveTransaction(txId);
      if (data && data.success) {
        fetchData();
      }
    } catch (err) { console.error(err); }
  };`);

code = code.replace(/const handleReject = async \(txId: string\) => \{[\s\S]*?fetchData\(\);\n\s*\}\n\s*\} catch \(err\) \{\n\s*console\.error\(err\);\n\s*\}\n\s*\};/m,
`const handleReject = async (txId: string) => {
    try {
      const data = await apiService.rejectTransaction(txId);
      if (data && data.success) {
        fetchData();
      }
    } catch (err) { console.error(err); }
  };`);

code = code.replace(/const handleAdjustBalance = async \(email: string, amount: number, balanceType: 'live' \| 'demo'\) => \{[\s\S]*?fetchData\(\);\n\s*\}\n\s*\} catch \(err\) \{\n\s*console\.error\(err\);\n\s*\}\n\s*\};/m,
`const handleAdjustBalance = async (email: string, amount: number, balanceType: 'live' | 'demo') => {
    try {
      const data = await apiService.adjustBalance(email, balanceType, amount);
      if (data && data.success) {
        fetchData();
      }
    } catch (err) { console.error(err); }
  };`);

code = code.replace(/const handleSaveSettings = async \(newSettings: SystemSettings\) => \{[\s\S]*?fetchData\(\);\n\s*\}\n\s*\} catch \(err\) \{\n\s*console\.error\(err\);\n\s*\}\n\s*\};/m,
`const handleSaveSettings = async (newSettings: SystemSettings) => {
    try {
      const data = await apiService.updateSettings(newSettings);
      if (data && data.success) {
        fetchData();
      }
    } catch (err) { console.error(err); }
  };`);

fs.writeFileSync('src/components/AdminPanel.tsx', code);
