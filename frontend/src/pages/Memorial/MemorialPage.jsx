import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Row, Col, Avatar, Spin, Empty, List, Form, Input, Button, message, Divider } from 'antd';
import { UserOutlined, HeartOutlined, CalendarOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import MemorialCandle from '../../components/Memorial/MemorialCandle';
import { memorialsAPI, membersAPI } from '../../api';
import dayjs from 'dayjs';

const { TextArea } = Input;

const MemorialPage = () => {
    const { memberId } = useParams();
    const [loading, setLoading] = useState(true);
    const [member, setMember] = useState(null);
    const [memorial, setMemorial] = useState(null);
    const [condolences, setCondolences] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        if (memberId) {
            loadMemorial();
        } else {
            loadAllMemorials();
        }
    }, [memberId]);

    const loadMemorial = async () => {
        setLoading(true);
        try {
            // Use API service
            const response = await memorialsAPI.getByMemberId(memberId);

            if (response?.data?.data) {
                setMemorial(response.data.data);
                setMember(response.data.data.memberId);
                setCondolences(response.data.data.condolences || []);
                setLoading(false);
                return;
            }
        } catch (error) {
            console.log('API not available, using demo data');
        }

        // Demo data fallback - use memberId to get correct data
        const demoMemberData = {
            '1': { fullName: 'Đặng Văn Tổ', birthDate: '1850-01-01', deathDate: '1920-03-15', generation: 1, biography: 'Người sáng lập dòng họ Đặng tại Đà Nẵng. Cụ là một người có công lớn trong việc khai phá và phát triển vùng đất này.' },
            '2': { fullName: 'Đặng Văn Nhất', birthDate: '1880-05-10', deathDate: '1950-08-20', generation: 2, biography: 'Con trai trưởng của cụ Tổ. Tiếp nối sự nghiệp của cha, phát triển dòng họ.' },
            '3': { fullName: 'Đặng Văn Nhì', birthDate: '1885-07-15', deathDate: '1960-12-25', generation: 2, biography: 'Con trai thứ của cụ Tổ. Có công trong việc mở mang ruộng vườn.' },
            '4': { fullName: 'Đặng Văn An', birthDate: '1910-03-20', deathDate: '1980-11-05', generation: 3, biography: 'Cháu đích tôn. Là người có học thức cao trong dòng họ.' },
            '5': { fullName: 'Đặng Thị Bình', birthDate: '1915-09-05', deathDate: '2000-11-10', generation: 3, biography: 'Người phụ nữ mẫu mực, chăm lo cho gia đình và dòng họ.' },
            '6': { fullName: 'Đặng Văn Cường', birthDate: '1920-06-12', deathDate: '1995-04-28', generation: 3, biography: 'Tham gia cách mạng, có công với đất nước.' }
        };

        const memberData = demoMemberData[memberId] || demoMemberData['1'];
        setMember({ _id: memberId, ...memberData });
        setMemorial({ incenseCount: 358 });
        setCondolences([
            { name: 'Đặng Văn Minh', message: 'Con cháu luôn tưởng nhớ công ơn của cụ.', createdAt: '2024-01-15' },
            { name: 'Đặng Thị Hương', message: 'Cầu mong cụ thanh thản nơi cõi vĩnh hằng.', createdAt: '2024-01-10' }
        ]);
        setLoading(false);
    };

    const loadAllMemorials = async () => {
        setLoading(true);
        try {
            // Use API service
            const response = await membersAPI.getAll({ limit: 100 });

            if (response?.data?.data) {
                const deceased = response.data.data.filter(m => m.isDeceased);
                setCondolences(deceased); // Reuse condolences state for deceased members
                setLoading(false);
                return;
            }
        } catch (error) {
            console.log('API not available, using demo data');
        }

        // Demo deceased members
        setCondolences([
            { _id: '1', fullName: 'Đặng Văn Tổ', generation: 1, birthDate: '1850-01-01', deathDate: '1920-03-15', isDeceased: true },
            { _id: '2', fullName: 'Đặng Văn Nhất', generation: 2, birthDate: '1880-05-10', deathDate: '1950-08-20', isDeceased: true },
            { _id: '3', fullName: 'Đặng Văn Nhì', generation: 2, birthDate: '1885-07-15', deathDate: '1960-12-25', isDeceased: true },
            { _id: '4', fullName: 'Đặng Văn An', generation: 3, birthDate: '1910-03-20', deathDate: '1980-11-05', isDeceased: true },
            { _id: '5', fullName: 'Đặng Thị Bình', generation: 3, birthDate: '1915-09-05', deathDate: '2000-11-10', isDeceased: true },
            { _id: '6', fullName: 'Đặng Văn Cường', generation: 3, birthDate: '1920-06-12', deathDate: '1995-04-28', isDeceased: true }
        ]);
        setLoading(false);
    };

    const handleLightIncense = async () => {
        try {
            const response = await memorialsAPI.lightIncense(memberId, {
                visitorName: 'Khách'
            });
            setMemorial(prev => ({
                ...prev,
                incenseCount: response.data.data?.incenseCount || (prev.incenseCount + 1)
            }));
        } catch (error) {
            // Demo increment
            setMemorial(prev => ({
                ...prev,
                incenseCount: (prev?.incenseCount || 0) + 1
            }));
        }
    };

    const handleCondolence = async (values) => {
        setSubmitting(true);
        try {
            await memorialsAPI.addCondolence(memberId, values);
            message.success('Đã gửi lời tưởng nhớ');
            setCondolences(prev => [{
                ...values,
                createdAt: new Date().toISOString()
            }, ...prev]);
            form.resetFields();
        } catch (error) {
            // Demo add
            setCondolences(prev => [{
                ...values,
                createdAt: new Date().toISOString()
            }, ...prev]);
            message.success('Đã gửi lời tưởng nhớ');
            form.resetFields();
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex-center" style={{ minHeight: 400 }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!memberId) {
        const deceasedMembers = condolences.filter(m => m.isDeceased);
        return (
            <div className="memorial-page" style={{
                background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
                minHeight: '100vh',
                margin: -24,
                padding: 24
            }}>
                <h1 style={{ color: 'white', textAlign: 'center', marginBottom: 8 }}>
                    <HeartOutlined style={{ color: '#D4AF37' }} /> Nghĩa Trang Trực Tuyến
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginBottom: 32 }}>
                    Trang tưởng niệm dành cho những người đã khuất trong dòng họ
                </p>

                <Row gutter={[24, 24]}>
                    {deceasedMembers.map((m) => (
                        <Col xs={24} sm={12} md={8} lg={6} key={m._id}>
                            <Link to={`/memorial/${m._id}`}>
                                <Card
                                    hoverable
                                    style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(212,175,55,0.3)',
                                        textAlign: 'center'
                                    }}
                                    bodyStyle={{ padding: 20 }}
                                >
                                    <Avatar
                                        size={80}
                                        icon={<UserOutlined />}
                                        style={{
                                            backgroundColor: '#D4AF37',
                                            marginBottom: 16
                                        }}
                                    />
                                    <h3 style={{ color: 'white', marginBottom: 4 }}>{m.fullName}</h3>
                                    <div style={{ color: '#D4AF37', fontSize: 14, marginBottom: 4 }}>
                                        {m.birthDate && dayjs(m.birthDate).format('YYYY')} - {m.deathDate && dayjs(m.deathDate).format('YYYY')}
                                    </div>
                                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
                                        Đời thứ {m.generation}
                                    </div>
                                    <Button
                                        type="text"
                                        icon={<HeartOutlined />}
                                        style={{ color: '#D4AF37', marginTop: 12 }}
                                    >
                                        Thắp hương
                                    </Button>
                                </Card>
                            </Link>
                        </Col>
                    ))}
                </Row>
            </div>
        );
    }

    return (
        <div className="memorial-page" style={{
            background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
            minHeight: '100vh',
            margin: -24,
            padding: 24
        }}>
            <Link to="/tree" style={{
                color: 'rgba(255,255,255,0.7)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 24
            }}>
                <ArrowLeftOutlined /> Quay lại cây gia phả
            </Link>

            <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <Avatar
                    size={140}
                    src={member?.avatar}
                    icon={<UserOutlined />}
                    style={{
                        backgroundColor: '#D4AF37',
                        border: '4px solid #D4AF37',
                        boxShadow: '0 0 40px rgba(212, 175, 55, 0.4)'
                    }}
                />

                <h1 style={{
                    color: 'white',
                    fontSize: 32,
                    fontWeight: 700,
                    marginTop: 24,
                    marginBottom: 8
                }}>
                    {member?.fullName}
                </h1>

                <div style={{ color: '#D4AF37', fontSize: 20, marginBottom: 8 }}>
                    {member?.birthDate && dayjs(member.birthDate).format('YYYY')} - {member?.deathDate && dayjs(member.deathDate).format('YYYY')}
                </div>

                <div style={{ color: 'rgba(255,255,255,0.6)' }}>
                    Đời thứ {member?.generation || 1}
                </div>
            </div>

            {/* Biography */}
            {member?.biography && (
                <Card
                    style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: 'none',
                        marginBottom: 32
                    }}
                    bodyStyle={{ color: 'rgba(255,255,255,0.8)' }}
                >
                    <h3 style={{ color: '#D4AF37', marginBottom: 16 }}>Tiểu sử</h3>
                    <p style={{ lineHeight: 1.8 }}>{member.biography}</p>
                </Card>
            )}

            {/* Incense Section */}
            <Card
                style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: 'none',
                    marginBottom: 32
                }}
            >
                <MemorialCandle
                    count={memorial?.incenseCount || 0}
                    onLightIncense={handleLightIncense}
                    memberName={member?.fullName}
                />
            </Card>

            {/* Condolence Form */}
            <Card
                style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: 'none',
                    marginBottom: 32
                }}
            >
                <h3 style={{ color: '#D4AF37', marginBottom: 16 }}>
                    <HeartOutlined /> Gửi Lời Tưởng Nhớ
                </h3>

                <Form
                    form={form}
                    onFinish={handleCondolence}
                    layout="vertical"
                >
                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="name"
                                rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
                            >
                                <Input
                                    placeholder="Họ tên của bạn"
                                    style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white' }}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item name="relationship">
                                <Input
                                    placeholder="Quan hệ với người đã khuất"
                                    style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white' }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="message"
                        rules={[{ required: true, message: 'Vui lòng nhập lời tưởng nhớ' }]}
                    >
                        <TextArea
                            rows={4}
                            placeholder="Lời tưởng nhớ..."
                            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white' }}
                        />
                    </Form.Item>

                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={submitting}
                        style={{ background: '#D4AF37', borderColor: '#D4AF37' }}
                    >
                        Gửi Lời Tưởng Nhớ
                    </Button>
                </Form>
            </Card>

            {/* Condolences List */}
            {condolences.length > 0 && (
                <Card
                    style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: 'none'
                    }}
                >
                    <h3 style={{ color: '#D4AF37', marginBottom: 16 }}>
                        Lời Tưởng Nhớ ({condolences.length})
                    </h3>

                    <List
                        dataSource={condolences}
                        renderItem={(item) => (
                            <List.Item style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '16px 0' }}>
                                <List.Item.Meta
                                    avatar={
                                        <Avatar style={{ backgroundColor: '#228B22' }}>
                                            {item.name?.charAt(0)}
                                        </Avatar>
                                    }
                                    title={
                                        <span style={{ color: 'white' }}>
                                            {item.name}
                                            {item.relationship && (
                                                <span style={{ color: 'rgba(255,255,255,0.5)', marginLeft: 8, fontSize: 13 }}>
                                                    ({item.relationship})
                                                </span>
                                            )}
                                        </span>
                                    }
                                    description={
                                        <div>
                                            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>
                                                {item.message}
                                            </p>
                                            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
                                                {item.createdAt && dayjs(item.createdAt).format('DD/MM/YYYY HH:mm')}
                                            </span>
                                        </div>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                </Card>
            )}
        </div>
    );
};

export default MemorialPage;
