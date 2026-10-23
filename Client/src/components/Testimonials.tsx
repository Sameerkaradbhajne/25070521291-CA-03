import { Star } from 'lucide-react';

const testimonials = [
    {
        name: "Sarah Jenkins",
        text: "The plants arrived in perfect condition and the packaging was eco-friendly. I'm in love with my new Monstera!",
        rating: 5
    },
    {
        name: "Michael Chen",
        text: "Great selection of rare plants. The care guides included were super helpful for a beginner like me.",
        rating: 5
    },
    {
        name: "Emma Wilson",
        text: "Fast shipping and excellent customer service. My fiddle leaf fig is thriving!",
        rating: 5
    }
];

export const Testimonials = () => {
    return (
        <section className="py-24 bg-sage/30">
            <div className="container mx-auto px-6 md:px-12">
                <h2 className="font-serif text-4xl md:text-5xl text-center text-jungle-green mb-16">
                    Grow With Us
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((t, i) => (
                        <div key={i} className="bg-white p-10 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex gap-1 text-yellow-400 mb-6">
                                {[...Array(t.rating)].map((_, index) => (
                                    <Star key={index} size={18} fill="currentColor" className="stroke-none" />
                                ))}
                            </div>
                            <p className="font-sans text-gray-600 mb-8 italic leading-relaxed text-lg">"{t.text}"</p>
                            <p className="font-serif text-jungle-green font-semibold text-lg border-l-4 border-jungle-green pl-4">
                                {t.name}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
