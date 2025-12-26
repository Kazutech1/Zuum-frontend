import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Disc,
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Eye,
  Music,
  User,
  Calendar,
  AlertCircle,
  X,
  Play,
  Pause,
  DollarSign,
  Activity,
  Headphones,
  FileAudio
} from 'lucide-react';
import AdminSidebar from '../components/Sidebar';
import { useBeats } from '../hooks/useBeats';

const BeatPostsPage = () => {
  const navigate = useNavigate();
  const {
    beats,
    isLoading,
    error,
    pagination,
    fetchBeats,
    updateBeatStatus,
    deleteBeat,
    resetError,
  } = useBeats();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, pending, approved, blocked
  const [selectedBeat, setSelectedBeat] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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
        setSelectedBeat(null);
      }
    };

    if (selectedBeat) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedBeat]);

  // Audio Player Logic
  const togglePlay = (beat) => {
    if (playingId === beat.id) {
      audioRef.current.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(beat.audio_upload);
      audio.onended = () => setPlayingId(null);
      audioRef.current = audio;
      audio.play().catch(e => console.error("Playback failed", e));
      setPlayingId(beat.id);
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
    beat: '/admin/promotion', // Assuming this maps to promotion.jsx or similar
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
    // Basic mapping, adjust as per your actual route definitions
    const route = adminRoutes[pageId] || `/admin/${pageId}`;
    navigate(route);
  };

  // Fetch beats on component mount and when filters change
  useEffect(() => {
    const options = {
      limit,
      offset: (currentPage - 1) * limit,
    };

    if (statusFilter !== 'all') {
      options.status = statusFilter;
    }

    fetchBeats(options);
  }, [statusFilter, currentPage, limit, fetchBeats]);

  // Calculate stats
  const stats = useMemo(() => {
    const allBeats = Array.isArray(beats) ? beats : [];
    return {
      total: pagination.total || allBeats.length,
      pending: allBeats.filter((b) => b.status === 'pending').length,
      approved: allBeats.filter((b) => b.status === 'approved').length,
      blocked: allBeats.filter((b) => b.status === 'blocked').length,
    };
  }, [beats, pagination.total]);

  // Filter beats by search term
  const filteredBeats = useMemo(() => {
    if (!Array.isArray(beats)) return [];

    const term = searchTerm.toLowerCase();
    return beats.filter((beat) => {
      const matchesSearch =
        !term ||
        (beat.title && beat.title.toLowerCase().includes(term)) ||
        (beat.caption && beat.caption.toLowerCase().includes(term)) ||
        (beat.username && beat.username.toLowerCase().includes(term)) ||
        (beat.artist_name && beat.artist_name.toLowerCase().includes(term)) ||
        (beat.email && beat.email.toLowerCase().includes(term));
      return matchesSearch;
    });
  }, [beats, searchTerm]);

  // Handle approve
  const handleApprove = async (beat) => {
    await updateBeatStatus(beat.id, 'approved');
    setSelectedBeat(null);
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedBeat) return;
    const success = await deleteBeat(selectedBeat.id);
    if (success) {
      setIsDeleteModalOpen(false);
      setSelectedBeat(null);
    }
  };

  // Get status badge styling
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
      }
    };
    return badges[status] || badges.pending;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar
        currentPage="beat-posts"
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
              <h1 className="text-2xl font-bold text-gray-900">Beats Management</h1>
              <p className="text-sm text-gray-500 mt-1">
                Monitor and manage beat uploads, approvals, and sales data.
              </p>
            </div>
            {/* Minimal Stats Inline or keep cards? Let's keep cards below header for impact */}
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><Disc size={18} /></div>
                <span className="text-xs font-semibold uppercase text-blue-800">Total Beats</span>
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
                placeholder="Search beats, artists, emails..."
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
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Beat</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Artist</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Specs</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Market</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr><td colSpan="6" className="p-12 text-center text-gray-500">Loading beats...</td></tr>
                ) : filteredBeats.length === 0 ? (
                  <tr><td colSpan="6" className="p-12 text-center text-gray-500">No beats found.</td></tr>
                ) : (
                  filteredBeats.map((beat) => {
                    const statusBadge = getStatusBadge(beat.status || 'pending');
                    const isPlaying = playingId === beat.id;

                    return (
                      <tr key={beat.id} className="hover:bg-gray-50 transition-colors group">
                        {/* Beat Info & Audio */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="relative w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 group-hover:shadow-md transition-all">
                              {beat.cover_photo ? (
                                <img src={beat.cover_photo} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400"><Disc size={20} /></div>
                              )}
                              <button
                                onClick={() => togglePlay(beat)}
                                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                              >
                                {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                              </button>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900 line-clamp-1">{beat.caption || beat.title || 'Untitled'}</p>
                              <p className="text-xs text-gray-500 mt-0.5 max-w-[150px] truncate">{beat.description || 'No description'}</p>
                              <p className="text-[10px] text-gray-400 font-mono mt-1">ID: {beat.id}</p>
                            </div>
                          </div>
                        </td>

                        {/* Artist Info */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5 ">
                              <User size={12} className="text-gray-400" />
                              <span className="text-sm font-medium text-gray-900">{beat.username || 'Unknown'}</span>
                            </div>
                            <span className="text-xs text-gray-500 ml-4.5">{beat.email}</span>
                            {beat.artist_name && <span className="text-xs text-gray-400 ml-4.5 italic">{beat.artist_name}</span>}
                          </div>
                        </td>

                        {/* Specs */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs px-2 py-0.5 bg-purple-50 text-purple-700 rounded border border-purple-100 font-medium">
                                {beat.genre || 'No Genre'}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-3 mt-1">
                              <span>BPM: <b className="text-gray-700">{beat.bpm || '--'}</b></span>
                              <span className="w-px h-3 bg-gray-200"></span>
                              <span>Key: <b className="text-gray-700">{beat.key || '--'}</b></span>
                            </div>
                          </div>
                        </td>

                        {/* Market Data */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-900">₦{Number(beat.amount || 0).toLocaleString()}</span>
                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                              <span title="Total Supply">stock: {beat.total_supply}</span>
                              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                              <span title="Total Buyers">sold: {beat.total_buyers}</span>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                            {statusBadge.icon && <statusBadge.icon size={12} />}
                            <span className="capitalize">{beat.status}</span>
                          </span>
                          <div className="text-[10px] text-gray-400 mt-1.5 flex items-center gap-1">
                            <Calendar size={10} />
                            {new Date(beat.created_at).toLocaleDateString()}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="relative inline-block text-left">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedBeat(selectedBeat?.id === beat.id ? null : beat);
                              }}
                              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <MoreVertical size={16} />
                            </button>

                            {/* Dropdown Menu */}
                            {selectedBeat?.id === beat.id && (
                              <div
                                ref={actionsMenuRef}
                                className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-20 py-1"
                                style={{ bottom: 'auto' }} // Ensure it doesn't get clipped if near bottom, though specialized positioning library is better
                              >
                                <div className="px-4 py-2 border-b border-gray-50">
                                  <p className="text-xs font-medium text-gray-900 truncate">Actions for Beat #{beat.id}</p>
                                </div>
                                {beat.status !== 'approved' && (
                                  <button
                                    onClick={() => handleApprove(beat)}
                                    className="w-full text-left px-4 py-2.5 text-xs text-emerald-600 hover:bg-emerald-50 flex items-center gap-2"
                                  >
                                    <CheckCircle size={14} /> Set Approved
                                  </button>
                                )}
                                <button
                                  onClick={() => setIsDeleteModalOpen(true)}
                                  className="w-full text-left px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                  <Trash2 size={14} /> Delete Beat
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
                Showing <span className="font-medium">{(currentPage - 1) * limit + 1}</span> to <span className="font-medium">{Math.min(currentPage * limit, pagination.total)}</span> of <span className="font-medium">{pagination.total}</span> beats
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

      {/* Delete Modal */}
      {isDeleteModalOpen && selectedBeat && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4 text-red-600 mx-auto">
              <Trash2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Delete Beat?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Are you sure you want to delete <span className="font-medium text-gray-900">{selectedBeat.caption}</span>? This action cannot be undone.
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
                Delete Beat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BeatPostsPage;
