import { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button, Modal, Form, Input, InputNumber, Select, DatePicker, Statistic, Tag, Space, message, Spin, Empty } from 'antd';
import {
    DollarOutlined,
    PlusOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
    BankOutlined,
    WalletOutlined,
    HistoryOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAuth } from '../../context/AuthContext';

const FundPage = () => {
    const { canEdit } = useAuth();
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState([]);
    const [stats, setStats] = useState({
        balance: 0,
        totalIn: 0,
        totalOut: 0
    });
    const [modalVisible, setModalVisible] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        loadTransactions();
    }, []);

    const loadTransactions = async () => {
        setLoading(true);
        try {
            // Demo transactions
            const demoTransactions = [
                { _id: '1', type: 'income', amount: 5000000, description: 'Đóng góp quỹ họ - Đặng Văn Minh', category: 'dong_gop', date: '2024-01-15', contributor: 'Đặng Văn Minh' },
                { _id: '2', type: 'income', amount: 3000000, description: 'Đóng góp quỹ họ - Đặng Thị Hương', category: 'dong_gop', date: '2024-01-20', contributor: 'Đặng Thị Hương' },
                { _id: '3', type: 'expense', amount: 2000000, description: 'Chi phí tổ chức giỗ tổ', category: 'gio_to', date: '2024-02-01' },
                { _id: '4', type: 'income', amount: 10000000, description: 'Quyên góp xây từ đường', category: 'xay_dung', date: '2024-02-05', contributor: 'Nhiều thành viên' },
                { _id: '5', type: 'expense', amount: 5000000, description: 'Mua vật tư sửa chữa từ đường', category: 'xay_dung', date: '2024-02-10' },
                { _id: '6', type: 'income', amount: 2000000, description: 'Đóng góp quỹ họ - Đặng Văn Đức', category: 'dong_gop', date: '2024-02-15', contributor: 'Đặng Văn Đức' },
                { _id: '7', type: 'expense', amount: 1500000, description: 'Chi phí họp mặt đầu năm', category: 'sinh_hoat', date: '2024-02-18' },
                { _id: '8', type: 'income', amount: 1000000, description: 'Lãi tiết kiệm ngân hàng', category: 'khac', date: '2024-02-20' }
            ];

            setTransactions(demoTransactions);
            calculateStats(demoTransactions);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (trans) => {
        const totalIn = trans.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const totalOut = trans.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        setStats({
            balance: totalIn - totalOut,
            totalIn,
            totalOut
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const handleAddTransaction = async (values) => {
        const newTransaction = {
            _id: Date.now().toString(),
            ...values,
            date: values.date.format('YYYY-MM-DD')
        };

        const updated = [newTransaction, ...transactions];
        setTransactions(updated);
        calculateStats(updated);

        message.success('Đã thêm giao dịch');
        setModalVisible(false);
        form.resetFields();
    };

    const getCategoryLabel = (cat) => {
        const labels = {
            dong_gop: 'Đóng góp',
            gio_to: 'Giỗ tổ',
            xay_dung: 'Xây dựng',
            sinh_hoat: 'Sinh hoạt',
            tu_thien: 'Từ thiện',
            khac: 'Khác'
        };
        return labels[cat] || cat;
    };

    const getCategoryColor = (cat) => {
        const colors = {
            dong_gop: 'green',
            gio_to: 'gold',
            xay_dung: 'blue',
            sinh_hoat: 'purple',
            tu_thien: 'cyan',
            khac: 'default'
        };
        return colors[cat] || 'default';
    };

    const columns = [
        {
            title: 'Ngày',
            dataIndex: 'date',
            key: 'date',
            render: (date) => dayjs(date).format('DD/MM/YYYY'),
            width: 110
        },
        {
            title: 'Loại',
            dataIndex: 'type',
            key: 'type',
            render: (type) => (
                <Tag color={type === 'income' ? 'green' : 'red'}>
                    {type === 'income' ? (
                        <><ArrowUpOutlined /> Thu</>
                    ) : (
                        <><ArrowDownOutlined /> Chi</>
                    )}
                </Tag>
            ),
            width: 80
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description'
        },
        {
            title: 'Danh mục',
            dataIndex: 'category',
            key: 'category',
            render: (cat) => <Tag color={getCategoryColor(cat)}>{getCategoryLabel(cat)}</Tag>,
            width: 100
        },
        {
            title: 'Số tiền',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount, record) => (
                <span style={{
                    color: record.type === 'income' ? '#52c41a' : '#f5222d',
                    fontWeight: 600
                }}>
                    {record.type === 'income' ? '+' : '-'}{formatCurrency(amount)}
                </span>
            ),
            width: 150,
            align: 'right'
        }
    ];

    if (loading) {
        return (
            <div className="flex-center" style={{ minHeight: 400 }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
                <h1 className="page-title" style={{ margin: 0 }}>
                    <WalletOutlined style={{ color: '#D4AF37' }} /> Quỹ Dòng Họ
                </h1>

                {canEdit() && (
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setModalVisible(true)}
                    >
                        Thêm giao dịch
                    </Button>
                )}
            </div>

            {/* Stats Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={8}>
                    <Card bordered={false} style={{ background: 'linear-gradient(135deg, #228B22 0%, #2aa52a 100%)' }}>
                        <Statistic
                            title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Số dư hiện tại</span>}
                            value={stats.balance}
                            prefix={<BankOutlined />}
                            valueStyle={{ color: 'white', fontSize: 28 }}
                            formatter={(value) => formatCurrency(value)}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={8}>
                    <Card bordered={false}>
                        <Statistic
                            title="Tổng thu"
                            value={stats.totalIn}
                            prefix={<ArrowUpOutlined style={{ color: '#52c41a' }} />}
                            valueStyle={{ color: '#52c41a' }}
                            formatter={(value) => formatCurrency(value)}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={8}>
                    <Card bordered={false}>
                        <Statistic
                            title="Tổng chi"
                            value={stats.totalOut}
                            prefix={<ArrowDownOutlined style={{ color: '#f5222d' }} />}
                            valueStyle={{ color: '#f5222d' }}
                            formatter={(value) => formatCurrency(value)}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Quick Summary */}
            <Card bordered={false} style={{ marginBottom: 24, background: '#fffbe6', border: '1px solid #ffe58f' }}>
                <Row gutter={16} align="middle">
                    <Col flex="auto">
                        <div style={{ fontSize: 16 }}>
                            <strong>💰 Thông tin quỹ:</strong> Quỹ dòng họ được sử dụng cho các hoạt động chung như
                            tổ chức giỗ tổ, xây dựng và tu sửa từ đường, hỗ trợ thành viên khó khăn, và các hoạt động sinh hoạt dòng họ.
                        </div>
                    </Col>
                </Row>
            </Card>

            {/* Transactions Table */}
            <Card
                title={<span><HistoryOutlined /> Lịch sử giao dịch</span>}
                bordered={false}
            >
                <Table
                    columns={columns}
                    dataSource={transactions}
                    rowKey="_id"
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 600 }}
                />
            </Card>

            {/* Add Transaction Modal */}
            <Modal
                title="Thêm giao dịch mới"
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                }}
                footer={null}
                width={500}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleAddTransaction}
                    initialValues={{ type: 'income', date: dayjs() }}
                >
                    <Form.Item
                        name="type"
                        label="Loại giao dịch"
                        rules={[{ required: true }]}
                    >
                        <Select>
                            <Select.Option value="income">
                                <ArrowUpOutlined style={{ color: '#52c41a' }} /> Thu
                            </Select.Option>
                            <Select.Option value="expense">
                                <ArrowDownOutlined style={{ color: '#f5222d' }} /> Chi
                            </Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="amount"
                        label="Số tiền (VNĐ)"
                        rules={[{ required: true, message: 'Vui lòng nhập số tiền' }]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            min={1000}
                            step={100000}
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                            placeholder="VD: 1,000,000"
                        />
                    </Form.Item>

                    <Form.Item
                        name="category"
                        label="Danh mục"
                        rules={[{ required: true }]}
                    >
                        <Select placeholder="Chọn danh mục">
                            <Select.Option value="dong_gop">Đóng góp</Select.Option>
                            <Select.Option value="gio_to">Giỗ tổ</Select.Option>
                            <Select.Option value="xay_dung">Xây dựng</Select.Option>
                            <Select.Option value="sinh_hoat">Sinh hoạt</Select.Option>
                            <Select.Option value="tu_thien">Từ thiện</Select.Option>
                            <Select.Option value="khac">Khác</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Mô tả"
                        rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
                    >
                        <Input.TextArea rows={3} placeholder="VD: Đóng góp quỹ họ - Đặng Văn A" />
                    </Form.Item>

                    <Form.Item
                        name="date"
                        label="Ngày"
                        rules={[{ required: true }]}
                    >
                        <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={() => setModalVisible(false)}>Hủy</Button>
                            <Button type="primary" htmlType="submit">Thêm giao dịch</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default FundPage;
