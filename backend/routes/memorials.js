const express = require('express');
const { body, validationResult } = require('express-validator');
const Memorial = require('../models/Memorial');
const Member = require('../models/Member');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/memorials
// @desc    Get all memorial pages
// @access  Public
router.get('/', async (req, res) => {
    try {
        const memorials = await Memorial.find({ isPublished: true })
            .populate('memberId', 'fullName birthDate deathDate generation avatar')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: memorials
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server: ' + error.message
        });
    }
});

// @route   GET /api/memorials/:memberId
// @desc    Get memorial page by member ID
// @access  Public
router.get('/:memberId', async (req, res) => {
    try {
        let memorial = await Memorial.findOne({ memberId: req.params.memberId })
            .populate('memberId', 'fullName birthDate deathDate generation avatar biography anniversaryDate photos')
            .populate('condolences.userId', 'fullName avatar');

        if (!memorial) {
            // Check if member exists and is deceased
            const member = await Member.findById(req.params.memberId);
            if (!member) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy thành viên'
                });
            }

            if (!member.isDeceased) {
                return res.status(400).json({
                    success: false,
                    message: 'Trang tưởng niệm chỉ dành cho người đã mất'
                });
            }

            // Create memorial page
            memorial = await Memorial.create({
                memberId: member._id,
                biography: member.biography
            });
            memorial = await memorial.populate('memberId', 'fullName birthDate deathDate generation avatar biography anniversaryDate photos');
        }

        res.json({
            success: true,
            data: memorial
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server: ' + error.message
        });
    }
});

// @route   POST /api/memorials/:memberId/incense
// @desc    Light virtual incense
// @access  Public
router.post('/:memberId/incense', async (req, res) => {
    try {
        let memorial = await Memorial.findOne({ memberId: req.params.memberId });

        if (!memorial) {
            const member = await Member.findById(req.params.memberId);
            if (!member || !member.isDeceased) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy trang tưởng niệm'
                });
            }
            memorial = await Memorial.create({ memberId: member._id });
        }

        // Increment incense count
        memorial.incenseCount += 1;
        memorial.incenseLogs.push({
            userId: req.body.userId || null,
            visitorName: req.body.visitorName || 'Khách',
            timestamp: new Date()
        });

        // Also update member's incense count
        await Member.findByIdAndUpdate(req.params.memberId, {
            $inc: { incenseCount: 1 }
        });

        await memorial.save();

        res.json({
            success: true,
            data: {
                incenseCount: memorial.incenseCount,
                message: 'Đã thắp hương thành công'
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server: ' + error.message
        });
    }
});

// @route   POST /api/memorials/:memberId/condolences
// @desc    Leave a condolence message
// @access  Public
router.post('/:memberId/condolences', [
    body('name').trim().notEmpty().withMessage('Tên là bắt buộc'),
    body('message').trim().notEmpty().withMessage('Nội dung lời tưởng nhớ là bắt buộc')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        let memorial = await Memorial.findOne({ memberId: req.params.memberId });

        if (!memorial) {
            const member = await Member.findById(req.params.memberId);
            if (!member || !member.isDeceased) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy trang tưởng niệm'
                });
            }
            memorial = await Memorial.create({ memberId: member._id });
        }

        const { name, relationship, message, userId } = req.body;

        memorial.condolences.push({
            name,
            relationship,
            message,
            userId: userId || null,
            isApproved: true
        });

        await memorial.save();

        res.status(201).json({
            success: true,
            message: 'Đã gửi lời tưởng nhớ thành công'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server: ' + error.message
        });
    }
});

// @route   PUT /api/memorials/:memberId
// @desc    Update memorial page
// @access  Private (admin_toc, chi_ho)
router.put('/:memberId', protect, async (req, res) => {
    try {
        const memorial = await Memorial.findOneAndUpdate(
            { memberId: req.params.memberId },
            req.body,
            { new: true, runValidators: true }
        );

        if (!memorial) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy trang tưởng niệm'
            });
        }

        res.json({
            success: true,
            data: memorial
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server: ' + error.message
        });
    }
});

module.exports = router;
