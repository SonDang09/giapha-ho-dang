/**
 * Script để seed dữ liệu album vào MongoDB
 * Chạy: node scripts/seedAlbums.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Album = require('../models/Album');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI;

const seedAlbums = async () => {
    try {
        console.log('🔗 Đang kết nối MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Đã kết nối MongoDB');

        // Kiểm tra xem đã có dữ liệu chưa
        const existingCount = await Album.countDocuments();
        if (existingCount > 0) {
            console.log(`⚠️ Đã có ${existingCount} album trong database`);
            process.exit(0);
        }

        // Lấy admin user để làm createdBy
        const adminUser = await User.findOne({ role: 'admin_toc' });
        if (!adminUser) {
            console.log('❌ Không tìm thấy admin user. Vui lòng tạo user trước.');
            process.exit(1);
        }
        const createdById = adminUser._id;

        // Tạo album mẫu
        const albumsData = [
            {
                title: 'Từ đường họ Đặng',
                description: 'Hình ảnh từ đường dòng họ Đặng qua các thời kỳ, ghi lại những nét kiến trúc truyền thống và không gian thờ cúng trang nghiêm.',
                category: 'tu_duong',
                coverImage: '',
                photos: [],
                isFeatured: true
            },
            {
                title: 'Họp mặt dòng họ 2023',
                description: 'Những khoảnh khắc đáng nhớ trong buổi họp mặt dòng họ năm 2023. Đông đảo con cháu từ khắp nơi về sum họp.',
                category: 'hop_mat',
                coverImage: '',
                photos: [],
                isFeatured: false
            },
            {
                title: 'Lễ Giỗ Tổ 2024',
                description: 'Album ảnh ghi lại toàn bộ diễn biến lễ giỗ Tổ năm 2024, từ phần nghi thức dâng hương đến bữa cơm đoàn viên.',
                category: 'gio_to',
                coverImage: '',
                photos: [],
                isFeatured: true
            },
            {
                title: 'Trao học bổng 2024',
                description: 'Hình ảnh buổi lễ trao học bổng cho con cháu có thành tích học tập xuất sắc năm 2024.',
                category: 'khac',
                coverImage: '',
                photos: [],
                isFeatured: false
            },
            {
                title: 'Ảnh cổ dòng họ',
                description: 'Bộ sưu tập ảnh cổ quý giá của dòng họ, ghi lại hình ảnh các bậc tiền nhân.',
                category: 'khac',
                coverImage: '',
                photos: [],
                isFeatured: true
            }
        ];

        for (const album of albumsData) {
            await Album.create({ ...album, createdBy: createdById });
            console.log(`✅ Đã tạo: ${album.title}`);
        }

        console.log('\n🎉 Seed thành công! Đã tạo 5 album.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        process.exit(1);
    }
};

seedAlbums();
