/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import nodemailer from 'nodemailer';
import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
// @ts-ignore
import Flutterwave from 'flutterwave-node-v3';

import { requireAuth } from './src/middleware/auth.ts';
import { createPool } from './src/db/index.ts';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './src/db/schema.ts';
import { eq, desc } from 'drizzle-orm';

dotenv.config();
const app = express();
app.set('trust proxy', true);
const PORT = 3000;

const pool = createPool();
const db = drizzle(pool, { schema });

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

let flw: any = null;
if (process.env.FLW_PUBLIC_KEY && process.env.FLW_SECRET_KEY) {
  try {
    flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY);
    console.log('Flutterwave SDK initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Flutterwave SDK:', error);
  }
} else {
  console.log('No FLW_PUBLIC_KEY or FLW_SECRET_KEY found. Flutterwave operating in sandbox mode.');
}

// ---------------------------------------------------------
// NEW API ROUTES USING DRIZZLE ORM & FIREBASE AUTH
// ---------------------------------------------------------

app.post('/api/gemini/analyze', requireAuth, async (req, res) => {
  res.json({ success: true, advice: "Market is volatile." });
});

app.post('/api/user/sync', requireAuth, async (req, res) => {
  const userAccount = req.body;
  if (!userAccount || !userAccount.email) {
    res.status(400).json({ error: 'Valid user account with email is required' });
    return;
  }
  
  try {
    const existingUser = await db.query.users.findFirst({
      where: eq(schema.users.email, userAccount.email.toLowerCase())
    });

    if (!existingUser) {
      await db.insert(schema.users).values({
        uid: (req as any).user.uid,
        email: userAccount.email.toLowerCase(),
        fullName: userAccount.fullName,
        balanceDemo: userAccount.balanceDemo ?? 10000.0,
        balanceLive: userAccount.balanceLive ?? 0.0,
        level: userAccount.level ?? 1,
        xp: userAccount.xp ?? 0,
        kycStatus: userAccount.kycStatus ?? 'UNVERIFIED',
        joinedTournaments: userAccount.joinedTournaments ?? [],
        tournamentScores: userAccount.tournamentScores ?? {},
        weeklyProfit: userAccount.weeklyProfit ?? 0,
      });
    } else {
      await db.update(schema.users).set({
        fullName: userAccount.fullName,
        balanceDemo: userAccount.balanceDemo,
        balanceLive: userAccount.balanceLive,
        level: userAccount.level,
        xp: userAccount.xp,
        kycStatus: userAccount.kycStatus,
        joinedTournaments: userAccount.joinedTournaments,
        tournamentScores: userAccount.tournamentScores,
        weeklyProfit: userAccount.weeklyProfit,
      }).where(eq(schema.users.email, userAccount.email.toLowerCase()));
    }
    res.json({ success: true });
  } catch(e) {
    console.error(e);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/user/transaction', requireAuth, async (req, res) => {
  const { tx } = req.body;
  if (!tx || !tx.id || !tx.email) {
    res.status(400).json({ error: 'Valid transaction object is required' });
    return;
  }
  
  try {
    const existingUser = await db.query.users.findFirst({
      where: eq(schema.users.email, tx.email.toLowerCase())
    });
    if (!existingUser) return res.status(404).json({ error: 'User not found' });
    
    await db.insert(schema.transactions).values({
      id: tx.id,
      userId: existingUser.id,
      type: tx.type,
      amount: tx.amount,
      bonus: tx.bonus || 0,
      status: tx.status,
      details: tx.details || {},
      createdAt: new Date(tx.timestamp || Date.now())
    });
    res.json({ success: true });
  } catch(e) {
    console.error(e);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/user/transactions', requireAuth, async (req, res) => {
  const email = req.query.email as string;
  if (!email) return res.status(400).json({ error: 'Email required' });
  try {
    const existingUser = await db.query.users.findFirst({
      where: eq(schema.users.email, email.toLowerCase())
    });
    if (!existingUser) return res.json({ success: true, transactions: [] });
    
    const txs = await db.select().from(schema.transactions).where(eq(schema.transactions.userId, existingUser.id)).orderBy(desc(schema.transactions.createdAt));
    res.json({ success: true, transactions: txs });
  } catch(e) {
    console.error(e);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/flutterwave/initialize', requireAuth, async (req, res) => {
  res.json({ success: true, authorization_url: 'https://flutterwave.com/pay/mock_url' });
});

app.get('/api/flutterwave/callback', async (req, res) => {
  res.redirect('/?tab=wallet&status=successful');
});

app.get('/api/klines', async (req, res) => {
  res.json({ success: true, klines: [] });
});

app.get('/api/admin/data', requireAuth, async (req, res) => {
  try {
    const allUsers = await db.select().from(schema.users);
    const allTxs = await db.select().from(schema.transactions).orderBy(desc(schema.transactions.createdAt));
    
    const mappedTxs = allTxs.map(tx => {
      const u = allUsers.find(u => u.id === tx.userId);
      return { ...tx, email: u ? u.email : 'Unknown' };
    });
    
    res.json({ success: true, accounts: allUsers, transactions: mappedTxs });
  } catch(e) {
    console.error(e);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/settings', async (req, res) => {
  try {
    const s = await db.select().from(schema.settings);
    res.json({ success: true, settings: s.length > 0 ? s[0] : { platformProfit: 1450, platformCutPercent: 5, minDeposit: 10, minWithdraw: 50, globalWinRate: 0 } });
  } catch(e) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/admin/settings', requireAuth, async (req, res) => {
  try {
    const newSettings = req.body;
    await db.update(schema.settings).set(newSettings);
    res.json({ success: true });
  } catch(e) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/admin/adjust-balance', requireAuth, async (req, res) => {
  const { email, type, amount } = req.body;
  try {
    const u = await db.query.users.findFirst({ where: eq(schema.users.email, email.toLowerCase()) });
    if (!u) return res.status(404).json({ error: 'User not found' });
    
    if (type === 'demo') {
      await db.update(schema.users).set({ balanceDemo: u.balanceDemo + amount }).where(eq(schema.users.email, email.toLowerCase()));
    } else {
      await db.update(schema.users).set({ balanceLive: u.balanceLive + amount }).where(eq(schema.users.email, email.toLowerCase()));
    }
    res.json({ success: true });
  } catch(e) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/admin/approve', requireAuth, async (req, res) => {
  const { txId } = req.body;
  try {
    const tx = await db.query.transactions.findFirst({ where: eq(schema.transactions.id, txId) });
    if (!tx) return res.status(404).json({ error: 'Tx not found' });
    
    await db.update(schema.transactions).set({ status: 'APPROVED', approvedAt: new Date() }).where(eq(schema.transactions.id, txId));
    
    const u = await db.query.users.findFirst({ where: eq(schema.users.id, tx.userId) });
    if (u) {
      if (tx.type === 'deposit') {
        await db.update(schema.users).set({ balanceLive: u.balanceLive + tx.amount + (tx.bonus||0) }).where(eq(schema.users.id, u.id));
      } else if (tx.type === 'withdraw') {
        // already deducted
      }
    }
    res.json({ success: true });
  } catch(e) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/admin/reject', requireAuth, async (req, res) => {
  const { txId } = req.body;
  try {
    const tx = await db.query.transactions.findFirst({ where: eq(schema.transactions.id, txId) });
    if (!tx) return res.status(404).json({ error: 'Tx not found' });
    await db.update(schema.transactions).set({ status: 'REJECTED', rejectedAt: new Date() }).where(eq(schema.transactions.id, txId));
    
    const u = await db.query.users.findFirst({ where: eq(schema.users.id, tx.userId) });
    if (u && tx.type === 'withdraw') {
        await db.update(schema.users).set({ balanceLive: u.balanceLive + tx.amount }).where(eq(schema.users.id, u.id));
    }
    res.json({ success: true });
  } catch(e) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/admin/test-email', requireAuth, async (req, res) => {
  res.json({ success: true });
});
app.post('/api/admin/kyc/approve', requireAuth, async (req, res) => {
  const { email } = req.body;
  try {
    await db.update(schema.users).set({ kycStatus: 'VERIFIED' }).where(eq(schema.users.email, email.toLowerCase()));
    res.json({ success: true });
  } catch(e) {
    res.status(500).json({ error: 'Database error' });
  }
});
app.post('/api/admin/kyc/reject', requireAuth, async (req, res) => {
  const { email } = req.body;
  try {
    await db.update(schema.users).set({ kycStatus: 'REJECTED' }).where(eq(schema.users.email, email.toLowerCase()));
    res.json({ success: true });
  } catch(e) {
    res.status(500).json({ error: 'Database error' });
  }
});
app.post('/api/kyc/auto-verify', requireAuth, async (req, res) => {
  res.json({ success: true });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log("Server running on port", PORT);
  });
}

startServer();
