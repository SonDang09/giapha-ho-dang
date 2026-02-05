/**
 * Script để seed dữ liệu thành viên vào MongoDB
 * Chạy: node scripts/seedMembers.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Member = require('../models/Member');

const MONGODB_URI = process.env.MONGODB_URI;

const seedMembers = async () => {
    try {
        console.log('🔗 Đang kết nối MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Đã kết nối MongoDB');

        // Xóa dữ liệu cũ (nếu muốn reset)
        // await Member.deleteMany({});
        // console.log('🗑️ Đã xóa dữ liệu cũ');

        // Kiểm tra xem đã có dữ liệu chưa
        const existingCount = await Member.countDocuments();
        if (existingCount > 0) {
            console.log(`⚠️ Đã có ${existingCount} thành viên trong database`);
            console.log('Nếu muốn reset, bỏ comment dòng deleteMany ở trên');
            process.exit(0);
        }

        // Tạo Tổ (đời 1)
        const to = await Member.create({
            fullName: 'Đặng Văn Tổ',
            gender: 'male',
            generation: 1,
            birthDate: new Date('1850-01-01'),
            deathDate: new Date('1920-03-15'),
            isDeceased: true,
            biography: 'Người sáng lập dòng họ Đặng tại Đà Nẵng. Cụ là một người có công lớn trong việc khai phá và phát triển vùng đất này.',
            anniversaryDate: { lunarDay: 15, lunarMonth: 2 },
            birthOrder: 1
        });
        console.log('✅ Đã tạo: Đặng Văn Tổ (Đời 1)');

        // Tạo con của Tổ (đời 2)
        const nhat = await Member.create({
            fullName: 'Đặng Văn Nhất',
            gender: 'male',
            generation: 2,
            birthDate: new Date('1880-05-10'),
            deathDate: new Date('1950-08-20'),
            isDeceased: true,
            parentId: to._id,
            biography: 'Con trai trưởng của cụ Tổ. Tiếp nối sự nghiệp của cha, phát triển dòng họ.',
            anniversaryDate: { lunarDay: 8, lunarMonth: 7 },
            birthOrder: 1
        });
        console.log('✅ Đã tạo: Đặng Văn Nhất (Đời 2)');

        const nhi = await Member.create({
            fullName: 'Đặng Văn Nhì',
            gender: 'male',
            generation: 2,
            birthDate: new Date('1885-07-15'),
            deathDate: new Date('1960-12-25'),
            isDeceased: true,
            parentId: to._id,
            biography: 'Con trai thứ của cụ Tổ. Có công trong việc mở mang ruộng vườn.',
            anniversaryDate: { lunarDay: 25, lunarMonth: 11 },
            birthOrder: 2
        });
        console.log('✅ Đã tạo: Đặng Văn Nhì (Đời 2)');

        // Tạo cháu (đời 3)
        const an = await Member.create({
            fullName: 'Đặng Văn An',
            gender: 'male',
            generation: 3,
            birthDate: new Date('1910-03-20'),
            deathDate: new Date('1980-11-05'),
            isDeceased: true,
            parentId: nhat._id,
            biography: 'Cháu đích tôn. Là người có học thức cao trong dòng họ.',
            anniversaryDate: { lunarDay: 5, lunarMonth: 10 },
            birthOrder: 1
        });
        console.log('✅ Đã tạo: Đặng Văn An (Đời 3)');

        const binh = await Member.create({
            fullName: 'Đặng Thị Bình',
            gender: 'female',
            generation: 3,
            birthDate: new Date('1915-09-05'),
            deathDate: new Date('2000-11-10'),
            isDeceased: true,
            parentId: nhat._id,
            biography: 'Người phụ nữ mẫu mực, chăm lo cho gia đình và dòng họ.',
            anniversaryDate: { lunarDay: 10, lunarMonth: 10 },
            birthOrder: 2
        });
        console.log('✅ Đã tạo: Đặng Thị Bình (Đời 3)');

        const cuong = await Member.create({
            fullName: 'Đặng Văn Cường',
            gender: 'male',
            generation: 3,
            birthDate: new Date('1920-06-12'),
            deathDate: new Date('1995-04-28'),
            isDeceased: true,
            parentId: nhi._id,
            biography: 'Tham gia cách mạng, có công với đất nước.',
            anniversaryDate: { lunarDay: 28, lunarMonth: 3 },
            birthOrder: 1
        });
        console.log('✅ Đã tạo: Đặng Văn Cường (Đời 3)');

        // Tạo chắt (đời 4)
        const minh = await Member.create({
            fullName: 'Đặng Văn Minh',
            gender: 'male',
            generation: 4,
            birthDate: new Date('1945-03-15'),
            isDeceased: false,
            parentId: an._id,
            biography: 'Giáo viên về hưu, hiện đang sống tại Đà Nẵng.',
            birthOrder: 1
        });
        console.log('✅ Đã tạo: Đặng Văn Minh (Đời 4)');

        const huong = await Member.create({
            fullName: 'Đặng Thị Hương',
            gender: 'female',
            generation: 4,
            birthDate: new Date('1948-07-20'),
            isDeceased: false,
            parentId: an._id,
            biography: 'Bác sĩ về hưu.',
            birthOrder: 2
        });
        console.log('✅ Đã tạo: Đặng Thị Hương (Đời 4)');

        const duc = await Member.create({
            fullName: 'Đặng Văn Đức',
            gender: 'male',
            generation: 4,
            birthDate: new Date('1950-11-08'),
            isDeceased: false,
            parentId: cuong._id,
            biography: 'Doanh nhân thành đạt.',
            birthOrder: 1
        });
        console.log('✅ Đã tạo: Đặng Văn Đức (Đời 4)');

        // Tạo đời 5
        const em = await Member.create({
            fullName: 'Đặng Văn Em',
            gender: 'male',
            generation: 5,
            birthDate: new Date('1980-05-20'),
            isDeceased: false,
            parentId: duc._id,
            biography: 'Kỹ sư CNTT, làm việc tại Sài Gòn.',
            birthOrder: 1
        });
        console.log('✅ Đã tạo: Đặng Văn Em (Đời 5)');

        console.log('\n🎉 Seed thành công! Đã tạo 10 thành viên.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        process.exit(1);
    }
};

seedMembers();
