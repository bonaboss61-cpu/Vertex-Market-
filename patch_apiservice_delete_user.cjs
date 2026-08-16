const fs = require('fs');
let code = fs.readFileSync('src/services/apiService.ts', 'utf8');

const deleteMethod = `
  async deleteUser(email: string): Promise<{ success: boolean }> {
    try {
      const res = await apiFetch('/api/admin/users/' + encodeURIComponent(email), {
        method: 'DELETE'
      });
      return await res.json();
    } catch (e) {
      console.error(e);
      return { success: false };
    }
  },
`;

code = code.replace(
  "async getAdminData()",
  deleteMethod + "\n  async getAdminData()"
);

fs.writeFileSync('src/services/apiService.ts', code);
