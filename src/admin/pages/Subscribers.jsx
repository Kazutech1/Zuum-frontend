import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Menu,
    Search,
    ChevronLeft,
    ChevronRight,
    Users,
    BarChart2,
    Edit3,
    Save,
    X,
    Plus,
    TrendingUp,
    Music,
    Globe,
    DollarSign,
    Activity
} from 'lucide-react';
import AdminSidebar from '../components/Sidebar';
import useAdminSubscribedUsers from '../hooks/user/useAdminSubscribedUsers';
import useAdminUserAnalytics from '../hooks/user/useAdminUserAnalytics';

const AdminSubscribersPage = () => {
    const navigate = useNavigate();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Hooks
    const {
        subscribedUsers: apiSubscribedUsers,
        loading: listLoading,
        fetchSubscribedUsers
    } = useAdminSubscribedUsers();

    const {
        analytics,
        loading: analyticsLoading,
        getAnalytics,
        updateAnalytics,
        createAnalytics
    } = useAdminUserAnalytics();

    // Local state
    const [userList, setUserList] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [manualProfileId, setManualProfileId] = useState('');

    // Analytics Form State
    // Analytics Form State
    const [hasAnalyticsData, setHasAnalyticsData] = useState(false);
    const [analyticsForm, setAnalyticsForm] = useState({
        total_streams: 0,
        revenue: 0,
        listeners: 0,
        engagement: 0,
        top_songs: [],
        top_countries: []
    });

    // Dummy Data for fallback
    const dummySubscribers = [
        { id: 101, username: 'artist_supreme', email: 'artist@example.com', firstname: 'John', lastname: 'Doe', plan: 'Premium', profile_id: 5 },
        { id: 102, username: 'beat_master', email: 'beats@example.com', firstname: 'Sarah', lastname: 'Smith', plan: 'Pro', profile_id: 12 },
        { id: 103, username: 'melody_queen', email: 'melody@example.com', firstname: 'Emily', lastname: 'Jones', plan: 'Basic', profile_id: 8 },
        { id: 104, username: 'rap_god_local', email: 'rap@example.com', firstname: 'Mike', lastname: 'Brown', plan: 'Premium', profile_id: 15 },
        { id: 105, username: 'producer_x', email: 'prod@example.com', firstname: 'Alex', lastname: 'Wilson', plan: 'Pro', profile_id: 22 },
    ];

    useEffect(() => {
        // Try to fetch real data
        fetchSubscribedUsers()
            .then(data => {
                if (!data || data.length === 0) {
                    console.log("Using dummy data for subscribers list");
                    setUserList(dummySubscribers);
                } else {
                    setUserList(data);
                }
            })
            .catch(() => {
                console.log("Error fetching, falling back to dummy data");
                setUserList(dummySubscribers);
            });
    }, [fetchSubscribedUsers]);

    // Handler for Analytics Button
    const handleOpenAnalytics = async (user) => {
        setSelectedUser(user);
        setManualProfileId(user.profile_id || '');
        setIsEditMode(false);

        if (user.profile_id) {
            await fetchAndSetAnalytics(user.profile_id);
        } else {
            // Reset form if no profile ID (shouldn't happen with valid users but good safety)
            resetAnalyticsForm();
        }

        setIsAnalyticsModalOpen(true);
    };

    const fetchAndSetAnalytics = async (id) => {
        const data = await getAnalytics(id);
        if (data) {
            setHasAnalyticsData(true);
            setAnalyticsForm({
                total_streams: data.total_streams || 0,
                revenue: data.revenue || 0,
                listeners: data.listeners || 0,
                engagement: data.engagement || 0,
                top_songs: data.top_songs || [],
                top_countries: data.top_countries || []
            });
        } else {
            setHasAnalyticsData(false);
            // Reset to clean state for creation
            setAnalyticsForm({
                total_streams: 0,
                revenue: 0,
                listeners: 0,
                engagement: 0,
                top_songs: [],
                top_countries: []
            });
        }
    };

    const handleManualProfileSearch = async () => {
        if (!manualProfileId) return;
        await fetchAndSetAnalytics(manualProfileId);

        // Strictly use the ID input, do not try to resolve user
        setSelectedUser({
            username: `Profile #${manualProfileId}`,
            email: 'Manual Search',
            profile_id: manualProfileId
        });
    };

    const handleCreateAnalytics = () => {
        // Initialize with zeroes or defaults if preferred, and enable edit mode
        setHasAnalyticsData(true);
        setIsEditMode(true);
        setAnalyticsForm({
            total_streams: 0,
            revenue: 0,
            listeners: 0,
            engagement: 0,
            top_songs: [
                { name: "Song A", percentage: 0 },
            ],
            top_countries: [
                { name: "Country A", flag: "🏳️", percentage: 0 }
            ]
        });
    };

    const handleSaveAnalytics = async () => {
        if (!manualProfileId) return;

        // Check if we are updating or creating (simplified logic: if analytics exist, update)
        if (analytics) {
            await updateAnalytics(manualProfileId, analyticsForm);
        } else {
            await createAnalytics({ ...analyticsForm, profile_id: manualProfileId });
        }
        setIsEditMode(false);
        // Refresh
        await fetchAndSetAnalytics(manualProfileId);
    };

    const handleInputChange = (field, value) => {
        setAnalyticsForm(prev => ({
            ...prev,
            [field]: value
        }));
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
        'subscribers-list': '/admin-subscribers',
        transactions: '/admin-transactions',
        'app-promotions': '/admin-app-promotions',
    };

    const handlePageChange = (pageId) => {
        const targetRoute = adminRoutes[pageId];
        if (targetRoute) {
            navigate(targetRoute);
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            <AdminSidebar
                currentPage="subscribers-list"
                onPageChange={handlePageChange}
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />

            <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
                } overflow-hidden`}>

                {/* Header */}
                <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                            className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                        >
                            <Menu size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Subscribers List</h1>
                            <p className="text-sm text-gray-500">Manage active subscriptions & analytics</p>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                    {/* List */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-semibold text-gray-700">Active Subscribers</h3>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search subscribers..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#2d7a63] w-64 text-gray-900"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-white text-xs uppercase text-gray-500 border-b border-gray-100">
                                        <th className="px-6 py-4 font-semibold">User</th>
                                        <th className="px-6 py-4 font-semibold">Plan</th>
                                        <th className="px-6 py-4 font-semibold text-right">Profile ID</th>
                                        <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 text-sm">
                                    {userList.filter(u => u.username.toLowerCase().includes(searchTerm.toLowerCase())).map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 bg-[#2d7a63]/10 text-[#2d7a63] rounded-full flex items-center justify-center font-bold">
                                                        {user.username[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{user.firstname} {user.lastname}</p>
                                                        <p className="text-gray-500 text-xs">@{user.username}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                                                    {user.plan || 'Standard'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono text-gray-500">
                                                {user.profile_id || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleOpenAnalytics(user)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2d7a63] text-white rounded-lg text-xs font-medium hover:bg-[#246350] transition-colors shadow-sm"
                                                >
                                                    <BarChart2 size={14} /> Analytics
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {userList.length === 0 && !listLoading && (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                                No subscribers found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>

            {/* Analytics Modal */}
            {isAnalyticsModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-slide-up">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <BarChart2 className="text-[#2d7a63]" size={20} />
                                    Analytics for {selectedUser?.username || 'User'}
                                </h2>
                                <div className="text-xs text-gray-500">
                                    {selectedUser?.email !== 'No user details found' ? (
                                        <p>{selectedUser?.firstname} {selectedUser?.lastname} • {selectedUser?.email}</p>
                                    ) : (
                                        <p>Viewing data for Profile ID: {manualProfileId}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {/* Debug Input */}
                                <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-2 py-1">
                                    <span className="text-xs text-gray-400 font-medium">Profile ID:</span>
                                    <input
                                        type="text"
                                        className="w-12 text-xs font-mono outline-none text-center text-gray-900"
                                        value={manualProfileId}
                                        onChange={e => setManualProfileId(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleManualProfileSearch()}
                                    />
                                    <button onClick={handleManualProfileSearch} className="text-gray-400 hover:text-[#2d7a63]">
                                        <Search size={14} />
                                    </button>
                                </div>

                                <button
                                    onClick={() => setIsEditMode(!isEditMode)}
                                    className={`p-2 rounded-lg transition-colors ${isEditMode ? 'bg-[#2d7a63] text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                                >
                                    <Edit3 size={18} />
                                </button>
                                <button onClick={() => setIsAnalyticsModalOpen(false)} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                            {analyticsLoading ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                    <div className="w-10 h-10 border-4 border-gray-200 border-t-[#2d7a63] rounded-full animate-spin mb-4"></div>
                                    Loading data...
                                </div>
                            ) : !hasAnalyticsData ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                        <BarChart2 className="text-gray-400" size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Analytics Found</h3>
                                    <p className="text-gray-500 max-w-sm mb-6">
                                        This profile doesn't have any analytics data yet. You can create a new analytics record for them.
                                    </p>
                                    <button
                                        onClick={handleCreateAnalytics}
                                        className="px-6 py-3 bg-[#2d7a63] text-white rounded-xl font-bold hover:bg-[#256652] shadow-lg shadow-[#2d7a63]/20 flex items-center gap-2 transition-all transform hover:scale-105"
                                    >
                                        <Plus size={20} /> Create Analytics
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Key Metrics Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <MetricCard
                                            label="Total Streams"
                                            value={analyticsForm.total_streams}
                                            icon={Music}
                                            color="blue"
                                            isEdit={isEditMode}
                                            onChange={(v) => handleInputChange('total_streams', v)}
                                        />
                                        <MetricCard
                                            label="Revenue"
                                            value={analyticsForm.revenue}
                                            icon={DollarSign}
                                            color="green"
                                            prefix="$"
                                            isEdit={isEditMode}
                                            onChange={(v) => handleInputChange('revenue', v)}
                                        />
                                        <MetricCard
                                            label="Listeners"
                                            value={analyticsForm.listeners}
                                            icon={Users}
                                            color="purple"
                                            isEdit={isEditMode}
                                            onChange={(v) => handleInputChange('listeners', v)}
                                        />
                                        <MetricCard
                                            label="Engagement"
                                            value={analyticsForm.engagement}
                                            icon={Activity}
                                            color="orange"
                                            suffix="%"
                                            isEdit={isEditMode}
                                            onChange={(v) => handleInputChange('engagement', v)}
                                        />
                                    </div>

                                    {/* Charts Section */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Top Songs Chart */}
                                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                            <div className="flex justify-between items-center mb-4">
                                                <h4 className="font-bold text-gray-800 flex items-center gap-2">
                                                    <Music size={16} className="text-[#2d7a63]" /> Top Songs
                                                </h4>
                                                {isEditMode && (
                                                    <button
                                                        onClick={() => setAnalyticsForm(prev => ({
                                                            ...prev,
                                                            top_songs: [...prev.top_songs, { name: "New Song", percentage: 0 }]
                                                        }))}
                                                        className="text-xs flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-gray-700 font-medium transition-colors"
                                                    >
                                                        <Plus size={12} /> Add
                                                    </button>
                                                )}
                                            </div>

                                            <div className="space-y-4">
                                                {analyticsForm.top_songs.map((song, idx) => (
                                                    <div key={idx} className="relative group">
                                                        {isEditMode ? (
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <input
                                                                    type="text"
                                                                    value={song.name}
                                                                    onChange={(e) => {
                                                                        const newSongs = [...analyticsForm.top_songs];
                                                                        newSongs[idx].name = e.target.value;
                                                                        setAnalyticsForm(prev => ({ ...prev, top_songs: newSongs }));
                                                                    }}
                                                                    className="flex-1 text-sm text-gray-900 border border-gray-300 rounded px-2 py-1 outline-none focus:border-[#2d7a63]"
                                                                    placeholder="Song Name"
                                                                />
                                                                <input
                                                                    type="number"
                                                                    value={song.percentage}
                                                                    onChange={(e) => {
                                                                        const newSongs = [...analyticsForm.top_songs];
                                                                        newSongs[idx].percentage = Number(e.target.value);
                                                                        setAnalyticsForm(prev => ({ ...prev, top_songs: newSongs }));
                                                                    }}
                                                                    className="w-16 text-sm text-gray-900 border border-gray-300 rounded px-2 py-1 outline-none focus:border-[#2d7a63]"
                                                                    placeholder="%"
                                                                    min="0" max="100"
                                                                />
                                                                <button
                                                                    onClick={() => {
                                                                        const newSongs = analyticsForm.top_songs.filter((_, i) => i !== idx);
                                                                        setAnalyticsForm(prev => ({ ...prev, top_songs: newSongs }));
                                                                    }}
                                                                    className="text-red-400 hover:text-red-600 p-1"
                                                                >
                                                                    <X size={14} />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex justify-between text-sm mb-1">
                                                                <span className="font-medium text-gray-700">{song.name}</span>
                                                                <span className="text-gray-500">{Number(song.percentage)}%</span>
                                                            </div>
                                                        )}

                                                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-500"
                                                                style={{ width: `${Math.min(song.percentage, 100)}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                ))}
                                                {analyticsForm.top_songs.length === 0 && <p className="text-gray-400 text-sm italic py-2 text-center">No song data</p>}
                                            </div>
                                        </div>

                                        {/* Top Countries Chart */}
                                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                            <div className="flex justify-between items-center mb-4">
                                                <h4 className="font-bold text-gray-800 flex items-center gap-2">
                                                    <Globe size={16} className="text-[#2d7a63]" /> Top Countries
                                                </h4>
                                                {isEditMode && (
                                                    <button
                                                        onClick={() => setAnalyticsForm(prev => ({
                                                            ...prev,
                                                            top_countries: [...prev.top_countries, { name: "Country", flag: "🏳️", percentage: 0 }]
                                                        }))}
                                                        className="text-xs flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-gray-700 font-medium transition-colors"
                                                    >
                                                        <Plus size={12} /> Add
                                                    </button>
                                                )}
                                            </div>

                                            <div className="space-y-4">
                                                {analyticsForm.top_countries.map((country, idx) => (
                                                    <div key={idx} className="relative">
                                                        {isEditMode ? (
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <input
                                                                    type="text"
                                                                    value={country.flag}
                                                                    onChange={(e) => {
                                                                        const newCountries = [...analyticsForm.top_countries];
                                                                        newCountries[idx].flag = e.target.value;
                                                                        setAnalyticsForm(prev => ({ ...prev, top_countries: newCountries }));
                                                                    }}
                                                                    className="w-10 text-center text-sm text-gray-900 border border-gray-300 rounded px-2 py-1 outline-none focus:border-[#2d7a63]"
                                                                    placeholder="Flag"
                                                                />
                                                                <input
                                                                    type="text"
                                                                    value={country.name}
                                                                    onChange={(e) => {
                                                                        const newCountries = [...analyticsForm.top_countries];
                                                                        newCountries[idx].name = e.target.value;
                                                                        setAnalyticsForm(prev => ({ ...prev, top_countries: newCountries }));
                                                                    }}
                                                                    className="flex-1 text-sm text-gray-900 border border-gray-300 rounded px-2 py-1 outline-none focus:border-[#2d7a63]"
                                                                    placeholder="Country Name"
                                                                />
                                                                <input
                                                                    type="number"
                                                                    value={country.percentage}
                                                                    onChange={(e) => {
                                                                        const newCountries = [...analyticsForm.top_countries];
                                                                        newCountries[idx].percentage = Number(e.target.value);
                                                                        setAnalyticsForm(prev => ({ ...prev, top_countries: newCountries }));
                                                                    }}
                                                                    className="w-16 text-sm text-gray-900 border border-gray-300 rounded px-2 py-1 outline-none focus:border-[#2d7a63]"
                                                                    placeholder="%"
                                                                    min="0" max="100"
                                                                />
                                                                <button
                                                                    onClick={() => {
                                                                        const newCountries = analyticsForm.top_countries.filter((_, i) => i !== idx);
                                                                        setAnalyticsForm(prev => ({ ...prev, top_countries: newCountries }));
                                                                    }}
                                                                    className="text-red-400 hover:text-red-600 p-1"
                                                                >
                                                                    <X size={14} />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex justify-between text-sm mb-1">
                                                                <span className="font-medium text-gray-700 flex items-center gap-2">
                                                                    <span className="text-xs bg-gray-100 px-1 rounded">{country.flag}</span> {country.name}
                                                                </span>
                                                                <span className="text-gray-500">{Number(country.percentage)}%</span>
                                                            </div>
                                                        )}

                                                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-500"
                                                                style={{ width: `${Math.min(country.percentage, 100)}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                ))}
                                                {analyticsForm.top_countries.length === 0 && <p className="text-gray-400 text-sm italic py-2 text-center">No country data</p>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer Controls */}
                        {isEditMode && (
                            <div className="p-4 border-t border-gray-200 bg-white flex justify-end gap-3">
                                <button
                                    onClick={() => setIsEditMode(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 font-medium hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveAnalytics}
                                    className="px-4 py-2 bg-[#2d7a63] text-white rounded-lg font-bold hover:bg-[#256652] shadow-lg shadow-[#2d7a63]/20 flex items-center gap-2"
                                >
                                    <Save size={18} /> Save Changes
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper Component for Metrics
const MetricCard = ({ label, value, icon: Icon, color, prefix = '', suffix = '', isEdit, onChange }) => {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        green: 'bg-green-50 text-green-600 border-green-100',
        purple: 'bg-purple-50 text-purple-600 border-purple-100',
        orange: 'bg-orange-50 text-orange-600 border-orange-100',
    };

    return (
        <div className={`p-4 rounded-xl border ${colorClasses[color]} bg-white shadow-sm`}>
            <div className="flex justify-between items-start mb-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
                <Icon size={18} className={`text-${color}-500`} />
            </div>
            {isEdit ? (
                <input
                    type="number"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full font-bold text-xl bg-white border border-gray-300 rounded px-2 py-1 outline-none focus:ring-2 focus:ring-[#2d7a63] text-gray-900"
                />
            ) : (
                <h3 className="text-2xl font-bold text-gray-900">
                    {prefix}{Number(value).toLocaleString()}{suffix}
                </h3>
            )}
        </div>
    );
};

export default AdminSubscribersPage;
