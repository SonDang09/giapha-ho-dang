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
                {/* Mobile Logo - Đặng Đức Tộc */}
                <Link to="/" className="mobile-logo" style={{
                    display: 'flex',
                    alignItems: 'center',
                    textDecoration: 'none'
                }}>
                    <span style={{
                        fontFamily: "'Times New Roman', Georgia, serif",
                        fontSize: 20,
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #D4AF37 0%, #F4E4A6 50%, #D4AF37 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                        letterSpacing: '2px',
                        textTransform: 'uppercase'
                    }}>
                        Đặng Đức Tộc
                    </span>
                </Link>

                {/* Desktop Logo */}
                <Link to="/" className="logo-text-wrapper" style={{ display: 'flex', alignItems: 'center', gap: 12, overflow: 'hidden' }}>
                    <span style={{
                        color: 'white',
                        fontSize: 18,
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
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
                <Space size="middle" style={{ flexShrink: 0, alignItems: 'center' }}>
                    {/* Search */}
                    <div className="header-search" style={{ display: 'flex', alignItems: 'center' }}>
                        <Search
                            placeholder="Tìm kiếm..."
                            onSearch={handleSearch}
                            style={{ width: 180 }}
                            allowClear
                        />
                    </div>

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
                background: isDarkMode ? '#1a0f0a' : '#8B0000',
                color: 'rgba(255,255,255,0.85)',
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
        .logo-text-wrapper { display: none !important; }
        .mobile-logo { display: flex !important; }
        .user-name { display: none; }
        .header-search { display: none !important; }
        
        @media (min-width: 768px) {
          .desktop-menu { display: flex !important; }
          .mobile-menu-btn { display: none !important; }
          .logo-text { display: block !important; }
          .logo-text-wrapper { display: flex !important; }
          .mobile-logo { display: none !important; }
          .user-name { display: inline; }
          .header-search { 
            display: flex !important;
            align-items: center;
          }
          .header-search .ant-input-group-wrapper,
          .header-search .ant-input-search,
          .header-search .ant-input-wrapper {
            display: flex !important;
            align-items: center;
          }
          .header-search .ant-input-affix-wrapper {
            background: rgba(255,255,255,0.1) !important;
            border-color: rgba(255,255,255,0.2) !important;
            border-radius: 6px 0 0 6px !important;
          }
          .header-search .ant-input {
            background: transparent !important;
            color: white !important;
          }
          .header-search .ant-input::placeholder {
            color: rgba(255,255,255,0.5) !important;
          }
          .header-search .ant-input-search-button {
            background: rgba(255,255,255,0.15) !important;
            border-color: rgba(255,255,255,0.2) !important;
            border-radius: 0 6px 6px 0 !important;
            height: 32px !important;
          }
          .header-search .ant-input-search-button .anticon {
            color: white !important;
          }
          .header-search .ant-input-clear-icon {
            color: rgba(255,255,255,0.5) !important;
          }
        }
      `}</style>
        </Layout>
    );
};

export default AppLayout;
