import React, { useState, useEffect } from 'react';
import { FaBullhorn, FaMusic, FaVideo, FaHeadphones, FaPlay, FaCheck, FaWallet, FaInfoCircle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNav from '../components/homepage/BottomNav';
import Navbar from '../components/profile/NavBar';
import Sidebar from '../components/homepage/Sidebar';
import Overlay from '../components/homepage/Overlay';
import ActivePromotions from '../components/promotion/ActivePromotions'; // Assuming you have this
import { usePromotePost } from '../../Hooks/search/usePromotePost'; // Import the hook above
import { useUserPosts } from '../../Hooks/search/useAllPost'; // Your existing hook

// CONFIGURATION: Set this to match your backend pricing logic
const DAILY_RATE = 5000; // Example: 5,000 Naira per day

const PromotionPage = () => {
  // 1. Data Fetching
  const { beats, videos, audios, loading, error, refetch } = useUserPosts();
  
  // 2. Promotion Logic Hook
  const { 
    promotePost, 
    loading: isPromoting, 
    error: promoteError, 
    success: promoteSuccess,
    responseData,
    reset: resetPromote 
  } = usePromotePost();

  // 3. UI State
  const [activeTab, setActiveTab] = useState('audio'); // 'audio', 'video', 'beat'
  const [selectedContent, setSelectedContent] = useState(null);
  const [duration, setDuration] = useState(7); // Default 7 days
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Styles
  const styles = {
    bg: '#1a1a1a',
    card: '#2d2d2d',
    primary: '#2D8C72',
    text: '#ffffff',
    textSec: '#9ca3af',
    border: '#374151',
    error: '#EF4444'
  };

  // Helper to toggle selection
  const handleSelect = (item, type) => {
    if (selectedContent?.id === item.id) {
      setSelectedContent(null);
    } else {
      setSelectedContent({ ...item, type });
      resetPromote();
    }
  };

  // Helper to get list based on tab
  const getContentList = () => {
    switch(activeTab) {
      case 'audio': return audios || [];
      case 'video': return videos || [];
      case 'beat': return beats || [];
      default: return [];
    }
  };

  // Submit Handler
  const handlePromoteSubmit = async () => {
    if (!selectedContent) return;
    try {
      await promotePost(selectedContent.id, selectedContent.type, duration);
      // Wait for 2 seconds then refresh data and clear selection
      setTimeout(() => {
        refetch.all();
        setSelectedContent(null);
        resetPromote();
      }, 3000);
    } catch (e) {
      console.error(e);
    }
  };

  // Calculate Total Cost
  const totalCost = duration * DAILY_RATE;

  // -- RENDER HELPERS --

  if (loading.all) {
    return <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a] text-white">Loading your content...</div>;
  }

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: styles.bg, color: styles.text }}>
      <Navbar name="Promote Content" toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Overlay isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="max-w-6xl mx-auto p-4 pt-20">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold flex items-center gap-2 mb-2">
            <FaBullhorn style={{ color: styles.primary }} /> 
            Boost Your Reach
          </h1>
          <p style={{ color: styles.textSec }}>Select content to promote across the platform.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Content Selector */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b" style={{ borderColor: styles.border }}>
              {[
                { id: 'audio', label: 'Music', icon: FaMusic },
                { id: 'video', label: 'Videos', icon: FaVideo },
                { id: 'beat', label: 'Beats', icon: FaHeadphones }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setSelectedContent(null); }}
                  className={`flex items-center gap-2 pb-3 px-2 transition-colors relative ${
                    activeTab === tab.id ? 'text-white font-medium' : 'text-gray-500'
                  }`}
                >
                  <tab.icon /> {tab.label}
                  {activeTab === tab.id && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5"
                      style={{ backgroundColor: styles.primary }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Content List */}
            <div className="space-y-4">
              {getContentList().length === 0 ? (
                <div className="text-center py-10" style={{ color: styles.textSec }}>
                  No {activeTab}s found to promote.
                </div>
              ) : (
                getContentList().map(item => (
                  <motion.div
                    key={item.id}
                    layout
                    onClick={() => handleSelect(item, activeTab)}
                    className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedContent?.id === item.id ? 'ring-2' : 'hover:border-gray-500'
                    }`}
                    style={{ 
                      backgroundColor: styles.card,
                      borderColor: selectedContent?.id === item.id ? styles.primary : styles.border,
                      ringColor: styles.primary
                    }}
                  >
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-lg bg-black overflow-hidden relative flex-shrink-0">
                      <img 
                        src={item.cover_photo || item.thumbnail || 'https://via.placeholder.com/150'} 
                        alt={item.title} 
                        className="w-full h-full object-cover"
                      />
                      {selectedContent?.id === item.id && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <FaCheck className="text-white" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="ml-4 flex-1">
                      <h3 className="font-medium truncate">{item.title}</h3>
                      <p className="text-sm" style={{ color: styles.textSec }}>
                        {item.plays_count || 0} plays • {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recent'}
                      </p>
                    </div>

                    {/* Status Badge */}
                    {item.is_promoted && (
                      <span className="text-xs px-2 py-1 rounded bg-yellow-500/20 text-yellow-500 border border-yellow-500/50">
                        Active
                      </span>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Promotion Details (Sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="p-6 rounded-2xl border shadow-lg" style={{ backgroundColor: styles.card, borderColor: styles.border }}>
                
                <h2 className="text-xl font-bold mb-6">Campaign Settings</h2>

                {/* Selected Item Preview */}
                {!selectedContent ? (
                  <div className="text-center py-8 border-2 border-dashed rounded-xl mb-6" style={{ borderColor: styles.border }}>
                    <p style={{ color: styles.textSec }}>Select a post from the list to begin.</p>
                  </div>
                ) : (
                  <div className="mb-6">
                    <label className="text-sm font-medium block mb-2" style={{ color: styles.textSec }}>Selected Content</label>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-[#1a1a1a]">
                      <div className="w-10 h-10 rounded bg-gray-700 overflow-hidden">
                         <img src={selectedContent.cover_photo || 'https://via.placeholder.com/50'} className="w-full h-full object-cover" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-medium truncate text-sm">{selectedContent.title}</p>
                        <p className="text-xs uppercase" style={{ color: styles.primary }}>{selectedContent.type}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Duration Slider */}
                <div className="mb-6">
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium">Duration</label>
                    <span style={{ color: styles.primary }}>{duration} Days</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="30" 
                    value={duration} 
                    onChange={(e) => setDuration(Number(e.target.value))}
                    disabled={!selectedContent || isPromoting}
                    className="w-full accent-[#2D8C72] h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs mt-2 text-gray-500">
                    <span>1 Day</span>
                    <span>30 Days</span>
                  </div>
                </div>

                <hr className="border-gray-700 my-6" />

                {/* Cost Calculation */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span style={{ color: styles.textSec }}>Daily Rate</span>
                    <span>₦{DAILY_RATE.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: styles.textSec }}>Duration</span>
                    <span>{duration} Days</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-700">
                    <span>Total Cost</span>
                    <span style={{ color: styles.primary }}>₦{totalCost.toLocaleString()}</span>
                  </div>
                  <div className="flex gap-2 items-start text-xs bg-blue-500/10 text-blue-400 p-2 rounded mt-2">
                     <FaInfoCircle className="mt-0.5" />
                     <p>Amount will be deducted from your wallet balance instantly.</p>
                  </div>
                </div>

                {/* Error Display */}
                <AnimatePresence>
                  {promoteError && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-red-500/10 border border-red-500 text-red-500 text-sm p-3 rounded-lg mb-4"
                    >
                      {promoteError}
                    </motion.div>
                  )}
                  
                  {promoteSuccess && responseData && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-green-500/10 border border-green-500 text-green-500 text-sm p-3 rounded-lg mb-4"
                    >
                      Success! ₦{responseData.amount?.toLocaleString()} deducted.
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action Button */}
                <button
                  onClick={handlePromoteSubmit}
                  disabled={!selectedContent || isPromoting || promoteSuccess}
                  className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    backgroundColor: promoteSuccess ? '#10B981' : styles.primary, 
                    color: '#fff' 
                  }}
                >
                  {isPromoting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : promoteSuccess ? (
                    <>
                      <FaCheck /> Promoted
                    </>
                  ) : (
                    <>
                      <FaWallet /> Pay & Promote
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Active Promotions Footer Section */}
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-4">Currently Active</h2>
          <ActivePromotions 
            activePromotions={[
                ...(audios?.filter(x => x.is_promoted) || []),
                ...(videos?.filter(x => x.is_promoted) || []),
                ...(beats?.filter(x => x.is_promoted) || [])
            ]} 
          />
        </div>

      </div>
      <BottomNav activeTab="home" />
    </div>
  );
};

export default PromotionPage;
                 
