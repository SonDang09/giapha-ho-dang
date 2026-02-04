import { useState } from 'react';
import { Card, Form, Input, Button, Avatar, Row, Col, Divider, message, Tag } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, SaveOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api';

const ProfilePage = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [profileForm] = Form.useForm();
    const [passwordForm] = Form.useForm();

    const getRoleLabel = (role) => {
        const labels = {
            admin_toc: 'Admin Tộc',
            chi_ho: 'Chi họ',
            thanh_vien: 'Thành viên'
        };
        return labels[role] || role;
    };

    const getRoleColor = (role) => {
        const colors = {
            admin_toc: 'gold',
            chi_ho: 'blue',
            thanh_vien: 'green'
        };
        return colors[role] || 'default';
    };

    const handleUpdateProfile = async (values) => {
        setLoading(true);
        try {
            await authAPI.updateProfile(values);
            message.success('Đã cập nhật thông tin');
        } catch (error) {
            message.error('Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async (values) => {
        setPasswordLoading(true);
        try {
            await authAPI.updatePassword(values);
            message.success('Đã đổi mật khẩu');
            passwordForm.resetFields();
        } catch (error) {
            message.error('Mật khẩu cũ không đúng');
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <div className="page-container">
            <h1 className="page-title">
                <UserOutlined style={{ color: '#D4AF37' }} /> Thông Tin Tài Khoản
            </h1>

            <Row gutter={[24, 24]}>
                {/* Profile Info */}
                <Col xs={24} lg={14}>
                    <Card bordered={false}>
                        <div style={{ textAlign: 'center', marginBottom: 24 }}>
                            <Avatar
                                size={100}
                                icon={<UserOutlined />}
                                style={{
                                    backgroundColor: '#228B22',
                                    marginBottom: 16
                                }}
                            />
                            <h2 style={{ margin: 0 }}>{user?.fullName || 'Người dùng'}</h2>
                            <Tag color={getRoleColor(user?.role)} style={{ marginTop: 8 }}>
                                {getRoleLabel(user?.role)}
                            </Tag>
                        </div>

                        <Divider>Thông tin cá nhân</Divider>

                        <Form
                            form={profileForm}
                            layout="vertical"
                            onFinish={handleUpdateProfile}
                            initialValues={{
                                fullName: user?.fullName || '',
                                email: user?.email || '',
                                phone: user?.phone || ''
                            }}
                        >
                            <Form.Item
                                name="fullName"
                                label="Họ và tên"
                                rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                            >
                                <Input prefix={<UserOutlined />} placeholder="Họ và tên" />
                            </Form.Item>

                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập email' },
                                    { type: 'email', message: 'Email không hợp lệ' }
                                ]}
                            >
                                <Input prefix={<MailOutlined />} placeholder="Email" />
                            </Form.Item>

                            <Form.Item
                                name="phone"
                                label="Số điện thoại"
                            >
                                <Input prefix={<PhoneOutlined />} placeholder="Số điện thoại" />
                            </Form.Item>

                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    icon={<SaveOutlined />}
                                    loading={loading}
                                >
                                    Lưu thay đổi
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </Col>

                {/* Change Password */}
                <Col xs={24} lg={10}>
                    <Card bordered={false}>
                        <h3 style={{ marginBottom: 24 }}>
                            <LockOutlined /> Đổi mật khẩu
                        </h3>

                        <Form
                            form={passwordForm}
                            layout="vertical"
                            onFinish={handleUpdatePassword}
                        >
                            <Form.Item
                                name="currentPassword"
                                label="Mật khẩu hiện tại"
                                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
                            >
                                <Input.Password placeholder="Mật khẩu hiện tại" />
                            </Form.Item>

                            <Form.Item
                                name="newPassword"
                                label="Mật khẩu mới"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                                    { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
                                ]}
                            >
                                <Input.Password placeholder="Mật khẩu mới" />
                            </Form.Item>

                            <Form.Item
                                name="confirmPassword"
                                label="Xác nhận mật khẩu mới"
                                dependencies={['newPassword']}
                                rules={[
                                    { required: true, message: 'Vui lòng xác nhận mật khẩu' },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('newPassword') === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('Mật khẩu không khớp'));
                                        }
                                    })
                                ]}
                            >
                                <Input.Password placeholder="Xác nhận mật khẩu mới" />
                            </Form.Item>

                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={passwordLoading}
                                    style={{ background: '#D4AF37', borderColor: '#D4AF37' }}
                                >
                                    Đổi mật khẩu
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>

                    {/* Account Stats */}
                    <Card bordered={false} style={{ marginTop: 24 }}>
                        <h3 style={{ marginBottom: 16 }}>Thống kê</h3>
                        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                            <div>
                                <div style={{ fontSize: 24, fontWeight: 700, color: '#228B22' }}>
                                    {user?.role === 'admin_toc' ? '∞' : '10'}
                                </div>
                                <div style={{ color: '#64748b', fontSize: 13 }}>Quyền chỉnh sửa</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 24, fontWeight: 700, color: '#D4AF37' }}>
                                    5
                                </div>
                                <div style={{ color: '#64748b', fontSize: 13 }}>Nén hương đã thắp</div>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default ProfilePage;
