import { createContext, useContext, useState, useEffect } from 'react';
import { settingsAPI } from '../api';

const SiteSettingsContext = createContext({
    siteTitle: 'Gia Phả Họ Đặng Đà Nẵng',
    tagline: 'Uống nước nhớ nguồn - Ăn quả nhớ kẻ trồng cây',
    heroDescription: '',
    loading: true
});

export const SiteSettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({
        siteTitle: 'Gia Phả Họ Đặng Đà Nẵng',
        tagline: 'Uống nước nhớ nguồn - Ăn quả nhớ kẻ trồng cây',
        heroDescription: 'Trang web lưu giữ và kết nối các thế hệ trong dòng họ',
        loading: true
    });

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const response = await settingsAPI.get();
                if (response.data?.data) {
                    setSettings({
                        siteTitle: response.data.data.siteTitle || 'Gia Phả Họ Đặng Đà Nẵng',
                        tagline: response.data.data.tagline || 'Uống nước nhớ nguồn - Ăn quả nhớ kẻ trồng cây',
                        heroDescription: response.data.data.heroDescription || '',
                        loading: false
                    });
                }
            } catch (error) {
                console.log('Settings not available, using defaults');
                setSettings(prev => ({ ...prev, loading: false }));
            }
        };
        loadSettings();
    }, []);

    return (
        <SiteSettingsContext.Provider value={settings}>
            {children}
        </SiteSettingsContext.Provider>
    );
};

export const useSiteSettings = () => useContext(SiteSettingsContext);

export default SiteSettingsContext;
