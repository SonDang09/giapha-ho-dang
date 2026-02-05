require('dotenv').config();
const mongoose = require('mongoose');

async function seed() {
    await mongoose.connect(process.env.MONGODB_URI);
    const Transaction = require('./models/Transaction');
    const User = require('./models/User');

    const count = await Transaction.countDocuments();
    if (count > 0) {
        console.log('Already have', count, 'transactions');
        process.exit(0);
    }

    const admin = await User.findOne({ role: 'admin_toc' });
    if (!admin) {
        console.log('No admin found');
        process.exit(1);
    }

    const data = [
        { type: 'income', amount: 5000000, description: 'Đóng góp quỹ họ - Đặng Văn Minh', category: 'dong_gop', date: new Date('2024-01-15'), contributor: 'Đặng Văn Minh', createdBy: admin._id },
        { type: 'income', amount: 3000000, description: 'Đóng góp quỹ họ - Đặng Thị Hương', category: 'dong_gop', date: new Date('2024-01-20'), contributor: 'Đặng Thị Hương', createdBy: admin._id },
        { type: 'expense', amount: 2000000, description: 'Chi phí tổ chức giỗ tổ', category: 'gio_to', date: new Date('2024-02-01'), createdBy: admin._id },
        { type: 'income', amount: 10000000, description: 'Quyên góp xây từ đường', category: 'xay_dung', date: new Date('2024-02-05'), contributor: 'Nhiều thành viên', createdBy: admin._id },
        { type: 'expense', amount: 5000000, description: 'Mua vật tư sửa chữa từ đường', category: 'xay_dung', date: new Date('2024-02-10'), createdBy: admin._id },
        { type: 'income', amount: 2000000, description: 'Đóng góp quỹ họ - Đặng Văn Đức', category: 'dong_gop', date: new Date('2024-02-15'), contributor: 'Đặng Văn Đức', createdBy: admin._id }
    ];

    for (const t of data) {
        await Transaction.create(t);
        console.log('Created:', t.description);
    }
    console.log('Done! Created 6 transactions.');
    process.exit(0);
}
seed().catch(e => { console.error(e.message); process.exit(1); });
