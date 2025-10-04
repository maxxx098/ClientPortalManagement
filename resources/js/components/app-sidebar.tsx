import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Folder, KeyRound, LayoutGrid, ProjectorIcon } from 'lucide-react';
import AppLogo from './app-logo';
import { usePage } from '@inertiajs/react';

export function AppSidebar() {
  const { props } = usePage<{
    auth?: {
        user?: { 
          email: string;
          role: string;
          is_admin: boolean;
        };
        projectsForSidebar?: { id: number; name: string }[];
        client_key_id?: string;
        is_client?: boolean;
    };
  }>();

  const user = props.auth?.user;
  const clientKeyId = props.auth?.client_key_id;
  const isClient = props.auth?.is_client ?? false;
  const projectsForSidebar = props.auth?.projectsForSidebar ?? [];

  // Debug logging
  console.log('AppSidebar Debug:', {
    user_email: user?.email,
    user_role: user?.role,
    user_is_admin: user?.is_admin,
    client_key_id: clientKeyId,
    is_client: isClient,
    has_user: !!user,
    projectsCount: projectsForSidebar.length,
  });

  const mainNavItems: NavItem[] = [
    { title: "Dashboard", href: dashboard(), icon: LayoutGrid },
  ];

  // Add Projects navigation with correct route based on role
  if (isClient) {
    // Client Projects Route
    mainNavItems.push({
      title: "Projects",
      href: route('client.projects.index'),
      icon: ProjectorIcon,
    });
  } else if (user?.is_admin) {
    // Admin Projects Route
    mainNavItems.push({
      title: "Projects",
      href: route('admin.projects.index'),
      icon: ProjectorIcon,
    });
    
    // Only show Client Keys to admins
    mainNavItems.push({
      title: "Client Keys",
      href: route('admin.client-keys.index'),
      icon: KeyRound,
    });
  }

  const footerNavItems: NavItem[] = [
    {
      title: "Repository",
      href: "https://github.com/laravel/react-starter-kit",
      icon: Folder,
    },
    {
      title: "Documentation",
      href: "https://laravel.com/docs/starter-kits#react",
      icon: BookOpen,
    },
  ];

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={dashboard()} prefetch>
                <AppLogo />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={mainNavItems} />
      </SidebarContent>

      <SidebarFooter>
        <NavFooter items={footerNavItems} className="mt-auto" />
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}

function route(arg0: string): NonNullable<string | import("@inertiajs/core").UrlMethodPair | undefined> {
  throw new Error('Function not implemented.');
}
