const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
};

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public (for initial setup) / Admin only
router.post('/register', [
    body('username').trim().isLength({ min: 3 }).withMessage('Tên đăng nhập phải có ít nhất 3 ký tự'),
    body('password').isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
    body('fullName').trim().notEmpty().withMessage('Họ tên là bắt buộc')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { username, password, fullName, email, phone, role } = req.body;

        // Check if user exists
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
            email,
            phone,
            role: role || 'thanh_vien'
        });

        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                fullName: user.fullName,
                role: user.role,
                avatar: user.avatar
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server: ' + error.message
        });
    }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
    body('username').trim().notEmpty().withMessage('Tên đăng nhập là bắt buộc'),
    body('password').notEmpty().withMessage('Mật khẩu là bắt buộc')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { username, password } = req.body;

        // Find user with password and login tracking fields
        const user = await User.findOne({ username }).select('+password +loginAttempts +lockUntil');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Tên đăng nhập hoặc mật khẩu không đúng'
            });
        }

        // Check if account is locked
        if (user.isLocked) {
            const lockTimeRemaining = Math.ceil((user.lockUntil - Date.now()) / 60000);
            return res.status(423).json({
                success: false,
                message: `Tài khoản bị khóa. Vui lòng thử lại sau ${lockTimeRemaining} phút.`
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            // Increment failed login attempts
            await user.incLoginAttempts();

            const attemptsLeft = 5 - (user.loginAttempts + 1);
            let message = 'Tên đăng nhập hoặc mật khẩu không đúng';
            if (attemptsLeft > 0 && attemptsLeft <= 3) {
                message += `. Còn ${attemptsLeft} lần thử.`;
            } else if (attemptsLeft <= 0) {
                message = 'Quá nhiều lần đăng nhập thất bại. Tài khoản bị khóa 30 phút.';
            }

            return res.status(401).json({
                success: false,
                message
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Tài khoản đã bị vô hiệu hóa'
            });
        }

        // Reset login attempts on successful login
        await user.resetLoginAttempts();

        const token = generateToken(user._id);

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                fullName: user.fullName,
                role: user.role,
                avatar: user.avatar
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server: ' + error.message
        });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('memberId');
        res.json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                role: user.role,
                avatar: user.avatar,
                member: user.memberId
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server: ' + error.message
        });
    }
});

// @route   PUT /api/auth/password
// @desc    Update password
// @access  Private
router.put('/password', protect, [
    body('currentPassword').notEmpty().withMessage('Mật khẩu hiện tại là bắt buộc'),
    body('newPassword').isLength({ min: 6 }).withMessage('Mật khẩu mới phải có ít nhất 6 ký tự')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const user = await User.findById(req.user._id).select('+password');

        const isMatch = await user.comparePassword(req.body.currentPassword);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Mật khẩu hiện tại không đúng'
            });
        }

        user.password = req.body.newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Đổi mật khẩu thành công'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server: ' + error.message
        });
    }
});

// @route   PUT /api/auth/avatar
// @desc    Update user avatar
// @access  Private
router.put('/avatar', protect, async (req, res) => {
    try {
        const { avatar } = req.body;

        if (!avatar) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng chọn ảnh avatar'
            });
        }

        // Upload to Cloudinary if it's a base64 image
        let avatarUrl = avatar;
        if (avatar.startsWith('data:image')) {
            const cloudinary = require('cloudinary').v2;
            const result = await cloudinary.uploader.upload(avatar, {
                folder: 'giapha/avatars',
                public_id: `user_${req.user._id}`,
                overwrite: true,
                transformation: [
                    { width: 200, height: 200, crop: 'fill', gravity: 'face' }
                ]
            });
            avatarUrl = result.secure_url;
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { avatar: avatarUrl },
            { new: true }
        );

        res.json({
            success: true,
            message: 'Cập nhật avatar thành công',
            avatar: user.avatar
        });
    } catch (error) {
        console.error('Avatar upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi upload avatar: ' + error.message
        });
    }
});

module.exports = router;
