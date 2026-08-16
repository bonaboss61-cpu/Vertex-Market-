const fs = require('fs');

let db = JSON.parse(fs.readFileSync('db.json', 'utf8'));

db.accounts.push({
  email: "celebguy01@gmail.com",
  fullName: "Celeb Guy",
  balanceDemo: 10000,
  balanceLive: 0,
  level: 1,
  xp: 0,
  kycStatus: "PENDING",
  joinedTournaments: [],
  tournamentScores: {},
  weeklyProfit: 0,
  kycSubmittedAt: Date.now()
});

fs.writeFileSync('db.json', JSON.stringify(db, null, 2));
