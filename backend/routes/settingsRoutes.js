const express = require('express');
const router = express.Router();
const SiteSettings = require('../models/SiteSettings');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/settings
// @desc    Get site settings (public)
// @access  Public
router.get('/', async (req, res) => {
    try {
        const settings = await SiteSettings.getSettings();
        res.json({
            success: true,
            data: settings
        });
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
});

// @route   PUT /api/settings
// @desc    Update site settings
// @access  Admin only
router.put('/', protect, authorize('admin_toc'), async (req, res) => {
    try {
        const {
            // Branding
            brandName,
            location,
            // Homepage
            siteTitle,
            tagline,
            heroDescription,
            // Tree page
            treeHeader,
            treeSubtitle,
            treeFooter,
            // SEO & Scripts
            headerScripts,
            // Footer & Contact
            footerText,
            socialLinks,
            contactEmail,
            contactPhone,
            // Display options
            showMemberCount,
            memberCountDisplay
        } = req.body;

        let settings = await SiteSettings.findOne();

        if (!settings) {
            settings = new SiteSettings();
        }

        // Update fields if provided
        // Branding
        if (brandName !== undefined) settings.brandName = brandName;
        if (location !== undefined) settings.location = location;
        // Homepage
        if (siteTitle !== undefined) settings.siteTitle = siteTitle;
        if (tagline !== undefined) settings.tagline = tagline;
        if (heroDescription !== undefined) settings.heroDescription = heroDescription;
        // Tree page
        if (treeHeader !== undefined) settings.treeHeader = treeHeader;
        if (treeSubtitle !== undefined) settings.treeSubtitle = treeSubtitle;
        if (treeFooter !== undefined) settings.treeFooter = treeFooter;
        // SEO & Scripts
        if (headerScripts !== undefined) settings.headerScripts = headerScripts;
        // Footer & Contact
        if (footerText !== undefined) settings.footerText = footerText;
        if (socialLinks !== undefined) settings.socialLinks = socialLinks;
        if (contactEmail !== undefined) settings.contactEmail = contactEmail;
        if (contactPhone !== undefined) settings.contactPhone = contactPhone;
        // Display options
        if (showMemberCount !== undefined) settings.showMemberCount = showMemberCount;
        if (memberCountDisplay !== undefined) settings.memberCountDisplay = memberCountDisplay;

        await settings.save();

        res.json({
            success: true,
            message: 'Cập nhật cấu hình thành công',
            data: settings
        });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
});

module.exports = router;
