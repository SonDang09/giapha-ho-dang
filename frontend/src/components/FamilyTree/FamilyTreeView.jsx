import { useState, useCallback, useMemo } from 'react';
import Tree from 'react-d3-tree';
import { Modal, Descriptions, Avatar, Tag, Button, Spin } from 'antd';
import { UserOutlined, ManOutlined, WomanOutlined, HeartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const FamilyTreeView = ({ data, loading }) => {
    const navigate = useNavigate();
    const [selectedMember, setSelectedMember] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [translate, setTranslate] = useState({ x: 0, y: 0 });

    // Custom node rendering
    const renderCustomNode = ({ nodeDatum, toggleNode }) => {
        const attrs = nodeDatum.attributes || {};
        const isMale = attrs.gender === 'male';
        const isDeceased = attrs.isDeceased;

        return (
            <g>
                {/* Node background */}
                <rect
                    width={140}
                    height={100}
                    x={-70}
                    y={-20}
                    rx={10}
                    fill={isDeceased ? '#f5f5f5' : 'white'}
                    stroke={isMale ? '#3b82f6' : '#ec4899'}
                    strokeWidth={2}
                    style={{ cursor: 'pointer', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                    onClick={() => handleNodeClick(nodeDatum)}
                />

                {/* Gender indicator */}
                <rect
                    width={140}
                    height={4}
                    x={-70}
                    y={-20}
                    rx={2}
                    fill={isMale ? '#3b82f6' : '#ec4899'}
                />

                {/* Avatar circle */}
                <circle
                    cx={0}
                    cy={15}
                    r={22}
                    fill="#D4AF37"
                    onClick={() => handleNodeClick(nodeDatum)}
                    style={{ cursor: 'pointer' }}
                />

                {/* Avatar image or initial */}
                {attrs.avatar ? (
                    <image
                        href={attrs.avatar}
                        x={-22}
                        y={-7}
                        width={44}
                        height={44}
                        clipPath="circle(22px)"
                    />
                ) : (
                    <text
                        x={0}
                        y={20}
                        textAnchor="middle"
                        fill="white"
                        fontSize={16}
                        fontWeight="600"
                    >
                        {nodeDatum.name?.charAt(nodeDatum.name.lastIndexOf(' ') + 1) || 'Đ'}
                    </text>
                )}

                {/* Name */}
                <text
                    x={0}
                    y={52}
                    textAnchor="middle"
                    fill="#2c3e50"
                    fontSize={11}
                    fontWeight="600"
                >
                    {nodeDatum.name?.length > 16
                        ? nodeDatum.name.substring(0, 14) + '...'
                        : nodeDatum.name}
                </text>

                {/* Years */}
                <text
                    x={0}
                    y={66}
                    textAnchor="middle"
                    fill="#64748b"
                    fontSize={10}
                >
                    {attrs.birthYear || '?'} - {attrs.deathYear || (isDeceased ? '?' : 'nay')}
                </text>

                {/* Generation badge */}
                {attrs.generation && (
                    <g>
                        <rect
                            x={-22}
                            y={72}
                            width={44}
                            height={16}
                            rx={8}
                            fill="#D4AF37"
                        />
                        <text
                            x={0}
                            y={83}
                            textAnchor="middle"
                            fill="white"
                            fontSize={9}
                            fontWeight="500"
                        >
                            Đời {attrs.generation}
                        </text>
                    </g>
                )}

                {/* Deceased indicator */}
                {isDeceased && (
                    <text x={52} y={-8} fontSize={12}>🕯️</text>
                )}
            </g>
        );
    };

    const handleNodeClick = (nodeDatum) => {
        setSelectedMember(nodeDatum);
        setModalVisible(true);
    };

    const containerRef = useCallback((containerElem) => {
        if (containerElem !== null) {
            const { width, height } = containerElem.getBoundingClientRect();
            setTranslate({ x: width / 2, y: 80 });
        }
    }, []);

    const treeConfig = useMemo(() => ({
        orientation: 'vertical',
        pathFunc: 'step',
        separation: { siblings: 1.5, nonSiblings: 2 },
        nodeSize: { x: 160, y: 150 },
        translate,
        zoom: 0.8,
        scaleExtent: { min: 0.3, max: 2 },
        enableLegacyTransitions: true,
        transitionDuration: 500
    }), [translate]);

    if (loading) {
        return (
            <div className="tree-container flex-center">
                <Spin size="large" tip="Đang tải cây gia phả..." />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="tree-container flex-center">
                <div style={{ textAlign: 'center', color: '#64748b' }}>
                    <p>Chưa có dữ liệu cây gia phả</p>
                </div>
            </div>
        );
    }

    const attrs = selectedMember?.attributes || {};

    return (
        <>
            <div className="tree-container" ref={containerRef}>
                <Tree
                    data={data}
                    {...treeConfig}
                    renderCustomNodeElement={renderCustomNode}
                />

                {/* Legend */}
                <div style={{
                    position: 'absolute',
                    bottom: 16,
                    left: 16,
                    background: 'white',
                    padding: '12px 16px',
                    borderRadius: 8,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    fontSize: 12
                }}>
                    <div style={{ marginBottom: 8, fontWeight: 600 }}>Chú thích:</div>
                    <div style={{ display: 'flex', gap: 16 }}>
                        <span><span style={{ color: '#3b82f6' }}>━</span> Nam</span>
                        <span><span style={{ color: '#ec4899' }}>━</span> Nữ</span>
                        <span>🕯️ Đã mất</span>
                    </div>
                </div>

                {/* Controls hint */}
                <div style={{
                    position: 'absolute',
                    bottom: 16,
                    right: 16,
                    background: 'white',
                    padding: '8px 12px',
                    borderRadius: 8,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    fontSize: 11,
                    color: '#64748b'
                }}>
                    Cuộn để zoom • Kéo để di chuyển
                </div>
            </div>

            {/* Member Detail Modal */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {attrs.gender === 'male' ? (
                            <ManOutlined style={{ color: '#3b82f6' }} />
                        ) : (
                            <WomanOutlined style={{ color: '#ec4899' }} />
                        )}
                        <span>{selectedMember?.name}</span>
                        {attrs.isDeceased && <Tag color="default">Đã mất</Tag>}
                    </div>
                }
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={[
                    attrs.isDeceased && (
                        <Button
                            key="memorial"
                            icon={<HeartOutlined />}
                            onClick={() => {
                                setModalVisible(false);
                                navigate(`/memorial/${attrs.id}`);
                            }}
                        >
                            Trang tưởng niệm
                        </Button>
                    ),
                    <Button key="close" onClick={() => setModalVisible(false)}>
                        Đóng
                    </Button>
                ].filter(Boolean)}
                width={500}
            >
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <Avatar
                        size={100}
                        src={attrs.avatar}
                        icon={<UserOutlined />}
                        style={{
                            backgroundColor: '#D4AF37',
                            border: `3px solid ${attrs.gender === 'male' ? '#3b82f6' : '#ec4899'}`
                        }}
                    />
                </div>

                <Descriptions column={1} bordered size="small">
                    <Descriptions.Item label="Họ tên">
                        <strong>{selectedMember?.name}</strong>
                    </Descriptions.Item>
                    <Descriptions.Item label="Giới tính">
                        {attrs.gender === 'male' ? 'Nam' : attrs.gender === 'female' ? 'Nữ' : 'Khác'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Đời thứ">
                        <Tag color="gold">Đời {attrs.generation}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Năm sinh">
                        {attrs.birthYear || 'Không rõ'}
                    </Descriptions.Item>
                    {(attrs.isDeceased || attrs.deathYear) && (
                        <Descriptions.Item label="Năm mất">
                            {attrs.deathYear || 'Không rõ'}
                        </Descriptions.Item>
                    )}
                    {attrs.anniversaryDate && (
                        <Descriptions.Item label="Ngày giỗ (âm lịch)">
                            Ngày {attrs.anniversaryDate.lunarDay} tháng {attrs.anniversaryDate.lunarMonth}
                        </Descriptions.Item>
                    )}
                </Descriptions>
            </Modal>
        </>
    );
};

export default FamilyTreeView;
