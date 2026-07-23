const fs = require('fs');
let code = fs.readFileSync('src/components/AuthKycModal.tsx', 'utf8');

const mainReturnTarget = "  return (";

const renderForgot = `  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoading(true);
    
    if (forgotPasswordStep === 0) {
      if (!email) {
        setAuthError('Please enter your email.');
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/auth/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (data.success) {
           setResendTimer(60);
           setForgotPasswordStep(1);
           onTriggerToast?.('LEVEL_UP', 'OTP SENT', data.otp ? \`Demo Mode OTP: \${data.otp}\` : \`Verification code sent to \${email}\`);
        } else {
           setAuthError('Failed to send OTP.');
        }
      } catch (err) {
        setAuthError('Network error.');
      }
      setIsLoading(false);
    } else {
      if (!otpValue || !password || !securityAnswer) {
        setAuthError('All fields are required.');
        setIsLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setAuthError('Passwords do not match.');
        setIsLoading(false);
        return;
      }
      if (password.length < 6) {
        setAuthError('Password must be at least 6 characters.');
        setIsLoading(false);
        return;
      }
      
      try {
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp: otpValue, newPassword: password, securityAnswer })
        });
        const data = await res.json();
        if (data.success) {
           if(typeof window !== "undefined") {
             const audio = new Audio('/sounds/win.mp3');
             audio.volume = 0.5;
             audio.play().catch(()=>{});
           }
           onTriggerToast?.('LEVEL_UP', 'PASSWORD RESET', 'Your password has been changed successfully.');
           setIsForgotPassword(false);
           setOtpValue('');
           setPassword('');
           setConfirmPassword('');
           setSecurityAnswer('');
        } else {
           setAuthError(data.error || 'Failed to reset password.');
        }
      } catch (err) {
        setAuthError('Network error.');
      }
      setIsLoading(false);
    }
  };

  if (isForgotPassword) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md overflow-y-auto z-50 select-none animate-fade-in" id="auth-kyc-modal-overlay">
        <div className="flex min-h-full items-center justify-center p-4 py-10">
          <div className="relative bg-[#090d16] border border-white/10 w-full max-w-sm rounded-xl overflow-hidden shadow-2xl flex flex-col p-6">
            <h2 className="text-xl font-bold text-white mb-2">Reset Password</h2>
            <p className="text-sm text-gray-400 mb-6">
              {forgotPasswordStep === 0 ? "Enter your email to receive a reset code." : "Enter the code, security answer, and your new password."}
            </p>
            
            {authError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded mb-4 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{authError}</p>
              </div>
            )}
            
            <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
              {forgotPasswordStep === 0 ? (
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
              ) : (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-gray-500 font-mono tracking-wider uppercase">6-Digit Code</label>
                    <div className="relative">
                      <Key className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={otpValue}
                        onChange={(e) => setOtpValue(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="000000"
                        className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 pl-10 text-white text-xs font-sans focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 text-center tracking-[0.5em]"
                      />
                    </div>
                    <div className="flex justify-end mt-1">
                      <button 
                        type="button" 
                        onClick={handleResendOtp}
                        disabled={resendTimer > 0}
                        className="text-xs text-emerald-500 hover:text-emerald-400 transition-colors disabled:text-gray-500 disabled:cursor-not-allowed"
                      >
                        {resendTimer > 0 ? \`Resend in \${resendTimer}s\` : 'Resend Code'}
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-gray-500 font-mono tracking-wider uppercase">Security Question: Mother's Maiden Name?</label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        required
                        value={securityAnswer}
                        onChange={(e) => setSecurityAnswer(e.target.value)}
                        placeholder="e.g. Smith"
                        className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 pl-10 text-white text-xs font-sans focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-gray-500 font-mono tracking-wider uppercase">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 pl-10 text-white text-xs font-sans focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-gray-500 font-mono tracking-wider uppercase">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 pl-10 text-white text-xs font-sans focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
                      />
                    </div>
                  </div>
                </>
              )}
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-4 bg-emerald-500 hover:bg-emerald-400 text-white py-2.5 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  forgotPasswordStep === 0 ? "Send Reset Code" : "Reset Password"
                )}
              </button>
              
              <button 
                type="button" 
                onClick={() => setIsForgotPassword(false)} 
                className="text-xs text-gray-500 hover:text-white transition-colors text-center mt-2"
              >
                &larr; Back to Login
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (`;
  
// Only replace the last occurrence of "  return (" which should be the main component return.
const parts = code.split(mainReturnTarget);
if (parts.length > 1) {
    const lastPart = parts.pop();
    code = parts.join(mainReturnTarget) + renderForgot + lastPart;
    fs.writeFileSync('src/components/AuthKycModal.tsx', code);
    console.log("Patched forgot password logic.");
} else {
    console.log("Could not find return block");
}
