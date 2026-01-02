import React, { useEffect, useRef, useState } from 'react';
import { Link } from '@inertiajs/react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { 
  Bell,
  Search,
  Calendar,
  Plus,
  Activity
} from 'lucide-react';

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  user?: string;
  timestamp: string;
}

interface AppSidebarHeaderProps {
  breadcrumbs?: BreadcrumbItemType[];
  recentActivity?: RecentActivity[];
}

export function AppSidebarHeader({
  breadcrumbs = [],
  recentActivity = []
}: AppSidebarHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric' 
  });

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
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="flex h-auto shrink-0 items-center justify-between gap-2 p-8 transition-[width,height] ease-linear">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="-ml-1" />
        {breadcrumbs.length > 0 && (
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        )}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Search" 
            className="bg-white/5 border border-white/10 rounded-full py-2.5 pl-10 pr-6 text-sm focus:outline-none focus:ring-1 focus:ring-green-500/30 w-64 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
          >
            <Bell size={20} className="text-gray-400" />
            {recentActivity.length > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full shadow-lg shadow-red-500/50"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl z-50 backdrop-blur-xl">
              <div className="p-4 border-b border-white/5 flex justify-between items-center">
                <h3 className="text-sm font-semibold text-white">Notifications</h3>
                <Link href="#" className="text-xs text-gray-400 hover:text-white">
                  View all
                </Link>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {recentActivity.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="w-10 h-10 opacity-30 mx-auto mb-2" />
                    <p className="text-xs">No new notifications</p>
                  </div>
                ) : (
                  recentActivity.slice(0, 5).map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-xs">
                          {activity.description.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium line-clamp-2">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatRelativeTime(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <Link 
          href="/admin/projects" 
          className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
        >
          <Calendar size={18} className="text-gray-400" />
          <span className="text-sm">Schedule</span>
        </Link>
        
        <button className="p-2.5 bg-green-500 text-black rounded-full hover:bg-green-400 transition-colors shadow-lg shadow-green-500/20">
          <Plus size={20} />
        </button>
      </div>
    </header>
  );
}