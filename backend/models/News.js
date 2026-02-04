const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Tiêu đề là bắt buộc'],
        trim: true
    },
    slug: {
        type: String,
        unique: true
    },
    content: {
        type: String,
        required: [true, 'Nội dung là bắt buộc']
    },
    excerpt: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        enum: ['gio_to', 'dai_hoi', 'cung_te', 'tin_tuc', 'thong_bao', 'khac'],
        default: 'tin_tuc'
    },
    featuredImage: {
        type: String,
        default: ''
    },
    images: [{
        url: String,
        caption: String
    }],
    eventDate: {
        type: Date
    },
    eventLocation: {
        type: String,
        trim: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    isPinned: {
        type: Boolean,
        default: false
    },
    viewCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Generate slug before saving
newsSchema.pre('save', function (next) {
    if (this.isModified('title')) {
        this.slug = this.title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '') + '-' + Date.now();
    }
    if (!this.excerpt && this.content) {
        this.excerpt = this.content.substring(0, 200).replace(/<[^>]*>/g, '') + '...';
    }
    next();
});

newsSchema.index({ title: 'text', content: 'text' });
newsSchema.index({ category: 1, isPublished: 1 });
newsSchema.index({ createdAt: -1 });

module.exports = mongoose.model('News', newsSchema);
