import { useEffect } from 'react';

/**
 * Custom hook to update document title dynamically
 * @param {string} title - The page title
 * @param {boolean} withSuffix - Whether to append site name (default: true)
 */
const useDocumentTitle = (title, withSuffix = true) => {
    useEffect(() => {
        const suffix = 'Gia Phả Họ Đặng Đà Nẵng';
        document.title = withSuffix && title ? `${title} | ${suffix}` : (title || suffix);

        return () => {
            document.title = suffix;
        };
    }, [title, withSuffix]);
};

export default useDocumentTitle;
