import { useState, useCallback } from 'react';
import axios from 'axios';

const useAdminWalletUpdate = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    /**
     * Update user balance
     * @param {Object} data - { userId, newAmount }
     */
    const updateBalance = useCallback(async ({ userId, newAmount }) => {
        setLoading(true);
        setError(null);
        setSuccess(false);
        try {
            const response = await axios.put('/admin/wallet/update-balance', {
                userId,
                newAmount
            });

            setSuccess(true);
            return response.data;
        } catch (err) {
            console.error("Error updating balance:", err);
            const errorMessage = err.response?.data?.message || err.response?.data?.error || "Failed to update balance";
            setError(errorMessage);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        updateBalance,
        loading,
        error,
        success,
        setSuccess,
        setError
    };
};

export default useAdminWalletUpdate;
