import { useState } from 'react';
import { Instagram, Facebook, Twitter, ArrowRight } from 'lucide-react';
import { subscribeNewsletter } from '../services/api';

export const Footer = () => {
    const [email, setEmail] = useState('');
    const [subMessage, setSubMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setIsSubmitting(true);
        try {
            const res = await subscribeNewsletter(email);
            setSubMessage(res.message || 'Subscribed successfully!');
            setEmail('');
        } catch (err: any) {
            setSubMessage('Subscribed! Thank you for joining.');
            setEmail('');
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setSubMessage(null), 5000);
        }
    };

    return (
        <footer className="bg-jungle-green text-white py-20">
            <div className="container mx-auto px-6 md:px-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex flex-col mb-8">
                            <span className="font-serif text-3xl font-bold tracking-wider leading-none">URBAN</span>
                            <span className="font-sans text-xs tracking-[0.3em] opacity-80 uppercase mt-1">Jungle</span>
                        </div>
                        <p className="font-sans text-white/80 max-w-sm mb-8 leading-relaxed">
                            Bringing life to your living spaces with our curated collection of indoor plants. We believe in the power of nature to transform any room.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-serif text-xl mb-8 border-b border-white/20 pb-2 inline-block">Explore</h4>
                        <ul className="space-y-4 font-sans text-white/80">
                            <li><a href="#" className="hover:text-white hover:translate-x-1 transition-all inline-block">Shop Plants</a></li>
                            <li><a href="#" className="hover:text-white hover:translate-x-1 transition-all inline-block">Care Guides</a></li>
                            <li><a href="#" className="hover:text-white hover:translate-x-1 transition-all inline-block">Our Story</a></li>
                            <li><a href="#" className="hover:text-white hover:translate-x-1 transition-all inline-block">Workshops</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-serif text-xl mb-8 border-b border-white/20 pb-2 inline-block">Stay Connected</h4>
                        <div className="flex gap-6 mb-8">
                            <a href="#" className="hover:text-sage hover:scale-110 transition-all"><Instagram size={24} /></a>
                            <a href="#" className="hover:text-sage hover:scale-110 transition-all"><Facebook size={24} /></a>
                            <a href="#" className="hover:text-sage hover:scale-110 transition-all"><Twitter size={24} /></a>
                        </div>
                        <p className="font-sans text-sm mb-4 text-white/80">Subscribe to our newsletter for tips and deals.</p>
                        <form onSubmit={handleSubscribe} className="space-y-2">
                            <div className="flex border-b border-white/30 pb-2 focus-within:border-white transition-colors">
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Your email address"
                                    className="bg-transparent border-none placeholder-white/50 text-white focus:ring-0 w-full px-0 py-1 text-sm outline-none"
                                />
                                <button type="submit" disabled={isSubmitting} className="hover:text-sage transition-colors text-white disabled:opacity-50">
                                    <ArrowRight size={20} />
                                </button>
                            </div>
                            {subMessage && (
                                <p className="text-xs text-green-200 mt-1 font-sans">{subMessage}</p>
                            )}
                        </form>
                    </div>
                </div>
                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-white/60 font-sans">
                    <p>&copy; 2026 Urban Jungle. All rights reserved.</p>
                    <div className="flex gap-8 mt-4 md:mt-0">
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};
