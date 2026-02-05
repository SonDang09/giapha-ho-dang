import { createContext, useContext, useState, useEffect } from 'react';
import { settingsAPI } from '../api';

const defaultSettings = {
    // Branding
    brandName: 'Đặng Đức Tộc',
    location: 'Đà Nẵng - Việt Nam',

    // Homepage
    siteTitle: 'Gia Phả Họ Đặng Đà Nẵng',
    tagline: 'Uống nước nhớ nguồn - Ăn quả nhớ kẻ trồng cây',
    heroDescription: 'Trang web lưu giữ và kết nối các thế hệ trong dòng họ',

    // Tree page
    treeHeader: 'GIA PHẢ HỌ ĐẶNG',
    treeSubtitle: 'Đà Nẵng - Việt Nam',
    treeFooter: 'Gia Phả Họ Đặng Đà Nẵng • Giữ gìn và phát huy truyền thống dòng họ',

    // Footer
    footerText: 'Giữ gìn và phát huy truyền thống dòng họ',

    // Contact
    contactEmail: '',
    contactPhone: '',

    // Social
    socialLinks: { facebook: '', zalo: '', youtube: '' },

    loading: true
};

const SiteSettingsContext = createContext(defaultSettings);

export const SiteSettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(defaultSettings);

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const response = await settingsAPI.get();
                if (response.data?.data) {
                    const data = response.data.data;
                    setSettings({
                        // Branding
                        brandName: data.brandName || defaultSettings.brandName,
                        location: data.location || defaultSettings.location,

                        // Homepage
                        siteTitle: data.siteTitle || defaultSettings.siteTitle,
                        tagline: data.tagline || defaultSettings.tagline,
                        heroDescription: data.heroDescription || defaultSettings.heroDescription,

                        // Tree page
                        treeHeader: data.treeHeader || defaultSettings.treeHeader,
                        treeSubtitle: data.treeSubtitle || defaultSettings.treeSubtitle,
                        treeFooter: data.treeFooter || defaultSettings.treeFooter,

                        // Footer
                        footerText: data.footerText || defaultSettings.footerText,

                        // Contact
                        contactEmail: data.contactEmail || '',
                        contactPhone: data.contactPhone || '',

                        // Social
                        socialLinks: data.socialLinks || defaultSettings.socialLinks,

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
