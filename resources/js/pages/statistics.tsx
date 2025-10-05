import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import RGBFeed from "@/components/dashboard/rgb-feed";
import AppLayout from '@/layouts/app-layout';
import { dashboard, map, statistics } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import DepthFeed from '@/components/dashboard/depth-feed';
import DroneRouteSimulation from '@/components/dashboard/drone-route-simulation';
import ManualControl from '@/components/dashboard/manual-control';
import DroneFeed from '@/components/dashboard/drone-feed';
import AIAnalyticsPanel from '@/components/dashboard/statistics';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Statistics',
        href: statistics().url,
    }
];

export default function Statistics() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Statistics" />
            <div className="flex h-full flex-1 flex-row gap-4 overflow-x-auto p-4">
                <AIAnalyticsPanel/>
            </div>
        </AppLayout>
    );
}
