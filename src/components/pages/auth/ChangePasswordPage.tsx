'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Loader2, ShieldCheck, TrendingUp } from 'lucide-react';
import { useAppStore, type UserData } from '@/lib/store';

export default function ChangePasswordPage() {
  const navigate = useAppStore((s) => s.navigate);
  const login = useAppStore((s) => s.login);
  const user = useAppStore((s) => s.user);
  const token = useAppStore((s) => s.token);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required.');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.message || 'Failed to change password.');
        setLoading(false);
        return;
      }

      // Merge returned user data with existing store user data
      const updatedUser: UserData = {
        ...(user as UserData),
        ...data.user,
        mustChangePass: false,
      };

      login(updatedUser, data.token);
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    const role = user?.role;
    if (role === 'super_admin' || role === 'sub_agent') {
      navigate('admin-dashboard');
    } else {
      navigate('dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0e17] relative overflow-hidden">
      {/* Background gradient blur circles */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-cyan-500/15 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md mx-4 z-10"
      >
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center mb-6"
          >
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 mb-4">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">
              Nex<span className="text-blue-500">Trade</span>{' '}
              <span className="text-blue-400">Pro</span>
            </h1>
          </motion.div>

          {/* Shield Icon + Message */}
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-center mb-6"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 mb-3">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
            </div>
            <p className="text-gray-300 text-sm">
              Welcome,{' '}
              <span className="text-white font-semibold">
                {user?.username || 'User'}
              </span>
            </p>
            <p className="text-amber-400/80 text-xs mt-1">
              For your security, please change your default password
            </p>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20"
            >
              <p className="text-red-400 text-sm text-center">{error}</p>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current Password */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35, duration: 0.4 }}
            >
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type={showCurrent ? 'text' : 'password'}
                  placeholder="Current Password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full h-11 pl-10 pr-12 rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showCurrent ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </motion.div>

            {/* New Password */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type={showNew ? 'text' : 'password'}
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full h-11 pl-10 pr-12 rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showNew ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </motion.div>

            {/* Confirm New Password */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45, duration: 0.4 }}
            >
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full h-11 pl-10 pr-12 rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showConfirm ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="pt-2"
            >
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold hover:from-blue-500 hover:to-cyan-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  'Update Password'
                )}
              </button>
            </motion.div>
          </form>

          {/* Skip Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="mt-6 text-center"
          >
            <button
              onClick={handleSkip}
              className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
            >
              Skip for now
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}