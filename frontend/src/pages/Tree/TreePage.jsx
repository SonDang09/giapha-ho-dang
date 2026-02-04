import { useState, useEffect } from 'react';
import { Card, Spin, Button, Space } from 'antd';
import { FullscreenOutlined, ReloadOutlined, ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons';
import FamilyTreeView from '../../components/FamilyTree/FamilyTreeView';
import { demoAPI, membersAPI } from '../../api';

const TreePage = () => {
    const [treeData, setTreeData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTreeData();
    }, []);

    const loadTreeData = async () => {
        setLoading(true);
        try {
            // Use demo data directly for fast loading
            // In production, this would try real API with timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);

            try {
                const response = await fetch('http://localhost:5001/api/demo/tree', {
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
                const data = await response.json();
                if (data.data) {
                    setTreeData(data.data);
                }
            } catch (fetchError) {
                clearTimeout(timeoutId);
                // Use hardcoded demo data as fallback
                setTreeData(getDemoTreeData());
            }
        } catch (error) {
            console.error('Failed to load tree data');
            setTreeData(getDemoTreeData());
        } finally {
            setLoading(false);
        }
    };

    // Fallback demo data
    const getDemoTreeData = () => ({
        name: 'Đặng Văn Tổ',
        attributes: {
            id: 'demo-1',
            gender: 'male',
            generation: 1,
            birthYear: 1850,
            deathYear: 1920,
            isDeceased: true
        },
        children: [
            {
                name: 'Đặng Văn Nhất',
                attributes: { id: 'demo-2', gender: 'male', generation: 2, birthYear: 1880, deathYear: 1950, isDeceased: true },
                children: [
                    {
                        name: 'Đặng Văn An',
                        attributes: { id: 'demo-4', gender: 'male', generation: 3, birthYear: 1910, isDeceased: false },
                        children: [
                            { name: 'Đặng Văn Minh', attributes: { id: 'demo-7', gender: 'male', generation: 4, birthYear: 1945, isDeceased: false }, children: [] },
                            { name: 'Đặng Thị Hương', attributes: { id: 'demo-8', gender: 'female', generation: 4, birthYear: 1948, isDeceased: false }, children: [] }
                        ]
                    },
                    { name: 'Đặng Thị Bình', attributes: { id: 'demo-5', gender: 'female', generation: 3, birthYear: 1915, deathYear: 2000, isDeceased: true }, children: [] }
                ]
            },
            {
                name: 'Đặng Văn Nhì',
                attributes: { id: 'demo-3', gender: 'male', generation: 2, birthYear: 1885, deathYear: 1960, isDeceased: true },
                children: [
                    {
                        name: 'Đặng Văn Cường',
                        attributes: { id: 'demo-6', gender: 'male', generation: 3, birthYear: 1920, deathYear: 1995, isDeceased: true },
                        children: [
                            {
                                name: 'Đặng Văn Đức',
                                attributes: { id: 'demo-9', gender: 'male', generation: 4, birthYear: 1950, isDeceased: false },
                                children: [
                                    { name: 'Đặng Văn Em', attributes: { id: 'demo-10', gender: 'male', generation: 5, birthYear: 1980, isDeceased: false }, children: [] }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    });

    return (
        <div className="tree-page">
            <Card
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{
                            fontSize: 24,
                            color: '#D4AF37',
                            fontFamily: 'serif'
                        }}>
                            🌳
                        </span>
                        <div>
                            <h1 style={{
                                margin: 0,
                                fontSize: 22,
                                color: '#228B22',
                                fontWeight: 700
                            }}>
                                Cây Gia Phả Họ Đặng
                            </h1>
                            <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
                                Click vào thành viên để xem chi tiết
                            </p>
                        </div>
                    </div>
                }
                extra={
                    <Space>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={loadTreeData}
                            loading={loading}
                        >
                            Tải lại
                        </Button>
                    </Space>
                }
                bordered={false}
                bodyStyle={{ padding: 0, height: 'calc(100vh - 250px)', minHeight: 500 }}
            >
                {loading ? (
                    <div className="flex-center" style={{ height: '100%' }}>
                        <Spin size="large" tip="Đang tải cây gia phả..." />
                    </div>
                ) : (
                    <FamilyTreeView data={treeData} loading={loading} />
                )}
            </Card>
        </div>
    );
};

export default TreePage;
