const express = require('express');
const { body, validationResult } = require('express-validator');
const Album = require('../models/Album');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/albums
// @desc    Get all albums
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { category, featured, page = 1, limit = 12 } = req.query;

        let query = { isPublished: true };

        if (category) query.category = category;
        if (featured === 'true') query.isFeatured = true;

        const albums = await Album.find(query)
            .populate('createdBy', 'fullName')
            .sort({ isFeatured: -1, createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Album.countDocuments(query);

        res.json({
            success: true,
            data: albums,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server: ' + error.message
        });
    }
});

// @route   GET /api/albums/featured
// @desc    Get featured albums for homepage
// @access  Public
router.get('/featured', async (req, res) => {
    try {
        const albums = await Album.find({ isPublished: true, isFeatured: true })
            .sort({ createdAt: -1 })
            .limit(6);

        res.json({
            success: true,
            data: albums
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server: ' + error.message
        });
    }
});

// @route   GET /api/albums/:id
// @desc    Get single album with photos
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const album = await Album.findById(req.params.id)
            .populate('createdBy', 'fullName');

        if (!album) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy album'
            });
        }

        res.json({
            success: true,
            data: album
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server: ' + error.message
        });
    }
});

// @route   POST /api/albums
// @desc    Create new album
// @access  Private (admin_toc, chi_ho)
router.post('/', protect, authorize('admin_toc', 'chi_ho'), [
    body('title').trim().notEmpty().withMessage('Tên album là bắt buộc')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const albumData = {
            ...req.body,
            createdBy: req.user._id
        };

        const album = await Album.create(albumData);

        res.status(201).json({
            success: true,
            data: album
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server: ' + error.message
        });
    }
});

// @route   PUT /api/albums/:id
// @desc    Update album
// @access  Private (admin_toc, chi_ho)
router.put('/:id', protect, authorize('admin_toc', 'chi_ho'), async (req, res) => {
    try {
        const album = await Album.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!album) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy album'
            });
        }

        res.json({
            success: true,
            data: album
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server: ' + error.message
        });
    }
});

// @route   POST /api/albums/:id/photos
// @desc    Add photos to album
// @access  Private (admin_toc, chi_ho)
router.post('/:id/photos', protect, authorize('admin_toc', 'chi_ho'), async (req, res) => {
    try {
        const album = await Album.findById(req.params.id);

        if (!album) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy album'
            });
        }

        const { photos } = req.body; // Array of { url, caption }
        album.photos.push(...photos);
        await album.save();

        res.json({
            success: true,
            data: album
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server: ' + error.message
        });
    }
});

// @route   DELETE /api/albums/:id
// @desc    Delete album
// @access  Private (admin_toc only)
router.delete('/:id', protect, authorize('admin_toc'), async (req, res) => {
    try {
        const album = await Album.findByIdAndDelete(req.params.id);

        if (!album) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy album'
            });
        }

        res.json({
            success: true,
            message: 'Đã xóa album thành công'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server: ' + error.message
        });
    }
});

module.exports = router;
