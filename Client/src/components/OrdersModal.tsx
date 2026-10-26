import { useState, useEffect } from 'react';
import {
    X,
    Package,
    Clock,
    CheckCircle2,
    AlertCircle,
    FileSpreadsheet,
    Download,
    RefreshCw,
    Filter,
    Users,
    DollarSign,
    Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getOrders, getExcelStatus, syncExcelData, getExcelDownloadUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface OrdersModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const OrdersModal = ({ isOpen, onClose }: OrdersModalProps) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'orders' | 'excel'>('orders');
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Excel state
    const [excelMeta, setExcelMeta] = useState<any>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Filters
    const [statusFilter, setStatusFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        if (isOpen && user?.role === 'admin') {
            loadOrders();
            loadExcelMeta();
        }
    }, [isOpen, user]);

    const loadOrders = () => {
        setIsLoading(true);
        getOrders()
            .then(data => {
                setOrders(data || []);
                setIsLoading(false);
            })
            .catch(err => {
                console.error('Failed to load orders:', err);
                setError('Failed to fetch orders from database');
                setIsLoading(false);
            });
    };

    const loadExcelMeta = () => {
        getExcelStatus()
            .then(meta => setExcelMeta(meta))
            .catch(() => {});
    };

    const handleSync = async () => {
        setIsSyncing(true);
        setActionMessage(null);
        try {
            const res = await syncExcelData();
            setExcelMeta(res.data);
            setActionMessage({ type: 'success', text: 'Excel workbook synchronized with latest database records!' });
            loadOrders();
        } catch (err: any) {
            setActionMessage({ type: 'error', text: 'Sync failed: ' + (err.message || 'Server error') });
        } finally {
            setIsSyncing(false);
            setTimeout(() => setActionMessage(null), 4000);
        }
    };

    const handleDownload = (sheet: string = 'all') => {
        setActionMessage(null);
        try {
            const downloadUrl = getExcelDownloadUrl(sheet, statusFilter, startDate, endDate);
            
            // Trigger direct browser download
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', sheet === 'all' ? 'Flexi_Credit_Data.xlsx' : `Flexi_Credit_${sheet}_Report.xlsx`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            const sheetName = sheet === 'all' ? 'All Data Workbook' : sheet.charAt(0).toUpperCase() + sheet.slice(1);
            setActionMessage({ type: 'success', text: `Downloaded "${sheetName}" (.xlsx) successfully!` });
            setTimeout(() => setActionMessage(null), 4000);
        } catch (err: any) {
            setActionMessage({ type: 'error', text: 'Download error: ' + err.message });
        }
    };

    if (!isOpen) return null;

    if (user?.role !== 'admin') {
        return (
            <AnimatePresence>
                <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl text-center"
                    >
                        <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
                            <AlertCircle size={28} />
                        </div>
                        <h3 className="font-serif text-xl font-bold text-gray-900 mb-1">Administrator Access Required</h3>
                        <p className="text-xs text-gray-500 mb-5">
                            Customer orders and Excel management reports are protected and require verified administrator credentials.
                        </p>
                        <button
                            onClick={onClose}
                            className="px-6 py-2 rounded-full bg-jungle-green text-white text-xs font-semibold hover:bg-opacity-90 transition-colors"
                        >
                            Close
                        </button>
                    </motion.div>
                </div>
            </AnimatePresence>
        );
    }

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl relative flex flex-col"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-50 text-jungle-green flex items-center justify-center">
                                {activeTab === 'orders' ? <Package size={22} /> : <FileSpreadsheet size={22} />}
                            </div>
                            <div>
                                <h2 className="font-serif text-2xl font-bold text-gray-900">
                                    {activeTab === 'orders' ? 'Database Orders' : 'Excel Reports & Auto-Sync'}
                                </h2>
                                <p className="text-xs text-gray-400">Flexi Credit CA • Management Dashboard</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Tabs Switcher */}
                            <div className="bg-gray-100 p-1 rounded-xl flex items-center gap-1">
                                <button
                                    onClick={() => setActiveTab('orders')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                        activeTab === 'orders'
                                            ? 'bg-white text-jungle-green shadow-sm'
                                            : 'text-gray-500 hover:text-gray-800'
                                    }`}
                                >
                                    Orders ({orders.length})
                                </button>
                                <button
                                    onClick={() => setActiveTab('excel')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                                        activeTab === 'excel'
                                            ? 'bg-white text-jungle-green shadow-sm'
                                            : 'text-gray-500 hover:text-gray-800'
                                    }`}
                                >
                                    <FileSpreadsheet size={14} />
                                    Excel Reports
                                </button>
                            </div>

                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors ml-2"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Notification Toast */}
                    {actionMessage && (
                        <div
                            className={`px-6 py-2.5 text-xs font-medium flex items-center gap-2 ${
                                actionMessage.type === 'success'
                                    ? 'bg-green-50 text-green-800 border-b border-green-100'
                                    : 'bg-red-50 text-red-800 border-b border-red-100'
                            }`}
                        >
                            {actionMessage.type === 'success' ? (
                                <CheckCircle2 size={16} className="text-green-600" />
                            ) : (
                                <AlertCircle size={16} className="text-red-600" />
                            )}
                            {actionMessage.text}
                        </div>
                    )}

                    {/* Tab 1: Orders */}
                    {activeTab === 'orders' && (
                        <div className="p-6 overflow-y-auto flex-1 space-y-4">
                            {isLoading ? (
                                <div className="text-center py-12 text-gray-400">
                                    <Clock size={36} className="animate-spin mx-auto mb-3 text-jungle-green opacity-70" />
                                    <p>Querying MongoDB for orders...</p>
                                </div>
                            ) : error && orders.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <AlertCircle size={36} className="mx-auto mb-3 text-amber-500" />
                                    <p>{error}</p>
                                </div>
                            ) : orders.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">
                                    <Package size={44} className="mx-auto mb-3 opacity-30" />
                                    <p className="font-sans text-base">No orders in database yet.</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Place an order using the checkout button to see it saved in MongoDB and auto-recorded in Excel.
                                    </p>
                                </div>
                            ) : (
                                orders.map((order, idx) => (
                                    <div
                                        key={order._id || idx}
                                        className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-gray-300 transition-colors"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <span className="font-mono text-xs font-bold text-jungle-green bg-green-100/60 px-2.5 py-1 rounded">
                                                    {order.orderNumber || 'UJ-ORDER'}
                                                </span>
                                                <p className="text-xs text-gray-500 mt-1.5">
                                                    Customer: <strong className="text-gray-800">{order.customer?.firstName} {order.customer?.lastName}</strong> ({order.customer?.city})
                                                </p>
                                                {order.customer?.email && (
                                                    <p className="text-[11px] text-gray-400">{order.customer.email}</p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <span className="font-serif font-bold text-lg text-gray-900 block">
                                                    ${Number(order.total || 0).toFixed(2)}
                                                </span>
                                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                                                    <CheckCircle2 size={12} /> {order.status || 'Confirmed'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Items List */}
                                        <div className="border-t border-gray-200/60 pt-2.5 mt-2 space-y-1.5">
                                            {order.items?.map((item: any, i: number) => (
                                                <div key={i} className="flex justify-between items-center text-xs text-gray-600">
                                                    <span>• {item.name} × {item.quantity}</span>
                                                    <span className="font-mono">${(item.price * item.quantity).toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Tab 2: Excel Reports */}
                    {activeTab === 'excel' && (
                        <div className="p-6 overflow-y-auto flex-1 space-y-6">
                            {/* Summary Card */}
                            <div className="bg-gradient-to-br from-[#1a472a] to-[#0f2e1a] text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <span className="bg-white/20 text-white text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full inline-block mb-2">
                                            Auto-Synchronized Workbook
                                        </span>
                                        <h3 className="font-serif text-2xl font-bold flex items-center gap-2">
                                            <FileSpreadsheet size={24} /> Flexi_Credit_Data.xlsx
                                        </h3>
                                        <p className="text-xs text-white/70 mt-1">
                                            Contains 5 synchronized worksheets: Orders, Customers, Products, Payments, and Status History.
                                        </p>
                                        {excelMeta && (
                                            <div className="flex items-center gap-4 mt-3 text-xs text-white/80 font-mono">
                                                <span>Size: {excelMeta.sizeKb || '11'} KB</span>
                                                <span>•</span>
                                                <span>
                                                    Last Updated: {excelMeta.lastModified ? new Date(excelMeta.lastModified).toLocaleTimeString() : 'Just now'}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap md:flex-col gap-2">
                                        <button
                                            onClick={() => handleDownload('all')}
                                            className="bg-white text-jungle-green px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-gray-100 transition-colors shadow flex items-center gap-2"
                                        >
                                            <Download size={16} />
                                            Download All Data (Excel)
                                        </button>
                                        <button
                                            onClick={handleSync}
                                            disabled={isSyncing}
                                            className="bg-white/10 text-white border border-white/20 px-4 py-2 rounded-xl font-medium text-xs hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
                                            {isSyncing ? 'Syncing...' : 'Re-sync with DB'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Filters Bar */}
                            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                                    <Filter size={14} /> Report Filters (Optional)
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-[11px] text-gray-500 mb-1">Order Status</label>
                                        <select
                                            value={statusFilter}
                                            onChange={e => setStatusFilter(e.target.value)}
                                            className="w-full border border-gray-200 rounded-lg p-2 text-xs bg-white focus:outline-none focus:border-jungle-green"
                                        >
                                            <option value="">All Statuses</option>
                                            <option value="Confirmed">Confirmed</option>
                                            <option value="Processing">Processing</option>
                                            <option value="Shipped">Shipped</option>
                                            <option value="Delivered">Delivered</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] text-gray-500 mb-1">Start Date</label>
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={e => setStartDate(e.target.value)}
                                            className="w-full border border-gray-200 rounded-lg p-2 text-xs bg-white focus:outline-none focus:border-jungle-green"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] text-gray-500 mb-1">End Date</label>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={e => setEndDate(e.target.value)}
                                            className="w-full border border-gray-200 rounded-lg p-2 text-xs bg-white focus:outline-none focus:border-jungle-green"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Specific Sheet Downloads */}
                            <div>
                                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                    <Layers size={14} /> Download Specific Worksheets
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {/* Sheet 1: Orders */}
                                    <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between hover:border-jungle-green transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-green-50 text-jungle-green flex items-center justify-center">
                                                <Package size={20} />
                                            </div>
                                            <div>
                                                <h5 className="font-bold text-sm text-gray-800">Orders Worksheet</h5>
                                                <p className="text-[11px] text-gray-400">Order ID, Items, Totals & Address</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDownload('orders')}
                                            className="p-2.5 text-jungle-green hover:bg-green-50 rounded-lg transition-colors border border-green-200"
                                            title="Download Orders Sheet"
                                        >
                                            <Download size={18} />
                                        </button>
                                    </div>

                                    {/* Sheet 2: Customers */}
                                    <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between hover:border-jungle-green transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                                                <Users size={20} />
                                            </div>
                                            <div>
                                                <h5 className="font-bold text-sm text-gray-800">Customers Worksheet</h5>
                                                <p className="text-[11px] text-gray-400">Customer ID, Orders, Spent & Recency</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDownload('customers')}
                                            className="p-2.5 text-blue-700 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
                                            title="Download Customers Sheet"
                                        >
                                            <Download size={18} />
                                        </button>
                                    </div>

                                    {/* Sheet 3: Products */}
                                    <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between hover:border-jungle-green transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                                                <Layers size={20} />
                                            </div>
                                            <div>
                                                <h5 className="font-bold text-sm text-gray-800">Products Worksheet</h5>
                                                <p className="text-[11px] text-gray-400">Product IDs, Categories, Prices & Stock</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDownload('products')}
                                            className="p-2.5 text-amber-700 hover:bg-amber-50 rounded-lg transition-colors border border-amber-200"
                                            title="Download Products Sheet"
                                        >
                                            <Download size={18} />
                                        </button>
                                    </div>

                                    {/* Sheet 4: Payments */}
                                    <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between hover:border-jungle-green transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                                                <DollarSign size={20} />
                                            </div>
                                            <div>
                                                <h5 className="font-bold text-sm text-gray-800">Payments Worksheet</h5>
                                                <p className="text-[11px] text-gray-400">Masked Cards, TXN Refs & Amounts</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDownload('payments')}
                                            className="p-2.5 text-purple-700 hover:bg-purple-50 rounded-lg transition-colors border border-purple-200"
                                            title="Download Payments Sheet"
                                        >
                                            <Download size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
