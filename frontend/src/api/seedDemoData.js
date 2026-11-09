import { usersApi } from './usersApi';
import { accountsApi } from './accountsApi';
import { paymentsApi } from './paymentsApi';

export async function seedDemoData(onProgress) {
  const steps = [];

  const log = (msg) => {
    steps.push(msg);
    if (onProgress) onProgress(msg);
  };

  log('Creating sample fintech users...');
  const user1 = await usersApi.createUser({
    name: 'Aarav Sharma',
    email: `aarav.${Date.now().toString().slice(-4)}@payflow.in`,
  });

  const user2 = await usersApi.createUser({
    name: 'Priya Patel',
    email: `priya.${Date.now().toString().slice(-4)}@payflow.in`,
  });

  const user3 = await usersApi.createUser({
    name: 'Rohan Mehta',
    email: `rohan.${Date.now().toString().slice(-4)}@payflow.in`,
  });

  log('Opening verified accounts with initial deposit balances...');
  const acc1 = await accountsApi.createAccount({
    userId: user1.id,
    accountNumber: `ACC-INR-${Math.floor(1000 + Math.random() * 9000)}`,
    balance: 75000.0,
  });

  const acc2 = await accountsApi.createAccount({
    userId: user2.id,
    accountNumber: `ACC-INR-${Math.floor(1000 + Math.random() * 9000)}`,
    balance: 50000.0,
  });

  const acc3 = await accountsApi.createAccount({
    userId: user3.id,
    accountNumber: `ACC-INR-${Math.floor(1000 + Math.random() * 9000)}`,
    balance: 32500.0,
  });

  log('Executing initial test payment transfer with idempotency key...');
  const idempotencyKey = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

  const payment1 = await paymentsApi.createPayment({
    senderId: user1.id,
    receiverId: user2.id,
    amount: 12500.0,
    currency: 'INR',
    idempotency_key: idempotencyKey,
  });

  log('Demo seed completed successfully!');
  return {
    users: [user1, user2, user3],
    accounts: [acc1, acc2, acc3],
    payments: [payment1],
  };
}
