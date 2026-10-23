import { useState, useEffect } from 'react';
import { ShoppingCart, Heart, X, Droplets, Sun, Thermometer, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getProducts } from '../services/api';

const categories = ["All Plants", "Pet Safe", "Low Light", "Rare Finds", "Large Trees"];

const initialProducts = [
    {
        id: 1,
        name: "Monstera Deliciosa",
        scientific: "Monstera deliciosa",
        price: 45.00,
        image: "/images/Monstera Deliciosa.jpg",
        tags: ["Best Seller", "In Stock"],
        category: "All Plants",
        rating: 5,
        reviews: 42,
        description: "The 'Swiss Cheese Plant' is famous for its natural leaf holes. A statement piece that grows rapidly and adds instant tropical vibes.",
        care: {
            water: "Weekly",
            light: "Bright Indirect",
            temp: "65-85°F"
        }
    },
    {
        id: 2,
        name: "Fiddle Leaf Fig",
        scientific: "Ficus lyrata",
        price: 65.00,
        image: "/images/Fiddle Leaf Fig.jpg",
        tags: ["Staff Pick", "In Stock"],
        category: "Large Trees",
        rating: 4.8,
        reviews: 35,
        description: "Known for its broad, violin-shaped leaves. This sculptural tree loves stability and bright light. A favorite among interior designers.",
        care: {
            water: "Weekly",
            light: "Bright Direct",
            temp: "60-75°F"
        }
    },
    {
        id: 3,
        name: "Snake Plant",
        scientific: "Sansevieria trifasciata",
        price: 30.00,
        image: "/images/Snake Plant.jpg",
        tags: ["Unkillable", "Low Light"],
        category: "Low Light",
        rating: 4.9,
        reviews: 128,
        description: "The ultimate low-maintenance plant. It thrives on neglect and purifies air, making it perfect for bedrooms and offices.",
        care: {
            water: "Monthly",
            light: "Low to Bright",
            temp: "55-85°F"
        }
    },
    {
        id: 4,
        name: "String of Pearls",
        scientific: "Senecio rowleyanus",
        price: 25.00,
        image: "/images/String of Pearls.jpg",
        tags: ["Rare"],
        category: "Rare Finds",
        rating: 4.7,
        reviews: 19,
        description: "A fast-growing succulent with trailing stems of spherical leaves. Looks stunning in a hanging basket or on a high shelf.",
        care: {
            water: "Sparely",
            light: "Bright Direct",
            temp: "70-80°F"
        }
    },
    {
        id: 5,
        name: "Pink Princess",
        scientific: "Philodendron erubescens",
        price: 85.00,
        image: "/images/Pink Princess.jpg",
        tags: ["Collector's Item", "Rare"],
        category: "Rare Finds",
        rating: 5,
        reviews: 8,
        description: "A stunning variegated philodendron with splashy pink marks on dark green leaves. A must-have for serious collectors.",
        care: {
            water: "Weekly",
            light: "Bright Indirect",
            temp: "65-80°F"
        }
    },
    {
        id: 6,
        name: "Calathea Orbifolia",
        scientific: "Goeppertia orbifolia",
        price: 38.00,
        image: "/images/Calathea Orbifolia.jpg",
        tags: ["Pet Safe"],
        category: "Pet Safe",
        rating: 4.5,
        reviews: 24,
        description: "Famous for its massive, round, striped leaves. This plant loves humidity and adds a lush, jungle feel to any room.",
        care: {
            water: "Twice Weekly",
            light: "Medium",
            temp: "65-75°F"
        }
    },
    {
        id: 7,
        name: "ZZ Plant",
        scientific: "Zamioculcas zamiifolia",
        price: 32.00,
        image: "/images/ZZ Plant.jpg",
        tags: ["Easy Care", "Low Light"],
        category: "Low Light",
        rating: 4.9,
        reviews: 96,
        description: "With glossy, dark green leaves, the ZZ plant is stylish and virtually indestructible, tolerating low light and irregular watering.",
        care: {
            water: "Monthly",
            light: "Low to Bright",
            temp: "60-75°F"
        }
    },
    {
        id: 8,
        name: "Bird of Paradise",
        scientific: "Strelitzia reginae",
        price: 55.00,
        image: "/images/Bird of Paradise.jpg",
        tags: ["Large"],
        category: "Large Trees",
        rating: 4.8,
        reviews: 51,
        description: "Bring the tropics home with large, banana-like leaves. Give it plenty of bright light to encourage rapid vertical growth.",
        care: {
            water: "Weekly",
            light: "Bright Direct",
            temp: "65-80°F"
        }
    }
];

export const ProductShowcase = ({ onAddToCart, searchQuery = "" }: { onAddToCart: (product: any) => void; searchQuery?: string }) => {
    const [activeCategory, setActiveCategory] = useState("All Plants");
    const [productsList, setProductsList] = useState(initialProducts);
    const [selectedProduct, setSelectedProduct] = useState<typeof initialProducts[0] | null>(null);

    // Fetch from backend API
    useEffect(() => {
        let isMounted = true;
        getProducts(activeCategory, searchQuery)
            .then((data) => {
                if (isMounted && Array.isArray(data) && data.length > 0) {
                    setProductsList(data);
                }
            })
            .catch(() => {
                // Keep local products list on network fallback
            });
        return () => { isMounted = false; };
    }, [activeCategory, searchQuery]);

    const filteredProducts = productsList.filter(p => {
        const matchesCategory = activeCategory === "All Plants"
            ? true
            : p.category === activeCategory || p.tags.includes(activeCategory);

        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.scientific.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

        return matchesCategory && matchesSearch;
    });

    return (
        <>
            <section id="shop" className="py-20 bg-cream">
                <div className="container mx-auto px-6 md:px-12">

                    <div className="mb-12">
                        <h2 className="font-serif text-5xl md:text-6xl text-jungle-green mb-4">
                            Our Collection
                        </h2>
                        <p className="font-sans text-gray-500 max-w-md text-lg">
                            Hand-picked for every type of plant parent.
                        </p>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex flex-wrap gap-4 mb-16 border-b border-gray-200 pb-2">

                        <div className="flex items-center gap-4 overflow-x-auto pb-4 md:pb-0 w-full no-scrollbar">
                            <span className="font-sans font-semibold text-gray-800 whitespace-nowrap mr-4">Sort By: Featured</span>
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-6 py-2 rounded-full font-sans text-sm font-semibold transition-all duration-300 whitespace-nowrap border ${activeCategory === cat
                                        ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <motion.div
                        layout
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                    >
                        <AnimatePresence>
                            {filteredProducts.map((product) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3 }}
                                    key={product.id}
                                    className="group w-full cursor-pointer"
                                    onClick={() => setSelectedProduct(product)}
                                >
                                    {/* Card Image */}
                                    <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#f0f0f0] mb-6">
                                        {product.tags.length > 0 && (
                                            <span className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm px-3 py-1.5 text-[10px] font-bold tracking-widest text-[#1a1a1a] uppercase rounded-sm shadow-sm">
                                                {product.tags[0]}
                                            </span>
                                        )}
                                        <div className="absolute top-4 right-4 z-10">
                                            <span className="bg-white/80 backdrop-blur-md p-2 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer hover:bg-white text-gray-600 hover:text-red-500">
                                                <Heart size={20} />
                                            </span>
                                        </div>

                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                                        />

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onAddToCart(product);
                                            }}
                                            className="absolute bottom-4 right-4 bg-white text-black p-3 rounded-full shadow-lg translate-y-20 group-hover:translate-y-0 transition-transform duration-300 hover:bg-[#1a472a] hover:text-white"
                                        >
                                            <ShoppingCart size={20} />
                                        </button>
                                    </div>

                                    {/* Card Info */}
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-serif text-xl font-bold text-[#1a1a1a] mb-1 group-hover:text-jungle-green transition-colors">
                                                {product.name}
                                            </h3>
                                            <p className="font-sans text-xs text-gray-500 italic">
                                                {product.scientific}
                                            </p>
                                        </div>
                                        <span className="font-sans text-lg font-semibold text-[#1a1a1a]">
                                            ${product.price.toFixed(2)}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>

                    {/* Load More */}
                    <div className="mt-16 text-center">
                        <button className="border-b-2 border-black pb-1 font-sans font-bold text-sm tracking-widest uppercase hover:text-jungle-green hover:border-jungle-green transition-colors">
                            View All Plants
                        </button>
                    </div>
                </div>
            </section>

            {/* Product Detail Modal */}
            <AnimatePresence>
                {selectedProduct && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => setSelectedProduct(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-3xl overflow-hidden w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col md:flex-row relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setSelectedProduct(null)}
                                className="absolute top-4 right-4 z-20 p-2 bg-white/50 hover:bg-white rounded-full transition-colors"
                            >
                                <X size={24} className="text-gray-800" />
                            </button>

                            {/* Left: Image */}
                            <div className="w-full md:w-1/2 bg-[#f0f0f0] relative min-h-[300px] md:min-h-full">
                                <img
                                    src={selectedProduct.image}
                                    alt={selectedProduct.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Right: Content */}
                            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col h-full overflow-y-auto">
                                <div className="flex items-center gap-2 mb-4">
                                    {selectedProduct.tags.map((tag) => (
                                        <span key={tag} className="bg-green-100 text-green-800 text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-sm">
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                <h2 className="font-serif text-4xl md:text-5xl text-[#1a1a1a] mb-2">
                                    {selectedProduct.name}
                                </h2>
                                <p className="font-sans text-gray-500 italic mb-6">
                                    {selectedProduct.scientific}
                                </p>

                                <div className="flex items-center gap-4 mb-8">
                                    <span className="font-serif text-3xl font-bold text-[#1a1a1a]">
                                        ${selectedProduct.price.toFixed(2)}
                                    </span>
                                    <div className="flex items-center gap-1 text-yellow-400">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={16}
                                                fill={i < Math.floor(selectedProduct.rating) ? "currentColor" : "none"}
                                                className={i < Math.floor(selectedProduct.rating) ? "" : "text-gray-300"}
                                            />
                                        ))}
                                        <span className="text-xs text-gray-400 font-sans ml-1">({selectedProduct.reviews})</span>
                                    </div>
                                </div>

                                <p className="font-sans text-gray-600 text-lg leading-relaxed mb-8 flex-grow">
                                    {selectedProduct.description}
                                </p>

                                <button
                                    onClick={() => {
                                        onAddToCart(selectedProduct);
                                        setSelectedProduct(null);
                                    }}
                                    className="w-full bg-[#1a1a1a] text-white py-4 rounded-xl font-sans font-bold text-lg hover:bg-black transition-colors mb-8 shadow-lg flex items-center justify-center gap-2"
                                >
                                    <ShoppingCart size={20} />
                                    Add to Cart
                                </button>

                                {/* Care Icons */}
                                <div className="grid grid-cols-3 gap-4 border-t border-gray-100 pt-8 mt-auto">
                                    <div className="flex flex-col items-center text-center">
                                        <span className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-2">
                                            <Droplets size={20} />
                                        </span>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Water</span>
                                        <span className="text-sm font-semibold text-gray-700 mt-1">{selectedProduct.care.water}</span>
                                    </div>
                                    <div className="flex flex-col items-center text-center">
                                        <span className="w-12 h-12 rounded-full bg-yellow-50 text-yellow-500 flex items-center justify-center mb-2">
                                            <Sun size={20} />
                                        </span>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Light</span>
                                        <span className="text-sm font-semibold text-gray-700 mt-1">{selectedProduct.care.light}</span>
                                    </div>
                                    <div className="flex flex-col items-center text-center">
                                        <span className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-2">
                                            <Thermometer size={20} />
                                        </span>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Temp</span>
                                        <span className="text-sm font-semibold text-gray-700 mt-1">{selectedProduct.care.temp}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
