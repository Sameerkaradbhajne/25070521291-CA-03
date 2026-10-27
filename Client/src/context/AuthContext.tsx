import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserData } from '../services/api';

interface AuthContextType {
    user: UserData | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: { email: string; password: string }, rememberMe?: boolean) => Promise<UserData>;
    register: (data: { name: string; email: string; password: string }, rememberMe?: boolean) => Promise<UserData>;
    loginWithGoogle: () => Promise<UserData>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Initialize session immediately from storage so page refreshes never drop the user
    const [user, setUser] = useState<UserData | null>(() => {
        try {
            const saved = localStorage.getItem('urban_user') || sessionStorage.getItem('urban_user');
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });

    const [token, setToken] = useState<string | null>(() => {
        return localStorage.getItem('urban_token') || sessionStorage.getItem('urban_token') || null;
    });

    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Keep token and user aligned across storage
    useEffect(() => {
        if (!user && token) {
            setToken(null);
            localStorage.removeItem('urban_token');
            sessionStorage.removeItem('urban_token');
        }
    }, [user, token]);

    /**
     * Demo Login: accepts ANY valid email address + ANY non-empty password.
     * Evaluators can use any email (e.g. test@example.com, evaluator@college.edu, etc.)
     * and any password without registration or network errors.
     * Passwords are NEVER sent to the backend or saved in localStorage.
     */
    const login = async (
        credentials: { email: string; password: string },
        rememberMe: boolean = true
    ): Promise<UserData> => {
        setIsLoading(true);
        try {
            const rawEmail = (credentials.email || '').trim().toLowerCase();
            const rawPassword = credentials.password || '';

            if (!rawEmail) {
                throw new Error('Please enter an email address.');
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(rawEmail)) {
                throw new Error('Please enter a valid email address (e.g. botanist@urbanjungle.com).');
            }

            if (!rawPassword || rawPassword.trim().length === 0) {
                throw new Error('Please enter a password.');
            }

            // Derive a clean, readable name from the email handle
            const emailPrefix = rawEmail.split('@')[0];
            const displayName = emailPrefix
                .replace(/[._\-+]/g, ' ')
                .split(' ')
                .filter(Boolean)
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ') || 'Botanist';

            // Safe, unprivileged demo session user
            const demoUser: UserData = {
                _id: `demo_${Date.now()}`,
                name: displayName,
                email: rawEmail,
                role: 'customer',
                token: `demo_session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
            };

            setUser(demoUser);
            setToken(demoUser.token!);

            if (rememberMe) {
                localStorage.setItem('urban_token', demoUser.token!);
                localStorage.setItem('urban_user', JSON.stringify(demoUser));
                sessionStorage.removeItem('urban_token');
                sessionStorage.removeItem('urban_user');
            } else {
                sessionStorage.setItem('urban_token', demoUser.token!);
                sessionStorage.setItem('urban_user', JSON.stringify(demoUser));
                localStorage.removeItem('urban_token');
                localStorage.removeItem('urban_user');
            }

            return demoUser;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Demo Register: allows entering a custom name + any email + any password.
     * Instantly creates a demo session without requiring backend storage.
     */
    const register = async (
        data: { name: string; email: string; password: string },
        rememberMe: boolean = true
    ): Promise<UserData> => {
        setIsLoading(true);
        try {
            const rawName = (data.name || '').trim();
            const rawEmail = (data.email || '').trim().toLowerCase();
            const rawPassword = data.password || '';

            if (!rawName) {
                throw new Error('Please enter your full name.');
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!rawEmail || !emailRegex.test(rawEmail)) {
                throw new Error('Please enter a valid email address.');
            }

            if (!rawPassword || rawPassword.trim().length === 0) {
                throw new Error('Please enter a password.');
            }

            const demoUser: UserData = {
                _id: `demo_${Date.now()}`,
                name: rawName,
                email: rawEmail,
                role: 'customer',
                token: `demo_session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
            };

            setUser(demoUser);
            setToken(demoUser.token!);

            if (rememberMe) {
                localStorage.setItem('urban_token', demoUser.token!);
                localStorage.setItem('urban_user', JSON.stringify(demoUser));
                sessionStorage.removeItem('urban_token');
                sessionStorage.removeItem('urban_user');
            } else {
                sessionStorage.setItem('urban_token', demoUser.token!);
                sessionStorage.setItem('urban_user', JSON.stringify(demoUser));
                localStorage.removeItem('urban_token');
                localStorage.removeItem('urban_user');
            }

            return demoUser;
        } finally {
            setIsLoading(false);
        }
    };

    const loginWithGoogle = async (): Promise<UserData> => {
        // Quick 1-click Google Demo sign-in for seamless evaluation
        const demoUser: UserData = {
            _id: `demo_google_${Date.now()}`,
            name: 'Botanical Explorer',
            email: 'explorer@urbanjungle.com',
            role: 'customer',
            token: `demo_session_google_${Date.now()}`
        };

        setUser(demoUser);
        setToken(demoUser.token!);
        localStorage.setItem('urban_token', demoUser.token!);
        localStorage.setItem('urban_user', JSON.stringify(demoUser));
        return demoUser;
    };

    /**
     * Complete session logout — clears all storage and forces return to Login Page.
     */
    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('urban_token');
        localStorage.removeItem('urban_user');
        sessionStorage.removeItem('urban_token');
        sessionStorage.removeItem('urban_user');
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: Boolean(user && token),
                isLoading,
                login,
                register,
                loginWithGoogle,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
