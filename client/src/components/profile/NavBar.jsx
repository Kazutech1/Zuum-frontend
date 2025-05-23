import React from 'react';
import { Link } from 'react-router-dom';
import { FiMenu, FiChevronLeft, FiSearch, FiSettings } from 'react-icons/fi';

const Navbar = ({ 
  toggleSidebar, 
  name, 
  profilePicture, 
  goBack, 
  isDashboardPage,
  isMessagePage 
}) => {
  // Truncate name if it's too long
  const displayName = name.length > 8 ? name.substring(0, 10) + "..." : name;

  return (
  <div className="navbar bg-white/80 backdrop-blur-md shadow-md flex items-center justify-between px-4 py-3 fixed top-0 left-0 w-full z-50">

      {/* Left Section */}
      <div className="nav-left">
        {isMessagePage || isDashboardPage ? (
          <FiChevronLeft
            className="w-6 h-6 cursor-pointer text-gray-700"
            onClick={goBack}
          />
        ) : (
          <FiMenu
            className="w-6 h-6 cursor-pointer text-gray-700"
            onClick={toggleSidebar}
          />
        )}
      </div>

      {/* Middle Section */}
      <div className="flex items-center space-x-2 bg-[#2D8C72] px-4 py-1 rounded-full">
        {isMessagePage && profilePicture && (
          <img
            src={profilePicture}
            alt={name}
            className="w-8 h-8 rounded-full object-cover border border-gray-300"
          />
        )}
        <div className="bg-[#2D8C72] rounded-full px-4 py-1 flex items-center">
          <span className="text-white font-bold">{displayName}</span>
        </div>
      </div>

      {/* Right Section */}
      <div className="nav-right flex space-x-4">
        {!(isDashboardPage || isMessagePage) && (
          <>
            <Link to="/search">
              <FiSearch className="w-6 h-6 text-gray-700" />
            </Link>
            <Link to="/settings">
              <FiSettings className="w-6 h-6 text-gray-700" />
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;