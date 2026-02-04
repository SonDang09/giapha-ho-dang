const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Tên đăng nhập là bắt buộc'],
        unique: true,
        trim: true,
        minlength: 3
    },
    password: {
        type: String,
        required: [true, 'Mật khẩu là bắt buộc'],
        minlength: 6,
        select: false
    },
    fullName: {
        type: String,
        required: [true, 'Họ tên là bắt buộc']
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        trim: true
    },
    role: {
        type: String,
        enum: ['admin_toc', 'chi_ho', 'thanh_vien'],
        default: 'thanh_vien'
    },
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member'
    },
    avatar: {
        type: String,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
