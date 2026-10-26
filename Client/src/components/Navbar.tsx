import { Search, ShoppingBag, Package, User as UserIcon, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({
    cartCount = 0,
    onCartClick,
    onOrdersClick,
    onLoginClick,
    onHomeClick,
    searchQuery,
    onSearch
}: {
    cartCount?: number;
    onCartClick: () => void;
    onOrdersClick?: () => void;
    onLoginClick?: () => void;
    onHomeClick?: () => void;
    searchQuery: string;
    onSearch: (query: string) => void;
}) => {
    const { user, isAuthenticated, logout } = useAuth();
    const [showUserDropdown, setShowUserDropdown] = useState(false);

    return (
        <nav className="sticky top-0 z-50 bg-cream/95 backdrop-blur-sm py-4 px-6 md:px-12 flex items-center justify-between border-b border-gray-100 transition-all duration-300">
            <div
                onClick={onHomeClick}
                className="flex items-center gap-2 cursor-pointer group"
            >
                <div className="text-jungle-green transition-transform duration-300 group-hover:rotate-12">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22v-7l-2-2-2 2v7" />
                        <path d="M12 22v-7l2-2 2 2v7" />
                        <path d="M12 15a5 5 0 0 0-5-5 5 5 0 0 0-5 5" />
                        <path d="M12 15a5 5 0 0 1 5-5 5 5 0 0 1 5 5" />
                    </svg>
                </div>
                <div className="flex flex-col">
                    <span className="font-serif text-xl font-bold tracking-wider text-jungle-green leading-none">URBAN</span>
                    <span className="font-sans text-[10px] tracking-[0.2em] text-jungle-light font-semibold uppercase">Jungle</span>
                </div>
            </div>

            <div className="hidden md:flex items-center gap-12 font-sans text-sm font-medium text-gray-600 tracking-wide">
                {['SHOP', 'SERVICES', 'WORKSHOPS'].map((item) => (
                    <a key={item} href={`#${item.toLowerCase()}`} className="relative py-1 hover:text-jungle-green transition-colors group">
                        {item}
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-jungle-green transition-all duration-300 group-hover:w-full"></span>
                    </a>
                ))}
            </div>

            <div className="flex items-center gap-4">
                <div className="relative group">
                    <input
                        type="text"
                        placeholder="Search plants..."
                        value={searchQuery}
                        onChange={(e) => onSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 rounded-full bg-gray-100 border-transparent focus:bg-white focus:border-jungle-green focus:ring-0 transition-all duration-300 outline-none w-32 md:w-64 text-sm font-sans"
                    />
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-jungle-green transition-colors" />
                </div>

                {onOrdersClick && (
                    <button
                        onClick={onOrdersClick}
                        title="View Database Orders"
                        className="p-2 text-gray-600 hover:text-jungle-green hover:bg-gray-100 rounded-full transition-colors flex items-center gap-1 text-xs font-semibold"
                    >
                        <Package size={20} />
                        <span className="hidden sm:inline">Orders</span>
                    </button>
                )}

                {/* User / Sign In */}
                {isAuthenticated && user ? (
                    <div className="relative">
                        <button
                            onClick={() => setShowUserDropdown(!showUserDropdown)}
                            title={`Account: ${user.name}`}
                            className="flex items-center gap-2 p-1.5 pl-2.5 pr-3 rounded-full bg-emerald-50 text-jungle-green border border-emerald-200 hover:bg-emerald-100 transition-colors text-xs font-semibold"
                        >
                            <span className="w-6 h-6 rounded-full bg-jungle-green text-white flex items-center justify-center text-[11px] font-bold">
                                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </span>
                            <span className="hidden sm:inline max-w-[80px] truncate">{user.name.split(' ')[0]}</span>
                        </button>

                        {showUserDropdown && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fadeIn">
                                <div className="px-4 py-2 border-b border-gray-100">
                                    <p className="text-xs font-semibold text-gray-800 truncate">{user.name}</p>
                                    <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                                </div>
                                {onOrdersClick && (
                                    <button
                                        onClick={() => {
                                            setShowUserDropdown(false);
                                            onOrdersClick();
                                        }}
                                        className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                    >
                                        <Package size={14} />
                                        <span>My Orders</span>
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        setShowUserDropdown(false);
                                        logout();
                                    }}
                                    className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                    <LogOut size={14} />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <button
                        onClick={onLoginClick}
                        id="nav-login-btn"
                        title="Sign In"
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-900/5 hover:bg-emerald-900/10 text-jungle-green transition-all text-xs font-semibold border border-emerald-900/10"
                    >
                        <UserIcon size={16} />
                        <span className="hidden sm:inline">Sign In</span>
                    </button>
                )}

                <button
                    onClick={onCartClick}
                    className="relative text-gray-600 hover:text-jungle-green transition-colors p-1"
                >
                    <ShoppingBag size={20} />
                    {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-jungle-green text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
                            {cartCount}
                        </span>
                    )}
                </button>
            </div>
        </nav>
    );
};
