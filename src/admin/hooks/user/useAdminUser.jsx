import { useState, useCallback } from "react";
import axios from "axios";

// Base URL is assumed to include /api if configured globally,
// or we rely on the proxy/base configuration. 
// User requested removing /api from the specific paths here.

const useAdminUser = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const [users, setUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [pagination, setPagination] = useState({
        total: 0,
        currentPage: 1,
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
        return "Network error. Please loop check your connection.";
    };

    /**
     * Fetch all users with optional parameters
     * Endpoint: GET /admin/users
     */
    const fetchUsers = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get("/admin/users", { params });

            const { users: fetchedUsers, total, currentPage, totalPages } = response.data;

            setUsers(fetchedUsers || []);
            setPagination({
                total: total || 0,
                currentPage: currentPage || 1,
                totalPages: totalPages || 1
            });

            return fetchedUsers;
        } catch (err) {
            const errorMsg = handleError(err);
            setError(errorMsg);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Fetch a single user by ID
     * Endpoint: GET /admin/users/:userId
     */
    const fetchUserById = useCallback(async (userId) => {
        if (!userId) return;

        setLoading(true);
        setError(null);
        setCurrentUser(null);

        try {
            const response = await axios.get(`/admin/users/${userId}`);
            const userData = response.data?.data || response.data;
            setCurrentUser(userData);
            return userData;
        } catch (err) {
            const errorMsg = handleError(err);
            setError(errorMsg);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Delete a user by ID
     * Endpoint: DELETE /admin/users/:userId
     */
    const deleteUser = useCallback(async (userId) => {
        if (!userId) return;

        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await axios.delete(`/admin/users/${userId}`);

            if (response.status === 200 || response.status === 204) {
                setSuccess(true);
                // Optimistically remove user from local list if present
                setUsers(prev => prev.filter(u => u.id !== userId));
                return true;
            }
            return false;
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
        users,
        currentUser,
        pagination,
        fetchUsers,
        fetchUserById,
        deleteUser,
        resetState
    };
};

export default useAdminUser;
