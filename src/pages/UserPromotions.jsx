import { useState } from 'react';
import {
  Newspaper, Tv, Radio, Globe, ListMusic, Youtube,
  Clock, CheckCircle, XCircle, AlertCircle, ChevronDown,
  ChevronUp, Filter, Loader2, ChevronRight, ChevronLeft,
  Eye, X, Code, Calendar, DollarSign, Package
} from 'lucide-react';
import { useUserPromotions } from '../../Hooks/search/useAllPost';
import BottomNav from '../components/homepage/BottomNav';
import Navbar from '../components/profile/NavBar';

export const UserPromotions = () => {
  const [filters, setFilters] = useState({
    category: '',
    status: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const { promotions, loading, error, pagination, refetch, loadMore, setLimit } = useUserPromotions();

  // Dark mode styles matching UploadPage
  const darkModeStyles = {
    '--color-bg-primary': '#1a1a1a',
    '--color-bg-secondary': '#2d2d2d',
    '--color-text-primary': '#ffffff',
    '--color-text-secondary': '#9ca3af',
    '--color-primary': '#2D8C72',
    '--color-primary-light': 'rgba(45, 140, 114, 0.1)',
    '--color-text-on-primary': '#ffffff',
    '--color-border': '#374151'
  };

  // Handle view promotion details
  const handleViewPromotion = (promotion) => {
    setSelectedPromotion(promotion);
    setIsViewModalOpen(true);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'national':
      case 'international':
        return <Newspaper className="w-5 h-5 text-[#2D8C72]" />;
      case 'tv':
        return <Tv className="w-5 h-5 text-[#2D8C72]" />;
      case 'radio':
        return <Radio className="w-5 h-5 text-[#2D8C72]" />;
      case 'chart':
      case 'playlist':
        return <ListMusic className="w-5 h-5 text-[#2D8C72]" />;
      case 'digital':
        return <Globe className="w-5 h-5 text-[#2D8C72]" />;
      case 'youtube':
        return <Youtube className="w-5 h-5 text-[#2D8C72]" />;
      case 'tiktok':
        return <Globe className="w-5 h-5 text-[#2D8C72]" />;
      default:
        return <Newspaper className="w-5 h-5 text-[#2D8C72]" />;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-1.5 w-fit";

    switch (status) {
      case 'active':
      case 'completed':
      case 'success':
        return (
          <span className={`${baseClasses} bg-green-500/10 text-green-400 border border-green-500/20`}>
            <CheckCircle className="w-3 h-3" />
            {status}
          </span>
        );
      case 'pending':
        return (
          <span className={`${baseClasses} bg-amber-500/10 text-amber-400 border border-amber-500/20`}>
            <Clock className="w-3 h-3" />
            {status}
          </span>
        );
      case 'expired':
      case 'failed':
      case 'cancelled':
        return (
          <span className={`${baseClasses} bg-red-500/10 text-red-400 border border-red-500/20`}>
            <XCircle className="w-3 h-3" />
            {status}
          </span>
        );
      default:
        return (
          <span className={`${baseClasses} bg-gray-500/10 text-gray-400 border border-gray-500/20`}>
            <AlertCircle className="w-3 h-3" />
            {status}
          </span>
        );
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    refetch({
      category_type: filters.category,
      status: filters.status
    });
    setShowFilters(false);
  };

  const resetFilters = () => {
    setFilters({ category: '', status: '' });
    refetch({ category_type: '', status: '' });
    setShowFilters(false);
  };

  // Card view for mobile
  const PromotionCard = ({ promo }) => (
    <div
      className="p-4 rounded-xl mb-4 border transition-all duration-200 hover:border-[#2D8C72]/50 hover:bg-[#2d2d2d]/50"
      style={{
        backgroundColor: 'var(--color-bg-secondary)',
        borderColor: 'var(--color-border)'
      }}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-primary-light)' }}
          >
            {getCategoryIcon(promo.category_type)}
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm line-clamp-1">
              {promo.title || promo.name || 'Untitled Promotion'}
            </h3>
            <p className="text-xs text-gray-400 capitalize">{promo.category_type}</p>
          </div>
        </div>
        {getStatusBadge(promo.status)}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
        <div className="flex items-center gap-2 text-gray-400">
          <Calendar className="w-4 h-4" />
          <span className="text-xs">{new Date(promo.created_at).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <Code className="w-4 h-4" />
          <span className="text-xs font-mono">{promo.code || '---'}</span>
        </div>
      </div>

      <button
        onClick={() => handleViewPromotion(promo)}
        className="w-full py-2 px-4 rounded-lg bg-[#2D8C72]/10 text-[#2D8C72] text-sm font-medium hover:bg-[#2D8C72]/20 transition-colors flex items-center justify-center gap-2"
      >
        <Eye className="w-4 h-4" />
        View Details
      </button>
    </div>
  );

  return (
    <div style={darkModeStyles} className="min-h-screen pb-20">
      <Navbar name="User Promotions" />

      <div className="container mx-auto px-4 pt-8 pb-4 max-w-6xl">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">My Promotions</h1>
            <p className="text-gray-400 text-sm mt-1">Manage and track your promotion campaigns</p>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all border ${showFilters
                ? 'bg-[#2D8C72] border-[#2D8C72] text-white'
                : 'bg-transparent border-gray-700 text-gray-300 hover:border-gray-500'
              }`}
          >
            <Filter size={18} />
            <span>Filters</span>
            {showFilters ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div
            className="mb-6 p-4 rounded-xl border animate-in fade-in slide-in-from-top-2"
            style={{
              backgroundColor: 'var(--color-bg-secondary)',
              borderColor: 'var(--color-border)'
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Category</label>
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2.5 rounded-lg bg-[#1a1a1a] border border-gray-700 text-white focus:ring-2 focus:ring-[#2D8C72] focus:border-transparent outline-none transition-all"
                >
                  <option value="">All Categories</option>
                  <option value="national">National</option>
                  <option value="international">International</option>
                  <option value="tv">TV</option>
                  <option value="radio">Radio</option>
                  <option value="chart">Chart</option>
                  <option value="playlist">Playlist</option>
                  <option value="youtube">YouTube</option>
                  <option value="tiktok">TikTok</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Status</label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2.5 rounded-lg bg-[#1a1a1a] border border-gray-700 text-white focus:ring-2 focus:ring-[#2D8C72] focus:border-transparent outline-none transition-all"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="expired">Expired</option>
                  <option value="failed">Failed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex items-end gap-3">
                <button
                  onClick={applyFilters}
                  className="flex-1 px-4 py-2.5 bg-[#2D8C72] text-white rounded-lg hover:bg-[#257a63] transition-colors font-medium"
                >
                  Apply Filters
                </button>
                <button
                  onClick={resetFilters}
                  className="px-4 py-2.5 rounded-lg border border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        {loading && !promotions.length ? (
          <div className="flex flex-col justify-center items-center py-20">
            <Loader2 className="w-10 h-10 text-[#2D8C72] animate-spin mb-4" />
            <p className="text-gray-400 animate-pulse">Loading your promotions...</p>
          </div>
        ) : error ? (
          <div className="p-6 rounded-xl border border-red-500/20 bg-red-500/10 text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-400">{error}</p>
            <button onClick={() => refetch()} className="mt-4 text-sm underline text-red-400 hover:text-red-300">Try Again</button>
          </div>
        ) : promotions.length === 0 ? (
          <div className="py-20 text-center rounded-xl bg-[#2d2d2d]/30 border border-gray-800 border-dashed">
            <Package className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-1">No promotions found</h3>
            <p className="text-gray-500">Create your first promotion to get started!</p>
          </div>
        ) : (
          <>
            {/* Desktop View (Table) */}
            <div className="hidden md:block overflow-hidden rounded-xl border border-gray-800 bg-[#2d2d2d]/30 backdrop-blur-sm">
              <table className="min-w-full divide-y divide-gray-800">
                <thead className="bg-[#1a1a1a]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Promotion</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Code</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {promotions.map((promo, index) => (
                    <tr
                      key={`${promo.id}-${index}`}
                      className="hover:bg-[#363636] transition-colors group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div
                            className="flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center bg-[#2D8C72]/10"
                          >
                            {getCategoryIcon(promo.category_type)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white group-hover:text-[#2D8C72] transition-colors">
                              {promo.title || promo.name || 'Untitled Promotion'}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {promo.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-300 capitalize px-2 py-1 rounded-md bg-gray-800/50">
                          {promo.category_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(promo.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-400">
                          {new Date(promo.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Code className="w-3.5 h-3.5 text-gray-500" />
                          <span className="text-sm font-mono text-gray-400 bg-gray-900 px-2 py-0.5 rounded border border-gray-800">
                            {promo.code || '---'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewPromotion(promo)}
                          className="text-gray-400 hover:text-[#2D8C72] transition-colors p-2 rounded-full hover:bg-[#2D8C72]/10"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View (Cards) */}
            <div className="md:hidden">
              {promotions.map((promo, index) => (
                <PromotionCard key={`${promo.id}-${index}-mobile`} promo={promo} />
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-gray-800 bg-[#2d2d2d]/30">
              <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
                <button
                  onClick={() => loadMore(pagination.offset - pagination.limit)}
                  disabled={pagination.offset === 0}
                  className="flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg border border-gray-700 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Prev
                </button>

                <span className="text-sm text-gray-400">
                  <span className="font-medium text-white">{pagination.offset + 1}</span> - <span className="font-medium text-white">{Math.min(pagination.offset + pagination.limit, pagination.total)}</span> of <span className="font-medium text-white">{pagination.total}</span>
                </span>

                <button
                  onClick={() => loadMore(pagination.offset + pagination.limit)}
                  disabled={pagination.offset + pagination.limit >= pagination.total}
                  className="flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg border border-gray-700 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <select
                value={pagination.limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="w-full md:w-auto px-3 py-2 text-sm rounded-lg bg-[#1a1a1a] border border-gray-700 text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#2D8C72]"
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
          </>
        )}
      </div>

      {/* View Promotion Modal - Improved UI */}
      {isViewModalOpen && selectedPromotion && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border animate-in zoom-in-95 duration-200"
            style={{
              backgroundColor: '#1a1a1a',
              borderColor: 'var(--color-border)'
            }}
          >
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex justify-between items-center p-6 border-b border-gray-800 bg-[#1a1a1a]/95 backdrop-blur">
              <div>
                <h2 className="text-xl font-bold text-white">Promotion Details</h2>
                <p className="text-xs text-gray-400 mt-1">ID: #{selectedPromotion.id}</p>
              </div>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              {/* Main Status Section */}
              <div className="flex flex-col sm:flex-row gap-6 mb-8 items-start">
                <div
                  className="w-20 h-20 rounded-2xl flex-shrink-0 flex items-center justify-center bg-[#2D8C72]/10"
                >
                  {getCategoryIcon(selectedPromotion.category_type)}
                </div>

                <div className="flex-1 space-y-2">
                  <h3 className="text-xl font-semibold text-white">
                    {selectedPromotion.title || selectedPromotion.name || 'Untitled Promotion'}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {getStatusBadge(selectedPromotion.status)}
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-800 text-gray-300 border border-gray-700 capitalize">
                      {selectedPromotion.category_type}
                    </span>
                  </div>

                  {selectedPromotion.code && (
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-gray-900 rounded-lg border border-gray-800">
                      <Code className="w-4 h-4 text-[#2D8C72]" />
                      <span className="font-mono text-sm text-white tracking-wide">{selectedPromotion.code}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">Pricing</p>
                  <p className="flex items-center gap-2 text-lg font-medium text-white">
                    <DollarSign className="w-4 h-4 text-[#2D8C72]" />
                    {selectedPromotion.price ? `₦${selectedPromotion.price.toLocaleString()}` : 'N/A'}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">Date Created</p>
                  <p className="flex items-center gap-2 text-sm text-gray-300">
                    <Calendar className="w-4 h-4 text-[#2D8C72]" />
                    {new Date(selectedPromotion.created_at).toLocaleString()}
                  </p>
                </div>

                {selectedPromotion.description && (
                  <div className="col-span-1 md:col-span-2 space-y-2 pt-4 border-t border-gray-800">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">Description</p>
                    <p className="text-sm text-gray-300 leading-relaxed bg-gray-800/30 p-4 rounded-lg border border-gray-800/50">
                      {selectedPromotion.description}
                    </p>
                  </div>
                )}

                {/* Media Section */}
                {(selectedPromotion.image || selectedPromotion.video) && (
                  <div className="col-span-1 md:col-span-2 space-y-3 pt-4 border-t border-gray-800">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">Media Assets</p>
                    <div className="flex flex-wrap gap-4">
                      {selectedPromotion.image && (
                        <div className="relative group overflow-hidden rounded-xl border border-gray-800">
                          <img
                            src={selectedPromotion.image}
                            alt="Promotion Asset"
                            className="h-32 w-auto object-cover transition-transform group-hover:scale-105"
                          />
                        </div>
                      )}

                      {selectedPromotion.video && (
                        <div className="relative rounded-xl border border-gray-800 overflow-hidden bg-black">
                          <video
                            src={selectedPromotion.video}
                            controls
                            className="h-32 w-auto"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Links Section */}
                {(selectedPromotion.song_link || selectedPromotion.video_link) && (
                  <div className="col-span-1 md:col-span-2 space-y-3 pt-4 border-t border-gray-800">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">External Links</p>
                    <div className="grid gap-3">
                      {selectedPromotion.song_link && (
                        <a
                          href={selectedPromotion.song_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 border border-gray-700 transition-colors group"
                        >
                          <div className="p-2 bg-[#2D8C72]/10 rounded-full group-hover:bg-[#2D8C72]/20 text-[#2D8C72]">
                            <ListMusic size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500">Song Link</p>
                            <p className="text-sm text-[#2D8C72] truncate">{selectedPromotion.song_link}</p>
                          </div>
                          <ChevronRight size={16} className="text-gray-500 group-hover:text-white" />
                        </a>
                      )}

                      {selectedPromotion.video_link && (
                        <a
                          href={selectedPromotion.video_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 border border-gray-700 transition-colors group"
                        >
                          <div className="p-2 bg-[#2D8C72]/10 rounded-full group-hover:bg-[#2D8C72]/20 text-[#2D8C72]">
                            <Youtube size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500">Video Link</p>
                            <p className="text-sm text-[#2D8C72] truncate">{selectedPromotion.video_link}</p>
                          </div>
                          <ChevronRight size={16} className="text-gray-500 group-hover:text-white" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-800 bg-gray-900/50">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="w-full py-3 bg-[#2D8C72] text-white rounded-xl font-medium hover:bg-[#257a63] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2D8C72] transition-all shadow-lg shadow-[#2D8C72]/20"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav activeTab="home" />
    </div>
  );
}
