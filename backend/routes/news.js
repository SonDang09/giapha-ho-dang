const express = require('express');
const { body, validationResult } = require('express-validator');
const News = require('../models/News');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/news
// @desc    Get all news/events
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { category, published = 'true', page = 1, limit = 10, pinned } = req.query;

        let query = {};

        if (category) query.category = category;
        if (published === 'true') query.isPublished = true;
        if (pinned === 'true') query.isPinned = true;

        const news = await News.find(query)
            .populate('author', 'fullName avatar')
            .sort({ isPinned: -1, createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await News.countDocuments(query);

        res.json({
            success: true,
            data: news,
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

// @route   GET /api/news/latest
// @desc    Get latest news for homepage
// @access  Public
router.get('/latest', async (req, res) => {
    try {
        const news = await News.find({ isPublished: true })
            .populate('author', 'fullName avatar')
            .sort({ isPinned: -1, createdAt: -1 })
            .limit(5);

        res.json({
            success: true,
            data: news
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server: ' + error.message
        });
    }
});

// @route   GET /api/news/:slug
// @desc    Get single news by slug
// @access  Public
router.get('/:slug', async (req, res) => {
    try {
        const news = await News.findOneAndUpdate(
            { slug: req.params.slug },
            { $inc: { viewCount: 1 } },
            { new: true }
        ).populate('author', 'fullName avatar');

        if (!news) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy bài viết'
            });
        }

        res.json({
            success: true,
            data: news
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server: ' + error.message
        });
    }
});

// @route   POST /api/news
// @desc    Create new news/event
// @access  Private (admin_toc, chi_ho)
router.post('/', protect, authorize('admin_toc', 'chi_ho'), [
    body('title').trim().notEmpty().withMessage('Tiêu đề là bắt buộc'),
    body('content').notEmpty().withMessage('Nội dung là bắt buộc')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const newsData = {
            ...req.body,
            author: req.user._id
        };

        const news = await News.create(newsData);

        res.status(201).json({
            success: true,
            data: news
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server: ' + error.message
        });
    }
});

// @route   PUT /api/news/:id
// @desc    Update news
// @access  Private (admin_toc, chi_ho)
router.put('/:id', protect, authorize('admin_toc', 'chi_ho'), async (req, res) => {
    try {
        const news = await News.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!news) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy bài viết'
            });
        }

        res.json({
            success: true,
            data: news
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server: ' + error.message
        });
    }
});

// @route   DELETE /api/news/:id
// @desc    Delete news
// @access  Private (admin_toc only)
router.delete('/:id', protect, authorize('admin_toc'), async (req, res) => {
    try {
        const news = await News.findByIdAndDelete(req.params.id);

        if (!news) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy bài viết'
            });
        }

        res.json({
            success: true,
            message: 'Đã xóa bài viết thành công'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server: ' + error.message
        });
    }
});

module.exports = router;
