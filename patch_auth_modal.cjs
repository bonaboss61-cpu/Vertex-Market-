const fs = require('fs');
let code = fs.readFileSync('src/components/AuthKycModal.tsx', 'utf8');

// 1. Add state for idSideType and kycIdImageBack
code = code.replace(
  /const \[kycIdImage, setKycIdImage\] = useState<string \| null>\(null\);/,
  "const [kycIdSideType, setKycIdSideType] = useState<'FRONT_ONLY' | 'FRONT_BACK'>('FRONT_BACK');\n  const [kycIdImage, setKycIdImage] = useState<string | null>(null);\n  const [kycIdImageBack, setKycIdImageBack] = useState<string | null>(null);"
);

// 2. Add handleIdImageBackChange
code = code.replace(
  /const handleIdImageChange = \(e: React\.ChangeEvent<HTMLInputElement>\) => \{[\s\S]*?\}\s*\};\n/,
  `const handleIdImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => setKycIdImage(reader.result as string);
      reader.readAsDataURL(file);
      if (onPlaySound) onPlaySound('CLICK');
    }
  };
  
  const handleIdImageBackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => setKycIdImageBack(reader.result as string);
      reader.readAsDataURL(file);
      if (onPlaySound) onPlaySound('CLICK');
    }
  };\n`
);

// 3. modify handleBiometricScan
code = code.replace(
  /const handleBiometricScan = \(\) => \{[\s\S]*?setTimeout\(\(\) => \{/,
  `const handleBiometricScan = () => {
    if (onPlaySound) onPlaySound('CLICK');
    setKycIdImage('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='); // Mock ID
    if (kycIdSideType === 'FRONT_BACK') {
      setKycIdImageBack('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='); // Mock ID Back
    }
    setKycSelfieImage('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='); // Mock Selfie
    setTimeout(() => {`
);

// 4. Update runVerificationScan to use autoVerifyKyc
code = code.replace(
  /try \{\n\s*\/\/ Move to pending state since we can't run Gemini auto-verify purely on client[\s\S]*?const data = \{ status: 'PENDING' \};/,
  `try {
      const data = await apiService.autoVerifyKyc({
        email: account.email || '',
        idImage: kycIdImage || '',
        idImageBack: kycIdImageBack || undefined,
        selfieImage: kycSelfieImage || ''
      });`
);

code = code.replace(
  /\} else \{\n\s*\/\/ PENDING \(manual review\)[\s\S]*?kycSubmittedAt: Date\.now\(\)\n\s*\}\);\n\s*setKycStep\(4\);\n\s*onTriggerToast\?\('LEVEL_UP', 'MANUAL REVIEW REQUIRED', \/\*data\.message \|\|\*\/ 'Identity sent to manual review queue\.'\);\n\s*\}/,
  `} else if (data.status === 'UNCLEAR') {
          onUpdateAccount({
            kycStatus: 'UNVERIFIED' as 'UNVERIFIED',
            fullName: kycLegalName || account.fullName || 'Unverified Trader',
            kycIdImage: undefined,
            kycIdImageBack: undefined,
            kycSelfieImage: undefined
          });
          setKycStep(1);
          setKycIdImage(null);
          setKycIdImageBack(null);
          setKycSelfieImage(null);
          onTriggerToast?.('ERROR', 'AI VERIFICATION FAILED', data.message || 'Images were not clear. Please try again.');
        } else {
          // PENDING (manual review)
          onUpdateAccount({
            kycStatus: 'PENDING' as 'PENDING',
            fullName: kycLegalName || account.fullName || 'Pending Trader',
            kycIdImage: kycIdImage,
            kycIdImageBack: kycIdImageBack,
            kycSelfieImage: kycSelfieImage,
            kycSubmittedAt: Date.now()
          });
          setKycStep(4);
          onTriggerToast?.('LEVEL_UP', 'MANUAL REVIEW REQUIRED', data.message || 'Identity sent to manual review queue.');
        }`
);

// Fallback error toast needs adjustment
code = code.replace(
  /kycSelfieImage: kycSelfieImage,\n\s*kycSubmittedAt: Date\.now\(\)\n\s*\}\);\n\s*setKycStep\(4\);/,
  `kycIdImageBack: kycIdImageBack,
          kycSelfieImage: kycSelfieImage,
          kycSubmittedAt: Date.now()
        });
        setKycStep(4);`
);

// 5. Update UI to allow selecting ID side type and uploading back image
const uiReplacement = `<div className="border border-white/10 rounded-lg p-3 bg-white/5 flex flex-col gap-2">
                      <label className="text-xs text-white font-mono uppercase block">ID Type format</label>
                      <select 
                        value={kycIdSideType} 
                        onChange={(e) => setKycIdSideType(e.target.value as 'FRONT_ONLY' | 'FRONT_BACK')}
                        className="bg-[#0a0f1d] border border-white/10 rounded p-2 text-xs text-white outline-none"
                      >
                        <option value="FRONT_BACK">Standard ID (Front & Back)</option>
                        <option value="FRONT_ONLY">Front Only (e.g., NIN)</option>
                      </select>
                    </div>

                    <div className="border border-white/10 rounded-lg p-3 bg-white/5">
                      <label className="text-xs text-white font-mono uppercase block mb-2">ID Document (Front)</label>
                      <input type="file" onChange={handleIdImageChange} accept="image/*" className="text-xs text-gray-400 w-full file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-emerald-500/20 file:text-emerald-400 hover:file:bg-emerald-500/30" />
                      {kycIdImage && <div className="mt-2 text-xs text-emerald-400 font-mono">ID Front Uploaded ✓</div>}
                    </div>
                    
                    {kycIdSideType === 'FRONT_BACK' && (
                      <div className="border border-white/10 rounded-lg p-3 bg-white/5">
                        <label className="text-xs text-white font-mono uppercase block mb-2">ID Document (Back)</label>
                        <input type="file" onChange={handleIdImageBackChange} accept="image/*" className="text-xs text-gray-400 w-full file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-emerald-500/20 file:text-emerald-400 hover:file:bg-emerald-500/30" />
                        {kycIdImageBack && <div className="mt-2 text-xs text-emerald-400 font-mono">ID Back Uploaded ✓</div>}
                      </div>
                    )}`;

code = code.replace(
  /<div className="border border-white\/10 rounded-lg p-3 bg-white\/5">\n\s*<label className="text-xs text-white font-mono uppercase block mb-2">ID Document \(Front\)<\/label>\n\s*<input type="file" onChange=\{handleIdImageChange\} accept="image\/\*" className="text-xs text-gray-400 w-full file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-emerald-500\/20 file:text-emerald-400 hover:file:bg-emerald-500\/30" \/>\n\s*\{kycIdImage && <div className="mt-2 text-xs text-emerald-400 font-mono">ID Uploaded ✓<\/div>\}\n\s*<\/div>/,
  uiReplacement
);

// Update disabled condition on submit button
code = code.replace(
  /disabled=\{!kycIdImage \|\| !kycSelfieImage\}/,
  "disabled={!kycIdImage || (kycIdSideType === 'FRONT_BACK' && !kycIdImageBack) || !kycSelfieImage}"
);


fs.writeFileSync('src/components/AuthKycModal.tsx', code);
