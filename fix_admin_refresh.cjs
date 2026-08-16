const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const replacement = `
            <div className="flex items-center gap-3">
              <button onClick={fetchData} className="p-2 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer flex items-center gap-2">
                <RefreshCw className={\`w-4 h-4 \${loading ? 'animate-spin' : ''}\`} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Sync</span>
              </button>
              <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer">
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
`;

code = code.replace(/<button onClick=\{onClose\} className="p-2 bg-white\/5 hover:bg-white\/10 rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer">\n\s*<CloseIcon className="w-5 h-5" \/>\n\s*<\/button>\n\s*<\/div>/g, replacement);

fs.writeFileSync('src/components/AdminPanel.tsx', code);
