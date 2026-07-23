const fs = require('fs');
let code = fs.readFileSync('src/components/AuthKycModal.tsx', 'utf8');

const regexToRemove = /                  \{\(!kycIdImage \|\| !kycSelfieImage\) && \(\n                    <div className="flex flex-col gap-1\.5 mt-2">\n                      <div className="relative flex items-center justify-center">\n                        <div className="absolute inset-x-0 h-px bg-white\/5"><\/div>\n                        <span className="relative bg-\[#090d16\] px-3 text-\[9px\] text-gray-500 font-mono">DEV TEST UTILITY<\/span>\n                      <\/div>\n                      <button\n                        onClick=\{handleUploadDummy\}\n                        className="py-2 rounded bg-white\/5 hover:bg-white\/10 border border-white\/10 text-xs text-gray-300 font-sans hover:text-white transition-all"\n                      >\n                        ⚡ Simulate Upload\n                      <\/button>\n                    <\/div>\n                  \)\}\n/;

code = code.replace(regexToRemove, "");

fs.writeFileSync('src/components/AuthKycModal.tsx', code);
