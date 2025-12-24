import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Megaphone,
    Search,
    Filter,
    Check,
    X,
    AlertCircle,
    Loader2,
    TrendingUp,
    Activity,
    Calendar,
    CheckCircle2,
    User,
    MoreVertical,
    PlayCircle,
    Music2,
    ListMusic
} from 'lucide-react';
import AdminSidebar from '../components/Sidebar';
import { usePromotions } from '../hooks/usePromotions';

const AppPromotionsPage = () => {
    const navigate = useNavigate();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // Local state for filters
    const [filters, setFilters] = useState({
        active: 'all', // 'all', 'true', 'false'
        type: 'all',
        search: ''
    });

    const {
        appPromotions,
        isLoading,
        error,
        updateSuccess,
        fetchAppPromotions,
        updateAppPromotionStatus,
        resetError
    } = usePromotions();

    // Initial fetch
    useEffect(() => {
        fetchAppPromotions();
    }, [fetchAppPromotions]);

    // Derived filtered data (client-side filtering for search, API for others if needed)
    // Assuming API handles filters, but for search we might do it client side if API doesn't support it yet
    const filteredPromotions = Array.isArray(appPromotions) ? appPromotions.filter(promo => {
        const matchesSearch = filters.search === '' ||
            promo.promotion?.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
            promo.user?.username?.toLowerCase().includes(filters.search.toLowerCase()) ||
            String(promo.id).includes(filters.search);

        const matchesActive = filters.active === 'all' || String(promo.active) === filters.active;
        // Add type filter if available in data

        return matchesSearch && matchesActive;
    }) : [];

    const handleStatusToggle = async (id, currentStatus) => {
        if (window.confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this promotion?`)) {
            await updateAppPromotionStatus(id, !currentStatus);
        }
    };

    // Stats calculation
    const stats = {
        total: appPromotions.length,
        active: appPromotions.filter(p => p.active).length,
        revenue: appPromotions.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0)
    };

    const handlePageChange = (pageId) => {
        // Map sidebar IDs to routes
        const routes = {
            'users': '/admin/users',
            'distribution': '/admin/distribution',
            'promotion': '/admin/promotion',
            'global-distribution': '/admin-global-distribution',
            'app-promotions': '/admin-app-promotions',
            // ... add other routes as needed
        };
        if (routes[pageId]) navigate(routes[pageId]);
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <AdminSidebar
                currentPage="app-promotions"
                onPageChange={handlePageChange}
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />

            <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>

                {/* Mobile Header */}
                <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 bg-gray-100"
                            >
                                <Megaphone size={22} />
                            </button>
                            <h1 className="text-xl font-bold text-gray-900">In-App Promotions</h1>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-4 lg:p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">In-App Promotions</h1>
                        <p className="text-gray-500 mt-1">Manage boosted posts and profile promotions</p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                    <Megaphone size={24} />
                                </div>
                                <span className="text-xs font-semibold px-2 py-1 bg-gray-100 rounded-lg text-gray-600">Total</span>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                            <p className="text-sm text-gray-500 mt-1">Total transactions</p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                                    <Activity size={24} />
                                </div>
                                <span className="text-xs font-semibold px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg">Active</span>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{stats.active}</p>
                            <p className="text-sm text-gray-500 mt-1">Currently running</p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                                    <TrendingUp size={24} />
                                </div>
                                <span className="text-xs font-semibold px-2 py-1 bg-purple-100 text-purple-700 rounded-lg">Revenue</span>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">₦{stats.revenue.toLocaleString()}</p>
                            <p className="text-sm text-gray-500 mt-1">Total revenue generated</p>
                        </div>
                    </div>

                    {/* Filters & Search */}
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="flex gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                            <div className="flex items-center space-x-2">
                                <Filter size={18} className="text-gray-400" />
                                <select
                                    value={filters.active}
                                    onChange={(e) => setFilters({ ...filters, active: e.target.value })}
                                    className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-[#2d7a63] focus:border-[#2d7a63] block p-2.5 outline-none"
                                >
                                    <option value="all">All Status</option>
                                    <option value="true">Active</option>
                                    <option value="false">Inactive</option>
                                </select>
                            </div>
                        </div>

                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search user or ID..."
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2d7a63] transition-all text-gray-900"
                            />
                        </div>
                    </div>

                    {/* Notification Messages */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-2 border border-red-100">
                            <AlertCircle size={18} />
                            {error}
                            <button onClick={resetError} className="ml-auto"><X size={16} /></button>
                        </div>
                    )}

                    {updateSuccess && (
                        <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-xl flex items-center gap-2 border border-emerald-100 animate-fade-in-down">
                            <CheckCircle2 size={18} />
                            Update successful!
                        </div>
                    )}

                    {/* Data Table */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Package / Post</th>
                                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan="7" className="p-8 text-center">
                                                <Loader2 className="animate-spin mx-auto text-gray-300" size={32} />
                                                <p className="text-gray-400 mt-2">Loading promotions...</p>
                                            </td>
                                        </tr>
                                    ) : filteredPromotions.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="p-8 text-center text-gray-500">
                                                No promotions found matching your filters.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredPromotions.map((promo) => (
                                            <tr key={promo.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="p-4 text-sm font-medium text-gray-500">#{promo.id}</td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 overflow-hidden">
                                                            {promo.user?.profile_image ? (
                                                                <img src={promo.user.profile_image} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <User size={14} />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">{promo.user?.username || 'Unknown User'}</p>
                                                            <p className="text-xs text-gray-500">{promo.user?.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {promo.promotion?.title || 'Single Boost'}
                                                        </span>
                                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                                            {/* Icon based on type/category if available */}
                                                            {promo.post_id ? <PlayCircle size={10} /> : <TrendingUp size={10} />}
                                                            {promo.post_id ? `Post #${promo.post_id}` : 'Profile Promo'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-sm font-bold text-gray-900">
                                                    ₦{Number(promo.amount).toLocaleString()}
                                                </td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${promo.active
                                                            ? 'bg-emerald-100 text-emerald-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {promo.active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-sm text-gray-500">
                                                    {new Date(promo.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <button
                                                        onClick={() => handleStatusToggle(promo.id, promo.active)}
                                                        className={`p-2 rounded-lg transition-colors ${promo.active
                                                                ? 'text-red-600 hover:bg-red-50'
                                                                : 'text-emerald-600 hover:bg-emerald-50'
                                                            }`}
                                                        title={promo.active ? "Deactivate" : "Activate"}
                                                    >
                                                        {promo.active ? <X size={18} /> : <Check size={18} />}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination if needed */}
                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center text-sm text-gray-500">
                            <span>Showing {filteredPromotions.length} results</span>
                            {/* Add Pagination controls here if API supports it */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppPromotionsPage;
