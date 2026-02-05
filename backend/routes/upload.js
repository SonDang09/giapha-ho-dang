const express = require('express');
const { localUpload } = require('../config/cloudinary');
const { protect, authorize } = require('../middleware/auth');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Image optimization settings
const IMAGE_CONFIG = {
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 80,
    format: 'webp'
};

// Process and optimize uploaded image
const optimizeImage = async (inputPath, outputFilename) => {
    const outputPath = path.join(uploadsDir, outputFilename);

    try {
        await sharp(inputPath)
            .resize(IMAGE_CONFIG.maxWidth, IMAGE_CONFIG.maxHeight, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .webp({ quality: IMAGE_CONFIG.quality })
            .toFile(outputPath);

        // Remove original file
        fs.unlinkSync(inputPath);

        return outputFilename;
    } catch (error) {
        console.error('Image optimization error:', error);
        // If optimization fails, keep original
        return path.basename(inputPath);
    }
};

// @route   POST /api/upload
// @desc    Upload single image with optimization
// @access  Private
router.post('/', protect, localUpload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Không có file được upload'
            });
        }

        // Optimize image
        const originalPath = req.file.path;
        const optimizedFilename = `opt_${Date.now()}.webp`;
        const finalFilename = await optimizeImage(originalPath, optimizedFilename);

        // Get optimized file stats
        const optimizedPath = path.join(uploadsDir, finalFilename);
        const stats = fs.statSync(optimizedPath);

        res.json({
            success: true,
            data: {
                url: `/uploads/${finalFilename}`,
                filename: finalFilename,
                size: stats.size,
                originalSize: req.file.size,
                savedBytes: req.file.size - stats.size
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
// @desc    Upload multiple images with optimization
// @access  Private
router.post('/multiple', protect, localUpload.array('images', 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Không có file được upload'
            });
        }

        const images = await Promise.all(req.files.map(async (file, index) => {
            const optimizedFilename = `opt_${Date.now()}_${index}.webp`;
            const finalFilename = await optimizeImage(file.path, optimizedFilename);
            const optimizedPath = path.join(uploadsDir, finalFilename);
            const stats = fs.statSync(optimizedPath);

            return {
                url: `/uploads/${finalFilename}`,
                filename: finalFilename,
                size: stats.size,
                originalSize: file.size
            };
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

