import { useState } from 'react';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { Quiz } from './Quiz';

export const Hero = ({ onAddToCart }: { onAddToCart: (product: any) => void }) => {
    const [isQuizOpen, setIsQuizOpen] = useState(false);

    return (
        <div className="relative h-[600px] w-full overflow-hidden">
            <Quiz isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} onAddToCart={onAddToCart} />

            {/* Background Image */}
            <motion.div
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="absolute inset-0 bg-cover bg-center"
                style={{
                    backgroundImage: 'url("/images/HERO PAGE BACK GROUND IMAGE.jpg")',
                }}
            >
                <div className="absolute inset-0 bg-black/20"></div>
            </motion.div>

            {/* Content Overlay */}
            <div className="relative h-full flex flex-col items-center justify-center text-center px-4 pt-16">
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="font-sans text-white text-xs md:text-sm font-bold tracking-[0.2em] mb-4 uppercase text-shadow-sm"
                >
                    Est. 2026
                </motion.p>
                <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white mb-6 leading-tight drop-shadow-lg">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                    >
                        Create Your Own
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 }}
                        className="italic font-light"
                    >
                        Living Sanctuary
                    </motion.div>
                </h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="font-sans text-white/90 text-lg md:text-xl max-w-2xl mb-10 font-light drop-shadow-md"
                >
                    From rare collectibles to unkillable classics. We deliver nature to your doorstep.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1 }}
                    className="flex items-center gap-4"
                >
                    <a href="#shop" className="bg-white text-jungle-green px-8 py-3 rounded-full font-sans font-semibold hover:bg-gray-100 transition-colors shadow-lg shadow-black/20 hover:scale-105 duration-300">
                        Shop Plants
                    </a>
                    <button
                        onClick={() => setIsQuizOpen(true)}
                        className="bg-jungle-green/90 backdrop-blur-sm text-white pl-6 pr-8 py-3 rounded-full font-sans font-semibold hover:bg-jungle-green transition-colors flex items-center gap-2 shadow-lg shadow-black/20 border border-white/20 hover:scale-105 duration-300"
                    >
                        <Search size={18} />
                        Find My Match
                    </button>
                </motion.div>
            </div>
        </div>
    );
};
