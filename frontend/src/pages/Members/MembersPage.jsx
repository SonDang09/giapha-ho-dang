import { useState, useEffect } from 'react';
import { Table, Card, Button, Space, Input, Tag, Avatar, Modal, Form, Select, DatePicker, message, Popconfirm, Alert, Row, Col, Segmented } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, ManOutlined, WomanOutlined, FilePdfOutlined, TableOutlined, AppstoreOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { membersAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { exportToPDF } from '../../utils/export';
import dayjs from 'dayjs';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const { Search } = Input;
const { TextArea } = Input;

const MembersPage = () => {
    useDocumentTitle('Thành Viên', 'Danh sách thành viên họ Đặng Đà Nẵng qua các thế hệ. Tìm kiếm, tra cứu thông tin chi tiết và xuất dữ liệu gia phả.');
    const { canEdit, isAdmin } = useAuth();
    const [loading, setLoading] = useState(true);
    const [members, setMembers] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
    const [searchText, setSearchText] = useState('');
    const [filterGeneration, setFilterGeneration] = useState(null);
    const [filterStatus, setFilterStatus] = useState(null);
    const [availableGenerations, setAvailableGenerations] = useState([]);
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'
    const [modalVisible, setModalVisible] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [apiConnected, setApiConnected] = useState(true);
    const [apiError, setApiError] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [form] = Form.useForm();

    useEffect(() => {
        loadMembers();
    }, [pagination.page, searchText, filterGeneration, filterStatus]);

    // Auto-retry every 5 seconds when API fails (Render cold start)
    useEffect(() => {
        if (!apiError) return;
        const timer = setTimeout(() => {
            setRetryCount(prev => prev + 1);
            loadMembers();
        }, 5000);
        return () => clearTimeout(timer);
    }, [apiError, retryCount]);

    const loadMembers = async () => {
        setLoading(true);
        try {
            const response = await membersAPI.getAll({
                page: pagination.page,
                limit: pagination.limit,
                search: searchText || undefined,
                generation: filterGeneration || undefined,
                deceased: filterStatus === 'deceased' ? 'true' : filterStatus === 'alive' ? 'false' : undefined
            });

            const data = response?.data?.data || [];
            setMembers(data);
            setPagination(prev => ({
                ...prev,
                total: response.data.pagination?.total || data.length
            }));
            const gens = [...new Set(data.map(m => m.generation))].filter(Boolean).sort((a, b) => a - b);
            if (gens.length > 0) setAvailableGenerations(gens);
            setApiConnected(true);
            setApiError(false);
        } catch (error) {
            console.log('API not available, retrying...', error.message);
            setApiConnected(false);
            setApiError(true);
        } finally {
            setLoading(false);
        }
    };

    // Only show action column if user can edit
    const columns = [
        {
            title: 'Thành viên',
            key: 'member',
            render: (_, record) => (
                <Space>
                    <div style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        border: `3px solid ${record.gender === 'male' ? '#8B0000' : '#1B5E20'}`,
                        overflow: 'hidden',
                        background: '#E8E8E8',
                        flexShrink: 0
                    }}>
                        <img
                            src={record.avatar || (record.gender === 'male' ? '/avatar-male.png' : '/avatar-female.png')}
                            alt={record.fullName}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                        />
                    </div>
                    <div>
                        <Link to={`/members/${record._id}`} style={{ fontWeight: 500, color: '#333' }}>{record.fullName}</Link>
                        <div style={{ fontSize: 12, color: '#64748b' }}>
                            {record.birthDate && dayjs(record.birthDate).format('YYYY')}
                            {record.deathDate && ` - ${dayjs(record.deathDate).format('YYYY')}`}
                        </div>
                    </div>
                </Space>
            )
        },
        {
            title: 'Giới tính',
            dataIndex: 'gender',
            key: 'gender',
            width: 100,
            render: (gender) => (
                <Tag color={gender === 'male' ? 'blue' : 'pink'}>
                    {gender === 'male' ? 'Nam' : 'Nữ'}
                </Tag>
            )
        },
        {
            title: 'Đời thứ',
            dataIndex: 'generation',
            key: 'generation',
            width: 100,
            render: (gen) => <Tag color="gold">Đời {gen}</Tag>
        },
        {
            title: 'Trạng thái',
            key: 'status',
            width: 100,
            render: (_, record) => (
                record.isDeceased ?
                    <Tag color="default">Đã mất</Tag> :
                    <Tag color="green">Còn sống</Tag>
            )
        },
        {
            title: 'Nơi sống',
            dataIndex: 'currentResidence',
            key: 'currentResidence',
            width: 150,
            render: (residence) => residence || '-'
        },
        // Only include action column if user can edit
        ...(canEdit() ? [{
            title: 'Hành động',
            key: 'actions',
            width: 120,
            render: (_, record) => (
                <Space>
                    <Button
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    />
                    {isAdmin() && (
                        <Popconfirm
                            title="Xác nhận xóa thành viên này?"
                            onConfirm={() => handleDelete(record._id)}
                        >
                            <Button size="small" danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                    )}
                </Space>
            )
        }] : [])
    ];

    const handleEdit = (member) => {
        setEditingMember(member);
        form.setFieldsValue({
            ...member,
            birthDate: member.birthDate ? dayjs(member.birthDate) : null,
            deathDate: member.deathDate ? dayjs(member.deathDate) : null
        });
        setModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            await membersAPI.delete(id);
            message.success('Đã xóa thành viên');
            loadMembers();
        } catch (error) {
            message.error(error.response?.data?.message || 'Không thể xóa thành viên');
        }
    };

    const handleSubmit = async (values) => {
        try {
            const data = {
                ...values,
                birthDate: values.birthDate?.format('YYYY-MM-DD'),
                deathDate: values.deathDate?.format('YYYY-MM-DD'),
                isDeceased: !!values.deathDate
            };

            if (editingMember) {
                await membersAPI.update(editingMember._id, data);
                message.success('Đã cập nhật thành viên');
            } else {
                await membersAPI.create(data);
                message.success('Đã thêm thành viên mới');
            }

            setModalVisible(false);
            form.resetFields();
            setEditingMember(null);
            loadMembers();
        } catch (error) {
            console.error('Submit error:', error);
            message.error(error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng kiểm tra quyền truy cập.');
        }
    };

    return (
        <div className="page-container">
            {!apiConnected && (
                <Alert
                    type="warning"
                    message="Đang kết nối đến máy chủ..."
                    description={
                        <div>
                            <p style={{ margin: '4px 0' }}>Máy chủ đang khởi động, vui lòng đợi trong giây lát (thường mất 30-60 giây).</p>
                            <Button size="small" type="primary" loading={loading} onClick={() => { setRetryCount(prev => prev + 1); loadMembers(); }}>
                                Thử lại ngay
                            </Button>
                        </div>
                    }
                    style={{ marginBottom: 16 }}
                    showIcon
                />
            )}

            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                <h1 className="page-title" style={{ margin: 0 }}>
                    <UserOutlined style={{ color: '#D4AF37' }} /> Danh Sách Thành Viên
                </h1>

                <Space wrap>
                    <Select
                        placeholder="Lọc theo đời"
                        allowClear
                        style={{ width: 130 }}
                        value={filterGeneration}
                        onChange={setFilterGeneration}
                    >
                        {availableGenerations.map(i => (
                            <Select.Option key={i} value={i}>Đời {i}</Select.Option>
                        ))}
                    </Select>
                    <Select
                        placeholder="Trạng thái"
                        allowClear
                        style={{ width: 130 }}
                        value={filterStatus}
                        onChange={setFilterStatus}
                    >
                        <Select.Option value="alive">Còn sống</Select.Option>
                        <Select.Option value="deceased">Đã mất</Select.Option>
                    </Select>
                    <Search
                        placeholder="Tìm kiếm..."
                        allowClear
                        onSearch={setSearchText}
                        style={{ width: 200 }}
                    />
                    <Segmented
                        value={viewMode}
                        onChange={setViewMode}
                        options={[
                            { value: 'table', icon: <TableOutlined /> },
                            { value: 'card', icon: <AppstoreOutlined /> }
                        ]}
                    />
                    <Button
                        icon={<FilePdfOutlined />}
                        onClick={async () => {
                            message.loading('Đang xuất PDF...', 1);
                            try {
                                await exportToPDF(members);
                                message.success('Xuất PDF thành công!');
                            } catch (error) {
                                console.error('Export error:', error);
                                message.error('Có lỗi khi xuất PDF: ' + error.message);
                            }
                        }}
                    >
                        Xuất PDF
                    </Button>
                    {canEdit() && (
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => {
                                setEditingMember(null);
                                form.resetFields();
                                setModalVisible(true);
                            }}
                        >
                            Thêm mới
                        </Button>
                    )}
                </Space>
            </div>

            {viewMode === 'table' ? (
                <Table
                    columns={columns}
                    dataSource={members}
                    rowKey="_id"
                    loading={loading}
                    pagination={{
                        current: pagination.page,
                        pageSize: pagination.limit,
                        total: pagination.total,
                        onChange: (page) => setPagination(prev => ({ ...prev, page }))
                    }}
                    scroll={{ x: 600 }}
                />
            ) : (
                <div style={{ marginTop: 16 }}>
                    {/* Group members by generation */}
                    {[...new Set(members.map(m => m.generation))].sort((a, b) => a - b).map(gen => (
                        <div key={gen} style={{ marginBottom: 24 }}>
                            {/* Generation Header */}
                            <div style={{
                                background: 'linear-gradient(135deg, #DAA520 0%, #B8860B 100%)',
                                color: 'white',
                                padding: '8px 16px',
                                borderRadius: 8,
                                marginBottom: 16,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8
                            }}>
                                <span style={{ fontSize: 18, fontWeight: 'bold' }}>Đời {gen}</span>
                                <Tag color="white" style={{ color: '#B8860B', marginLeft: 8 }}>
                                    {members.filter(m => m.generation === gen).length} người
                                </Tag>
                            </div>

                            {/* Members in this generation */}
                            <Row gutter={[16, 16]}>
                                {members.filter(m => m.generation === gen).map(member => (
                                    <Col xs={24} sm={12} md={8} lg={6} key={member._id}>
                                        <Card
                                            hoverable
                                            style={{
                                                borderRadius: 12,
                                                overflow: 'visible',
                                                border: `2px solid ${member.gender === 'male' ? '#8B0000' : '#1B5E20'}`,
                                                marginTop: 20
                                            }}
                                            styles={{ body: { padding: 0, overflow: 'visible' } }}
                                        >
                                            {/* Header with gradient */}
                                            <div style={{
                                                background: member.gender === 'male'
                                                    ? 'linear-gradient(135deg, #8B0000 0%, #CD5C5C 100%)'
                                                    : 'linear-gradient(135deg, #1B5E20 0%, #4CAF50 100%)',
                                                height: 40,
                                                borderRadius: '10px 10px 0 0'
                                            }} />

                                            {/* Avatar */}
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                marginTop: -30
                                            }}>
                                                <div style={{
                                                    width: 60,
                                                    height: 60,
                                                    borderRadius: '50%',
                                                    border: '3px solid white',
                                                    overflow: 'hidden',
                                                    background: '#E8E8E8',
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                                                }}>
                                                    <img
                                                        src={member.avatar || (member.gender === 'male' ? '/avatar-male.png' : '/avatar-female.png')}
                                                        alt={member.fullName}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Info */}
                                            <div style={{ padding: '10px 12px', textAlign: 'center' }}>
                                                <Link to={`/members/${member._id}`}>
                                                    <h4 style={{ margin: '0 0 4px', fontSize: 14, color: '#333' }}>{member.fullName}</h4>
                                                </Link>
                                                <div style={{ color: '#666', fontSize: 12, marginBottom: 6 }}>
                                                    {member.birthDate && dayjs(member.birthDate).format('YYYY')}
                                                    {member.deathDate ? ` - ${dayjs(member.deathDate).format('YYYY')}` : ' - nay'}
                                                </div>
                                                {member.currentResidence && (
                                                    <div style={{ color: '#888', fontSize: 11, marginBottom: 4 }}>
                                                        📍 {member.currentResidence}
                                                    </div>
                                                )}
                                                <Tag color={member.isDeceased ? 'default' : 'green'} style={{ fontSize: 11 }}>
                                                    {member.isDeceased ? 'Đã mất' : 'Còn sống'}
                                                </Tag>

                                                {/* Action buttons */}
                                                {canEdit() && (
                                                    <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center', gap: 4 }}>
                                                        <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(member)} />
                                                        {isAdmin() && (
                                                            <Popconfirm title="Xác nhận xóa?" onConfirm={() => handleDelete(member._id)}>
                                                                <Button size="small" danger icon={<DeleteOutlined />} />
                                                            </Popconfirm>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            <Modal
                title={editingMember ? 'Chỉnh sửa thành viên' : 'Thêm thành viên mới'}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                    setEditingMember(null);
                }}
                footer={null}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        name="fullName"
                        label="Họ và tên"
                        rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                    >
                        <Input placeholder="VD: Đặng Văn An" />
                    </Form.Item>

                    <Space style={{ width: '100%' }} size="large">
                        <Form.Item
                            name="gender"
                            label="Giới tính"
                            rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}
                            style={{ flex: 1 }}
                        >
                            <Select placeholder="Chọn giới tính">
                                <Select.Option value="male">Nam</Select.Option>
                                <Select.Option value="female">Nữ</Select.Option>
                                <Select.Option value="other">Khác</Select.Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="generation"
                            label="Đời thứ"
                            rules={[{ required: true, message: 'Vui lòng nhập đời thứ' }]}
                            style={{ flex: 1 }}
                        >
                            <Select placeholder="Chọn đời">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                                    <Select.Option key={i} value={i}>Đời {i}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Space>

                    <Space style={{ width: '100%' }} size="large">
                        <Form.Item name="birthDate" label="Ngày sinh" style={{ flex: 1 }}>
                            <DatePicker style={{ width: '100%' }} placeholder="Chọn ngày sinh" format="DD/MM/YYYY" />
                        </Form.Item>

                        <Form.Item name="deathDate" label="Ngày mất" style={{ flex: 1 }}>
                            <DatePicker style={{ width: '100%' }} placeholder="Chọn ngày mất (nếu có)" format="DD/MM/YYYY" />
                        </Form.Item>
                    </Space>

                    <Form.Item name="currentResidence" label="Nơi sống hiện tại">
                        <Input placeholder="VD: Quận Hải Châu, Đà Nẵng" />
                    </Form.Item>

                    <Form.Item name="biography" label="Tiểu sử">
                        <TextArea rows={4} placeholder="Giới thiệu ngắn về thành viên..." />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={() => setModalVisible(false)}>Hủy</Button>
                            <Button type="primary" htmlType="submit">
                                {editingMember ? 'Cập nhật' : 'Thêm mới'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default MembersPage;
