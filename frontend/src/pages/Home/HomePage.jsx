import { useState, useEffect } from 'react';
import { Row, Col, Card, List, Avatar, Tag, Empty, Spin, Button, Carousel } from 'antd';
import { Link } from 'react-router-dom';
import {
    ApartmentOutlined,
    CalendarOutlined,
    FileTextOutlined,
    PictureOutlined,
    RightOutlined,
    HeartOutlined,
    TeamOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { membersAPI, newsAPI, albumsAPI, settingsAPI } from '../../api';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const HomePage = () => {
    useDocumentTitle('Trang chủ', 'Gia phả họ Đặng Đà Nẵng - Trang web lưu giữ và kết nối các thế hệ trong dòng họ. Xem cây gia phả, lịch giỗ, tin tức và hình ảnh gia đình.');
    const [loading, setLoading] = useState(true);
    const [anniversaries, setAnniversaries] = useState([]);
    const [news, setNews] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [siteSettings, setSiteSettings] = useState({
        siteTitle: 'Gia Phả Họ Đặng Đà Nẵng',
        tagline: 'Uống nước nhớ nguồn - Ăn quả nhớ kẻ trồng cây',
        heroDescription: 'Trang web lưu giữ và kết nối các thế hệ trong dòng họ'
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // Load data from API service
            const loadAnniversaries = membersAPI.getAnniversaries().catch(() => null);
            const loadNews = newsAPI.getLatest().catch(() => null);
            const loadAlbums = albumsAPI.getFeatured().catch(() => null);
            const loadSettings = settingsAPI.get().catch(() => null);

            const [annRes, newsRes, albumRes, settingsRes] = await Promise.all([
                loadAnniversaries,
                loadNews,
                loadAlbums,
                loadSettings
            ]);

            // Load site settings
            if (settingsRes?.data?.data) {
                setSiteSettings(prev => ({
                    ...prev,
                    siteTitle: settingsRes.data.data.siteTitle || prev.siteTitle,
                    tagline: settingsRes.data.data.tagline || prev.tagline,
                    heroDescription: settingsRes.data.data.heroDescription || prev.heroDescription
                }));
            }

            if (annRes?.data?.data) {
                setAnniversaries(annRes.data.data);
            } else {
                // Use embedded demo data
                setAnniversaries([
                    { _id: 'ann-1', fullName: 'Đặng Văn Tổ', generation: 1, anniversaryDate: { lunarDay: 15, lunarMonth: 2 } },
                    { _id: 'ann-2', fullName: 'Đặng Văn Nhất', generation: 2, anniversaryDate: { lunarDay: 8, lunarMonth: 2 } },
                    { _id: 'ann-3', fullName: 'Đặng Văn An', generation: 3, anniversaryDate: { lunarDay: 20, lunarMonth: 2 } }
                ]);
            }

            if (newsRes?.data?.data) {
                setNews(newsRes.data.data);
            } else {
                setNews([
                    { _id: 'news-1', title: 'Thông báo: Lễ Giỗ Tổ họ Đặng năm 2024', category: 'gio_to', eventDate: '2024-03-15' },
                    { _id: 'news-2', title: 'Đại hội họ Đặng Đà Nẵng lần thứ X', category: 'dai_hoi', eventDate: '2024-06-20' }
                ]);
            }

            if (albumRes?.data?.data) {
                setAlbums(albumRes.data.data);
            } else {
                setAlbums([
                    { _id: 'album-1', title: 'Từ đường họ Đặng', category: 'tu_duong', photos: [] },
                    { _id: 'album-2', title: 'Họp mặt họ Đặng 2023', category: 'hop_mat', photos: [] }
                ]);
            }
        } catch (error) {
            console.log('Using default demo data');
        } finally {
            setLoading(false);
        }
    };

    const getCategoryLabel = (cat) => {
        const labels = {
            gio_to: 'Giỗ Tổ',
            dai_hoi: 'Đại hội',
            cung_te: 'Cúng tế',
            tin_tuc: 'Tin tức',
            thong_bao: 'Thông báo'
        };
        return labels[cat] || cat;
    };

    const getCategoryColor = (cat) => {
        const colors = {
            gio_to: 'red',
            dai_hoi: 'blue',
            cung_te: 'purple',
            tin_tuc: 'green',
            thong_bao: 'orange'
        };
        return colors[cat] || 'default';
    };

    if (loading) {
        return (
            <div className="flex-center" style={{ minHeight: 400 }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="home-page">
            {/* Hero Banner */}
            <div style={{
                background: 'linear-gradient(135deg, #1a3d1a 0%, #228B22 50%, #2aa52a 100%)',
                borderRadius: 16,
                padding: '48px 32px',
                marginBottom: 32,
                textAlign: 'center',
                color: 'white',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                    opacity: 0.5
                }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{
                        width: 80,
                        height: 80,
                        background: 'linear-gradient(135deg, #D4AF37 0%, #b8962f 100%)',
                        borderRadius: 16,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 20px',
                        fontSize: 36,
                        fontWeight: 'bold',
                        boxShadow: '0 4px 20px rgba(212, 175, 55, 0.4)'
                    }}>
                        Đ
                    </div>

                    <h1 style={{
                        fontSize: 32,
                        fontWeight: 700,
                        marginBottom: 12,
                        textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}>
                        {siteSettings.siteTitle}
                    </h1>

                    <p style={{
                        fontSize: 18,
                        opacity: 0.9,
                        maxWidth: 500,
                        margin: '0 auto 24px'
                    }}>
                        "{siteSettings.tagline}"
                    </p>

                    <Link to="/tree">
                        <Button
                            type="primary"
                            size="large"
                            icon={<ApartmentOutlined />}
                            style={{
                                background: '#D4AF37',
                                borderColor: '#D4AF37',
                                height: 48,
                                paddingLeft: 32,
                                paddingRight: 32,
                                fontSize: 16
                            }}
                        >
                            Xem Cây Gia Phả
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Section */}
            <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
                {[
                    { icon: <TeamOutlined />, count: '150+', label: 'Thành viên', color: '#228B22' },
                    { icon: <ApartmentOutlined />, count: '5', label: 'Thế hệ', color: '#D4AF37' },
                    { icon: <CalendarOutlined />, count: '175', label: 'Năm lịch sử', color: '#3b82f6' },
                    { icon: <HeartOutlined />, count: '500+', label: 'Nén hương', color: '#ec4899' }
                ].map((stat, i) => (
                    <Col xs={12} sm={6} key={i}>
                        <Card
                            bordered={false}
                            style={{ textAlign: 'center' }}
                            bodyStyle={{ padding: 20 }}
                        >
                            <div style={{ fontSize: 28, color: stat.color, marginBottom: 8 }}>
                                {stat.icon}
                            </div>
                            <div style={{ fontSize: 28, fontWeight: 700, color: stat.color }}>
                                {stat.count}
                            </div>
                            <div style={{ color: '#64748b', fontSize: 14 }}>
                                {stat.label}
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Row gutter={[24, 24]}>
                {/* Upcoming Anniversaries Widget */}
                <Col xs={24} lg={8}>
                    <div className="widget">
                        <div className="widget-header">
                            <span className="widget-title">
                                <CalendarOutlined /> Ngày Giỗ Sắp Tới
                            </span>
                            <Link to="/anniversaries" style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>
                                Xem tất cả <RightOutlined />
                            </Link>
                        </div>
                        <div className="widget-body">
                            {anniversaries.length === 0 ? (
                                <Empty description="Chưa có thông tin ngày giỗ" />
                            ) : (
                                <List
                                    dataSource={anniversaries.slice(0, 5)}
                                    renderItem={(item) => (
                                        <div className="anniversary-item">
                                            <Avatar
                                                size={48}
                                                style={{
                                                    backgroundColor: '#D4AF37',
                                                    marginRight: 12,
                                                    flexShrink: 0
                                                }}
                                            >
                                                {item.fullName?.charAt(item.fullName.lastIndexOf(' ') + 1)}
                                            </Avatar>
                                            <div className="anniversary-info">
                                                <div className="anniversary-name">{item.fullName}</div>
                                                <div className="anniversary-date">
                                                    Ngày {item.anniversaryDate?.lunarDay}/{item.anniversaryDate?.lunarMonth} (Âm lịch)
                                                </div>
                                            </div>
                                            <Tag color="gold" style={{ marginLeft: 8 }}>
                                                Đời {item.generation}
                                            </Tag>
                                        </div>
                                    )}
                                />
                            )}
                        </div>
                    </div>
                </Col>

                {/* News Widget */}
                <Col xs={24} lg={8}>
                    <div className="widget">
                        <div className="widget-header">
                            <span className="widget-title">
                                <FileTextOutlined /> Tin Tức & Sự Kiện
                            </span>
                            <Link to="/news" style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>
                                Xem tất cả <RightOutlined />
                            </Link>
                        </div>
                        <div className="widget-body">
                            {news.length === 0 ? (
                                <Empty description="Chưa có tin tức" />
                            ) : (
                                <List
                                    dataSource={news.slice(0, 4)}
                                    renderItem={(item) => (
                                        <List.Item style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                                            <List.Item.Meta
                                                title={
                                                    <Link to={`/news/${item.slug || item._id}`} style={{
                                                        color: '#2c3e50',
                                                        fontWeight: 500,
                                                        display: 'block',
                                                        marginBottom: 4
                                                    }}>
                                                        {item.title}
                                                    </Link>
                                                }
                                                description={
                                                    <div>
                                                        <Tag color={getCategoryColor(item.category)} style={{ marginBottom: 4 }}>
                                                            {getCategoryLabel(item.category)}
                                                        </Tag>
                                                        <div style={{ fontSize: 12, color: '#94a3b8' }}>
                                                            {item.eventDate && dayjs(item.eventDate).format('DD/MM/YYYY')}
                                                        </div>
                                                    </div>
                                                }
                                            />
                                        </List.Item>
                                    )}
                                />
                            )}
                        </div>
                    </div>
                </Col>

                {/* Albums Widget */}
                <Col xs={24} lg={8}>
                    <div className="widget">
                        <div className="widget-header">
                            <span className="widget-title">
                                <PictureOutlined /> Album Ảnh
                            </span>
                            <Link to="/albums" style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>
                                Xem tất cả <RightOutlined />
                            </Link>
                        </div>
                        <div className="widget-body">
                            {albums.length === 0 ? (
                                <Empty description="Chưa có album ảnh" />
                            ) : (
                                <Row gutter={[8, 8]}>
                                    {albums.slice(0, 4).map((album, i) => (
                                        <Col span={12} key={album._id || i}>
                                            <Link to={`/albums/${album._id}`}>
                                                <div style={{
                                                    aspectRatio: '4/3',
                                                    background: `linear-gradient(45deg, #228B22 ${i * 25}%, #D4AF37 100%)`,
                                                    borderRadius: 8,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'white',
                                                    fontSize: 12,
                                                    textAlign: 'center',
                                                    padding: 8,
                                                    transition: 'transform 0.2s',
                                                    cursor: 'pointer'
                                                }}
                                                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                                >
                                                    {album.title}
                                                </div>
                                            </Link>
                                        </Col>
                                    ))}
                                </Row>
                            )}
                        </div>
                    </div>
                </Col>
            </Row>

            <style>{`
        .home-page {
          animation: fadeIn 0.5s ease;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @media (max-width: 768px) {
          .home-page h1 {
            font-size: 24px !important;
          }
        }
      `}</style>
        </div>
    );
};

export default HomePage;
