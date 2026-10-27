import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserData } from '../services/api';
import { loginUserApi, registerUserApi } from '../services/api';

interface AuthContextType {
    user: UserData | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: { email: string; password: string }, rememberMe?: boolean) => Promise<UserData>;
    register: (data: { name: string; email: string; password: string }) => Promise<{ message: string }>;
    loginWithGoogle: () => Promise<UserData>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Restore session from storage on mount (for session persistence across refreshes)
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

    // Keep storage and state in sync — if user is cleared, clear token too
    useEffect(() => {
        if (!user && token) {
            setToken(null);
            localStorage.removeItem('urban_token');
            sessionStorage.removeItem('urban_token');
        }
    }, [user, token]);

    /**
     * Real login — calls the backend, validates credentials against MongoDB.
     * Only succeeds when the email exists in the database AND the password matches the hash.
     */
    const login = async (
        credentials: { email: string; password: string },
        rememberMe: boolean = true
    ): Promise<UserData> => {
        setIsLoading(true);
        try {
            // Client-side pre-validation (mirrors server checks for fast UX)
            const rawEmail = (credentials.email || '').trim().toLowerCase();
            const rawPassword = credentials.password || '';

            if (!rawEmail) {
                throw new Error('Please enter your email address.');
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(rawEmail)) {
                throw new Error('Please enter a valid email address.');
            }
            if (!rawPassword) {
                throw new Error('Please enter your password.');
            }

            // Call the real backend API
            const response = await loginUserApi({ email: rawEmail, password: rawPassword });

            if (!response.success || !response.data) {
                throw new Error(response.message || 'Login failed. Please check your credentials.');
            }

            const userData: UserData = response.data;
            const authToken: string = userData.token || '';

            setUser(userData);
            setToken(authToken);

            // Persist session based on rememberMe preference
            if (rememberMe) {
                localStorage.setItem('urban_token', authToken);
                localStorage.setItem('urban_user', JSON.stringify(userData));
                sessionStorage.removeItem('urban_token');
                sessionStorage.removeItem('urban_user');
            } else {
                sessionStorage.setItem('urban_token', authToken);
                sessionStorage.setItem('urban_user', JSON.stringify(userData));
                localStorage.removeItem('urban_token');
                localStorage.removeItem('urban_user');
            }

            return userData;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Real registration — calls the backend which validates, hashes the password, and saves to MongoDB.
     * On success, returns a success message and the caller should redirect to the login page.
     * Does NOT create a session automatically (user must log in after registering).
     */
    const register = async (
        data: { name: string; email: string; password: string }
    ): Promise<{ message: string }> => {
        setIsLoading(true);
        try {
            // Client-side pre-validation
            const trimmedName = (data.name || '').trim();
            const rawEmail = (data.email || '').trim().toLowerCase();
            const rawPassword = data.password || '';

            if (!trimmedName) {
                throw new Error('Please enter your full name.');
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!rawEmail || !emailRegex.test(rawEmail)) {
                throw new Error('Please enter a valid email address.');
            }
            if (rawPassword.length < 8) {
                throw new Error('Password must be at least 8 characters long.');
            }

            // Call the real backend API
            const response = await registerUserApi({
                name: trimmedName,
                email: rawEmail,
                password: rawPassword
            });

            if (!response.success) {
                throw new Error(response.message || 'Registration failed. Please try again.');
            }

            return { message: response.message || 'Account created successfully. Please sign in.' };
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Google Sign-In — not yet configured.
     * Reports clearly that OAuth setup is required rather than silently bypassing authentication.
     */
    const loginWithGoogle = async (): Promise<UserData> => {
        throw new Error(
            'Google Sign-In is not yet configured. ' +
            'To enable it, set up a Google OAuth 2.0 project, configure the Client ID and Secret, ' +
            'and implement the OAuth callback flow in the backend.'
        );
    };

    /**
     * Logout — clears all stored tokens and user data, forcing a return to the login page.
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
