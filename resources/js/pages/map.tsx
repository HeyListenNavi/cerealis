import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import RGBFeed from "@/components/dashboard/rgb-feed";
import AppLayout from '@/layouts/app-layout';
import { dashboard, map } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import DepthFeed from '@/components/dashboard/depth-feed';
import DroneRouteSimulation from '@/components/dashboard/drone-route-simulation';
import ManualControl from '@/components/dashboard/manual-control';
import DroneFeed from '@/components/dashboard/drone-feed';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Map',
        href: map().url,
    }
];

export default function DroneMap() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Map" />
            <div className="flex h-full flex-1 flex-row gap-4 overflow-x-auto p-4">
                <DroneRouteSimulation/>
            </div>
        </AppLayout>
    );
}
