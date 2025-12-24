import { useState, useEffect } from 'react';
import {
    Search, Filter, Eye, CheckCircle, XCircle,
    AlertCircle, Loader2, User, Calendar,
    Link as LinkIcon, ExternalLink, Receipt,
    Briefcase, DollarSign
} from 'lucide-react';
import { usePromotions } from '../hooks/usePromotions';

const UserPackagesList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showReceipt, setShowReceipt] = useState(false);

    const {
        promotions,
        isLoading,
        error,
        fetchPromotions,
        updatePromotionStatus,
        updateSuccess
    } = usePromotions();

    useEffect(() => {
        fetchPromotions();
    }, [fetchPromotions]);

    // Filter logic
    const filteredPromotions = promotions.filter(promo => {
        const matchesSearch =
            promo.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            promo.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            promo.id?.toString().includes(searchTerm);

        const matchesStatus = statusFilter === 'all' || promo.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const handleViewReceipt = (promo) => {
        setSelectedRequest(promo);
        setShowReceipt(true);
    };

    const handleApprove = async () => {
        if (!selectedRequest) return;

        const success = await updatePromotionStatus(
            selectedRequest.id,
            selectedRequest.category,
            'active' // or 'approved' depending on your backend
        );

        if (success) {
            setShowReceipt(false);
            // Optional: You could trigger a re-fetch here if needed
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-700 border-green-200';
            case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                    {['all', 'pending', 'active', 'completed', 'rejected'].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all capitalize ${statusFilter === status
                                    ? 'bg-gray-900 text-white shadow-md'
                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search users or packages..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2d7a63] transition-all text-gray-900"
                    />
                </div>
            </div>

            {/* Main Content */}
            {isLoading && !promotions.length ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100">
                    <Loader2 className="animate-spin text-[#2d7a63] mb-4" size={40} />
                    <p className="text-gray-400">Loading requests...</p>
                </div>
            ) : filteredPromotions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100">
                    <div className="p-4 bg-gray-50 rounded-full mb-4">
                        <Briefcase className="text-gray-400" size={32} />
                    </div>
                    <p className="text-gray-500 font-medium">No package requests found</p>
                    <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Package</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredPromotions.map((promo) => (
                                    <tr key={promo.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-[#2d7a63]/10 flex items-center justify-center text-[#2d7a63] font-bold text-xs">
                                                    {promo.customer_name?.[0] || <User size={14} />}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{promo.customer_name || 'Unknown User'}</div>
                                                    <div className="text-xs text-gray-500">{promo.customer_email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-900">{promo.title || promo.name}</span>
                                                <span className="text-xs text-gray-500 capitalize">{promo.category}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Calendar size={14} />
                                                {new Date(promo.created_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(promo.status)}`}>
                                                {promo.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <button
                                                onClick={() => handleViewReceipt(promo)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 hover:bg-[#2d7a63] hover:text-white transition-all"
                                            >
                                                <Receipt size={14} />
                                                View Receipt
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Receipt Modal */}
            {showReceipt && selectedRequest && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        {/* Receipt Header */}
                        <div className="bg-[#2d7a63] p-6 text-center relative overflow-hidden">
                            {/* Decorative Circles */}
                            <div className="absolute top-0 left-0 w-16 h-16 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                            <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2"></div>

                            <h2 className="text-white text-lg font-bold relative z-10">Order Receipt</h2>
                            <p className="text-white/80 text-sm mt-1 relative z-10">#{selectedRequest.id}</p>
                        </div>

                        {/* Receipt Body - Scrollable */}
                        <div className="p-6 overflow-y-auto flex-1 relative">
                            {/* Zigzag edge effect top */}
                            <div className="absolute top-0 left-0 right-0 h-4 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMCAxMCIgcHJlc2VydmVBc3BlY3RSYXRpbz0ibm9uZSI+PHBhdGggZD0iTTAgMTBMMTAgMEwyMCAxMEgwWiIgZmlsbD0id2hpdGUiLz48L3N2Zz4=')] bg-contain bg-repeat-x -mt-4 transform rotate-180"></div>

                            <div className="space-y-6">
                                {/* Customer Info */}
                                <div className="text-center pb-6 border-b border-dashed border-gray-200">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-500">
                                        <User size={32} />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">{selectedRequest.customer_name}</h3>
                                    <p className="text-gray-500 text-sm">{selectedRequest.customer_email}</p>
                                </div>

                                {/* Order Details */}
                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Package Details</h4>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Product</span>
                                            <span className="font-semibold text-gray-900 text-right">{selectedRequest.title || selectedRequest.name}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Category</span>
                                            <span className="capitalize px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">{selectedRequest.category}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Duration</span>
                                            <span className="text-gray-900">{selectedRequest.duration || 'N/A'}</span>
                                        </div>
                                        {selectedRequest.start_date && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Start Date</span>
                                                <span className="text-gray-900">{new Date(selectedRequest.start_date).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Cost Breakdown */}
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-600 text-sm">Subtotal</span>
                                        <span className="text-gray-900 font-medium">{selectedRequest.currency || '₦'}{Number(selectedRequest.price || selectedRequest.budget || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t border-gray-200 mt-2">
                                        <span className="text-gray-900 font-bold">Total Paid</span>
                                        <span className="text-[#2d7a63] font-bold text-lg">{selectedRequest.currency || '₦'}{Number(selectedRequest.price || selectedRequest.budget || 0).toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* External Links */}
                                {(selectedRequest.song_link || selectedRequest.video_link) && (
                                    <div className="pt-2">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Resources</h4>
                                        <div className="flex flex-col gap-2">
                                            {selectedRequest.song_link && (
                                                <a href={selectedRequest.song_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline text-sm truncate">
                                                    <ExternalLink size={14} />
                                                    {selectedRequest.song_link}
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Actions Footer */}
                        <div className="p-6 bg-gray-50 border-t border-gray-100 grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setShowReceipt(false)}
                                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                            >
                                Close
                            </button>

                            {selectedRequest.status === 'active' ? (
                                <button
                                    disabled
                                    className="px-4 py-2 bg-green-100 text-green-700 rounded-xl font-medium flex justify-center items-center gap-2 cursor-default"
                                >
                                    <CheckCircle size={18} />
                                    Approved
                                </button>
                            ) : (
                                <button
                                    onClick={handleApprove}
                                    className="px-4 py-2 bg-[#2d7a63] text-white rounded-xl hover:bg-[#24614f] font-medium transition-colors shadow-lg shadow-[#2d7a63]/20"
                                >
                                    Approve Request
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserPackagesList;
