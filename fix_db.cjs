const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

const replacement = `function readDb() {
  if (!fs.existsSync(DB_PATH)) {
    const defaultDb = {
      accounts: [
        {
          email: "bonaboss61@gmail.com",
          fullName: "Bona Boss",
          balanceDemo: 10000.0,
          balanceLive: 0.0,
          level: 1,
          xp: 0,
          kycStatus: "VERIFIED",
          joinedTournaments: [],
          tournamentScores: {},
          weeklyProfit: 0
        }
      ],
      transactions: [],
      settings: {
        platformProfit: 0,
        platformCutPercent: 30,
        minDeposit: 10,
        minWithdraw: 20,
        globalWinRate: 50,
        cryptoAddresses: {
          BTC: '',
          ETH: '',
          USDT_TRC20: '',
          SOL: ''
        }
      }
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(defaultDb, null, 2), 'utf-8');
    return defaultDb;
  }`;

// Need to completely replace readDb function body
code = code.replace(/function readDb\(\) \{[\s\S]*?return JSON\.parse\(content\);\n  \} catch \(err\) \{/m, replacement + `\n  try {\n    const content = fs.readFileSync(DB_PATH, 'utf-8');\n    return JSON.parse(content);\n  } catch (err) {`);

fs.writeFileSync('server.ts', code);

// Wipe existing db.json to apply changes
if (fs.existsSync('db.json')) {
    fs.unlinkSync('db.json');
}
