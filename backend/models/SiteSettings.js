const mongoose = require('mongoose');

const SiteSettingsSchema = new mongoose.Schema({
    // Branding
    brandName: {
        type: String,
        default: 'Đặng Đức Tộc'
    },
    location: {
        type: String,
        default: 'Đà Nẵng - Việt Nam'
    },

    // Homepage content
    siteTitle: {
        type: String,
        default: 'Gia Phả Họ Đặng Đà Nẵng'
    },
    tagline: {
        type: String,
        default: 'Uống nước nhớ nguồn - Ăn quả nhớ kẻ trồng cây'
    },
    heroDescription: {
        type: String,
        default: 'Trang web lưu giữ và kết nối các thế hệ trong dòng họ Đặng Đà Nẵng'
    },

    // Tree page
    treeHeader: {
        type: String,
        default: 'GIA PHẢ HỌ ĐẶNG'
    },
    treeSubtitle: {
        type: String,
        default: 'Đà Nẵng - Việt Nam'
    },
    treeFooter: {
        type: String,
        default: 'Gia Phả Họ Đặng Đà Nẵng • Giữ gìn và phát huy truyền thống dòng họ'
    },

    // Header scripts (Google Analytics, etc.)
    headerScripts: {
        type: String,
        default: ''
    },

    // Footer
    footerText: {
        type: String,
        default: 'Giữ gìn và phát huy truyền thống dòng họ'
    },

    // Social links
    socialLinks: {
        facebook: { type: String, default: '' },
        zalo: { type: String, default: '' },
        youtube: { type: String, default: '' }
    },

    // Contact info
    contactEmail: {
        type: String,
        default: ''
    },
    contactPhone: {
        type: String,
        default: ''
    },

    // Statistics display (for homepage)
    showMemberCount: {
        type: Boolean,
        default: true
    },
    memberCountDisplay: {
        type: String,
        default: '150+'
    }
}, {
    timestamps: true
});

// Ensure only one settings document exists
SiteSettingsSchema.statics.getSettings = async function () {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({});
    }
    return settings;
};

module.exports = mongoose.model('SiteSettings', SiteSettingsSchema);
