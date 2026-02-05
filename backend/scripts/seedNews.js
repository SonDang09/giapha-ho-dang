/**
 * Script để seed dữ liệu tin tức vào MongoDB
 * Chạy: node scripts/seedNews.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const News = require('../models/News');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI;

const seedNews = async () => {
    try {
        console.log('🔗 Đang kết nối MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Đã kết nối MongoDB');

        // Kiểm tra xem đã có dữ liệu chưa
        const existingCount = await News.countDocuments();
        if (existingCount > 0) {
            console.log(`⚠️ Đã có ${existingCount} tin tức trong database`);
            process.exit(0);
        }

        // Lấy admin user để làm author
        const adminUser = await User.findOne({ role: 'admin_toc' });
        if (!adminUser) {
            console.log('❌ Không tìm thấy admin user. Vui lòng tạo user trước.');
            process.exit(1);
        }
        const authorId = adminUser._id;

        // Tạo tin tức mẫu
        const newsData = [
            {
                title: 'Lễ Giỗ Tổ năm 2024',
                slug: 'le-gio-to-nam-2024',
                content: 'Lễ giỗ Tổ năm nay được tổ chức trang trọng tại từ đường họ Đặng. Đông đảo con cháu từ khắp nơi về tham dự, thể hiện truyền thống uống nước nhớ nguồn của dòng họ. Buổi lễ bắt đầu từ 7h sáng với nghi thức dâng hương, tiếp theo là phần đọc văn tế và cuối cùng là bữa cơm đoàn viên.',
                summary: 'Lễ giỗ Tổ năm nay được tổ chức trang trọng tại từ đường họ Đặng với sự tham dự của đông đảo con cháu.',
                category: 'gio_to',
                isPublished: true,
                viewCount: 156,
                eventDate: new Date('2024-03-15')
            },
            {
                title: 'Đại hội họ Đặng lần thứ X',
                slug: 'dai-hoi-ho-dang-lan-thu-x',
                content: 'Đại hội họ Đặng lần thứ X đã diễn ra thành công tốt đẹp. Hội nghị đã bầu ra Ban chấp hành mới nhiệm kỳ 2024-2029, thông qua phương hướng hoạt động và các quyết định quan trọng về việc trùng tu từ đường và hỗ trợ con cháu học tập.',
                summary: 'Đại hội họ Đặng lần thứ X thành công tốt đẹp, bầu ra Ban chấp hành mới.',
                category: 'dai_hoi',
                isPublished: true,
                viewCount: 234,
                eventDate: new Date('2024-02-01')
            },
            {
                title: 'Trao học bổng cho con cháu xuất sắc',
                slug: 'trao-hoc-bong-cho-con-chau-xuat-sac',
                content: 'Hội đồng gia tộc đã trao tặng 20 suất học bổng cho con cháu có thành tích học tập xuất sắc. Đây là hoạt động thường niên nhằm khuyến khích tinh thần hiếu học trong dòng họ.',
                summary: 'Trao 20 suất học bổng cho con cháu có thành tích học tập xuất sắc.',
                category: 'tin_tuc',
                isPublished: true,
                viewCount: 89,
                eventDate: new Date('2024-06-01')
            },
            {
                title: 'Thông báo: Họp mặt cuối năm 2024',
                slug: 'thong-bao-hop-mat-cuoi-nam-2024',
                content: 'Kính mời toàn thể bà con dòng họ tham dự buổi họp mặt cuối năm 2024 tại từ đường vào ngày 25 tháng Chạp. Đây là dịp để bà con sum họp, chia sẻ và cùng nhau chuẩn bị đón Tết cổ truyền.',
                summary: 'Thông báo họp mặt cuối năm 2024 tại từ đường.',
                category: 'thong_bao',
                isPublished: true,
                viewCount: 45,
                eventDate: new Date('2024-12-25')
            },
            {
                title: 'Trùng tu từ đường họ Đặng',
                slug: 'trung-tu-tu-duong-ho-dang',
                content: 'Dự án trùng tu từ đường đã hoàn thành giai đoạn 1. Công trình được sửa chữa mái ngói, sơn mới tường và nâng cấp khuôn viên. Tổng kinh phí giai đoạn này là 500 triệu đồng, được đóng góp từ con cháu trong và ngoài nước.',
                summary: 'Hoàn thành giai đoạn 1 trùng tu từ đường với kinh phí 500 triệu đồng.',
                category: 'khac',
                isPublished: true,
                viewCount: 178,
                eventDate: new Date('2024-05-20')
            }
        ];

        for (const news of newsData) {
            await News.create({ ...news, author: authorId });
            console.log(`✅ Đã tạo: ${news.title}`);
        }

        console.log('\n🎉 Seed thành công! Đã tạo 5 tin tức.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        process.exit(1);
    }
};

seedNews();
