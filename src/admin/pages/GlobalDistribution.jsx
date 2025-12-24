import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Globe,
    Plus,
    Search,
    Edit2,
    Trash2,
    DollarSign,
    Package,
    Check,
    X,
    Loader2,
    Filter,
    MoreVertical,
    AlertCircle,
    MonitorPlay,
    Radio,
    Music2,
    Users
} from 'lucide-react';
import AdminSidebar from '../components/Sidebar';
import useAdminPackages from '../hooks/useAdminPackages';
import UserPackagesList from '../components/UserPackagesList';

const GlobalDistributionPage = () => {
    const navigate = useNavigate();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [viewMode, setViewMode] = useState('packages'); // 'packages' or 'user_requests'
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
    const [editingPackage, setEditingPackage] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        category: 'international',
        description: '',
        price: '',
        total: '',
        duration: '',
        currency: '₦',
        features: '' // comma separated for simple input
    });

    const {
        loading,
        error,
        success,
        packages,
        fetchPackages,
        createPackage,
        updatePackage,
        deletePackage,
        resetStatus
    } = useAdminPackages();

    useEffect(() => {
        fetchPackages();
    }, [fetchPackages]);

    // Derived state for filtering
    const filteredPackages = packages.filter(pkg => {
        const matchesSearch = pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pkg.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || pkg.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Categories derived from data + static standard ones
    const categories = ['all', ...new Set(packages.map(p => p.category))].filter(Boolean);

    const handleEdit = (pkg) => {
        setEditingPackage(pkg);
        setFormData({
            name: pkg.name,
            category: pkg.category || 'international',
            description: pkg.description || '',
            price: pkg.price,
            total: pkg.total,
            duration: pkg.duration || '',
            currency: pkg.currency || '₦',
            features: Array.isArray(pkg.features) ? pkg.features.join(', ') : (pkg.features || '')
        });
        setModalMode('edit');
        setShowModal(true);
        resetStatus();
    };

    const handleCreate = () => {
        setEditingPackage(null);
        setFormData({
            name: '',
            category: 'international',
            description: '',
            price: '',
            total: '',
            duration: '',
            currency: '₦',
            features: ''
        });
        setModalMode('create');
        setShowModal(true);
        resetStatus();
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this package?')) {
            await deletePackage(id);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            ...formData,
            // Convert features string to array if needed, or keep as string depending on backend expectation.
            // Based on API response shown earlier, features can be an array.
            // But the POST example showed a string. Let's start with array split by comma if string is provided.
            features: typeof formData.features === 'string'
                ? formData.features.split(',').map(f => f.trim()).filter(Boolean)
                : formData.features
        };

        if (modalMode === 'create') {
            await createPackage(payload);
        } else {
            await updatePackage(editingPackage.id, payload);
        }
        setShowModal(false);
    };

    // Helper to get category icon
    const getCategoryIcon = (cat) => {
        switch (cat?.toLowerCase()) {
            case 'tv': return <MonitorPlay className="w-4 h-4" />;
            case 'radio': return <Radio className="w-4 h-4" />;
            case 'playlist': return <Music2 className="w-4 h-4" />;
            default: return <Globe className="w-4 h-4" />;
        }
    };

    const adminRoutes = {
        users: '/users',
        distribution: '/addistributions',
        beat: '/adbeat',
        'beat-posts': '/admin-beat-posts',
        'audio-posts': '/admin-audio-posts',
        promotion: '/adpromotion',
        wallet: '/admin-wallet',
        cryptoWallet: '/admin-wallet-crypto',
        subscriptions: '/admin-subscriptions',
        settings: '/admin-settings',
        'zuum-news': '/admin-zuum-news',
        transactions: '/admin-transactions',
        'global-distribution': '/admin-global-distribution',
        'app-promotions': '/admin-app-promotions'
    };

    const handlePageChange = (pageId) => {
        const targetRoute = adminRoutes[pageId];
        if (targetRoute) navigate(targetRoute);
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <AdminSidebar
                currentPage="global-distribution"
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
                                <Globe size={22} />
                            </button>
                            <h1 className="text-xl font-bold text-gray-900">Global Distribution</h1>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-4 lg:p-8">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Global Distribution</h1>
                            <p className="text-gray-500 mt-1">Manage packages, prices, and distribution services</p>
                        </div>
                        <div className="flex gap-3">
                            {/* Toggle View Buttons */}
                            <div className="bg-gray-100 p-1 rounded-xl flex">
                                <button
                                    onClick={() => setViewMode('packages')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'packages'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    Packages
                                </button>
                                <button
                                    onClick={() => setViewMode('user_requests')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'user_requests'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    User Packages
                                </button>
                            </div>

                            {viewMode === 'packages' && (
                                <button
                                    onClick={handleCreate}
                                    className="bg-[#2d7a63] hover:bg-[#24614f] text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-[#2d7a63]/20 transition-all active:scale-95"
                                >
                                    <Plus size={18} />
                                    <span>Add Package</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {viewMode === 'user_requests' ? (
                        <UserPackagesList />
                    ) : (
                        <>
                            {/* Stats / Overview Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Globe size={20} /></div>
                                        <span className="text-gray-500 text-sm font-medium">Total Packages</span>
                                    </div>
                                    <p className="text-3xl font-bold text-gray-900">{packages.length}</p>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-purple-50 rounded-lg text-purple-600"><Package size={20} /></div>
                                        <span className="text-gray-500 text-sm font-medium">Active Categories</span>
                                    </div>
                                    <p className="text-3xl font-bold text-gray-900">{categories.length - 1}</p>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><DollarSign size={20} /></div>
                                        <span className="text-gray-500 text-sm font-medium">Avg. Price</span>
                                    </div>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {packages.length ? '₦' + Math.round(packages.reduce((acc, p) => acc + (Number(p.price) || 0), 0) / packages.length).toLocaleString() : '₦0'}
                                    </p>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Filters & Search - Only for Packages View */}
                    {viewMode === 'packages' && (
                        <>
                            {/* Filters & Search */}
                            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
                                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
                                    {categories.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setSelectedCategory(cat)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === cat
                                                ? 'bg-gray-900 text-white shadow-md'
                                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                                }`}
                                        >
                                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                        </button>
                                    ))}
                                </div>
                                <div className="relative w-full md:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search packages..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2d7a63] transition-all text-gray-900"
                                    />
                                </div>
                            </div>

                            {/* Notification Messages */}
                            {error && (
                                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-2 border border-red-100">
                                    <AlertCircle size={18} />
                                    {error}
                                    <button onClick={resetStatus} className="ml-auto"><X size={16} /></button>
                                </div>
                            )}
                            {success && (
                                <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-xl flex items-center gap-2 border border-emerald-100 animate-fade-in-down">
                                    <Check size={18} />
                                    {success}
                                    <button onClick={resetStatus} className="ml-auto"><X size={16} /></button>
                                </div>
                            )}

                            {/* Content Grid */}
                            {loading && packages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <Loader2 className="animate-spin text-gray-300 mb-4" size={40} />
                                    <p className="text-gray-400">Loading packages...</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {filteredPackages.map(pkg => (
                                        <div key={pkg.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden flex flex-col">
                                            <div className="p-6 flex-1">
                                                <div className="flex justify-between items-start mb-4">
                                                    <span className="px-3 py-1 rounded-full bg-gray-50 text-gray-600 text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
                                                        {getCategoryIcon(pkg.category)}
                                                        {pkg.category}
                                                    </span>
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleEdit(pkg)}
                                                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-blue-600 transition-colors"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(pkg.id)}
                                                            className="p-2 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-600 transition-colors"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <h3 className="text-lg font-bold text-gray-900 mb-2">{pkg.name}</h3>
                                                <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                                                    {pkg.description || 'No description provided'}
                                                </p>

                                                {/* Features Preview */}
                                                {pkg.features && Array.isArray(pkg.features) && pkg.features.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mb-4">
                                                        {pkg.features.slice(0, 3).map((f, i) => (
                                                            <span key={i} className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded-md border border-gray-100">
                                                                {f}
                                                            </span>
                                                        ))}
                                                        {pkg.features.length > 3 && (
                                                            <span className="text-xs text-gray-400 px-2 py-1">+{pkg.features.length - 3} more</span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-0.5">Price</p>
                                                    <p className="font-bold text-gray-900 flex items-baseline gap-1">
                                                        {pkg.currency}{Number(pkg.price).toLocaleString()}
                                                        <span className="text-xs font-normal text-gray-400 line-through">
                                                            {pkg.total > pkg.price && `${pkg.currency}${Number(pkg.total).toLocaleString()}`}
                                                        </span>
                                                    </p>
                                                </div>
                                                {pkg.duration && (
                                                    <div className="text-right">
                                                        <p className="text-xs text-gray-500 mb-0.5">Duration</p>
                                                        <p className="font-medium text-gray-700 text-sm">{pkg.duration}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-up">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-lg font-bold text-gray-900">
                                {modalMode === 'create' ? 'Add New Package' : 'Edit Package'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Package Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d7a63] focus:border-transparent outline-none transition-all text-gray-900"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Spotify Basic"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d7a63] outline-none text-gray-900"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        placeholder="e.g. playlist"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d7a63] outline-none text-gray-900"
                                        value={formData.duration}
                                        onChange={e => setFormData({ ...formData, duration: e.target.value })}
                                        placeholder="e.g. 2 weeks"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{formData.currency}</span>
                                        <input
                                            type="number"
                                            required
                                            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d7a63] outline-none text-gray-900"
                                            value={formData.price}
                                            onChange={e => setFormData({ ...formData, price: e.target.value })}
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Total (Display)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{formData.currency}</span>
                                        <input
                                            type="number"
                                            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d7a63] outline-none text-gray-900"
                                            value={formData.total}
                                            onChange={e => setFormData({ ...formData, total: e.target.value })}
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d7a63] outline-none h-20 resize-none text-gray-900"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief description of the package..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Features (comma separated)</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d7a63] outline-none text-gray-900"
                                    value={formData.features}
                                    onChange={e => setFormData({ ...formData, features: e.target.value })}
                                    placeholder="Feature 1, Feature 2, Feature 3..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#2d7a63] hover:bg-[#24614f] text-white font-bold py-3 rounded-xl shadow-lg shadow-[#2d7a63]/20 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-4"
                            >
                                {loading && <Loader2 className="animate-spin w-5 h-5" />}
                                {modalMode === 'create' ? 'Create Package' : 'Update Package'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GlobalDistributionPage;
