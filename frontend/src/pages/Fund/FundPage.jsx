import { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button, Modal, Form, Input, InputNumber, Select, DatePicker, Statistic, Tag, Space, message, Spin, Empty, Popconfirm, Alert } from 'antd';
import {
    DollarOutlined,
    PlusOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
    BankOutlined,
    WalletOutlined,
    HistoryOutlined,
    EditOutlined,
    DeleteOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAuth } from '../../context/AuthContext';
import { transactionsAPI } from '../../api';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const FundPage = () => {
    useDocumentTitle('Quỹ Dòng Họ');
    const { canEdit, isAdmin } = useAuth();
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState([]);
    const [stats, setStats] = useState({
        balance: 0,
        totalIncome: 0,
        totalExpense: 0
    });
    const [modalVisible, setModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [apiConnected, setApiConnected] = useState(true);
    const [form] = Form.useForm();

    useEffect(() => {
        loadTransactions();
    }, []);

    const loadTransactions = async () => {
        setLoading(true);
        try {
            const [transRes, statsRes] = await Promise.all([
                transactionsAPI.getAll(),
                transactionsAPI.getStats()
            ]);

            setTransactions(transRes.data.data || []);
            setStats(statsRes.data.data || { balance: 0, totalIncome: 0, totalExpense: 0 });
            setApiConnected(true);
        } catch (error) {
            console.error('Load transactions error:', error);
            setApiConnected(false);
            // Fallback to demo data
            const demoTransactions = [
                { _id: 'demo1', type: 'income', amount: 5000000, description: 'Đóng góp quỹ họ - Đặng Văn Minh', category: 'dong_gop', date: '2024-01-15', contributor: 'Đặng Văn Minh' },
                { _id: 'demo2', type: 'income', amount: 3000000, description: 'Đóng góp quỹ họ - Đặng Thị Hương', category: 'dong_gop', date: '2024-01-20', contributor: 'Đặng Thị Hương' },
                { _id: 'demo3', type: 'expense', amount: 2000000, description: 'Chi phí tổ chức giỗ tổ', category: 'gio_to', date: '2024-02-01' }
            ];
            setTransactions(demoTransactions);
            calculateStats(demoTransactions);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (trans) => {
        const totalIncome = trans.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const totalExpense = trans.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        setStats({
            balance: totalIncome - totalExpense,
            totalIncome,
            totalExpense
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const handleSubmit = async (values) => {
        try {
            const data = {
                ...values,
                date: values.date ? values.date.format('YYYY-MM-DD') : new Date().toISOString()
            };

            if (editingItem) {
                await transactionsAPI.update(editingItem._id, data);
                message.success('Cập nhật giao dịch thành công!');
            } else {
                await transactionsAPI.create(data);
                message.success('Thêm giao dịch thành công!');
            }

            setModalVisible(false);
            setEditingItem(null);
            form.resetFields();
            loadTransactions();
        } catch (error) {
            console.error('Submit error:', error);
            message.error(error.response?.data?.message || 'Có lỗi xảy ra! Vui lòng thử lại.');
        }
    };

    const handleEdit = (record) => {
        setEditingItem(record);
        form.setFieldsValue({
            ...record,
            date: record.date ? dayjs(record.date) : null
        });
        setModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            await transactionsAPI.delete(id);
            message.success('Xóa giao dịch thành công!');
            loadTransactions();
        } catch (error) {
            console.error('Delete error:', error);
            message.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa!');
        }
    };

    const getCategoryLabel = (cat) => {
        const labels = {
            dong_gop: 'Đóng góp',
            gio_to: 'Giỗ tổ',
            xay_dung: 'Xây dựng',
            sinh_hoat: 'Sinh hoạt',
            tu_thien: 'Từ thiện',
            hoc_bong: 'Học bổng',
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
            hoc_bong: 'magenta',
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
        },
        ...(canEdit() ? [{
            title: 'Thao tác',
            key: 'actions',
            width: 100,
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                        disabled={record._id?.startsWith('demo')}
                    />
                    {isAdmin() && (
                        <Popconfirm
                            title="Xóa giao dịch này?"
                            onConfirm={() => handleDelete(record._id)}
                            disabled={record._id?.startsWith('demo')}
                        >
                            <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                disabled={record._id?.startsWith('demo')}
                            />
                        </Popconfirm>
                    )}
                </Space>
            )
        }] : [])
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

                <Space>
                    <Button icon={<ReloadOutlined />} onClick={loadTransactions}>
                        Tải lại
                    </Button>
                    {canEdit() && (
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => {
                                setEditingItem(null);
                                form.resetFields();
                                setModalVisible(true);
                            }}
                        >
                            Thêm giao dịch
                        </Button>
                    )}
                </Space>
            </div>

            {!apiConnected && (
                <Alert
                    message="Đang sử dụng dữ liệu demo"
                    description="Không thể kết nối API. Các thay đổi sẽ không được lưu."
                    type="warning"
                    showIcon
                    style={{ marginBottom: 16 }}
                />
            )}

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
                            value={stats.totalIncome}
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
                            value={stats.totalExpense}
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
                title={<span><HistoryOutlined /> Lịch sử giao dịch ({transactions.length})</span>}
                bordered={false}
            >
                {transactions.length === 0 ? (
                    <Empty description="Chưa có giao dịch nào" />
                ) : (
                    <Table
                        columns={columns}
                        dataSource={transactions}
                        rowKey="_id"
                        pagination={{ pageSize: 10 }}
                        scroll={{ x: 600 }}
                    />
                )}
            </Card>

            {/* Add/Edit Transaction Modal */}
            <Modal
                title={editingItem ? 'Sửa giao dịch' : 'Thêm giao dịch mới'}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    setEditingItem(null);
                    form.resetFields();
                }}
                footer={null}
                width={500}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{ type: 'income', date: dayjs(), category: 'dong_gop' }}
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
                            <Select.Option value="hoc_bong">Học bổng</Select.Option>
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
                        name="contributor"
                        label="Người đóng góp (nếu có)"
                    >
                        <Input placeholder="VD: Đặng Văn Minh" />
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
                            <Button type="primary" htmlType="submit">
                                {editingItem ? 'Cập nhật' : 'Thêm giao dịch'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default FundPage;
