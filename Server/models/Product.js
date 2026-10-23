import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
    },
    scientific: {
        type: String,
        required: [true, 'Scientific name is required'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: 0
    },
    image: {
        type: String,
        required: [true, 'Image URL is required']
    },
    tags: [{
        type: String
    }],
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['All Plants', 'Pet Safe', 'Low Light', 'Rare Finds', 'Large Trees']
    },
    rating: {
        type: Number,
        default: 5,
        min: 0,
        max: 5
    },
    reviews: {
        type: Number,
        default: 0
    },
    description: {
        type: String,
        required: true
    },
    care: {
        water: { type: String, default: 'Weekly' },
        light: { type: String, default: 'Bright Indirect' },
        temp: { type: String, default: '65-80°F' }
    },
    inStock: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

export const Product = mongoose.model('Product', productSchema);
