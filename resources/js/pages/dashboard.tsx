import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-row gap-4 overflow-x-auto p-4">
                <div className="flex flex-10 flex-col gap-4">
                    <div className="relative aspect-video rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <p className="absolute top-1/2 left-1/2 -translate-1/2">Camara Principal</p>
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                    <div className="flex flex-1 gap-4">
                        <div className="relative flex-1 rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                            <p className="absolute top-1/2 left-1/2 -translate-1/2">Mapa</p>
                            <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                        </div>
                        <div className="relative flex-1 rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                            <p className="absolute top-1/2 left-1/2 -translate-1/2">Camara secundaria</p>
                            <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                        </div>
                    </div>
                </div>
                <div className="flex flex-4 flex-col gap-4">
                    <div className="relative flex-1 rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <p className="absolute top-1/2 left-1/2 -translate-1/2">Informacion del Drone</p>
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                    <div className="relative flex-1 rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <p className="absolute top-1/2 left-1/2 -translate-1/2">Controles</p>
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                </div>
                {/* <div className="grid auto-rows-min gap-4 md:grid-cols-2">
                    <div className="relative aspect-video flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                </div>
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:max-h-[30vh] md:min-h-min dark:border-sidebar-border">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                </div> */}
            </div>
        </AppLayout>
    );
}
