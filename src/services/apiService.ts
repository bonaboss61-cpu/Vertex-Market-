import { db } from '../lib/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  getDocs, 
  query, 
  where,
  orderBy,
  addDoc
} from 'firebase/firestore';
import type { UserAccount, Transaction, SystemSettings } from '../types';

export const apiService = {
  async getAdminData(): Promise<{ success: boolean; accounts?: UserAccount[]; transactions?: Transaction[]; settings?: SystemSettings }> {
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const accounts = usersSnap.docs.map(doc => doc.data() as UserAccount);
      
      const txSnap = await getDocs(collection(db, 'transactions'));
      const transactions = txSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Transaction);
      
      const settings = await this.getSettings() || {} as SystemSettings;
      
      return { success: true, accounts, transactions, settings };
    } catch (e) {
      console.error(e);
      return { success: false };
    }
  },

  async approveKyc(email: string): Promise<{ success: boolean }> {
    try {
      const userRef = doc(db, 'users', email.toLowerCase());
      await updateDoc(userRef, { kycStatus: 'VERIFIED' });
      return { success: true };
    } catch (e) { return { success: false }; }
  },

  async rejectKyc(email: string): Promise<{ success: boolean }> {
    try {
      const userRef = doc(db, 'users', email.toLowerCase());
      await updateDoc(userRef, { kycStatus: 'UNVERIFIED', kycIdImage: null, kycSelfieImage: null });
      return { success: true };
    } catch (e) { return { success: false }; }
  },

  async approveTransaction(txId: string): Promise<{ success: boolean }> {
    try {
      const txSnap = await getDoc(doc(db, 'transactions', txId));
      if (!txSnap.exists()) return { success: false };
      const tx = txSnap.data() as Transaction;
      
      await updateDoc(doc(db, 'transactions', txId), { status: 'APPROVED', approvedAt: Date.now() });
      
      const userRef = doc(db, 'users', tx.email.toLowerCase());
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
         const user = userSnap.data() as UserAccount;
         if (tx.type === 'deposit') {
            await updateDoc(userRef, { balanceLive: user.balanceLive + tx.amount + (tx.bonus || 0) });
         } else if (tx.type === 'withdraw') {
            // Amount was already deducted when created
         }
      }
      return { success: true };
    } catch (e) { return { success: false }; }
  },

  async rejectTransaction(txId: string): Promise<{ success: boolean }> {
    try {
      const txSnap = await getDoc(doc(db, 'transactions', txId));
      if (!txSnap.exists()) return { success: false };
      const tx = txSnap.data() as Transaction;
      
      await updateDoc(doc(db, 'transactions', txId), { status: 'REJECTED', rejectedAt: Date.now() });
      
      const userRef = doc(db, 'users', tx.email.toLowerCase());
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
         const user = userSnap.data() as UserAccount;
         if (tx.type === 'withdraw') {
            await updateDoc(userRef, { balanceLive: user.balanceLive + tx.amount });
         }
      }
      return { success: true };
    } catch (e) { return { success: false }; }
  },

  async adjustBalance(email: string, type: 'live' | 'demo', amount: number): Promise<{ success: boolean }> {
    try {
      const userRef = doc(db, 'users', email.toLowerCase());
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) return { success: false };
      const user = userSnap.data() as UserAccount;
      const v = user.adminBalanceVersion || 0;
      
      if (type === 'live') {
        await updateDoc(userRef, { balanceLive: amount, adminBalanceVersion: v + 1 });
      } else {
        await updateDoc(userRef, { balanceDemo: amount, adminBalanceVersion: v + 1 });
      }
      return { success: true };
    } catch (e) { return { success: false }; }
  },
  
  async updateSettings(settings: Partial<SystemSettings>): Promise<{ success: boolean }> {
    try {
      await setDoc(doc(db, 'system', 'settings'), settings, { merge: true });
      return { success: true };
    } catch (e) { return { success: false }; }
  },

  // Sync user data to/from Firestore
  async syncUser(email: string, userData: Partial<UserAccount>): Promise<{ success: boolean; account?: UserAccount; settings?: SystemSettings }> {
    try {
      const userRef = doc(db, 'users', email.toLowerCase());
      const userSnap = await getDoc(userRef);
      
      let account: UserAccount;
      if (userSnap.exists()) {
        const existingData = userSnap.data() as UserAccount;
        // Merge existing with updates
        account = { ...existingData, ...userData };
        await updateDoc(userRef, userData);
      } else {
        // Create new
        account = {
          balanceDemo: 10000.0,
          balanceLive: 0.0,
          level: 1,
          xp: 0,
          isLive: false,
          badges: [],
          kycStatus: 'UNVERIFIED',
          joinedTournaments: [],
          tournamentScores: {},
          weeklyProfit: 0,
          ...userData,
        } as UserAccount;
        await setDoc(userRef, account);
      }

     // Fetch settings separately.
// Settings failure should NOT make account registration fail.
let settings: SystemSettings | undefined;

try {
    const settingsSnap = await getDoc(
        doc(db, 'system', 'settings')
    );

    settings = settingsSnap.exists()
        ? settingsSnap.data() as SystemSettings
        : undefined;
} catch (settingsError) {
    console.warn(
        'Could not load system settings:',
        settingsError
    );
}

return {
    success: true,
    account,
    settings
};
    } catch (error) {
      console.error('Error syncing user:', error);
      return { success: false };
    }
  },

  async getUserTransactions(email: string): Promise<Transaction[]> {
    try {
      const q = query(
        collection(db, 'transactions'), 
        where('email', '==', email.toLowerCase())
      );
      const querySnapshot = await getDocs(q);
      const transactions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];
      
      return transactions.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  },

  async createTransaction(transactionData: Partial<Transaction>): Promise<{ success: boolean; transaction?: Transaction; balanceLive?: number }> {
    try {
      const email = transactionData.email!.toLowerCase();
      const userRef = doc(db, 'users', email);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) return { success: false };
      
      const user = userSnap.data() as UserAccount;
      let newBalance = user.balanceLive;
      
      if (transactionData.type === 'deposit' && transactionData.channel?.startsWith('Crypto')) {
         newBalance += (transactionData.amount || 0) + (transactionData.bonus || 0);
         transactionData.status = 'APPROVED';
      } else if (transactionData.type === 'withdraw') {
         newBalance -= (transactionData.amount || 0);
         transactionData.status = 'PENDING';
      } else {
         transactionData.status = 'PENDING';
      }
      
      await updateDoc(userRef, { balanceLive: newBalance });
      
      const docRef = await addDoc(collection(db, 'transactions'), {
        ...transactionData,
        timestamp: Date.now()
      });
      return { success: true, transaction: { id: docRef.id, ...transactionData } as Transaction, balanceLive: newBalance };
    } catch (error) {
      console.error('Error creating transaction:', error);
      return { success: false };
    }
  },

  async getSettings(): Promise<SystemSettings | null> {
    try {
      const settingsSnap = await getDoc(doc(db, 'system', 'settings'));
      return settingsSnap.exists() ? settingsSnap.data() as SystemSettings : null;
    } catch (error) {
      console.error('Error getting settings:', error);
      return null;
    }
  }
};
