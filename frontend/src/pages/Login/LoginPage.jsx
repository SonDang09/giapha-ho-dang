import { useState } from 'react';
import { Form, Input, Button, Card, message, Alert } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const LoginPage = () => {
    useDocumentTitle('Đăng Nhập', 'Đăng nhập vào hệ thống Gia Phả Họ Đặng Đà Nẵng để quản lý thông tin gia đình và tham gia các hoạt động dòng họ.');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/';

    const onFinish = async (values) => {
        setLoading(true);
        setError('');

        const result = await login(values.username, values.password);

        if (result.success) {
            message.success('Đăng nhập thành công!');
            navigate(from, { replace: true });
        } else {
            setError(result.message);
        }

        setLoading(false);
    };

    return (
        <div style={{
            minHeight: 'calc(100vh - 200px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
        }}>
            <Card
                style={{
                    width: '100%',
                    maxWidth: 400,
                    boxShadow: '0 4px 24px rgba(0,0,0,0.1)'
                }}
                bordered={false}
            >
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{
                        width: 64,
                        height: 64,
                        background: 'linear-gradient(135deg, #228B22 0%, #1a6b1a 100%)',
                        borderRadius: 16,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        fontSize: 28,
                        fontWeight: 'bold',
                        color: 'white'
                    }}>
                        Đ
                    </div>
                    <h1 style={{ margin: 0, fontSize: 24, color: '#228B22' }}>
                        Đăng Nhập
                    </h1>
                    <p style={{ margin: '8px 0 0', color: '#64748b' }}>
                        Gia Phả Họ Đặng Đà Nẵng
                    </p>
                </div>

                {error && (
                    <Alert
                        message={error}
                        type="error"
                        showIcon
                        style={{ marginBottom: 24 }}
                    />
                )}

                <Form
                    name="login"
                    onFinish={onFinish}
                    layout="vertical"
                    size="large"
                >
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="Tên đăng nhập"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Mật khẩu"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            icon={<LoginOutlined />}
                            block
                            style={{ height: 48 }}
                        >
                            Đăng Nhập
                        </Button>
                    </Form.Item>
                </Form>


            </Card>
        </div>
    );
};

export default LoginPage;
