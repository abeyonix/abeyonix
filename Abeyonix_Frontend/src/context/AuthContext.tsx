import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
    user_id: number;
    user_identity_id: string;
    user_name: string;
    full_name: string;
    email: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loginUser: (data: { user: User; token: string }) => void;
    logout: () => void;
    updateUserContext: (payload: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem('auth');
        if (stored) {
            const parsed = JSON.parse(stored);
            setUser(parsed.user);
            setToken(parsed.token);
        }
    }, []);

    const loginUser = ({ user, token }: { user: User; token: string }) => {
        setUser(user);
        setToken(token);
        localStorage.setItem(
            'auth',
            JSON.stringify({ user, token })
        );
    };


    const updateUserContext = (payload: Partial<User>) => {
        setUser(prev => {
            if (!prev) return prev;

            const updatedUser = {
                ...prev,
                ...payload,
            };

            const stored = localStorage.getItem('auth');
            if (stored) {
                const parsed = JSON.parse(stored);
                localStorage.setItem(
                    'auth',
                    JSON.stringify({
                        ...parsed,
                        user: updatedUser,
                    })
                );
            }

            return updatedUser;
        });
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('auth');
        navigate('/', { replace: true });
    };

    return (
        <AuthContext.Provider
            value={{ user, token, loginUser, logout, updateUserContext }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
};
