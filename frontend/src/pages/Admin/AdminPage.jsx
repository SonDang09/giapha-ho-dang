import { useState, useEffect } from 'react';
import { Tabs, Card, Table, Button, Modal, Form, Input, Select, DatePicker, Space, Tag, Popconfirm, message, Statistic, Row, Col, Avatar, InputNumber, Upload } from 'antd';
import {
    UserOutlined,
    TeamOutlined,
    FileTextOutlined,
    PictureOutlined,
    DashboardOutlined,
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    UploadOutlined,
    ManOutlined,
    WomanOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { TabPane } = Tabs;
const { TextArea } = Input;

const AdminPage = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(false);

    // Data states
    const [members, setMembers] = useState([]);
    const [news, setNews] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({});

    // Modal states
    const [memberModal, setMemberModal] = useState(false);
    const [newsModal, setNewsModal] = useState(false);
    const [albumModal, setAlbumModal] = useState(false);
    const [userModal, setUserModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    // Forms
    const [memberForm] = Form.useForm();
    const [newsForm] = Form.useForm();
    const [albumForm] = Form.useForm();
    const [userForm] = Form.useForm();

    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        setLoading(true);
        try {
            // Load from API with timeout fallback to demo data
            const fetchWithTimeout = async (url, timeout = 2000) => {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), timeout);
                try {
                    const response = await fetch(url, { signal: controller.signal });
                    clearTimeout(timeoutId);
                    return await response.json();
                } catch (e) {
                    clearTimeout(timeoutId);
                    return null;
                }
            };

            // Try to load real data
            const [membersRes, newsRes, albumsRes, usersRes] = await Promise.all([
                fetchWithTimeout('http://localhost:5001/api/members'),
                fetchWithTimeout('http://localhost:5001/api/news'),
                fetchWithTimeout('http://localhost:5001/api/albums'),
                fetchWithTimeout('http://localhost:5001/api/users')
            ]);

            // Members
            if (membersRes?.data?.length > 0) {
                setMembers(membersRes.data);
            } else {
                setMembers([
                    { _id: '1', fullName: 'Đặng Văn Tổ', gender: 'male', generation: 1, birthDate: '1850-01-01', deathDate: '1920-03-15', isDeceased: true },
                    { _id: '2', fullName: 'Đặng Văn Nhất', gender: 'male', generation: 2, birthDate: '1880-05-10', deathDate: '1950-08-20', isDeceased: true },
                    { _id: '3', fullName: 'Đặng Văn Minh', gender: 'male', generation: 4, birthDate: '1960-03-15', isDeceased: false },
                    { _id: '4', fullName: 'Đặng Thị Hương', gender: 'female', generation: 4, birthDate: '1965-07-20', isDeceased: false }
                ]);
            }

            // News
            if (newsRes?.data?.length > 0) {
                setNews(newsRes.data);
            } else {
                setNews([
                    { _id: '1', title: 'Lễ Giỗ Tổ 2024', category: 'gio_to', createdAt: '2024-01-15', viewCount: 156 },
                    { _id: '2', title: 'Đại hội họ Đặng lần X', category: 'dai_hoi', createdAt: '2024-02-01', viewCount: 234 }
                ]);
            }

            // Albums
            if (albumsRes?.data?.length > 0) {
                setAlbums(albumsRes.data);
            } else {
                setAlbums([
                    { _id: '1', title: 'Từ đường họ Đặng', category: 'tu_duong', photoCount: 15 },
                    { _id: '2', title: 'Họp mặt 2023', category: 'hop_mat', photoCount: 50 }
                ]);
            }

            // Users
            if (usersRes?.data?.length > 0) {
                setUsers(usersRes.data);
            } else {
                setUsers([
                    { _id: '1', username: 'admin', email: 'admin@giapha.vn', fullName: 'Quản trị viên', role: 'admin_toc', isActive: true },
                    { _id: '2', username: 'user1', email: 'user1@giapha.vn', fullName: 'Đặng Văn Minh', role: 'member', isActive: true }
                ]);
            }

            // Calculate stats
            const allMembers = membersRes?.data || [];
            setStats({
                totalMembers: allMembers.length || 4,
                totalNews: newsRes?.data?.length || 2,
                totalAlbums: albumsRes?.data?.length || 2,
                totalUsers: usersRes?.data?.length || 2
            });

        } finally {
            setLoading(false);
        }
    };

    // Member CRUD
    const handleMemberSubmit = async (values) => {
        try {
            if (editingItem) {
                await fetch(`http://localhost:5001/api/members/${editingItem._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(values)
                });
                message.success('Cập nhật thành viên thành công!');
            } else {
                await fetch('http://localhost:5001/api/members', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(values)
                });
                message.success('Thêm thành viên thành công!');
            }
            setMemberModal(false);
            memberForm.resetFields();
            setEditingItem(null);
            loadAllData();
        } catch (error) {
            message.error('Có lỗi xảy ra!');
        }
    };

    const handleDeleteMember = async (id) => {
        try {
            await fetch(`http://localhost:5001/api/members/${id}`, { method: 'DELETE' });
            message.success('Xóa thành viên thành công!');
            loadAllData();
        } catch (error) {
            message.error('Có lỗi xảy ra!');
        }
    };

    // News CRUD
    const handleNewsSubmit = async (values) => {
        try {
            const data = { ...values };
            if (values.eventDate) data.eventDate = values.eventDate.format('YYYY-MM-DD');

            if (editingItem) {
                await fetch(`http://localhost:5001/api/news/${editingItem._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                message.success('Cập nhật tin tức thành công!');
            } else {
                await fetch('http://localhost:5001/api/news', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                message.success('Thêm tin tức thành công!');
            }
            setNewsModal(false);
            newsForm.resetFields();
            setEditingItem(null);
            loadAllData();
        } catch (error) {
            message.error('Có lỗi xảy ra!');
        }
    };

    const handleDeleteNews = async (id) => {
        try {
            await fetch(`http://localhost:5001/api/news/${id}`, { method: 'DELETE' });
            message.success('Xóa tin tức thành công!');
            loadAllData();
        } catch (error) {
            message.error('Có lỗi xảy ra!');
        }
    };

    // Album CRUD
    const handleAlbumSubmit = async (values) => {
        try {
            if (editingItem) {
                await fetch(`http://localhost:5001/api/albums/${editingItem._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(values)
                });
                message.success('Cập nhật album thành công!');
            } else {
                await fetch('http://localhost:5001/api/albums', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(values)
                });
                message.success('Thêm album thành công!');
            }
            setAlbumModal(false);
            albumForm.resetFields();
            setEditingItem(null);
            loadAllData();
        } catch (error) {
            message.error('Có lỗi xảy ra!');
        }
    };

    const handleDeleteAlbum = async (id) => {
        try {
            await fetch(`http://localhost:5001/api/albums/${id}`, { method: 'DELETE' });
            message.success('Xóa album thành công!');
            loadAllData();
        } catch (error) {
            message.error('Có lỗi xảy ra!');
        }
    };

    // User management
    const handleUserSubmit = async (values) => {
        try {
            if (editingItem) {
                await fetch(`http://localhost:5001/api/users/${editingItem._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(values)
                });
                message.success('Cập nhật người dùng thành công!');
            } else {
                await fetch('http://localhost:5001/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(values)
                });
                message.success('Thêm người dùng thành công!');
            }
            setUserModal(false);
            userForm.resetFields();
            setEditingItem(null);
            loadAllData();
        } catch (error) {
            message.error('Có lỗi xảy ra!');
        }
    };

    // Table columns
    const memberColumns = [
        {
            title: 'Họ tên',
            dataIndex: 'fullName',
            key: 'fullName',
            render: (text, record) => (
                <Space>
                    <Avatar icon={record.gender === 'female' ? <WomanOutlined /> : <ManOutlined />}
                        style={{ backgroundColor: record.gender === 'female' ? '#eb2f96' : '#1890ff' }} />
                    {text}
                </Space>
            )
        },
        { title: 'Đời', dataIndex: 'generation', key: 'generation', width: 60, align: 'center' },
        {
            title: 'Giới tính',
            dataIndex: 'gender',
            key: 'gender',
            width: 80,
            render: (g) => g === 'female' ? 'Nữ' : 'Nam'
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isDeceased',
            key: 'isDeceased',
            width: 100,
            render: (d) => <Tag color={d ? 'default' : 'green'}>{d ? 'Đã mất' : 'Còn sống'}</Tag>
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 120,
            render: (_, record) => (
                <Space>
                    <Button size="small" icon={<EditOutlined />} onClick={() => {
                        setEditingItem(record);
                        memberForm.setFieldsValue({
                            ...record,
                            birthDate: record.birthDate ? dayjs(record.birthDate) : null,
                            deathDate: record.deathDate ? dayjs(record.deathDate) : null
                        });
                        setMemberModal(true);
                    }} />
                    <Popconfirm title="Xóa thành viên này?" onConfirm={() => handleDeleteMember(record._id)}>
                        <Button size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    const newsColumns = [
        { title: 'Tiêu đề', dataIndex: 'title', key: 'title' },
        {
            title: 'Danh mục',
            dataIndex: 'category',
            key: 'category',
            width: 100,
            render: (c) => {
                const labels = { gio_to: 'Giỗ Tổ', dai_hoi: 'Đại hội', tin_tuc: 'Tin tức', thong_bao: 'Thông báo' };
                return <Tag>{labels[c] || c}</Tag>;
            }
        },
        { title: 'Lượt xem', dataIndex: 'viewCount', key: 'viewCount', width: 90, align: 'center' },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 110,
            render: (d) => dayjs(d).format('DD/MM/YYYY')
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 120,
            render: (_, record) => (
                <Space>
                    <Button size="small" icon={<EditOutlined />} onClick={() => {
                        setEditingItem(record);
                        newsForm.setFieldsValue({
                            ...record,
                            eventDate: record.eventDate ? dayjs(record.eventDate) : null
                        });
                        setNewsModal(true);
                    }} />
                    <Popconfirm title="Xóa tin này?" onConfirm={() => handleDeleteNews(record._id)}>
                        <Button size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    const albumColumns = [
        { title: 'Tên album', dataIndex: 'title', key: 'title' },
        {
            title: 'Danh mục',
            dataIndex: 'category',
            key: 'category',
            width: 100,
            render: (c) => {
                const labels = { tu_duong: 'Từ đường', hop_mat: 'Họp mặt', gio_to: 'Giỗ Tổ', mo_phan: 'Mộ phần' };
                return <Tag>{labels[c] || c}</Tag>;
            }
        },
        { title: 'Số ảnh', dataIndex: 'photoCount', key: 'photoCount', width: 80, align: 'center' },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 120,
            render: (_, record) => (
                <Space>
                    <Button size="small" icon={<EditOutlined />} onClick={() => {
                        setEditingItem(record);
                        albumForm.setFieldsValue(record);
                        setAlbumModal(true);
                    }} />
                    <Popconfirm title="Xóa album này?" onConfirm={() => handleDeleteAlbum(record._id)}>
                        <Button size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    const userColumns = [
        { title: 'Username', dataIndex: 'username', key: 'username' },
        { title: 'Họ tên', dataIndex: 'fullName', key: 'fullName' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        {
            title: 'Vai trò',
            dataIndex: 'role',
            key: 'role',
            width: 120,
            render: (r) => {
                const roles = { admin_toc: 'Admin', truong_chi: 'Trưởng chi', member: 'Thành viên' };
                return <Tag color={r === 'admin_toc' ? 'red' : r === 'truong_chi' ? 'blue' : 'default'}>{roles[r] || r}</Tag>;
            }
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            width: 100,
            render: (a) => <Tag color={a ? 'green' : 'red'}>{a ? 'Hoạt động' : 'Khóa'}</Tag>
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 80,
            render: (_, record) => (
                <Button size="small" icon={<EditOutlined />} onClick={() => {
                    setEditingItem(record);
                    userForm.setFieldsValue(record);
                    setUserModal(true);
                }} />
            )
        }
    ];

    return (
        <div className="page-container">
            <h1 className="page-title" style={{ marginBottom: 24 }}>
                <DashboardOutlined style={{ color: '#D4AF37' }} /> Trang Quản Trị
            </h1>

            <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
                {/* Overview Tab */}
                <TabPane tab={<span><DashboardOutlined /> Tổng quan</span>} key="overview">
                    <Row gutter={[16, 16]}>
                        <Col xs={12} sm={6}>
                            <Card>
                                <Statistic title="Thành viên" value={stats.totalMembers || members.length} prefix={<TeamOutlined />} valueStyle={{ color: '#228B22' }} />
                            </Card>
                        </Col>
                        <Col xs={12} sm={6}>
                            <Card>
                                <Statistic title="Tin tức" value={stats.totalNews || news.length} prefix={<FileTextOutlined />} valueStyle={{ color: '#1890ff' }} />
                            </Card>
                        </Col>
                        <Col xs={12} sm={6}>
                            <Card>
                                <Statistic title="Album ảnh" value={stats.totalAlbums || albums.length} prefix={<PictureOutlined />} valueStyle={{ color: '#D4AF37' }} />
                            </Card>
                        </Col>
                        <Col xs={12} sm={6}>
                            <Card>
                                <Statistic title="Người dùng" value={stats.totalUsers || users.length} prefix={<UserOutlined />} valueStyle={{ color: '#722ed1' }} />
                            </Card>
                        </Col>
                    </Row>

                    <Card title="Hướng dẫn quản trị" style={{ marginTop: 24 }}>
                        <ul style={{ marginBottom: 0 }}>
                            <li><strong>Quản lý thành viên:</strong> Thêm, sửa, xóa thông tin thành viên trong dòng họ</li>
                            <li><strong>Quản lý tin tức:</strong> Đăng tin, thông báo sự kiện dòng họ</li>
                            <li><strong>Quản lý album:</strong> Tải lên và quản lý hình ảnh</li>
                            <li><strong>Quản lý người dùng:</strong> Phân quyền tài khoản</li>
                        </ul>
                    </Card>
                </TabPane>

                {/* Members Tab */}
                <TabPane tab={<span><TeamOutlined /> Thành viên</span>} key="members">
                    <Card
                        title="Danh sách thành viên"
                        extra={
                            <Button type="primary" icon={<PlusOutlined />} onClick={() => {
                                setEditingItem(null);
                                memberForm.resetFields();
                                setMemberModal(true);
                            }}>
                                Thêm mới
                            </Button>
                        }
                    >
                        <Table columns={memberColumns} dataSource={members} rowKey="_id" loading={loading} scroll={{ x: 600 }} />
                    </Card>
                </TabPane>

                {/* News Tab */}
                <TabPane tab={<span><FileTextOutlined /> Tin tức</span>} key="news">
                    <Card
                        title="Danh sách tin tức"
                        extra={
                            <Button type="primary" icon={<PlusOutlined />} onClick={() => {
                                setEditingItem(null);
                                newsForm.resetFields();
                                setNewsModal(true);
                            }}>
                                Thêm mới
                            </Button>
                        }
                    >
                        <Table columns={newsColumns} dataSource={news} rowKey="_id" loading={loading} scroll={{ x: 600 }} />
                    </Card>
                </TabPane>

                {/* Albums Tab */}
                <TabPane tab={<span><PictureOutlined /> Album</span>} key="albums">
                    <Card
                        title="Danh sách album"
                        extra={
                            <Button type="primary" icon={<PlusOutlined />} onClick={() => {
                                setEditingItem(null);
                                albumForm.resetFields();
                                setAlbumModal(true);
                            }}>
                                Thêm mới
                            </Button>
                        }
                    >
                        <Table columns={albumColumns} dataSource={albums} rowKey="_id" loading={loading} scroll={{ x: 600 }} />
                    </Card>
                </TabPane>

                {/* Users Tab */}
                <TabPane tab={<span><UserOutlined /> Người dùng</span>} key="users">
                    <Card
                        title="Danh sách người dùng"
                        extra={
                            <Button type="primary" icon={<PlusOutlined />} onClick={() => {
                                setEditingItem(null);
                                userForm.resetFields();
                                setUserModal(true);
                            }}>
                                Thêm mới
                            </Button>
                        }
                    >
                        <Table columns={userColumns} dataSource={users} rowKey="_id" loading={loading} scroll={{ x: 600 }} />
                    </Card>
                </TabPane>
            </Tabs>

            {/* Member Modal */}
            <Modal
                title={editingItem ? 'Sửa thành viên' : 'Thêm thành viên'}
                open={memberModal}
                onCancel={() => { setMemberModal(false); setEditingItem(null); }}
                footer={null}
                width={600}
            >
                <Form form={memberForm} layout="vertical" onFinish={handleMemberSubmit}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="gender" label="Giới tính" rules={[{ required: true }]}>
                                <Select>
                                    <Select.Option value="male">Nam</Select.Option>
                                    <Select.Option value="female">Nữ</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="generation" label="Đời thứ" rules={[{ required: true }]}>
                                <InputNumber min={1} max={20} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="birthDate" label="Ngày sinh">
                                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="deathDate" label="Ngày mất">
                                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="biography" label="Tiểu sử">
                        <TextArea rows={3} />
                    </Form.Item>
                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={() => setMemberModal(false)}>Hủy</Button>
                            <Button type="primary" htmlType="submit">Lưu</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* News Modal */}
            <Modal
                title={editingItem ? 'Sửa tin tức' : 'Thêm tin tức'}
                open={newsModal}
                onCancel={() => { setNewsModal(false); setEditingItem(null); }}
                footer={null}
                width={600}
            >
                <Form form={newsForm} layout="vertical" onFinish={handleNewsSubmit}>
                    <Form.Item name="title" label="Tiêu đề" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="category" label="Danh mục" rules={[{ required: true }]}>
                                <Select>
                                    <Select.Option value="gio_to">Giỗ Tổ</Select.Option>
                                    <Select.Option value="dai_hoi">Đại hội</Select.Option>
                                    <Select.Option value="tin_tuc">Tin tức</Select.Option>
                                    <Select.Option value="thong_bao">Thông báo</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="eventDate" label="Ngày sự kiện">
                                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="excerpt" label="Tóm tắt">
                        <TextArea rows={2} />
                    </Form.Item>
                    <Form.Item name="content" label="Nội dung" rules={[{ required: true }]}>
                        <TextArea rows={5} />
                    </Form.Item>
                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={() => setNewsModal(false)}>Hủy</Button>
                            <Button type="primary" htmlType="submit">Lưu</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Album Modal */}
            <Modal
                title={editingItem ? 'Sửa album' : 'Thêm album'}
                open={albumModal}
                onCancel={() => { setAlbumModal(false); setEditingItem(null); }}
                footer={null}
                width={500}
            >
                <Form form={albumForm} layout="vertical" onFinish={handleAlbumSubmit}>
                    <Form.Item name="title" label="Tên album" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="category" label="Danh mục" rules={[{ required: true }]}>
                        <Select>
                            <Select.Option value="tu_duong">Từ đường</Select.Option>
                            <Select.Option value="hop_mat">Họp mặt</Select.Option>
                            <Select.Option value="gio_to">Giỗ Tổ</Select.Option>
                            <Select.Option value="mo_phan">Mộ phần</Select.Option>
                            <Select.Option value="khac">Khác</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="description" label="Mô tả">
                        <TextArea rows={3} />
                    </Form.Item>
                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={() => setAlbumModal(false)}>Hủy</Button>
                            <Button type="primary" htmlType="submit">Lưu</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* User Modal */}
            <Modal
                title={editingItem ? 'Sửa người dùng' : 'Thêm người dùng'}
                open={userModal}
                onCancel={() => { setUserModal(false); setEditingItem(null); }}
                footer={null}
                width={500}
            >
                <Form form={userForm} layout="vertical" onFinish={handleUserSubmit}>
                    <Form.Item name="username" label="Tên đăng nhập" rules={[{ required: true }]}>
                        <Input disabled={!!editingItem} />
                    </Form.Item>
                    {!editingItem && (
                        <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, min: 6 }]}>
                            <Input.Password />
                        </Form.Item>
                    )}
                    <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="role" label="Vai trò" rules={[{ required: true }]}>
                        <Select>
                            <Select.Option value="admin_toc">Admin (Quản trị viên)</Select.Option>
                            <Select.Option value="truong_chi">Trưởng chi</Select.Option>
                            <Select.Option value="member">Thành viên</Select.Option>
                            <Select.Option value="guest">Khách</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="isActive" label="Trạng thái" valuePropName="checked" initialValue={true}>
                        <Select defaultValue={true}>
                            <Select.Option value={true}>Hoạt động</Select.Option>
                            <Select.Option value={false}>Khóa</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={() => setUserModal(false)}>Hủy</Button>
                            <Button type="primary" htmlType="submit">Lưu</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminPage;
