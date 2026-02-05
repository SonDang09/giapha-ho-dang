/**
 * Script để seed dữ liệu giao dịch quỹ vào MongoDB
 * Chạy: node scripts/seedTransactions.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI;

const seedTransactions = async () => {
    try {
        console.log('🔗 Đang kết nối MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Đã kết nối MongoDB');

        // Kiểm tra xem đã có dữ liệu chưa
        const existingCount = await Transaction.countDocuments();
        if (existingCount > 0) {
            console.log(`⚠️ Đã có ${existingCount} giao dịch trong database`);
            process.exit(0);
        }

        // Lấy admin user để làm createdBy
        const adminUser = await User.findOne({ role: 'admin_toc' });
        if (!adminUser) {
            console.log('❌ Không tìm thấy admin user. Vui lòng tạo user trước.');
            process.exit(1);
        }
        const createdById = adminUser._id;

        // Tạo giao dịch mẫu
        const transactionsData = [
            {
                type: 'income',
                amount: 5000000,
                description: 'Đóng góp quỹ họ - Đặng Văn Minh',
                category: 'dong_gop',
                date: new Date('2024-01-15'),
                contributor: 'Đặng Văn Minh'
            },
            {
                type: 'income',
                amount: 3000000,
                description: 'Đóng góp quỹ họ - Đặng Thị Hương',
                category: 'dong_gop',
                date: new Date('2024-01-20'),
                contributor: 'Đặng Thị Hương'
            },
            {
                type: 'expense',
                amount: 2000000,
                description: 'Chi phí tổ chức giỗ tổ',
                category: 'gio_to',
                date: new Date('2024-02-01')
            },
            {
                type: 'income',
                amount: 10000000,
                description: 'Quyên góp xây từ đường',
                category: 'xay_dung',
                date: new Date('2024-02-05'),
                contributor: 'Nhiều thành viên'
            },
            {
                type: 'expense',
                amount: 5000000,
                description: 'Mua vật tư sửa chữa từ đường',
                category: 'xay_dung',
                date: new Date('2024-02-10')
            },
            {
                type: 'income',
                amount: 2000000,
                description: 'Đóng góp quỹ họ - Đặng Văn Đức',
                category: 'dong_gop',
                date: new Date('2024-02-15'),
                contributor: 'Đặng Văn Đức'
            },
            {
                type: 'expense',
                amount: 1500000,
                description: 'Chi phí họp mặt đầu năm',
                category: 'sinh_hoat',
                date: new Date('2024-02-18')
            },
            {
                type: 'income',
                amount: 1000000,
                description: 'Lãi tiết kiệm ngân hàng',
                category: 'khac',
                date: new Date('2024-02-20')
            }
        ];

        for (const trans of transactionsData) {
            await Transaction.create({ ...trans, createdBy: createdById });
            console.log(`✅ Đã tạo: ${trans.description}`);
        }

        console.log('\n🎉 Seed thành công! Đã tạo 8 giao dịch.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        process.exit(1);
    }
};

seedTransactions();
