import { useState, useCallback, useMemo } from 'react';
import Tree from 'react-d3-tree';
import { Modal, Descriptions, Avatar, Tag, Button, Spin } from 'antd';
import { UserOutlined, ManOutlined, WomanOutlined, HeartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

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

const FamilyTreeView = ({ data, loading }) => {
    const navigate = useNavigate();
    const [selectedMember, setSelectedMember] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [translate, setTranslate] = useState({ x: 0, y: 0 });

    // Custom node using foreignObject for crisp HTML rendering
    const renderCustomNode = ({ nodeDatum }) => {
        const attrs = nodeDatum.attributes || {};
        const isMale = attrs.gender === 'male';
        const isDeceased = attrs.isDeceased;
        const borderColor = isMale ? COLORS.male : COLORS.female;

        return (
            <g>
                <foreignObject
                    width={180}
                    height={105}
                    x={-90}
                    y={-52}
                    style={{ overflow: 'visible' }}
                >
                    <div
                        onClick={() => handleNodeClick(nodeDatum)}
                        style={{
                            width: '180px',
                            height: '105px',
                            background: COLORS.ivory,
                            border: `3px solid ${borderColor}`,
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(139, 69, 19, 0.2)',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '12px',
                            boxSizing: 'border-box',
                            position: 'relative',
                            fontFamily: '"Times New Roman", Georgia, serif'
                        }}
                    >
                        {/* Top color bar */}
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '8px',
                            background: borderColor,
                            borderRadius: '5px 5px 0 0'
                        }} />

                        {/* Generation badge - Gold diamond */}
                        <div style={{
                            position: 'absolute',
                            top: '-14px',
                            right: '-14px',
                            width: '32px',
                            height: '32px',
                            background: `linear-gradient(135deg, ${COLORS.gold} 0%, #b8962f 100%)`,
                            border: `2px solid ${COLORS.brown}`,
                            borderRadius: '4px',
                            transform: 'rotate(45deg)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.25)'
                        }}>
                            <span style={{
                                transform: 'rotate(-45deg)',
                                color: 'white',
                                fontSize: '14px',
                                fontWeight: '700',
                                textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                            }}>
                                {attrs.generation || '?'}
                            </span>
                        </div>

                        {/* Deceased icon */}
                        {isDeceased && (
                            <div style={{
                                position: 'absolute',
                                top: '10px',
                                left: '10px',
                                fontSize: '16px'
                            }}>🕯️</div>
                        )}

                        {/* Title prefix */}
                        <div style={{
                            fontSize: '11px',
                            color: borderColor,
                            fontWeight: '600',
                            marginTop: '6px',
                            letterSpacing: '1px'
                        }}>
                            {attrs.generation <= 2 ? 'CỤ' : (isMale ? 'ÔNG' : 'BÀ')}
                        </div>

                        {/* Name */}
                        <div style={{
                            fontSize: '16px',
                            fontWeight: '700',
                            color: '#1a1a1a',
                            textAlign: 'center',
                            marginTop: '2px',
                            lineHeight: '1.2'
                        }}>
                            {nodeDatum.name?.length > 16
                                ? nodeDatum.name.substring(0, 14) + '...'
                                : nodeDatum.name}
                        </div>

                        {/* Years */}
                        <div style={{
                            fontSize: '12px',
                            color: COLORS.brown,
                            marginTop: '4px'
                        }}>
                            {isDeceased && attrs.deathYear
                                ? `(Mất ${attrs.deathYear})`
                                : attrs.birthYear
                                    ? `(${attrs.birthYear} - ${attrs.deathYear || 'nay'})`
                                    : ''}
                        </div>
                    </div>
                </foreignObject>
            </g>
        );
    };

    const handleNodeClick = (nodeDatum) => {
        setSelectedMember(nodeDatum);
        setModalVisible(true);
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
        separation: { siblings: 1.4, nonSiblings: 2.0 },
        nodeSize: { x: 220, y: 160 },
        translate,
        zoom: 0.85,
        scaleExtent: { min: 0.3, max: 2.5 },
        enableLegacyTransitions: true,
        transitionDuration: 400
    }), [translate]);

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
                    <h1>GIA PHẢ HỌ ĐẶNG</h1>
                    <p>Đà Nẵng - Việt Nam</p>
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
                Gia Phả Họ Đặng Đà Nẵng • Giữ gìn và phát huy truyền thống dòng họ
            </div>

            {/* Modal */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {attrs.gender === 'male' ? (
                            <ManOutlined style={{ color: COLORS.male, fontSize: 20 }} />
                        ) : (
                            <WomanOutlined style={{ color: COLORS.female, fontSize: 20 }} />
                        )}
                        <span style={{ fontSize: 18, fontFamily: 'Georgia, serif' }}>{selectedMember?.name}</span>
                        {attrs.isDeceased && <Tag color="default">Đã mất</Tag>}
                    </div>
                }
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={[
                    attrs.isDeceased && (
                        <Button
                            key="memorial"
                            type="primary"
                            icon={<HeartOutlined />}
                            style={{ background: COLORS.male }}
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
                width={480}
            >
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <Avatar
                        size={100}
                        src={attrs.avatar}
                        icon={<UserOutlined />}
                        style={{
                            backgroundColor: COLORS.gold,
                            border: `4px solid ${attrs.gender === 'male' ? COLORS.male : COLORS.female}`
                        }}
                    />
                </div>

                <Descriptions column={1} bordered size="middle">
                    <Descriptions.Item label="Họ tên">
                        <strong style={{ fontSize: 16 }}>{selectedMember?.name}</strong>
                    </Descriptions.Item>
                    <Descriptions.Item label="Giới tính">
                        <Tag color={attrs.gender === 'male' ? 'red' : 'green'}>
                            {attrs.gender === 'male' ? '♂ Nam' : '♀ Nữ'}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Đời thứ">
                        <Tag color="gold" style={{ fontSize: 14 }}>Đời {attrs.generation}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Năm sinh">
                        {attrs.birthYear || 'Không rõ'}
                    </Descriptions.Item>
                    {(attrs.isDeceased || attrs.deathYear) && (
                        <Descriptions.Item label="Năm mất">
                            {attrs.deathYear || 'Không rõ'}
                        </Descriptions.Item>
                    )}
                </Descriptions>
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
                    .header-content h1 {
                        font-size: 20px;
                        letter-spacing: 2px;
                    }
                    .header-decoration {
                        font-size: 24px;
                    }
                    .tree-legend {
                        gap: 12px;
                        flex-wrap: wrap;
                    }
                }
            `}</style>
        </div>
    );
};

export default FamilyTreeView;
