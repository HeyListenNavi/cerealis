import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { SharedData, type BreadcrumbItem } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { useEffect, type PropsWithChildren } from 'react';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {

    const { auth } = usePage<SharedData>().props;
    useEffect(() => {
        if (!auth.user) {
            return;
        }

        const interval = setInterval(() => {
            fetch('/auth/status')
                .then(response => response.json())
                .then(data => {
                    if (data.status !== 'authenticated') {
                        router.visit('/login', {replace: true});
                    }
                })
        }, 5000)

        return () => clearInterval(interval);
    }, [auth.user]);

    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
        </AppShell>
    );
}
