import { useEffect } from 'react';
import { useSiteSettings } from '../context/SiteSettingsContext';

/**
 * Custom hook to update document title and meta description dynamically
 * @param {string} title - The page title
 * @param {string} description - Meta description for SEO (optional)
 * @param {boolean} withSuffix - Whether to append site name (default: true)
 */
const useDocumentTitle = (title, description = '', withSuffix = true) => {
    const { siteTitle } = useSiteSettings();

    useEffect(() => {
        const suffix = siteTitle;
        document.title = withSuffix && title ? `${title} | ${suffix}` : (title || suffix);

        // Update or create meta description
        if (description) {
            let metaDescription = document.querySelector('meta[name="description"]');
            if (!metaDescription) {
                metaDescription = document.createElement('meta');
                metaDescription.name = 'description';
                document.head.appendChild(metaDescription);
            }
            metaDescription.content = description;
        }

        return () => {
            document.title = suffix;
        };
    }, [title, description, withSuffix, siteTitle]);
};

export default useDocumentTitle;

