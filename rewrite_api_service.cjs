const fs = require('fs');

const newContent = `import { apiFetch } from '../lib/apiFetch.ts';
import type { UserAccount, Transaction, SystemSettings } from '../types';

export const apiService = {
  verifyRecaptcha: async (token: string) => {
    try {
      const res = await apiFetch('/api/verify-recaptcha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      return await res.json();
    } catch (e) {
      console.error(e);
      return { success: false, error: 'Network error verifying reCAPTCHA' };
    }
  },

  async getAdminData(): Promise<{ success: boolean; accounts?: UserAccount[]; transactions?: Transaction[]; settings?: SystemSettings }> {
    try {
      const res = await apiFetch('/api/admin/data');
      return await res.json();
    } catch (e) {
      console.error(e);
      return { success: false };
    }
  },

  async approveKyc(email: string): Promise<{ success: boolean }> {
    try {
      const res = await apiFetch('/api/admin/kyc/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      return await res.json();
    } catch (e) { return { success: false }; }
  },

  async rejectKyc(email: string): Promise<{ success: boolean }> {
    try {
      const res = await apiFetch('/api/admin/kyc/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      return await res.json();
    } catch (e) { return { success: false }; }
  },

  async approveTransaction(txId: string): Promise<{ success: boolean }> {
    try {
      const res = await apiFetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txId })
      });
      return await res.json();
    } catch (e) { return { success: false }; }
  },

  async rejectTransaction(txId: string): Promise<{ success: boolean }> {
    try {
      const res = await apiFetch('/api/admin/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txId })
      });
      return await res.json();
    } catch (e) { return { success: false }; }
  },

  async adjustBalance(email: string, type: 'live' | 'demo', amount: number): Promise<{ success: boolean }> {
    try {
      const res = await apiFetch('/api/admin/adjust-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type, amount })
      });
      return await res.json();
    } catch (e) { return { success: false }; }
  },

  async updateSettings(settings: Partial<SystemSettings>): Promise<{ success: boolean }> {
    try {
      const res = await apiFetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      });
      return await res.json();
    } catch (e) { return { success: false }; }
  },

  async syncUser(email: string, userData: Partial<UserAccount>): Promise<{ success: boolean; account?: UserAccount; settings?: SystemSettings }> {
    try {
      const res = await apiFetch('/api/user/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, ...userData })
      });
      return await res.json();
    } catch (error) {
      console.error('Error syncing user:', error);
      return { success: false };
    }
  },

  async getUserTransactions(email: string): Promise<Transaction[]> {
    try {
      const res = await apiFetch('/api/user/transactions?email=' + encodeURIComponent(email));
      const data = await res.json();
      return data.transactions || [];
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  },

  async createTransaction(transactionData: Partial<Transaction>): Promise<{ success: boolean; transaction?: Transaction; balanceLive?: number }> {
    try {
      const res = await apiFetch('/api/user/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData)
      });
      return await res.json();
    } catch (error) {
      console.error('Error creating transaction:', error);
      return { success: false };
    }
  },

  async getSettings(): Promise<SystemSettings | null> {
    try {
      const res = await apiFetch('/api/settings');
      const data = await res.json();
      return data.settings || null;
    } catch (error) {
      console.error('Error getting settings:', error);
      return null;
    }
  }
};
`;

fs.writeFileSync('src/services/apiService.ts', newContent);
