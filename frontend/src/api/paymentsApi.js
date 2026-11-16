import { apiClient } from './client';

export const paymentsApi = {
  // GET /api/payments
  getAllPayments: async () => {
    return await apiClient.get('/payments');
  },

  // GET /api/payments/{id}
  getPaymentById: async (id) => {
    return await apiClient.get(`/payments/${id}`);
  },

  // POST /api/payments
  createPayment: async ({ senderId, receiverId, idempotency_key, amount, currency }) => {
    return await apiClient.post(
      '/payments',
      {
        senderId,
        receiverId,
        idempotency_key,
        amount: parseFloat(amount),
        currency: currency || 'INR',
      },
      {
        headers: idempotency_key ? { 'Idempotency-Key': idempotency_key } : {},
      }
    );
  },
};
