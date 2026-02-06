import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (token && savedUser) {
            try {
                const response = await authAPI.getMe();
                setUser(response.data.user);
                setIsAuthenticated(true);
            } catch (error) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setUser(null);
                setIsAuthenticated(false);
            }
        }
        setLoading(false);
    };

    const login = async (username, password) => {
        try {
            const response = await authAPI.login({ username, password });
            const { token, user } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            setUser(user);
            setIsAuthenticated(true);

            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Đăng nhập thất bại'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
        // Redirect to homepage after logout
        window.location.href = '/';
    };

    const hasRole = (roles) => {
        if (!user) return false;
        if (typeof roles === 'string') return user.role === roles;
        return roles.includes(user.role);
    };

    const canEdit = () => hasRole(['admin_toc', 'chi_ho']);
    const isAdmin = () => hasRole('admin_toc');

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated,
                login,
                logout,
                hasRole,
                canEdit,
                isAdmin
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
