import { useRef, useEffect } from 'react';
import { X, Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface CartItem {
    id: number;
    name: string;
    price: number;
    image: string;
    quantity: number;
}

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    cartItems: CartItem[];
    onUpdateQty: (id: number, delta: number) => void;
    onRemove: (id: number) => void;
    onCheckout: () => void;
}

export const CartDrawer = ({ isOpen, onClose, cartItems, onUpdateQty, onRemove, onCheckout }: CartDrawerProps) => {
    const drawerRef = useRef<HTMLDivElement>(null);

    // Close on escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm"
                    />

                    {/* Drawer */}
                    <motion.div
                        ref={drawerRef}
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full md:w-[450px] bg-white z-[101] shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
                            <h2 className="font-serif text-3xl text-[#1a1a1a]">Your Cart</h2>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {cartItems.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 space-y-4">
                                    <span className="bg-gray-50 p-6 rounded-full">
                                        <Trash2 size={48} className="opacity-20" />
                                    </span>
                                    <p className="font-sans text-lg">Your cart is empty.</p>
                                    <button
                                        onClick={onClose}
                                        className="text-jungle-green font-bold hover:underline"
                                    >
                                        Start Shopping
                                    </button>
                                </div>
                            ) : (
                                cartItems.map((item) => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="w-24 h-24 bg-[#f0f0f0] rounded-xl overflow-hidden flex-shrink-0">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-serif text-lg font-bold text-[#1a1a1a] leading-tight mb-1">
                                                        {item.name}
                                                    </h3>
                                                    <p className="font-sans text-gray-500 text-sm">
                                                        ${item.price.toFixed(2)}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => onRemove(item.id)}
                                                    className="text-gray-300 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center bg-gray-50 rounded-lg p-1">
                                                    <button
                                                        onClick={() => onUpdateQty(item.id, -1)}
                                                        disabled={item.quantity <= 1}
                                                        className={`p-1 rounded-md transition-colors ${item.quantity <= 1 ? 'text-gray-300' : 'text-gray-600 hover:bg-white hover:shadow-sm'
                                                            }`}
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                    <span className="font-sans font-bold text-sm w-8 text-center">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => onUpdateQty(item.id, 1)}
                                                        className="p-1 text-gray-600 hover:bg-white hover:shadow-sm rounded-md transition-colors"
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {cartItems.length > 0 && (
                            <div className="p-6 border-t border-gray-100 bg-[#fcfbf9]">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="font-sans text-gray-500">Subtotal</span>
                                    <span className="font-serif text-2xl font-bold text-[#1a1a1a]">
                                        ${subtotal.toFixed(2)}
                                    </span>
                                </div>
                                <p className="text-xs text-center text-gray-400 mb-4">
                                    Shipping & taxes calculated at checkout.
                                </p>
                                <button
                                    onClick={onCheckout}
                                    className="w-full bg-[#1a1a1a] text-white py-4 rounded-xl font-sans font-bold text-lg hover:bg-black transition-colors flex items-center justify-center gap-2 group"
                                >
                                    Checkout
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
