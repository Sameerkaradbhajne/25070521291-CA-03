import { Consultation } from '../models/Consultation.js';

// @desc    Book a plant service consultation
// @route   POST /api/consultations
export const bookConsultation = async (req, res) => {
    try {
        const { serviceType, clientName, email, phone, preferredDate, notes } = req.body;

        if (!serviceType || !clientName || !email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide service type, your name, and email.'
            });
        }

        const consultationData = {
            serviceType,
            clientName,
            email,
            phone: phone || '',
            preferredDate: preferredDate || new Date(),
            notes: notes || '',
            status: 'Pending'
        };

        const consultation = await Consultation.create(consultationData);
        return res.status(201).json({
            success: true,
            message: `Booking received! Our ${serviceType} specialist will contact you at ${email}.`,
            data: consultation
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to record consultation in database: ' + error.message });
    }
};

// @desc    Get all booked consultations (Admin only)
// @route   GET /api/consultations
export const getConsultations = async (req, res) => {
    try {
        const list = await Consultation.find().sort({ createdAt: -1 });
        res.json({ success: true, count: list.length, data: list });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to retrieve consultations: ' + error.message });
    }
};
