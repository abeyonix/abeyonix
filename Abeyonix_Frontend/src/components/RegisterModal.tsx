// src/components/RegisterModal.tsx
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';

import { register, verifyRegistrationOtp } from '@/api/auth';

interface Props {
  open: boolean;
  onClose: () => void;
  onBackToLogin: () => void;
}

const OTP_DURATION = 10 * 60; // 10 minutes (seconds)

const RegisterModal = ({ open, onClose, onBackToLogin }: Props) => {
  const [step, setStep] = useState<'register' | 'otp'>('register');

  const [form, setForm] = useState({
    user_name: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
  });

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(OTP_DURATION);

  // ESC close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  // OTP countdown
  useEffect(() => {
    if (step !== 'otp') return;

    setSecondsLeft(OTP_DURATION);
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [step]);

  if (!open) return null;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await register({
        user_name: form.user_name,
        email: form.email,
        password: form.password,
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone || undefined,
      });

      toast.success('OTP sent to your email');
      setStep('otp');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await verifyRegistrationOtp({
        email: form.email,
        otp,
      });

      toast.success('Account verified successfully 🎉');
      onClose();
      onBackToLogin();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className="relative z-10 w-full max-w-md bg-white rounded-xl shadow-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {step === 'register' ? 'Create Account' : 'Verify OTP'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* REGISTER FORM */}
        {step === 'register' && (
          <form className="space-y-3" onSubmit={handleRegister}>
            <input
              className="w-full border px-3 py-2 rounded"
              placeholder="Username"
              value={form.user_name}
              onChange={(e) => setForm({ ...form, user_name: e.target.value })}
              required
            />
            <input
              className="w-full border px-3 py-2 rounded"
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <input
              className="w-full border px-3 py-2 rounded"
              placeholder="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                className="border px-3 py-2 rounded"
                placeholder="First name"
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                required
              />
              <input
                className="border px-3 py-2 rounded"
                placeholder="Last name"
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                required
              />
            </div>
            <input
              className="w-full border px-3 py-2 rounded"
              placeholder="Phone (optional)"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />

            <button
              disabled={loading}
              className="w-full bg-primary text-white py-2 rounded"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
        )}

        {/* OTP VERIFICATION */}
        {step === 'otp' && (
          <form className="space-y-4" onSubmit={handleVerifyOtp}>
            <p className="text-sm text-gray-600">
              Enter OTP sent to <strong>{form.email}</strong>
            </p>

            <input
              className="w-full border px-3 py-2 rounded text-center tracking-widest text-lg"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />

            {secondsLeft > 0 ? (
              <p className="text-sm text-gray-500 text-center">
                OTP expires in {minutes}:{seconds.toString().padStart(2, '0')}
              </p>
            ) : (
              <button
                type="button"
                onClick={() => setStep('register')}
                className="text-primary text-sm underline w-full"
              >
                Resend OTP
              </button>
            )}

            <button
              disabled={loading}
              className="w-full bg-primary text-white py-2 rounded"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>
        )}

        {/* Footer */}
        <p className="text-sm text-center text-gray-500 mt-4">
          Already have an account?{' '}
          <button
            onClick={onBackToLogin}
            className="text-primary hover:underline"
          >
            Login
          </button>
        </p>
      </div>
    </div>,
    document.body
  );
};

export default RegisterModal;
