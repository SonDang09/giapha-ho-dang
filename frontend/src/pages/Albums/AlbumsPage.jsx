import { useState, useEffect } from 'react';
import { Row, Col, Card, Tag, Empty, Spin, Button, Modal, Form, Input, Select, Upload, Image, message } from 'antd';
import { PictureOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { useParams, Link } from 'react-router-dom';
import { albumsAPI, demoAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

const AlbumsPage = () => {
    const { id } = useParams();
    const { canEdit } = useAuth();
    const [loading, setLoading] = useState(true);
    const [albums, setAlbums] = useState([]);
    const [selectedAlbum, setSelectedAlbum] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        if (id) {
            loadAlbumDetail();
        } else {
            loadAlbums();
        }
    }, [id]);

    const loadAlbums = async () => {
        setLoading(true);
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);

            try {
                const response = await fetch('http://localhost:5001/api/demo/albums', {
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
                const data = await response.json();
                if (data.data) {
                    setAlbums(data.data);
                    return;
                }
            } catch (fetchError) {
                clearTimeout(timeoutId);
            }

            // Fallback demo data
            setAlbums([
                { _id: 'album-1', title: 'Từ đường họ Đặng', category: 'tu_duong', photoCount: 15, isFeatured: true },
                { _id: 'album-2', title: 'Họp mặt họ Đặng 2023', category: 'hop_mat', photoCount: 50, isFeatured: true },
                { _id: 'album-3', title: 'Mộ phần các cụ', category: 'mo_phan', photoCount: 20, isFeatured: false }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const loadAlbumDetail = async () => {
        setLoading(true);
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);

            try {
                const response = await fetch(`http://localhost:5001/api/albums/${id}`, {
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
                const data = await response.json();
                if (data.data) {
                    setSelectedAlbum(data.data);
                    return;
                }
            } catch (fetchError) {
                clearTimeout(timeoutId);
            }

            // Demo - use id to find matching demo data
            const demoAlbumData = {
                'album-1': {
                    title: 'Từ đường họ Đặng',
                    category: 'tu_duong',
                    description: 'Hình ảnh Từ đường họ Đặng tại Đà Nẵng - nơi thờ cúng tổ tiên.',
                    photos: [
                        { url: 'https://via.placeholder.com/400x300/228B22/ffffff?text=Tu+Duong+1', caption: 'Mặt tiền Từ đường' },
                        { url: 'https://via.placeholder.com/400x300/D4AF37/ffffff?text=Tu+Duong+2', caption: 'Bàn thờ chính điện' },
                        { url: 'https://via.placeholder.com/400x300/1a6b1a/ffffff?text=Tu+Duong+3', caption: 'Khu vực sân trước' },
                        { url: 'https://via.placeholder.com/400x300/b8962f/ffffff?text=Tu+Duong+4', caption: 'Bảng gia phả' }
                    ]
                },
                'album-2': {
                    title: 'Họp mặt họ Đặng 2023',
                    category: 'hop_mat',
                    description: 'Hình ảnh buổi họp mặt đại gia đình họ Đặng năm 2023 tại Từ đường.',
                    photos: [
                        { url: 'https://via.placeholder.com/400x300/228B22/ffffff?text=Hop+Mat+1', caption: 'Toàn cảnh buổi họp mặt' },
                        { url: 'https://via.placeholder.com/400x300/D4AF37/ffffff?text=Hop+Mat+2', caption: 'Ban chấp hành họ' },
                        { url: 'https://via.placeholder.com/400x300/1a6b1a/ffffff?text=Hop+Mat+3', caption: 'Tiệc họp mặt' },
                        { url: 'https://via.placeholder.com/400x300/b8962f/ffffff?text=Hop+Mat+4', caption: 'Ảnh lưu niệm' }
                    ]
                },
                'album-3': {
                    title: 'Mộ phần các cụ',
                    category: 'mo_phan',
                    description: 'Hình ảnh mộ phần các cụ tổ tiên dòng họ Đặng.',
                    photos: [
                        { url: 'https://via.placeholder.com/400x300/333333/ffffff?text=Mo+Phan+1', caption: 'Khu mộ tổ' },
                        { url: 'https://via.placeholder.com/400x300/444444/ffffff?text=Mo+Phan+2', caption: 'Bia đá ghi công' },
                        { url: 'https://via.placeholder.com/400x300/555555/ffffff?text=Mo+Phan+3', caption: 'Toàn cảnh khu mộ' }
                    ]
                }
            };

            setSelectedAlbum(demoAlbumData[id] || demoAlbumData['album-1']);
        } finally {
            setLoading(false);
        }
    };

    const getCategoryLabel = (cat) => {
        const labels = {
            mo_phan: 'Mộ phần',
            tu_duong: 'Từ đường',
            hop_mat: 'Họp mặt',
            gio_to: 'Giỗ Tổ',
            dai_hoi: 'Đại hội',
            khac: 'Khác'
        };
        return labels[cat] || cat;
    };

    const getCategoryColor = (cat) => {
        const colors = {
            mo_phan: 'default',
            tu_duong: 'gold',
            hop_mat: 'green',
            gio_to: 'red',
            dai_hoi: 'blue'
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

    // Album detail view
    if (id && selectedAlbum) {
        return (
            <div className="page-container">
                <Link to="/albums" style={{ display: 'inline-block', marginBottom: 16 }}>
                    ← Quay lại album
                </Link>

                <Card bordered={false}>
                    <Tag color={getCategoryColor(selectedAlbum.category)} style={{ marginBottom: 16 }}>
                        {getCategoryLabel(selectedAlbum.category)}
                    </Tag>

                    <h1 style={{ fontSize: 28, color: '#228B22', marginBottom: 8 }}>
                        {selectedAlbum.title}
                    </h1>

                    {selectedAlbum.description && (
                        <p style={{ color: '#64748b', marginBottom: 24 }}>
                            {selectedAlbum.description}
                        </p>
                    )}

                    <Image.PreviewGroup>
                        <Row gutter={[16, 16]}>
                            {(selectedAlbum.photos || []).map((photo, index) => (
                                <Col xs={12} sm={8} md={6} key={index}>
                                    <Image
                                        src={photo.url}
                                        alt={photo.caption || `Photo ${index + 1}`}
                                        style={{
                                            width: '100%',
                                            aspectRatio: '4/3',
                                            objectFit: 'cover',
                                            borderRadius: 8
                                        }}
                                    />
                                    {photo.caption && (
                                        <p style={{ fontSize: 12, color: '#64748b', marginTop: 8, textAlign: 'center' }}>
                                            {photo.caption}
                                        </p>
                                    )}
                                </Col>
                            ))}
                        </Row>
                    </Image.PreviewGroup>
                </Card>
            </div>
        );
    }

    // Albums list
    return (
        <div className="page-container">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                <h1 className="page-title" style={{ margin: 0 }}>
                    <PictureOutlined style={{ color: '#D4AF37' }} /> Album Ảnh
                </h1>

                {canEdit() && (
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setModalVisible(true)}
                    >
                        Tạo album
                    </Button>
                )}
            </div>

            {albums.length === 0 ? (
                <Empty description="Chưa có album nào" />
            ) : (
                <Row gutter={[24, 24]}>
                    {albums.map((album) => (
                        <Col xs={24} sm={12} md={8} lg={6} key={album._id}>
                            <Link to={`/albums/${album._id}`}>
                                <Card
                                    hoverable
                                    cover={
                                        album.coverImage ? (
                                            <img alt={album.title} src={album.coverImage} style={{ height: 160, objectFit: 'cover' }} />
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
                                                📷
                                            </div>
                                        )
                                    }
                                    bodyStyle={{ padding: 16 }}
                                >
                                    <Tag color={getCategoryColor(album.category)} style={{ marginBottom: 8 }}>
                                        {getCategoryLabel(album.category)}
                                    </Tag>
                                    <h3 style={{ margin: 0, fontSize: 16 }}>{album.title}</h3>
                                    <p style={{ margin: '8px 0 0', fontSize: 13, color: '#64748b' }}>
                                        {album.photoCount || album.photos?.length || 0} ảnh
                                    </p>
                                </Card>
                            </Link>
                        </Col>
                    ))}
                </Row>
            )}

            {/* Create Album Modal */}
            <Modal
                title="Tạo album mới"
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                width={600}
            >
                <Form form={form} layout="vertical" onFinish={async (values) => {
                    try {
                        await albumsAPI.create(values);
                        message.success('Đã tạo album');
                        setModalVisible(false);
                        form.resetFields();
                        loadAlbums();
                    } catch (error) {
                        message.error('Có lỗi xảy ra');
                    }
                }}>
                    <Form.Item name="title" label="Tên album" rules={[{ required: true }]}>
                        <Input placeholder="VD: Họp mặt họ Đặng 2024" />
                    </Form.Item>

                    <Form.Item name="category" label="Danh mục" rules={[{ required: true }]}>
                        <Select placeholder="Chọn danh mục">
                            <Select.Option value="mo_phan">Mộ phần</Select.Option>
                            <Select.Option value="tu_duong">Từ đường</Select.Option>
                            <Select.Option value="hop_mat">Họp mặt</Select.Option>
                            <Select.Option value="gio_to">Giỗ Tổ</Select.Option>
                            <Select.Option value="dai_hoi">Đại hội</Select.Option>
                            <Select.Option value="khac">Khác</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="description" label="Mô tả">
                        <Input.TextArea rows={3} placeholder="Mô tả ngắn về album..." />
                    </Form.Item>

                    <Form.Item style={{ textAlign: 'right' }}>
                        <Button type="primary" htmlType="submit">Tạo album</Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AlbumsPage;
