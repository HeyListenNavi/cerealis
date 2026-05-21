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
import { dashboard, map, statistics, report } from '@/routes';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { ArrowUpRight, ChartArea, FileText, LayoutGrid, Map } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Panel Principal',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Mapa',
        href: map(),
        icon: Map,
    },
    {
        title: 'Estadísticas',
        href: statistics(),
        icon: ChartArea,
    },
    {
        title: 'Reporte',
        href: report(),
        icon: FileText,
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
