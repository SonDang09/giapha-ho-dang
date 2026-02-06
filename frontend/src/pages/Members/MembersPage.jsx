import { useState, useEffect } from 'react';
import { Table, Card, Button, Space, Input, Tag, Avatar, Modal, Form, Select, DatePicker, message, Popconfirm, Alert, Row, Col, Segmented } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, ManOutlined, WomanOutlined, FilePdfOutlined, TableOutlined, AppstoreOutlined } from '@ant-design/icons';
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
    const [apiConnected, setApiConnected] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        loadMembers();
    }, [pagination.page, searchText, filterGeneration, filterStatus]);

    const loadMembers = async () => {
        setLoading(true);
        try {
            // Use API service with auth token
            const response = await membersAPI.getAll({
                page: pagination.page,
                limit: pagination.limit,
                search: searchText || undefined,
                generation: filterGeneration || undefined,
                deceased: filterStatus === 'deceased' ? 'true' : filterStatus === 'alive' ? 'false' : undefined
            });

            if (response?.data?.data?.length > 0) {
                setMembers(response.data.data);
                setPagination(prev => ({
                    ...prev,
                    total: response.data.pagination?.total || response.data.data.length
                }));
                // Extract unique generations from all members (not just current page)
                const gens = [...new Set(response.data.data.map(m => m.generation))].filter(Boolean).sort((a, b) => a - b);
                if (gens.length > 0) setAvailableGenerations(gens);
                setApiConnected(true);
                setLoading(false);
                return;
            }
        } catch (error) {
            console.log('API not available, using demo data');
            setApiConnected(false);
        }

        // Fallback to demo data
        setMembers(getDemoMembers());
        setLoading(false);
    };

    const getDemoMembers = () => [
        { _id: '1', fullName: 'Đặng Văn Tổ', gender: 'male', generation: 1, birthDate: '1850-01-01', deathDate: '1920-03-15', isDeceased: true },
        { _id: '2', fullName: 'Đặng Văn Nhất', gender: 'male', generation: 2, birthDate: '1880-05-10', deathDate: '1950-08-20', isDeceased: true },
        { _id: '3', fullName: 'Đặng Văn Nhì', gender: 'male', generation: 2, birthDate: '1885-07-15', deathDate: '1960-12-25', isDeceased: true },
        { _id: '4', fullName: 'Đặng Văn An', gender: 'male', generation: 3, birthDate: '1910-03-20', isDeceased: false },
        { _id: '5', fullName: 'Đặng Thị Bình', gender: 'female', generation: 3, birthDate: '1915-09-05', deathDate: '2000-11-10', isDeceased: true },
        { _id: '6', fullName: 'Đặng Văn Cường', gender: 'male', generation: 3, birthDate: '1920-06-12', deathDate: '1995-04-28', isDeceased: true },
        { _id: '7', fullName: 'Đặng Văn Minh', gender: 'male', generation: 4, birthDate: '1945-11-30', isDeceased: false },
        { _id: '8', fullName: 'Đặng Thị Hương', gender: 'female', generation: 4, birthDate: '1948-04-18', isDeceased: false },
        { _id: '9', fullName: 'Đặng Văn Đức', gender: 'male', generation: 4, birthDate: '1950-08-25', isDeceased: false },
        { _id: '10', fullName: 'Đặng Văn Em', gender: 'male', generation: 5, birthDate: '1980-02-14', isDeceased: false },
    ];

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
                        <div style={{ fontWeight: 500 }}>{record.fullName}</div>
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
                    type="info"
                    message="Đang hiển thị dữ liệu mẫu. Kết nối backend để xem dữ liệu thực."
                    style={{ marginBottom: 16 }}
                    closable
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
                <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                    {members.map(member => (
                        <Col xs={24} sm={12} md={8} lg={6} key={member._id}>
                            <Card
                                hoverable
                                style={{
                                    borderRadius: 12,
                                    overflow: 'hidden',
                                    border: `2px solid ${member.gender === 'male' ? '#8B0000' : '#1B5E20'}`
                                }}
                                bodyStyle={{ padding: 0 }}
                            >
                                {/* Header with gradient */}
                                <div style={{
                                    background: member.gender === 'male'
                                        ? 'linear-gradient(135deg, #8B0000 0%, #CD5C5C 100%)'
                                        : 'linear-gradient(135deg, #1B5E20 0%, #4CAF50 100%)',
                                    height: 60,
                                    position: 'relative'
                                }}>
                                    {/* Generation badge */}
                                    <div style={{
                                        position: 'absolute',
                                        top: 8,
                                        right: 8,
                                        background: 'linear-gradient(135deg, #DAA520 0%, #B8860B 100%)',
                                        color: 'white',
                                        padding: '2px 8px',
                                        borderRadius: 12,
                                        fontSize: 11,
                                        fontWeight: 'bold'
                                    }}>
                                        Đời {member.generation}
                                    </div>
                                </div>

                                {/* Avatar */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    marginTop: -35
                                }}>
                                    <div style={{
                                        width: 70,
                                        height: 70,
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
                                <div style={{ padding: '12px 16px', textAlign: 'center' }}>
                                    <h3 style={{ margin: '0 0 4px', fontSize: 16 }}>{member.fullName}</h3>
                                    <div style={{ color: '#666', fontSize: 13, marginBottom: 8 }}>
                                        {member.birthDate && dayjs(member.birthDate).format('YYYY')}
                                        {member.deathDate ? ` - ${dayjs(member.deathDate).format('YYYY')}` : ' - nay'}
                                    </div>
                                    {member.currentResidence && (
                                        <div style={{ color: '#888', fontSize: 12, marginBottom: 6 }}>
                                            📍 {member.currentResidence}
                                        </div>
                                    )}
                                    <Tag color={member.isDeceased ? 'default' : 'green'}>
                                        {member.isDeceased ? 'Đã mất' : 'Còn sống'}
                                    </Tag>

                                    {/* Action buttons */}
                                    {canEdit() && (
                                        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center', gap: 8 }}>
                                            <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(member)}>Sửa</Button>
                                            {isAdmin() && (
                                                <Popconfirm title="Xác nhận xóa?" onConfirm={() => handleDelete(member._id)}>
                                                    <Button size="small" danger icon={<DeleteOutlined />}>Xóa</Button>
                                                </Popconfirm>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>
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
