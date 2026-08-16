const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const handleDeleteUserCode = `
  const handleDeleteUser = async (email: string) => {
    if (window.confirm('Are you sure you want to delete ' + email + '?')) {
      try {
        const data = await apiService.deleteUser(email);
        if (data && data.success) {
          onPlaySound('WIN');
          onTriggerToast('LEVEL_UP', 'USER DELETED', 'Successfully deleted ' + email);
          fetchData();
        } else {
          onTriggerToast('LOSS', 'ERROR', 'Could not delete user.');
        }
      } catch (err) {
        onTriggerToast('LOSS', 'NETWORK ERROR', 'Could not process request.');
      }
    }
  };
`;

code = code.replace(
  "const handleAdjustBalance =",
  handleDeleteUserCode + "\n  const handleAdjustBalance ="
);

code = code.replace(
  "<UsersTab accounts={accounts} onAdjustBalance={handleAdjustBalance} />",
  "<UsersTab accounts={accounts} onAdjustBalance={handleAdjustBalance} onDeleteUser={handleDeleteUser} />"
);

code = code.replace(
  "function UsersTab({ accounts, onAdjustBalance }: { accounts: UserAccount[], onAdjustBalance: (email: string, amount: number, type: 'live' | 'demo') => void }) {",
  "function UsersTab({ accounts, onAdjustBalance, onDeleteUser }: { accounts: UserAccount[], onAdjustBalance: (email: string, amount: number, type: 'live' | 'demo') => void, onDeleteUser: (email: string) => void }) {"
);

code = code.replace(
  /<div className="flex gap-4">/g,
  `<div className="flex gap-4 items-center">
            <button onClick={() => onDeleteUser(account.email!)} className="px-3 py-1 bg-rose-500/20 text-rose-500 hover:bg-rose-500/40 rounded text-[10px] uppercase font-bold tracking-wider mr-2">Delete</button>`
);

fs.writeFileSync('src/components/AdminPanel.tsx', code);
