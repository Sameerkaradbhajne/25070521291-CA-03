import mongoose from 'mongoose';

const consultationSchema = new mongoose.Schema({
    serviceType: {
        type: String,
        required: true,
        enum: ['Interior Styling', 'Repotting Station', 'The Plant Doctor']
    },
    clientName: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        trim: true
    },
    preferredDate: {
        type: Date
    },
    notes: {
        type: String
    },
    status: {
        type: String,
        enum: ['Pending', 'Scheduled', 'Completed', 'Cancelled'],
        default: 'Pending'
    }
}, {
    timestamps: true
});

export const Consultation = mongoose.model('Consultation', consultationSchema);
