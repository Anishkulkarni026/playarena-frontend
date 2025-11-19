// src/components/Header.tsx
"use client";
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react'; 
import { User, Bell, ChevronDown, LogOut, Shield, Briefcase } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// --- 1. NEW INTERFACE ---
interface Notification {
  id: number;
  message: string;
  type: string;
  is_read: boolean;
}

const DropdownLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link 
    href={href} 
    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
  >
    {children}
  </Link>
);

const Header = () => {
  const { isLoggedIn, logout, role, token } = useAuth(); // Get token too

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  // --- 2. NEW STATE ---
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // --- 3. FETCH NOTIFICATIONS ---
  useEffect(() => {
    if (!isLoggedIn || !token) return;

    const fetchNotifications = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/v1/notifications', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    };

    fetchNotifications();
    // Optional: Poll every 30 seconds for new notifications
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [isLoggedIn, token]);

  const toggleNotification = () => {
    setIsNotificationOpen(!isNotificationOpen);
    setIsProfileOpen(false);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
    setIsNotificationOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 w-full bg-black text-gray-300 h-14 flex items-center z-50">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between px-6">
        
        <div className="flex-shrink-0">
          <Link 
            href="/" 
            className="text-xl font-semibold text-white hover:text-gray-200"
            aria-label="PlayArena Home"
          >
            PlayArena
          </Link>
        </div>

        <nav className="hidden md:flex flex-grow justify-center items-center space-x-8">
          
          {/* Sports */}
          <div className="group relative pb-2">
            <button className="flex items-center space-x-1 text-sm hover:text-white transition-colors">
              <span>Sports</span>
              <ChevronDown className="h-4 w-4" />
            </button>
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-56 bg-white rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none group-hover:pointer-events-auto">
              <DropdownLink href="/sports/swimming-pools">Explore all Swimming Pools</DropdownLink>
              <DropdownLink href="/sports/turfs">Explore all Turfs</DropdownLink>
              <DropdownLink href="/sports/badminton">Explore all Badminton Courts</DropdownLink>
              <DropdownLink href="/sports/snooker">Explore all Snooker Clubs</DropdownLink>
            </div>
          </div>

          {/* My Bookings */}
          {isLoggedIn && (
            <div className="group relative pb-2">
              <button className="flex items-center space-x-1 text-sm hover:text-white transition-colors">
                <span>My Bookings</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-48 bg-white rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none group-hover:pointer-events-auto">
                <DropdownLink href="/bookings/past">Past Bookings</DropdownLink>
                <DropdownLink href="/bookings/pending">Pending Bookings</DropdownLink>
                <DropdownLink href="/bookings/upcoming">Upcoming Bookings</DropdownLink>
                <DropdownLink href="/bookings/canceled">Canceled Bookings</DropdownLink>
              </div>
            </div>
          )}

          {/* Involved Teams */}
          {isLoggedIn && (role === 'player' || role === 'admin') && (
            <div className="group relative pb-2">
              <button className="flex items-center space-x-1 text-sm hover:text-white transition-colors">
                <span>Involved Teams</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-48 bg-white rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none group-hover:pointer-events-auto">
                <DropdownLink href="/teams">Existing Teams</DropdownLink>
                <DropdownLink href="/teams/new">Create a New Team</DropdownLink>
                <DropdownLink href="/teams">Manage Teams</DropdownLink>
                <DropdownLink href="/teams">Team Chats</DropdownLink>
              </div>
            </div>
          )}

          {/* About Us */}
          <div className="group relative pb-2">
            <button className="flex items-center space-x-1 text-sm hover:text-white transition-colors">
              <span>About Us</span>
              <ChevronDown className="h-4 w-4" />
            </button>
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-48 bg-white rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none group-hover:pointer-events-auto">
              <DropdownLink href="/about/developers">Developers</DropdownLink>
              <DropdownLink href="/about/newsroom">Newsroom</DropdownLink>
            </div>
          </div>

          {/* Support */}
          <div className="group relative pb-2">
            <button className="flex items-center space-x-1 text-sm hover:text-white transition-colors">
              <span>Support</span>
              <ChevronDown className="h-4 w-4" />
            </button>
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-48 bg-white rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none group-hover:pointer-events-auto">
              <DropdownLink href="/support/contact">Get Support</DropdownLink>
              <DropdownLink href="/support/feedback">Feedback</DropdownLink>
              <DropdownLink href="/support/report">Report</DropdownLink>
            </div>
          </div>

          {/* Owner Dashboard Link */}
          {isLoggedIn && role === 'owner' && (
            <Link href="/owner/dashboard" className="flex items-center space-x-1 text-sm hover:text-white transition-colors">
              <Briefcase className="h-4 w-4" />
              <span>My Venues</span>
            </Link>
          )}

          {/* Admin Panel Link */}
          {isLoggedIn && role === 'admin' && (
            <Link href="/admin/dashboard" className="flex items-center space-x-1 text-sm hover:text-white transition-colors">
              <Shield className="h-4 w-4" />
              <span>Admin Panel</span>
            </Link>
          )}

        </nav>

        {/* --- Right Icons --- */}
        <div className="flex-shrink-0 flex items-center space-x-6">
          
          {/* Notification Icon */}
          {isLoggedIn && (
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={toggleNotification}
                className="hover:text-white transition-colors relative" 
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {/* Red dot if unread notifications exist */}
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-white bg-red-500 transform translate-x-1/2 -translate-y-1/2"></span>
                )}
              </button>
              
              {isNotificationOpen && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-50">
                  <div className="p-3 bg-gray-50 border-b border-gray-100">
                    <p className="text-gray-800 font-semibold text-sm">Notifications</p>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {/* --- 4. RENDER REAL NOTIFICATIONS --- */}
                    {notifications.length === 0 ? (
                      <p className="p-4 text-sm text-gray-500 text-center">No new notifications</p>
                    ) : (
                      notifications.map((notif) => (
                        <div key={notif.id} className={`block px-4 py-3 text-sm hover:bg-gray-50 border-b border-gray-100 ${!notif.is_read ? 'bg-blue-50' : ''}`}>
                          <p className="text-gray-800">{notif.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Profile Icon */}
          {isLoggedIn ? (
            <div className="relative" ref={profileRef}>
              <button 
                onClick={toggleProfile}
                className="hover:text-white transition-colors" 
                aria-label="Profile"
              >
                <User className="h-5 w-5" />
              </button>
              
              {isProfileOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
                  <DropdownLink href="/profile/info">Your Info</DropdownLink>
                  <DropdownLink href="/profile/edit">Edit Info</DropdownLink>
                  <DropdownLink href="/profile/payment-methods">Saved Payment Methods</DropdownLink>
                  <DropdownLink href="/profile/payments">Past Payments</DropdownLink>
                  
                  {role === 'player' && (
                    <DropdownLink href="/owner/venues/new">List Your Turf</DropdownLink>
                  )}
                  
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link 
              href="/login" 
              className="hover:text-white transition-colors" 
              aria-label="Login"
            >
              <User className="h-5 w-5" />
            </Link>
          )}

        </div>
      </div>
    </header>
  );
};

export default Header;