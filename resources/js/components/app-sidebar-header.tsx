import React, { useEffect, useRef, useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type SharedData, type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import {
  Bell,
  Search,
  ChevronDown,
  Settings,
  Wallet,
  User,
  LogOut,
  Shield,
  Activity,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { edit } from '@/routes/profile';

interface AppSidebarHeaderProps {
  breadcrumbs?: BreadcrumbItemType[];
}

export function AppSidebarHeader({ breadcrumbs = [] }: AppSidebarHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

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
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    router.post('/logout');
  };

  return (
    <div className="mb-8 flex items-center justify-between border-b border-border px-6 py-5">
      {/* Left Section: Profile */}
      <div className="flex items-center space-x-4">
        <SidebarTrigger className="-ml-1" />

        <img
          src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ryan"
          alt="Ryan Crawford"
          className="h-11 w-11 border border-border bg-muted"
        />

        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-[11px] text-muted-foreground">{auth.user?.email}</span>
            <Badge
              variant="outline"
              className="rounded-none px-1.5 py-0 font-mono text-[9px] font-bold uppercase tracking-wider"
            >
              {auth.user?.role === 'admin' ? 'Pro' : 'Free'}
            </Badge>
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="group flex items-center text-sm font-semibold text-foreground"
            >
              <span>{auth.user?.role === 'admin' ? 'Administrator' : 'Client User'}</span>
              <ChevronDown
                size={14}
                className="ml-1 text-muted-foreground transition-colors group-hover:text-foreground"
              />
            </button>

            {showProfileDropdown && (
              <div className="absolute left-0 z-50 mt-3 w-64 border border-border bg-popover">
                <div className="border-b border-border p-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ryan"
                      alt={auth.user?.name}
                      className="h-9 w-9 border border-border bg-muted"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-popover-foreground">{auth.user?.name}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">{auth.user?.email}</span>
                    </div>
                  </div>
                </div>

                <div className="py-1">
                  <Link
                    href={edit().url}
                    className="group flex items-center space-x-3 px-4 py-3 transition-colors hover:bg-accent"
                  >
                    <User size={15} className="text-muted-foreground group-hover:text-accent-foreground" />
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-popover-foreground">Profile Settings</span>
                      <span className="font-mono text-[10px] text-muted-foreground">Update your name and email</span>
                    </div>
                  </Link>

                  {auth.user?.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="group flex items-center space-x-3 px-4 py-3 transition-colors hover:bg-accent"
                    >
                      <Shield size={15} className="text-muted-foreground group-hover:text-accent-foreground" />
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-popover-foreground">Admin Dashboard</span>
                        <span className="font-mono text-[10px] text-muted-foreground">Manage system settings</span>
                      </div>
                    </Link>
                  )}

                  <Link
                    href="/settings"
                    className="group flex items-center space-x-3 px-4 py-3 transition-colors hover:bg-accent"
                  >
                    <Settings size={15} className="text-muted-foreground group-hover:text-accent-foreground" />
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-popover-foreground">Account Settings</span>
                      <span className="font-mono text-[10px] text-muted-foreground">Preferences and security</span>
                    </div>
                  </Link>
                </div>

                <div className="border-t border-border py-1">
                  <button
                    onClick={handleLogout}
                    className="group flex w-full items-center space-x-3 px-4 py-3 text-left transition-colors hover:bg-accent"
                  >
                    <LogOut size={15} className="text-muted-foreground group-hover:text-foreground" />
                    <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">
                      Log out
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mx-4 hidden h-10 w-px bg-border md:block" />

        {/* Deposit Button */}
        <Button className="gap-2 rounded-none bg-foreground font-mono text-xs font-bold uppercase tracking-wider text-background hover:bg-foreground/90">
          Deposit
          <Wallet size={14} />
        </Button>
      </div>

      {/* Right Section: Actions */}
      <div className="flex items-center space-x-3">
        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <div className="group relative cursor-pointer">
            <Button
              size="icon"
              variant="outline"
              onClick={() => setShowNotifications(!showNotifications)}
              className="rounded-none border-border"
            >
              <Bell size={16} className="text-muted-foreground group-hover:text-foreground" />
            </Button>
            {activities.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center border border-background bg-foreground font-mono text-[9px] font-bold text-background">
                {activities.length}
              </span>
            )}
          </div>

          {showNotifications && (
            <div className="absolute right-0 z-50 mt-3 w-80 border border-border bg-popover">
              <div className="flex items-center justify-between border-b border-border p-4">
                <h3 className="font-mono text-[11px] uppercase tracking-widest text-popover-foreground">
                  Notifications
                </h3>
                <Link href="#" className="font-mono text-[10px] text-muted-foreground hover:text-foreground">
                  View all
                </Link>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {activities.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <Activity className="mx-auto mb-2 h-8 w-8 opacity-30" />
                    <p className="font-mono text-[10px]">No new notifications</p>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {activities.slice(0, 5).map((activity, i) => (
                      <div
                        key={activity.id}
                        className="flex gap-3 border-b border-border px-4 py-3 last:border-b-0"
                      >
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <div className="flex flex-1 flex-col gap-1.5">
                          <h4 className="text-xs font-medium leading-tight text-popover-foreground">
                            {activity.description}
                          </h4>
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[9px] text-muted-foreground">
                              {formatRelativeTime(activity.timestamp)}
                            </span>
                            <Badge
                              variant="outline"
                              className="rounded-none px-1.5 py-0 font-mono text-[9px] font-normal uppercase"
                            >
                              {activity.type}
                            </Badge>
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
        <div className="relative flex w-48 items-center border border-border bg-muted px-3 py-2 focus-within:border-foreground md:w-64">
          <Input
            type="text"
            placeholder="Search..."
            className="h-auto border-none bg-transparent p-0 font-mono text-xs text-foreground placeholder:text-muted-foreground focus-visible:ring-0"
          />
          <Search size={15} className="ml-2 text-muted-foreground" />
        </div>

        {/* Settings Button */}
        <Link
          href="/settings"
          className="flex items-center space-x-2 border border-border px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <span>Settings</span>
          <Settings size={15} className="text-muted-foreground" />
        </Link>
      </div>
    </div>
  );
}