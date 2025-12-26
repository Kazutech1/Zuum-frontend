import { useState, useCallback } from 'react';
import axios from 'axios';

const useAdminTerms = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [termsContent, setTermsContent] = useState('');
    const [lastModified, setLastModified] = useState(null);

    /**
     * Fetch terms and conditions
     */
    const fetchTerms = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get('/admin/terms-and-condition');
            setTermsContent(response.data.content || '');
            setLastModified(response.data.lastModified);
            return response.data;
        } catch (err) {
            console.error("Error fetching terms:", err);
            // 404 is acceptable (not yet created), treat as empty string
            if (err.response && err.response.status === 404) {
                setTermsContent('');
                return { content: '' };
            }
            const errorMessage = err.response?.data?.message || "Failed to fetch terms";
            setError(errorMessage);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Update terms and conditions
     * @param {string} content 
     */
    const updateTerms = useCallback(async (content) => {
        setLoading(true);
        setError(null);
        setSuccess(false);
        try {
            const response = await axios.put('/admin/terms-and-condition', {
                content
            });

            setSuccess(true);
            setLastModified(new Date().toISOString());
            return response.data;
        } catch (err) {
            console.error("Error updating terms:", err);
            const errorMessage = err.response?.data?.message || "Failed to update terms";
            setError(errorMessage);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const resetStatus = useCallback(() => {
        setSuccess(false);
        setError(null);
    }, []);

    return {
        loading,
        error,
        success,
        termsContent,
        lastModified,
        fetchTerms,
        updateTerms,
        resetStatus,
        setTermsContent // Allow manual editing of local state
    };
};

export default useAdminTerms;
