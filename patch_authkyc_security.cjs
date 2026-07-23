const fs = require('fs');
let code = fs.readFileSync('src/components/AuthKycModal.tsx', 'utf8');

const securityInputOld = `              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-500 font-mono tracking-wider uppercase">Referral Code (Optional)</label>
                <div className="relative">
                  <Gift className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    placeholder="ENTER CODE"
                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 pl-10 text-white text-xs font-sans focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>`;

const securityInputNew = `              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-500 font-mono tracking-wider uppercase">Referral (Optional)</label>
                  <div className="relative">
                    <Gift className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                      placeholder="ENTER CODE"
                      className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 pl-10 text-white text-xs font-sans focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-500 font-mono tracking-wider uppercase">Security Answer</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      required
                      value={securityAnswer}
                      onChange={(e) => setSecurityAnswer(e.target.value)}
                      placeholder="Mother's maiden name?"
                      className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 pl-10 text-white text-xs font-sans focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                </div>
              </div>`;

code = code.replace(securityInputOld, securityInputNew);

fs.writeFileSync('src/components/AuthKycModal.tsx', code);
