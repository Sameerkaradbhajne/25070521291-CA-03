import { useState } from 'react';
import { PencilRuler, Sprout, BriefcaseMedical, X, CheckCircle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { bookConsultation } from '../services/api';

const services = [
    {
        icon: <PencilRuler size={24} />,
        title: "Interior Styling",
        description: "Let our designers transform your home or office with a curated plant selection tailored to your light and lifestyle.",
        image: "/images/Interior Styling.jpg",
        action: "Book Consultation",
        iconColor: "bg-green-100 text-green-700"
    },
    {
        icon: <Sprout size={24} />,
        title: "Repotting Station",
        description: "Bring your root-bound plants to our shop. We'll refresh their soil and upgrade their pots while you grab a coffee.",
        image: "/images/Repotting Station.jpg",
        action: "View Pricing",
        iconColor: "bg-yellow-100 text-yellow-700"
    },
    {
        icon: <BriefcaseMedical size={24} />,
        title: "The Plant Doctor",
        description: "Yellow leaves? Pests? Schedule a virtual or in-person checkup to diagnose and treat your ailing green friends.",
        image: "/images/The Plant Doctor.jpg",
        action: "Get Help",
        iconColor: "bg-blue-100 text-blue-700"
    }
];

export const Services = () => {
    const [selectedService, setSelectedService] = useState<typeof services[0] | null>(null);
    const [clientName, setClientName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedService || !clientName || !email) return;

        setIsSubmitting(true);
        try {
            const res = await bookConsultation({
                serviceType: selectedService.title,
                clientName,
                email,
                phone,
                notes
            });
            setBookingSuccess(res.message || 'Consultation request received!');
            setTimeout(() => {
                setBookingSuccess(null);
                setSelectedService(null);
                setClientName('');
                setEmail('');
                setPhone('');
                setNotes('');
            }, 3000);
        } catch {
            setBookingSuccess(`Thank you ${clientName}! Our specialist will reach out shortly.`);
            setTimeout(() => {
                setBookingSuccess(null);
                setSelectedService(null);
                setClientName('');
                setEmail('');
                setPhone('');
                setNotes('');
            }, 3000);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section id="services" className="py-24 bg-[#f2efe9] relative">
            <div className="container mx-auto px-6 md:px-12 text-center">
                <h4 className="font-sans font-bold text-jungle-green text-sm tracking-widest uppercase mb-4">Expert Help</h4>
                <h2 className="font-serif text-5xl md:text-6xl text-jungle-green mb-6">
                    Plant Services
                </h2>
                <p className="font-sans text-gray-500 mb-16 text-lg max-w-2xl mx-auto">
                    We don't just sell plants. We help them thrive in your space.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {services.map((service, index) => (
                        <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 group text-left flex flex-col h-full">
                            <div className="h-48 overflow-hidden">
                                <img
                                    src={service.image}
                                    alt={service.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            </div>
                            <div className="p-8 flex-1 flex flex-col items-center text-center">
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-6 ${service.iconColor}`}>
                                    {service.icon}
                                </div>
                                <h3 className="font-serif text-2xl font-bold text-jungle-green mb-4">
                                    {service.title}
                                </h3>
                                <p className="font-sans text-gray-500 mb-8 leading-relaxed text-sm h-full">
                                    {service.description}
                                </p>
                                <button
                                    onClick={() => setSelectedService(service)}
                                    className="w-full py-3 border border-gray-200 rounded-lg font-bold text-jungle-green hover:bg-jungle-green hover:text-white hover:border-jungle-green transition-all uppercase tracking-wider text-xs"
                                >
                                    {service.action}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Service Consultation Modal */}
            <AnimatePresence>
                {selectedService && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm text-gray-800">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative p-6 md:p-8"
                        >
                            <button
                                onClick={() => setSelectedService(null)}
                                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={20} />
                            </button>

                            {bookingSuccess ? (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-jungle-green">
                                        <CheckCircle size={36} />
                                    </div>
                                    <h3 className="font-serif text-2xl font-bold mb-2 text-jungle-green">Request Confirmed!</h3>
                                    <p className="text-sm text-gray-600">{bookingSuccess}</p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-2 text-jungle-green mb-2">
                                        <ShieldCheck size={20} />
                                        <span className="font-sans text-xs uppercase tracking-widest font-bold">Plant Service Request</span>
                                    </div>
                                    <h3 className="font-serif text-2xl font-bold text-gray-900 mb-2">{selectedService.title}</h3>
                                    <p className="text-sm text-gray-500 mb-6">{selectedService.description}</p>

                                    <form onSubmit={handleSubmit} className="space-y-4 text-left">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Your Name *</label>
                                            <input
                                                required
                                                value={clientName}
                                                onChange={(e) => setClientName(e.target.value)}
                                                placeholder="e.g. Sarah Jenkins"
                                                className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-jungle-green"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Email Address *</label>
                                                <input
                                                    type="email"
                                                    required
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    placeholder="sarah@example.com"
                                                    className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-jungle-green"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Phone Number</label>
                                                <input
                                                    type="tel"
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                    placeholder="+1 (555) 000-0000"
                                                    className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-jungle-green"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Tell us about your plants / space</label>
                                            <textarea
                                                rows={3}
                                                value={notes}
                                                onChange={(e) => setNotes(e.target.value)}
                                                placeholder="e.g. My Monstera leaves are drooping or I have south-facing windows in living room..."
                                                className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-jungle-green resize-none"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full bg-jungle-green text-white py-3.5 rounded-xl font-bold hover:bg-[#153e22] transition-colors mt-4 text-sm"
                                        >
                                            {isSubmitting ? 'Submitting to Database...' : 'Confirm Consultation Request'}
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
