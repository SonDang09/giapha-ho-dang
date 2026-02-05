const express = require('express');
const { body, validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/transactions
// @desc    Get all transactions with filtering
// @access  Public (view) / Private (create/edit)
router.get('/', async (req, res) => {
    try {
        const { type, category, startDate, endDate, page = 1, limit = 50 } = req.query;

        let query = {};

        if (type) query.type = type;
        if (category) query.category = category;

        // Date range filter
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const transactions = await Transaction.find(query)
            .populate('createdBy', 'fullName username')
            .sort({ date: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Transaction.countDocuments(query);

        res.json({
            success: true,
            data: transactions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server: ' + error.message
        });
    }
});

// @route   GET /api/transactions/stats
// @desc    Get fund statistics
// @access  Public
router.get('/stats', async (req, res) => {
    try {
        const stats = await Transaction.getStats();
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server: ' + error.message
        });
    }
});

// @route   GET /api/transactions/:id
// @desc    Get single transaction
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id)
            .populate('createdBy', 'fullName username');

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy giao dịch'
            });
        }

        res.json({
            success: true,
            data: transaction
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server: ' + error.message
        });
    }
});

// @route   POST /api/transactions
// @desc    Create new transaction
// @access  Private (admin_toc, chi_ho)
router.post('/', protect, authorize('admin_toc', 'chi_ho'), [
    body('type').isIn(['income', 'expense']).withMessage('Loại giao dịch không hợp lệ'),
    body('amount').isFloat({ min: 1000 }).withMessage('Số tiền tối thiểu là 1,000 VNĐ'),
    body('description').trim().notEmpty().withMessage('Mô tả là bắt buộc'),
    body('category').optional().isIn(['dong_gop', 'gio_to', 'xay_dung', 'sinh_hoat', 'tu_thien', 'hoc_bong', 'khac'])
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const transactionData = {
            ...req.body,
            createdBy: req.user._id
        };

        const transaction = await Transaction.create(transactionData);

        res.status(201).json({
            success: true,
            data: transaction
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server: ' + error.message
        });
    }
});

// @route   PUT /api/transactions/:id
// @desc    Update transaction
// @access  Private (admin_toc, chi_ho)
router.put('/:id', protect, authorize('admin_toc', 'chi_ho'), async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy giao dịch'
            });
        }

        const updatedTransaction = await Transaction.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            data: updatedTransaction
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server: ' + error.message
        });
    }
});

// @route   DELETE /api/transactions/:id
// @desc    Delete transaction
// @access  Private (admin_toc only)
router.delete('/:id', protect, authorize('admin_toc'), async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy giao dịch'
            });
        }

        await transaction.deleteOne();

        res.json({
            success: true,
            message: 'Đã xóa giao dịch thành công'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server: ' + error.message
        });
    }
});

module.exports = router;
