import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Menu,
    Search,
    Filter,
    Download,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    ArrowUpRight,
    ArrowDownLeft,
    Clock,
    CheckCircle2,
    XCircle,
    Calendar,
    CreditCard,
    DollarSign,
    Wallet,
    MoreHorizontal
} from 'lucide-react';
import AdminSidebar from '../components/Sidebar';
import useAdminTransactions from '../hooks/transactions/useAdminTransactions';

const AdminTransactionsPage = () => {
    const navigate = useNavigate();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // Filters State
    const [filters, setFilters] = useState({
        userId: '',
        type: '',
        status: '',
        currency: '',
        startDate: '',
        endDate: '',
        limit: 50
    });

    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState(''); // Local search state for debouncing if needed

    const {
        loading,
        error,
        transactions,
        summary,
        pagination,
        fetchTransactions
    } = useAdminTransactions();

    const fetchData = useCallback(() => {
        const offset = (page - 1) * filters.limit;
        fetchTransactions({
            ...filters,
            offset,
            // If searchTerm is numeric, treat as userId filter ?? Or keep separate?
            // User requested "userId" as query param.
            // Let's assume searchTerm maps to userId for now if it looks like one, or we can add a specific input.
            // For now, I'll map searchTerm to userId if it's present.
            userId: searchTerm || filters.userId
        });
    }, [page, filters, searchTerm, fetchTransactions]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPage(1); // Reset to first page on filter change
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    const handleAdminPageChange = (pageId) => {
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
            'app-promotions': '/admin-app-promotions'
        };
        const targetRoute = adminRoutes[pageId];
        if (targetRoute) navigate(targetRoute);
    };

    // Helper to format currency
    const formatCurrency = (amount, currency = 'NGN') => {
        // User requested strict check: Only explicit 'USDT' should be treated as USD.
        // Everything else defaults to NGN.
        const isUSDT = currency && currency.toString().toUpperCase().trim() === 'USDT';

        return new Intl.NumberFormat(isUSDT ? 'en-US' : 'en-NG', {
            style: 'currency',
            currency: isUSDT ? 'USD' : 'NGN',
            minimumFractionDigits: 2
        }).format(amount || 0);
    };

    // Helper for status styles
    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case 'successful':
            case 'success':
                return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'pending':
                return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'failed':
                return 'bg-red-100 text-red-700 border-red-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getTypeIcon = (type) => {
        if (type?.includes('deposit')) return <ArrowDownLeft size={16} className="text-emerald-600" />;
        if (type?.includes('withdraw')) return <ArrowUpRight size={16} className="text-red-500" />;
        if (type?.includes('subscription')) return <CreditCard size={16} className="text-purple-500" />;
        return <Wallet size={16} className="text-blue-500" />;
    };

    return (
        <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
            <AdminSidebar
                currentPage="transactions" // Assuming we add this ID to sidebar
                onPageChange={handleAdminPageChange}
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />

            <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'} overflow-hidden`}>
                {/* Header */}
                <header className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                            className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                        >
                            <Menu size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Transaction History</h1>
                            <p className="text-sm text-gray-500 mt-0.5">Global financial overview & logs</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchData}
                            disabled={loading}
                            className={`p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:text-[#2d7a63] hover:border-[#2d7a63] hover:bg-[#2d7a63]/5 transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm">
                            <Download size={16} /> Export CSV
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {/* Total Volume */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Wallet size={64} className="text-blue-600" />
                            </div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Total Transactions</p>
                            <h3 className="text-3xl font-bold text-gray-900">{summary?.total_transactions || 0}</h3>
                            <div className="mt-4 flex items-center text-xs font-medium text-blue-600 bg-blue-50 w-fit px-2 py-1 rounded-lg">
                                All time volume
                            </div>
                        </div>

                        {/* Successful */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <CheckCircle2 size={64} className="text-emerald-600" />
                            </div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Successful Volume</p>
                            <h3 className="text-3xl font-bold text-emerald-600">
                                {formatCurrency(summary?.total_successful_amount)}
                            </h3>
                            <div className="mt-4 flex items-center text-emerald-700 text-xs font-medium">
                                <span className="bg-emerald-100 px-2 py-1 rounded-lg">
                                    {summary?.successful_count || 0} transactions
                                </span>
                            </div>
                        </div>

                        {/* Pending */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Clock size={64} className="text-amber-500" />
                            </div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Pending Volume</p>
                            <h3 className="text-3xl font-bold text-amber-500">
                                {formatCurrency(summary?.total_pending_amount)}
                            </h3>
                            <div className="mt-4 flex items-center text-amber-700 text-xs font-medium">
                                <span className="bg-amber-100 px-2 py-1 rounded-lg">
                                    {summary?.pending_count || 0} transactions
                                </span>
                            </div>
                        </div>

                        {/* Failed */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <XCircle size={64} className="text-red-500" />
                            </div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Failed Volume</p>
                            <h3 className="text-3xl font-bold text-red-500">
                                {formatCurrency(summary?.total_failed_amount)}
                            </h3>
                            <div className="mt-4 flex items-center text-red-700 text-xs font-medium">
                                <span className="bg-red-100 px-2 py-1 rounded-lg">
                                    {summary?.failed_count || 0} transactions
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Filters Bar */}
                    <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mb-6 flex flex-col xl:flex-row items-center gap-4 justify-between">
                        <div className="relative w-full xl:w-96 group">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[#2d7a63] transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search by User ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#2d7a63]/20 focus:border-[#2d7a63] outline-none transition-all placeholder-gray-400 font-medium"
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                            <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
                                <CreditCard size={16} className="text-gray-500" />
                                <select
                                    value={filters.type}
                                    onChange={(e) => handleFilterChange('type', e.target.value)}
                                    className="bg-transparent text-sm text-gray-900 font-medium outline-none cursor-pointer min-w-[100px]"
                                >
                                    <option value="">All Types</option>
                                    <option value="subscription">Subscription</option>
                                    <option value="deposit">Deposit</option>
                                    <option value="withdrawal">Withdrawal</option>
                                    <option value="bank_deposit">Bank Deposit</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
                                <Filter size={16} className="text-gray-500" />
                                <select
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    className="bg-transparent text-sm text-gray-900 font-medium outline-none cursor-pointer min-w-[100px]"
                                >
                                    <option value="">All Status</option>
                                    <option value="successful">Successful</option>
                                    <option value="pending">Pending</option>
                                    <option value="failed">Failed</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
                                <DollarSign size={16} className="text-gray-500" />
                                <select
                                    value={filters.currency}
                                    onChange={(e) => handleFilterChange('currency', e.target.value)}
                                    className="bg-transparent text-sm text-gray-900 font-medium outline-none cursor-pointer min-w-[80px]"
                                >
                                    <option value="">Currency</option>
                                    <option value="NGN">NGN</option>
                                    <option value="USDT">USDT</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Data Table */}
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                        {loading && transactions.length === 0 ? (
                            <div className="p-20 flex flex-col items-center justify-center text-gray-400">
                                <div className="w-12 h-12 border-4 border-gray-100 border-t-[#2d7a63] rounded-full animate-spin mb-4"></div>
                                <p className="font-medium animate-pulse">Loading transaction logs...</p>
                            </div>
                        ) : error ? (
                            <div className="p-20 flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 text-red-500">
                                    <XCircle size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">Failed to fetch data</h3>
                                <p className="text-gray-500 mb-6">{error}</p>
                                <button
                                    onClick={fetchData}
                                    className="px-6 py-2 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50/50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                                                <th className="px-6 py-4">Transaction ID</th>
                                                <th className="px-6 py-4">User</th>
                                                <th className="px-6 py-4">Type</th>
                                                <th className="px-6 py-4">Reference</th>
                                                <th className="px-6 py-4">Amount</th>
                                                <th className="px-6 py-4">Status</th>
                                                <th className="px-6 py-4">Date</th>
                                                <th className="px-6 py-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {transactions.map((tx) => (
                                                <tr key={tx.id} className="group hover:bg-gray-50/80 transition-colors duration-200">
                                                    <td className="px-6 py-4 font-mono text-xs text-gray-500">
                                                        #{tx.id}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 border border-white shadow-sm">
                                                                {tx.user?.username?.[0]?.toUpperCase() || 'U'}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-semibold text-gray-900">{tx.user?.name || 'Unknown'}</p>
                                                                <p className="text-xs text-gray-500">{tx.user?.email || `ID: ${tx.user_id}`}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            {getTypeIcon(tx.type)}
                                                            <span className="text-sm font-medium text-gray-700 capitalize">
                                                                {tx.type?.replace(/_/g, ' ')}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                            {tx.reference || '-'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`text-sm font-bold font-mono ${tx.type?.includes('withdraw') ? 'text-red-600' : 'text-emerald-700'
                                                            }`}>
                                                            {tx.type?.includes('withdraw') ? '-' : '+'}{formatCurrency(tx.amount, tx.currency)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusStyle(tx.status)}`}>
                                                            <div className={`w-1.5 h-1.5 rounded-full ${tx.status === 'successful' ? 'bg-emerald-500' :
                                                                tx.status === 'failed' ? 'bg-red-500' : 'bg-amber-500'
                                                                }`}></div>
                                                            {tx.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm text-gray-900 font-medium">
                                                                {new Date(tx.created_at).toLocaleDateString()}
                                                            </span>
                                                            <span className="text-xs text-gray-400">
                                                                {new Date(tx.created_at).toLocaleTimeString()}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                                                            <MoreHorizontal size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {transactions.length === 0 && !loading && (
                                                <tr>
                                                    <td colSpan="8" className="px-6 py-16 text-center">
                                                        <div className="flex flex-col items-center justify-center">
                                                            <div className="bg-gray-50 p-4 rounded-full mb-3">
                                                                <Search size={24} className="text-gray-400" />
                                                            </div>
                                                            <p className="text-gray-900 font-medium">No transactions found</p>
                                                            <p className="text-sm text-gray-500">Try adjusting your filters or search terms</p>
                                                            <button
                                                                onClick={() => {
                                                                    setFilters({ userId: '', type: '', status: '', currency: '', startDate: '', endDate: '', limit: 50 });
                                                                    setSearchTerm('');
                                                                }}
                                                                className="mt-4 text-[#2d7a63] text-sm font-medium hover:underline"
                                                            >
                                                                Clear all filters
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                                    <div className="text-sm text-gray-500">
                                        Showing <span className="font-semibold text-gray-900">{filters.limit * (pagination.page || 1 - 1) + 1}</span> to <span className="font-semibold text-gray-900">{Math.min(filters.limit * (pagination.page || 1), pagination.total)}</span> of <span className="font-semibold text-gray-900">{pagination.total}</span> entries
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handlePageChange((pagination.page || 1) - 1)}
                                            disabled={(pagination.page || 1) <= 1}
                                            className="p-2 bg-white border border-gray-300 rounded-lg text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors shadow-sm"
                                        >
                                            <ChevronLeft size={16} />
                                        </button>
                                        <span className="text-sm font-medium text-gray-700 bg-white px-3 py-2 border border-gray-300 rounded-lg">
                                            Page {pagination.page || 1}
                                        </span>
                                        <button
                                            onClick={() => handlePageChange((pagination.page || 1) + 1)}
                                            disabled={(pagination.page || 1) >= (pagination.pages || 1)}
                                            className="p-2 bg-white border border-gray-300 rounded-lg text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors shadow-sm"
                                        >
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminTransactionsPage;
