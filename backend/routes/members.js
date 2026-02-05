const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Member = require('../models/Member');
const Memorial = require('../models/Memorial');
const { protect, authorize, canEditBranch } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/members
// @desc    Get all members with filtering
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { generation, branch, search, deceased, page = 1, limit = 50 } = req.query;

        let query = {};

        if (generation) query.generation = parseInt(generation);
        if (branch) query.branch = branch;
        if (deceased !== undefined) query.isDeceased = deceased === 'true';
        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { biography: { $regex: search, $options: 'i' } }
            ];
        }

        const members = await Member.find(query)
            .populate('parentId', 'fullName')
            .populate('spouseId', 'fullName')
            .sort({ generation: 1, birthOrder: 1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Member.countDocuments(query);

        res.json({
            success: true,
            data: members,
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

// @route   GET /api/members/tree
// @desc    Get family tree data structure
// @access  Public
router.get('/tree', async (req, res) => {
    try {
        const members = await Member.find()
            .select('fullName gender birthDate deathDate generation parentId avatar isDeceased birthOrder anniversaryDate spouseId')
            .sort({ generation: 1, birthOrder: 1 });

        // Create a map for quick spouse lookup
        const memberMap = new Map();
        members.forEach(m => memberMap.set(m._id.toString(), m));

        // Build tree structure
        const buildTree = (parentId = null) => {
            return members
                .filter(m => {
                    if (parentId === null) return m.parentId === null;
                    return m.parentId && m.parentId.toString() === parentId;
                })
                .map(m => {
                    // Find spouse data if exists
                    const spouse = m.spouseId ? memberMap.get(m.spouseId.toString()) : null;

                    return {
                        name: m.fullName,
                        attributes: {
                            id: m._id,
                            gender: m.gender,
                            generation: m.generation,
                            birthYear: m.birthDate ? new Date(m.birthDate).getFullYear() : null,
                            deathYear: m.deathDate ? new Date(m.deathDate).getFullYear() : null,
                            isDeceased: m.isDeceased,
                            avatar: m.avatar,
                            anniversaryDate: m.anniversaryDate,
                            spouseId: m.spouseId,
                            // Include populated spouse data for frontend rendering
                            spouse: spouse ? {
                                _id: spouse._id,
                                fullName: spouse.fullName,
                                gender: spouse.gender,
                                birthYear: spouse.birthDate ? new Date(spouse.birthDate).getFullYear() : null,
                                deathYear: spouse.deathDate ? new Date(spouse.deathDate).getFullYear() : null,
                                isDeceased: spouse.isDeceased,
                                avatar: spouse.avatar
                            } : null
                        },
                        children: buildTree(m._id.toString())
                    };
                });
        };

        const treeData = buildTree();

        res.json({
            success: true,
            data: treeData.length > 0 ? treeData[0] : null
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server: ' + error.message
        });
    }
});

// @route   GET /api/members/search
// @desc    Quick search members
// @access  Public
router.get('/search', async (req, res) => {
    try {
        const { q, limit = 10 } = req.query;

        if (!q || q.length < 2) {
            return res.json({ success: true, data: [] });
        }

        const members = await Member.find({
            $or: [
                { fullName: { $regex: q, $options: 'i' } }
            ]
        })
            .select('fullName generation avatar birthDate isDeceased')
            .limit(parseInt(limit));

        res.json({
            success: true,
            data: members
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server: ' + error.message
        });
    }
});

// @route   GET /api/members/anniversaries
// @desc    Get upcoming memorial anniversaries
// @access  Public
router.get('/anniversaries', async (req, res) => {
    try {
        const members = await Member.find({
            isDeceased: true,
            'anniversaryDate.lunarDay': { $exists: true },
            'anniversaryDate.lunarMonth': { $exists: true }
        }).select('fullName generation avatar anniversaryDate deathDate');

        // For demo, return members with anniversary dates
        res.json({
            success: true,
            data: members
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server: ' + error.message
        });
    }
});

// @route   GET /api/members/:id
// @desc    Get single member
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const member = await Member.findById(req.params.id)
            .populate('parentId', 'fullName generation')
            .populate('spouseId', 'fullName')
            .populate('children');

        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thành viên'
            });
        }

        res.json({
            success: true,
            data: member
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server: ' + error.message
        });
    }
});

// @route   POST /api/members
// @desc    Create new member
// @access  Private (admin_toc, chi_ho)
router.post('/', protect, canEditBranch, [
    body('fullName').trim().notEmpty().withMessage('Họ tên là bắt buộc'),
    body('gender').isIn(['male', 'female', 'other']).withMessage('Giới tính không hợp lệ'),
    body('generation').isInt({ min: 1 }).withMessage('Đời thứ phải là số nguyên dương')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const memberData = {
            ...req.body,
            createdBy: req.user._id
        };

        const member = await Member.create(memberData);

        // Create memorial page if deceased
        if (member.isDeceased) {
            await Memorial.create({
                memberId: member._id,
                biography: member.biography
            });
        }

        res.status(201).json({
            success: true,
            data: member
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server: ' + error.message
        });
    }
});

// @route   PUT /api/members/:id
// @desc    Update member
// @access  Private (admin_toc, chi_ho)
router.put('/:id', protect, canEditBranch, async (req, res) => {
    try {
        const member = await Member.findById(req.params.id);

        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thành viên'
            });
        }

        const updatedMember = await Member.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedBy: req.user._id },
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            data: updatedMember
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server: ' + error.message
        });
    }
});

// @route   DELETE /api/members/:id
// @desc    Delete member
// @access  Private (admin_toc only)
router.delete('/:id', protect, authorize('admin_toc'), async (req, res) => {
    try {
        const member = await Member.findById(req.params.id);

        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thành viên'
            });
        }

        // Check if member has children
        const children = await Member.countDocuments({ parentId: member._id });
        if (children > 0) {
            return res.status(400).json({
                success: false,
                message: 'Không thể xóa thành viên có con cháu. Vui lòng xóa hoặc chuyển con cháu trước.'
            });
        }

        await member.deleteOne();
        await Memorial.deleteOne({ memberId: member._id });

        res.json({
            success: true,
            message: 'Đã xóa thành viên thành công'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server: ' + error.message
        });
    }
});

module.exports = router;
