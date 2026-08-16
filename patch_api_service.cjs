const fs = require('fs');
let code = fs.readFileSync('src/services/apiService.ts', 'utf8');

const newMethod = `
  async autoVerifyKyc(payload: { email: string; idImage: string; idImageBack?: string; selfieImage: string }): Promise<{ success: boolean; status?: string; message?: string; error?: string }> {
    try {
      const res = await apiFetch('/api/kyc/auto-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (error: any) {
      console.error('Error auto-verifying KYC:', error);
      return { success: false, error: error.message };
    }
  },
  
  async syncUser(email: string, userData: Partial<UserAccount>): Promise<{ success: boolean; account?: UserAccount; settings?: SystemSettings }> {
`;

code = code.replace(/async syncUser\(email: string, userData: Partial<UserAccount>\): Promise<\{ success: boolean; account\?: UserAccount; settings\?: SystemSettings \}> \{/, newMethod);
fs.writeFileSync('src/services/apiService.ts', code);
