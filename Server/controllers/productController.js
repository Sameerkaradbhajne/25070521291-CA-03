import { Product } from '../models/Product.js';
import { initialProducts } from '../seed/seedData.js';

// @desc    Get all products with optional filtering and search
// @route   GET /api/products
export const getProducts = async (req, res) => {
    try {
        const { category, search } = req.query;
        let query = {};

        if (category && category !== 'All Plants') {
            query.$or = [
                { category: category },
                { tags: category }
            ];
        }

        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query.$or = [
                { name: searchRegex },
                { scientific: searchRegex },
                { tags: searchRegex },
                { category: searchRegex }
            ];
        }

        let products = await Product.find(query).sort({ id: 1 });

        // Graceful fallback if database was empty or not yet seeded
        if (products.length === 0 && !search && (!category || category === 'All Plants')) {
            products = initialProducts;
        }

        res.json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        // Fallback to in-memory initial products to ensure 100% uptime for frontend
        let fallback = initialProducts;
        if (req.query.category && req.query.category !== 'All Plants') {
            fallback = fallback.filter(p => p.category === req.query.category || p.tags.includes(req.query.category));
        }
        if (req.query.search) {
            const s = req.query.search.toLowerCase();
            fallback = fallback.filter(p =>
                p.name.toLowerCase().includes(s) ||
                p.scientific.toLowerCase().includes(s) ||
                p.tags.some(t => t.toLowerCase().includes(s))
            );
        }
        res.json({
            success: true,
            count: fallback.length,
            data: fallback,
            note: 'Retrieved with fallback handler'
        });
    }
};

// @desc    Get single product by numeric id
// @route   GET /api/products/:id
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findOne({ id: Number(req.params.id) });
        if (!product) {
            const fallback = initialProducts.find(p => p.id === Number(req.params.id));
            if (fallback) {
                return res.json({ success: true, data: fallback });
            }
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create new product
// @route   POST /api/products
export const createProduct = async (req, res) => {
    try {
        const { name, scientific, price, image, category, tags, description, care } = req.body;
        if (!name || !scientific || !price || !category) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields' });
        }

        // Generate next ID
        const maxProduct = await Product.findOne().sort({ id: -1 });
        const nextId = maxProduct ? maxProduct.id + 1 : 1;

        const newProduct = await Product.create({
            id: nextId,
            name,
            scientific,
            price,
            image: image || '/images/Monstera Deliciosa.jpg',
            category,
            tags: tags || [],
            description: description || 'Beautiful healthy plant for home or office.',
            care: care || { water: 'Weekly', light: 'Bright Indirect', temp: '65-80°F' }
        });

        res.status(201).json({ success: true, data: newProduct });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update product
// @route   PUT /api/products/:id
export const updateProduct = async (req, res) => {
    try {
        const product = await Product.findOneAndUpdate(
            { id: Number(req.params.id) },
            req.body,
            { new: true, runValidators: true }
        );
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findOneAndDelete({ id: Number(req.params.id) });
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.json({ success: true, message: 'Product removed successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
