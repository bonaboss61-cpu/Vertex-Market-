const fs = require('fs');
let code = fs.readFileSync('src/components/AuthKycModal.tsx', 'utf8');

if (!code.includes('import ReCAPTCHA')) {
  code = code.replace("import React, { useState, useRef } from 'react';", "import React, { useState, useRef } from 'react';\nimport ReCAPTCHA from 'react-google-recaptcha';");
  
  const stateCode = `
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';
  `;
  
  code = code.replace("const [resendTimer, setResendTimer] = useState(0);", "const [resendTimer, setResendTimer] = useState(0);\n" + stateCode);
  
  // Login submit validation
  const loginValidation = `
    if (!email || !password) {
      setAuthError('Email and password are required.');
      setIsLoading(false);
      return;
    }
    
    if (recaptchaSiteKey && !recaptchaToken) {
      setAuthError('Please complete the reCAPTCHA validation.');
      setIsLoading(false);
      return;
    }
    
    if (recaptchaSiteKey && recaptchaToken) {
      const rcRes = await apiService.verifyRecaptcha(recaptchaToken);
      if (!rcRes.success) {
        setAuthError(rcRes.error || 'ReCAPTCHA validation failed.');
        setIsLoading(false);
        if (recaptchaRef.current) recaptchaRef.current.reset();
        setRecaptchaToken(null);
        return;
      }
    }
  `;
  code = code.replace(/if \(\!email \|\| \!password\) \{\n\s*setAuthError\('Email and password are required\.'\);\n\s*setIsLoading\(false\);\n\s*return;\n\s*\}/g, loginValidation);

  // Signup submit validation
  const signupValidation = `
    if (!fullName || !email || !password || !confirmPassword) {
      setAuthError('All registration fields are required.');
      setIsLoading(false);
      return;
    }
    
    if (recaptchaSiteKey && !recaptchaToken) {
      setAuthError('Please complete the reCAPTCHA validation.');
      setIsLoading(false);
      return;
    }
    
    if (recaptchaSiteKey && recaptchaToken) {
      const rcRes = await apiService.verifyRecaptcha(recaptchaToken);
      if (!rcRes.success) {
        setAuthError(rcRes.error || 'ReCAPTCHA validation failed.');
        setIsLoading(false);
        if (recaptchaRef.current) recaptchaRef.current.reset();
        setRecaptchaToken(null);
        return;
      }
    }
  `;
  code = code.replace(/if \(\!fullName \|\| \!email \|\| \!password \|\| \!confirmPassword\) \{\n\s*setAuthError\('All registration fields are required\.'\);\n\s*setIsLoading\(false\);\n\s*return;\n\s*\}/g, signupValidation);

  // Inject ReCAPTCHA widget into Login Form
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
  
  code = code.replace(/<button\n\s*type="submit"/g, recaptchaWidget + '\n<button type="submit"');
  
  fs.writeFileSync('src/components/AuthKycModal.tsx', code);
}
