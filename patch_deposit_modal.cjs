const fs = require('fs');
let code = fs.readFileSync('src/components/DepositWithdrawModal.tsx', 'utf8');

const targetStr = `              {/* Amount Selection */}`;

const replaceStr = `              {/* Withdrawal Availability Details */}
              {account.isLive && activeTab === 'withdraw' && (
                <div className="flex flex-col gap-1 mt-1 mb-2 p-3 bg-black/40 border border-white/5 rounded-lg shadow-inner">
                   <div className="flex justify-between items-center text-xs">
                     <span className="text-gray-400 font-mono uppercase tracking-wider text-[10px]">Total Balance</span>
                     <span className="text-white font-mono font-bold">\${account.balanceLive.toFixed(2)}</span>
                   </div>
                   {(account.totalDeposits || 0) > 0 && (
                     <>
                       <div className="flex justify-between items-center text-xs mt-0.5">
                         <span className="text-rose-400/80 font-mono uppercase tracking-wider text-[10px]">Locked (Awaiting Volume)</span>
                         <span className="text-rose-400 font-mono font-bold">
                           -\${Math.max(0, (account.totalDeposits || 0) - (account.liveTradeVolume || 0)).toFixed(2)}
                         </span>
                       </div>
                       <div className="flex justify-between items-center text-xs border-t border-white/10 pt-1 mt-1">
                         <span className="text-emerald-400 font-mono uppercase tracking-wider text-[10px]">Available to Withdraw</span>
                         <span className="text-emerald-400 font-mono font-bold">
                           \${(account.balanceLive - Math.max(0, (account.totalDeposits || 0) - (account.liveTradeVolume || 0))).toFixed(2)}
                         </span>
                       </div>
                       {(account.totalDeposits || 0) > (account.liveTradeVolume || 0) && (
                          <p className="text-[9px] text-gray-500 leading-tight mt-1.5">
                            * Deposited capital requires a trading volume equivalent of \${(account.totalDeposits || 0).toFixed(2)} before it unlocks. Affiliate commissions and previous profits are always unlocked.
                          </p>
                       )}
                     </>
                   )}
                </div>
              )}

              {/* Amount Selection */}`;

code = code.replace(targetStr, replaceStr);
fs.writeFileSync('src/components/DepositWithdrawModal.tsx', code);
