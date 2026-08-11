import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}
export type TaskStatus = 'Todo' | 'In Development' | 'In Design' | 'In Review' | 'Completed';

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type ViewType = 'board' | 'timeline' | 'list' | 'table' | 'analytics';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  email: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  assignees: TeamMember[];
  startDate: string; // e.g. "2026-12-14" or "14 Dec"
  endDate: string;   // e.g. "2026-12-16" or "16 Dec"
  progress: number;  // 0 - 100
  tags: string[];
  commentsCount?: number;
}

export interface Project {
  id: string;
  name: string;
  category: string;
  color: string;
  taskCount: number;
}

export interface FeatureItem {
  id: string;
  iconName: string;
  title: string;
  description: string;
  badge?: string;
  highlightText?: string;
}

export interface PricingTier {
  id: string;
  name: string;
  tagline: string;
  monthlyPrice: number;
  annualPrice: number;
  popular?: boolean;
  features: string[];
  ctaText: string;
}