import { useState, useEffect, useCallback, useMemo } from 'react';
import Tree from 'react-d3-tree';
import { Modal, Descriptions, Avatar, Tag, Button, Spin, Form, Input, Select, InputNumber, Space, message, Popconfirm } from 'antd';
import { UserOutlined, ManOutlined, WomanOutlined, HeartOutlined, UserAddOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { membersAPI } from '../../api';
import { useSiteSettings } from '../../context/SiteSettingsContext';

// Traditional Vietnamese Gia Phả Colors
const COLORS = {
    male: '#C41E3A',      // Đỏ đậm
    female: '#228B22',    // Xanh lá
    gold: '#D4AF37',      // Vàng gold
    brown: '#8B4513',     // Nâu đất
    cream: '#FDF8E8',     // Kem nền
    ivory: '#FFFEF5',     // Trắng ngà node
    darkRed: '#8B0000'    // Đỏ đậm cho header
};

const FamilyTreeView = ({ data, loading, onRefresh }) => {
    const navigate = useNavigate();
    const siteSettings = useSiteSettings();
    const [selectedMember, setSelectedMember] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [translate, setTranslate] = useState({ x: 0, y: 0 });
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Admin check
    const [isAdmin, setIsAdmin] = useState(false);
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        setIsAdmin(user?.role === 'admin_toc' || user?.role === 'admin');
    }, []);

    // Action modals
    const [addChildVisible, setAddChildVisible] = useState(false);
    const [editVisible, setEditVisible] = useState(false);
    const [addSpouseVisible, setAddSpouseVisible] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [addForm] = Form.useForm();
    const [editForm] = Form.useForm();
    const [spouseForm] = Form.useForm();
    const [allMembers, setAllMembers] = useState([]);
    const [currentMemberGender, setCurrentMemberGender] = useState(null);

    // Detect mobile on resize - MUST be useEffect not useState!
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Render a single member card (reusable for main member and spouse)
    const renderMemberCard = (name, attrs, onClick, isSpouse = false) => {
        const isMale = attrs.gender === 'male';
        const isDeceased = attrs.isDeceased;
        const borderColor = isMale ? COLORS.male : COLORS.female;
        const cardWidth = 165;
        const cardHeight = 95;

        // Format years display like "(1800-1890)" or "(1980-nay)"
        const getYearsDisplay = () => {
            if (attrs.birthYear) {
                return `(${attrs.birthYear}-${attrs.deathYear || 'nay'})`;
            } else if (attrs.deathYear) {
                return `(?-${attrs.deathYear})`;
            }
            return '';
        };

        return (
            <div
                onClick={onClick}
                style={{
                    width: `${cardWidth}px`,
                    height: `${cardHeight}px`,
                    background: '#FFFFF8',
                    border: `3px solid ${borderColor}`,
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8px 10px',
                    boxSizing: 'border-box',
                    position: 'relative',
                    fontFamily: '"Playfair Display", "Times New Roman", Georgia, serif',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2), 0 3px 6px rgba(0,0,0,0.12)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1)';
                }}
            >
                {/* Generation badge - diamond shape at top right */}
                <div style={{
                    position: 'absolute',
                    top: '-12px',
                    right: '-12px',
                    width: '26px',
                    height: '26px',
                    background: `linear-gradient(135deg, ${COLORS.gold} 0%, #D4A520 100%)`,
                    border: `2px solid ${COLORS.brown}`,
                    borderRadius: '3px',
                    transform: 'rotate(45deg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.25)'
                }}>
                    <span style={{
                        transform: 'rotate(-45deg)',
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: '800',
                        textShadow: '0 1px 2px rgba(0,0,0,0.4)'
                    }}>
                        {attrs.generation || '?'}
                    </span>
                </div>

                {/* Deceased icon - candle at left */}
                {isDeceased && (
                    <div style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        fontSize: '13px'
                    }}>🕯️</div>
                )}

                {/* Title - ÔNG/BÀ or VỢ/CHỒNG */}
                <div style={{
                    fontSize: isSpouse ? '10px' : '11px',
                    color: borderColor,
                    fontWeight: '700',
                    marginTop: '4px',
                    letterSpacing: '1px',
                    textTransform: 'uppercase'
                }}>
                    {isSpouse
                        ? (isMale ? 'CHỒNG' : 'VỢ')
                        : (attrs.generation <= 2 ? 'CỤ' : (isMale ? 'ÔNG' : 'BÀ'))}
                </div>

                {/* Name - bold black */}
                <div style={{
                    fontSize: isSpouse ? '14px' : '16px',
                    fontWeight: '700',
                    color: '#1a1a1a',
                    textAlign: 'center',
                    marginTop: '2px',
                    lineHeight: '1.2',
                    maxWidth: '95%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                }}>
                    {name?.length > (isSpouse ? 12 : 14)
                        ? name.substring(0, isSpouse ? 10 : 12) + '...'
                        : name}
                </div>

                {/* Years - gray italic */}
                <div style={{
                    fontSize: isSpouse ? '11px' : '12px',
                    color: '#666666',
                    marginTop: '3px',
                    fontStyle: 'italic'
                }}>
                    {getYearsDisplay()}
                </div>
            </div>
        );
    };

    // Custom node using foreignObject for crisp HTML rendering
    const renderCustomNode = ({ nodeDatum }) => {
        const attrs = nodeDatum.attributes || {};
        // Support both new spouses array and legacy spouse object
        const spouses = attrs.spouses || (attrs.spouse ? [attrs.spouse] : []);
        const hasSpouses = spouses.length > 0;

        // Calculate widths for spouse pair layout - dynamic based on number of spouses
        const cardWidth = 170;
        const gapWidth = 12; // Gap between cards
        const numCards = 1 + spouses.length;
        const totalWidth = (cardWidth * numCards) + (gapWidth * spouses.length);
        const offsetX = -totalWidth / 2;

        return (
            <g>
                <foreignObject
                    width={totalWidth + 20}
                    height={120}
                    x={offsetX - 10}
                    y={-55}
                    style={{ overflow: 'visible' }}
                >
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0px'
                    }}>
                        {/* Main member card */}
                        {renderMemberCard(
                            nodeDatum.name,
                            attrs,
                            () => handleNodeClick(nodeDatum),
                            false
                        )}

                        {/* Spouse cards with connector lines */}
                        {hasSpouses && spouses.map((spouse, index) => (
                            <div key={spouse._id || index} style={{ display: 'flex', alignItems: 'center' }}>
                                {/* Connector line between cards */}
                                <div style={{
                                    width: '20px',
                                    height: '3px',
                                    background: '#8B4513',
                                    marginLeft: '-1px',
                                    marginRight: '-1px'
                                }} />
                                {/* Spouse card */}
                                {renderMemberCard(
                                    spouse.fullName,
                                    {
                                        gender: spouse.gender,
                                        isDeceased: spouse.isDeceased,
                                        birthYear: spouse.birthYear,
                                        deathYear: spouse.deathYear,
                                        generation: attrs.generation
                                    },
                                    () => handleNodeClick({
                                        name: spouse.fullName,
                                        attributes: {
                                            id: spouse._id,
                                            ...spouse,
                                            generation: attrs.generation
                                        }
                                    }),
                                    true
                                )}
                            </div>
                        ))}
                    </div>
                </foreignObject>
            </g>
        );
    };

    const handleNodeClick = (nodeDatum) => {
        setSelectedMember(nodeDatum);
        setModalVisible(true);
    };

    // Add child handler
    const handleAddChild = async (values) => {
        const attrs = selectedMember?.attributes || {};
        setActionLoading(true);
        try {
            const childData = {
                fullName: values.fullName,
                gender: values.gender,
                birthYear: values.birthYear,
                father: attrs.gender === 'male' ? attrs.id : null,
                mother: attrs.gender === 'female' ? attrs.id : null,
                generation: (attrs.generation || 1) + 1,
                isDeceased: false
            };
            await membersAPI.create(childData);
            message.success(`Đã thêm con: ${values.fullName}`);
            setAddChildVisible(false);
            setModalVisible(false);
            addForm.resetFields();
            onRefresh?.();
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra!');
        } finally {
            setActionLoading(false);
        }
    };

    // Edit handler
    const handleEditMember = async (values) => {
        const attrs = selectedMember?.attributes || {};
        setActionLoading(true);
        try {
            await membersAPI.update(attrs.id, {
                fullName: values.fullName,
                gender: values.gender,
                birthYear: values.birthYear,
                deathYear: values.deathYear || null,
                isDeceased: !!values.deathYear,
                spouseId: values.spouseId || null
            });
            message.success('Đã cập nhật thông tin!');
            setEditVisible(false);
            setModalVisible(false);
            onRefresh?.();
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra!');
        } finally {
            setActionLoading(false);
        }
    };

    // Delete handler
    const handleDeleteMember = async () => {
        const attrs = selectedMember?.attributes || {};
        setActionLoading(true);
        try {
            await membersAPI.delete(attrs.id);
            message.success('Đã xóa thành viên!');
            setModalVisible(false);
            onRefresh?.();
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra!');
        } finally {
            setActionLoading(false);
        }
    };

    // Open edit modal with pre-filled data
    const openEditModal = async () => {
        const attrs = selectedMember?.attributes || {};
        setCurrentMemberGender(attrs.gender); // Track gender for spouse label
        // Fetch all members for spouse dropdown
        try {
            const res = await membersAPI.getAll({ limit: 500 });
            // Filter out current member and show only opposite gender for spouse
            const oppositeGender = attrs.gender === 'male' ? 'female' : 'male';
            const potentialSpouses = res.data.data.filter(m =>
                m._id !== attrs.id && m.gender === oppositeGender
            );
            setAllMembers(potentialSpouses);
        } catch (e) {
            console.error('Failed to load members:', e);
        }
        editForm.setFieldsValue({
            fullName: selectedMember?.name,
            gender: attrs.gender,
            birthYear: attrs.birthYear,
            deathYear: attrs.deathYear,
            spouseId: attrs.spouseId || undefined
        });
        setEditVisible(true);
    };

    // Handle creating a new spouse
    const handleAddSpouse = async (values) => {
        setActionLoading(true);
        try {
            const attrs = selectedMember?.attributes || {};
            // Create new spouse with opposite gender
            const spouseGender = attrs.gender === 'male' ? 'female' : 'male';
            const newSpouseData = {
                ...values,
                gender: spouseGender,
                generation: attrs.generation,
                // New spouse links back to current member
                spouseIds: [attrs.id]
            };
            const res = await membersAPI.create(newSpouseData);
            const newSpouseId = res.data.data._id;

            // Add new spouse to current member's spouseIds array
            // Get existing spouseIds and add new one
            const existingSpouseIds = attrs.spouseIds || [];
            const updatedSpouseIds = [...existingSpouseIds, newSpouseId];
            await membersAPI.update(attrs.id, { spouseIds: updatedSpouseIds });

            message.success(`Đã thêm ${spouseGender === 'female' ? 'vợ' : 'chồng'} thành công!`);
            setAddSpouseVisible(false);
            spouseForm.resetFields();
            if (onRefresh) onRefresh();
            setSelectedMember(null);
        } catch (error) {
            message.error('Lỗi: ' + (error.response?.data?.message || error.message));
        } finally {
            setActionLoading(false);
        }
    };

    const containerRef = useCallback((containerElem) => {
        if (containerElem !== null) {
            const { width } = containerElem.getBoundingClientRect();
            setTranslate({ x: width / 2, y: 80 });
        }
    }, []);

    const treeConfig = useMemo(() => ({
        orientation: 'vertical',
        pathFunc: 'step',
        separation: { siblings: isMobile ? 1.3 : 1.4, nonSiblings: isMobile ? 1.8 : 2.0 },
        nodeSize: { x: isMobile ? 200 : 220, y: isMobile ? 140 : 160 },
        translate,
        zoom: isMobile ? 0.45 : 0.85,
        scaleExtent: { min: 0.15, max: 2.5 },
        enableLegacyTransitions: true,
        transitionDuration: 400
    }), [translate, isMobile]);

    if (loading) {
        return (
            <div className="tree-loading">
                <Spin size="large" tip="Đang tải cây gia phả..." />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="tree-loading">
                <p style={{ fontSize: 18, color: COLORS.brown }}>Chưa có dữ liệu cây gia phả</p>
            </div>
        );
    }

    const attrs = selectedMember?.attributes || {};

    return (
        <div className="family-tree-container">
            {/* Traditional Header */}
            <div className="tree-header">
                <div className="header-decoration">🐉</div>
                <div className="header-content">
                    <h1>{siteSettings.treeHeader}</h1>
                    <p>{siteSettings.treeSubtitle}</p>
                </div>
                <div className="header-decoration flip">🐉</div>
            </div>

            {/* Instructions */}
            <div className="tree-instructions">
                Click vào thành viên để xem chi tiết • Cuộn chuột để zoom • Kéo để di chuyển
            </div>

            {/* Legend */}
            <div className="tree-legend">
                <div className="legend-item">
                    <span className="legend-box male"></span>
                    <span>Nam</span>
                </div>
                <div className="legend-item">
                    <span className="legend-box female"></span>
                    <span>Nữ</span>
                </div>
                <div className="legend-item">
                    <span className="legend-box gold"></span>
                    <span>Số đời</span>
                </div>
                <div className="legend-item">
                    <span>🕯️</span>
                    <span>Đã mất</span>
                </div>
            </div>

            {/* Tree */}
            <div className="tree-wrapper" ref={containerRef}>
                <Tree
                    data={data}
                    {...treeConfig}
                    renderCustomNodeElement={renderCustomNode}
                />
            </div>

            {/* Footer */}
            <div className="tree-footer">
                {siteSettings.treeFooter}
            </div>

            {/* Modal */}
            <Modal
                title={null}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '8px 0' }}>
                        {/* Admin actions - left side */}
                        {isAdmin && (
                            <Space>
                                <Button
                                    type="primary"
                                    icon={<UserAddOutlined />}
                                    onClick={() => setAddChildVisible(true)}
                                    style={{
                                        background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                                        borderColor: '#52c41a',
                                        borderRadius: '6px',
                                        fontWeight: '600'
                                    }}
                                >
                                    Thêm con
                                </Button>
                                <Button
                                    icon={<EditOutlined />}
                                    onClick={openEditModal}
                                    style={{ borderRadius: '6px' }}
                                >
                                    Sửa
                                </Button>
                                <Popconfirm
                                    title="Xóa thành viên?"
                                    description={`Bạn có chắc muốn xóa ${selectedMember?.name}?`}
                                    onConfirm={handleDeleteMember}
                                    okText="Xóa"
                                    cancelText="Hủy"
                                    okButtonProps={{ danger: true, loading: actionLoading }}
                                >
                                    <Button danger icon={<DeleteOutlined />} style={{ borderRadius: '6px' }}>Xóa</Button>
                                </Popconfirm>
                            </Space>
                        )}
                        {!isAdmin && <div />}
                        {/* Right side buttons */}
                        <Space>
                            {attrs.isDeceased && (
                                <Button
                                    type="primary"
                                    icon={<HeartOutlined />}
                                    style={{
                                        background: `linear-gradient(135deg, ${COLORS.male} 0%, #a01830 100%)`,
                                        borderRadius: '6px',
                                        fontWeight: '600'
                                    }}
                                    onClick={() => {
                                        setModalVisible(false);
                                        navigate(`/memorial/${attrs.id}`);
                                    }}
                                >
                                    Trang tưởng niệm
                                </Button>
                            )}
                            <Button onClick={() => setModalVisible(false)} style={{ borderRadius: '6px' }}>Đóng</Button>
                        </Space>
                    </div>
                }
                width={420}
                styles={{
                    header: { display: 'none' },
                    body: { padding: 0 },
                    content: { borderRadius: '16px', overflow: 'hidden' }
                }}
            >
                {/* Custom Header with Gradient */}
                <div style={{
                    background: attrs.gender === 'male'
                        ? 'linear-gradient(135deg, #8B0000 0%, #C41E3A 50%, #8B0000 100%)'
                        : 'linear-gradient(135deg, #1B5E20 0%, #228B22 50%, #1B5E20 100%)',
                    padding: '24px 20px 60px 20px',
                    textAlign: 'center',
                    position: 'relative'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                        <span style={{
                            fontSize: 20,
                            fontFamily: '"Playfair Display", Georgia, serif',
                            color: 'white',
                            fontWeight: '700',
                            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                        }}>
                            {selectedMember?.name}
                        </span>
                        {attrs.isDeceased && (
                            <Tag color="rgba(255,255,255,0.25)" style={{
                                border: '1px solid rgba(255,255,255,0.4)',
                                color: 'white',
                                fontWeight: '500'
                            }}>
                                Đã mất 🕯️
                            </Tag>
                        )}
                    </div>
                </div>

                {/* Avatar positioned over header/body boundary */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginTop: '-50px',
                    marginBottom: '16px',
                    position: 'relative',
                    zIndex: 1
                }}>
                    <div style={{
                        width: 100,
                        height: 100,
                        borderRadius: '50%',
                        border: `4px solid white`,
                        boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
                        overflow: 'hidden',
                        background: '#E8E8E8'
                    }}>
                        <img
                            src={attrs.avatar || (attrs.gender === 'male' ? '/avatar-male.png' : '/avatar-female.png')}
                            alt={selectedMember?.name}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                        />
                    </div>
                </div>

                {/* Info Section */}
                <div style={{ padding: '0 24px 20px 24px' }}>
                    <Descriptions
                        column={1}
                        size="middle"
                        labelStyle={{
                            color: '#666',
                            fontWeight: '500',
                            width: '100px'
                        }}
                        contentStyle={{
                            fontWeight: '600',
                            color: '#2C1810'
                        }}
                    >
                        <Descriptions.Item label="Họ tên">
                            <span style={{ fontSize: 16, fontFamily: '"Playfair Display", Georgia, serif' }}>
                                {selectedMember?.name}
                            </span>
                        </Descriptions.Item>
                        <Descriptions.Item label="Giới tính">
                            <Tag
                                color={attrs.gender === 'male' ? 'red' : 'green'}
                                style={{
                                    borderRadius: '12px',
                                    padding: '2px 12px',
                                    fontWeight: '600'
                                }}
                            >
                                {attrs.gender === 'male' ? 'Nam' : 'Nữ'}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Đời thứ">
                            <Tag
                                style={{
                                    background: `linear-gradient(135deg, ${COLORS.gold} 0%, #C9A227 100%)`,
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    padding: '2px 12px',
                                    fontWeight: '700',
                                    fontSize: 14
                                }}
                            >
                                Đời {attrs.generation}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Năm sinh">
                            {attrs.birthYear || <span style={{ color: '#999' }}>Không rõ</span>}
                        </Descriptions.Item>
                        {(attrs.isDeceased || attrs.deathYear) && (
                            <Descriptions.Item label="Năm mất">
                                {attrs.deathYear || <span style={{ color: '#999' }}>Không rõ</span>}
                            </Descriptions.Item>
                        )}
                    </Descriptions>
                </div>
            </Modal>

            {/* Add Child Modal */}
            <Modal
                title={`Thêm con của ${selectedMember?.name}`}
                open={addChildVisible}
                onCancel={() => setAddChildVisible(false)}
                footer={null}
                width={400}
            >
                <Form
                    form={addForm}
                    layout="vertical"
                    onFinish={handleAddChild}
                    initialValues={{ gender: 'male' }}
                >
                    <Form.Item
                        name="fullName"
                        label="Họ tên"
                        rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                    >
                        <Input placeholder="Nhập họ tên" autoFocus />
                    </Form.Item>

                    <Form.Item name="gender" label="Giới tính">
                        <Select>
                            <Select.Option value="male">Nam</Select.Option>
                            <Select.Option value="female">Nữ</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="birthYear" label="Năm sinh">
                        <InputNumber
                            placeholder="VD: 1990"
                            min={1800}
                            max={new Date().getFullYear()}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={() => setAddChildVisible(false)}>Hủy</Button>
                            <Button type="primary" htmlType="submit" loading={actionLoading}>
                                Thêm
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Edit Member Modal */}
            <Modal
                title={`Sửa thông tin: ${selectedMember?.name}`}
                open={editVisible}
                onCancel={() => setEditVisible(false)}
                footer={null}
                width={400}
            >
                <Form
                    form={editForm}
                    layout="vertical"
                    onFinish={handleEditMember}
                >
                    <Form.Item
                        name="fullName"
                        label="Họ tên"
                        rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                    >
                        <Input placeholder="Nhập họ tên" />
                    </Form.Item>

                    <Form.Item name="gender" label="Giới tính">
                        <Select>
                            <Select.Option value="male">Nam</Select.Option>
                            <Select.Option value="female">Nữ</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="birthYear" label="Năm sinh">
                        <InputNumber
                            placeholder="VD: 1990"
                            min={1800}
                            max={new Date().getFullYear()}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>

                    <Form.Item name="deathYear" label="Năm mất (nếu có)">
                        <InputNumber
                            placeholder="Để trống nếu còn sống"
                            min={1800}
                            max={new Date().getFullYear()}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="spouseId"
                        label={currentMemberGender === 'male' ? 'Vợ' : currentMemberGender === 'female' ? 'Chồng' : 'Vợ/Chồng'}
                    >
                        <Space.Compact style={{ width: '100%' }}>
                            <Select
                                allowClear
                                showSearch
                                placeholder={`Chọn ${currentMemberGender === 'male' ? 'vợ' : 'chồng'} từ danh sách`}
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    option.children.toLowerCase().includes(input.toLowerCase())
                                }
                                style={{ width: 'calc(100% - 100px)' }}
                                onChange={(value) => editForm.setFieldValue('spouseId', value)}
                                value={editForm.getFieldValue('spouseId')}
                            >
                                {allMembers.map(m => (
                                    <Select.Option key={m._id} value={m._id}>
                                        {m.fullName} {m.birthYear ? `(${m.birthYear})` : ''}
                                    </Select.Option>
                                ))}
                            </Select>
                            <Button
                                type="primary"
                                style={{
                                    background: '#52c41a',
                                    borderColor: '#52c41a',
                                    fontWeight: 600
                                }}
                                onClick={() => {
                                    setEditVisible(false);
                                    setAddSpouseVisible(true);
                                    spouseForm.resetFields();
                                }}
                            >
                                + Thêm mới
                            </Button>
                        </Space.Compact>
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={() => setEditVisible(false)}>Hủy</Button>
                            <Button type="primary" htmlType="submit" loading={actionLoading}>
                                Lưu
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Add Spouse Modal */}
            <Modal
                title={`Thêm ${currentMemberGender === 'male' ? 'Vợ' : 'Chồng'} cho ${selectedMember?.name || ''}`}
                open={addSpouseVisible}
                onCancel={() => setAddSpouseVisible(false)}
                footer={null}
                destroyOnHidden
            >
                <Form form={spouseForm} layout="vertical" onFinish={handleAddSpouse}>
                    <Form.Item
                        name="fullName"
                        label="Họ và tên"
                        rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                    >
                        <Input placeholder={`Nhập họ tên ${currentMemberGender === 'male' ? 'vợ' : 'chồng'}`} />
                    </Form.Item>

                    <Form.Item name="birthYear" label="Năm sinh">
                        <InputNumber
                            placeholder="Nhập năm sinh"
                            min={1800}
                            max={new Date().getFullYear()}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>

                    <Form.Item name="deathYear" label="Năm mất (nếu có)">
                        <InputNumber
                            placeholder="Để trống nếu còn sống"
                            min={1800}
                            max={new Date().getFullYear()}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>

                    <div style={{
                        padding: '12px',
                        background: '#f6ffed',
                        borderRadius: 8,
                        marginBottom: 16,
                        border: '1px solid #b7eb8f'
                    }}>
                        <strong>Thông tin tự động:</strong>
                        <ul style={{ margin: '8px 0 0', paddingLeft: 20 }}>
                            <li>Giới tính: <Tag color={currentMemberGender === 'male' ? 'magenta' : 'blue'}>
                                {currentMemberGender === 'male' ? 'Nữ' : 'Nam'}
                            </Tag></li>
                            <li>Đời thứ: {selectedMember?.attributes?.generation || '?'}</li>
                            <li>Liên kết với: {selectedMember?.name}</li>
                        </ul>
                    </div>

                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={() => setAddSpouseVisible(false)}>Hủy</Button>
                            <Button type="primary" htmlType="submit" loading={actionLoading}>
                                Thêm {currentMemberGender === 'male' ? 'Vợ' : 'Chồng'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            <style>{`
                .family-tree-container {
                    display: flex;
                    flex-direction: column;
                    height: calc(100vh - 180px);
                    min-height: 600px;
                    background: ${COLORS.cream};
                    background-image: 
                        radial-gradient(circle at 10% 20%, rgba(212, 175, 55, 0.08) 0%, transparent 40%),
                        radial-gradient(circle at 90% 80%, rgba(212, 175, 55, 0.08) 0%, transparent 40%);
                    border: 3px solid ${COLORS.male};
                    border-radius: 8px;
                    overflow: hidden;
                }

                .tree-header {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 16px 24px;
                    background: linear-gradient(180deg, ${COLORS.cream} 0%, #f5edd6 100%);
                    border-bottom: 3px solid ${COLORS.gold};
                }

                .header-decoration {
                    font-size: 36px;
                    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
                }

                .header-decoration.flip {
                    transform: scaleX(-1);
                }

                .header-content {
                    text-align: center;
                    padding: 0 24px;
                }

                .header-content h1 {
                    margin: 0;
                    color: ${COLORS.male};
                    font-size: 28px;
                    font-weight: 700;
                    font-family: "Times New Roman", Georgia, serif;
                    letter-spacing: 4px;
                    text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
                }

                .header-content p {
                    margin: 4px 0 0;
                    color: ${COLORS.brown};
                    font-size: 13px;
                    letter-spacing: 2px;
                }

                .tree-instructions {
                    text-align: center;
                    padding: 8px;
                    background: rgba(255,255,255,0.8);
                    color: ${COLORS.brown};
                    font-size: 12px;
                    border-bottom: 1px solid ${COLORS.gold};
                }

                .tree-legend {
                    display: flex;
                    justify-content: center;
                    gap: 20px;
                    padding: 10px;
                    background: rgba(255,255,255,0.9);
                    border-bottom: 1px solid ${COLORS.gold};
                }

                .legend-item {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 13px;
                    color: ${COLORS.brown};
                }

                .legend-box {
                    width: 18px;
                    height: 18px;
                    border-radius: 4px;
                    border: 2px solid;
                }

                .legend-box.male {
                    background: ${COLORS.ivory};
                    border-color: ${COLORS.male};
                }

                .legend-box.female {
                    background: ${COLORS.ivory};
                    border-color: ${COLORS.female};
                }

                .legend-box.gold {
                    background: ${COLORS.gold};
                    border-color: ${COLORS.brown};
                    transform: rotate(45deg);
                    width: 14px;
                    height: 14px;
                }

                .tree-wrapper {
                    flex: 1;
                    width: 100%;
                }

                .tree-footer {
                    text-align: center;
                    padding: 12px;
                    background: linear-gradient(180deg, #f5edd6 0%, ${COLORS.cream} 100%);
                    border-top: 2px solid ${COLORS.gold};
                    color: ${COLORS.brown};
                    font-size: 12px;
                    font-family: Georgia, serif;
                }

                .tree-loading {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: calc(100vh - 180px);
                    min-height: 600px;
                    background: ${COLORS.cream};
                }

                .rd3t-link {
                    stroke: ${COLORS.brown} !important;
                    stroke-width: 2px !important;
                }

                @media (max-width: 768px) {
                    .family-tree-container {
                        min-height: 500px;
                    }
                    .tree-header {
                        padding: 12px 8px;
                    }
                    .header-content {
                        padding: 0 8px;
                    }
                    .header-content h1 {
                        font-size: 16px;
                        letter-spacing: 1px;
                    }
                    .header-content p {
                        font-size: 11px;
                        letter-spacing: 1px;
                    }
                    .header-decoration {
                        font-size: 20px;
                    }
                    .tree-instructions {
                        font-size: 10px;
                        padding: 6px;
                    }
                    .tree-legend {
                        gap: 8px;
                        flex-wrap: wrap;
                        justify-content: center;
                        padding: 8px;
                    }
                    .legend-item {
                        font-size: 11px;
                    }
                    .legend-box {
                        width: 14px;
                        height: 14px;
                    }
                    .tree-wrapper {
                        overflow: auto;
                        -webkit-overflow-scrolling: touch;
                    }
                    .tree-footer {
                        font-size: 10px;
                        padding: 8px;
                    }
                }
            `}</style>
        </div>
    );
};

export default FamilyTreeView;
