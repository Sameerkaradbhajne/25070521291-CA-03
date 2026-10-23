import { Consultation } from '../models/Consultation.js';

const memoryConsultations = [];

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

        try {
            const consultation = await Consultation.create(consultationData);
            return res.status(201).json({
                success: true,
                message: `Booking received! Our ${serviceType} specialist will contact you at ${email}.`,
                data: consultation
            });
        } catch (dbErr) {
            consultationData._id = 'mem_c_' + Date.now();
            consultationData.createdAt = new Date().toISOString();
            memoryConsultations.unshift(consultationData);
            return res.status(201).json({
                success: true,
                message: `Booking received! Our ${serviceType} specialist will contact you at ${email}.`,
                data: consultationData
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all booked consultations
// @route   GET /api/consultations
export const getConsultations = async (req, res) => {
    try {
        let list = await Consultation.find().sort({ createdAt: -1 });
        if (list.length === 0 && memoryConsultations.length > 0) {
            list = memoryConsultations;
        }
        res.json({ success: true, count: list.length, data: list });
    } catch (error) {
        res.json({ success: true, count: memoryConsultations.length, data: memoryConsultations });
    }
};
