const fs = require('fs');

let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');
const regex = /<span className="text-white font-bold">\{account\.fullName\}<\/span>\n\s*<span className="text-xs text-gray-500">\{account\.email\}<\/span>/;
const replacement = `<span className="text-white font-bold">{account.fullName}</span>
            <span className="text-xs text-gray-500">{account.email}</span>
            <span className={\`text-[10px] mt-1 font-mono uppercase tracking-wider \${account.kycStatus === 'VERIFIED' ? 'text-emerald-500' : account.kycStatus === 'PENDING' ? 'text-blue-500' : 'text-gray-500'}\`}>KYC: {account.kycStatus}</span>`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/AdminPanel.tsx', code);
