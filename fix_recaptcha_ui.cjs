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
// Remove all recaptchaWidgets
code = code.replace(/\{recaptchaSiteKey && \([\s\S]*?theme="dark"\n\s*\/>\n\s*<\/div>\n\s*\)\}\n\s*/g, '');

// Now I will only add it right above the Login and Sign up buttons.
// Let's find a reliable anchor.
code = code.replace(/<button\n\s*type="submit"\n\s*disabled=\{isLoading\}\n\s*className="w-full bg-emerald-500/g, recaptchaWidget + '\n<button\ntype="submit"\ndisabled={isLoading}\nclassName="w-full bg-emerald-500');

fs.writeFileSync('src/components/AuthKycModal.tsx', code);
