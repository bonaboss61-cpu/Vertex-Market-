const fs = require('fs');
let code = fs.readFileSync('src/components/AuthKycModal.tsx', 'utf8');

const recaptchaWidget = `
  {recaptchaSiteKey && (
    <div className="flex justify-center my-2">
      <ReCAPTCHA
        ref={recaptchaRef}
        sitekey={recaptchaSiteKey}
        onChange={(val) => setRecaptchaToken(val)}
        theme="dark"
      />
    </div>
  )}
`;

code = code.replace(/<button type="submit"\n\s*disabled=\{isLoading\}\n\s*className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-semibold py-2\.5 rounded text-xs transition-all shadow-lg shadow-emerald-950\/20 flex items-center justify-center gap-2 mt-2 disabled:opacity-50"\n\s*>/g,
recaptchaWidget + '\n<button type="submit"\ndisabled={isLoading}\nclassName="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-semibold py-2.5 rounded text-xs transition-all shadow-lg shadow-emerald-950/20 flex items-center justify-center gap-2 mt-2 disabled:opacity-50"\n>');

fs.writeFileSync('src/components/AuthKycModal.tsx', code);
