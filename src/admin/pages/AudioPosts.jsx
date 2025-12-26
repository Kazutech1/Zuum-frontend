import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Music,
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Eye,
  User,
  Calendar,
  AlertCircle,
  X,
  Play,
  Pause,
  Headphones
} from 'lucide-react';
import AdminSidebar from '../components/Sidebar';
import { useAudio } from '../hooks/useAudio';

const AdminAudioPostsPage = () => {
  const navigate = useNavigate();
  const {
    audioPosts,
    isLoading,
    error,
    pagination,
    fetchAudioPosts,
    updateAudioStatus,
    deleteAudioPost,
    resetError,
  } = useAudio();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, pending, approved, blocked
  const [typeFilter, setTypeFilter] = useState('all'); // all, music
  const [selectedPost, setSelectedPost] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(50);

  // Audio Playback State
  const [playingId, setPlayingId] = useState(null);
  const audioRef = useRef(null);

  const actionsMenuRef = useRef(null);

  // Close actions menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target)) {
        setSelectedPost(null);
      }
    };

    if (selectedPost) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedPost]);

  // Audio Player Logic
  const togglePlay = (post) => {
    if (playingId === post.id) {
      audioRef.current.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(post.audio_upload || post.preview_audio);
      audio.onended = () => setPlayingId(null);
      audioRef.current = audio;
      audio.play().catch(e => console.error("Playback failed", e));
      setPlayingId(post.id);
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const adminRoutes = {
    users: '/admin/users',
    distribution: '/admin/distribution',
    beat: '/admin/promotion',
    'beat-posts': '/admin/beat-posts',
    'audio-posts': '/admin/audio-posts',
    promotion: '/admin/promotion',
    wallet: '/admin/wallet',
    cryptoWallet: '/admin/wallet-crypto',
    subscriptions: '/admin/subscriptions',
    settings: '/admin/settings',
    'zuum-news': '/admin/zuum-news',
  };

  const handlePageChange = (pageId) => {
    const route = adminRoutes[pageId] || `/admin/${pageId}`;
    navigate(route);
  };

  // Fetch audio on mount and when filters or page change
  useEffect(() => {
    const options = {
      limit,
      offset: (currentPage - 1) * limit,
    };

    if (statusFilter !== 'all') {
      options.status = statusFilter;
    }

    if (typeFilter !== 'all') {
      options.type = typeFilter;
    }

    fetchAudioPosts(options);
  }, [statusFilter, typeFilter, currentPage, limit, fetchAudioPosts]);

  // Stats
  const stats = useMemo(() => {
    const all = Array.isArray(audioPosts) ? audioPosts : [];
    return {
      total: pagination.total || all.length,
      pending: all.filter((p) => p.status === 'pending').length,
      approved: all.filter((p) => p.status === 'approved').length,
      blocked: all.filter((p) => p.status === 'blocked').length,
    };
  }, [audioPosts, pagination.total]);

  // Filter by search
  const filteredPosts = useMemo(() => {
    if (!Array.isArray(audioPosts)) return [];
    const term = searchTerm.toLowerCase();
    return audioPosts.filter((post) => {
      const matchesSearch =
        !term ||
        (post.title && post.title.toLowerCase().includes(term)) ||
        (post.caption && post.caption.toLowerCase().includes(term)) ||
        (post.username && post.username.toLowerCase().includes(term)) ||
        (post.artist_name && post.artist_name.toLowerCase().includes(term));
      return matchesSearch;
    });
  }, [audioPosts, searchTerm]);

  // Status badge
  const getStatusBadge = (status) => {
    const badges = {
      pending: {
        bg: 'bg-amber-100',
        text: 'text-amber-700',
        icon: Clock,
        label: 'Pending',
      },
      approved: {
        bg: 'bg-emerald-100',
        text: 'text-emerald-700',
        icon: CheckCircle,
        label: 'Approved',
      },
      blocked: {
        bg: 'bg-red-100',
        text: 'text-red-700',
        icon: XCircle,
        label: 'Blocked',
      },
      active: { // Fallback/Alternative
        bg: 'bg-emerald-100',
        text: 'text-emerald-700',
        icon: CheckCircle,
        label: 'Active',
      }
    };
    return badges[status] || badges.pending;
  };

  const handleStatusUpdate = async () => {
    if (!selectedPost || !newStatus) return;
    const success = await updateAudioStatus(selectedPost.id, newStatus);
    if (success) {
      setIsStatusModalOpen(false);
      setSelectedPost(null);
      setNewStatus('');
      // Refresh happens via hook state update
    }
  };

  const handleDelete = async () => {
    if (!selectedPost) return;
    const success = await deleteAudioPost(selectedPost.id);
    if (success) {
      setIsDeleteModalOpen(false);
      setSelectedPost(null);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar
        currentPage="audio-posts"
        onPageChange={handlePageChange}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
        }`}>
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Audio Posts</h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage user uploaded audio content on the platform.
              </p>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><Music size={18} /></div>
                <span className="text-xs font-semibold uppercase text-blue-800">Total Posts</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-amber-100 rounded-lg text-amber-600"><Clock size={18} /></div>
                <span className="text-xs font-semibold uppercase text-amber-800">Pending</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600"><CheckCircle size={18} /></div>
                <span className="text-xs font-semibold uppercase text-emerald-800">Approved</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-xl border border-red-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-red-100 rounded-lg text-red-600"><XCircle size={18} /></div>
                <span className="text-xs font-semibold uppercase text-red-800">Blocked</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.blocked}</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="px-8 py-5">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search posts, artists, descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border-none focus:ring-0 rounded-lg text-gray-900 placeholder-gray-500"
              />
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto px-2">
              <div className="h-6 w-px bg-gray-200 hidden md:block"></div>
              <Filter size={16} className="text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-sm border-none focus:ring-0 text-gray-600 font-medium bg-transparent cursor-pointer outline-none"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto px-8 pb-8">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
              <button onClick={resetError} className="ml-auto text-red-500 hover:text-red-700"><X className="w-4 h-4" /></button>
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Audio</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Artist</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr><td colSpan="5" className="p-12 text-center text-gray-500">Loading audio posts...</td></tr>
                ) : filteredPosts.length === 0 ? (
                  <tr><td colSpan="5" className="p-12 text-center text-gray-500">No audio posts found.</td></tr>
                ) : (
                  filteredPosts.map((post) => {
                    const statusBadge = getStatusBadge(post.status || 'pending');
                    const isPlaying = playingId === post.id;

                    return (
                      <tr key={post.id} className="hover:bg-gray-50 transition-colors group">
                        {/* Audio Info */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="relative w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 group-hover:shadow-md transition-all">
                              {post.cover_image || post.image ? (
                                <img src={post.cover_image || post.image} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400"><Music size={20} /></div>
                              )}
                              <button
                                onClick={() => togglePlay(post)}
                                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                              >
                                {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                              </button>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900 line-clamp-1">{post.title || post.caption || 'Untitled'}</p>
                              <p className="text-xs text-gray-500 mt-0.5 max-w-[200px] truncate">{post.description || 'No description'}</p>
                            </div>
                          </div>
                        </td>

                        {/* Artist Info */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                              <User size={12} className="text-gray-400" />
                              <span className="text-sm font-medium text-gray-900">{post.username || 'Unknown'}</span>
                            </div>
                            {post.artist_name && <span className="text-xs text-gray-400 ml-4.5 italic">{post.artist_name}</span>}
                          </div>
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-500">
                            {new Date(post.created_at).toLocaleDateString()}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                            {statusBadge.icon && <statusBadge.icon size={12} />}
                            <span className="capitalize">{statusBadge.label}</span>
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="relative inline-block text-left">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPost(selectedPost?.id === post.id ? null : post);
                              }}
                              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <MoreVertical size={16} />
                            </button>

                            {selectedPost?.id === post.id && (
                              <div
                                ref={actionsMenuRef}
                                className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-20 py-1"
                              >
                                <div className="px-4 py-2 border-b border-gray-50">
                                  <p className="text-xs font-medium text-gray-900 truncate">Actions for Post #{post.id}</p>
                                </div>
                                <button
                                  onClick={() => {
                                    setNewStatus(post.status === 'pending' ? 'approved' : post.status === 'approved' ? 'blocked' : 'pending');
                                    setIsStatusModalOpen(true);
                                  }}
                                  className="w-full text-left px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Eye size={14} /> Update Status
                                </button>
                                <button
                                  onClick={() => setIsDeleteModalOpen(true)}
                                  className="w-full text-left px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                  <Trash2 size={14} /> Delete Post
                                </button>
                              </div>
                            )}
                          </div>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.total > limit && (
            <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-500">
                Showing <span className="font-medium">{(currentPage - 1) * limit + 1}</span> to <span className="font-medium">{Math.min(currentPage * limit, pagination.total)}</span> of <span className="font-medium">{pagination.total}</span> posts
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={!pagination.hasMore && (currentPage * limit >= pagination.total)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Modal */}
      {isStatusModalOpen && selectedPost && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Update Status</h3>
            <p className="text-sm text-gray-500 mb-6">
              Change verification status for <span className="font-medium text-gray-900">{selectedPost.title || selectedPost.caption}</span>
            </p>

            <div className="space-y-3 mb-6">
              {['pending', 'approved', 'blocked'].map((status) => (
                <label key={status} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${newStatus === status ? 'border-[#2d7a63] bg-emerald-50/50 ring-1 ring-[#2d7a63]' : 'border-gray-200 hover:bg-gray-50'
                  }`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-full ${status === 'approved' ? 'bg-emerald-100 text-emerald-600' :
                        status === 'blocked' ? 'bg-red-100 text-red-600' :
                          'bg-amber-100 text-amber-600'
                      }`}>
                      {status === 'approved' ? <CheckCircle size={14} /> : status === 'blocked' ? <XCircle size={14} /> : <Clock size={14} />}
                    </div>
                    <span className="text-sm font-medium capitalize text-gray-700">{status}</span>
                  </div>
                  <input
                    type="radio"
                    name="status"
                    value={status}
                    checked={newStatus === status}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-4 h-4 text-[#2d7a63] focus:ring-[#2d7a63]"
                  />
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsStatusModalOpen(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-[#2d7a63] rounded-xl hover:bg-[#245a4f] transition-colors shadow-sm shadow-emerald-200"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && selectedPost && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4 text-red-600 mx-auto">
              <Trash2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Delete Audio Post?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Are you sure you want to delete <span className="font-medium text-gray-900">{selectedPost.title || selectedPost.caption}</span>? This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors shadow-sm shadow-red-200"
              >
                Delete Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAudioPostsPage;
