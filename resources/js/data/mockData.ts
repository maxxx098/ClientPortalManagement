import { Task, Project, TeamMember, FeatureItem, PricingTier } from '@/types';

export const initialTeamMembers: TeamMember[] = [
  {
    id: 'm1',
    name: 'Sarah Chen',
    role: 'Lead UX Designer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    email: 'sarah@mixkura.com'
  },
  {
    id: 'm2',
    name: 'Alex Rivera',
    role: 'Product Manager',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    email: 'alex@mixkura.com'
  },
  {
    id: 'm3',
    name: 'Elena Rostova',
    role: 'Frontend Architect',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    email: 'elena@mixkura.com'
  },
  {
    id: 'm4',
    name: 'Marcus Vance',
    role: 'Growth Specialist',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    email: 'marcus@mixkura.com'
  }
];

export const initialProjects: Project[] = [
  { id: 'p1', name: 'Nagoya Company', category: 'Enterprise Workspace', color: '#3b82f6', taskCount: 24 },
  { id: 'p2', name: 'Product Backlog', category: 'Core Product', color: '#6366f1', taskCount: 18 },
  { id: 'p3', name: 'Design Sprint', category: 'UX & Brand', color: '#ec4899', taskCount: 9 },
  { id: 'p4', name: 'Weekly Execution', category: 'Operations', color: '#10b981', taskCount: 12 }
];

export const initialTasks: Task[] = [
  {
    id: 't1',
    title: 'UX Research & Method',
    description: 'Conduct user interviews and synthesize journey map personas for the new Mixkura dashboard workflow.',
    status: 'In Design',
    priority: 'High',
    projectId: 'p2',
    assignees: [initialTeamMembers[0], initialTeamMembers[1]],
    startDate: '14 Dec',
    endDate: '16 Dec',
    progress: 75,
    tags: ['UX', 'Research'],
    commentsCount: 5
  },
  {
    id: 't2',
    title: 'Create Foundation Color',
    description: 'Establish design token color variables, contrast tokens for light/dark themes, and component palettes.',
    status: 'In Review',
    priority: 'Medium',
    projectId: 'p2',
    assignees: [initialTeamMembers[0], initialTeamMembers[2]],
    startDate: '18 Dec',
    endDate: '21 Dec',
    progress: 90,
    tags: ['Design System', 'Tokens'],
    commentsCount: 3
  },
  {
    id: 't3',
    title: 'Create Design System and Tooling',
    description: 'Build component library in React & Tailwind with Figma token sync for automated UI library deployments.',
    status: 'In Development',
    priority: 'High',
    projectId: 'p2',
    assignees: [initialTeamMembers[2], initialTeamMembers[3]],
    startDate: '15 Dec',
    endDate: '18 Dec',
    progress: 45,
    tags: ['React', 'Tailwind'],
    commentsCount: 8
  },
  {
    id: 't4',
    title: 'AI Smart Scheduling Engine',
    description: 'Integrate Gemini API algorithm to balance workload automatically based on timeline constraints.',
    status: 'In Development',
    priority: 'Urgent',
    projectId: 'p2',
    assignees: [initialTeamMembers[1], initialTeamMembers[2]],
    startDate: '19 Dec',
    endDate: '22 Dec',
    progress: 30,
    tags: ['AI Engine', 'Backend'],
    commentsCount: 12
  },
  {
    id: 't5',
    title: 'Competitor Benchmarking Audit',
    description: 'Review competitive task management tools to identify gaps in timeline planning and analytics.',
    status: 'Completed',
    priority: 'Low',
    projectId: 'p2',
    assignees: [initialTeamMembers[3]],
    startDate: '13 Dec',
    endDate: '15 Dec',
    progress: 100,
    tags: ['Strategy', 'Audit'],
    commentsCount: 2
  },
  {
    id: 't6',
    title: 'Mobile Responsiveness & Touch Tuning',
    description: 'Optimize drag-and-drop timeline interactions for tablet and mobile viewports.',
    status: 'Todo',
    priority: 'Medium',
    projectId: 'p2',
    assignees: [initialTeamMembers[0]],
    startDate: '21 Dec',
    endDate: '23 Dec',
    progress: 0,
    tags: ['Mobile', 'UI'],
    commentsCount: 1
  }
];

export const featureItems: FeatureItem[] = [
  {
    id: 'f1',
    iconName: 'Sparkles',
    title: 'AI-Powered Workload Allocation',
    description: 'Our intelligent algorithms predict bottlenecks, balance team capacity, and suggest optimized task schedules in real time.',
    badge: 'AI Smart',
    highlightText: 'Saves 8+ hours / week'
  },
  {
    id: 'f2',
    iconName: 'CalendarRange',
    title: 'Interactive Multi-View Timelines',
    description: 'Switch effortlessly between Gantt-style Timeline grids, Kanban Boards, Structured Lists, and Data Tables without losing context.',
    badge: 'Multi-View',
    highlightText: 'Instant synchronization'
  },
  {
    id: 'f3',
    iconName: 'BarChart3',
    title: 'Predictive Growth Analytics',
    description: 'Gain clear visibility into sprint velocity, team performance metrics, and operational milestones with customizable charts.',
    badge: 'Analytics',
    highlightText: 'Real-time velocity'
  },
  {
    id: 'f4',
    iconName: 'Zap',
    title: 'Automated Workflow Triggers',
    description: 'Automate repetitive status changes, notifications, and cross-platform integrations with zero code required.',
    badge: 'Automation',
    highlightText: '100+ Integrations'
  }
];

export const pricingTiers: PricingTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'Ideal for indie creators & small teams building momentum.',
    monthlyPrice: 19,
    annualPrice: 15,
    features: [
      'Up to 10 Team Members',
      'Interactive Board & List Views',
      'Basic Timeline Scheduling',
      'AI Task Summaries (100/mo)',
      '10GB Cloud Storage',
      'Standard Support'
    ],
    ctaText: 'Start Free Trial'
  },
  {
    id: 'pro',
    name: 'Pro Smarter',
    tagline: 'For fast-scaling teams that need full AI power & analytics.',
    monthlyPrice: 49,
    annualPrice: 39,
    popular: true,
    features: [
      'Unlimited Team Members',
      'All Views: Timeline, Board, List, Table',
      'Unlimited AI Workload Optimization',
      'Real-time Analytics & Velocity Charts',
      'Custom Workflow Automations',
      '500GB Storage & Priority Support',
      'Dedicated Customer Success Manager'
    ],
    ctaText: 'Get Started Pro'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'Tailored security, custom integrations, and SLA guarantees.',
    monthlyPrice: 129,
    annualPrice: 99,
    features: [
      'Everything in Pro Smarter',
      'SAML Single Sign-On (SSO)',
      'Custom AI Fine-Tuning & Models',
      'Dedicated Private Cloud / Region',
      '24/7 Phone & Slack VIP Support',
      'Custom SLA & Audit Logs'
    ],
    ctaText: 'Contact Sales'
  }
];

export const solutionsData = [
  {
    title: 'Product Teams',
    description: 'Align product backlogs, design sprints, and release roadmaps with complete timeline clarity.',
    icon: 'Layers'
  },
  {
    title: 'Design Studios',
    description: 'Manage visual review cycles, asset approvals, and client deliverables seamlessly.',
    icon: 'Palette'
  },
  {
    title: 'Growth & Marketing',
    description: 'Coordinate campaign launches, content calendars, and social media scheduling from one hub.',
    icon: 'TrendingUp'
  },
  {
    title: 'Engineering Sprints',
    description: 'Track developer velocity, automated pull requests, and sprint milestone burn-down charts.',
    icon: 'Code'
  }
];
