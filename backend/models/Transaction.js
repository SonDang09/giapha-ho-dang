const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['income', 'expense'],
        required: [true, 'Loại giao dịch là bắt buộc']
    },
    amount: {
        type: Number,
        required: [true, 'Số tiền là bắt buộc'],
        min: [1000, 'Số tiền tối thiểu là 1,000 VNĐ']
    },
    description: {
        type: String,
        required: [true, 'Mô tả là bắt buộc'],
        trim: true
    },
    category: {
        type: String,
        enum: ['dong_gop', 'gio_to', 'xay_dung', 'sinh_hoat', 'tu_thien', 'hoc_bong', 'khac'],
        default: 'khac'
    },
    date: {
        type: Date,
        default: Date.now
    },
    contributor: {
        type: String,
        trim: true
    },
    // Người tạo giao dịch
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Ghi chú thêm
    notes: {
        type: String,
        trim: true
    },
    // File đính kèm (hóa đơn, biên lai...)
    attachments: [{
        url: String,
        name: String
    }]
}, {
    timestamps: true
});

// Index cho tìm kiếm và sắp xếp
transactionSchema.index({ date: -1 });
transactionSchema.index({ type: 1, date: -1 });
transactionSchema.index({ category: 1 });

// Virtual để format số tiền
transactionSchema.virtual('formattedAmount').get(function () {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(this.amount);
});

// Statics để tính tổng
transactionSchema.statics.getStats = async function () {
    const stats = await this.aggregate([
        {
            $group: {
                _id: '$type',
                total: { $sum: '$amount' },
                count: { $sum: 1 }
            }
        }
    ]);

    const result = {
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        incomeCount: 0,
        expenseCount: 0
    };

    stats.forEach(s => {
        if (s._id === 'income') {
            result.totalIncome = s.total;
            result.incomeCount = s.count;
        } else {
            result.totalExpense = s.total;
            result.expenseCount = s.count;
        }
    });

    result.balance = result.totalIncome - result.totalExpense;
    return result;
};

module.exports = mongoose.model('Transaction', transactionSchema);
