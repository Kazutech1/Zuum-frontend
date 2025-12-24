import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, X, SlidersHorizontal, User, Music, Video, Disc, Play } from 'lucide-react';
import useAudioPosts from '../../Hooks/audioPosts/useCreateAudio';
import { useVideoPosts } from '../../Hooks/videoPosts/useCreateVideo';
import { useFetchBeats } from '../../Hooks/beats/useBeats';
import BottomNav from '../components/homepage/BottomNav';
import Spinner from '../components/Spinner';

const Search = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Top');
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Fetch Data (Client-side filtering limitation: only searches fetched records)
  const { posts: audioPosts, loading: audioLoading } = useAudioPosts(1, 100);
  const { posts: videoPosts, loading: videoLoading } = useVideoPosts(1, 100);
  const { beats: beatPosts, loading: beatsLoading } = useFetchBeats({ initialPage: 1, initialLimit: 100 });

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Combined Loading State
  const isLoading = audioLoading || videoLoading || beatsLoading;

  // Filter Logic
  const filteredResults = useMemo(() => {
    if (!debouncedSearch) return { audio: [], video: [], beats: [] };

    const lowerQuery = debouncedSearch.toLowerCase();

    const filterItem = (item) => {
      return (
        item.title?.toLowerCase().includes(lowerQuery) ||
        item.caption?.toLowerCase().includes(lowerQuery) ||
        item.description?.toLowerCase().includes(lowerQuery) ||
        item.username?.toLowerCase().includes(lowerQuery) ||
        item.artist?.toLowerCase().includes(lowerQuery)
      );
    };

    return {
      audio: audioPosts.filter(filterItem),
      video: videoPosts.filter(filterItem),
      beats: beatPosts.filter(filterItem),
    };
  }, [debouncedSearch, audioPosts, videoPosts, beatPosts]);

  const { audio, video, beats } = filteredResults;

  // Combined "Top" Results
  const topResults = useMemo(() => {
    // Interleave matching results or just show all matching sorted by date?
    // simple approach: combine and sort by date descending
    const all = [
      ...audio.map(i => ({ ...i, type: 'audio' })),
      ...video.map(i => ({ ...i, type: 'video' })),
      ...beats.map(i => ({ ...i, type: 'beat' }))
    ];
    return all.sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt));
  }, [audio, video, beats]);

  // Render Helpers
  const renderVideoItem = (item) => (
    <div
      key={item.id}
      className="relative aspect-[9/16] rounded-xl overflow-hidden cursor-pointer group bg-gray-900"
      onClick={() => navigate(`/videos/${item.id}`)}
    >
      {/* Blurred Background Placeholder */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-50 blur-xl scale-110"
        style={{
          backgroundImage: `url(${item.thumbnail_url || item.video_thumbnail || "https://via.placeholder.com/150"})`,
          backgroundColor: '#1a1a1a' // Fallback color
        }}
      />

      {/* Actual Thumbnail (if available) or generic placeholder */}
      <img
        src={item.thumbnail_url || item.video_thumbnail || "https://via.placeholder.com/150"}
        alt={item.caption}
        className="w-full h-full object-cover relative z-10"
        onError={(e) => {
          e.target.style.display = 'none'; // Hide broken image so background shows
        }}
      />

      {/* If image fails, the background is already blurred. We can force a colored overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 z-20" />

      <div className="absolute inset-0 z-30 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Play className="text-white fill-white ml-1" size={20} />
        </div>
      </div>

      <div className="absolute bottom-3 left-3 right-3 z-30">
        <p className="text-white text-sm font-bold truncate drop-shadow-md">{item.caption}</p>
        <p className="text-gray-300 text-xs truncate drop-shadow-md">@{item.username}</p>
      </div>
    </div>
  );

  const renderAudioItem = (item) => (
    <div
      key={item.id}
      className="flex items-center p-3 hover:bg-white/5 rounded-xl cursor-pointer transition-colors border-b border-gray-800/50"
      onClick={() => navigate(`/view-audio/${item.id}`)}
    >
      <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-800">
        <img
          src={item.cover_image || item.image || "https://via.placeholder.com/50"}
          alt={item.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <Music size={16} className="text-white" />
        </div>
      </div>
      <div className="ml-3 flex-1 overflow-hidden">
        <h4 className="text-white font-medium text-sm truncate">{item.title || item.caption || "Untitled"}</h4>
        <p className="text-gray-400 text-xs truncate">{item.username}</p>
      </div>
    </div>
  );

  const renderBeatItem = (item) => (
    <div
      key={item.id}
      className="flex items-center p-3 hover:bg-white/5 rounded-xl cursor-pointer transition-colors border-b border-gray-800/50"
      onClick={() => navigate(`/beats/${item.id}`)}
    >
      <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-purple-900/20">
        <img
          src={item.cover_photo || item.cover_image || "https://via.placeholder.com/50"}
          alt={item.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <Disc size={16} className="text-purple-400" />
        </div>
      </div>
      <div className="ml-3 flex-1 overflow-hidden">
        <h4 className="text-white font-medium text-sm truncate">{item.title || "Untitled Beat"}</h4>
        <p className="text-gray-400 text-xs truncate">@{item.username || item.artist}</p>
      </div>
      {item.amount && (
        <span className="text-[#2D8C72] font-bold text-sm px-2">
          ${(item.amount / 100).toFixed(2)}
        </span>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-black text-white pb-20">
      {/* Search Header */}
      <div className="px-4 pt-6 pb-2 sticky top-0 bg-black/95 backdrop-blur-md z-10 border-b border-gray-800">
        <div className="relative flex items-center gap-3 mb-4">
          <SearchIcon className="absolute left-3 text-gray-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Search audio, videos, artists..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-gray-900 text-white pl-10 pr-10 py-3 rounded-full border border-gray-800 focus:border-[#2D8C72] focus:outline-none transition-colors"
            autoFocus
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="absolute right-3 text-gray-500 hover:text-white"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-6 overflow-x-auto pb-2 no-scrollbar">
          {['Top', 'Audio', 'Videos', 'Beats'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-sm font-medium whitespace-nowrap transition-colors pb-2 border-b-2 ${activeTab === tab
                ? 'text-[#2D8C72] border-[#2D8C72]'
                : 'text-gray-400 border-transparent hover:text-white'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Spinner />
          </div>
        ) : !debouncedSearch ? (
          /* Empty State / Recent Searches Placeholder */
          <div className="text-center py-20">
            <div className="inline-block p-4 rounded-full bg-gray-900 mb-4">
              <SearchIcon size={32} className="text-gray-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-300">Explore Content</h3>
            <p className="text-gray-500 text-sm mt-1">Search for your favorite artists, tracks, and videos.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top Results */}
            {activeTab === 'Top' && (
              <>
                {topResults.length === 0 && <p className="text-gray-500 text-center">No results found.</p>}

                {/* Preview Section for Top View */}
                {topResults.length > 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    {topResults.map(item => {
                      if (item.type === 'video') return renderVideoItem(item);
                      if (item.type === 'audio') return <div className="col-span-2">{renderAudioItem(item)}</div>;
                      if (item.type === 'beat') return <div className="col-span-2">{renderBeatItem(item)}</div>;
                      return null;
                    })}
                  </div>
                )}
              </>
            )}

            {/* Audio Tab */}
            {activeTab === 'Audio' && (
              <div className="space-y-1">
                {audio.length === 0 ? <p className="text-gray-500 text-center">No audio found.</p> : audio.map(renderAudioItem)}
              </div>
            )}

            {/* Video Tab */}
            {activeTab === 'Videos' && (
              <div className="grid grid-cols-2 gap-3">
                {video.length === 0 ? <p className="text-gray-500 text-center col-span-2">No videos found.</p> : video.map(renderVideoItem)}
              </div>
            )}

            {/* Beats Tab */}
            {activeTab === 'Beats' && (
              <div className="space-y-1">
                {beats.length === 0 ? <p className="text-gray-500 text-center">No beats found.</p> : beats.map(renderBeatItem)}
              </div>
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Search;