import { apiClient } from './client';

export const accountsApi = {
  // GET /api/accounts
  getAllAccounts: async () => {
    return await apiClient.get('/accounts');
  },

  // GET /api/accounts/{accountNumber}
  getByAccountNumber: async (accountNumber) => {
    return await apiClient.get(`/accounts/${encodeURIComponent(accountNumber)}`);
  },

  // POST /api/accounts
  createAccount: async ({ userId, accountNumber, balance }) => {
    return await apiClient.post('/accounts', {
      userId,
      accountNumber,
      balance: parseFloat(balance),
    });
  },
};
