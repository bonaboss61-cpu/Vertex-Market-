const fs = require('fs');
let code = fs.readFileSync('src/components/AuthKycModal.tsx', 'utf8');

const regex = /const handleForgotPassword = async \(e: React\.FormEvent\) => \{[\s\S]*?setIsLoading\(false\);\n    \}\n  \};/;

if (code.match(regex)) {
  const newCode = `const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoading(true);
    
    if (!email) {
      setAuthError('Please enter your email.');
      setIsLoading(false);
      return;
    }
    
    try {
      await sendPasswordResetEmail(auth, email);
      if (onTriggerToast) {
        onTriggerToast('WIN', 'EMAIL SENT', \`Password reset link sent to \${email}\`);
      }
      setIsForgotPassword(false);
    } catch (err: any) {
      setAuthError(err.message || 'Failed to send reset email.');
    }
    setIsLoading(false);
  };`;
  code = code.replace(regex, newCode);
  
  // also we need to update the form UI since it no longer uses step 1.
  code = code.replace(/\{forgotPasswordStep === 0 \? \([\s\S]*?\) : \([\s\S]*?<\/button>\n                            <button/m, 
    `{forgotPasswordStep === 0 && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-500 font-mono tracking-wider uppercase">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 pl-10 text-white text-xs font-sans focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>
              )}
              
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-2.5 mt-2 bg-emerald-500 hover:bg-emerald-600 text-white font-mono text-xs rounded transition-colors"
              >
                {isLoading ? "Processing..." : "Send Reset Link"}
              </button>
              
              <button`);
              
  fs.writeFileSync('src/components/AuthKycModal.tsx', code);
  console.log("Patched modal.");
} else {
  console.log("Failed to match handleForgotPassword.");
}
