import React, { useState } from 'react';
import Modal from '../common/Modal';
import { usersApi } from '../../api/usersApi';
import { User, Mail, ArrowRight, Loader2 } from 'lucide-react';

export default function CreateUserModal({ isOpen, onClose, onUserCreated, showToast }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Full name is required';
    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const newUser = await usersApi.createUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
      });
      showToast({
        type: 'success',
        title: 'User Registered Successfully',
        message: `${newUser.name} has been added to Payflow.`,
      });
      setName('');
      setEmail('');
      setErrors({});
      onUserCreated(newUser);
      onClose();
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Failed to Create User',
        message: err.message || 'Something went wrong while registering user',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New User"
      subtitle="Register a new customer identity in the Payflow banking ledger"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Full Name <span className="text-emerald-400">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Vikram Malhotra"
              className={`w-full pl-9 pr-3 py-2.5 bg-slate-900/90 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                errors.name
                  ? 'border-rose-500/60 focus:ring-rose-500/30'
                  : 'border-slate-700 focus:border-emerald-500 focus:ring-emerald-500/20'
              }`}
            />
          </div>
          {errors.name && <p className="text-xs text-rose-400 mt-1">{errors.name}</p>}
        </div>

        {/* Email Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Email Address <span className="text-emerald-400">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. vikram@example.com"
              className={`w-full pl-9 pr-3 py-2.5 bg-slate-900/90 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                errors.email
                  ? 'border-rose-500/60 focus:ring-rose-500/30'
                  : 'border-slate-700 focus:border-emerald-500 focus:ring-emerald-500/20'
              }`}
            />
          </div>
          {errors.email && <p className="text-xs text-rose-400 mt-1">{errors.email}</p>}
        </div>

        {/* API Endpoint Information Note */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <span className="font-mono text-[11px] text-emerald-400 font-medium">POST /api/users</span>
          <span className="text-[11px] text-slate-500">UUID auto-generated</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating User...</span>
              </>
            ) : (
              <>
                <span>Register User</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
