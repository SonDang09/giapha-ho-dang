const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    // Basic Info
    fullName: {
        type: String,
        required: [true, 'Họ tên là bắt buộc'],
        trim: true
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        required: true
    },
    birthDate: {
        type: Date
    },
    deathDate: {
        type: Date
    },
    isDeceased: {
        type: Boolean,
        default: false
    },

    // Family Tree Position
    generation: {
        type: Number,
        required: [true, 'Đời thứ là bắt buộc'],
        min: 1
    },
    birthOrder: {
        type: Number,
        default: 1
    },

    // Family Relationships
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
        default: null
    },
    // Support multiple spouses (e.g. vợ cả, vợ hai...)
    spouseIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member'
    }],
    // Keep spouseId for backward compatibility (deprecated)
    spouseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
        default: null
    },

    // Chi họ (branch)
    branch: {
        type: String,
        default: 'Chính'
    },

    // Contact & Location
    address: {
        type: String,
        trim: true
    },
    currentResidence: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },

    // Social Media Links
    socialLinks: {
        facebook: { type: String, trim: true },
        zalo: { type: String, trim: true },
        youtube: { type: String, trim: true },
        tiktok: { type: String, trim: true },
        instagram: { type: String, trim: true }
    },

    // Additional Info
    occupation: {
        type: String,
        trim: true
    },
    biography: {
        type: String,
        trim: true
    },

    // Anniversary (Ngày giỗ) - Lunar calendar
    anniversaryDate: {
        lunarDay: { type: Number, min: 1, max: 30 },
        lunarMonth: { type: Number, min: 1, max: 12 }
    },

    // Photos
    avatar: {
        type: String,
        default: ''
    },
    photos: [{
        url: String,
        caption: String,
        uploadedAt: { type: Date, default: Date.now }
    }],

    // Memorial
    memorialEnabled: {
        type: Boolean,
        default: false
    },
    incenseCount: {
        type: Number,
        default: 0
    },

    // Metadata
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for children
memberSchema.virtual('children', {
    ref: 'Member',
    localField: '_id',
    foreignField: 'parentId'
});

// Virtual for age calculation
memberSchema.virtual('age').get(function () {
    if (!this.birthDate) return null;
    const endDate = this.deathDate || new Date();
    return Math.floor((endDate - this.birthDate) / (365.25 * 24 * 60 * 60 * 1000));
});

// Index for search
memberSchema.index({ fullName: 'text', biography: 'text' });
memberSchema.index({ generation: 1 });
memberSchema.index({ parentId: 1 });
memberSchema.index({ branch: 1 });

module.exports = mongoose.model('Member', memberSchema);
