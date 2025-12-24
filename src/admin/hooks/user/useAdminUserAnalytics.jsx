import { useState, useCallback } from "react";
import axios from "axios";

const useAdminUserAnalytics = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [analytics, setAnalytics] = useState(null);

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
     * Create analytics for a profile
     * Endpoint: POST /admin/users/analytics
     */
    const createAnalytics = useCallback(async (data) => {
        setLoading(true);
        setError(null);
        setSuccess(false);
        try {
            const response = await axios.post("/admin/users/analytics", data);
            setSuccess(true);
            return response.data;
        } catch (err) {
            const errorMsg = handleError(err);
            setError(errorMsg);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Get analytics for a specific profile
     * Endpoint: GET /admin/users/analytics/{profileId}
     */
    const getAnalytics = useCallback(async (profileId) => {
        if (!profileId) return;
        setLoading(true);
        setError(null);
        setAnalytics(null);
        try {
            const response = await axios.get(`/admin/users/analytics/${profileId}`);
            const data = response.data?.data || response.data;
            setAnalytics(data);
            return data;
        } catch (err) {
            const errorMsg = handleError(err);
            setError(errorMsg);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Update analytics for a profile
     * Endpoint: PUT /admin/users/analytics/{profileId}
     */
    const updateAnalytics = useCallback(async (profileId, data) => {
        if (!profileId) return;
        setLoading(true);
        setError(null);
        setSuccess(false);
        try {
            const response = await axios.put(`/admin/users/analytics/${profileId}`, data);
            setSuccess(true);
            return response.data;
        } catch (err) {
            const errorMsg = handleError(err);
            setError(errorMsg);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Delete analytics for a profile
     * Endpoint: DELETE /admin/users/analytics/{profileId}
     */
    const deleteAnalytics = useCallback(async (profileId) => {
        if (!profileId) return;
        setLoading(true);
        setError(null);
        setSuccess(false);
        try {
            await axios.delete(`/admin/users/analytics/${profileId}`);
            setSuccess(true);
            setAnalytics(null);
            return true;
        } catch (err) {
            const errorMsg = handleError(err);
            setError(errorMsg);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const resetState = useCallback(() => {
        setError(null);
        setSuccess(false);
        setLoading(false);
    }, []);

    return {
        loading,
        error,
        success,
        analytics,
        createAnalytics,
        getAnalytics,
        updateAnalytics,
        deleteAnalytics,
        resetState
    };
};

export default useAdminUserAnalytics;
