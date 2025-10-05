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
import { dashboard, map, statistics } from '@/routes';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { ArrowUpRight, ChartArea, LayoutGrid, Map } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Map',
        href: map(),
        icon: Map,
    },
    {
        title: 'Statistics',
        href: statistics(),
        icon: ChartArea,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Cerealis',
        href: 'https://cerealis.cloud',
        icon: ArrowUpRight,
    },
    {
        title: 'ByteByte Studio',
        href: 'https://bytebytestudio.com',
        icon: ArrowUpRight,
    },
];

export function AppSidebar() {
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
