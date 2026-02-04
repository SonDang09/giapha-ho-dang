require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const memberRoutes = require('./routes/members');
const newsRoutes = require('./routes/news');
const albumRoutes = require('./routes/albums');
const memorialRoutes = require('./routes/memorials');
const uploadRoutes = require('./routes/upload');

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/albums', albumRoutes);
app.use('/api/memorials', memorialRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Gia Phả Họ Đang API đang hoạt động!',
        timestamp: new Date().toISOString()
    });
});

// Demo data endpoint (for testing without DB)
app.get('/api/demo/tree', (req, res) => {
    const demoTree = {
        name: 'Đặng Văn Tổ',
        attributes: {
            id: 'demo-1',
            gender: 'male',
            generation: 1,
            birthYear: 1850,
            deathYear: 1920,
            isDeceased: true,
            avatar: ''
        },
        children: [
            {
                name: 'Đặng Văn Nhất',
                attributes: {
                    id: 'demo-2',
                    gender: 'male',
                    generation: 2,
                    birthYear: 1880,
                    deathYear: 1950,
                    isDeceased: true
                },
                children: [
                    {
                        name: 'Đặng Văn An',
                        attributes: {
                            id: 'demo-4',
                            gender: 'male',
                            generation: 3,
                            birthYear: 1910,
                            deathYear: 1980,
                            isDeceased: true
                        },
                        children: [
                            {
                                name: 'Đặng Văn Minh',
                                attributes: {
                                    id: 'demo-7',
                                    gender: 'male',
                                    generation: 4,
                                    birthYear: 1945,
                                    deathYear: null,
                                    isDeceased: false
                                },
                                children: []
                            },
                            {
                                name: 'Đặng Thị Hương',
                                attributes: {
                                    id: 'demo-8',
                                    gender: 'female',
                                    generation: 4,
                                    birthYear: 1948,
                                    deathYear: null,
                                    isDeceased: false
                                },
                                children: []
                            }
                        ]
                    },
                    {
                        name: 'Đặng Thị Bình',
                        attributes: {
                            id: 'demo-5',
                            gender: 'female',
                            generation: 3,
                            birthYear: 1915,
                            deathYear: 2000,
                            isDeceased: true
                        },
                        children: []
                    }
                ]
            },
            {
                name: 'Đặng Văn Nhì',
                attributes: {
                    id: 'demo-3',
                    gender: 'male',
                    generation: 2,
                    birthYear: 1885,
                    deathYear: 1960,
                    isDeceased: true
                },
                children: [
                    {
                        name: 'Đặng Văn Cường',
                        attributes: {
                            id: 'demo-6',
                            gender: 'male',
                            generation: 3,
                            birthYear: 1920,
                            deathYear: 1995,
                            isDeceased: true
                        },
                        children: [
                            {
                                name: 'Đặng Văn Đức',
                                attributes: {
                                    id: 'demo-9',
                                    gender: 'male',
                                    generation: 4,
                                    birthYear: 1950,
                                    deathYear: null,
                                    isDeceased: false
                                },
                                children: [
                                    {
                                        name: 'Đặng Văn Em',
                                        attributes: {
                                            id: 'demo-10',
                                            gender: 'male',
                                            generation: 5,
                                            birthYear: 1980,
                                            deathYear: null,
                                            isDeceased: false
                                        },
                                        children: []
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    };

    res.json({
        success: true,
        data: demoTree
    });
});

// Demo anniversaries
app.get('/api/demo/anniversaries', (req, res) => {
    const demoAnniversaries = [
        {
            _id: 'ann-1',
            fullName: 'Đặng Văn Tổ',
            generation: 1,
            anniversaryDate: { lunarDay: 15, lunarMonth: 2 },
            deathDate: '1920-03-10'
        },
        {
            _id: 'ann-2',
            fullName: 'Đặng Văn Nhất',
            generation: 2,
            anniversaryDate: { lunarDay: 8, lunarMonth: 2 },
            deathDate: '1950-04-20'
        },
        {
            _id: 'ann-3',
            fullName: 'Đặng Văn An',
            generation: 3,
            anniversaryDate: { lunarDay: 20, lunarMonth: 2 },
            deathDate: '1980-05-15'
        }
    ];

    res.json({
        success: true,
        data: demoAnniversaries
    });
});

// Demo news
app.get('/api/demo/news', (req, res) => {
    const demoNews = [
        {
            _id: 'news-1',
            title: 'Thông báo: Lễ Giỗ Tổ họ Đặng năm 2024',
            excerpt: 'Kính mời toàn thể bà con họ Đặng về dự lễ Giỗ Tổ năm 2024 tại Từ đường...',
            category: 'gio_to',
            featuredImage: '',
            eventDate: '2024-03-15',
            createdAt: '2024-02-01',
            isPinned: true
        },
        {
            _id: 'news-2',
            title: 'Đại hội họ Đặng Đà Nẵng lần thứ X',
            excerpt: 'Đại hội họ Đặng Đà Nẵng lần thứ X sẽ được tổ chức vào ngày...',
            category: 'dai_hoi',
            featuredImage: '',
            eventDate: '2024-06-20',
            createdAt: '2024-01-15',
            isPinned: false
        },
        {
            _id: 'news-3',
            title: 'Khánh thành nhà thờ chi họ Đặng Văn',
            excerpt: 'Nhà thờ chi họ Đặng Văn đã được khánh thành trong niềm vui của bà con...',
            category: 'tin_tuc',
            featuredImage: '',
            createdAt: '2024-01-01',
            isPinned: false
        }
    ];

    res.json({
        success: true,
        data: demoNews
    });
});

// Demo albums
app.get('/api/demo/albums', (req, res) => {
    const demoAlbums = [
        {
            _id: 'album-1',
            title: 'Từ đường họ Đặng',
            category: 'tu_duong',
            coverImage: '',
            photoCount: 15,
            isFeatured: true
        },
        {
            _id: 'album-2',
            title: 'Họp mặt họ Đặng 2023',
            category: 'hop_mat',
            coverImage: '',
            photoCount: 50,
            isFeatured: true
        },
        {
            _id: 'album-3',
            title: 'Mộ phần các cụ',
            category: 'mo_phan',
            coverImage: '',
            photoCount: 20,
            isFeatured: false
        }
    ];

    res.json({
        success: true,
        data: demoAlbums
    });
});

// Demo members
app.get('/api/demo/members', (req, res) => {
    const demoMembers = [
        { _id: '1', fullName: 'Đặng Văn Tổ', gender: 'male', generation: 1, birthDate: '1850-01-01', deathDate: '1920-03-15', isDeceased: true },
        { _id: '2', fullName: 'Đặng Văn Nhất', gender: 'male', generation: 2, birthDate: '1880-05-10', deathDate: '1950-08-20', isDeceased: true },
        { _id: '3', fullName: 'Đặng Văn Nhì', gender: 'male', generation: 2, birthDate: '1885-07-15', deathDate: '1960-12-25', isDeceased: true },
        { _id: '4', fullName: 'Đặng Văn An', gender: 'male', generation: 3, birthDate: '1910-03-20', deathDate: '1980-11-05', isDeceased: true },
        { _id: '5', fullName: 'Đặng Thị Bình', gender: 'female', generation: 3, birthDate: '1915-09-05', deathDate: '2000-11-10', isDeceased: true },
        { _id: '6', fullName: 'Đặng Văn Cường', gender: 'male', generation: 3, birthDate: '1920-06-12', deathDate: '1995-04-28', isDeceased: true },
        { _id: '7', fullName: 'Đặng Văn Minh', gender: 'male', generation: 4, birthDate: '1945-11-30', isDeceased: false },
        { _id: '8', fullName: 'Đặng Thị Hương', gender: 'female', generation: 4, birthDate: '1948-04-18', isDeceased: false },
        { _id: '9', fullName: 'Đặng Văn Đức', gender: 'male', generation: 4, birthDate: '1950-08-25', isDeceased: false },
        { _id: '10', fullName: 'Đặng Văn Em', gender: 'male', generation: 5, birthDate: '1980-02-14', isDeceased: false },
    ];

    res.json({
        success: true,
        data: demoMembers
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi server',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Không tìm thấy endpoint'
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`
🏛️  Gia Phả Họ Đặng API Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Server: http://localhost:${PORT}
📍 Health: http://localhost:${PORT}/api/health
📍 Demo Tree: http://localhost:${PORT}/api/demo/tree
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});

module.exports = app;
