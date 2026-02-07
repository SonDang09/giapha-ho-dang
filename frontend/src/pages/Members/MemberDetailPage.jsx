import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Avatar, Spin, Tag, Button, Form, Input, List, Divider, message, Empty, Image } from 'antd';
import {
    UserOutlined, ArrowLeftOutlined, HeartOutlined, CalendarOutlined,
    ManOutlined, WomanOutlined, HomeOutlined, PhoneOutlined,
    MailOutlined, EditOutlined, TeamOutlined, ApartmentOutlined,
    EnvironmentOutlined, IdcardOutlined
} from '@ant-design/icons';
import MemorialCandle from '../../components/Memorial/MemorialCandle';
import { membersAPI, memorialsAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import dayjs from 'dayjs';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const { TextArea } = Input;

const MemberDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, canEdit } = useAuth();
    const [loading, setLoading] = useState(true);
    const [member, setMember] = useState(null);
    const [parent, setParent] = useState(null);
    const [spouses, setSpouses] = useState([]);
    const [children, setChildren] = useState([]);
    const [memorial, setMemorial] = useState(null);
    const [condolences, setCondolences] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [form] = Form.useForm();

    useDocumentTitle(
        member ? `${member.fullName} | Chi Tiết Thành Viên` : 'Chi Tiết Thành Viên',
        member ? `Thông tin chi tiết về ${member.fullName} - Đời thứ ${member.generation} trong dòng họ Đặng.` : ''
    );

    useEffect(() => {
        if (id) loadMemberDetail();
    }, [id]);

    const loadMemberDetail = async () => {
        setLoading(true);
        try {
            // Load member info (backend now populates parentId, spouseId, spouseIds, children)
            const memberRes = await membersAPI.getById(id);
            const memberData = memberRes.data?.data || memberRes.data;
            setMember(memberData);

            // Use populated parent data directly
            if (memberData.parentId && typeof memberData.parentId === 'object') {
                setParent(memberData.parentId);
            }

            // Use populated spouse data directly
            const populatedSpouses = [];
            // Check spouseIds array first (new multi-spouse support)
            if (memberData.spouseIds?.length > 0) {
                memberData.spouseIds.forEach(s => {
                    if (typeof s === 'object' && s._id) populatedSpouses.push(s);
                });
            }
            // Also include legacy spouseId if not already in list
            if (memberData.spouseId && typeof memberData.spouseId === 'object') {
                const legacyId = memberData.spouseId._id;
                if (!populatedSpouses.some(s => s._id === legacyId)) {
                    populatedSpouses.unshift(memberData.spouseId);
                }
            }
            setSpouses(populatedSpouses);

            // Use populated children virtual
            if (memberData.children?.length > 0) {
                setChildren(memberData.children);
            }

            // Load memorial data if deceased
            if (memberData.isDeceased) {
                try {
                    const memRes = await memorialsAPI.getByMemberId(id);
                    if (memRes.data?.data) {
                        setMemorial(memRes.data.data);
                        setCondolences(memRes.data.data.condolences || []);
                    }
                } catch (e) {
                    setMemorial({ incenseCount: memberData.incenseCount || 0 });
                }
            }
        } catch (error) {
            console.error('Error loading member:', error);
            message.error('Không tìm thấy thành viên');
        } finally {
            setLoading(false);
        }
    };

    const handleLightIncense = async () => {
        try {
            const response = await memorialsAPI.lightIncense(id, { visitorName: 'Khách' });
            setMemorial(prev => ({
                ...prev,
                incenseCount: response.data?.data?.incenseCount || (prev?.incenseCount || 0) + 1
            }));
        } catch (error) {
            setMemorial(prev => ({
                ...prev,
                incenseCount: (prev?.incenseCount || 0) + 1
            }));
        }
    };

    const handleCondolence = async (values) => {
        setSubmitting(true);
        try {
            await memorialsAPI.addCondolence(id, values);
            message.success('Đã gửi lời tưởng nhớ');
            setCondolences(prev => [{ ...values, createdAt: new Date().toISOString() }, ...prev]);
            form.resetFields();
        } catch (error) {
            setCondolences(prev => [{ ...values, createdAt: new Date().toISOString() }, ...prev]);
            message.success('Đã gửi lời tưởng nhớ');
            form.resetFields();
        } finally {
            setSubmitting(false);
        }
    };

    const getTitle = (member) => {
        if (!member) return '';
        const gen = member.generation;
        if (gen <= 2) return 'CỤ';
        if (gen === 3) return member.gender === 'male' ? 'ÔNG' : 'BÀ';
        if (gen === 4) return member.gender === 'male' ? 'ÔNG' : 'BÀ';
        return member.gender === 'male' ? 'Ông' : 'Bà';
    };

    const getAvatarSrc = (m) => {
        if (m?.avatar) return m.avatar;
        return m?.gender === 'female' ? '/avatar-female.png' : '/avatar-male.png';
    };

    const getYearDisplay = (m) => {
        if (!m) return '';
        const birth = m.birthDate ? dayjs(m.birthDate).format('YYYY') : '?';
        if (m.isDeceased) {
            const death = m.deathDate ? dayjs(m.deathDate).format('YYYY') : '?';
            return `${birth} - ${death}`;
        }
        return `${birth} - nay`;
    };

    if (loading) {
        return (
            <div className="flex-center" style={{ minHeight: 400 }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!member) {
        return (
            <div className="page-container">
                <Empty description="Không tìm thấy thành viên" />
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <Button onClick={() => navigate('/members')}>Về danh sách</Button>
                </div>
            </div>
        );
    }

    const isDeceased = member.isDeceased;
    const genderColor = member.gender === 'male' ? '#8B0000' : '#1B5E20';

    return (
        <div className="page-container" style={{ maxWidth: 1000, margin: '0 auto' }}>
            {/* Back Button */}
            <Button
                icon={<ArrowLeftOutlined />}
                type="text"
                onClick={() => navigate(-1)}
                style={{ marginBottom: 16, color: '#666' }}
            >
                Quay lại
            </Button>

            {/* Hero Section */}
            <Card
                bordered={false}
                style={{
                    marginBottom: 24,
                    borderRadius: 16,
                    overflow: 'hidden',
                    background: isDeceased
                        ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
                        : `linear-gradient(135deg, ${genderColor}15 0%, ${genderColor}08 100%)`,
                    border: `2px solid ${isDeceased ? '#D4AF37' : genderColor}30`
                }}
            >
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <Avatar
                        size={140}
                        src={getAvatarSrc(member)}
                        icon={<UserOutlined />}
                        style={{
                            backgroundColor: isDeceased ? '#D4AF37' : genderColor,
                            border: `4px solid ${isDeceased ? '#D4AF37' : genderColor}`,
                            boxShadow: `0 4px 24px ${isDeceased ? 'rgba(212,175,55,0.3)' : `${genderColor}40`}`
                        }}
                    />

                    <div style={{ marginTop: 16 }}>
                        <Tag color={isDeceased ? 'default' : genderColor} style={{ fontSize: 12, marginBottom: 8 }}>
                            {getTitle(member)} • Đời {member.generation}
                        </Tag>
                    </div>

                    <h1 style={{
                        fontSize: 28,
                        fontWeight: 700,
                        margin: '8px 0 4px',
                        color: isDeceased ? 'white' : '#333'
                    }}>
                        {member.fullName}
                    </h1>

                    <div style={{
                        fontSize: 18,
                        color: isDeceased ? '#D4AF37' : genderColor,
                        fontWeight: 500
                    }}>
                        ({getYearDisplay(member)})
                    </div>

                    {isDeceased && (
                        <Tag color="default" style={{ marginTop: 8, background: 'rgba(255,255,255,0.1)', border: 'none', color: 'rgba(255,255,255,0.7)' }}>
                            Đã mất {member.deathDate ? `• Hưởng thọ ${member.age || '?'} tuổi` : ''}
                        </Tag>
                    )}

                    {/* Admin Edit Button */}
                    {canEdit && canEdit() && (
                        <div style={{ marginTop: 16 }}>
                            <Button
                                icon={<EditOutlined />}
                                onClick={() => navigate(`/members?edit=${id}`)}
                                style={{
                                    borderColor: isDeceased ? '#D4AF37' : genderColor,
                                    color: isDeceased ? '#D4AF37' : genderColor
                                }}
                            >
                                Chỉnh sửa
                            </Button>
                        </div>
                    )}
                </div>
            </Card>

            <Row gutter={[24, 24]}>
                {/* Left Column: Personal Info */}
                <Col xs={24} lg={14}>
                    {/* Personal Details */}
                    <Card bordered={false} style={{ marginBottom: 24, borderRadius: 12 }}>
                        <h3 style={{ color: '#D4AF37', marginBottom: 16 }}>
                            <IdcardOutlined /> Thông tin cá nhân
                        </h3>
                        <div style={{ display: 'grid', gap: 12 }}>
                            <InfoRow icon={<CalendarOutlined />} label="Năm sinh" value={member.birthDate ? dayjs(member.birthDate).format('DD/MM/YYYY') : 'Không rõ'} />
                            {isDeceased && <InfoRow icon={<CalendarOutlined />} label="Năm mất" value={member.deathDate ? dayjs(member.deathDate).format('DD/MM/YYYY') : 'Không rõ'} />}
                            <InfoRow icon={member.gender === 'male' ? <ManOutlined /> : <WomanOutlined />} label="Giới tính" value={member.gender === 'male' ? 'Nam' : 'Nữ'} />
                            <InfoRow icon={<ApartmentOutlined />} label="Đời thứ" value={member.generation} />
                            {member.occupation && <InfoRow icon={<IdcardOutlined />} label="Nghề nghiệp" value={member.occupation} />}
                            {member.currentResidence && <InfoRow icon={<EnvironmentOutlined />} label="Nơi sống" value={member.currentResidence} />}
                            {member.address && <InfoRow icon={<HomeOutlined />} label="Địa chỉ" value={member.address} />}
                            {member.phone && <InfoRow icon={<PhoneOutlined />} label="Điện thoại" value={member.phone} />}
                            {member.email && <InfoRow icon={<MailOutlined />} label="Email" value={member.email} />}
                            {member.anniversaryDate?.lunarDay && (
                                <InfoRow icon={<CalendarOutlined />} label="Ngày giỗ (Âm lịch)" value={`${member.anniversaryDate.lunarDay}/${member.anniversaryDate.lunarMonth}`} />
                            )}
                        </div>
                    </Card>

                    {/* Biography */}
                    {member.biography && (
                        <Card bordered={false} style={{ marginBottom: 24, borderRadius: 12 }}>
                            <h3 style={{ color: '#D4AF37', marginBottom: 16 }}>📜 Tiểu sử</h3>
                            <p style={{ lineHeight: 1.8, color: '#555', whiteSpace: 'pre-wrap' }}>
                                {member.biography}
                            </p>
                        </Card>
                    )}

                    {/* Photos */}
                    {member.photos?.length > 0 && (
                        <Card bordered={false} style={{ marginBottom: 24, borderRadius: 12 }}>
                            <h3 style={{ color: '#D4AF37', marginBottom: 16 }}>📷 Hình ảnh</h3>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                <Image.PreviewGroup>
                                    {member.photos.map((photo, i) => (
                                        <Image
                                            key={i}
                                            width={100}
                                            height={100}
                                            src={photo.url || photo}
                                            style={{ objectFit: 'cover', borderRadius: 8 }}
                                        />
                                    ))}
                                </Image.PreviewGroup>
                            </div>
                        </Card>
                    )}
                </Col>

                {/* Right Column: Family + Memorial */}
                <Col xs={24} lg={10}>
                    {/* Family Relationships */}
                    <Card bordered={false} style={{ marginBottom: 24, borderRadius: 12 }}>
                        <h3 style={{ color: '#D4AF37', marginBottom: 16 }}>
                            <TeamOutlined /> Quan hệ gia đình
                        </h3>

                        {/* Parent */}
                        {parent && (
                            <div style={{ marginBottom: 16 }}>
                                <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Cha/Mẹ</div>
                                <MemberLink member={parent} getAvatarSrc={getAvatarSrc} />
                            </div>
                        )}

                        {/* Spouses */}
                        {spouses.length > 0 && (
                            <div style={{ marginBottom: 16 }}>
                                <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>
                                    {member.gender === 'male' ? 'Vợ' : 'Chồng'}
                                </div>
                                {spouses.map(s => (
                                    <MemberLink key={s._id} member={s} getAvatarSrc={getAvatarSrc} />
                                ))}
                            </div>
                        )}

                        {/* Children */}
                        {children.length > 0 && (
                            <div>
                                <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>
                                    Con ({children.length})
                                </div>
                                {children.map(c => (
                                    <MemberLink key={c._id} member={c} getAvatarSrc={getAvatarSrc} />
                                ))}
                            </div>
                        )}

                        {!parent && spouses.length === 0 && children.length === 0 && (
                            <div style={{ color: '#999', textAlign: 'center', padding: 16 }}>
                                Chưa có thông tin quan hệ gia đình
                            </div>
                        )}
                    </Card>

                    {/* MEMORIAL SECTION - Only for deceased */}
                    {isDeceased && (
                        <>
                            {/* Incense */}
                            <Card
                                bordered={false}
                                style={{
                                    marginBottom: 24,
                                    borderRadius: 12,
                                    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                                    border: '1px solid rgba(212,175,55,0.3)'
                                }}
                            >
                                <MemorialCandle
                                    count={memorial?.incenseCount || member.incenseCount || 0}
                                    onLightIncense={handleLightIncense}
                                    memberName={member.fullName}
                                />
                            </Card>

                            {/* Condolence Form */}
                            <Card
                                bordered={false}
                                style={{
                                    marginBottom: 24,
                                    borderRadius: 12,
                                    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                                    border: '1px solid rgba(212,175,55,0.3)'
                                }}
                            >
                                <h3 style={{ color: '#D4AF37', marginBottom: 16 }}>
                                    <HeartOutlined /> Gửi Lời Tưởng Nhớ
                                </h3>

                                {isAuthenticated ? (
                                    <Form form={form} onFinish={handleCondolence} layout="vertical">
                                        <Form.Item
                                            name="name"
                                            rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
                                        >
                                            <Input
                                                placeholder="Họ tên của bạn"
                                                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white' }}
                                            />
                                        </Form.Item>
                                        <Form.Item name="relationship">
                                            <Input
                                                placeholder="Quan hệ với người đã khuất"
                                                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white' }}
                                            />
                                        </Form.Item>
                                        <Form.Item
                                            name="message"
                                            rules={[{ required: true, message: 'Vui lòng nhập lời tưởng nhớ' }]}
                                        >
                                            <TextArea
                                                rows={3}
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
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '12px 0' }}>
                                        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 12 }}>
                                            Vui lòng đăng nhập để gửi lời tưởng nhớ
                                        </p>
                                        <Link to="/login">
                                            <Button type="primary" style={{ background: '#D4AF37', borderColor: '#D4AF37' }}>
                                                Đăng nhập
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </Card>

                            {/* Condolences List */}
                            {condolences.length > 0 && (
                                <Card
                                    bordered={false}
                                    style={{
                                        borderRadius: 12,
                                        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                                        border: '1px solid rgba(212,175,55,0.3)'
                                    }}
                                >
                                    <h3 style={{ color: '#D4AF37', marginBottom: 16 }}>
                                        Lời Tưởng Nhớ ({condolences.length})
                                    </h3>
                                    <List
                                        dataSource={condolences}
                                        renderItem={(item) => (
                                            <List.Item style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '12px 0' }}>
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
                        </>
                    )}
                </Col>
            </Row>
        </div>
    );
};

// Sub-component: Info Row
const InfoRow = ({ icon, label, value }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid #f0f0f0' }}>
        <span style={{ color: '#D4AF37', width: 20, textAlign: 'center' }}>{icon}</span>
        <span style={{ color: '#888', minWidth: 120 }}>{label}:</span>
        <span style={{ color: '#333', fontWeight: 500 }}>{value}</span>
    </div>
);

// Sub-component: Clickable member link
const MemberLink = ({ member, getAvatarSrc }) => (
    <Link
        to={`/members/${member._id}`}
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 12px',
            borderRadius: 8,
            background: '#f9f9f9',
            marginBottom: 6,
            textDecoration: 'none',
            transition: 'all 0.2s',
            border: '1px solid transparent'
        }}
        onMouseEnter={e => {
            e.currentTarget.style.background = '#f0f0f0';
            e.currentTarget.style.borderColor = '#D4AF37';
        }}
        onMouseLeave={e => {
            e.currentTarget.style.background = '#f9f9f9';
            e.currentTarget.style.borderColor = 'transparent';
        }}
    >
        <Avatar
            size={36}
            src={getAvatarSrc(member)}
            style={{ backgroundColor: member.gender === 'male' ? '#8B0000' : '#1B5E20' }}
        />
        <div>
            <div style={{ color: '#333', fontWeight: 500, fontSize: 14 }}>{member.fullName}</div>
            <div style={{ color: '#888', fontSize: 12 }}>
                Đời {member.generation}
                {member.birthDate && ` • ${dayjs(member.birthDate).format('YYYY')}`}
                {member.isDeceased && member.deathDate && ` - ${dayjs(member.deathDate).format('YYYY')}`}
            </div>
        </div>
    </Link>
);

export default MemberDetailPage;
