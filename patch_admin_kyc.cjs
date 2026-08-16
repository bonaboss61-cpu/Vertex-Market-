const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const regex = /<div className="grid grid-cols-2 gap-4 mt-2 p-3 bg-white\/5 rounded-lg">([\s\S]*?)<\/div>\n\s*<\/div>\n\s*\)\)\n\s*\}/m;

const replacement = `<div className="grid grid-cols-3 gap-4 mt-2 p-3 bg-white/5 rounded-lg">
              <div className="flex flex-col gap-2">
                <div className="text-xs font-mono text-gray-400 uppercase tracking-wider text-center">ID Document (Front)</div>
                {account.kycIdImage ? (
                  <div className="aspect-video bg-black/50 rounded flex items-center justify-center overflow-hidden border border-white/5 relative group">
                    <img src={account.kycIdImage} alt="ID Document Front" className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="aspect-video bg-black/50 rounded flex items-center justify-center border border-white/5 text-gray-600 text-xs">No Image</div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <div className="text-xs font-mono text-gray-400 uppercase tracking-wider text-center">ID Document (Back)</div>
                {account.kycIdImageBack ? (
                  <div className="aspect-video bg-black/50 rounded flex items-center justify-center overflow-hidden border border-white/5 relative group">
                    <img src={account.kycIdImageBack} alt="ID Document Back" className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="aspect-video bg-black/50 rounded flex items-center justify-center border border-white/5 text-gray-600 text-xs">No Back Image</div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <div className="text-xs font-mono text-gray-400 uppercase tracking-wider text-center">Self-Portrait</div>
                {account.kycSelfieImage ? (
                  <div className="aspect-video bg-black/50 rounded flex items-center justify-center overflow-hidden border border-white/5 relative group">
                    <img src={account.kycSelfieImage} alt="Selfie" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="aspect-video bg-black/50 rounded flex items-center justify-center border border-white/5 text-gray-600 text-xs">No Image</div>
                )}
              </div>
            </div>
          </div>
        ))
      }`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/AdminPanel.tsx', code);
