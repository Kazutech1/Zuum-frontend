import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Search,
  Menu,
  Filter,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  Shield,
  AlertTriangle,
  RefreshCw,
  Wallet,
  TrendingUp,
  TrendingDown,
  Building2
} from 'lucide-react';
import AdminSidebar from '../components/Sidebar';
import useAdminUser from '../hooks/user/useAdminUser';

const AdminUsersPage = () => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'deactivated'
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const {
    loading,
    error,
    success,
    users,
    currentUser,
    fetchUsers,
    fetchUserById,
    deleteUser,
    resetState
  } = useAdminUser();

  // Initial fetch
  useEffect(() => {
    fetchUsers({ limit: 1000 });
  }, [fetchUsers]);

  // Handle successful delete
  useEffect(() => {
    if (success) {
      // Close modal and reset state after a short delay or immediately
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      // Ideally, we'd show a toast here. For now, the hook updates the list optimistically.
    }
  }, [success]);

  // Filter users
  const filteredUsers = useMemo(() => {
    if (!users) return [];

    const searchLower = searchTerm.toLowerCase();
    return users.filter(user => {
      const matchesSearch = (
        user.username?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.firstname?.toLowerCase().includes(searchLower) ||
        user.lastname?.toLowerCase().includes(searchLower) ||
        user.id?.toString().includes(searchLower)
      );

      // Note: 'deactivated' field might not be consistent, check if API returns it. 
      // Assuming 'deactivated' boolean or similar status field.
      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'active' && !user.deactivated) ||
        (statusFilter === 'deactivated' && user.deactivated);

      return matchesSearch && matchesStatus;
    });
  }, [users, searchTerm, statusFilter]);

  // Pagination (Client-side for now as we fetch all users typically, or standard pagination)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const totalUsers = filteredUsers.length;
  const totalPages = Math.ceil(totalUsers / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + pageSize);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleViewUser = async (user) => {
    setSelectedUser(user);
    await fetchUserById(user.id);
  };

  const handleBackToList = () => {
    setSelectedUser(null);
    resetState();
  };

  const openDeleteModal = (user, e) => {
    e.stopPropagation();
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (userToDelete) {
      await deleteUser(userToDelete.id);
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
    'subscribers-list': '/admin-subscribers',
  };

  const handleAdminPageChange = (pageId) => {
    const targetRoute = adminRoutes[pageId];
    if (targetRoute) {
      navigate(targetRoute);
    }
  };

  // Helper to get initials
  const getInitials = (user) => {
    if (!user) return 'U';
    return `${user.firstname?.[0] || ''}${user.lastname?.[0] || ''}`.toUpperCase() || user.username?.[0]?.toUpperCase() || 'U';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount || 0);
  };

  const displayUser = currentUser || selectedUser;

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <AdminSidebar
        currentPage="users"
        onPageChange={handleAdminPageChange}
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
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">User Management</h1>
              <p className="text-sm text-gray-500">View and manage all registered users</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchUsers({ limit: 1000 })}
              className="p-2 text-gray-400 hover:text-[#2d7a63] hover:bg-gray-50 rounded-full transition-colors"
              title="Refresh List"
            >
              <RefreshCw size={18} />
            </button>
            <div className="h-8 w-8 rounded-full bg-[#2d7a63] text-white flex items-center justify-center font-bold shadow-sm">
              A
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">

          {selectedUser ? (
            // --- USER DETAIL VIEW ---
            <div className="max-w-5xl mx-auto animate-fade-in">
              <button
                onClick={handleBackToList}
                className="mb-6 flex items-center text-sm font-medium text-gray-600 hover:text-[#2d7a63] transition-colors"
              >
                <ChevronLeft size={16} className="mr-1" /> Back to Users
              </button>

              {/* Profile Header Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                <div className="h-32 bg-gradient-to-r from-[#2d7a63] to-[#1e5846]"></div>
                <div className="px-8 pb-8">
                  <div className="relative flex justify-between items-end -mt-12 mb-6">
                    <div className="flex items-end">
                      <div className="h-24 w-24 rounded-2xl ring-4 ring-white bg-white shadow-md overflow-hidden mr-4">
                        {displayUser.image ? (
                          <img src={displayUser.image} alt="Profile" className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full bg-gray-100 flex items-center justify-center text-2xl font-bold text-gray-400">
                            {getInitials(displayUser)}
                          </div>
                        )}
                      </div>
                      <div className="mb-1">
                        <h2 className="text-2xl font-bold text-gray-900">{displayUser.firstname} {displayUser.lastname}</h2>
                        <p className="text-gray-500">@{displayUser.username}</p>
                      </div>
                    </div>
                    <div className="flex gap-3 mb-1">
                      <button
                        onClick={(e) => openDeleteModal(displayUser, e)}
                        className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                      >
                        <Trash2 size={16} /> Delete User
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        <Mail size={18} />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs text-gray-500 font-medium">Email Address</p>
                        <p className="text-sm font-semibold text-gray-900 truncate" title={displayUser.email}>{displayUser.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                        <Phone size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Phone</p>
                        <p className="text-sm font-semibold text-gray-900">{displayUser.phonenumber || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                        <Calendar size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Joined</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {displayUser.created_at ? new Date(displayUser.created_at).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats & Identity Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Financial Stats */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Wallet className="text-[#2d7a63]" size={20} /> Financials
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                      <span className="text-gray-500 text-sm">Wallet Balance</span>
                      <span className="font-bold text-gray-900">{formatCurrency(displayUser.balance)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                      <span className="text-gray-500 text-sm">USDT Balance</span>
                      <span className="font-bold text-gray-900">${displayUser.usdt_balance || 0}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                      <span className="text-gray-500 text-sm">Total Deposits</span>
                      <span className="font-bold text-green-600 flex items-center gap-1">
                        <TrendingUp size={14} /> {formatCurrency(displayUser.total_deposits)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 last:border-0">
                      <span className="text-gray-500 text-sm">Total Withdrawals</span>
                      <span className="font-bold text-red-600 flex items-center gap-1">
                        <TrendingDown size={14} /> {formatCurrency(displayUser.total_withdrawals)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Identity Info */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:col-span-2">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Shield className="text-[#2d7a63]" size={20} /> Account Status & Identity
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Identity Type</p>
                      <div className="flex items-center gap-2">
                        <Building2 className="text-gray-400" size={16} />
                        <span className="font-semibold text-gray-900 capitalize">{displayUser.identity || 'User'}</span>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Status</p>
                      <div className="flex items-center gap-2">
                        {displayUser.deactivated ? (
                          <XCircle className="text-red-500" size={16} />
                        ) : (
                          <CheckCircle2 className="text-green-500" size={16} />
                        )}
                        <span className={`font-semibold ${displayUser.deactivated ? 'text-red-600' : 'text-green-600'}`}>
                          {displayUser.deactivated ? 'Deactivated' : 'Active'}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Email Verification</p>
                      <div className="flex items-center gap-2">
                        {displayUser.email_verified ? (
                          <CheckCircle2 className="text-blue-500" size={16} />
                        ) : (
                          <AlertTriangle className="text-amber-500" size={16} />
                        )}
                        <span className={`font-semibold ${displayUser.email_verified ? 'text-blue-600' : 'text-amber-600'}`}>
                          {displayUser.email_verified ? 'Verified' : 'Unverified'}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Subscription</p>
                      <div className="flex items-center gap-2">
                        <CreditCard className="text-purple-500" size={16} />
                        <span className="font-semibold text-gray-900 capitalize">
                          {displayUser.subscription_status || 'Free Tier'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            // --- USER LIST VIEW ---
            <div className="max-w-[1400px] mx-auto animate-fade-in">

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Total Users</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{users.length}</h3>
                  </div>
                  <div className="h-10 w-10 bg-[#2d7a63]/10 text-[#2d7a63] rounded-lg flex items-center justify-center">
                    <User size={20} />
                  </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Active Users</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{users.filter(u => !u.deactivated).length}</h3>
                  </div>
                  <div className="h-10 w-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                    <CheckCircle2 size={20} />
                  </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Suspended</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{users.filter(u => u.deactivated).length}</h3>
                  </div>
                  <div className="h-10 w-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
                    <XCircle size={20} />
                  </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Verified</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{users.filter(u => u.email_verified).length}</h3>
                  </div>
                  <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                    <Shield size={20} />
                  </div>
                </div>
              </div>

              {/* Filters & Actions */}
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full sm:w-96">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search by name, email, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-[#2d7a63] focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                    <Filter size={16} className="text-gray-500" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="bg-transparent text-sm text-gray-700 font-medium outline-none cursor-pointer"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="deactivated">Deactivated</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                {loading ? (
                  <div className="p-12 flex flex-col items-center justify-center text-gray-500">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2d7a63] mb-4"></div>
                    <p>Loading users...</p>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-12 text-center text-gray-500 bg-gray-50">
                    <User className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-lg font-medium text-gray-900">No users found</p>
                    <p className="text-sm">Try adjusting your search or filters.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                          <th className="px-6 py-4">User ID</th>
                          <th className="px-6 py-4">User Info</th>
                          <th className="px-6 py-4">Account Type</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4">Joined</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {paginatedUsers.map((user) => (
                          <tr
                            key={user.id}
                            className="hover:bg-gray-50/80 transition-colors group cursor-pointer"
                            onClick={() => handleViewUser(user)}
                          >
                            <td className="px-6 py-4 font-mono text-gray-500 text-xs">
                              {user.id}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                                  {user.image ? (
                                    <img src={user.image} alt={user.username} className="h-full w-full object-cover" />
                                  ) : (
                                    <span className="text-sm font-bold text-gray-500">{getInitials(user)}</span>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-gray-900 truncate">{user.firstname} {user.lastname}</p>
                                  <p className="text-xs text-gray-500 truncate">@{user.username || 'unknown'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                                {user.identity || 'User'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {user.deactivated ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                  <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span> Deactivated
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                  <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span> Active
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => handleViewUser(user)}
                                  className="p-2 text-gray-400 hover:text-[#2d7a63] hover:bg-[#2d7a63]/10 rounded-lg transition-colors"
                                  title="View Details"
                                >
                                  <Eye size={18} />
                                </button>
                                <button
                                  onClick={(e) => openDeleteModal(user, e)}
                                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete User"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination */}
                {!loading && totalUsers > 0 && (
                  <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{Math.min(startIndex + pageSize, totalUsers)}</span> of <span className="font-medium">{totalUsers}</span> users
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 border border-gray-300 rounded-lg bg-white text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        // Simplified pagination logic for display
                        let p = i + 1;
                        if (totalPages > 5 && currentPage > 3) {
                          p = currentPage - 2 + i;
                        }
                        if (p > totalPages) return null;

                        return (
                          <button
                            key={p}
                            onClick={() => handlePageChange(p)}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${currentPage === p
                              ? 'bg-[#2d7a63] text-white shadow-md shadow-[#2d7a63]/20'
                              : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                              }`}
                          >
                            {p}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 border border-gray-300 rounded-lg bg-white text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-slide-up">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="text-red-600 h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete User?</h3>
              <p className="text-gray-500 mb-6">
                Are you sure you want to delete <span className="font-semibold text-gray-800">{userToDelete?.username}</span>?
                This action cannot be undone and all user data will be permanently removed.
              </p>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={18} /> Confirm Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;