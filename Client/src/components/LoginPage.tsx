import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, User, ArrowLeft, CheckCircle2, AlertCircle, Leaf, Sparkles, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginPageProps {
    onNavigateHome: () => void;
    onNavigateSection?: (sectionId: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigateHome, onNavigateSection }) => {
    const { login, register, loginWithGoogle, isLoading } = useAuth();

    // Mode: 'login' or 'register'
    const [isRegisterMode, setIsRegisterMode] = useState(false);

    // Form inputs
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);

    // Feedback states
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

    // Forgot password modal
    const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotSuccess, setForgotSuccess] = useState(false);

    const validateForm = () => {
        const errors: { [key: string]: string } = {};

        if (!email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            errors.email = 'Please enter a valid email address';
        }

        if (!password) {
            errors.password = 'Password is required';
        }

        if (isRegisterMode) {
            if (!name.trim()) {
                errors.name = 'Full name is required';
            }
            if (password !== confirmPassword) {
                errors.confirmPassword = 'Passwords do not match';
            }
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        setSuccessMsg(null);

        if (!validateForm()) return;

        try {
            if (isRegisterMode) {
                const userData = await register({ name: name.trim(), email: email.trim(), password }, rememberMe);
                setSuccessMsg(`Welcome to Urban Jungle, ${userData.name}! Entering sanctuary...`);
                setTimeout(() => {
                    onNavigateHome();
                }, 600);
            } else {
                const userData = await login({ email: email.trim(), password }, rememberMe);
                setSuccessMsg(`Welcome, ${userData.name || 'Botanist'}! Entering your sanctuary...`);
                setTimeout(() => {
                    onNavigateHome();
                }, 600);
            }
        } catch (err: any) {
            const message = err.response?.data?.message || err.message || 'Authentication failed. Please check your credentials.';
            setErrorMsg(message);
        }
    };

    const handleGoogleSignIn = async () => {
        setErrorMsg(null);
        try {
            const userData = await loginWithGoogle();
            setSuccessMsg(`Signed in with Google! Welcome, ${userData.name}.`);
            setTimeout(() => {
                onNavigateHome();
            }, 600);
        } catch (err: any) {
            setErrorMsg(err.message || 'Google Sign-In is unavailable.');
        }
    };

    const handleForgotPasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!forgotEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) {
            return;
        }
        setForgotSuccess(true);
        setTimeout(() => {
            setIsForgotModalOpen(false);
            setForgotSuccess(false);
            setForgotEmail('');
        }, 2000);
    };

    const handleNavClick = (sectionId: string) => {
        if (onNavigateSection) {
            onNavigateSection(sectionId);
        } else {
            onNavigateHome();
            setTimeout(() => {
                const el = document.getElementById(sectionId);
                el?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    };

    return (
        <div className="relative min-h-screen w-full flex flex-col font-sans select-none overflow-x-hidden bg-[#F7F5F0]">
            {/* Top Navigation Header matching reference image */}
            <header className="relative z-30 w-full px-6 md:px-12 py-4 flex items-center justify-between bg-[#F7F5F0] border-b border-[#E8E4DA]">
                {/* Brand Logo with Monstera Leaf */}
                <button
                    onClick={onNavigateHome}
                    className="flex items-center gap-3 group focus:outline-none cursor-pointer"
                    title="Urban Jungle Home"
                >
                    {/* Monstera leaf SVG */}
                    <div className="text-[#163A26] transition-transform duration-300 group-hover:scale-105">
                        <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12c0 2.22.73 4.27 1.96 5.93.38-.63.92-1.18 1.6-1.58C5.2 15.42 5 14.24 5 13c0-3.87 3.13-7 7-7s7 3.13 7 7c0 1.24-.2 2.42-.56 3.35.68.4 1.22.95 1.6 1.58C21.27 16.27 22 14.22 22 12c0-5.52-4.48-10-10-10zm-1 9c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-4 4c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm10 0c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z" opacity="0.3" />
                            <path d="M17.5 7.5C16.2 6.2 14.2 5 12 5S7.8 6.2 6.5 7.5C5.2 8.8 4.5 10.5 4.5 12.5c0 3.9 3.1 7 7.5 9.5 4.4-2.5 7.5-5.6 7.5-9.5 0-2-.7-3.7-2-5zm-5.5 12c-2.8-1.7-5-3.8-5-7 0-1.4.5-2.6 1.4-3.5.9-.9 2.1-1.5 3.6-1.5s2.7.6 3.6 1.5c.9.9 1.4 2.1 1.4 3.5 0 3.2-2.2 5.3-5 7z"/>
                            <circle cx="12" cy="12" r="1.5" />
                            <path d="M12 10.5v3M10.5 12h3" stroke="#F7F5F0" strokeWidth="0.8" />
                        </svg>
                    </div>
                    <span className="font-serif text-xl sm:text-2xl font-bold tracking-[0.18em] text-[#163A26] uppercase">
                        URBAN JUNGLE
                    </span>
                </button>

                {/* Center Navigation Links with vertical divider bars */}
                <nav className="hidden md:flex items-center gap-6 font-sans text-xs font-semibold tracking-[0.2em] text-[#2C3E2D]">
                    <button
                        onClick={() => handleNavClick('shop')}
                        className="hover:text-[#163A26] transition-colors uppercase cursor-pointer"
                    >
                        SHOP
                    </button>
                    <span className="text-[#C4BCAB] font-light">|</span>
                    <button
                        onClick={() => handleNavClick('services')}
                        className="hover:text-[#163A26] transition-colors uppercase cursor-pointer"
                    >
                        SERVICES
                    </button>
                    <span className="text-[#C4BCAB] font-light">|</span>
                    <button
                        onClick={() => handleNavClick('workshops')}
                        className="hover:text-[#163A26] transition-colors uppercase cursor-pointer"
                    >
                        WORKSHOPS
                    </button>
                </nav>

                {/* Right Action: Rounded Dark-Green "← Back to Store" Button */}
                <button
                    onClick={onNavigateHome}
                    className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-[#163A26] hover:bg-[#0f2e1e] active:scale-[0.98] text-white text-xs sm:text-sm font-medium tracking-wide transition-all duration-200 shadow-sm cursor-pointer"
                >
                    <ArrowLeft size={16} />
                    <span>Back to Store</span>
                </button>
            </header>

            {/* Main Stage with Botanical Background */}
            <div className="relative flex-1 w-full min-h-[calc(100vh-73px)] flex items-center justify-center">
                {/* Botanical Background Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center transition-all duration-700 pointer-events-none"
                    style={{
                        backgroundImage: "url('/images/login-bg.jpg')",
                    }}
                />

                {/* Moody Dark Forest Vignette on Left Side for Editorial Branding Readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#0C1F14]/90 via-[#0C1F14]/65 via-50% to-transparent pointer-events-none" />

                {/* Subtle soft lighting over full image */}
                <div className="absolute inset-0 bg-black/15 pointer-events-none" />

                {/* Content Container (Two Columns: Left Branding, Right Login Card) */}
                <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 py-8 md:py-14 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                    
                    {/* LEFT COLUMN: Editorial Branding Section */}
                    <div className="lg:col-span-7 flex flex-col justify-center text-white pr-0 lg:pr-8 py-4">
                        {/* Eyebrow Label with delicate horizontal line */}
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-[1.5px] bg-white/70" />
                            <span className="text-[11px] sm:text-xs font-semibold tracking-[0.25em] text-white/90 uppercase font-sans">
                                YOUR GREEN JOURNEY STARTS HERE
                            </span>
                        </div>

                        {/* Grand Editorial Headline with sage italic "Nature" */}
                        <h1 className="font-serif text-4xl sm:text-6xl lg:text-[70px] font-bold text-white leading-[1.08] tracking-tight">
                            Bring <span className="italic font-normal text-[#9FC4A6]">Nature</span>
                            <br />
                            Closer to Home.
                        </h1>

                        {/* Supporting Paragraph */}
                        <p className="mt-6 text-sm sm:text-base lg:text-lg text-white/85 font-sans font-light leading-relaxed max-w-xl">
                            Discover beautiful plants, create peaceful spaces, and let a little greenery transform your everyday life.
                        </p>

                        {/* Three Feature Highlights Row */}
                        <div className="mt-10 pt-8 border-t border-white/15 grid grid-cols-3 gap-2 sm:gap-6 max-w-xl">
                            {/* Feature 1 */}
                            <div className="flex flex-col items-start gap-2 pr-2 sm:pr-4 border-r border-white/20">
                                <div className="text-[#E5D7C3] mb-1">
                                    <Leaf size={22} strokeWidth={1.5} />
                                </div>
                                <span className="font-sans text-xs sm:text-sm font-medium text-white/95 leading-tight">
                                    Handpicked
                                    <br />
                                    Greenery
                                </span>
                            </div>

                            {/* Feature 2 */}
                            <div className="flex flex-col items-start gap-2 px-2 sm:px-4 border-r border-white/20">
                                <div className="text-[#E5D7C3] mb-1">
                                    <Sparkles size={22} strokeWidth={1.5} />
                                </div>
                                <span className="font-sans text-xs sm:text-sm font-medium text-white/95 leading-tight">
                                    Thoughtfully
                                    <br />
                                    Curated
                                </span>
                            </div>

                            {/* Feature 3 */}
                            <div className="flex flex-col items-start gap-2 pl-2 sm:pl-4">
                                <div className="text-[#E5D7C3] mb-1">
                                    <Home size={22} strokeWidth={1.5} />
                                </div>
                                <span className="font-sans text-xs sm:text-sm font-medium text-white/95 leading-tight">
                                    Made for
                                    <br />
                                    Your Space
                                </span>
                            </div>
                        </div>

                        {/* Bottom Tagline with delicate line */}
                        <div className="mt-12 flex items-center gap-3">
                            <span className="w-8 h-[1px] bg-white/40" />
                            <span className="text-[10px] sm:text-[11px] font-semibold tracking-[0.25em] text-white/70 uppercase font-sans">
                                GROW BEAUTIFULLY. LIVE NATURALLY.
                            </span>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Warm Cream Login Card */}
                    <div className="lg:col-span-5 flex justify-center lg:justify-end">
                        <div className="w-full max-w-[460px] bg-[#FAF8F3] rounded-[28px] p-7 sm:p-10 shadow-2xl border border-white/60 transition-all duration-300">
                            
                            {/* Pill Badge: URBAN SANCTUARY ACCESS */}
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#DCE7DE] text-[#163A26] text-[10px] sm:text-[11px] font-bold tracking-[0.15em] uppercase mb-5">
                                <Leaf size={13} className="text-[#163A26] shrink-0" />
                                <span>URBAN SANCTUARY ACCESS</span>
                            </div>

                            {/* Heading */}
                            <h2 className="font-serif text-2xl sm:text-3xl lg:text-[34px] font-bold text-[#163A26] leading-[1.15] mb-2">
                                {isRegisterMode ? (
                                    <>
                                        Join Our Living
                                        <br />
                                        Sanctuary
                                    </>
                                ) : (
                                    <>
                                        Welcome Back to
                                        <br />
                                        Your Jungle
                                    </>
                                )}
                            </h2>

                            {/* Alert Notifications */}
                            {errorMsg && (
                                <div className="my-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                                    <AlertCircle size={16} className="shrink-0 text-red-500 mt-0.5" />
                                    <div className="flex-1">{errorMsg}</div>
                                </div>
                            )}

                            {successMsg && (
                                <div className="my-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
                                    <CheckCircle2 size={16} className="shrink-0 text-emerald-600 mt-0.5" />
                                    <div className="flex-1 font-medium">{successMsg}</div>
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                                {/* Name Input (Register Mode Only) */}
                                {isRegisterMode && (
                                    <div>
                                        <label className="block text-xs font-semibold text-[#2C3E2D] mb-1.5">
                                            Full Name
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Enter your name"
                                                value={name}
                                                onChange={(e) => {
                                                    setName(e.target.value);
                                                    if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: '' });
                                                }}
                                                className={`w-full pl-10 pr-4 py-3 rounded-xl bg-white border text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all duration-200 ${
                                                    fieldErrors.name
                                                        ? 'border-red-400 ring-2 ring-red-100'
                                                        : 'border-gray-200/90 focus:border-[#163A26] focus:ring-2 focus:ring-emerald-900/10'
                                                }`}
                                            />
                                            <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                        </div>
                                        {fieldErrors.name && (
                                            <p className="mt-1 text-xs text-red-600 font-medium">{fieldErrors.name}</p>
                                        )}
                                    </div>
                                )}

                                {/* Email Address Input */}
                                <div>
                                    <label className="block text-xs font-semibold text-[#2C3E2D] mb-1.5">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            id="login-email-input"
                                            placeholder="Enter your email"
                                            value={email}
                                            onChange={(e) => {
                                                setEmail(e.target.value);
                                                if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
                                            }}
                                            className={`w-full pl-10 pr-4 py-3 rounded-xl bg-white border text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all duration-200 ${
                                                fieldErrors.email
                                                    ? 'border-red-400 ring-2 ring-red-100'
                                                    : 'border-gray-200/90 focus:border-[#163A26] focus:ring-2 focus:ring-emerald-900/10'
                                            }`}
                                        />
                                        <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                    </div>
                                    {fieldErrors.email && (
                                        <p className="mt-1 text-xs text-red-600 font-medium">{fieldErrors.email}</p>
                                    )}
                                </div>

                                {/* Password Input */}
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="block text-xs font-semibold text-[#2C3E2D]">
                                            Password
                                        </label>
                                        {!isRegisterMode && (
                                            <button
                                                type="button"
                                                onClick={() => setIsForgotModalOpen(true)}
                                                className="text-xs font-medium text-[#163A26] hover:underline cursor-pointer"
                                            >
                                                Forgot Password?
                                            </button>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            id="login-password-input"
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={(e) => {
                                                setPassword(e.target.value);
                                                if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' });
                                            }}
                                            className={`w-full pl-10 pr-12 py-3 rounded-xl bg-white border text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all duration-200 ${
                                                fieldErrors.password
                                                    ? 'border-red-400 ring-2 ring-red-100'
                                                    : 'border-gray-200/90 focus:border-[#163A26] focus:ring-2 focus:ring-emerald-900/10'
                                            }`}
                                        />
                                        <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none p-1 cursor-pointer"
                                            title={showPassword ? 'Hide password' : 'Show password'}
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {fieldErrors.password && (
                                        <p className="mt-1 text-xs text-red-600 font-medium">{fieldErrors.password}</p>
                                    )}
                                </div>

                                {/* Confirm Password (Register Mode Only) */}
                                {isRegisterMode && (
                                    <div>
                                        <label className="block text-xs font-semibold text-[#2C3E2D] mb-1.5">
                                            Confirm Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="Repeat your password"
                                                value={confirmPassword}
                                                onChange={(e) => {
                                                    setConfirmPassword(e.target.value);
                                                    if (fieldErrors.confirmPassword) setFieldErrors({ ...fieldErrors, confirmPassword: '' });
                                                }}
                                                className={`w-full pl-10 pr-4 py-3 rounded-xl bg-white border text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all duration-200 ${
                                                    fieldErrors.confirmPassword
                                                        ? 'border-red-400 ring-2 ring-red-100'
                                                        : 'border-gray-200/90 focus:border-[#163A26] focus:ring-2 focus:ring-emerald-900/10'
                                                }`}
                                            />
                                            <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                        </div>
                                        {fieldErrors.confirmPassword && (
                                            <p className="mt-1 text-xs text-red-600 font-medium">{fieldErrors.confirmPassword}</p>
                                        )}
                                    </div>
                                )}

                                {/* Remember Me Checkbox */}
                                <div className="flex items-center justify-between pt-1">
                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                            className="w-4 h-4 rounded text-[#163A26] focus:ring-[#163A26] border-gray-300 accent-[#163A26]"
                                        />
                                        <span className="text-xs text-gray-700 font-medium">Remember Me</span>
                                    </label>
                                </div>

                                {/* Sign In Button */}
                                <button
                                    type="submit"
                                    id="submit-auth-button"
                                    disabled={isLoading}
                                    className="w-full mt-2 py-3.5 px-6 rounded-xl bg-[#163A26] hover:bg-[#0f2e1e] active:scale-[0.99] text-white text-sm font-semibold tracking-wide shadow-md transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center gap-2">
                                            <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                            </svg>
                                            <span>Entering Sanctuary...</span>
                                        </div>
                                    ) : (
                                        <span>{isRegisterMode ? 'Create Account' : 'Sign In'}</span>
                                    )}
                                </button>
                            </form>

                            {/* OR Divider */}
                            <div className="relative my-5">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-[#FAF8F3] px-3 text-gray-400 font-medium tracking-wider">
                                        OR
                                    </span>
                                </div>
                            </div>

                            {/* Google Sign In Button */}
                            <button
                                type="button"
                                onClick={handleGoogleSignIn}
                                className="w-full py-3 px-4 rounded-xl bg-white hover:bg-gray-50 border border-gray-200/90 shadow-sm text-sm font-medium text-gray-700 transition-all flex items-center justify-center gap-3 cursor-pointer"
                            >
                                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                                    <path
                                        fill="#4285F4"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                                    />
                                    <path
                                        fill="#EA4335"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                                    />
                                </svg>
                                <span>Sign In with Google</span>
                            </button>

                            {/* Create Account Toggle */}
                            <div className="mt-5 text-center text-xs text-gray-600">
                                {isRegisterMode ? (
                                    <span>
                                        Already have an account?{' '}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsRegisterMode(false);
                                                setErrorMsg(null);
                                                setSuccessMsg(null);
                                                setFieldErrors({});
                                            }}
                                            className="font-semibold text-[#163A26] hover:underline cursor-pointer"
                                        >
                                            Sign In
                                        </button>
                                    </span>
                                ) : (
                                    <span>
                                        Don&apos;t have an account?{' '}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsRegisterMode(true);
                                                setErrorMsg(null);
                                                setSuccessMsg(null);
                                                setFieldErrors({});
                                            }}
                                            className="font-semibold text-[#163A26] hover:underline cursor-pointer"
                                        >
                                            Create Account
                                        </button>
                                    </span>
                                )}
                            </div>

                            {/* Explore Store as Guest link */}
                            <div className="mt-3 text-center">
                                <button
                                    type="button"
                                    onClick={onNavigateHome}
                                    className="text-xs text-[#163A26]/80 hover:text-[#163A26] font-medium transition-colors inline-flex items-center gap-1 cursor-pointer"
                                >
                                    <span>Explore Store as Guest</span>
                                    <span>→</span>
                                </button>
                            </div>

                        </div>
                    </div>

                </div>
            </div>

            {/* Forgot Password Modal */}
            {isForgotModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-[#FAF8F3] max-w-sm w-full rounded-2xl p-6 shadow-2xl border border-gray-200">
                        <h3 className="font-serif text-xl font-bold text-[#163A26] mb-2">Password Recovery</h3>
                        <p className="text-xs text-gray-600 mb-4">
                            Enter the email associated with your Urban Jungle account. We&apos;ll send you password reset instructions.
                        </p>
                        {forgotSuccess ? (
                            <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                                <CheckCircle2 size={16} className="text-emerald-600" />
                                <span>Reset link sent! Please check your inbox.</span>
                            </div>
                        ) : (
                            <form onSubmit={handleForgotPasswordSubmit} className="space-y-3">
                                <div>
                                    <input
                                        type="email"
                                        required
                                        placeholder="your.email@example.com"
                                        value={forgotEmail}
                                        onChange={(e) => setForgotEmail(e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#163A26]"
                                    />
                                </div>
                                <div className="flex items-center justify-end gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsForgotModalOpen(false)}
                                        className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 rounded-lg cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-xs font-semibold bg-[#163A26] hover:bg-[#0f2e1e] text-white rounded-lg shadow-sm cursor-pointer"
                                    >
                                        Send Reset Link
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
