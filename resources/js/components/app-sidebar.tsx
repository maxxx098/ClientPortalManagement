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
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Folder, KeyRound, LayoutGrid, ProjectorIcon, TagsIcon } from 'lucide-react';
import AppLogo from './app-logo';
import { usePage } from '@inertiajs/react';
import projects from '@/routes/admin/projects';
import clientProjects from '@/routes/client/projects';
import clientKeys from '@/routes/admin/client-keys';
import adminTasks from '@/routes/admin/tasks';
import clientTasks from '@/routes/client/tasks';
import { dashboard } from '@/routes';

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
  
  let isClient = props.auth?.is_client ?? false;
  
  // If is_client is false but user role is 'client' or email starts with 'client-', override it
  if (!isClient && user) {
    if (user.role === 'client' || user.email?.startsWith('client-')) {
      isClient = true;
      console.warn('⚠️ is_client was false but user is clearly a client - overriding!');
    }
  }
  
  const projectsForSidebar = props.auth?.projectsForSidebar ?? [];

  // Debug logging
  console.log('=== AppSidebar Debug ===', {
    user_email: user?.email,
    user_role: user?.role,
    user_is_admin: user?.is_admin,
    client_key_id: clientKeyId,
    is_client: isClient,
    has_user: !!user,
    projectsCount: projectsForSidebar.length,
    projects: projectsForSidebar,
    auth_props: props.auth,
  });

  // Determine dashboard URL based on role
  const dashboardUrl = isClient ? dashboard.url() : dashboard.url();
  console.log('Determined dashboardUrl:', dashboardUrl);
  
  const mainNavItems: NavItem[] = [
    { title: "Dashboard", href: dashboardUrl, icon: LayoutGrid },
  ];

  // Add Tasks navigation with correct route based on role
  console.log('Determining nav items...', { isClient, is_admin: user?.is_admin });
  
  if (isClient) {
    console.log('Adding CLIENT Tasks nav item');
    // Client Tasks Route
    mainNavItems.push({
      title: "Tasks",
      href: clientTasks.index.url(),
      icon: TagsIcon,
    });
    
    console.log('Adding CLIENT Projects nav item');
    // Client Projects Route
    mainNavItems.push({
      title: "Projects",
      href: clientProjects.index.url(),
      icon: ProjectorIcon,
    });
  } else if (user?.is_admin) {
    console.log('Adding ADMIN Tasks nav item');
    // Admin Tasks Route
    mainNavItems.push({
      title: "Tasks",
      href: adminTasks.index.url(),
      icon: TagsIcon,
    });
    
    console.log('Adding ADMIN Projects nav item');
    // Admin Projects Route
    mainNavItems.push({
      title: "Projects",
      href: projects.index.url(),
      icon: ProjectorIcon,
    });
    
    // Only show Client Keys to admins
    mainNavItems.push({
      title: "Client Keys",
      href: clientKeys.index.url(),
      icon: KeyRound,
    });
  } else {
    console.log('NOT adding any Projects/Tasks nav items', { isClient, is_admin: user?.is_admin });
  }

  console.log('Final mainNavItems:', mainNavItems);

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={dashboardUrl} prefetch>
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
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}