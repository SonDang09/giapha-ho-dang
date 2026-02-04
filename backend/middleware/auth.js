const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Bạn chưa đăng nhập. Vui lòng đăng nhập để truy cập.'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if user still exists
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Người dùng không còn tồn tại.'
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Tài khoản đã bị vô hiệu hóa.'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Token không hợp lệ hoặc đã hết hạn.'
        });
    }
};

// Restrict to specific roles
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền thực hiện hành động này.'
            });
        }
        next();
    };
};

// Check if user can edit branch
const canEditBranch = (req, res, next) => {
    if (req.user.role === 'admin_toc') {
        return next();
    }

    if (req.user.role === 'chi_ho') {
        // chi_ho can only edit their assigned branch
        req.branchRestricted = true;
        return next();
    }

    return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền chỉnh sửa.'
    });
};

module.exports = { protect, authorize, canEditBranch };
