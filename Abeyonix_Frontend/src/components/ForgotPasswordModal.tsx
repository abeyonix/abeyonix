import { X, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';

import {
  sendForgotPasswordOtp,
  verifyForgotPasswordOtp,
  resetPassword,
} from '@/api/auth';

interface Props {
  open: boolean;
  onClose: () => void;
  onBackToLogin: () => void;
}

type Step = 'email' | 'otp' | 'reset';

const ForgotPasswordModal = ({ open, onClose, onBackToLogin }: Props) => {
  const [step, setStep] = useState<Step>('email');

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  // STEP 1: SEND OTP
  const handleSendOtp = async () => {
    setLoading(true);
    setError('');
    try {
      await sendForgotPasswordOtp(email);
      toast.success('OTP sent to your email');
      setStep('otp');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: VERIFY OTP
  const handleVerifyOtp = async () => {
    setLoading(true);
    setError('');
    try {
      await verifyForgotPasswordOtp({ email, otp });
      toast.success('OTP verified');
      setStep('reset');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: RESET PASSWORD
  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await resetPassword({
        email,
        new_password: newPassword,
      });
      toast.success('Password reset successfully');
      onClose();
      onBackToLogin();
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-md bg-white rounded-xl shadow-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Forgot Password</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

        {/* STEP 1 */}
        {step === 'email' && (
          <>
            <label className="text-sm text-gray-600">Email</label>
            <input
              type="email"
              className="w-full mt-1 px-3 py-2 border rounded-md"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full mt-4 bg-primary text-white py-2 rounded-md"
            >
              {loading ? 'Sending OTP...' : 'Verify Email'}
            </button>
          </>
        )}

        {/* STEP 2 */}
        {step === 'otp' && (
          <>
            <label className="text-sm text-gray-600">Enter OTP</label>
            <input
              type="text"
              className="w-full mt-1 px-3 py-2 border rounded-md"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              className="w-full mt-4 bg-primary text-white py-2 rounded-md"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </>
        )}

        {/* STEP 3 */}
        {step === 'reset' && (
          <>
            <label className="text-sm text-gray-600">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full mt-1 px-3 py-2 border rounded-md pr-10"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <label className="text-sm text-gray-600 mt-3 block">
              Confirm Password
            </label>
            <input
              type="password"
              className="w-full mt-1 px-3 py-2 border rounded-md"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <button
              onClick={handleResetPassword}
              disabled={loading}
              className="w-full mt-4 bg-primary text-white py-2 rounded-md"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </>
        )}

        {/* Footer */}
        <p className="text-sm text-center text-gray-500 mt-4">
          Remember your password?{' '}
          <button
            onClick={onBackToLogin}
            className="text-primary hover:underline"
          >
            Back to login
          </button>
        </p>
      </div>
    </div>,
    document.body
  );
};

export default ForgotPasswordModal;
