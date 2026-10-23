import { syncExcelWorkbook, generateFilteredWorkbook, getExcelMetadata } from '../services/excelService.js';
import path from 'path';

// @desc    Download Excel report (All sheets or specific sheet with optional filters)
// @route   GET /api/excel/download
export const downloadReport = async (req, res) => {
    try {
        const { sheet = 'all', status = '', startDate = '', endDate = '' } = req.query;

        const workbook = await generateFilteredWorkbook({
            sheet,
            status,
            startDate,
            endDate
        });

        const filename = sheet === 'all' 
            ? 'Flexi_Credit_Data.xlsx' 
            : `Flexi_Credit_${sheet.charAt(0).toUpperCase() + sheet.slice(1)}_Report.xlsx`;

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('[Excel Download Error]:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate Excel report: ' + error.message
        });
    }
};

// @desc    Force re-synchronize Excel file with current database state
// @route   POST /api/excel/sync
export const syncReport = async (req, res) => {
    try {
        await syncExcelWorkbook();
        const meta = await getExcelMetadata();
        res.json({
            success: true,
            message: 'Excel report synchronized successfully with database records!',
            data: meta
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to synchronize Excel: ' + error.message
        });
    }
};

// @desc    Get Excel report file metadata and sheet counts
// @route   GET /api/excel/status
export const getStatus = async (req, res) => {
    try {
        const meta = await getExcelMetadata();
        res.json({
            success: true,
            data: meta
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
