const fs = require('fs');
let code = fs.readFileSync('src/services/apiService.ts', 'utf8');

code = code.replace(/async createTransaction\([\s\S]*?\}\n  \},/m,
`async createTransaction(transactionData: Partial<Transaction>): Promise<{ success: boolean; transaction?: Transaction; balanceLive?: number }> {
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
  },`);

fs.writeFileSync('src/services/apiService.ts', code);
