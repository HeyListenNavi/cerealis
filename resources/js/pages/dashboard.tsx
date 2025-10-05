import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import RGBFeed from "@/components/dashboard/rgb-feed";
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import DepthFeed from '@/components/dashboard/depth-feed';
import DroneRouteSimulation from '@/components/dashboard/drone-route-simulation';
import ManualControl from '@/components/dashboard/manual-control';
import DroneMap from '@/components/dashboard/drone-map';
import DroneFeed from '@/components/dashboard/drone-feed';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    }
];

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-row gap-4 overflow-x-auto p-4">
                <div className="flex flex-10 flex-col gap-4">
                    <div className="bg-zinc-900 relative aspect-video rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <RGBFeed/>
                        <div className="absolute top-4 right-4 size-3 rounded-full bg-red-500"></div>
                    </div>
                    <div className="flex flex-1 gap-4">
                        <div className="rbg-zinc-900 elative flex-1 rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                            <DroneMap/>
                        </div>
                        <div className="bg-zinc-900 relative flex-1 rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                            <DepthFeed/>
                        </div>
                    </div>
                </div>
                <div className="flex flex-4 flex-col gap-4">
                    <div className="bg-zinc-900 relative flex flex-1 flex-col gap-2 rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                        <DroneFeed/>
                    </div>
                    <div className="bg-zinc-900 relative flex flex-1 items-center justify-center rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <ManualControl/>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
