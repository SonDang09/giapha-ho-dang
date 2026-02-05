import { useEffect } from 'react';

/**
 * Custom hook to update document title and meta description dynamically
 * @param {string} title - The page title
 * @param {string} description - Meta description for SEO (optional)
 * @param {boolean} withSuffix - Whether to append site name (default: true)
 */
const useDocumentTitle = (title, description = '', withSuffix = true) => {
    useEffect(() => {
        const suffix = 'Gia Phả Họ Đặng Đà Nẵng';
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
    }, [title, description, withSuffix]);
};

export default useDocumentTitle;
