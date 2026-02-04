const express = require('express');
const { localUpload } = require('../config/cloudinary');
const { protect, authorize } = require('../middleware/auth');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// @route   POST /api/upload
// @desc    Upload single image
// @access  Private
router.post('/', protect, localUpload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Không có file được upload'
            });
        }

        // Return URL for local file
        const imageUrl = `/uploads/${req.file.filename}`;

        res.json({
            success: true,
            data: {
                url: imageUrl,
                filename: req.file.filename,
                size: req.file.size
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi upload: ' + error.message
        });
    }
});

// @route   POST /api/upload/multiple
// @desc    Upload multiple images
// @access  Private
router.post('/multiple', protect, localUpload.array('images', 10), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Không có file được upload'
            });
        }

        const images = req.files.map(file => ({
            url: `/uploads/${file.filename}`,
            filename: file.filename,
            size: file.size
        }));

        res.json({
            success: true,
            data: images
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi upload: ' + error.message
        });
    }
});

module.exports = router;
