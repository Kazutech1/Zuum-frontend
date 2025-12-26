import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Detect iOS devices (including Chrome iOS)
const isIOSDevice = () => {
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua);
};

// Utility function to get authenticated headers
const getAuthHeaders = () => {
  const headers = {};
  // For iOS devices, try to get token from localStorage as backup
  if (isIOSDevice()) {
    const token = localStorage.getItem('auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
};

axios.defaults.baseURL = API_URL;
axios.defaults.withCredentials = true; // Enable cookie authentication

export const useUserPosts = () => {
  const [posts, setPosts] = useState({
    beats: [],
    videos: [],
    audios: [],
    allPosts: []
  });
  const [loading, setLoading] = useState({
    beats: true,
    videos: true,
    audios: true
  });
  const [error, setError] = useState({
    beats: null,
    videos: null,
    audios: null
  });

  // Helper function to add type to posts
  const addTypeToPosts = (postsArray, type) => {
    return postsArray.map(post => ({
      ...post,
      type: type.toLowerCase()
    }));
  };

  // Fetch functions for each post type
  const fetchUserBeats = async () => {
    try {
      setLoading(prev => ({ ...prev, beats: true }));
      setError(prev => ({ ...prev, beats: null }));
      
      const response = await axios.get('/beat/user-posts', {
        headers: getAuthHeaders(),
        withCredentials: true,
      });

      // Handle both array and object response formats
      let beatsData = Array.isArray(response.data) ? response.data : 
                     response.data.posts || response.data.data || [];
      
      beatsData = addTypeToPosts(beatsData, 'beat');
      
      setPosts(prev => ({
        ...prev,
        beats: beatsData,
        allPosts: [...prev.videos, ...prev.audios, ...beatsData]
      }));
    } catch (err) {
      setError(prev => ({
        ...prev,
        beats: err.response?.data?.error || err.message || 'Failed to fetch beats'
      }));
      console.error('Error fetching beats:', err);
    } finally {
      setLoading(prev => ({ ...prev, beats: false }));
    }
  };

  const fetchUserVideos = async () => {
    try {
      setLoading(prev => ({ ...prev, videos: true }));
      setError(prev => ({ ...prev, videos: null }));
      
      const response = await axios.get('/video/user', {
        headers: getAuthHeaders(),
        withCredentials: true,
      });

      let videoPosts = Array.isArray(response.data) ? response.data : 
                      response.data.posts || response.data.data || [];
      
      videoPosts = addTypeToPosts(videoPosts, 'video');
      
      setPosts(prev => ({
        ...prev,
        videos: videoPosts,
        allPosts: [...prev.beats, ...videoPosts, ...prev.audios]
      }));
    } catch (err) {
      setError(prev => ({
        ...prev,
        videos: err.response?.data?.message || err.message || 'Failed to fetch videos'
      }));
      console.error('Error fetching videos:', err);
    } finally {
      setLoading(prev => ({ ...prev, videos: false }));
    }
  };

  const fetchUserAudios = async () => {
    try {
      setLoading(prev => ({ ...prev, audios: true }));
      setError(prev => ({ ...prev, audios: null }));
      
      const response = await axios.get('/audio/user', {
        headers: getAuthHeaders(),
        withCredentials: true,
      });

      let audioPosts = Array.isArray(response.data) ? response.data : 
                      response.data.posts || response.data.data || [];
      
      audioPosts = addTypeToPosts(audioPosts, 'audio');
      
      setPosts(prev => ({
        ...prev,
        audios: audioPosts,
        allPosts: [...prev.beats, ...prev.videos, ...audioPosts]
      }));
    } catch (err) {
      setError(prev => ({
        ...prev,
        audios: err.response?.data?.message || err.message || 'Failed to fetch audios'
      }));
      console.error('Error fetching audios:', err);
    } finally {
      setLoading(prev => ({ ...prev, audios: false }));
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchUserBeats();
    fetchUserVideos();
    fetchUserAudios();
  }, []);

  // Combined loading state
  const isLoading = loading.beats || loading.videos || loading.audios;

  // Combined error state
  const hasError = error.beats || error.videos || error.audios;

  // Combined empty state
  const isEmpty = !isLoading && 
                 !hasError && 
                 posts.beats.length === 0 && 
                 posts.videos.length === 0 && 
                 posts.audios.length === 0;

  // Refetch all
  const refetchAll = async () => {
    await Promise.all([fetchUserBeats(), fetchUserVideos(), fetchUserAudios()]);
  };

  return {
    // Individual post collections
    beats: posts.beats,
    videos: posts.videos,
    audios: posts.audios,
    
    // Combined collection (all posts mixed together)
    allPosts: posts.allPosts,
    
    // Loading states
    loading: {
      beats: loading.beats,
      videos: loading.videos,
      audios: loading.audios,
      all: isLoading
    },
    
    // Error states
    error: {
      beats: error.beats,
      videos: error.videos,
      audios: error.audios,
      any: hasError
    },
    
    // Utility states
    isEmpty,
    
    // Refetch functions
    refetch: {
      beats: fetchUserBeats,
      videos: fetchUserVideos,
      audios: fetchUserAudios,
      all: refetchAll
    }
  };
};















/**
 * Hook for promoting posts (audio, video, or beats)
 * @returns {Object} Promotion functions and state
 */





export const usePromotePost = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [responseData, setResponseData] = useState(null);

  /**
   * Promote a post
   * @param {string} postId - ID of post
   * @param {'audio'|'video'|'beat'} type - Type of content
   * @param {number} durationDays - How many days to promote
   */
  const promotePost = async (postId, type, durationDays) => {
    // 1. Validation
    if (!postId || !type || !durationDays) {
      throw new Error('Missing parameters');
    }

    // 2. Calculate Timeline (Current Time + Duration Days)
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + parseInt(durationDays));
    const timeline = futureDate.toISOString(); // Format: 2026-04-21T01:38:25.431Z

    const payload = {
      postId: String(postId),
      timeline: timeline,
      type: type
    };

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // 3. Send to correct API endpoint
      const response = await axios.post('/payment/promote', payload, {
        withCredentials: true,
      });

      setSuccess(true);
      setResponseData(response.data); // Contains the actual 'amount' deducted
      return response.data;

    } catch (err) {
      let errMsg = 'Something went wrong';
      
      if (err.response) {
        // Handle specific status codes based on your docs
        if (err.response.status === 406) {
          errMsg = 'Insufficient funds in your wallet.';
        } else if (err.response.status === 404) {
          errMsg = 'Post not found.';
        } else {
          errMsg = err.response.data.message || 'Server error';
        }
      } else {
        errMsg = err.message;
      }
      
      setError(errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setError(null);
    setSuccess(false);
    setResponseData(null);
  };

  return { promotePost, loading, error, success, responseData, reset };
};










/**
 * Hook for submitting music distribution requests with specific error handling
 * @returns {Object} Distribution functions and state
 */












export const usePackages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('/packages', {
        headers: getAuthHeaders(),
        withCredentials: true,
      });

      // Handle both array and object response formats
      let packagesData = Array.isArray(response.data) ? response.data : 
                       response.data.packages || response.data.data || [];
      
      setPackages(packagesData);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch packages');
      console.error('Error fetching packages:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch packages on component mount
  useEffect(() => {
    fetchPackages();
  }, []);

  return {
    packages,
    loading,
    error,
    refetch: fetchPackages // Option to manually refetch
  };
};









 const usePromtePost = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [responseData, setResponseData] = useState(null);

  /**
   * Promote a post
   * @param {string|number} postId - ID of post to promote
   * @param {'audio'|'video'|'beat'} type - Type of post
   * @param {number} durationDays - Duration of promotion in days (e.g., 7)
   */
  const promotePost = async (postId, type, durationDays) => {
    // 1. Validate input
    if (!postId || !type || !durationDays) {
      const errMsg = 'Missing required parameters: postId, type, or duration';
      console.error('[usePromotePost] Validation error:', errMsg);
      throw new Error(errMsg);
    }

    const validTypes = ['audio', 'video', 'beat'];
    if (!validTypes.includes(type)) {
      throw new Error(`Invalid type: ${type}`);
    }

    // 2. Calculate the Timeline (Future Date)
    // The API expects a timestamp string. We calculate Current Date + Duration Days
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + Number(durationDays));
    
    // Format: ISO 8601 (e.g., "2026-04-21T01:38:25.431Z")
    // This matches the backend requirement for a timestamptz
    const timeline = futureDate.toISOString(); 

    const payload = {
      postId: String(postId),
      timeline: timeline,
      type: type
    };

    console.log('[usePromotePost] Sending payload:', payload);

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // 3. Updated URL to match your curl request: /api/payment/promote
      const response = await axios.post('/payment/promote', payload, {
        withCredentials: true, // If relyion cookies
        headers: {
            'Content-Type': 'application/json'
        }
      });

      console.log('[usePromotePost] Success:', response.data);
      setSuccess(true);
      setResponseData(response.data);
      return response.data;

    } catch (err) {
      // ... Error handling logic remains the same ...
      let errorMessage = 'An error occurred';
      
      if (err.response) {
        console.error('[usePromotePost] Server Error:', err.response.data);
        switch (err.response.status) {
          case 406:
            errorMessage = 'Insufficient funds';
            break;
          case 404:
            errorMessage = 'Post not found';
            break;
          case 400:
            errorMessage = err.response.data.message || 'Invalid request';
            break;
          default:
            errorMessage = err.response.data.message || 'Server error';
        }
      } else {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setError(null);
    setSuccess(false);
    setResponseData(null);
  };

  return {
    promotePost,
    loading,
    error,
    success,
    responseData,
    reset
  };
};





export const useMassPromotion = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const createPromotion = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      setData(null);

      // Validate category first
      const validCategories = ['print', 'tv', 'radio', 'chart', 'digital', 'playlist', 'international'];
      if (!formData.category || !validCategories.includes(formData.category)) {
        throw new Error('Invalid category');
      }

      // Prepare form data for file uploads
      const postData = new FormData();
      
      // Add common fields
      postData.append('category', formData.category);
      postData.append('package_id', formData.package_id);

      // Add category-specific fields
      switch (formData.category) {
        case 'print':
        case 'international':
          postData.append('title', formData.title);
          postData.append('body', formData.body);
          if (formData.description) postData.append('description', formData.description);
          postData.append('image', formData.image);
          break;
        case 'tv':
          postData.append('title', formData.title);
          postData.append('biography', formData.biography);
          postData.append('hd_video', formData.hd_video);
          break;
        case 'radio':
        case 'chart':
        case 'playlist':
          postData.append('song_link', formData.song_link);
          break;
        case 'digital':
          postData.append('artist_name', formData.artist_name);
          postData.append('biography', formData.biography);
          postData.append('artist_photo', formData.artist_photo);
          break;
        default:
          throw new Error('Unsupported category');
      }

      const response = await axios.post('/promotions/mass', postData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...getAuthHeaders(),
        },
        withCredentials: true,
      });











export const useUserPromotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    limit: 10,
    offset: 0,
    total: 0
  });

  const fetchPromotions = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('/packages/myPromotions', {
        headers: getAuthHeaders(),
        params: {
          limit: pagination.limit,
          offset: pagination.offset,
          ...params
        },
        withCredentials: true
      });

      // Handle the actual API response structure
      const promotionsData = response.data.results || [];
      const total = response.data.total || 0;
      
      setPromotions(promotionsData);
      setPagination(prev => ({
        ...prev,
        total: total
      }));
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch promotions');
    } finally {
      setLoading(false);
    }
  };

  const refetch = (params) => {
    fetchPromotions(params);
  };

  const loadMore = (newOffset) => {
    if (newOffset !== undefined) {
      setPagination(prev => ({
        ...prev,
        offset: newOffset
      }));
    } else if (pagination.offset + pagination.limit < pagination.total) {
      setPagination(prev => ({
        ...prev,
        offset: prev.offset + prev.limit
      }));
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, [pagination.offset, pagination.limit]);

  return {
    promotions,
    loading,
    error,
    pagination,
    refetch,
    loadMore,
    setLimit: (limit) => setPagination(prev => ({ ...prev, limit, offset: 0 }))
  };
};

