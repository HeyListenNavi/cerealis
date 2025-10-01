import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import RGBFeed from "@/components/dashboard/rgb-feed";
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import {
    BatteryMedium,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    Circle,
} from 'lucide-react';
import DepthFeed from '@/components/dashboard/depth-feed';

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
                        <RGBFeed/>
                        <div className="absolute top-4 right-4 size-3 rounded-full bg-red-500"></div>
                    </div>
                    <div className="flex flex-1 gap-4">
                        <div className="relative flex-1 rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                            <p className="absolute top-1/2 left-1/2 -translate-1/2">
                                Mapa
                            </p>
                            <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                        </div>
                        <div className="relative flex-1 rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                            <DepthFeed/>
                        </div>
                    </div>
                </div>
                <div className="flex flex-4 flex-col gap-4">
                    <div className="relative flex flex-1 flex-col gap-2 rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                        <div>
                            <small className="text-sm leading-none font-medium text-muted-foreground">
                                Battery
                            </small>
                            <div className="flex justify-between text-lg">
                                <div className="flex items-center gap-1">
                                    <BatteryMedium />
                                    <p>34%</p>
                                </div>
                                <p>3200Mah / 5430 Mah</p>
                            </div>
                        </div>
                        <div>
                            <small className="text-sm leading-none font-medium text-muted-foreground">
                                Height
                            </small>
                            <div className="flex justify-between text-lg">
                                <p>
                                    90 <span className="ml-1">m</span>
                                </p>
                            </div>
                        </div>
                        <div>
                            <small className="text-sm leading-none font-medium text-muted-foreground">
                                Flight Time
                            </small>
                            <div className="flex items-center gap-1 text-lg">
                                <p>01:23</p>
                            </div>
                        </div>
                        <div>
                            <small className="text-sm leading-none font-medium text-muted-foreground">
                                Speed
                            </small>
                            <div className="text-lg">
                                <p>20 Km/h</p>
                            </div>
                        </div>
                    </div>
                    <div className="relative flex flex-1 items-center justify-center rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <div className="relative flex size-48 items-center justify-center rounded-full bg-black shadow-xl">
                            <div className="absolute inset-0 rounded-full bg-zinc-700/50"></div>{' '}
                            <button className="text-zinc absolute flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-inner hover:bg-zinc-200 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:outline-none">
                                <Circle className="h-6 w-6 fill-current text-zinc-800" />{' '}
                            </button>
                            <button className="absolute top-2 flex size-12 items-center justify-center rounded-full text-white hover:text-zinc-400 focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 focus:outline-none active:bg-zinc-700">
                                <ChevronUp size="28" />
                            </button>
                            <button className="absolute bottom-2 flex size-12 items-center justify-center rounded-full text-white hover:text-zinc-400 focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 focus:outline-none active:bg-zinc-700">
                                <ChevronDown size="28" />
                            </button>
                            <button className="absolute left-2 flex size-12 items-center justify-center rounded-full text-white hover:text-zinc-400 focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 focus:outline-none active:bg-zinc-700">
                                <ChevronLeft size="28" />
                            </button>
                            <button className="absolute right-2 flex size-12 items-center justify-center rounded-full text-white hover:text-zinc-400 focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 focus:outline-none active:bg-zinc-700">
                                <ChevronRight size="28" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
