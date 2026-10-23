import mongoose from 'mongoose';

const workshopSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: String,
        required: true
    },
    month: {
        type: String,
        default: 'Feb'
    },
    day: {
        type: String,
        default: '12'
    },
    time: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String
    },
    maxSeats: {
        type: Number,
        default: 20
    },
    registeredCount: {
        type: Number,
        default: 0
    },
    attendees: [{
        name: String,
        email: String,
        tickets: { type: Number, default: 1 },
        registeredAt: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true
});

export const Workshop = mongoose.model('Workshop', workshopSchema);
