const mongoose = require('mongoose');

const condolenceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Tên người gửi là bắt buộc'],
        trim: true
    },
    relationship: {
        type: String,
        trim: true
    },
    message: {
        type: String,
        required: [true, 'Nội dung lời tưởng nhớ là bắt buộc'],
        trim: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    isApproved: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const incenseLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    visitorName: String,
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const memorialSchema = new mongoose.Schema({
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
        required: true,
        unique: true
    },
    epitaph: {
        type: String,
        trim: true
    },
    biography: {
        type: String,
        trim: true
    },
    photos: [{
        url: String,
        caption: String,
        isMain: { type: Boolean, default: false }
    }],
    incenseCount: {
        type: Number,
        default: 0
    },
    incenseLogs: [incenseLogSchema],
    condolences: [condolenceSchema],
    isPublished: {
        type: Boolean,
        default: true
    },
    backgroundMusic: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

memorialSchema.index({ memberId: 1 });

module.exports = mongoose.model('Memorial', memorialSchema);
