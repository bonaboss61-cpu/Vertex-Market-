const fs = require('fs');
let code = fs.readFileSync('src/components/AuthKycModal.tsx', 'utf8');

const regex = /\{kycStep === 4 && \([\s\S]*?Return to Terminal\n                  <\/button>\n                <\/div>\n              \)\}/;

const replacement = `{kycStep === 4 && (
                <div className="flex flex-col items-center justify-center gap-4 py-8 text-center animate-fade-in">
                  <div className="relative">
                    <div className={\`absolute inset-0 blur-xl rounded-full \${account?.kycStatus === 'VERIFIED' ? 'bg-emerald-500/20' : 'bg-blue-500/20'}\`}></div>
                    <div className={\`relative w-16 h-16 rounded-full border flex items-center justify-center mb-2 \${account?.kycStatus === 'VERIFIED' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'}\`}>
                      {account?.kycStatus === 'VERIFIED' ? <CheckCircle2 className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-wide">
                      {account?.kycStatus === 'VERIFIED' ? 'Identity Verified!' : 'Under Review'}
                    </h3>
                    <p className="text-xs text-gray-400 mt-2 max-w-xs leading-relaxed">
                      {account?.kycStatus === 'VERIFIED' 
                        ? 'Your identity documents have been automatically verified by our AI compliance engine.' 
                        : 'Your identity documents have been submitted to our secure ledger and are awaiting manual review by a compliance officer.'}
                    </p>
                  </div>
                  <button
                    onClick={() => { clickSound(); onClose(); }}
                    className="mt-4 px-8 py-2.5 rounded bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-bold font-mono tracking-wider transition-all"
                  >
                    Return to Terminal
                  </button>
                </div>
              )}`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/AuthKycModal.tsx', code);
