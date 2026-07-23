const fs = require('fs');
let code = fs.readFileSync('src/components/AuthKycModal.tsx', 'utf8');

const regexFunc = /  const handleUploadDummy = \(\) => \{[\s\S]*?\};\n/;
const newFuncs = `  const handleUploadDummy = () => {
    // Set some random dummy base64 images
    setKycIdImage('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='); // red pixel
    setKycSelfieImage('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='); // blue pixel
    clickSound();
  };

  const handleBiometricScan = () => {
    clickSound();
    setKycIdImage('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='); // Mock ID
    setKycSelfieImage('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='); // Mock Selfie
    setTimeout(() => {
      runVerificationScan();
    }, 500);
  };
`;

code = code.replace(regexFunc, newFuncs);

const regexUI = /                  <div className="flex flex-col gap-3">\n                    <div className="border border-white\/10 rounded-lg p-3 bg-white\/5">/;
const newUI = `                  <div className="flex flex-col gap-3">
                    <button
                      onClick={handleBiometricScan}
                      className="group relative overflow-hidden flex flex-col items-center justify-center gap-3 py-6 px-4 bg-[#0a0f1d] border border-blue-500/30 hover:border-blue-400/50 rounded-xl transition-all"
                    >
                      <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors"></div>
                      <div className="absolute top-0 left-0 w-full h-1 bg-blue-400/50 transform -translate-y-full group-hover:animate-scanner-line"></div>
                      <div className="flex items-center gap-4 text-blue-400">
                        <ScanFace className="w-8 h-8 group-hover:scale-110 transition-transform" />
                        <Fingerprint className="w-8 h-8 group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="text-center">
                        <span className="block text-sm font-bold text-white tracking-wide">Quick Biometric Scan</span>
                        <span className="block text-[10px] text-gray-400 font-mono uppercase mt-1">Use FaceID or Fingerprint (Mock)</span>
                      </div>
                    </button>

                    <div className="flex items-center gap-3 py-2">
                      <div className="h-px bg-white/10 flex-1"></div>
                      <span className="text-[10px] font-mono text-gray-500 uppercase">OR MANUAL UPLOAD</span>
                      <div className="h-px bg-white/10 flex-1"></div>
                    </div>

                    <div className="border border-white/10 rounded-lg p-3 bg-white/5">`;

code = code.replace(regexUI, newUI);

fs.writeFileSync('src/components/AuthKycModal.tsx', code);
