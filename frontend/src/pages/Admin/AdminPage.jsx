import { useState, useEffect } from 'react';
import { Tabs, Card, Table, Button, Modal, Form, Input, Select, DatePicker, Space, Tag, Popconfirm, message, Statistic, Row, Col, Avatar, InputNumber, Switch, Alert } from 'antd';
import {
    UserOutlined,
    TeamOutlined,
    FileTextOutlined,
    PictureOutlined,
    DashboardOutlined,
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    ManOutlined,
    WomanOutlined,
    ReloadOutlined,
    SettingOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { membersAPI, newsAPI, albumsAPI, authAPI, usersAPI, settingsAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const { TabPane } = Tabs;
const { TextArea } = Input;

const AdminPage = () => {
    useDocumentTitle('Trang Quản Trị', 'Trang quản trị hệ thống Gia Phả Họ Đặng. Quản lý thành viên, tin tức, album ảnh và người dùng.');
    const { user, isAuthenticated } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState(null);

    // Data states
    const [members, setMembers] = useState([]);
    const [news, setNews] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({});
    const [siteSettings, setSiteSettings] = useState({});
    const [settingsLoading, setSettingsLoading] = useState(false);

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
    const [settingsForm] = Form.useForm();

    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        setLoading(true);
        setApiError(null);
        try {
            // Load data using API service (with auth token automatically)
            const [membersRes, newsRes, albumsRes] = await Promise.all([
                membersAPI.getAll({ limit: 100 }).catch(e => ({ data: { data: [] } })),
                newsAPI.getAll({ limit: 100, published: 'all' }).catch(e => ({ data: { data: [] } })),
                albumsAPI.getAll({ limit: 100 }).catch(e => ({ data: { data: [] } }))
            ]);

            // Members
            if (membersRes?.data?.data?.length > 0) {
                setMembers(membersRes.data.data);
            } else {
                // Demo data fallback
                setMembers([
                    { _id: '1', fullName: 'Đặng Văn Tổ', gender: 'male', generation: 1, birthDate: '1850-01-01', deathDate: '1920-03-15', isDeceased: true },
                    { _id: '2', fullName: 'Đặng Văn Nhất', gender: 'male', generation: 2, birthDate: '1880-05-10', deathDate: '1950-08-20', isDeceased: true },
                    { _id: '3', fullName: 'Đặng Văn Minh', gender: 'male', generation: 4, birthDate: '1960-03-15', isDeceased: false },
                    { _id: '4', fullName: 'Đặng Thị Hương', gender: 'female', generation: 4, birthDate: '1965-07-20', isDeceased: false }
                ]);
            }

            // News
            if (newsRes?.data?.data?.length > 0) {
                setNews(newsRes.data.data);
            } else {
                setNews([
                    { _id: '1', title: 'Lễ Giỗ Tổ 2024', category: 'gio_to', createdAt: '2024-01-15', viewCount: 156 },
                    { _id: '2', title: 'Đại hội họ Đặng lần X', category: 'dai_hoi', createdAt: '2024-02-01', viewCount: 234 }
                ]);
            }

            // Albums
            if (albumsRes?.data?.data?.length > 0) {
                setAlbums(albumsRes.data.data);
            } else {
                setAlbums([
                    { _id: '1', title: 'Từ đường họ Đặng', category: 'tu_duong', photos: [], isFeatured: true },
                    { _id: '2', title: 'Họp mặt 2023', category: 'hop_mat', photos: [], isFeatured: false }
                ]);
            }

            // Demo users (no API for users list yet)
            try {
                const usersRes = await usersAPI.getAll();
                if (usersRes?.data?.data?.length > 0) {
                    setUsers(usersRes.data.data);
                } else {
                    setUsers([
                        { _id: 'demo1', username: 'admin', fullName: 'Quản trị viên', role: 'admin_toc', isActive: true },
                    ]);
                }
            } catch (e) {
                // Fallback for non-admin users who can't access users API
                setUsers([
                    { _id: 'demo1', username: 'admin', fullName: 'Quản trị viên', role: 'admin_toc', isActive: true },
                ]);
            }

            // Calculate stats
            const membersCount = membersRes?.data?.data?.length || 0;
            const newsCount = newsRes?.data?.data?.length || 0;
            const albumsCount = albumsRes?.data?.data?.length || 0;

            setStats({
                totalMembers: membersCount || 4,
                totalNews: newsCount || 2,
                totalAlbums: albumsCount || 2,
                totalUsers: users.length || 1
            });

        } catch (error) {
            console.error('Load data error:', error);
            setApiError('Không thể tải dữ liệu. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    // Member CRUD
    const handleMemberSubmit = async (values) => {
        try {
            const data = {
                ...values,
                birthDate: values.birthDate ? values.birthDate.format('YYYY-MM-DD') : null,
                deathDate: values.deathDate ? values.deathDate.format('YYYY-MM-DD') : null,
                isDeceased: !!values.deathDate
            };

            if (editingItem) {
                await membersAPI.update(editingItem._id, data);
                message.success('Cập nhật thành viên thành công!');
            } else {
                await membersAPI.create(data);
                message.success('Thêm thành viên thành công!');
            }
            setMemberModal(false);
            memberForm.resetFields();
            setEditingItem(null);
            loadAllData();
        } catch (error) {
            console.error('Member submit error:', error);
            message.error(error.response?.data?.message || 'Có lỗi xảy ra! Vui lòng kiểm tra quyền truy cập.');
        }
    };

    const handleDeleteMember = async (id) => {
        try {
            await membersAPI.delete(id);
            message.success('Xóa thành viên thành công!');
            loadAllData();
        } catch (error) {
            console.error('Delete member error:', error);
            message.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa!');
        }
    };

    // News CRUD
    const handleNewsSubmit = async (values) => {
        try {
            const data = {
                ...values,
                eventDate: values.eventDate ? values.eventDate.format('YYYY-MM-DD') : null
            };

            if (editingItem) {
                await newsAPI.update(editingItem._id, data);
                message.success('Cập nhật tin tức thành công!');
            } else {
                await newsAPI.create(data);
                message.success('Thêm tin tức thành công!');
            }
            setNewsModal(false);
            newsForm.resetFields();
            setEditingItem(null);
            loadAllData();
        } catch (error) {
            console.error('News submit error:', error);
            message.error(error.response?.data?.message || 'Có lỗi xảy ra! Vui lòng kiểm tra quyền truy cập.');
        }
    };

    const handleDeleteNews = async (id) => {
        try {
            await newsAPI.delete(id);
            message.success('Xóa tin tức thành công!');
            loadAllData();
        } catch (error) {
            console.error('Delete news error:', error);
            message.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa!');
        }
    };

    // Album CRUD
    const handleAlbumSubmit = async (values) => {
        try {
            if (editingItem) {
                await albumsAPI.update(editingItem._id, values);
                message.success('Cập nhật album thành công!');
            } else {
                await albumsAPI.create(values);
                message.success('Thêm album thành công!');
            }
            setAlbumModal(false);
            albumForm.resetFields();
            setEditingItem(null);
            loadAllData();
        } catch (error) {
            console.error('Album submit error:', error);
            message.error(error.response?.data?.message || 'Có lỗi xảy ra! Vui lòng kiểm tra quyền truy cập.');
        }
    };

    const handleDeleteAlbum = async (id) => {
        try {
            await albumsAPI.delete(id);
            message.success('Xóa album thành công!');
            loadAllData();
        } catch (error) {
            console.error('Delete album error:', error);
            message.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa!');
        }
    };

    // User management
    const handleUserSubmit = async (values) => {
        try {
            if (editingItem) {
                await usersAPI.update(editingItem._id, values);
                message.success('Cập nhật người dùng thành công!');
            } else {
                await usersAPI.create(values);
                message.success('Thêm người dùng thành công!');
            }
            setUserModal(false);
            userForm.resetFields();
            setEditingItem(null);
            loadAllData();
        } catch (error) {
            console.error('User submit error:', error);
            message.error(error.response?.data?.message || 'Có lỗi xảy ra!');
        }
    };

    const handleDeleteUser = async (id) => {
        try {
            await usersAPI.delete(id);
            message.success('Xóa người dùng thành công!');
            loadAllData();
        } catch (error) {
            console.error('Delete user error:', error);
            message.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa!');
        }
    };

    const handleToggleUserStatus = async (id) => {
        try {
            const res = await usersAPI.toggleStatus(id);
            message.success(res.data.message);
            loadAllData();
        } catch (error) {
            console.error('Toggle user status error:', error);
            message.error(error.response?.data?.message || 'Có lỗi xảy ra!');
        }
    };

    // Settings handlers
    const loadSettings = async () => {
        setSettingsLoading(true);
        try {
            const response = await settingsAPI.get();
            if (response.data?.data) {
                setSiteSettings(response.data.data);
                settingsForm.setFieldsValue({
                    brandName: response.data.data.brandName,
                    location: response.data.data.location,
                    siteTitle: response.data.data.siteTitle,
                    tagline: response.data.data.tagline,
                    heroDescription: response.data.data.heroDescription,
                    treeHeader: response.data.data.treeHeader,
                    treeSubtitle: response.data.data.treeSubtitle,
                    treeFooter: response.data.data.treeFooter,
                    headerScripts: response.data.data.headerScripts,
                    footerText: response.data.data.footerText,
                    contactEmail: response.data.data.contactEmail,
                    contactPhone: response.data.data.contactPhone,
                    facebookUrl: response.data.data.socialLinks?.facebook,
                    zaloUrl: response.data.data.socialLinks?.zalo,
                    youtubeUrl: response.data.data.socialLinks?.youtube
                });
            }
        } catch (error) {
            console.log('Settings not available yet');
        } finally {
            setSettingsLoading(false);
        }
    };

    const handleSettingsSubmit = async (values) => {
        setSettingsLoading(true);
        try {
            await settingsAPI.update({
                brandName: values.brandName,
                location: values.location,
                siteTitle: values.siteTitle,
                tagline: values.tagline,
                heroDescription: values.heroDescription,
                treeHeader: values.treeHeader,
                treeSubtitle: values.treeSubtitle,
                treeFooter: values.treeFooter,
                headerScripts: values.headerScripts,
                footerText: values.footerText,
                contactEmail: values.contactEmail,
                contactPhone: values.contactPhone,
                socialLinks: {
                    facebook: values.facebookUrl,
                    zalo: values.zaloUrl,
                    youtube: values.youtubeUrl
                }
            });
            message.success('Cập nhật cấu hình thành công!');
            loadSettings();
        } catch (error) {
            console.error('Settings save error:', error);
            message.error(error.response?.data?.message || 'Có lỗi xảy ra!');
        } finally {
            setSettingsLoading(false);
        }
    };

    // Load settings when tab changes to settings
    useEffect(() => {
        if (activeTab === 'settings') {
            loadSettings();
        }
    }, [activeTab]);

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
                const labels = { gio_to: 'Giỗ Tổ', dai_hoi: 'Đại hội', tin_tuc: 'Tin tức', thong_bao: 'Thông báo', cung_te: 'Cúng tế', khac: 'Khác' };
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
                const labels = { tu_duong: 'Từ đường', hop_mat: 'Họp mặt', gio_to: 'Giỗ Tổ', mo_phan: 'Mộ phần', dai_hoi: 'Đại hội', khac: 'Khác' };
                return <Tag>{labels[c] || c}</Tag>;
            }
        },
        {
            title: 'Số ảnh',
            dataIndex: 'photos',
            key: 'photoCount',
            width: 80,
            align: 'center',
            render: (photos) => photos?.length || 0
        },
        {
            title: 'Nổi bật',
            dataIndex: 'isFeatured',
            key: 'isFeatured',
            width: 80,
            render: (v) => v ? <Tag color="gold">Có</Tag> : <Tag>Không</Tag>
        },
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
                const roles = { admin_toc: 'Admin', chi_ho: 'Trưởng chi', member: 'Thành viên' };
                return <Tag color={r === 'admin_toc' ? 'red' : r === 'chi_ho' ? 'blue' : 'default'}>{roles[r] || r}</Tag>;
            }
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            width: 100,
            render: (a, record) => (
                <Switch
                    checked={a}
                    onChange={() => handleToggleUserStatus(record._id)}
                    disabled={record._id?.startsWith('demo')}
                    checkedChildren="Hoạt động"
                    unCheckedChildren="Khóa"
                />
            )
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 120,
            render: (_, record) => (
                <Space size="small">
                    <Button size="small" icon={<EditOutlined />} onClick={() => {
                        setEditingItem(record);
                        userForm.setFieldsValue(record);
                        setUserModal(true);
                    }} disabled={record._id?.startsWith('demo')} />
                    <Popconfirm
                        title="Xóa người dùng này?"
                        onConfirm={() => handleDeleteUser(record._id)}
                        disabled={record._id?.startsWith('demo')}
                    >
                        <Button size="small" danger icon={<DeleteOutlined />} disabled={record._id?.startsWith('demo')} />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    // Check authentication
    if (!isAuthenticated) {
        return (
            <div className="page-container">
                <Alert
                    type="warning"
                    message="Yêu cầu đăng nhập"
                    description="Bạn cần đăng nhập với tài khoản Admin để truy cập trang quản trị."
                    showIcon
                    style={{ maxWidth: 500, margin: '100px auto' }}
                />
            </div>
        );
    }

    return (
        <div className="page-container">
            <h1 className="page-title" style={{ marginBottom: 24 }}>
                <DashboardOutlined style={{ color: '#D4AF37' }} /> Trang Quản Trị
                <Button
                    icon={<ReloadOutlined />}
                    onClick={loadAllData}
                    loading={loading}
                    style={{ marginLeft: 16 }}
                >
                    Tải lại
                </Button>
            </h1>

            {apiError && (
                <Alert type="error" message={apiError} style={{ marginBottom: 16 }} closable onClose={() => setApiError(null)} />
            )}

            {user && (
                <Alert
                    type="info"
                    message={`Đăng nhập với: ${user.fullName} (${user.role === 'admin_toc' ? 'Admin' : user.role})`}
                    style={{ marginBottom: 16 }}
                />
            )}

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

                {/* Settings Tab */}
                <TabPane tab={<span><SettingOutlined /> Cấu hình</span>} key="settings">
                    <Card title="Cấu hình Website" loading={settingsLoading}>
                        <Form
                            form={settingsForm}
                            layout="vertical"
                            onFinish={handleSettingsSubmit}
                            style={{ maxWidth: 800 }}
                        >
                            <Row gutter={24}>
                                <Col span={24}>
                                    <Card type="inner" title="🏷️ Thương hiệu" style={{ marginBottom: 24 }}>
                                        <Form.Item
                                            name="brandName"
                                            label="Tên thương hiệu (Header)"
                                            tooltip="Hiển thị ở góc trái header"
                                        >
                                            <Input placeholder="Đặng Đức Tộc" />
                                        </Form.Item>
                                        <Form.Item
                                            name="location"
                                            label="Địa điểm"
                                            tooltip="Địa điểm của dòng họ"
                                        >
                                            <Input placeholder="Đà Nẵng - Việt Nam" />
                                        </Form.Item>
                                    </Card>
                                </Col>

                                <Col span={24}>
                                    <Card type="inner" title="🌳 Cây Gia Phả" style={{ marginBottom: 24 }}>
                                        <Form.Item
                                            name="treeHeader"
                                            label="Tiêu đề cây gia phả"
                                            tooltip="Hiển thị ở đầu trang cây"
                                        >
                                            <Input placeholder="GIA PHẢ HỌ ĐẶNG" />
                                        </Form.Item>
                                        <Form.Item
                                            name="treeSubtitle"
                                            label="Dòng phụ"
                                            tooltip="Hiển thị dưới tiêu đề"
                                        >
                                            <Input placeholder="Đà Nẵng - Việt Nam" />
                                        </Form.Item>
                                        <Form.Item
                                            name="treeFooter"
                                            label="Footer cây gia phả"
                                            tooltip="Hiển thị ở cuối trang cây"
                                        >
                                            <Input placeholder="Gia Phả Họ Đặng • Giữ gìn truyền thống" />
                                        </Form.Item>
                                    </Card>
                                </Col>

                                <Col span={24}>
                                    <Card type="inner" title="Nội dung Trang chủ" style={{ marginBottom: 24 }}>
                                        <Form.Item
                                            name="siteTitle"
                                            label="Tiêu đề website"
                                            tooltip="Tiêu đề hiển thị trên trang chủ"
                                        >
                                            <Input placeholder="Gia Phả Họ Đặng Đà Nẵng" />
                                        </Form.Item>
                                        <Form.Item
                                            name="tagline"
                                            label="Câu châm ngôn"
                                            tooltip="Câu nói ý nghĩa hiển thị dưới tiêu đề"
                                        >
                                            <TextArea
                                                rows={2}
                                                placeholder="Uống nước nhớ nguồn - Ăn quả nhớ kẻ trồng cây"
                                            />
                                        </Form.Item>
                                        <Form.Item
                                            name="heroDescription"
                                            label="Mô tả ngắn"
                                        >
                                            <TextArea
                                                rows={2}
                                                placeholder="Trang web lưu giữ và kết nối các thế hệ trong dòng họ"
                                            />
                                        </Form.Item>
                                    </Card>
                                </Col>

                                <Col span={24}>
                                    <Card type="inner" title="Mã nhúng Header (Scripts)" style={{ marginBottom: 24 }}>
                                        <Alert
                                            message="Nhúng Google Analytics, Facebook Pixel, v.v."
                                            description="Mã sẽ được chèn vào thẻ <head> của trang web"
                                            type="info"
                                            showIcon
                                            style={{ marginBottom: 16 }}
                                        />
                                        <Form.Item
                                            name="headerScripts"
                                            label="Mã nhúng (HTML/JavaScript)"
                                        >
                                            <TextArea
                                                rows={6}
                                                placeholder="<!-- Google Analytics -->
<script async src='https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX'></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>"
                                                style={{ fontFamily: 'monospace', fontSize: 12 }}
                                            />
                                        </Form.Item>
                                    </Card>
                                </Col>

                                <Col span={24}>
                                    <Card type="inner" title="Thông tin liên hệ" style={{ marginBottom: 24 }}>
                                        <Row gutter={16}>
                                            <Col span={12}>
                                                <Form.Item name="contactEmail" label="Email liên hệ">
                                                    <Input placeholder="giapha@example.com" />
                                                </Form.Item>
                                            </Col>
                                            <Col span={12}>
                                                <Form.Item name="contactPhone" label="Số điện thoại">
                                                    <Input placeholder="0905 xxx xxx" />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </Card>
                                </Col>

                                <Col span={24}>
                                    <Card type="inner" title="Mạng xã hội" style={{ marginBottom: 24 }}>
                                        <Row gutter={16}>
                                            <Col span={8}>
                                                <Form.Item name="facebookUrl" label="Facebook">
                                                    <Input placeholder="https://facebook.com/..." />
                                                </Form.Item>
                                            </Col>
                                            <Col span={8}>
                                                <Form.Item name="zaloUrl" label="Zalo">
                                                    <Input placeholder="https://zalo.me/..." />
                                                </Form.Item>
                                            </Col>
                                            <Col span={8}>
                                                <Form.Item name="youtubeUrl" label="YouTube">
                                                    <Input placeholder="https://youtube.com/..." />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </Card>
                                </Col>

                                <Col span={24}>
                                    <Card type="inner" title="Footer" style={{ marginBottom: 24 }}>
                                        <Form.Item name="footerText" label="Nội dung Footer">
                                            <Input placeholder="Giữ gìn và phát huy truyền thống dòng họ" />
                                        </Form.Item>
                                    </Card>
                                </Col>
                            </Row>

                            <Form.Item style={{ textAlign: 'right', marginTop: 16 }}>
                                <Button type="primary" htmlType="submit" loading={settingsLoading} size="large">
                                    Lưu cấu hình
                                </Button>
                            </Form.Item>
                        </Form>
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
                            <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="gender" label="Giới tính" rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}>
                                <Select>
                                    <Select.Option value="male">Nam</Select.Option>
                                    <Select.Option value="female">Nữ</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="generation" label="Đời thứ" rules={[{ required: true, message: 'Vui lòng nhập đời' }]}>
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
                    <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}>
                        <Input />
                    </Form.Item>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="category" label="Danh mục" rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}>
                                <Select>
                                    <Select.Option value="gio_to">Giỗ Tổ</Select.Option>
                                    <Select.Option value="dai_hoi">Đại hội</Select.Option>
                                    <Select.Option value="cung_te">Cúng tế</Select.Option>
                                    <Select.Option value="tin_tuc">Tin tức</Select.Option>
                                    <Select.Option value="thong_bao">Thông báo</Select.Option>
                                    <Select.Option value="khac">Khác</Select.Option>
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
                    <Form.Item name="content" label="Nội dung" rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}>
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
                    <Form.Item name="title" label="Tên album" rules={[{ required: true, message: 'Vui lòng nhập tên album' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="category" label="Danh mục" rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}>
                        <Select>
                            <Select.Option value="tu_duong">Từ đường</Select.Option>
                            <Select.Option value="hop_mat">Họp mặt</Select.Option>
                            <Select.Option value="gio_to">Giỗ Tổ</Select.Option>
                            <Select.Option value="mo_phan">Mộ phần</Select.Option>
                            <Select.Option value="dai_hoi">Đại hội</Select.Option>
                            <Select.Option value="khac">Khác</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="description" label="Mô tả">
                        <TextArea rows={3} />
                    </Form.Item>
                    <Form.Item name="isFeatured" label="Album nổi bật" valuePropName="checked">
                        <Switch />
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
                    <Form.Item name="username" label="Tên đăng nhập" rules={[{ required: true, min: 3 }]}>
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
                    <Form.Item name="email" label="Email" rules={[{ type: 'email' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="role" label="Vai trò" rules={[{ required: true }]}>
                        <Select>
                            <Select.Option value="admin_toc">Admin (Quản trị viên)</Select.Option>
                            <Select.Option value="chi_ho">Trưởng chi</Select.Option>
                            <Select.Option value="thanh_vien">Thành viên</Select.Option>
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
