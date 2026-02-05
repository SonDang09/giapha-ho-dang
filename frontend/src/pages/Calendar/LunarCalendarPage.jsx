import { useState, useEffect } from 'react';
import { Row, Col, Card, Calendar, Badge, List, Avatar, Tag, Spin, Empty, Tooltip, Button } from 'antd';
import { CalendarOutlined, BellOutlined, HeartOutlined, ReloadOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import { membersAPI } from '../../api';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const LunarCalendarPage = () => {
    useDocumentTitle('Lịch Ngày Giỗ', 'Lịch ngày giỗ âm lịch của các cụ trong dòng họ Đặng Đà Nẵng. Tra cứu ngày giỗ sắp tới để chuẩn bị cúng giỗ tổ tiên.');
    const [loading, setLoading] = useState(true);
    const [anniversaries, setAnniversaries] = useState([]);
    const [selectedDate, setSelectedDate] = useState(dayjs());

    useEffect(() => {
        loadAnniversaries();
    }, []);

    const loadAnniversaries = async () => {
        setLoading(true);
        try {
            // Use API service
            const response = await membersAPI.getAnniversaries();

            if (response?.data?.data) {
                setAnniversaries(response.data.data);
                setLoading(false);
                return;
            }
        } catch (error) {
            console.log('API not available, using demo data');
        }

        // Demo data with lunar dates
        setAnniversaries([
            { _id: '1', fullName: 'Đặng Văn Tổ', generation: 1, deathDate: '1920-03-15', anniversaryDate: { lunarDay: 15, lunarMonth: 2 } },
            { _id: '2', fullName: 'Đặng Văn Nhất', generation: 2, deathDate: '1950-08-20', anniversaryDate: { lunarDay: 8, lunarMonth: 7 } },
            { _id: '3', fullName: 'Đặng Văn Nhì', generation: 2, deathDate: '1960-12-25', anniversaryDate: { lunarDay: 25, lunarMonth: 11 } },
            { _id: '4', fullName: 'Đặng Văn An', generation: 3, deathDate: '1980-11-05', anniversaryDate: { lunarDay: 5, lunarMonth: 10 } },
            { _id: '5', fullName: 'Đặng Thị Bình', generation: 3, deathDate: '2000-11-10', anniversaryDate: { lunarDay: 10, lunarMonth: 10 } },
            { _id: '6', fullName: 'Đặng Văn Cường', generation: 3, deathDate: '1995-04-28', anniversaryDate: { lunarDay: 28, lunarMonth: 3 } }
        ]);
        setLoading(false);
    };

    // Get anniversaries for a specific month
    const getMonthAnniversaries = (month) => {
        return anniversaries.filter(a => a.anniversaryDate?.lunarMonth === month);
    };

    // Get upcoming anniversaries (next 3 months lunar)
    const getUpcoming = () => {
        const currentMonth = new Date().getMonth() + 1;
        const upcoming = [];

        for (let i = 0; i < 3; i++) {
            const month = ((currentMonth + i - 1) % 12) + 1;
            const monthAnniversaries = getMonthAnniversaries(month);
            upcoming.push(...monthAnniversaries.map(a => ({
                ...a,
                isThisMonth: i === 0,
                monthsAway: i
            })));
        }

        return upcoming.sort((a, b) => {
            if (a.monthsAway !== b.monthsAway) return a.monthsAway - b.monthsAway;
            return (a.anniversaryDate?.lunarDay || 0) - (b.anniversaryDate?.lunarDay || 0);
        });
    };

    // Format lunar date in Vietnamese
    const formatLunarDate = (lunarDate) => {
        if (!lunarDate) return 'Chưa rõ';
        return `Ngày ${lunarDate.lunarDay} tháng ${lunarDate.lunarMonth} (Âm lịch)`;
    };

    // Get lunar month name
    const getLunarMonthName = (month) => {
        const names = [
            '', 'Giêng', 'Hai', 'Ba', 'Tư', 'Năm', 'Sáu',
            'Bảy', 'Tám', 'Chín', 'Mười', 'Mười Một', 'Chạp'
        ];
        return `Tháng ${names[month] || month}`;
    };

    // Simple date cell renderer for Ant Design Calendar
    const dateCellRender = (value) => {
        const day = value.date();
        const month = value.month() + 1;

        // Find anniversaries matching this day (simplified - using lunar day as approximate)
        const dayAnniversaries = anniversaries.filter(a =>
            a.anniversaryDate?.lunarDay === day &&
            a.anniversaryDate?.lunarMonth === month
        );

        if (dayAnniversaries.length > 0) {
            return (
                <div>
                    {dayAnniversaries.map(a => (
                        <Tooltip key={a._id} title={`Giỗ ${a.fullName}`}>
                            <Badge
                                status="warning"
                                text={<span style={{ fontSize: 11 }}>🕯️</span>}
                            />
                        </Tooltip>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <div className="flex-center" style={{ minHeight: 400 }}>
                <Spin size="large" />
            </div>
        );
    }

    const upcoming = getUpcoming();

    return (
        <div className="page-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h1 className="page-title" style={{ margin: 0 }}>
                    <CalendarOutlined style={{ color: '#D4AF37' }} /> Lịch Ngày Giỗ Âm Lịch
                </h1>
                <Button icon={<ReloadOutlined />} onClick={loadAnniversaries} loading={loading}>
                    Tải lại
                </Button>
            </div>

            <Row gutter={[24, 24]}>
                {/* Upcoming Anniversaries */}
                <Col xs={24} lg={10}>
                    <Card
                        title={
                            <span>
                                <BellOutlined style={{ color: '#fa8c16' }} /> Ngày Giỗ Sắp Tới
                            </span>
                        }
                        bordered={false}
                        extra={<Tag color="orange">{upcoming.length} ngày</Tag>}
                    >
                        {upcoming.length === 0 ? (
                            <Empty description="Không có ngày giỗ sắp tới" />
                        ) : (
                            <List
                                dataSource={upcoming}
                                renderItem={(item) => (
                                    <List.Item
                                        actions={[
                                            <Link to={`/memorial/${item._id}`} key="memorial">
                                                <HeartOutlined /> Tưởng niệm
                                            </Link>
                                        ]}
                                    >
                                        <List.Item.Meta
                                            avatar={
                                                <Avatar
                                                    style={{
                                                        backgroundColor: item.isThisMonth ? '#fa8c16' : '#D4AF37'
                                                    }}
                                                >
                                                    {item.fullName?.charAt(item.fullName.lastIndexOf(' ') + 1)}
                                                </Avatar>
                                            }
                                            title={
                                                <span>
                                                    {item.fullName}
                                                    {item.isThisMonth && (
                                                        <Tag color="red" style={{ marginLeft: 8 }}>Tháng này</Tag>
                                                    )}
                                                </span>
                                            }
                                            description={
                                                <div>
                                                    <div style={{ color: '#D4AF37' }}>
                                                        🕯️ {formatLunarDate(item.anniversaryDate)}
                                                    </div>
                                                    <div style={{ fontSize: 12, color: '#94a3b8' }}>
                                                        Đời thứ {item.generation}
                                                    </div>
                                                </div>
                                            }
                                        />
                                    </List.Item>
                                )}
                            />
                        )}
                    </Card>

                    {/* Anniversaries by Month */}
                    <Card
                        title="Theo Tháng Âm Lịch"
                        bordered={false}
                        style={{ marginTop: 24 }}
                    >
                        <Row gutter={[8, 8]}>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(month => {
                                const count = getMonthAnniversaries(month).length;
                                return (
                                    <Col span={6} key={month}>
                                        <Card
                                            size="small"
                                            style={{
                                                textAlign: 'center',
                                                background: count > 0 ? '#fffbe6' : '#fafafa',
                                                border: count > 0 ? '1px solid #ffe58f' : '1px solid #f0f0f0'
                                            }}
                                        >
                                            <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                                                Tháng {month}
                                            </div>
                                            <div style={{
                                                fontSize: 20,
                                                fontWeight: 700,
                                                color: count > 0 ? '#D4AF37' : '#d9d9d9'
                                            }}>
                                                {count}
                                            </div>
                                        </Card>
                                    </Col>
                                );
                            })}
                        </Row>
                    </Card>
                </Col>

                {/* Calendar */}
                <Col xs={24} lg={14}>
                    <Card title="Lịch Tháng" bordered={false}>
                        <Calendar
                            fullscreen={false}
                            cellRender={dateCellRender}
                            value={selectedDate}
                            onChange={setSelectedDate}
                        />
                        <div style={{ marginTop: 16, padding: 16, background: '#fffbe6', borderRadius: 8 }}>
                            <strong>📌 Lưu ý:</strong>
                            <p style={{ margin: '8px 0 0', color: '#64748b', fontSize: 13 }}>
                                Ngày giỗ được tính theo Âm lịch. Biểu tượng 🕯️ đánh dấu ngày có giỗ.
                                Vui lòng đối chiếu với lịch Âm lịch để biết ngày Dương lịch chính xác.
                            </p>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default LunarCalendarPage;
