const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true
    },
    thumbnail: String,
    caption: {
        type: String,
        trim: true
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

const albumSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Tên album là bắt buộc'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        enum: ['mo_phan', 'tu_duong', 'hop_mat', 'gio_to', 'dai_hoi', 'khac'],
        default: 'khac'
    },
    coverImage: {
        type: String,
        default: ''
    },
    photos: [photoSchema],
    eventDate: {
        type: Date
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Set cover image from first photo if not set
albumSchema.pre('save', function (next) {
    if (!this.coverImage && this.photos.length > 0) {
        this.coverImage = this.photos[0].url;
    }
    next();
});

albumSchema.index({ category: 1, isPublished: 1 });
albumSchema.index({ isFeatured: 1 });

module.exports = mongoose.model('Album', albumSchema);
