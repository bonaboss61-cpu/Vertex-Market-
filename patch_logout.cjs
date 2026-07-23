const fs = require('fs');
let code = fs.readFileSync('src/TradingApp.tsx', 'utf8');

const logoutOld = `        onLogout={() => {
          setAccount(prev => ({
            ...prev,
            isLoggedIn: false,
            fullName: '',
            email: '',
            isLive: false // return back to demo for safety
          }));`;
          
const logoutNew = `        onLogout={() => {
          setAccount({
            balanceDemo: 10000.0,
            balanceLive: 0.0,
            level: 1,
            xp: 0,
            isLive: false,
            badges: [],
            isLoggedIn: false,
            kycStatus: 'UNVERIFIED',
            joinedTournaments: [],
            tournamentScores: {},
            weeklyProfit: 0,
            affiliateBalance: 0,
            referralsCount: 0
          });
          setCompletedTrades([]);
          localStorage.removeItem('vertex_settled_trades');`;

code = code.replace(logoutOld, logoutNew);
fs.writeFileSync('src/TradingApp.tsx', code);
