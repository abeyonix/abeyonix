import { X, Eye, EyeOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from "sonner";
import { login } from '@/api/auth';
import { useAuth } from '@/context/AuthContext';

interface Props {
  open: boolean;
  onClose: () => void;
  onSignUp: () => void;
  onForgotPassword: () => void;
}

const LoginModal = ({ open, onClose, onSignUp, onForgotPassword, }: Props) => {
    const { loginUser } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (open) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [open, onClose]);

    if (!open) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await login({ email, password });

            loginUser({
                token: res.access_token,
                user: {
                    user_id: res.user_id,
                    user_identity_id: res.user_identity_id,
                    user_name: res.user_name,
                    full_name: res.full_name,
                    email: res.email,
                    role: res.role,
                },
            });
            toast.success(`Welcome back, ${res.user_name}`);
            console.log('Login success:', res);

            onClose();
        } catch (err: any) {
            setError(err?.response?.data?.detail || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            {/* Overlay (click outside closes modal) */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className="relative z-10 w-full max-w-md bg-white rounded-xl shadow-xl p-6"
                onClick={(e) => e.stopPropagation()} // prevent close when clicking inside
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Login</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form className="space-y-4" onSubmit={handleSubmit}>
                    {error && (
                        <p className="text-sm text-red-500">{error}</p>
                    )}

                    <div>
                        <label className="text-sm text-gray-600">Email</label>
                        <input
                            type="email"
                            placeholder="Email"
                            className="w-full px-3 py-2 border rounded-md"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required />
                    </div>
                    <div>
                        <label className="text-sm text-gray-600">Password</label>

                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Password"
                                className="w-full px-3 py-2 border rounded-md pr-10"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                tabIndex={-1}
                            >
                                {showPassword ? (
                                    <EyeOff size={18} />
                                ) : (
                                    <Eye size={18} />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center gap-2">
                            <input type="checkbox" />
                            Remember me
                        </label>
                        <button
  type="button"
  onClick={onForgotPassword}
  className="text-primary hover:underline"
>
  Forgot password?
</button>

                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white py-2 rounded-md"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>


                {/* Footer */}
                <p className="text-sm text-center text-gray-500 mt-4">
                    Don’t have an account?{' '}
                    <button
                        type="button"
                        onClick={onSignUp}
                        className="text-primary hover:underline"
                    >
                        Sign up
                    </button>
                </p>
            </div>
        </div>,
        document.body
    );
};

export default LoginModal;
