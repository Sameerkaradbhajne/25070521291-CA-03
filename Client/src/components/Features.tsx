import { Truck, CheckCircle, Headphones } from 'lucide-react';

const features = [
    {
        icon: <Truck size={40} strokeWidth={1.5} />,
        title: "Safe Delivery Guarantee",
        description: "If it arrives damaged, we replace it. Period."
    },
    {
        icon: <CheckCircle size={40} strokeWidth={1.5} />,
        title: "Healthy Plant Promise",
        description: "Pest-free and rooted, inspected by experts."
    },
    {
        icon: <Headphones size={40} strokeWidth={1.5} />,
        title: "Lifetime Care Support",
        description: "Questions? Chat with our botanists anytime."
    }
];

export const Features = () => {
    return (
        <section className="py-16 bg-[#1a472a] text-white border-t border-white/10">
            <div className="container mx-auto px-6 md:px-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                    {features.map((feature, index) => (
                        <div key={index} className="flex flex-col items-center group cursor-default">
                            <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300 opacity-90 group-hover:opacity-100">
                                {feature.icon}
                            </div>
                            <h3 className="font-serif text-2xl font-semibold mb-3 tracking-wide">
                                {feature.title}
                            </h3>
                            <p className="font-sans text-white/80 font-light text-base max-w-xs leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
