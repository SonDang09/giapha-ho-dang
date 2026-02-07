const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users
// @access  Private (admin_toc only)
router.get('/', protect, authorize('admin_toc'), async (req, res) => {
    try {
        const { role, isActive, page = 1, limit = 50 } = req.query;

        let query = {};
        if (role) query.role = role;
        if (isActive !== undefined) query.isActive = isActive === 'true';

        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await User.countDocuments(query);

        res.json({
            success: true,
            data: users,
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

// @route   GET /api/users/:id
// @desc    Get single user
// @access  Private (admin_toc only)
router.get('/:id', protect, authorize('admin_toc'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server: ' + error.message
        });
    }
});

// @route   POST /api/users
// @desc    Create new user (admin creates user)
// @access  Private (admin_toc only)
router.post('/', protect, authorize('admin_toc'), [
    body('username').trim().notEmpty().withMessage('Tên đăng nhập là bắt buộc'),
    body('password').isLength({ min: 6 }).withMessage('Mật khẩu tối thiểu 6 ký tự'),
    body('fullName').trim().notEmpty().withMessage('Họ tên là bắt buộc'),
    body('role').optional().isIn(['admin_toc', 'chi_ho', 'thanh_vien']).withMessage('Vai trò không hợp lệ')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { username, password, fullName, role = 'thanh_vien', email, phone } = req.body;

        // Check if username exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Tên đăng nhập đã tồn tại'
            });
        }

        const user = await User.create({
            username,
            password,
            fullName,
            role,
            email,
            phone,
            isActive: true
        });

        res.status(201).json({
            success: true,
            data: {
                id: user._id,
                username: user.username,
                fullName: user.fullName,
                role: user.role,
                isActive: user.isActive
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server: ' + error.message
        });
    }
});

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private (admin_toc only)
router.put('/:id', protect, authorize('admin_toc'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        // Không cho phép thay đổi password qua API này
        const { password, ...updateData } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        res.json({
            success: true,
            data: updatedUser
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server: ' + error.message
        });
    }
});

// @route   PUT /api/users/:id/password
// @desc    Reset user password (admin)
// @access  Private (admin_toc only)
router.put('/:id/password', protect, authorize('admin_toc'), [
    body('newPassword').isLength({ min: 6 }).withMessage('Mật khẩu tối thiểu 6 ký tự')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        user.password = req.body.newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Đã đặt lại mật khẩu thành công'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server: ' + error.message
        });
    }
});

// @route   PUT /api/users/:id/toggle-status
// @desc    Toggle user active status
// @access  Private (admin_toc only)
router.put('/:id/toggle-status', protect, authorize('admin_toc'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        // Không cho phép vô hiệu hóa chính mình
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Không thể vô hiệu hóa tài khoản của chính mình'
            });
        }

        user.isActive = !user.isActive;
        await user.save();

        res.json({
            success: true,
            data: {
                id: user._id,
                isActive: user.isActive
            },
            message: user.isActive ? 'Đã kích hoạt tài khoản' : 'Đã vô hiệu hóa tài khoản'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server: ' + error.message
        });
    }
});

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private (admin_toc only)
router.delete('/:id', protect, authorize('admin_toc'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        // Không cho phép xóa chính mình
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Không thể xóa tài khoản của chính mình'
            });
        }

        await user.deleteOne();

        res.json({
            success: true,
            message: 'Đã xóa người dùng thành công'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server: ' + error.message
        });
    }
});

module.exports = router;
