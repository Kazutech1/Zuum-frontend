import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Download,
  Music,
  Globe,
  Calendar,
  Activity,
  PlayCircle
} from 'lucide-react';
import Navbar from '../components/profile/NavBar';
import BottomNav from '../components/homepage/BottomNav';
import useAdminUserAnalytics from '../admin/hooks/user/useAdminUserAnalytics'; // Using the same hook as admin
import { useAuth } from '../contexts/AuthContexts';

// Generate consistent mock history based on a total value
const generateMockHistory = (total) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  let data = [];
  let current = total * 0.4; // Start at 40%

  // Distribute growth curve
  months.forEach((month, i) => {
    // Add random growth
    const growth = (total - current) / (months.length - i) * (0.8 + Math.random() * 0.4);
    current += growth;
    data.push({ label: month, value: Math.round(current) });
  });

  // Ensure last point hits somewhere near total or is the total
  data[data.length - 1].value = total;
  return data;
};

// Simple SVG Line Chart Component (Adapted for Dark Mode)
const SimpleLineChart = ({ data, color }) => {
  if (!data || data.length < 2) return null;

  const height = 200;
  const width = 600;
  const padding = 20;

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));

  // Calculate points
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
    const y = height - padding - ((d.value - minValue) / (maxValue - minValue || 1)) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        {/* Grid lines (simplified) */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

        {/* The Line */}
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="3"
          points={points}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Dots */}
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
          const y = height - padding - ((d.value - minValue) / (maxValue - minValue || 1)) * (height - padding * 2);
          return (
            <g key={i} className="group cursor-pointer">
              <circle cx={x} cy={y} r="4" fill="#1a1a1a" stroke={color} strokeWidth="2" />
              {/* Tooltip on hover */}
              <text
                x={x}
                y={y - 10}
                textAnchor="middle"
                fontSize="12"
                fill="#fff"
                className="opacity-0 group-hover:opacity-100 transition-opacity font-bold"
              >
                {d.value.toLocaleString()}
              </text>
              <text
                x={x}
                y={height + 15}
                textAnchor="middle"
                fontSize="12"
                fill="#666"
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const Analytics = () => {
  const { profile } = useAuth();
  const { getAnalytics, loading } = useAdminUserAnalytics();

  const [timeRange, setTimeRange] = useState('7days');
  const [analyticsData, setAnalyticsData] = useState({
    total_streams: 0,
    revenue: 0,
    listeners: 0,
    engagement: 0,
    top_songs: [],
    top_countries: []
  });

  useEffect(() => {
    const fetchData = async () => {
      if (profile?.id || profile?.profile_id) {
        // Determine ID to use: try profile_id first, then id
        const targetId = profile.profile_id || profile.id;
        const data = await getAnalytics(targetId);

        if (data) {
          setAnalyticsData({
            total_streams: data.total_streams || 0,
            revenue: data.revenue || 0,
            listeners: data.listeners || 0,
            engagement: data.engagement || 0,
            top_songs: data.top_songs || [],
            top_countries: data.top_countries || []
          });
        }
      }
    };
    fetchData();
  }, [profile, getAnalytics]);

  const stats = [
    {
      label: 'Total Streams',
      value: Number(analyticsData.total_streams).toLocaleString(),
      icon: PlayCircle,
      isPositive: true
    },
    {
      label: 'Revenue',
      value: `$${Number(analyticsData.revenue).toLocaleString()}`,
      icon: DollarSign,
      isPositive: true
    },
    {
      label: 'Listeners',
      value: Number(analyticsData.listeners).toLocaleString(),
      icon: Users,
      isPositive: true
    },
    {
      label: 'Engagement',
      value: `${analyticsData.engagement}%`,
      icon: Activity,
      isPositive: true
    }
  ];

  // Green gradient for all icons
  const greenGradient = 'bg-gradient-to-br from-[#2D8C72] to-[#34A085]';

  return (
    <div className="min-h-screen overflow-hidden my-13" style={{ background: '#0a0a0a' }}>
      <Navbar name="Analytics" />

      {/* Main Content */}
      <div className="flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div>
            <h2 className="text-3xl font-bold text-white">Analytics</h2>
            <p className="text-sm text-gray-400 mt-1">Track your music performance</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Time Range Selector */}
            <div className="hidden sm:flex items-center gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
              {['7days', '30days', '90days'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${timeRange === range ? 'text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  style={{
                    background: timeRange === range ? 'rgba(45,140,114,0.2)' : 'transparent'
                  }}
                >
                  {range === '7days' ? '7D' : range === '30days' ? '30D' : '90D'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-6">

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-[#2d7a63] border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500">Loading analytics...</p>
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={index}
                      className="rounded-2xl p-5 transition-all hover:scale-[1.02] cursor-pointer"
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)'
                      }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${greenGradient}`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className={`flex items-center gap-1 text-sm font-semibold text-green-400`}>
                          <TrendingUp className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-sm text-gray-400 mb-1">{stat.label}</div>
                      <div className="text-3xl font-bold text-white">{stat.value}</div>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Streams Growth Chart (Using Mock History Generator) */}
                <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">Growth Trends</h3>
                      <p className="text-sm text-gray-400">Streams over time</p>
                    </div>
                  </div>

                  <div className="h-56 w-full">
                    <SimpleLineChart
                      data={generateMockHistory(analyticsData.total_streams)}
                      color="#2d7a63"
                    />
                  </div>
                </div>

                {/* Top Songs */}
                <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">Top Songs</h3>
                      <p className="text-sm text-gray-400">Most streamed tracks</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {analyticsData.top_songs && analyticsData.top_songs.length > 0 ? (
                      analyticsData.top_songs.map((song, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-4 p-3 rounded-xl transition-all hover:bg-white/5 cursor-pointer group"
                        >
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg ${greenGradient}`}>
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-white mb-1 truncate">{song.name}</div>
                            <div className="text-sm text-gray-400">
                              {song.streams ? Number(song.streams).toLocaleString() : '0'} streams
                            </div>
                          </div>
                          <div className={`flex items-center gap-1 text-sm font-semibold text-green-400`}>
                            {song.percentage}%
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">No song data available</p>
                    )}
                  </div>
                </div>

                {/* Top Countries */}
                <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">Top Countries</h3>
                      <p className="text-sm text-gray-400">Geographic distribution</p>
                    </div>
                    <Globe className="w-5 h-5 text-gray-400" />
                  </div>

                  <div className="space-y-4">
                    {analyticsData.top_countries && analyticsData.top_countries.length > 0 ? (
                      analyticsData.top_countries.map((country, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{country.flag}</span>
                              <div>
                                <div className="text-white font-medium">{country.name}</div>
                                <div className="text-sm text-gray-400">
                                  {country.streams ? Number(country.streams).toLocaleString() : '0'} streams
                                </div>
                              </div>
                            </div>
                            <div className="text-sm font-semibold text-gray-400">{country.percentage}%</div>
                          </div>
                          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.min(country.percentage, 100)}%`,
                                background: 'linear-gradient(90deg, #2D8C72 0%, #34A085 100%)'
                              }}
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">No country data available</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <BottomNav activeTab="analytics" />
    </div>
  );
};

export default Analytics;