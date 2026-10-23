import { Search, ShoppingBag, Package } from 'lucide-react';

export const Navbar = ({
    cartCount = 0,
    onCartClick,
    onOrdersClick,
    searchQuery,
    onSearch
}: {
    cartCount?: number;
    onCartClick: () => void;
    onOrdersClick?: () => void;
    searchQuery: string;
    onSearch: (query: string) => void;
}) => {
    return (
        <nav className="sticky top-0 z-50 bg-cream/95 backdrop-blur-sm py-4 px-6 md:px-12 flex items-center justify-between border-b border-gray-100 transition-all duration-300">
            <div className="flex items-center gap-2 cursor-pointer group">
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
