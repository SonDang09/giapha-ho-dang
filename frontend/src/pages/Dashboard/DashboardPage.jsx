import { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Tag, Table, Progress, Spin } from 'antd';
import {
    TeamOutlined,
    ManOutlined,
    WomanOutlined,
    CalendarOutlined,
    RiseOutlined,
    HeartOutlined,
    TrophyOutlined
} from '@ant-design/icons';

const DashboardPage = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalMembers: 0,
        livingMembers: 0,
        deceasedMembers: 0,
        maleCount: 0,
        femaleCount: 0,
        byGeneration: [],
        oldestMember: null,
        youngestMember: null
    });

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        setLoading(true);
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);

            try {
                const response = await fetch('http://localhost:5001/api/demo/members', {
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
                const data = await response.json();
                if (data.data) {
                    calculateStats(data.data);
                    return;
                }
            } catch (fetchError) {
                clearTimeout(timeoutId);
            }

            // Demo data
            const demoMembers = [
                { _id: '1', fullName: 'Đặng Văn Tổ', gender: 'male', generation: 1, birthDate: '1850-01-01', deathDate: '1920-03-15', isDeceased: true },
                { _id: '2', fullName: 'Đặng Văn Nhất', gender: 'male', generation: 2, birthDate: '1880-05-10', deathDate: '1950-08-20', isDeceased: true },
                { _id: '3', fullName: 'Đặng Văn Nhì', gender: 'male', generation: 2, birthDate: '1885-07-15', deathDate: '1960-12-25', isDeceased: true },
                { _id: '4', fullName: 'Đặng Văn An', gender: 'male', generation: 3, birthDate: '1910-03-20', deathDate: '1980-11-05', isDeceased: true },
                { _id: '5', fullName: 'Đặng Thị Bình', gender: 'female', generation: 3, birthDate: '1915-09-05', deathDate: '2000-11-10', isDeceased: true },
                { _id: '6', fullName: 'Đặng Văn Cường', gender: 'male', generation: 3, birthDate: '1920-06-12', deathDate: '1995-04-28', isDeceased: true },
                { _id: '7', fullName: 'Đặng Văn Minh', gender: 'male', generation: 4, birthDate: '1945-11-30', isDeceased: false },
                { _id: '8', fullName: 'Đặng Thị Hương', gender: 'female', generation: 4, birthDate: '1948-04-18', isDeceased: false },
                { _id: '9', fullName: 'Đặng Văn Đức', gender: 'male', generation: 4, birthDate: '1950-08-25', isDeceased: false },
                { _id: '10', fullName: 'Đặng Văn Em', gender: 'male', generation: 5, birthDate: '1980-02-14', isDeceased: false },
            ];
            calculateStats(demoMembers);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (members) => {
        const total = members.length;
        const living = members.filter(m => !m.isDeceased).length;
        const deceased = members.filter(m => m.isDeceased).length;
        const male = members.filter(m => m.gender === 'male').length;
        const female = members.filter(m => m.gender === 'female').length;

        // By generation
        const genCounts = {};
        members.forEach(m => {
            genCounts[m.generation] = (genCounts[m.generation] || 0) + 1;
        });
        const byGeneration = Object.entries(genCounts)
            .map(([gen, count]) => ({ generation: parseInt(gen), count }))
            .sort((a, b) => a.generation - b.generation);

        // Oldest/youngest living
        const livingMembers = members.filter(m => !m.isDeceased && m.birthDate);
        let oldest = null, youngest = null;
        if (livingMembers.length > 0) {
            livingMembers.sort((a, b) => new Date(a.birthDate) - new Date(b.birthDate));
            oldest = livingMembers[0];
            youngest = livingMembers[livingMembers.length - 1];
        }

        setStats({
            totalMembers: total,
            livingMembers: living,
            deceasedMembers: deceased,
            maleCount: male,
            femaleCount: female,
            byGeneration,
            oldestMember: oldest,
            youngestMember: youngest
        });
    };

    const getAge = (birthDate) => {
        if (!birthDate) return 'N/A';
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    if (loading) {
        return (
            <div className="flex-center" style={{ minHeight: 400 }}>
                <Spin size="large" />
            </div>
        );
    }

    const malePercent = stats.totalMembers > 0 ? Math.round((stats.maleCount / stats.totalMembers) * 100) : 0;
    const femalePercent = 100 - malePercent;

    return (
        <div className="page-container">
            <h1 className="page-title">
                <RiseOutlined style={{ color: '#D4AF37' }} /> Thống Kê Dòng Họ
            </h1>

            {/* Main Stats */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={12} sm={6}>
                    <Card bordered={false}>
                        <Statistic
                            title="Tổng thành viên"
                            value={stats.totalMembers}
                            prefix={<TeamOutlined style={{ color: '#228B22' }} />}
                            valueStyle={{ color: '#228B22' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card bordered={false}>
                        <Statistic
                            title="Còn sống"
                            value={stats.livingMembers}
                            prefix={<HeartOutlined style={{ color: '#52c41a' }} />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card bordered={false}>
                        <Statistic
                            title="Đã mất"
                            value={stats.deceasedMembers}
                            prefix={<CalendarOutlined style={{ color: '#8c8c8c' }} />}
                            valueStyle={{ color: '#8c8c8c' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card bordered={false}>
                        <Statistic
                            title="Số đời"
                            value={stats.byGeneration.length}
                            prefix={<TrophyOutlined style={{ color: '#D4AF37' }} />}
                            valueStyle={{ color: '#D4AF37' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[24, 24]}>
                {/* Gender Distribution */}
                <Col xs={24} md={12}>
                    <Card title="Phân bố giới tính" bordered={false}>
                        <div style={{ marginBottom: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span><ManOutlined style={{ color: '#3b82f6' }} /> Nam</span>
                                <span>{stats.maleCount} ({malePercent}%)</span>
                            </div>
                            <Progress percent={malePercent} strokeColor="#3b82f6" showInfo={false} />
                        </div>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span><WomanOutlined style={{ color: '#ec4899' }} /> Nữ</span>
                                <span>{stats.femaleCount} ({femalePercent}%)</span>
                            </div>
                            <Progress percent={femalePercent} strokeColor="#ec4899" showInfo={false} />
                        </div>
                    </Card>
                </Col>

                {/* Generation Distribution */}
                <Col xs={24} md={12}>
                    <Card title="Phân bố theo đời" bordered={false}>
                        <Table
                            dataSource={stats.byGeneration}
                            columns={[
                                {
                                    title: 'Đời',
                                    dataIndex: 'generation',
                                    render: (g) => <Tag color="gold">Đời {g}</Tag>
                                },
                                {
                                    title: 'Số thành viên',
                                    dataIndex: 'count',
                                    render: (c) => <strong>{c}</strong>
                                },
                                {
                                    title: 'Tỷ lệ',
                                    dataIndex: 'count',
                                    render: (c) => (
                                        <Progress
                                            percent={Math.round((c / stats.totalMembers) * 100)}
                                            size="small"
                                            strokeColor="#228B22"
                                        />
                                    )
                                }
                            ]}
                            rowKey="generation"
                            pagination={false}
                            size="small"
                        />
                    </Card>
                </Col>

                {/* Notable Members */}
                <Col xs={24} md={12}>
                    <Card title="Thành viên nổi bật" bordered={false}>
                        {stats.oldestMember && (
                            <div style={{ marginBottom: 16, padding: 16, background: '#f6ffed', borderRadius: 8 }}>
                                <div style={{ color: '#52c41a', fontWeight: 600, marginBottom: 4 }}>
                                    👴 Cao tuổi nhất (còn sống)
                                </div>
                                <div style={{ fontSize: 18, fontWeight: 700 }}>
                                    {stats.oldestMember.fullName}
                                </div>
                                <div style={{ color: '#64748b' }}>
                                    {getAge(stats.oldestMember.birthDate)} tuổi • Đời {stats.oldestMember.generation}
                                </div>
                            </div>
                        )}
                        {stats.youngestMember && (
                            <div style={{ padding: 16, background: '#fff7e6', borderRadius: 8 }}>
                                <div style={{ color: '#fa8c16', fontWeight: 600, marginBottom: 4 }}>
                                    👶 Trẻ nhất
                                </div>
                                <div style={{ fontSize: 18, fontWeight: 700 }}>
                                    {stats.youngestMember.fullName}
                                </div>
                                <div style={{ color: '#64748b' }}>
                                    {getAge(stats.youngestMember.birthDate)} tuổi • Đời {stats.youngestMember.generation}
                                </div>
                            </div>
                        )}
                    </Card>
                </Col>

                {/* Quick Summary */}
                <Col xs={24} md={12}>
                    <Card title="Tóm tắt" bordered={false} style={{ height: '100%' }}>
                        <div style={{ lineHeight: 2.5 }}>
                            <p>
                                <strong>📊 Dòng họ Đặng</strong> hiện có <Tag color="green">{stats.totalMembers}</Tag>
                                thành viên được ghi nhận trong gia phả.
                            </p>
                            <p>
                                Trải qua <Tag color="gold">{stats.byGeneration.length} đời</Tag>,
                                với <Tag color="blue">{stats.maleCount} nam</Tag> và
                                <Tag color="magenta">{stats.femaleCount} nữ</Tag>.
                            </p>
                            <p>
                                Hiện có <Tag color="green">{stats.livingMembers}</Tag> thành viên còn sống và
                                <Tag>{stats.deceasedMembers}</Tag> người đã về với tổ tiên.
                            </p>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default DashboardPage;
