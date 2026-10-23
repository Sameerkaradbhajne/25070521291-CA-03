import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, ArrowRight } from 'lucide-react';

const questions = [
    {
        id: 1,
        question: "How much light does your space get?",
        options: [
            "Bright direct sunlight",
            "Bright indirect light",
            "Low light / Shady"
        ]
    },
    {
        id: 2,
        question: "Are you a pet owner?",
        options: [
            "Yes, I have cats/dogs",
            "No pets"
        ]
    },
    {
        id: 3,
        question: "How often do you remember to water?",
        options: [
            "I'm a helicopter parent (Often)",
            "I sometimes forget (Weekly)",
            "I'm a cactus (Rarely)"
        ]
    }
];

export const Quiz = ({ isOpen, onClose, onAddToCart }: { isOpen: boolean; onClose: () => void; onAddToCart: (product: any) => void }) => {
    const [step, setStep] = useState(0);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [answers, setAnswers] = useState<string[]>([]);
    const [showResult, setShowResult] = useState(false);

    const handleAnswer = (answer: string) => {
        const newAnswers = [...answers, answer];
        setAnswers(newAnswers);

        if (step < questions.length - 1) {
            setStep(step + 1);
        } else {
            setShowResult(true);
        }
    };

    const resetQuiz = () => {
        setStep(0);
        setAnswers([]);
        setShowResult(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative min-h-[400px] flex flex-col"
            >
                <button
                    onClick={resetQuiz}
                    className="absolute top-6 right-6 z-10 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <X size={20} className="text-gray-400 hover:text-gray-600" />
                </button>

                <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-12 text-center">
                    <AnimatePresence mode="wait">
                        {!showResult ? (
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="w-full max-w-lg"
                            >
                                <span className="text-xs font-bold tracking-widest text-jungle-green uppercase mb-4 block">
                                    Question {step + 1}/{questions.length}
                                </span>

                                <h2 className="font-serif text-3xl md:text-4xl text-[#1a1a1a] mb-12">
                                    {questions[step].question}
                                </h2>

                                <div className="space-y-4">
                                    {questions[step].options.map((option) => (
                                        <button
                                            key={option}
                                            onClick={() => handleAnswer(option)}
                                            className="w-full py-4 px-6 rounded-xl border-2 border-gray-100 hover:border-jungle-green hover:bg-green-50 text-left transition-all duration-200 font-sans font-medium text-gray-700 hover:text-jungle-green flex items-center justify-between group"
                                        >
                                            {option}
                                            <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="w-full"
                            >
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-jungle-green">
                                    <CheckCircle size={32} strokeWidth={3} />
                                </div>

                                <h2 className="font-serif text-4xl text-[#1a1a1a] mb-3">
                                    We found your match!
                                </h2>
                                <p className="font-sans text-gray-500 mb-8">
                                    Based on your answers, we think you'll love:
                                </p>

                                <div className="bg-[#fcfbf9] rounded-2xl p-4 flex items-center gap-6 max-w-md mx-auto mb-8 text-left shadow-sm border border-gray-100">
                                    <div className="w-24 h-24 bg-white rounded-xl overflow-hidden flex-shrink-0">
                                        <img src="/images/Monstera Deliciosa.jpg" alt="Monstera" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h3 className="font-serif text-xl font-bold text-[#1a1a1a]">Monstera Deliciosa</h3>
                                        <p className="font-sans text-jungle-green font-bold text-lg">$45.00</p>
                                    </div>
                                </div>

                                <div className="flex justify-center gap-4">
                                    <button
                                        onClick={resetQuiz}
                                        className="px-6 py-3 text-gray-400 hover:text-gray-600 font-sans font-semibold"
                                    >
                                        Close
                                    </button>
                                    <button
                                        onClick={() => {
                                            onAddToCart({
                                                id: 1,
                                                name: "Monstera Deliciosa",
                                                price: 45.00,
                                                image: "/images/Monstera Deliciosa.jpg"
                                            });
                                            resetQuiz();
                                        }}
                                        className="bg-jungle-green text-white px-8 py-3 rounded-full font-sans font-bold hover:bg-[#153e22] transition-colors shadow-lg shadow-green-900/20"
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};
