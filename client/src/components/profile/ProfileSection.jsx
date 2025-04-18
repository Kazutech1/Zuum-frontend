import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import classNames from "classnames";
import c from "../../assets/icons/ORSJOS0 1.png";
import d from "../../assets/icons/Mask group1.svg";
import { FiBarChart, FiMail, FiPhone, FiCalendar, FiCreditCard, FiEdit, FiShare2 } from "react-icons/fi";
import MusicSection from "./MusicSection";
import VideoSection from "./VideoSection";

const ProfileSection = ({ profile }) => {
  // Fallback data in case profile is null or undefined
  const fallbackProfile = useMemo(() => ({
    cover_image: c,
    image: d,
    username: "Dave_sings",
    identity: "Artist",
    bio: "I'm a singer-songwriter, weaving emotions into melodies that touch hearts and inspire minds.",
    followers_list: [],
    following_list: [],
    firstname: "",
    lastname: "",
    email: "",
    phonenumber: "",
    subscription_status: null,
  }), []);

  // Merge profile data with fallback data
  const mergedProfile = useMemo(() => ({ ...fallbackProfile, ...profile }), [profile, fallbackProfile]);

  // State to manage active tab
  const [activeTab, setActiveTab] = useState("audio");

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="profile-container relative bg-gray-50 ">
      {/* Background Image with Dashboard Icon */}
      <div className="profile-background h-64 overflow-hidden rounded-t-lg relative">
        <img
          src={mergedProfile.cover_image || c}
          alt="Profile Background"
          className="w-full h-full object-cover"
        />
        {/* Dashboard Icon */}
        <Link 
          to="/dashboard" 
          className="absolute top-4 right-4 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition-all"
          title="Go to Dashboard"
        >
          <FiBarChart className="w-5 h-5 text-[#008066]" />
        </Link>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      </div>

      {/* Profile Image */}
      <div className="profile-header absolute top-48 ml-6  transform -translate-x-1">
        <div className="relative">
          <img
            src={mergedProfile.image || d}
            alt="Profile"
            className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
          />
          {mergedProfile.is_admin && (
            <span className="absolute bottom-1 right-1 bg-[#008066] text-white text-xs px-3 py-1 rounded-full">
              Admin
            </span>
          )}
        </div>
      </div>

      {/* User Info */}
      <div className="stats-container flex flex-col items-center mt-20 w-full px-5 text-center">
        <h2 className="text-2xl font-bold text-[#008066]">{mergedProfile.username}</h2>
        <p className="text-gray-500 capitalize">{mergedProfile.identity}</p>
        <p className="text-sm text-gray-600 mt-1">
          {mergedProfile.firstname} {mergedProfile.middlename} {mergedProfile.lastname}
        </p>
      </div>

      <div className="stats flex-1 p-4 ">
          <div className="flex justify-around gap-4">
            {["Followers", "Following"].map((item, index) => (
              <div key={index} className="text-center">
                <span className="text-lg font-bold text-[#008066]">
                  {index === 0 ? mergedProfile.followers || 0 : mergedProfile.following || 0}
                </span>
                <p className="text-gray-600 text-sm">{item}</p>
              </div>
            ))}
          </div>
        </div>


        <div className="buttons flex justify-center mb-6 w-full gap-4 px-8">
  <Link to="/editprofile" className="flex-1">
    <button className="w-full bg-white border border-[#008066] text-[#008066] px-6 py-2 rounded-lg hover:bg-gray-50 transition shadow-sm font-medium flex items-center justify-center">
      <FiEdit className="mr-2" /> Edit
    </button>
  </Link>
  <button className="flex-1 bg-[#008066] text-white px-6 py-2 rounded-lg hover:bg-[#006e58] transition shadow-sm font-medium flex items-center justify-center">
    <FiShare2 className="mr-2" /> Share
  </button>
</div>


      {/* Bio */}
      <div className="bio-container mt-4 px-8">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Bio</h3>
          <p className="text-gray-700">
            {mergedProfile.bio || "No bio provided"}
          </p>
        </div>
      </div>

      {/* Stats and Contact in Flex Row */}
      <div className="flex flex-col md:flex-row justify-between px-8 mt-6 gap-4">
        {/* Followers & Following */}
        

        {/* Contact Information */}
        <div className="contact-info flex-1 bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Contact Info</h3>
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <FiMail className="mr-2 text-[#008066]" />
              <span>{mergedProfile.email || "N/A"}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <FiPhone className="mr-2 text-[#008066]" />
              <span>{mergedProfile.phonenumber || "N/A"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="flex flex-col md:flex-row justify-between px-8 mt-4 gap-4 mb-6">
        <div className="flex-1 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center text-sm text-gray-600">
            <FiCalendar className="mr-2 text-[#008066]" />
            <span>Joined: {formatDate(mergedProfile.created_at)}</span>
          </div>
        </div>
        <div className="flex-1 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center text-sm text-gray-600">
            <FiCreditCard className="mr-2 text-[#008066]" />
            <span>Subscription: {mergedProfile.subscription_status || "None"}</span>
          </div>
        </div>
      </div>

      {/* Profile Actions */}
      
      {/* Tab Section */}
      <div className="tab-section pt-4 w-full bg-white rounded-b-lg">
        <div className="tab-buttons flex justify-center gap-8 border-b border-gray-200">
          {["audio", "video"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={classNames(
                "pb-4 px-6 text-lg font-medium relative transition-all",
                activeTab === tab
                  ? "text-[#008066] font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-[3px] after:bg-[#008066] after:rounded-t-lg"
                  : "text-gray-500 hover:text-[#008066]"
              )}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="tab-content p-6">
          {activeTab === "audio" ? (
            <MusicSection userId={mergedProfile.id} />
          ) : (
            <VideoSection userId={mergedProfile.id} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;