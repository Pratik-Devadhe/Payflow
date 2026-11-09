import { apiClient } from './client';

export const usersApi = {
  // GET /api/users
  getAllUsers: async () => {
    return await apiClient.get('/users');
  },

  // GET /api/users/{id}
  getUserById: async (id) => {
    return await apiClient.get(`/users/${id}`);
  },

  // POST /api/users
  createUser: async ({ name, email }) => {
    return await apiClient.post('/users', { name, email });
  },
};
