import { useState } from 'react';
import { Layout, Menu, Input, Button, Avatar, Dropdown, Space, Badge } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    HomeOutlined,
    ApartmentOutlined,
    TeamOutlined,
    FileTextOutlined,
    PictureOutlined,
    HeartOutlined,
    UserOutlined,
    LogoutOutlined,
    SettingOutlined,
    SearchOutlined,
    MenuOutlined,
    BulbOutlined,
    DashboardOutlined,
    CalendarOutlined,
    WalletOutlined
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const { Header, Content, Footer } = Layout;
const { Search } = Input;

const AppLayout = ({ children }) => {
    const { user, isAuthenticated, logout, canEdit, isAdmin } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const menuItems = [
        { key: '/', icon: <HomeOutlined />, label: <Link to="/">Trang chủ</Link> },
        { key: '/tree', icon: <ApartmentOutlined />, label: <Link to="/tree">Cây gia phả</Link> },
        { key: '/members', icon: <TeamOutlined />, label: <Link to="/members">Thành viên</Link> },
        { key: '/dashboard', icon: <DashboardOutlined />, label: <Link to="/dashboard">Thống kê</Link> },
        { key: '/calendar', icon: <CalendarOutlined />, label: <Link to="/calendar">Lịch giỗ</Link> },
        { key: '/fund', icon: <WalletOutlined />, label: <Link to="/fund">Quỹ họ</Link> },
        { key: '/news', icon: <FileTextOutlined />, label: <Link to="/news">Tin tức</Link> },
        { key: '/albums', icon: <PictureOutlined />, label: <Link to="/albums">Hình ảnh</Link> },
        { key: '/memorial', icon: <HeartOutlined />, label: <Link to="/memorial">Tưởng niệm</Link> }
    ];

    const userMenuItems = [
        { key: 'profile', icon: <UserOutlined />, label: 'Hồ sơ' },
        ...(isAdmin() ? [{ key: 'admin', icon: <SettingOutlined />, label: 'Quản trị' }] : []),
        { type: 'divider' },
        { key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất', danger: true }
    ];

    const handleUserMenuClick = ({ key }) => {
        if (key === 'logout') {
            logout();
            navigate('/');
        } else if (key === 'admin') {
            navigate('/admin');
        } else if (key === 'profile') {
            navigate('/profile');
        }
    };

    const handleSearch = (value) => {
        if (value.trim()) {
            navigate(`/search?q=${encodeURIComponent(value)}`);
        }
    };

    return (
        <Layout className="app-layout">
            <Header style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 24px',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                {/* Logo */}
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 40,
                        height: 40,
                        background: 'linear-gradient(135deg, #D4AF37 0%, #b8962f 100%)',
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 20,
                        fontWeight: 'bold',
                        color: 'white'
                    }}>
                        Đ
                    </div>
                    <span style={{
                        color: 'white',
                        fontSize: 18,
                        fontWeight: 600,
                        display: 'none',
                        '@media (min-width: 768px)': { display: 'block' }
                    }} className="logo-text">
                        Gia Phả Họ Đặng
                    </span>
                </Link>

                {/* Desktop Menu */}
                <Menu
                    theme="dark"
                    mode="horizontal"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    style={{
                        flex: 1,
                        marginLeft: 24,
                        background: 'transparent',
                        borderBottom: 'none',
                        display: 'none'
                    }}
                    className="desktop-menu"
                />

                {/* Right Section */}
                <Space size="middle" style={{ flexShrink: 0 }}>
                    {/* Search */}
                    <Search
                        placeholder="Tìm kiếm..."
                        onSearch={handleSearch}
                        style={{ width: 180, minWidth: 120 }}
                        className="header-search"
                        allowClear
                    />

                    {/* Theme Toggle */}
                    <Button
                        type="text"
                        icon={<BulbOutlined />}
                        onClick={toggleTheme}
                        style={{ color: isDarkMode ? '#D4AF37' : 'white' }}
                    />

                    {/* User Menu */}
                    {isAuthenticated ? (
                        <Dropdown
                            menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
                            placement="bottomRight"
                        >
                            <Space style={{ cursor: 'pointer', color: 'white' }}>
                                <Avatar
                                    src={user?.avatar}
                                    icon={<UserOutlined />}
                                    style={{ backgroundColor: '#D4AF37' }}
                                />
                                <span className="user-name">{user?.fullName}</span>
                            </Space>
                        </Dropdown>
                    ) : (
                        <Button type="primary" onClick={() => navigate('/login')}>
                            Đăng nhập
                        </Button>
                    )}

                    {/* Mobile Menu Button */}
                    <Button
                        type="text"
                        icon={<MenuOutlined />}
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        style={{ color: 'white' }}
                        className="mobile-menu-btn"
                    />
                </Space>
            </Header>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div style={{
                    position: 'fixed',
                    top: 64,
                    left: 0,
                    right: 0,
                    background: isDarkMode ? '#16213e' : 'white',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    zIndex: 99,
                    padding: 16
                }}>
                    <Menu
                        mode="vertical"
                        selectedKeys={[location.pathname]}
                        items={menuItems}
                        onClick={() => setMobileMenuOpen(false)}
                    />
                </div>
            )}

            <Content className="main-content">
                {children}
            </Content>

            <Footer style={{
                textAlign: 'center',
                background: isDarkMode ? '#0f0f1a' : '#1a3d1a',
                color: 'rgba(255,255,255,0.7)',
                padding: '24px'
            }}>
                <div style={{ marginBottom: 8 }}>
                    <strong style={{ color: '#D4AF37' }}>Gia Phả Họ Đặng Đà Nẵng</strong>
                </div>
                <div style={{ fontSize: 13 }}>
                    © {new Date().getFullYear()} - Giữ gìn và phát huy truyền thống dòng họ
                </div>
            </Footer>

            <style>{`
        .desktop-menu { display: none !important; }
        .mobile-menu-btn { display: block !important; }
        .logo-text { display: none !important; }
        .user-name { display: none; }
        .header-search { display: none !important; }
        
        @media (min-width: 768px) {
          .desktop-menu { display: flex !important; }
          .mobile-menu-btn { display: none !important; }
          .logo-text { display: block !important; }
          .user-name { display: inline; }
          .header-search { 
            display: inline-flex !important; 
          }
          .header-search .ant-input-search {
            border-radius: 6px;
            overflow: hidden;
          }
          .header-search .ant-input {
            background: rgba(255,255,255,0.1);
            border-color: rgba(255,255,255,0.2);
            color: white;
          }
          .header-search .ant-input::placeholder {
            color: rgba(255,255,255,0.5);
          }
          .header-search .ant-input:focus,
          .header-search .ant-input:hover {
            background: rgba(255,255,255,0.15);
            border-color: rgba(255,255,255,0.3);
          }
          .header-search .ant-input-search-button {
            background: rgba(255,255,255,0.1);
            border-color: rgba(255,255,255,0.2);
          }
        }
        
        @media (min-width: 1024px) {
          .header-search {
            width: 200px !important;
          }
        }
      `}</style>
        </Layout>
    );
};

export default AppLayout;
