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
            colorPrimary: '#C41E3A',
            colorSuccess: '#b8962f',
            colorWarning: '#D4AF37',
            colorError: '#9a1830',
            colorInfo: '#4169E1',
            borderRadius: 8,
            fontFamily: "'Roboto', 'Noto Sans', -apple-system, BlinkMacSystemFont, sans-serif"
        },
        components: {
            Layout: {
                headerBg: isDarkMode ? '#1a0f0a' : '#8B0000',
                siderBg: isDarkMode ? '#3d2416' : '#FDF8E8',
                footerBg: isDarkMode ? '#1a0f0a' : '#8B0000'
            },
            Menu: {
                darkItemBg: 'transparent',
                darkSubMenuItemBg: 'transparent',
                darkItemSelectedBg: '#9a1830',
                darkItemHoverBg: 'rgba(196, 30, 58, 0.2)'
            },
            Card: {
                borderRadiusLG: 12
            },
            Button: {
                borderRadius: 8
            },
            Input: {
                borderRadius: 8
            },
            Progress: {
                defaultColor: '#C41E3A'
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
