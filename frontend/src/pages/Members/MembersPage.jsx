import { useState, useEffect } from 'react';
import { Table, Card, Button, Space, Input, Tag, Avatar, Modal, Form, Select, DatePicker, message, Popconfirm, Dropdown, Alert } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, UserOutlined, ManOutlined, WomanOutlined, DownloadOutlined, FilePdfOutlined, FileExcelOutlined, FileWordOutlined, ReloadOutlined } from '@ant-design/icons';
import { membersAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { exportToPDF, exportToExcel, exportToWord } from '../../utils/export';
import dayjs from 'dayjs';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const { Search } = Input;
const { TextArea } = Input;

const MembersPage = () => {
    useDocumentTitle('Thành Viên');
    const { canEdit, isAdmin } = useAuth();
    const [loading, setLoading] = useState(true);
    const [members, setMembers] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
    const [searchText, setSearchText] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [apiConnected, setApiConnected] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        loadMembers();
    }, [pagination.page, searchText]);

    const loadMembers = async () => {
        setLoading(true);
        try {
            // Use API service with auth token
            const response = await membersAPI.getAll({
                page: pagination.page,
                limit: pagination.limit,
                search: searchText || undefined
            });

            if (response?.data?.data?.length > 0) {
                setMembers(response.data.data);
                setPagination(prev => ({
                    ...prev,
                    total: response.data.pagination?.total || response.data.data.length
                }));
                setApiConnected(true);
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

    const columns = [
        {
            title: 'Thành viên',
            key: 'member',
            render: (_, record) => (
                <Space>
                    <Avatar
                        src={record.avatar}
                        icon={record.gender === 'male' ? <ManOutlined /> : <WomanOutlined />}
                        style={{
                            backgroundColor: record.gender === 'male' ? '#3b82f6' : '#ec4899'
                        }}
                    />
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
            title: 'Hành động',
            key: 'actions',
            width: 120,
            render: (_, record) => (
                canEdit() && (
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
            )
        }
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
                    <Button icon={<ReloadOutlined />} onClick={loadMembers} loading={loading}>
                        Tải lại
                    </Button>
                    <Search
                        placeholder="Tìm kiếm..."
                        allowClear
                        onSearch={setSearchText}
                        style={{ width: 200 }}
                    />
                    <Dropdown
                        menu={{
                            items: [
                                { key: 'pdf', label: 'Xuất PDF', icon: <FilePdfOutlined /> },
                                { key: 'excel', label: 'Xuất Excel', icon: <FileExcelOutlined /> },
                                { key: 'word', label: 'Xuất Word', icon: <FileWordOutlined /> }
                            ],
                            onClick: async ({ key }) => {
                                message.loading('Đang xuất file...', 1);
                                try {
                                    if (key === 'pdf') await exportToPDF(members);
                                    else if (key === 'excel') await exportToExcel(members);
                                    else if (key === 'word') await exportToWord(members);
                                    message.success('Xuất file thành công!');
                                } catch (error) {
                                    message.error('Có lỗi khi xuất file');
                                }
                            }
                        }}
                    >
                        <Button icon={<DownloadOutlined />}>
                            Xuất file
                        </Button>
                    </Dropdown>
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
