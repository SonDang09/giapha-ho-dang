import { useState, useEffect } from 'react';
import { Spin, Button, Space, FloatButton } from 'antd';
import { ReloadOutlined, FullscreenOutlined, FullscreenExitOutlined, ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons';
import FamilyTreeView from '../../components/FamilyTree/FamilyTreeView';
import { membersAPI } from '../../api';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const TreePage = () => {
    useDocumentTitle('Cây Gia Phả', 'Xem sơ đồ cây gia phả họ Đặng Đà Nẵng với đầy đủ các thế hệ. Tra cứu quan hệ huyết thống, thông tin từng thành viên trong dòng họ.');
    const [treeData, setTreeData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        loadTreeData();
    }, []);

    const loadTreeData = async () => {
        setLoading(true);
        try {
            const response = await membersAPI.getTree();
            if (response?.data?.data) {
                setTreeData(response.data.data);
                setLoading(false);
                return;
            }
        } catch (error) {
            console.log('API not available, using demo data');
        }

        setTreeData(getDemoTreeData());
        setLoading(false);
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

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
            <FamilyTreeView data={treeData} loading={loading} onRefresh={loadTreeData} />

            {/* Float Action Buttons */}
            <FloatButton.Group shape="square" style={{ right: 24, bottom: 24 }}>
                <FloatButton
                    icon={<ReloadOutlined />}
                    tooltip="Tải lại"
                    onClick={loadTreeData}
                />
                <FloatButton
                    icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                    tooltip={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
                    onClick={toggleFullscreen}
                />
            </FloatButton.Group>

            <style>{`
                .tree-page {
                    margin: -16px;
                    position: relative;
                }
            `}</style>
        </div>
    );
};

export default TreePage;
