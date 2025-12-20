import React, { useState } from 'react'
import Navbar from '../components/profile/NavBar'
import Sidebar from '../components/homepage/Sidebar'
import Overlay from '../components/homepage/Overlay'
import BottomNav from '../components/homepage/BottomNav'
import { useAuth } from '../contexts/AuthContexts'
import { Link } from 'react-router-dom'
// import DarkModeSettings from '../components/DarkModeSettings'
import { useDarkMode } from '../contexts/DarkModeContext'

const Settings = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { token, logout } = useAuth(); // Access auth context
  const { isDarkMode, toggleDarkMode } = useDarkMode(); // Access dark mode context

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Dark mode styles from Announcements for consistency
  const darkModeStyles = {
    '--color-bg-primary': '#1a1a1a',
    '--color-bg-secondary': '#2d2d2d',
    '--color-text-primary': '#ffffff',
    '--color-text-secondary': '#9ca3af',
    '--color-accent-primary': '#2D8C72',
    '--color-accent-secondary': '#34A085',
    '--color-gradient-primary': 'linear-gradient(135deg, #2D8C72 0%, #34A085 100%)',
    '--color-gradient-secondary': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    '--color-gradient-tertiary': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    '--color-border': '#374151',
    '--color-card-bg': '#2d2d2d',
    '--color-card-hover': '#3d3d3d'
  };

  return (
    <div
      className="min-h-screen"
      style={{
        ...darkModeStyles,
        backgroundColor: 'var(--color-bg-primary)',
        color: 'var(--color-text-primary)'
      }}
    >
      <Navbar toggleSidebar={toggleSidebar} name={"Settings"} />
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <Overlay isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="pt-16 pb-20 px-4 max-w-2xl mx-auto">


        {/* Other Settings */}
        <section
          id="settings-section"
          className="rounded-lg shadow-md p-5 w-full"
          style={{
            backgroundColor: 'var(--color-card-bg)',
            border: '1px solid var(--color-border)'
          }}
        >
          <h2
            className="text-xl font-semibold mb-6"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Account Settings
          </h2>

          <ul className="space-y-4">
            {/* Dashboard */}
            <Link
              to='/dashboard'
              className="py-3 border-b flex justify-between items-center rounded-lg px-3 transition-colors"
              style={{
                borderBottomColor: 'var(--color-border)',
                color: 'var(--color-text-primary)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-card-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <span>Dashboard</span>
              <span style={{ color: 'var(--color-text-secondary)' }}>→</span>
            </Link>

            {/* Deactivate Account */}
            <li
              className="py-3 border-b flex justify-between items-center rounded-lg px-3 transition-colors"
              style={{
                borderBottomColor: 'var(--color-border)',
                color: 'var(--color-text-primary)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-card-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <span>Deactivate Account</span>
              <button
                className="hover:text-red-700 transition-colors"
                style={{ color: '#dc2626' }}
              >
                Deactivate
              </button>
            </li>

            {/* Delete Account */}
            <li
              className="py-3 flex justify-between items-center rounded-lg px-3 transition-colors"
              style={{ color: 'var(--color-text-primary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-card-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <span>Delete Account</span>
              <button
                className="hover:text-red-700 transition-colors"
                style={{ color: '#dc2626' }}
              >
                Delete
              </button>
            </li>
          </ul>

          {/* Log Out Button */}
          <button className="bg-[#008066] text-white rounded-2xl px-6 py-3 block mx-auto mt-8 hover:bg-[#006652] transition-colors"
            onClick={logout} >
            Log Out
          </button>
        </section>
      </div>

      <BottomNav />
    </div>
  )
}

export default Settings