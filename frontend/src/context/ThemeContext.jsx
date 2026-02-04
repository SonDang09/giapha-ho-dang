import { createContext, useContext, useState, useEffect } from 'react';
import { ConfigProvider, theme as antTheme } from 'antd';
import viVN from 'antd/locale/vi_VN';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('darkMode');
        return saved ? JSON.parse(saved) : false;
    });

    useEffect(() => {
        localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
        document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    const toggleTheme = () => setIsDarkMode(!isDarkMode);

    const antDesignTheme = {
        algorithm: isDarkMode ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
        token: {
            colorPrimary: '#228B22',
            colorSuccess: '#10b981',
            colorWarning: '#f59e0b',
            colorError: '#ef4444',
            colorInfo: '#3b82f6',
            borderRadius: 8,
            fontFamily: "'Roboto', 'Noto Sans', -apple-system, BlinkMacSystemFont, sans-serif"
        },
        components: {
            Layout: {
                headerBg: isDarkMode ? '#0f0f1a' : '#1a3d1a',
                siderBg: isDarkMode ? '#16213e' : '#f8f9fa'
            },
            Menu: {
                darkItemBg: 'transparent',
                darkSubMenuItemBg: 'transparent'
            },
            Card: {
                borderRadiusLG: 12
            },
            Button: {
                borderRadius: 8
            },
            Input: {
                borderRadius: 8
            }
        }
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            <ConfigProvider theme={antDesignTheme} locale={viVN}>
                {children}
            </ConfigProvider>
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};
