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
import projects from '@/routes/projects';
import clientKeys from '@/routes/client-keys';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Folder, KeyRound, LayoutGrid, ProjectorIcon } from 'lucide-react';
import AppLogo from './app-logo';
import { usePage } from '@inertiajs/react';

export function AppSidebar() {
    const { props } = usePage<{ auth?: { user?: { email: string }, hasProjects?: boolean } }>();
    const user = props.auth?.user;
    const hasProjects = props.auth?.hasProjects;

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
    ];

    // Only admins see Client Keys
    if (user?.email !== 'client@system.local') {
        mainNavItems.push({
            title: 'Client Keys',
            href: clientKeys.index.url(),
            icon: KeyRound,
        },
    {
         title: 'Projects',
            href: projects.index.url(),
            icon: ProjectorIcon,
    });
    }

    // Clients only see Projects if they have any
    if (hasProjects) {
        mainNavItems.push({
            title: 'Projects',
            href: projects.index.url(),
            icon: ProjectorIcon,
        });
    }

    const footerNavItems: NavItem[] = [
        {
            title: 'Repository',
            href: 'https://github.com/laravel/react-starter-kit',
            icon: Folder,
        },
        {
            title: 'Documentation',
            href: 'https://laravel.com/docs/starter-kits#react',
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


