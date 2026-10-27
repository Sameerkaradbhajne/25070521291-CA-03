import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, User, CheckCircle2, AlertCircle, Leaf, Sparkles, Home, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginPageProps {
    onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
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
            errors.email = 'Email address is required';
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
                    onLoginSuccess();
                }, 500);
            } else {
                const userData = await login({ email: email.trim(), password }, rememberMe);
                setSuccessMsg(`Welcome back, ${userData.name}! Entering sanctuary...`);
                setTimeout(() => {
                    onLoginSuccess();
                }, 500);
            }
        } catch (err: any) {
            setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
        }
    };

    const handleGoogleSignIn = async () => {
        setErrorMsg(null);
        try {
            const userData = await loginWithGoogle();
            setSuccessMsg(`Welcome, ${userData.name}! Entering sanctuary...`);
            setTimeout(() => {
                onLoginSuccess();
            }, 500);
        } catch (err: any) {
            setErrorMsg(err.message || 'Google Sign-In failed.');
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
        }, 1800);
    };

    return (
        <div className="min-h-screen w-full flex flex-col lg:flex-row font-sans bg-[#FAF8F5] text-gray-800 antialiased selection:bg-[#163A26] selection:text-white">
            
            {/* ============================================================ */}
            {/* LEFT SECTION: Botanical Visual Stage (Split Screen Desktop)  */}
            {/* ============================================================ */}
            <div className="relative w-full lg:w-7/12 min-h-[380px] lg:min-h-screen flex flex-col justify-between p-8 sm:p-12 lg:p-16 overflow-hidden bg-[#0A1E12]">
                
                {/* Botanical Background Image with Dark Nature Overlay */}
                <div
                    className="absolute inset-0 bg-cover bg-center scale-105 transition-transform duration-1000 ease-out"
                    style={{
                        backgroundImage: "url('/images/login-bg.jpg')",
                    }}
                />

                {/* Deep Botanical Green Gradient Overlay for Maximum Legibility */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#07190F]/95 via-[#0D2617]/85 to-[#163A26]/75 pointer-events-none" />

                {/* Subtle Ambient Leaf Pattern Texture Overlay */}
                <div className="absolute inset-0 bg-radial-vignette opacity-40 pointer-events-none" />

                {/* Top Branding Header */}
                <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-[#9FC4A6] shadow-sm">
                            <Leaf size={22} className="rotate-12" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-serif text-2xl font-bold tracking-[0.18em] text-white leading-none">
                                URBAN JUNGLE
                            </span>
                            <span className="font-sans text-[10px] tracking-[0.28em] text-[#9FC4A6] font-semibold uppercase mt-0.5">
                                BOTANICAL SANCTUARY
                            </span>
                        </div>
                    </div>

                    <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-[11px] font-medium text-white/80">
                        <ShieldCheck size={14} className="text-[#9FC4A6]" />
                        <span>CA Project Demo</span>
                    </div>
                </div>

                {/* Center Headline & Editorial Storytelling */}
                <div className="relative z-10 my-auto py-8 lg:py-12 max-w-xl">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#9FC4A6]/15 backdrop-blur-md border border-[#9FC4A6]/30 text-[#D8EADB] text-xs font-semibold tracking-wider uppercase mb-6">
                        <Sparkles size={14} className="text-[#9FC4A6]" />
                        <span>A Greener World Begins Here</span>
                    </div>

                    <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.12] tracking-tight">
                        Welcome to Your <br />
                        <span className="italic font-normal text-[#9FC4A6]">Urban Jungle</span>
                    </h1>

                    <p className="mt-5 text-sm sm:text-base lg:text-lg text-white/85 font-light leading-relaxed">
                        Step into a living collection of rare tropicals, sculptural foliage, and mindful plant care. Cultivate serenity in every corner of your home.
                    </p>

                    {/* Three Feature Highlights */}
                    <div className="mt-8 pt-6 border-t border-white/15 grid grid-cols-3 gap-3 sm:gap-6">
                        <div className="flex flex-col gap-1.5">
                            <div className="text-[#9FC4A6]">
                                <Leaf size={20} strokeWidth={1.75} />
                            </div>
                            <span className="text-xs sm:text-sm font-medium text-white leading-snug">
                                Handpicked Greenery
                            </span>
                            <span className="text-[11px] text-white/60 hidden sm:block">
                                Sustainably nurtured
                            </span>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <div className="text-[#9FC4A6]">
                                <Sparkles size={20} strokeWidth={1.75} />
                            </div>
                            <span className="text-xs sm:text-sm font-medium text-white leading-snug">
                                Thoughtfully Curated
                            </span>
                            <span className="text-[11px] text-white/60 hidden sm:block">
                                Tailored to your space
                            </span>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <div className="text-[#9FC4A6]">
                                <Home size={20} strokeWidth={1.75} />
                            </div>
                            <span className="text-xs sm:text-sm font-medium text-white leading-snug">
                                Living Sanctuary
                            </span>
                            <span className="text-[11px] text-white/60 hidden sm:block">
                                Care guides & workshops
                            </span>
                        </div>
                    </div>
                </div>

                {/* Bottom Footer Quote */}
                <div className="relative z-10 flex items-center justify-between pt-4 border-t border-white/10 text-white/60 text-xs">
                    <span className="font-serif italic text-white/80 tracking-wide">
                        Grow beautifully. Live naturally.
                    </span>
                    <span className="hidden sm:inline text-[11px] tracking-wider uppercase text-white/50">
                        PRN: 25070521291
                    </span>
                </div>
            </div>

            {/* ============================================================ */}
            {/* RIGHT SECTION: Warm Cream Login Card Container              */}
            {/* ============================================================ */}
            <div className="w-full lg:w-5/12 flex flex-col justify-center items-center px-6 sm:px-10 lg:px-14 py-10 lg:py-16 bg-[#FAF8F5]">
                <div className="w-full max-w-md">

                    {/* Sanctuary Pill Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E8EFEA] text-[#163A26] text-xs font-semibold tracking-wider uppercase mb-5">
                        <Leaf size={14} className="text-[#163A26]" />
                        <span>SANCTUARY ACCESS</span>
                    </div>

                    {/* Heading */}
                    <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#163A26] leading-tight mb-2">
                        {isRegisterMode ? 'Join the Sanctuary' : 'Welcome Back'}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-600 mb-6 font-light leading-relaxed">
                        {isRegisterMode
                            ? 'Enter your name and any email to begin exploring your plant haven.'
                            : 'Sign in to access your curated plants, saved items, and botanical care guides.'}
                    </p>

                    {/* Demo Access Callout Box (Explicitly fulfilling requirement 3 & 4) */}
                    <div className="mb-6 p-3.5 rounded-2xl bg-[#EBF3ED] border border-[#C5DDCB] text-[#163A26] text-xs flex items-start gap-3 shadow-sm">
                        <div className="w-6 h-6 rounded-full bg-[#163A26] text-white flex items-center justify-center shrink-0 mt-0.5">
                            <Leaf size={13} />
                        </div>
                        <div className="flex-1 leading-relaxed">
                            <strong className="font-semibold text-[#163A26]">Demo Access Active:</strong>{' '}
                            <span>You can log in using <strong>any valid email</strong> and <strong>any non-empty password</strong>. No registration required.</span>
                        </div>
                    </div>

                    {/* Error and Success Alerts */}
                    {errorMsg && (
                        <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-fadeIn">
                            <AlertCircle size={16} className="shrink-0 text-red-500 mt-0.5" />
                            <div className="flex-1 font-medium">{errorMsg}</div>
                        </div>
                    )}

                    {successMsg && (
                        <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 animate-fadeIn">
                            <CheckCircle2 size={16} className="shrink-0 text-emerald-600 mt-0.5" />
                            <div className="flex-1 font-medium">{successMsg}</div>
                        </div>
                    )}

                    {/* Authentication Form */}
                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                        
                        {/* Full Name Input (Register Mode Only) */}
                        {isRegisterMode && (
                            <div>
                                <label className="block text-xs font-semibold text-[#2C3E2D] mb-1.5 uppercase tracking-wide">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        id="login-name-input"
                                        placeholder="e.g. Flora Green"
                                        value={name}
                                        onChange={(e) => {
                                            setName(e.target.value);
                                            if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: '' });
                                        }}
                                        className={`w-full pl-10 pr-4 py-3 rounded-xl bg-white border text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all shadow-sm ${
                                            fieldErrors.name
                                                ? 'border-red-400 ring-2 ring-red-100'
                                                : 'border-gray-200 focus:border-[#163A26] focus:ring-2 focus:ring-[#163A26]/10'
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
                            <label className="block text-xs font-semibold text-[#2C3E2D] mb-1.5 uppercase tracking-wide">
                                Email Address
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    id="login-email-input"
                                    placeholder="e.g. botanist@urbanjungle.com"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
                                    }}
                                    className={`w-full pl-10 pr-4 py-3 rounded-xl bg-white border text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all shadow-sm ${
                                        fieldErrors.email
                                            ? 'border-red-400 ring-2 ring-red-100'
                                            : 'border-gray-200 focus:border-[#163A26] focus:ring-2 focus:ring-[#163A26]/10'
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
                                <label className="block text-xs font-semibold text-[#2C3E2D] uppercase tracking-wide">
                                    Password
                                </label>
                                {!isRegisterMode && (
                                    <button
                                        type="button"
                                        onClick={() => setIsForgotModalOpen(true)}
                                        className="text-xs text-[#163A26] hover:underline font-medium cursor-pointer"
                                    >
                                        Forgot Password?
                                    </button>
                                )}
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="login-password-input"
                                    placeholder="Enter any password"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' });
                                    }}
                                    className={`w-full pl-10 pr-12 py-3 rounded-xl bg-white border text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all shadow-sm ${
                                        fieldErrors.password
                                            ? 'border-red-400 ring-2 ring-red-100'
                                            : 'border-gray-200 focus:border-[#163A26] focus:ring-2 focus:ring-[#163A26]/10'
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
                                <label className="block text-xs font-semibold text-[#2C3E2D] mb-1.5 uppercase tracking-wide">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="login-confirm-password-input"
                                        placeholder="Repeat your password"
                                        value={confirmPassword}
                                        onChange={(e) => {
                                            setConfirmPassword(e.target.value);
                                            if (fieldErrors.confirmPassword) setFieldErrors({ ...fieldErrors, confirmPassword: '' });
                                        }}
                                        className={`w-full pl-10 pr-4 py-3 rounded-xl bg-white border text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all shadow-sm ${
                                            fieldErrors.confirmPassword
                                                ? 'border-red-400 ring-2 ring-red-100'
                                                : 'border-gray-200 focus:border-[#163A26] focus:ring-2 focus:ring-[#163A26]/10'
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
                                <span className="text-xs text-gray-700 font-medium">Keep me signed in</span>
                            </label>
                        </div>

                        {/* Primary Sign In Button */}
                        <button
                            type="submit"
                            id="submit-auth-button"
                            disabled={isLoading}
                            className="w-full mt-2 py-3.5 px-6 rounded-xl bg-[#163A26] hover:bg-[#0F2A1B] active:scale-[0.99] text-white text-sm font-semibold tracking-wide shadow-md transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer group"
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
                                <>
                                    <span>{isRegisterMode ? 'Create Account & Enter' : 'Enter Sanctuary'}</span>
                                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[#FAF8F5] px-3 text-gray-400 font-medium tracking-wider">
                                OR
                            </span>
                        </div>
                    </div>

                    {/* Google 1-Click Sign-In */}
                    <button
                        type="button"
                        id="google-demo-login-btn"
                        onClick={handleGoogleSignIn}
                        className="w-full py-3 px-4 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 shadow-sm text-sm font-medium text-gray-700 transition-all flex items-center justify-center gap-3 cursor-pointer hover:border-gray-300"
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
                        <span>Continue with Google</span>
                    </button>

                    {/* Mode Toggle Footer */}
                    <div className="mt-6 text-center text-xs text-gray-600">
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
                </div>
            </div>

            {/* Forgot Password Modal */}
            {isForgotModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-[#FAF8F5] max-w-sm w-full rounded-2xl p-6 shadow-2xl border border-gray-200">
                        <div className="flex items-center gap-2 text-[#163A26] mb-2">
                            <Leaf size={18} />
                            <h3 className="font-serif text-lg font-bold">Password Recovery</h3>
                        </div>
                        <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                            Enter your email address. In demo mode, you can sign in directly with any password.
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
                                <div className="flex items-center gap-2 pt-2">
                                    <button
                                        type="submit"
                                        className="flex-1 py-2 px-4 rounded-xl bg-[#163A26] text-white text-xs font-semibold hover:bg-[#0F2A1B]"
                                    >
                                        Send Reset Link
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsForgotModalOpen(false)}
                                        className="py-2 px-4 rounded-xl border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-100"
                                    >
                                        Cancel
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
