import { useState, useCallback } from 'react';
import axios from 'axios';

const useAdminPackages = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [packages, setPackages] = useState([]);

    /**
     * Handle API errors with appropriate messages
     */
    const handleApiError = useCallback((err, defaultMessage = "An error occurred") => {
        console.error("Packages API error:", err);
        if (err.response) {
            setError(err.response.data?.message || defaultMessage);
        } else {
            setError("Network error – please check your connection");
        }
        setSuccess(null);
    }, []);

    /**
     * Fetch all packages with optional filters
     */
    const fetchPackages = useCallback(async (filters = {}) => {
        setLoading(true);
        setError(null);
        try {
            // Construct query params from filters
            const params = {};
            if (filters.category) params.category = filters.category;
            if (filters.name) params.name = filters.name;
            if (filters.userId) params.userId = filters.userId;

            const response = await axios.get('/admin/packages', { params });
            const data = response.data?.data || [];
            setPackages(data);
            return data;
        } catch (err) {
            handleApiError(err, "Failed to fetch packages");
            return [];
        } finally {
            setLoading(false);
        }
    }, [handleApiError]);

    /**
     * Create a new package
     */
    const createPackage = useCallback(async (packageData) => {
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const response = await axios.post('/admin/packages', packageData);
            setSuccess("Package created successfully");
            // Refresh list
            await fetchPackages();
            return response.data;
        } catch (err) {
            handleApiError(err, "Failed to create package");
            return null;
        } finally {
            setLoading(false);
        }
    }, [fetchPackages, handleApiError]);

    /**
     * Update an existing package
     */
    const updatePackage = useCallback(async (id, packageData) => {
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const response = await axios.put(`/admin/packages/${id}`, packageData);
            setSuccess("Package updated successfully");

            // Optimistic update or refresh
            setPackages(prev => prev.map(pkg => pkg.id === id ? { ...pkg, ...packageData } : pkg));

            return response.data;
        } catch (err) {
            handleApiError(err, "Failed to update package");
            return null;
        } finally {
            setLoading(false);
        }
    }, [handleApiError]);

    /**
     * Update package price specifically
     */
    const updatePackagePrice = useCallback(async (id, newPrice, newTotal) => {
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const response = await axios.patch(`/admin/packages/${id}/price`, {
                newPrice,
                newTotal
            });
            setSuccess("Package price updated successfully");

            // Optimistic update
            setPackages(prev => prev.map(pkg =>
                pkg.id === id ? { ...pkg, price: newPrice, total: newTotal } : pkg
            ));

            return response.data;
        } catch (err) {
            handleApiError(err, "Failed to update package price");
            return null;
        } finally {
            setLoading(false);
        }
    }, [handleApiError]);

    /**
     * Delete a package
     */
    const deletePackage = useCallback(async (id) => {
        if (!window.confirm("Are you sure you want to delete this package?")) return false;

        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            await axios.delete(`/admin/packages/${id}`);
            setSuccess("Package deleted successfully");

            // Remove from local state
            setPackages(prev => prev.filter(pkg => pkg.id !== id));

            return true;
        } catch (err) {
            handleApiError(err, "Failed to delete package");
            return false;
        } finally {
            setLoading(false);
        }
    }, [handleApiError]);

    const resetStatus = useCallback(() => {
        setError(null);
        setSuccess(null);
    }, []);

    return {
        loading,
        error,
        success,
        packages,
        fetchPackages,
        createPackage,
        updatePackage,
        updatePackagePrice,
        deletePackage,
        resetStatus
    };
};

export default useAdminPackages;
