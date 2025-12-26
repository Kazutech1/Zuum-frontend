import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  Search,
  Plus,
  X,
  Check,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Trash2,
  RefreshCcw,
  CreditCard,
  ArrowRightLeft,
  History,
  ShieldCheck,
  Coins
} from 'lucide-react';
import AdminSidebar from '../components/Sidebar';
import { useWallet } from '../hooks/useWallet';
import { useDeposits } from '../hooks/useDeposits';
import useAdminWalletUpdate from '../hooks/wallet/useAdminWalletUpdate';

// Chain options for the dropdown
const CHAIN_OPTIONS = [
  { value: 'TRON', label: 'TRON (USDT)' },
  { value: 'ETH', label: 'Ethereum (USDT)' },
  { value: 'BSC', label: 'BSC (USDT)' },
];

const getChainLabel = (chain) => {
  const option = CHAIN_OPTIONS.find((opt) => opt.value === chain);
  return option ? option.label : chain;
};

const AdminCryptoWalletPage = () => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview, deposits, wallets

  // --- Hooks ---
  const {
    wallets,
    isLoading: walletsLoading,
    error: walletsError,
    success: walletsSuccess,
    addWallet,
    updateWallet,
    deleteWallet,
    resetError: resetWalletError,
    resetSuccess: resetWalletSuccess,
  } = useWallet();

  const {
    deposits,
    isLoading: depositsLoading,
    error: depositsError,
    success: depositsSuccess,
    fetchDeposits,
    approveDeposit,
    rejectDeposit,
    resetError: resetDepositsError,
    resetSuccess: resetDepositsSuccess,
  } = useDeposits();

  const {
    updateBalance,
    loading: balanceLoading,
    error: balanceError,
    success: balanceSuccess,
    setSuccess: setBalanceSuccess,
    setError: setBalanceError
  } = useAdminWalletUpdate();

  // --- Local State ---
  const [searchTerm, setSearchTerm] = useState('');
  const [cryptoStatusFilter, setCryptoStatusFilter] = useState('all');

  // Modals
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // Forms
  const [newAddress, setNewAddress] = useState({ address: '', chain: 'TRON' });
  const [approvalTxId, setApprovalTxId] = useState('');
  const [balanceForm, setBalanceForm] = useState({ userId: '', amount: '' });

  // Action Loading State
  const [actionLoading, setActionLoading] = useState(null);

  // --- Effects ---
  useEffect(() => {
    fetchDeposits(cryptoStatusFilter !== 'all' ? { status: cryptoStatusFilter } : {});
  }, [cryptoStatusFilter, fetchDeposits]);

  // Message clearing
  useEffect(() => {
    if (walletsSuccess) setTimeout(() => resetWalletSuccess(), 3000);
    if (walletsError) setTimeout(() => resetWalletError(), 5000);
    if (depositsSuccess) setTimeout(() => resetDepositsSuccess(), 3000);
    if (depositsError) setTimeout(() => resetDepositsError(), 5000);
    if (balanceSuccess) setTimeout(() => setBalanceSuccess(false), 3000);
    if (balanceError) setTimeout(() => setBalanceError(null), 5000);
  }, [walletsSuccess, walletsError, depositsSuccess, depositsError, balanceSuccess, balanceError, resetWalletSuccess, resetWalletError, resetDepositsSuccess, resetDepositsError, setBalanceSuccess, setBalanceError]);


  // --- Handlers ---

  // Balance Update
  const handleBalanceUpdate = async (e) => {
    e.preventDefault();
    if (!balanceForm.userId || !balanceForm.amount) return;

    const success = await updateBalance({
      userId: balanceForm.userId,
      newAmount: Number(balanceForm.amount)
    });

    if (success) {
      setBalanceForm({ userId: '', amount: '' });
    }
  };

  // Deposits
  const handleApproveDeposit = async () => {
    if (!selectedDeposit) return;
    setActionLoading('approve');
    // txId is optional now, so we can pass null or the existing one if we had an edit field (which we removed)
    // Or just pass nothing if the API doesn't need it. The hook handles optional second arg.
    const success = await approveDeposit(selectedDeposit.id);
    setActionLoading(null);
    if (success) {
      setApprovalTxId('');
      setSelectedDeposit(null);
    }
  };

  const handleDeclineDeposit = async () => {
    if (!selectedDeposit) return;
    const reason = prompt('Enter rejection reason (optional):') || '';
    setActionLoading('reject');
    const success = await rejectDeposit(selectedDeposit.id, reason);
    setActionLoading(null);
    if (success) setSelectedDeposit(null);
  };

  // Wallets
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setActionLoading('add_wallet');
    const success = await addWallet(newAddress.address, newAddress.chain, true);
    setActionLoading(null);
    if (success) setShowAddressModal(false);
  };

  const handleDeleteWallet = async (id) => {
    setActionLoading(id);
    await deleteWallet(id);
    setActionLoading(null);
    setShowDeleteConfirm(null);
  };


  // Filtering
  const filteredDeposits = deposits.filter((d) => {
    const term = searchTerm.toLowerCase();
    const userName = d.user?.name || d.user?.email || '';
    return !term ||
      userName.toLowerCase().includes(term) ||
      (d.tx_id || '').toLowerCase().includes(term) ||
      String(d.id).includes(term);
  });

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
      <AdminSidebar
        currentPage="cryptoWallet"
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'} overflow-hidden`}>
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                <Wallet className="text-[#2d7a63]" size={28} /> Crypto Manager
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">Manage balances, wallets & deposits</p>
            </div>
          </div>
          {/* Tabs (optional for future, strictly utilizing space now) */}
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'overview' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >Overview</button>
            <button
              onClick={() => setActiveTab('wallets')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'wallets' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >Wallets</button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Notifications */}
          {(walletsSuccess || depositsSuccess || balanceSuccess) && (
            <div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl border border-emerald-200 flex items-center gap-2 shadow-sm animate-fade-in">
              <CheckCircle2 size={18} />
              <span className="font-medium">{walletsSuccess || depositsSuccess || "Operation successful"}</span>
            </div>
          )}
          {(walletsError || depositsError || balanceError) && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl border border-red-200 flex items-center gap-2 shadow-sm animate-fade-in">
              <AlertCircle size={18} />
              <span className="font-medium">{walletsError || depositsError || balanceError}</span>
            </div>
          )}


          {/* SECTION 1: BALANCE MANAGER (Interactive Console) */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Manual Credit/Debit */}
            <div className="lg:col-span-2 bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-2xl shadow-xl overflow-hidden text-white relative">
              <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

              <div className="p-6 border-b border-white/10 flex justify-between items-center relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <RefreshCcw className="text-emerald-400" size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Balance Manager</h3>
                    <p className="text-slate-400 text-xs">Directly update user USDT balances</p>
                  </div>
                </div>
              </div>

              <div className="p-6 relative z-10">
                <form onSubmit={handleBalanceUpdate} className="flex flex-col md:flex-row gap-4 items-end">
                  <div className="flex-1 w-full space-y-1">
                    <label className="text-xs font-medium text-slate-300 uppercase tracking-wider">User ID</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                      <input
                        type="text"
                        value={balanceForm.userId}
                        onChange={e => setBalanceForm(prev => ({ ...prev, userId: e.target.value }))}
                        placeholder="User ID (e.g. 1024)"
                        className="w-full bg-slate-800/50 border border-slate-600 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div className="w-full md:w-48 space-y-1">
                    <label className="text-xs font-medium text-slate-300 uppercase tracking-wider">New Balance</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                      <input
                        type="number"
                        value={balanceForm.amount}
                        onChange={e => setBalanceForm(prev => ({ ...prev, amount: e.target.value }))}
                        placeholder="0.00"
                        className="w-full bg-slate-800/50 border border-slate-600 rounded-xl py-3 pl-8 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono font-bold"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={balanceLoading || !balanceForm.userId || !balanceForm.amount}
                    className="w-full md:w-auto px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-bold shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95 flex items-center justify-center gap-2"
                  >
                    {balanceLoading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                    Update Balance
                  </button>
                </form>
                <p className="mt-4 text-xs text-slate-500 italic flex items-center gap-1">
                  <ShieldCheck size={12} /> This action will be logged and is irreversible via undo.
                </p>
              </div>
            </div>

            {/* Operations Summary (Visual Placeholder for future stats) */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><History size={18} className="text-blue-500" /> Recent Activity</h3>
                <div className="space-y-4">
                  {!depositsLoading && deposits.slice(0, 3).map(d => (
                    <div key={d.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                      <div className={`p-2 rounded-full ${d.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                        <Coins size={14} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">Deposit #{d.id}</p>
                        <p className="text-xs text-gray-500">{d.amount} USDT • {d.status}</p>
                      </div>
                    </div>
                  ))}
                  {deposits.length === 0 && <p className="text-sm text-gray-400">No recent activity.</p>}
                </div>
              </div>
              <button onClick={() => setCryptoStatusFilter('all')} className="mt-4 w-full py-2 border border-blue-100 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-50">
                View All Logs
              </button>
            </div>
          </section>

          {/* SECTION 2: SYSTEM WALLETS */}
          <section hidden={activeTab === 'overview' && false}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <CreditCard className="text-gray-500" size={20} />
                Admin Wallet Addresses
              </h2>
              <button
                onClick={() => setShowAddressModal(true)}
                className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-1"
              >
                <Plus size={16} /> Add New
              </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:divide-x border-gray-100 divide-gray-100">
                {wallets.map((wallet) => (
                  <div key={wallet.id} className="p-6 hover:bg-gray-50/50 transition-colors group relative">
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button onClick={() => updateWallet(wallet.id, { active: !wallet.active })} className="p-1.5 bg-white border border-gray-200 rounded text-gray-500 hover:text-emerald-600 hover:border-emerald-200" title={wallet.active ? "Pause" : "Activate"}>
                        <RefreshCcw size={14} />
                      </button>
                      <button onClick={() => setShowDeleteConfirm(wallet.id)} className="p-1.5 bg-white border border-gray-200 rounded text-gray-500 hover:text-red-600 hover:border-red-200" title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 border border-gray-200">
                        {getChainLabel(wallet.chain)}
                      </span>
                      <span className={`w-2 h-2 rounded-full ${wallet.active ? 'bg-emerald-500' : 'bg-red-400'}`}></span>
                    </div>
                    <p className="font-mono text-sm text-gray-800 break-all mb-1 bg-gray-50 p-2 rounded border border-gray-100 select-all">
                      {wallet.address}
                    </p>
                    <p className="text-xs text-gray-400">Created: {new Date(wallet.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
                {wallets.length === 0 && (
                  <div className="p-8 text-center text-gray-400 italic">No admin wallets configured.</div>
                )}
              </div>
            </div>
          </section>

          {/* SECTION 3: DEPOSITS TABLE */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <ArrowRightLeft className="text-gray-500" size={20} />
                Incoming Deposits
              </h2>
              <div className="flex bg-white border border-gray-200 rounded-lg p-0.5">
                {['all', 'PENDING', 'APPROVED', 'REJECTED'].map(status => (
                  <button
                    key={status}
                    onClick={() => setCryptoStatusFilter(status)}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${cryptoStatusFilter === status ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Transaction</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredDeposits.map((d) => (
                    <tr key={d.id} className="hover:bg-gray-50/80 group">
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-gray-900">{d.user?.name || `User #${d.user_id}`}</p>
                        <p className="text-xs text-gray-500">{d.user?.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-mono text-gray-600 truncate max-w-[150px]" title={d.tx_id}>{d.tx_id || "Pending"}</p>
                        <p className="text-[10px] text-gray-400">{d.chain} • {new Date(d.created_at).toLocaleDateString()}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-bold text-emerald-600">+{d.amount} USDT</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${d.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                          d.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                          {d.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedDeposit(d)}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:text-[#2d7a63] shadow-sm transition-all"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredDeposits.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-400">No deposits found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>

      {/* --- MODALS --- */}

      {/* 1. Wallet Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900">Add Wallet Address</h3>
              <button onClick={() => setShowAddressModal(false)} className="p-1 hover:bg-gray-200 rounded"><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveAddress} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Blockchain Chain</label>
                <select
                  value={newAddress.chain} onChange={e => setNewAddress(p => ({ ...p, chain: e.target.value }))}
                  className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#2d7a63] outline-none font-medium"
                >
                  {CHAIN_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Address</label>
                <textarea
                  value={newAddress.address} onChange={e => setNewAddress(p => ({ ...p, address: e.target.value }))}
                  placeholder="Paste wallet address..."
                  rows="3"
                  className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#2d7a63] outline-none font-mono text-sm text-gray-900"
                ></textarea>
              </div>
              <div className="flex justify-end pt-2">
                <button type="button" onClick={() => setShowAddressModal(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg font-medium mr-2">Cancel</button>
                <button type="submit" disabled={!newAddress.address} className="px-4 py-2 bg-[#2d7a63] text-white rounded-lg font-bold hover:bg-[#256652] disabled:opacity-50">Save Address</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Deposit Details Modal */}
      {selectedDeposit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="font-bold text-gray-900">Deposit #{selectedDeposit.id}</h3>
                <p className="text-xs text-gray-500">Review incoming crypto details</p>
              </div>
              <button onClick={() => setSelectedDeposit(null)} className="p-1 hover:bg-gray-200 rounded"><X size={18} /></button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-xs text-gray-500 font-medium">Amount</span>
                  <p className="text-lg font-bold text-emerald-600">+{selectedDeposit.amount} USDT</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-xs text-gray-500 font-medium">Chain</span>
                  <p className="text-lg font-bold text-gray-800">{getChainLabel(selectedDeposit.chain)}</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <InfoRow label="User" value={`${selectedDeposit.user?.name || 'User'} (${selectedDeposit.user?.email || selectedDeposit.user_id})`} />
                <InfoRow label="TX ID" value={selectedDeposit.tx_id || "N/A"} mono />
                <InfoRow label="To Wallet" value={selectedDeposit.dest_wallet_address || "N/A"} mono />
                <InfoRow label="Reason" value={selectedDeposit.reason || "N/A"} />
              </div>

              {selectedDeposit.status === 'PENDING' && (
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex gap-3 mt-4">
                    <button onClick={handleDeclineDeposit} disabled={actionLoading} className="flex-1 py-3 border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl font-bold transition-colors">Reject</button>
                    <button onClick={handleApproveDeposit} disabled={actionLoading} className="flex-[2] py-3 bg-[#2d7a63] text-white hover:bg-[#256652] rounded-xl font-bold shadow-lg shadow-[#2d7a63]/20 transition-all disabled:opacity-50 disabled:shadow-none">
                      {actionLoading ? 'Processing...' : 'Approve Deposit'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center animate-bounce-in">
            <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Delete Wallet?</h3>
            <p className="text-sm text-gray-500 mt-2 mb-6">This will remove the address permanently. Users won't see it anymore.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 py-2 border border-gray-200 rounded-lg font-medium hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleDeleteWallet(showDeleteConfirm)} className="flex-1 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 shadow-md">Delete</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

const InfoRow = ({ label, value, mono }) => (
  <div className="flex justify-between items-start text-sm">
    <span className="text-gray-500 font-medium min-w-[80px]">{label}</span>
    <span className={`text-gray-900 text-right ${mono ? 'font-mono text-xs break-all' : 'font-medium'}`}>{value}</span>
  </div>
);

export default AdminCryptoWalletPage;
