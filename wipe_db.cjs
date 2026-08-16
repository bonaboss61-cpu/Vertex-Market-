const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/const defaultDb = \{[\s\S]*?fs\.writeFileSync\(DB_PATH, JSON\.stringify\(defaultDb, null, 2\), 'utf-8'\);/m, `const defaultDb = {
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
        platformProfit: 1450.0,
        platformCutPercent: 30,
        minDeposit: 10,
        minWithdraw: 20,
        globalWinRate: 50,
        cryptoAddresses: {
          BTC: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
          ETH: '0x71C7656EC7ab88b098defB751B7401B5f6d1476B',
          USDT_TRC20: 'TXCdtvQp7Lsk6M5r9eKDu8VpTL5S89NdfA',
          SOL: 'HN7cABviJHU7LsX1767bVpTL5SnF2G3K9vXb9Nd'
        }
      }
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(defaultDb, null, 2), 'utf-8');`);

fs.writeFileSync('server.ts', code);

// Wipe existing db.json to apply changes
if (fs.existsSync('db.json')) {
    fs.unlinkSync('db.json');
}
