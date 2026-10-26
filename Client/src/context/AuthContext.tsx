import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUserApi, registerUserApi, getCurrentUserApi } from '../services/api';
import type { UserData } from '../services/api';

interface AuthContextType {
    user: UserData | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: { email: string; password: string }, rememberMe?: boolean) => Promise<UserData>;
    loginWithGoogle: () => Promise<UserData>;
    register: (data: { name: string; email: string; password: string }, rememberMe?: boolean) => Promise<UserData>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserData | null>(() => {
        const saved = localStorage.getItem('urban_user') || sessionStorage.getItem('urban_user');
        return saved ? JSON.parse(saved) : null;
    });
    const [token, setToken] = useState<string | null>(() => {
        return localStorage.getItem('urban_token') || sessionStorage.getItem('urban_token');
    });
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        // Validate or refresh token with backend if exists
        if (token && !user) {
            getCurrentUserApi()
                .then((res) => {
                    if (res?.data) {
                        setUser(res.data);
                        localStorage.setItem('urban_user', JSON.stringify(res.data));
                    }
                })
                .catch(() => {
                    // Ignore background error to preserve session
                });
        }
    }, [token]);



    const login = async (credentials: { email: string; password: string }, rememberMe: boolean = true): Promise<UserData> => {
        setIsLoading(true);
        try {
            const res = await loginUserApi(credentials);
            if (!res.success || !res.data) {
                throw new Error(res.message || 'Invalid credentials');
            }
            const userData: UserData = res.data;
            const userToken: string = res.data.token || '';

            setUser(userData);
            setToken(userToken);

            if (rememberMe) {
                localStorage.setItem('urban_token', userToken);
                localStorage.setItem('urban_user', JSON.stringify(userData));
                sessionStorage.removeItem('urban_token');
                sessionStorage.removeItem('urban_user');
            } else {
                sessionStorage.setItem('urban_token', userToken);
                sessionStorage.setItem('urban_user', JSON.stringify(userData));
                localStorage.removeItem('urban_token');
                localStorage.removeItem('urban_user');
            }
            return userData;
        } finally {
            setIsLoading(false);
        }
    };

    const loginWithGoogle = async (): Promise<UserData> => {
        throw new Error('Google OAuth is not configured on this deployment. Please use email and password to sign in.');
    };

    const register = async (data: { name: string; email: string; password: string }, rememberMe: boolean = true): Promise<UserData> => {
        setIsLoading(true);
        try {
            const res = await registerUserApi(data);
            if (!res.success || !res.data) {
                throw new Error(res.message || 'Registration failed');
            }
            const userData: UserData = res.data;
            const userToken: string = res.data.token || '';

            setUser(userData);
            setToken(userToken);

            if (rememberMe) {
                localStorage.setItem('urban_token', userToken);
                localStorage.setItem('urban_user', JSON.stringify(userData));
            } else {
                sessionStorage.setItem('urban_token', userToken);
                sessionStorage.setItem('urban_user', JSON.stringify(userData));
            }
            return userData;
        } finally {
            setIsLoading(false);
        }
    };

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
                isAuthenticated: !!user,
                isLoading,
                login,
                loginWithGoogle,
                register,
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
