import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Customer } from '../models/Customer.js';
import { initialProducts } from '../seed/seedData.js';
import { memoryOrders } from '../controllers/orderController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Primary Excel file locations
const EXCEL_FILE_PATH = path.resolve(__dirname, '../Flexi_Credit_Data.xlsx');
const ROOT_EXCEL_PATH = path.resolve(__dirname, '../../Flexi_Credit_Data.xlsx');

// Mutex queue to ensure concurrent updates do not corrupt the workbook
let isSyncing = false;
let pendingSync = false;

// Styling constants
const HEADER_FILL = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1A472A' } // Jungle Green
};

const HEADER_FONT = {
    name: 'Calibri',
    size: 11,
    bold: true,
    color: { argb: 'FFFFFFFF' }
};

const BORDER_STYLE = {
    top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
    left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
    bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
    right: { style: 'thin', color: { argb: 'FFE0E0E0' } }
};

const ZEBRA_FILL = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF9FBF9' }
};

/**
 * Automatically fetch all project data and generate the Excel workbook
 */
export const syncExcelWorkbook = async (customOrders = []) => {
    if (isSyncing) {
        pendingSync = true;
        return EXCEL_FILE_PATH;
    }

    isSyncing = true;
    try {
        // 1. Gather all data from MongoDB with graceful memory fallback
        let orders = [];
        let products = [];
        let customers = [];

        // Check if MongoDB connection is active
        if (mongoose.connection.readyState === 1) {
            try {
                orders = await Order.find().maxTimeMS(3000).sort({ createdAt: -1 });
            } catch {
                orders = [];
            }
        }

        // Merge with memory orders and customOrders without duplicates
        const seenOrderNumbers = new Set(orders.map(o => o.orderNumber));
        [...customOrders, ...(memoryOrders || [])].forEach(mo => {
            if (mo && mo.orderNumber && !seenOrderNumbers.has(mo.orderNumber)) {
                orders.push(mo);
                seenOrderNumbers.add(mo.orderNumber);
            }
        });

        try {
            products = await Product.find().sort({ id: 1 });
        } catch {
            products = [];
        }

        if (products.length === 0) {
            products = initialProducts;
        }

        try {
            customers = await Customer.find().sort({ createdAt: -1 });
        } catch {
            customers = [];
        }

        // If no standalone customers found, aggregate from orders
        const customerMap = new Map();
        customers.forEach(c => customerMap.set(c.email || c.name, c));

        orders.forEach(order => {
            const key = order.customer?.email || `${order.customer?.firstName} ${order.customer?.lastName}`;
            const existing = customerMap.get(key);
            const total = Number(order.total || 0);
            const date = new Date(order.createdAt || Date.now());

            if (existing) {
                existing.totalOrders = (existing.totalOrders || 1) + 1;
                existing.totalSpent = (existing.totalSpent || 0) + total;
                if (!existing.lastOrderDate || new Date(existing.lastOrderDate) < date) {
                    existing.lastOrderDate = date;
                }
            } else {
                customerMap.set(key, {
                    customerId: order.customer?.customerId || 'CUST-' + Math.floor(1000 + Math.random() * 9000),
                    name: `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim() || 'Guest Customer',
                    email: order.customer?.email || 'N/A',
                    phone: order.customer?.phone || 'N/A',
                    registrationDate: date,
                    totalOrders: 1,
                    totalSpent: total,
                    lastOrderDate: date
                });
            }
        });

        const allCustomers = Array.from(customerMap.values());

        // 2. Build ExcelJS Workbook
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Urban Jungle Store (Flexi Credit CA)';
        workbook.lastModifiedBy = 'Flexi Credit Backend System';
        workbook.created = new Date();
        workbook.modified = new Date();

        // ==========================================
        // SHEET 1: ORDERS
        // ==========================================
        const orderSheet = workbook.addWorksheet('Orders', {
            views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }]
        });

        orderSheet.columns = [
            { header: 'Order ID', key: 'orderId', width: 16 },
            { header: 'Order Date & Time', key: 'orderDate', width: 22 },
            { header: 'Customer ID', key: 'customerId', width: 16 },
            { header: 'Customer Name', key: 'customerName', width: 22 },
            { header: 'Customer Email', key: 'customerEmail', width: 26 },
            { header: 'Customer Phone', key: 'customerPhone', width: 18 },
            { header: 'Product ID', key: 'productId', width: 14 },
            { header: 'Product Name', key: 'productName', width: 24 },
            { header: 'Quantity', key: 'quantity', width: 12 },
            { header: 'Unit Price', key: 'unitPrice', width: 14 },
            { header: 'Subtotal', key: 'subtotal', width: 14 },
            { header: 'Discount', key: 'discount', width: 14 },
            { header: 'Tax', key: 'tax', width: 12 },
            { header: 'Shipping Charges', key: 'shippingCharges', width: 18 },
            { header: 'Final Order Amount', key: 'finalTotal', width: 20 },
            { header: 'Payment Method', key: 'paymentMethod', width: 18 },
            { header: 'Payment Status', key: 'paymentStatus', width: 16 },
            { header: 'Order Status', key: 'orderStatus', width: 16 },
            { header: 'Shipping Address', key: 'shippingAddress', width: 36 }
        ];

        let orderRowIndex = 0;
        orders.forEach(order => {
            const customerName = `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim() || 'N/A';
            const fullAddress = `${order.customer?.address || ''}, ${order.customer?.city || ''} ${order.customer?.zipCode || ''}`.trim();
            const orderDate = new Date(order.createdAt || Date.now());

            const items = order.items && order.items.length > 0 ? order.items : [
                { id: 1, name: 'General Plant Item', price: order.total || 0, quantity: 1 }
            ];

            items.forEach((item, itemIdx) => {
                orderRowIndex++;
                const itemSubtotal = (Number(item.price) || 0) * (Number(item.quantity) || 1);

                const row = orderSheet.addRow({
                    orderId: order.orderNumber || 'UJ-ORDER',
                    orderDate: orderDate.toISOString().replace('T', ' ').substring(0, 19),
                    customerId: order.customer?.customerId || 'CUST-1001',
                    customerName,
                    customerEmail: order.customer?.email || 'customer@example.com',
                    customerPhone: order.customer?.phone || 'N/A',
                    productId: item.id || 'N/A',
                    productName: item.name || 'Plant Item',
                    quantity: item.quantity || 1,
                    unitPrice: Number(item.price) || 0,
                    subtotal: itemSubtotal,
                    discount: itemIdx === 0 ? Number(order.discount || 0) : 0,
                    tax: itemIdx === 0 ? Number(order.tax || 0) : 0,
                    shippingCharges: itemIdx === 0 ? Number(order.shippingCharges || 0) : 0,
                    finalTotal: itemIdx === 0 ? Number(order.total || 0) : null,
                    paymentMethod: order.payment?.method || 'Credit Card',
                    paymentStatus: order.payment?.status || 'Paid',
                    orderStatus: order.status || 'Confirmed',
                    shippingAddress: fullAddress || 'Online Order'
                });

                if (orderRowIndex % 2 === 0) {
                    row.eachCell(cell => { cell.fill = ZEBRA_FILL; });
                }
            });
        });

        // ==========================================
        // SHEET 2: CUSTOMERS
        // ==========================================
        const customerSheet = workbook.addWorksheet('Customers', {
            views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }]
        });

        customerSheet.columns = [
            { header: 'Customer ID', key: 'customerId', width: 16 },
            { header: 'Customer Name', key: 'name', width: 24 },
            { header: 'Email', key: 'email', width: 28 },
            { header: 'Phone Number', key: 'phone', width: 18 },
            { header: 'Registration Date', key: 'registrationDate', width: 22 },
            { header: 'Total Number of Orders', key: 'totalOrders', width: 22 },
            { header: 'Total Amount Spent', key: 'totalSpent', width: 20 },
            { header: 'Most Recent Order Date', key: 'lastOrderDate', width: 24 }
        ];

        allCustomers.forEach((cust, idx) => {
            const row = customerSheet.addRow({
                customerId: cust.customerId || `CUST-${1000 + idx}`,
                name: cust.name,
                email: cust.email,
                phone: cust.phone || 'N/A',
                registrationDate: new Date(cust.registrationDate || Date.now()).toISOString().substring(0, 10),
                totalOrders: cust.totalOrders || 0,
                totalSpent: Number(cust.totalSpent || 0),
                lastOrderDate: cust.lastOrderDate ? new Date(cust.lastOrderDate).toISOString().replace('T', ' ').substring(0, 19) : 'N/A'
            });

            if (idx % 2 === 1) {
                row.eachCell(cell => { cell.fill = ZEBRA_FILL; });
            }
        });

        // ==========================================
        // SHEET 3: PRODUCTS
        // ==========================================
        const productSheet = workbook.addWorksheet('Products', {
            views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }]
        });

        productSheet.columns = [
            { header: 'Product ID', key: 'id', width: 14 },
            { header: 'Product Name', key: 'name', width: 26 },
            { header: 'Scientific Name', key: 'scientific', width: 26 },
            { header: 'Category', key: 'category', width: 18 },
            { header: 'Unit Price', key: 'price', width: 14 },
            { header: 'Available Stock', key: 'stock', width: 16 },
            { header: 'Product Status', key: 'status', width: 16 }
        ];

        products.forEach((prod, idx) => {
            const row = productSheet.addRow({
                id: prod.id,
                name: prod.name,
                scientific: prod.scientific || '',
                category: prod.category,
                price: Number(prod.price) || 0,
                stock: prod.inStock !== false ? 50 : 0,
                status: prod.inStock !== false ? 'Active (In Stock)' : 'Out of Stock'
            });

            if (idx % 2 === 1) {
                row.eachCell(cell => { cell.fill = ZEBRA_FILL; });
            }
        });

        // ==========================================
        // SHEET 4: PAYMENTS
        // ==========================================
        const paymentSheet = workbook.addWorksheet('Payments', {
            views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }]
        });

        paymentSheet.columns = [
            { header: 'Payment ID', key: 'paymentId', width: 18 },
            { header: 'Order ID', key: 'orderId', width: 16 },
            { header: 'Customer ID', key: 'customerId', width: 16 },
            { header: 'Payment Date', key: 'paymentDate', width: 22 },
            { header: 'Payment Method', key: 'method', width: 22 },
            { header: 'Payment Amount', key: 'amount', width: 16 },
            { header: 'Payment Status', key: 'status', width: 16 },
            { header: 'Transaction Reference', key: 'txRef', width: 24 }
        ];

        orders.forEach((order, idx) => {
            const row = paymentSheet.addRow({
                paymentId: order.payment?.paymentId || `PAY-${order.orderNumber ? order.orderNumber.replace('UJ-', '') : 100000 + idx}`,
                orderId: order.orderNumber || 'UJ-ORDER',
                customerId: order.customer?.customerId || 'CUST-1001',
                paymentDate: new Date(order.createdAt || Date.now()).toISOString().replace('T', ' ').substring(0, 19),
                paymentMethod: `${order.payment?.method || 'Credit Card'} (•••• ${order.payment?.cardLast4 || '4242'})`,
                amount: Number(order.total || 0),
                status: order.payment?.status || 'Paid',
                txRef: order.payment?.transactionId || `TXN-${90000000 + idx}`
            });

            if (idx % 2 === 1) {
                row.eachCell(cell => { cell.fill = ZEBRA_FILL; });
            }
        });

        // ==========================================
        // SHEET 5: ORDER STATUS HISTORY
        // ==========================================
        const historySheet = workbook.addWorksheet('Order Status History', {
            views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }]
        });

        historySheet.columns = [
            { header: 'Order ID', key: 'orderId', width: 16 },
            { header: 'Previous Status', key: 'prevStatus', width: 18 },
            { header: 'New Status', key: 'newStatus', width: 18 },
            { header: 'Change Date & Time', key: 'changeDate', width: 22 },
            { header: 'Updated By', key: 'updatedBy', width: 24 }
        ];

        let historyRowIdx = 0;
        orders.forEach(order => {
            if (order.statusHistory && order.statusHistory.length > 0) {
                order.statusHistory.forEach(h => {
                    historyRowIdx++;
                    const row = historySheet.addRow({
                        orderId: order.orderNumber || 'UJ-ORDER',
                        prevStatus: h.previousStatus || 'Created',
                        newStatus: h.newStatus || order.status || 'Confirmed',
                        changeDate: new Date(h.changedAt || order.createdAt || Date.now()).toISOString().replace('T', ' ').substring(0, 19),
                        updatedBy: h.updatedBy || 'System'
                    });
                    if (historyRowIdx % 2 === 0) row.eachCell(cell => { cell.fill = ZEBRA_FILL; });
                });
            } else {
                historyRowIdx++;
                const row = historySheet.addRow({
                    orderId: order.orderNumber || 'UJ-ORDER',
                    prevStatus: 'Created',
                    newStatus: order.status || 'Confirmed',
                    changeDate: new Date(order.createdAt || Date.now()).toISOString().replace('T', ' ').substring(0, 19),
                    updatedBy: 'System / Customer Checkout'
                });
                if (historyRowIdx % 2 === 0) row.eachCell(cell => { cell.fill = ZEBRA_FILL; });
            }
        });

        // ==========================================
        // GLOBAL STYLING & FORMATTING FOR ALL SHEETS
        // ==========================================
        workbook.eachSheet(sheet => {
            // Header row styling
            const headerRow = sheet.getRow(1);
            headerRow.height = 28;
            headerRow.eachCell(cell => {
                cell.fill = HEADER_FILL;
                cell.font = HEADER_FONT;
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                cell.border = BORDER_STYLE;
            });

            // Enable Excel Auto-Filter on row 1
            sheet.autoFilter = {
                from: { row: 1, column: 1 },
                to: { row: 1, column: sheet.columns.length }
            };

            // Formatting data rows
            sheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return;
                row.height = 20;
                row.eachCell(cell => {
                    cell.border = BORDER_STYLE;
                    if (!cell.alignment) {
                        cell.alignment = { vertical: 'middle' };
                    }
                });
            });
        });

        // Format Currency Columns
        ['unitPrice', 'subtotal', 'discount', 'tax', 'shippingCharges', 'finalTotal'].forEach(k => {
            const col = orderSheet.getColumn(k);
            if (col) col.numFmt = '$#,##0.00';
        });

        const custSpentCol = customerSheet.getColumn('totalSpent');
        if (custSpentCol) custSpentCol.numFmt = '$#,##0.00';

        const prodPriceCol = productSheet.getColumn('price');
        if (prodPriceCol) prodPriceCol.numFmt = '$#,##0.00';

        const payAmtCol = paymentSheet.getColumn('amount');
        if (payAmtCol) payAmtCol.numFmt = '$#,##0.00';

        // Write workbook to file safely
        await workbook.xlsx.writeFile(EXCEL_FILE_PATH);
        try {
            await workbook.xlsx.writeFile(ROOT_EXCEL_PATH);
        } catch {
            // Root write is best-effort
        }

        console.log(`[Excel Sync] Flexi_Credit_Data.xlsx updated successfully at ${new Date().toLocaleTimeString()}`);
        return EXCEL_FILE_PATH;
    } catch (err) {
        console.error('[Excel Sync Error]:', err.message);
        throw err;
    } finally {
        isSyncing = false;
        if (pendingSync) {
            pendingSync = false;
            syncExcelWorkbook(memoryOrders).catch(() => {});
        }
    }
};

/**
 * Generate a specific filtered workbook for user downloads (orders, customers, products, payments, or all)
 */
export const generateFilteredWorkbook = async ({ sheet = 'all', status = '', startDate = '', endDate = '' }) => {
    // Ensure primary workbook is synchronized first
    await syncExcelWorkbook();

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(EXCEL_FILE_PATH);

    // Filter date helper
    const isWithinDate = (dateStr) => {
        if (!dateStr || dateStr === 'N/A') return true;
        const d = new Date(dateStr).getTime();
        if (startDate && d < new Date(startDate).getTime()) return false;
        if (endDate && d > new Date(endDate).getTime() + 86400000) return false;
        return true;
    };

    // If specific sheet requested, remove others
    if (sheet !== 'all') {
        const sheetMap = {
            orders: 'Orders',
            customers: 'Customers',
            products: 'Products',
            payments: 'Payments',
            history: 'Order Status History'
        };
        const targetSheet = sheetMap[sheet.toLowerCase()];

        workbook.worksheets.forEach(ws => {
            if (ws.name !== targetSheet) {
                workbook.removeWorksheet(ws.id);
            }
        });
    }

    // Apply status or date filter to Orders sheet if present
    const orderWs = workbook.getWorksheet('Orders');
    if (orderWs && (status || startDate || endDate)) {
        const rowsToDelete = [];
        orderWs.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return;
            const rowStatus = row.getCell('orderStatus').value;
            const rowDate = row.getCell('orderDate').value;

            const matchesStatus = !status || String(rowStatus).toLowerCase() === status.toLowerCase();
            const matchesDate = isWithinDate(rowDate);

            if (!matchesStatus || !matchesDate) {
                rowsToDelete.push(rowNumber);
            }
        });

        // Delete from bottom to top to preserve indexes
        for (let i = rowsToDelete.length - 1; i >= 0; i--) {
            orderWs.spliceRows(rowsToDelete[i], 1);
        }
    }

    return workbook;
};

/**
 * Get report file status and summary metadata
 */
export const getExcelMetadata = async () => {
    try {
        if (!fs.existsSync(EXCEL_FILE_PATH)) {
            await syncExcelWorkbook();
        }

        const stats = fs.statSync(EXCEL_FILE_PATH);
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(EXCEL_FILE_PATH);

        const sheetSummaries = {};
        workbook.worksheets.forEach(ws => {
            sheetSummaries[ws.name] = Math.max(0, ws.rowCount - 1);
        });

        return {
            filename: 'Flexi_Credit_Data.xlsx',
            lastModified: stats.mtime,
            sizeKb: (stats.size / 1024).toFixed(1),
            sheets: sheetSummaries,
            path: EXCEL_FILE_PATH
        };
    } catch (err) {
        return {
            filename: 'Flexi_Credit_Data.xlsx',
            error: err.message
        };
    }
};
