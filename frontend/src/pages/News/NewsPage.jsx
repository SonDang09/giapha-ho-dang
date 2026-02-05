import { useState, useEffect } from 'react';
import { Row, Col, Card, Tag, List, Empty, Spin, Button, Modal, Form, Input, Select, DatePicker, message, Alert } from 'antd';
import { FileTextOutlined, PlusOutlined, CalendarOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import { Link, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { newsAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const { TextArea } = Input;

const NewsPage = () => {
    useDocumentTitle('Tin Tức & Sự Kiện', 'Tin tức và sự kiện của họ Đặng Đà Nẵng. Cập nhật lễ giỗ tổ, đại hội họ, hoạt động từ thiện và các sự kiện quan trọng.');
    const { slug } = useParams();
    const { canEdit } = useAuth();
    const [loading, setLoading] = useState(true);
    const [news, setNews] = useState([]);
    const [selectedNews, setSelectedNews] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [apiConnected, setApiConnected] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        if (slug) {
            loadNewsDetail();
        } else {
            loadNews();
        }
    }, [slug]);

    const loadNews = async () => {
        setLoading(true);
        try {
            // Use API service with auth token
            const response = await newsAPI.getAll({ limit: 50 });

            if (response?.data?.data?.length > 0) {
                setNews(response.data.data);
                setApiConnected(true);
                setLoading(false);
                return;
            }
        } catch (error) {
            console.log('API not available, using demo data');
            setApiConnected(false);
        }

        // Fallback demo data
        setNews([
            { _id: 'news-1', title: 'Thông báo: Lễ Giỗ Tổ họ Đặng năm 2024', excerpt: 'Kính mời toàn thể bà con họ Đặng về dự lễ Giỗ Tổ năm 2024...', category: 'gio_to', eventDate: '2024-03-15' },
            { _id: 'news-2', title: 'Đại hội họ Đặng Đà Nẵng lần thứ X', excerpt: 'Đại hội sẽ được tổ chức vào ngày 20/06/2024...', category: 'dai_hoi', eventDate: '2024-06-20' },
            { _id: 'news-3', title: 'Khánh thành nhà thờ chi họ Đặng Văn', excerpt: 'Nhà thờ chi họ đã được khánh thành trong niềm vui...', category: 'tin_tuc' }
        ]);
        setLoading(false);
    };

    const loadNewsDetail = async () => {
        setLoading(true);
        try {
            // Use API service
            const response = await newsAPI.getBySlug(slug);

            if (response?.data?.data) {
                setSelectedNews(response.data.data);
                setApiConnected(true);
                setLoading(false);
                return;
            }
        } catch (error) {
            console.log('API not available, using demo data');
            setApiConnected(false);
        }

        // Demo - use slug to find matching demo data
        const demoNewsData = {
            'news-1': {
                title: 'Thông báo: Lễ Giỗ Tổ họ Đặng năm 2024',
                content: 'Kính thưa toàn thể bà con họ Đặng,\n\nNhân dịp lễ Giỗ Tổ họ Đặng năm 2024, Ban liên lạc họ Đặng trân trọng kính mời toàn thể bà con về dự lễ Giỗ Tổ tại Từ đường họ Đặng.\n\nThời gian: 8h00 ngày 15/03/2024 (nhằm ngày 6/2 Âm lịch)\nĐịa điểm: Từ đường họ Đặng, phường Hòa Khánh Bắc, quận Liên Chiểu, TP. Đà Nẵng\n\nChương trình:\n- 8h00: Đón tiếp bà con\n- 9h00: Lễ Giỗ Tổ\n- 11h00: Tiệc họp mặt\n\nRất mong sự tham gia đông đủ của bà con.',
                category: 'gio_to',
                eventDate: '2024-03-15',
                createdAt: '2024-02-01',
                viewCount: 156
            },
            'news-2': {
                title: 'Đại hội họ Đặng Đà Nẵng lần thứ X',
                content: 'Đại hội họ Đặng Đà Nẵng lần thứ X sẽ được tổ chức vào ngày 20/06/2024.\n\nNội dung chính:\n1. Tổng kết hoạt động dòng họ năm 2023\n2. Bầu Ban liên lạc nhiệm kỳ mới\n3. Thảo luận kế hoạch năm 2024-2025\n4. Trao học bổng cho con em họ Đặng\n\nĐịa điểm: Nhà văn hóa quận Hải Châu\nThời gian: 8h00 - 12h00\n\nKính mời bà con sắp xếp thời gian tham dự.',
                category: 'dai_hoi',
                eventDate: '2024-06-20',
                createdAt: '2024-02-15',
                viewCount: 234
            },
            'news-3': {
                title: 'Khánh thành nhà thờ chi họ Đặng Văn',
                content: 'Nhà thờ chi họ Đặng Văn đã được khánh thành trong niềm vui của toàn thể bà con.\n\nCông trình được xây dựng trong 2 năm với sự đóng góp của hơn 100 gia đình. Kiến trúc kết hợp truyền thống và hiện đại, tổng diện tích 500m2.',
                category: 'tin_tuc',
                createdAt: '2024-01-20',
                viewCount: 312
            }
        };

        setSelectedNews(demoNewsData[slug] || demoNewsData['news-1']);
        setLoading(false);
    };

    const handleCreateNews = async (values) => {
        try {
            const data = {
                ...values,
                eventDate: values.eventDate?.format('YYYY-MM-DD')
            };
            await newsAPI.create(data);
            message.success('Đã thêm bài viết');
            setModalVisible(false);
            form.resetFields();
            loadNews();
        } catch (error) {
            console.error('Create news error:', error);
            message.error(error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng kiểm tra quyền truy cập.');
        }
    };

    const getCategoryLabel = (cat) => {
        const labels = {
            gio_to: 'Giỗ Tổ',
            dai_hoi: 'Đại hội',
            cung_te: 'Cúng tế',
            tin_tuc: 'Tin tức',
            thong_bao: 'Thông báo',
            khac: 'Khác'
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

    // Single news view
    if (slug && selectedNews) {
        return (
            <div className="page-container">
                <Link to="/news" style={{ display: 'inline-block', marginBottom: 16 }}>
                    ← Quay lại tin tức
                </Link>

                {!apiConnected && (
                    <Alert
                        type="info"
                        message="Đang hiển thị dữ liệu mẫu"
                        style={{ marginBottom: 16 }}
                        closable
                    />
                )}

                <Card bordered={false}>
                    <Tag color={getCategoryColor(selectedNews.category)} style={{ marginBottom: 16 }}>
                        {getCategoryLabel(selectedNews.category)}
                    </Tag>

                    <h1 style={{ fontSize: 28, color: '#228B22', marginBottom: 16 }}>
                        {selectedNews.title}
                    </h1>

                    <div style={{ color: '#64748b', marginBottom: 24, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                        {selectedNews.eventDate && (
                            <span><CalendarOutlined /> {dayjs(selectedNews.eventDate).format('DD/MM/YYYY')}</span>
                        )}
                        <span><EyeOutlined /> {selectedNews.viewCount || 0} lượt xem</span>
                    </div>

                    <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                        {selectedNews.content}
                    </div>
                </Card>
            </div>
        );
    }

    // News list
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
                    <FileTextOutlined style={{ color: '#D4AF37' }} /> Tin Tức & Sự Kiện
                </h1>

                <div style={{ display: 'flex', gap: 8 }}>
                    <Button icon={<ReloadOutlined />} onClick={loadNews} loading={loading}>
                        Tải lại
                    </Button>
                    {canEdit() && (
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setModalVisible(true)}
                        >
                            Thêm bài viết
                        </Button>
                    )}
                </div>
            </div>

            {news.length === 0 ? (
                <Empty description="Chưa có tin tức nào" />
            ) : (
                <Row gutter={[24, 24]}>
                    {news.map((item) => (
                        <Col xs={24} md={12} lg={8} key={item._id}>
                            <Card
                                hoverable
                                cover={
                                    item.featuredImage ? (
                                        <img alt={item.title} src={item.featuredImage} style={{ height: 160, objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{
                                            height: 160,
                                            background: `linear-gradient(135deg, #228B22 0%, #D4AF37 100%)`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontSize: 48
                                        }}>
                                            📰
                                        </div>
                                    )
                                }
                            >
                                <Tag color={getCategoryColor(item.category)} style={{ marginBottom: 8 }}>
                                    {getCategoryLabel(item.category)}
                                </Tag>

                                <Card.Meta
                                    title={
                                        <Link to={`/news/${item.slug || item._id}`} style={{ color: '#2c3e50' }}>
                                            {item.title}
                                        </Link>
                                    }
                                    description={
                                        <div>
                                            <p style={{
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                marginBottom: 8
                                            }}>
                                                {item.excerpt}
                                            </p>
                                            {item.eventDate && (
                                                <small style={{ color: '#94a3b8' }}>
                                                    <CalendarOutlined /> {dayjs(item.eventDate).format('DD/MM/YYYY')}
                                                </small>
                                            )}
                                        </div>
                                    }
                                />
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}

            {/* Add News Modal */}
            <Modal
                title="Thêm bài viết mới"
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                width={700}
            >
                <Form form={form} layout="vertical" onFinish={handleCreateNews}>
                    <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}>
                        <Input placeholder="Nhập tiêu đề bài viết" />
                    </Form.Item>

                    <Form.Item name="category" label="Danh mục" rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}>
                        <Select placeholder="Chọn danh mục">
                            <Select.Option value="gio_to">Giỗ Tổ</Select.Option>
                            <Select.Option value="dai_hoi">Đại hội</Select.Option>
                            <Select.Option value="cung_te">Cúng tế</Select.Option>
                            <Select.Option value="tin_tuc">Tin tức</Select.Option>
                            <Select.Option value="thong_bao">Thông báo</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="eventDate" label="Ngày diễn ra">
                        <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày" />
                    </Form.Item>

                    <Form.Item name="content" label="Nội dung" rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}>
                        <TextArea rows={8} placeholder="Nhập nội dung bài viết..." />
                    </Form.Item>

                    <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
                        <Button onClick={() => setModalVisible(false)} style={{ marginRight: 8 }}>Hủy</Button>
                        <Button type="primary" htmlType="submit">Đăng bài</Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default NewsPage;
