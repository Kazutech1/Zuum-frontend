import React, { useState, useRef, useEffect } from 'react';
import { FaMusic, FaUpload } from 'react-icons/fa';
import { useCreateAudioPost } from '../../../Hooks/audioPosts/useCreateAudio';
import FileUploadSection from '../../components/upload/FileUploadSection';
import PlatformLinksSection from '../../components/upload/PlatformLinksSection';
import Navbar from '../../components/profile/NavBar';
import Sidebar from '../../components/homepage/Sidebar';
import Overlay from '../../components/homepage/Overlay';
import BottomNav from '../../components/homepage/BottomNav';
import { useNavigate } from 'react-router-dom';
import { useAlerts } from '../../contexts/AlertConntexts';


const MusicUploadForm = () => {
  const [formData, setFormData] = useState({
    caption: '',
    type: 'music',
    boomplay: '',
    apple_music: '',
    spotify: '',
    audiomark: '',
    youtube_music: '',
    cover_photo: null,
    audio_upload: null
  });

  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const { showSuccess, showError, showInfo, showWarning } = useAlerts();
  const { createAudioPost, loading, error, success } = useCreateAudioPost();

  useEffect(() => {
    if (success) {
      showSuccess('Audio uploaded successfully!');
      // Reset form
      setFormData({
        caption: '',
        type: 'music',
        boomplay: '',
        apple_music: '',
        spotify: '',
        audiomark: '',
        youtube_music: '',
        cover_photo: null,
        audio_upload: null
      });
      setPreviewImage(null);
      // Navigate after a short delay to allow the success message to be seen
      setTimeout(() => navigate('/home'), 1500);
    }
  }, [success, navigate, showSuccess]);

  useEffect(() => {
    if (error) {
      showError(error);
    }
  }, [error, showError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (e.target.name === 'cover_photo') {
        if (!file.type.match('image.*')) {
          showError('Please select an image file for the cover photo');
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          showError('Cover photo must be less than 5MB');
          return;
        }
        setPreviewImage(URL.createObjectURL(file));
        showInfo('Cover photo selected');
      }
      
      if (e.target.name === 'audio_upload') {
        if (!file.type.match('audio.*')) {
          showError('Please select an audio file');
          return;
        }
        if (file.size > 50 * 1024 * 1024) {
          showError('Audio file must be less than 50MB');
          return;
        }
        showInfo('Audio file selected');
      }
      
      setFormData(prev => ({
        ...prev,
        [e.target.name]: file
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.caption) {
      newErrors.caption = 'Caption is required';
      showError('Please add a caption for your audio');
    }
    
    if (!formData.audio_upload) {
      newErrors.audio_upload = 'Audio file is required';
      showError('Please select an audio file to upload');
    }
    
    const hasPlatformLink = ['boomplay', 'apple_music', 'spotify', 'audiomark', 'youtube_music']
      .some(platform => formData[platform].trim() !== '');
    
    if (!hasPlatformLink) {
      newErrors.platforms = 'At least one platform link is required';
      showWarning('Adding at least one platform link is recommended');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const apiFormData = new FormData();
      apiFormData.append('caption', formData.caption);
      apiFormData.append('type', formData.type);
      
      if (formData.spotify) apiFormData.append('spotify', formData.spotify);
      if (formData.apple_music) apiFormData.append('apple_music', formData.apple_music);
      if (formData.youtube_music) apiFormData.append('youtube_music', formData.youtube_music);
      if (formData.boomplay) apiFormData.append('boomplay', formData.boomplay);
      if (formData.audiomark) apiFormData.append('audiomark', formData.audiomark);
      
      if (formData.cover_photo) apiFormData.append('cover_photo', formData.cover_photo);
      if (formData.audio_upload) apiFormData.append('audio_upload', formData.audio_upload);

      await createAudioPost(apiFormData);
      
    } catch (err) {
      showError('Failed to upload audio. Please try again.');
      console.error('Error during submission:', err);
    }
  };

  const triggerFileInput = (type) => {
    if (type === 'image') {
      fileInputRef.current.click();
    } else {
      audioInputRef.current.click();
    }
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="min-h-screen bg-gray-50 mb-13">
      <Navbar name={"Upload Beats"} toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <Overlay isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Debug Info Panel - Optional, can be removed in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="p-4 bg-gray-100 border-b border-gray-200">
            <details>
              <summary className="font-medium text-gray-700 cursor-pointer">Debug Information</summary>
              <div className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-auto max-h-40">
                <div><strong>Loading:</strong> {loading ? 'true' : 'false'}</div>
                <div><strong>Success:</strong> {success ? 'true' : 'false'}</div>
                <div><strong>Error:</strong> {error ? error : 'null'}</div>
                <div><strong>API URL:</strong> {import.meta.env.VITE_API_URL || 'Not defined'}</div>
                <div><strong>Auth Token:</strong> {localStorage.getItem('authToken') ? 'Exists' : 'Missing'}</div>
                <div><strong>Files:</strong> 
                  Cover: {formData.cover_photo ? `${formData.cover_photo.name} (${formData.cover_photo.size} bytes)` : 'None'}, 
                  Audio: {formData.audio_upload ? `${formData.audio_upload.name} (${formData.audio_upload.size} bytes)` : 'None'}
                </div>
              </div>
            </details>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Caption */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Caption</label>
            <input
              type="text"
              name="caption"
              value={formData.caption}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              placeholder="Describe your audio..."
              disabled={loading}
            />
            {errors.caption && <p className="text-rose-500 text-sm mt-1">{errors.caption}</p>}
          </div>
          
          {/* Type Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <div className="flex gap-4">
              <label className="relative flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="music"
                  checked={formData.type === 'music'}
                  onChange={handleChange}
                  className="sr-only"
                  disabled={loading}
                />
                <span className={`h-5 w-5 rounded-full border ${formData.type === 'music' ? 'bg-emerald-600 border-emerald-600' : 'bg-white border-gray-300'} flex items-center justify-center transition-colors`}>
                  {formData.type === 'music' && <span className="h-2 w-2 rounded-full bg-white"></span>}
                </span>
                <span className={`${formData.type === 'music' ? 'text-emerald-800 font-medium' : 'text-gray-600'}`}>Music</span>
              </label>
              
              <label className="relative flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="beat"
                  checked={formData.type === 'beat'}
                  onChange={handleChange}
                  className="sr-only"
                  disabled={loading}
                />
                <span className={`h-5 w-5 rounded-full border ${formData.type === 'beat' ? 'bg-emerald-600 border-emerald-600' : 'bg-white border-gray-300'} flex items-center justify-center transition-colors`}>
                  {formData.type === 'beat' && <span className="h-2 w-2 rounded-full bg-white"></span>}
                </span>
                <span className={`${formData.type === 'beat' ? 'text-emerald-800 font-medium' : 'text-gray-600'}`}>Beat</span>
              </label>
            </div>
          </div>
          
          {/* File Upload Section */}
          <FileUploadSection 
            previewImage={previewImage}
            formData={formData}
            errors={errors}
            loading={loading}
            triggerFileInput={triggerFileInput}
            handleFileChange={handleFileChange}
            setPreviewImage={setPreviewImage}
            setFormData={setFormData}
            fileInputRef={fileInputRef}
            audioInputRef={audioInputRef}
          />
          
          {/* Platform Links Section */}
          <PlatformLinksSection 
            formData={formData}
            errors={errors}
            loading={loading}
            handleChange={handleChange}
          />
          
          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full py-3 px-6 rounded-lg font-medium text-base transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
              loading 
                ? 'bg-emerald-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
            disabled={loading}
          >
            <div className="flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <FaUpload />
                  <span>Upload Audio</span>
                </>
              )}
            </div>
          </button>
        </form>
      </div>
      <BottomNav activeTab="upload" />
    </div>
  );
};

export default MusicUploadForm;