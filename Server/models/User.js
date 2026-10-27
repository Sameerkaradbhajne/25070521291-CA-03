import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,          // Unique index — prevents duplicate registrations including concurrent requests
        trim: true,
        lowercase: true,       // Normalise email on save
        maxlength: [254, 'Email address is too long']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        select: false          // Never return password hash in queries unless explicitly asked
    },
    role: {
        type: String,
        enum: ['customer', 'admin'],
        default: 'customer'    // Users cannot set their own role via registration
    }
}, {
    timestamps: true
});

// Hash password before saving (only when modified)
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare submitted password to stored hash
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', userSchema);
