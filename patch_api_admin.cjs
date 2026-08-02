const fs = require('fs');
let code = fs.readFileSync('src/services/apiService.ts', 'utf8');

code = code.replace(/export const apiService = \{/g, `export const apiService = {
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
`);

fs.writeFileSync('src/services/apiService.ts', code);
