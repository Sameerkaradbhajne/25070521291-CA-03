import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 8000
});

// Attach JWT token if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('urban_token') || sessionStorage.getItem('urban_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Authentication
export interface UserData {
    _id: string;
    name: string;
    email: string;
    role: string;
    token?: string;
}

export const loginUserApi = async (credentials: { email: string; password: string }) => {
    const response = await api.post('/auth/login', credentials, { timeout: 3000 });
    return response.data;
};

export const registerUserApi = async (credentials: { name: string; email: string; password: string }) => {
    const response = await api.post('/auth/register', credentials, { timeout: 3000 });
    return response.data;
};

export const logoutUserApi = async () => {
    const response = await api.post('/auth/logout');
    return response.data;
};

export const getCurrentUserApi = async () => {
    const response = await api.get('/auth/me');
    return response.data;
};

// Products
export const getProducts = async (category?: string, search?: string) => {
    try {
        const params: Record<string, string> = {};
        if (category && category !== 'All Plants') params.category = category;
        if (search) params.search = search;

        const response = await api.get('/products', { params });
        return response.data.data;
    } catch (error) {
        console.warn('API error fetching products, falling back locally:', error);
        throw error;
    }
};

export const getProductById = async (id: number) => {
    const response = await api.get(`/products/${id}`);
    return response.data.data;
};

// Orders
export interface ShippingDetails {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    zipCode: string;
}

export interface PaymentDetails {
    cardNumber?: string;
    expiry?: string;
    cvc?: string;
}

export interface OrderItemData {
    id: number;
    name: string;
    price: number;
    quantity: number;
    image: string;
}

export interface CreateOrderPayload {
    customer: ShippingDetails;
    items: OrderItemData[];
    total: number;
    payment?: PaymentDetails;
}

export const createOrder = async (payload: CreateOrderPayload) => {
    const response = await api.post('/orders', payload);
    return response.data;
};

export const getOrders = async () => {
    const response = await api.get('/orders');
    return response.data.data;
};

// Consultations / Services
export interface ConsultationBooking {
    serviceType: string;
    clientName: string;
    email: string;
    phone?: string;
    preferredDate?: string;
    notes?: string;
}

export const bookConsultation = async (booking: ConsultationBooking) => {
    const response = await api.post('/consultations', booking);
    return response.data;
};

// Workshops
export const getWorkshops = async () => {
    const response = await api.get('/workshops');
    return response.data.data;
};

export const registerWorkshop = async (payload: { workshopTitle: string; name: string; email: string; tickets?: number }) => {
    const response = await api.post('/workshops/register', payload);
    return response.data;
};

// Newsletter
export const subscribeNewsletter = async (email: string) => {
    const response = await api.post('/newsletter/subscribe', { email });
    return response.data;
};

// Excel Reports
export const getExcelStatus = async () => {
    const response = await api.get('/excel/status');
    return response.data.data;
};

export const syncExcelData = async () => {
    const response = await api.post('/excel/sync');
    return response.data;
};

export const getExcelDownloadUrl = (sheet = 'all', status = '', startDate = '', endDate = '') => {
    const params = new URLSearchParams();
    if (sheet && sheet !== 'all') params.append('sheet', sheet);
    if (status) params.append('status', status);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const token = localStorage.getItem('urban_token') || sessionStorage.getItem('urban_token');
    if (token) params.append('token', token);

    const queryString = params.toString();
    return `${API_BASE_URL}/excel/download${queryString ? '?' + queryString : ''}`;
};

export default api;
