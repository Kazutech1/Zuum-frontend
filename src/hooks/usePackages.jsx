import { useState, useEffect, useCallback } from "react";
import axios from "axios";

// Helper to get auth headers if needed (though public packages might not need it, but for paid ones maybe)
const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Base URL configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create a configured axios instance
const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

export const usePackages = () => {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPackages = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.get('/packages', {
                headers: getAuthHeaders()
            });

            // Handle both array and object response formats
            let packagesData = Array.isArray(response.data) ? response.data :
                response.data.packages || response.data.data || [];

            setPackages(packagesData);
        } catch (err) {
            console.error('Error fetching packages:', err);
            setError(err.response?.data?.error || err.message || 'Failed to fetch packages');
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch packages on component mount
    useEffect(() => {
        fetchPackages();
    }, [fetchPackages]);

    return {
        packages,
        loading,
        error,
        refetch: fetchPackages
    };
};

export default usePackages;
