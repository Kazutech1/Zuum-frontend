import { useState, useCallback } from 'react';
import axios from 'axios';

const useAdminTransactions = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [summary, setSummary] = useState(null);
    const [pagination, setPagination] = useState({
        total: 0,
        limit: 50,
        offset: 0,
        pages: 1
    });

    /**
     * Fetch transactions history
     * @param {Object} params - Query parameters
     * @param {string} [params.userId] - User ID
     * @param {string} [params.type] - Transaction type
     * @param {string} [params.status] - Transaction status
     * @param {string} [params.currency] - Currency
     * @param {string} [params.startDate] - ISO Date
     * @param {string} [params.endDate] - ISO Date
     * @param {number} [params.limit] - Limit per page
     * @param {number} [params.offset] - Offset
     */
    const fetchTransactions = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            // Remove undefined/null params
            const queryParams = Object.fromEntries(
                Object.entries(params).filter(([_, v]) => v != null && v !== '')
            );

            const response = await axios.get('/admin/transactions/history', {
                params: queryParams
            });

            const { data, summary: fetchedSummary, pagination: fetchedPagination, success } = response.data;

            if (success) {
                setTransactions(data || []);
                setSummary(fetchedSummary || null);
                if (fetchedPagination) {
                    setPagination(fetchedPagination);
                }
                return data;
            } else {
                // Fallback if success is false but no error thrown
                setError("Failed to fetch transactions");
                return null;
            }

        } catch (err) {
            console.error("Error fetching transactions:", err);
            const errorMessage = err.response?.data?.message || err.response?.data?.error || "An error occurred while fetching transactions";
            setError(errorMessage);
            setTransactions([]);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        transactions,
        summary,
        pagination,
        fetchTransactions
    };
};

export default useAdminTransactions;
