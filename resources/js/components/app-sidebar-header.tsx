import React, { useEffect, useRef, useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type SharedData, type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { 
  Bell,
  Search,
  Calendar,
  Plus,
  Activity,
  ChevronDown,
  Settings,
  Wallet,
  User,
  LogOut,
  Shield
} from 'lucide-react';
import { edit } from '@/routes/profile';

interface AppSidebarHeaderProps {
  breadcrumbs?: BreadcrumbItemType[];
}

export function AppSidebarHeader({
  breadcrumbs = []
}: AppSidebarHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Get recentActivity from global Inertia props
  const { auth, recentActivity = [] } = usePage<SharedData>().props;
  const activities = Array.isArray(recentActivity) ? recentActivity : [];

  const formatRelativeTime = (date?: string) => {
    if (!date) return 'N/A';
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    router.post('/logout');
  };

  return (
    <div className="flex items-center justify-between px-6 py-4 mb-8 shadow-2xl pt-7 border-b border-white/5 pb-7">
      {/* Left Section: Profile */}
      <div className="flex items-center space-x-4">
        <SidebarTrigger className="-ml-1" />
        
        <div className="relative">
          <img 
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ryan" 
            alt="Ryan Crawford" 
            className="w-12 h-12 rounded-full border-2 border-[#1e1e24] bg-[#1e1e24]"
          />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <span className="text-gray-500 text-xs font-medium">
              {auth.user?.email}
            </span>
            <span className="bg-[#1e1e24] text-[#a0a0ff] text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
              {auth.user?.role === 'admin' ? 'PRO' : 'FREE'}
            </span>
          </div>
          
          {/* Profile Dropdown Button */}
          <div className="relative" ref={profileRef}>
            <button 
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center text-white font-semibold text-sm group"
            >
              <span>{auth.user?.role === 'admin' ? 'Administrator' : 'Client User'}</span>
              <ChevronDown size={14} className="ml-1 text-gray-500 group-hover:text-white transition-colors" />
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileDropdown && (
              <div className="absolute left-0 mt-3 w-64 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl z-50 backdrop-blur-xl">
                <div className="p-4 border-b border-white/5">
                  <div className="flex items-center space-x-3">
                    <img 
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ryan" 
                      alt={auth.user?.name} 
                      className="w-10 h-10 rounded-full border-2 border-[#1e1e24] bg-[#1e1e24]"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-white">{auth.user?.name}</span>
                      <span className="text-xs text-gray-400">{auth.user?.email}</span>
                    </div>
                  </div>
                </div>

                <div className="py-2">
                  <Link
                    href={edit().url}
                    className="flex items-center space-x-3 px-4 py-3 hover:bg-white/5 transition-colors group"
                  >
                    <User size={16} className="text-gray-400 group-hover:text-white" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-white">Profile Settings</span>
                      <span className="text-xs text-gray-500">Update your name and email</span>
                    </div>
                  </Link>

                  {auth.user?.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="flex items-center space-x-3 px-4 py-3 hover:bg-white/5 transition-colors group"
                    >
                      <Shield size={16} className="text-gray-400 group-hover:text-white" />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-white">Admin Dashboard</span>
                        <span className="text-xs text-gray-500">Manage system settings</span>
                      </div>
                    </Link>
                  )}

                  <Link
                    href="/settings"
                    className="flex items-center space-x-3 px-4 py-3 hover:bg-white/5 transition-colors group"
                  >
                    <Settings size={16} className="text-gray-400 group-hover:text-white" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-white">Account Settings</span>
                      <span className="text-xs text-gray-500">Preferences and security</span>
                    </div>
                  </Link>
                </div>

                <div className="border-t border-white/5 py-2">
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-4 py-3 hover:bg-red-500/10 transition-colors group w-full text-left"
                  >
                    <LogOut size={16} className="text-gray-400 group-hover:text-red-400" />
                    <span className="text-sm font-medium text-gray-300 group-hover:text-red-400">Log out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="h-10 w-px bg-white/10 mx-4 hidden md:block"></div>

        {/* Deposit Button */}
        <button className="bg-[#b4b4ff] hover:bg-[#a0a0ff] text-[#0a0a0c] px-5 py-2 rounded-2xl flex items-center space-x-2 font-bold text-sm transition-all transform active:scale-95 shadow-lg shadow-indigo-500/20">
          <span>Deposit</span>
          <Wallet size={16} />
        </button>
      </div>

      {/* Right Section: Actions */}
      <div className="flex items-center space-x-4">
        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <div className="relative group cursor-pointer">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2.5 rounded-full border border-white/10 hover:bg-white/5 transition-colors"
            >
              <Bell size={18} className="text-gray-300 group-hover:text-white" />
            </button>
            {activities.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#a0a0ff] text-[#0a0a0c] text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#0a0a0c]">
                {activities.length}
              </span>
            )}
          </div>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl z-50 backdrop-blur-xl">
              <div className="p-4 border-b border-white/5 flex justify-between items-center">
                <h3 className="text-sm font-semibold text-white">Notifications</h3>
                <Link href="#" className="text-xs text-gray-400 hover:text-white">
                  View all
                </Link>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {activities.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="w-10 h-10 opacity-30 mx-auto mb-2" />
                    <p className="text-xs">No new notifications</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-5 p-4">
                    {activities.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex flex-col gap-2 relative">
                        <h4 className="text-xs font-bold leading-tight text-white">
                          {activity.description}
                        </h4>
                        <div className="flex justify-between items-center mt-2">
                          <div className="flex gap-2">
                            <span className="text-[8px] text-gray-400">
                              {formatRelativeTime(activity.timestamp)}
                            </span>
                            <span className="text-[8px] px-1.5 py-0.5 rounded bg-purple-500/30 text-purple-300">
                              {activity.type}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative flex items-center bg-[#151518] rounded-2xl border border-white/5 px-4 py-2 w-48 md:w-64 focus-within:ring-1 focus-within:ring-white/20 transition-all">
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent border-none outline-none text-sm text-gray-200 placeholder-gray-500 w-full"
          />
          <Search size={16} className="text-gray-500 ml-2" />
        </div>

        {/* Settings Button */}
        <Link 
          href="/settings"
          className="flex items-center space-x-2 bg-transparent hover:bg-white/5 border border-white/10 px-4 py-2 rounded-2xl text-sm font-semibold text-gray-300 transition-colors"
        >
          <span>Settings</span>
          <Settings size={16} className="text-gray-500" />
        </Link>
      </div>
    </div>
  );
}