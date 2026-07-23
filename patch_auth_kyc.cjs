const fs = require('fs');
let code = fs.readFileSync('src/components/AuthKycModal.tsx', 'utf8');

// 1. Update state
code = code.replace("const [kycFile, setKycFile] = useState<File | null>(null);", 
  "const [kycIdImage, setKycIdImage] = useState<string>('');\n  const [kycSelfieImage, setKycSelfieImage] = useState<string>('');");
code = code.replace("const [kycFileName, setKycFileName] = useState('');", "");

// 2. Remove old drag handlers and add new file change handlers
code = code.replace(/const handleDrag = [\s\S]*?const handleUploadDummy = \(\) => \{[\s\S]*?\};\n/g, `
  const handleIdImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => setKycIdImage(reader.result as string);
      reader.readAsDataURL(file);
      clickSound();
    }
  };

  const handleSelfieImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => setKycSelfieImage(reader.result as string);
      reader.readAsDataURL(file);
      clickSound();
    }
  };

  const handleUploadDummy = () => {
    // Set some random dummy base64 images
    setKycIdImage('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='); // red pixel
    setKycSelfieImage('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='); // blue pixel
    clickSound();
  };
`);

// 3. Update verification step
const runScanTarget = `
        setTimeout(() => {
          winSound();
          onUpdateAccount({
            kycStatus: 'VERIFIED',
            fullName: kycLegalName || account.fullName || 'Verified Trader',
            xp: account.xp + 150, // reward XP
          });
          setKycStep(4);
        }, 1000);`;

const runScanNew = `
        setTimeout(() => {
          winSound();
          onUpdateAccount({
            kycStatus: 'PENDING',
            fullName: kycLegalName || account.fullName || 'Pending Trader',
            kycIdImage: kycIdImage,
            kycSelfieImage: kycSelfieImage,
            kycSubmittedAt: Date.now()
          });
          setKycStep(4);
        }, 1000);`;

code = code.replace(runScanTarget, runScanNew);

// 4. Update the UI for kycStep === 2
const kycStep2TargetRegex = /\{kycStep === 2 && \([\s\S]*?\{kycStep === 3 && \(/;

const kycStep2New = `{kycStep === 2 && (
                <div className="flex flex-col gap-4">
                  <div className="text-center">
                    <h4 className="text-white font-semibold text-sm">Upload KYC Documents</h4>
                    <p className="text-xs text-gray-400 mt-1">
                      Upload your ID and a self-portrait to proceed.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="border border-white/10 rounded-lg p-3 bg-white/5">
                      <label className="text-xs text-white font-mono uppercase block mb-2">ID Document (Front)</label>
                      <input type="file" onChange={handleIdImageChange} accept="image/*" className="text-xs text-gray-400 w-full file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-emerald-500/20 file:text-emerald-400 hover:file:bg-emerald-500/30" />
                      {kycIdImage && <div className="mt-2 text-xs text-emerald-400 font-mono">ID Uploaded ✓</div>}
                    </div>

                    <div className="border border-white/10 rounded-lg p-3 bg-white/5">
                      <label className="text-xs text-white font-mono uppercase block mb-2">Self-Portrait (Selfie)</label>
                      <input type="file" onChange={handleSelfieImageChange} accept="image/*" className="text-xs text-gray-400 w-full file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-emerald-500/20 file:text-emerald-400 hover:file:bg-emerald-500/30" />
                      {kycSelfieImage && <div className="mt-2 text-xs text-emerald-400 font-mono">Selfie Uploaded ✓</div>}
                    </div>
                  </div>

                  {(!kycIdImage || !kycSelfieImage) && (
                    <div className="flex flex-col gap-1.5 mt-2">
                      <div className="relative flex items-center justify-center">
                        <div className="absolute inset-x-0 h-px bg-white/5"></div>
                        <span className="relative bg-[#090d16] px-3 text-[9px] text-gray-500 font-mono">DEV TEST UTILITY</span>
                      </div>
                      <button
                        onClick={handleUploadDummy}
                        className="py-2 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 font-sans hover:text-white transition-all"
                      >
                        ⚡ Simulate Upload
                      </button>
                    </div>
                  )}

                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => { clickSound(); setKycStep(1); }}
                      className="flex-1 py-2 rounded bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-gray-300 font-sans"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => { clickSound(); runVerificationScan(); }}
                      disabled={!kycIdImage || !kycSelfieImage}
                      className="flex-[2] py-2 rounded bg-emerald-500 hover:bg-emerald-400 text-white font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Submit & Scan
                    </button>
                  </div>
                </div>
              )}
              {kycStep === 3 && (`;

code = code.replace(kycStep2TargetRegex, kycStep2New);

// 5. Update kycStep === 4 UI
const step4TargetRegex = /\{kycStep === 4 && \([\s\S]*?Identity Verified![\s\S]*?<\/div>\n              \)}/g;

const step4New = `{kycStep === 4 && (
                <div className="flex flex-col items-center justify-center gap-4 py-8 text-center animate-fade-in">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full"></div>
                    <div className="relative w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-2">
                      <ShieldCheck className="w-8 h-8" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-wide">Under Review</h3>
                    <p className="text-xs text-gray-400 mt-2 max-w-xs leading-relaxed">
                      Your identity documents have been submitted to our secure ledger and are awaiting manual review by a compliance officer.
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
code = code.replace(step4TargetRegex, step4New);

fs.writeFileSync('src/components/AuthKycModal.tsx', code);
