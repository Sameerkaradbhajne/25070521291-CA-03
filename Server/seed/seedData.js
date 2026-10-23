import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Product } from '../models/Product.js';
import { Workshop } from '../models/Workshop.js';
import { connectDB } from '../config/db.js';

dotenv.config();

export const initialProducts = [
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
        },
        inStock: true
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
        },
        inStock: true
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
        },
        inStock: true
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
        },
        inStock: true
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
        },
        inStock: true
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
        },
        inStock: true
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
        },
        inStock: true
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
        },
        inStock: true
    }
];

export const initialWorkshops = [
    {
        title: "Terrarium Building 101",
        date: "Feb 12",
        month: "Feb",
        day: "12",
        time: "2:00 PM - 4:00 PM",
        price: 45,
        description: "Learn to build and balance your own self-sustaining tropical terrarium with hand-picked mosses and miniature plants.",
        maxSeats: 20
    },
    {
        title: "Propagating Rare Aroids",
        date: "Feb 18",
        month: "Feb",
        day: "18",
        time: "6:00 PM - 7:30 PM",
        price: 30,
        description: "Master stem cuttings, air layering, and rooting hormones to multiply your rare philodendrons and monsteras.",
        maxSeats: 15
    }
];

export const seedDatabase = async () => {
    try {
        const isConnected = await connectDB();
        if (!isConnected) {
            console.warn('[Seed] Skipping database seed: MongoDB is not connected.');
            return;
        }

        const count = await Product.countDocuments();
        if (count === 0) {
            console.log('[Seed] Populating initial products...');
            await Product.insertMany(initialProducts);
            console.log(`[Seed] Added ${initialProducts.length} products to database.`);
        } else {
            console.log(`[Seed] Products already present (${count} items).`);
        }

        const workshopCount = await Workshop.countDocuments();
        if (workshopCount === 0) {
            console.log('[Seed] Populating initial workshops...');
            await Workshop.insertMany(initialWorkshops);
            console.log(`[Seed] Added ${initialWorkshops.length} workshops to database.`);
        } else {
            console.log(`[Seed] Workshops already present (${workshopCount} items).`);
        }
    } catch (err) {
        console.error('[Seed Error]:', err.message);
    }
};

// If run directly: node seed/seedData.js
if (process.argv[1]?.endsWith('seedData.js')) {
    seedDatabase().then(() => {
        console.log('[Seed] Completed seed script.');
        process.exit(0);
    });
}
