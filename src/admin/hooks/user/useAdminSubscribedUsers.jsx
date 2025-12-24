import { useState, useCallback } from "react";
import axios from "axios";

const useAdminSubscribedUsers = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [subscribedUsers, setSubscribedUsers] = useState([]);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 50,
        totalPages: 1
    });

    /**
     * Handle API errors consistently
     */
    const handleError = (err) => {
        if (err.response) {
            if (err.response.status === 401) {
                return "Unauthorized. Please login again.";
            }
            return err.response.data?.message || err.response.data?.error || "An error occurred";
        }
        return "Network error. Please check your connection.";
    };

    /**
     * Fetch subscribed users
     * Endpoint: GET /admin/users/subscribed
     * Query Params: page, limit, planId
     */
    const fetchSubscribedUsers = useCallback(async (page = 1, limit = 50, planId = null) => {
        setLoading(true);
        setError(null);
        try {
            const params = { page, limit };
            if (planId) {
                params.planId = planId;
            }

            const response = await axios.get("/admin/users/subscribed", { params });
            const data = response.data?.data || [];
            const paginationData = response.data?.pagination || {
                total: data.length,
                page: page,
                limit: limit,
                totalPages: Math.ceil(data.length / limit) || 1
            };

            setSubscribedUsers(data);
            setPagination(paginationData);
            return data;
        } catch (err) {
            const errorMsg = handleError(err);
            setError(errorMsg);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const resetState = useCallback(() => {
        setError(null);
        setSubscribedUsers([]);
        setLoading(false);
    }, []);

    return {
        loading,
        error,
        subscribedUsers,
        pagination,
        fetchSubscribedUsers,
        resetState
    };
};

export default useAdminSubscribedUsers;
