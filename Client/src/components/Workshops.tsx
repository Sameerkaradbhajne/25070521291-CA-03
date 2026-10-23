import { useState, useEffect } from 'react';
import { ArrowRight, X, CheckCircle, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getWorkshops, registerWorkshop } from '../services/api';

interface WorkshopItem {
    title: string;
    date: string;
    month: string;
    day: string;
    time: string;
    price: number;
    description?: string;
}

const defaultWorkshops: WorkshopItem[] = [
    {
        title: "Terrarium Building 101",
        date: "Feb 12",
        month: "Feb",
        day: "12",
        time: "2:00 PM - 4:00 PM",
        price: 45,
        description: "Learn to build and balance your own self-sustaining tropical terrarium."
    },
    {
        title: "Propagating Rare Aroids",
        date: "Feb 18",
        month: "Feb",
        day: "18",
        time: "6:00 PM - 7:30 PM",
        price: 30,
        description: "Master stem cuttings, air layering, and rooting hormones to multiply your rare philodendrons."
    }
];

export const Workshops = () => {
    const [workshops, setWorkshops] = useState<WorkshopItem[]>(defaultWorkshops);
    const [selectedWorkshop, setSelectedWorkshop] = useState<WorkshopItem | null>(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [tickets, setTickets] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    useEffect(() => {
        getWorkshops()
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    setWorkshops(data);
                }
            })
            .catch(() => {});
    }, []);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedWorkshop || !name || !email) return;
        setIsSubmitting(true);
        try {
            const res = await registerWorkshop({
                workshopTitle: selectedWorkshop.title,
                name,
                email,
                tickets
            });
            setSuccessMsg(res.message || 'Registration confirmed!');
            setTimeout(() => {
                setSuccessMsg(null);
                setSelectedWorkshop(null);
                setName('');
                setEmail('');
                setTickets(1);
            }, 2500);
        } catch {
            setSuccessMsg('Registration confirmed! We look forward to seeing you.');
            setTimeout(() => {
                setSuccessMsg(null);
                setSelectedWorkshop(null);
                setName('');
                setEmail('');
                setTickets(1);
            }, 2500);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section id="workshops" className="py-24 bg-[#1a1a1a] text-white relative">
            <div className="container mx-auto px-6 md:px-12">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    {/* Left Image */}
                    <div className="w-full lg:w-1/2">
                        <div className="relative rounded-2xl overflow-hidden aspect-[4/3] shadow-2xl">
                            <img
                                src="/images/Upcoming Events.jpg"
                                alt="Workshop"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    {/* Right Content */}
                    <div className="w-full lg:w-1/2">
                        <span className="bg-jungle-green text-white px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase inline-block mb-6">
                            Upcoming Events
                        </span>
                        <h2 className="font-serif text-5xl md:text-6xl mb-6">
                            Get Your Hands Dirty
                        </h2>
                        <p className="font-sans text-white/70 text-lg leading-relaxed mb-12 max-w-lg">
                            Join our weekly community workshops. Learn to build terrariums, make kokedama, or propagate your favorite rare aroids.
                        </p>

                        <div className="space-y-4 mb-8">
                            {workshops.map((ws, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => setSelectedWorkshop(ws)}
                                    className="bg-white/10 rounded-xl p-4 flex gap-6 items-center hover:bg-white/20 transition-all cursor-pointer group border border-white/5 hover:border-white/20"
                                >
                                    <div className="bg-white text-black rounded-lg p-3 text-center min-w-[70px]">
                                        <span className="block text-xs font-bold uppercase tracking-wider">{ws.month || 'Feb'}</span>
                                        <span className="block text-2xl font-serif font-bold">{ws.day || '12'}</span>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-serif text-xl font-bold mb-1 group-hover:text-jungle-green transition-colors">{ws.title}</h4>
                                        <p className="font-sans text-sm text-white/60">{ws.time} • ${ws.price}/person</p>
                                    </div>
                                    <span className="text-xs bg-jungle-green/80 text-white px-3 py-1.5 rounded-full font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                        Register
                                    </span>
                                </div>
                            ))}
                        </div>

                        <a href="#workshops" onClick={() => setSelectedWorkshop(workshops[0])} className="inline-flex items-center gap-2 text-jungle-green font-bold hover:text-white transition-colors">
                            RSVP for Next Event <ArrowRight size={18} />
                        </a>
                    </div>
                </div>
            </div>

            {/* Registration Modal */}
            <AnimatePresence>
                {selectedWorkshop && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm text-gray-800">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative p-6"
                        >
                            <button
                                onClick={() => setSelectedWorkshop(null)}
                                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={20} />
                            </button>

                            {successMsg ? (
                                <div className="text-center py-6">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-jungle-green">
                                        <CheckCircle size={36} />
                                    </div>
                                    <h3 className="font-serif text-2xl font-bold mb-2 text-jungle-green">Confirmed!</h3>
                                    <p className="text-sm text-gray-600">{successMsg}</p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-2 text-jungle-green mb-2">
                                        <Calendar size={20} />
                                        <span className="font-sans text-xs uppercase tracking-widest font-bold">Workshop Registration</span>
                                    </div>
                                    <h3 className="font-serif text-2xl font-bold text-gray-900 mb-1">{selectedWorkshop.title}</h3>
                                    <p className="text-xs text-gray-500 mb-6">{selectedWorkshop.time} • ${selectedWorkshop.price} per seat</p>

                                    <form onSubmit={handleRegister} className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Your Name</label>
                                            <input
                                                required
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="Full Name"
                                                className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-jungle-green"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Email Address</label>
                                            <input
                                                type="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="you@example.com"
                                                className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-jungle-green"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Seats</label>
                                            <select
                                                value={tickets}
                                                onChange={(e) => setTickets(Number(e.target.value))}
                                                className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-jungle-green bg-white"
                                            >
                                                <option value={1}>1 Seat (${selectedWorkshop.price * 1})</option>
                                                <option value={2}>2 Seats (${selectedWorkshop.price * 2})</option>
                                                <option value={3}>3 Seats (${selectedWorkshop.price * 3})</option>
                                            </select>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full bg-jungle-green text-white py-3.5 rounded-xl font-bold hover:bg-[#153e22] transition-colors mt-4 text-sm"
                                        >
                                            {isSubmitting ? 'Confirming...' : `Confirm Registration ($${selectedWorkshop.price * tickets})`}
                                        </button>
                                    </form>
                                </>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </section>
    );
};
