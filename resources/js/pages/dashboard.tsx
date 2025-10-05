import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import RGBFeed from '@/components/dashboard/rgb-feed';
import DepthFeed from '@/components/dashboard/depth-feed';
import DroneFeed from '@/components/dashboard/drone-feed';
import ManualControl from '@/components/dashboard/manual-control';
import DroneMap from '@/components/dashboard/drone-map';

// Tab component
const Tabs = ({ tabs, activeTab, setActiveTab }) => {
    const activeContent = tabs.find(tab => tab.label === activeTab)?.content;

    return (
        <div className="flex h-full flex-col">
            {/* Tab Buttons */}
            <div className="flex items-center space-x-2 border-b border-sidebar-border/70 px-2 dark:border-sidebar-border">
                {tabs.map(tab => (
                    <button
                        key={tab.label}
                        onClick={() => setActiveTab(tab.label)}
                        className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors duration-200 ease-in-out ${
                            activeTab === tab.label
                                ? 'border-[#658c2d] text-[#658c2d]'
                                : 'border-transparent text-zinc-400 hover:border-zinc-500 hover:text-zinc-300'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            {/* Tab Content */}
            <div className="mt-4 flex-1">{activeContent}</div>
        </div>
    );
};

export default function Dashboard() {
    // Mobile tab states
    const [activeTopTab, setActiveTopTab] = useState('Live Feed');
    const [activeBottomTab, setActiveBottomTab] = useState('Manual Control');

    // Top tabs content (mobile)
    const topTabs = [
        {
            label: 'Live Feed',
            content: (
                <div className="relative h-full">
                    <RGBFeed />
                    <div className="absolute top-4 right-4 size-3 animate-pulse rounded-full bg-red-500"></div>
                </div>
            ),
        },
        { label: 'Depth', content: <DepthFeed /> },
        { label: 'Map', content: <DroneMap /> },
    ];

    // Bottom tabs content (mobile)
    const bottomTabs = [
        { label: 'Manual Control', content: <ManualControl /> },
        { label: 'Drone Status', content: <DroneFeed /> },
    ];

    return (
        <AppLayout>
            <Head title="Dashboard" />

            {/* MOBILE / TABLET VIEW (< lg) */}
            <div className="h-full grid grid-rows-2 gap-4 p-4 lg:hidden">
                <div className="rounded-xl border border-sidebar-border/70 bg-zinc-900/50 p-4 dark:border-sidebar-border">
                    <Tabs
                        tabs={topTabs}
                        activeTab={activeTopTab}
                        setActiveTab={setActiveTopTab}
                    />
                </div>
                <div className="rounded-xl border border-sidebar-border/70 bg-zinc-900/50 p-4 dark:border-sidebar-border">
                    <Tabs
                        tabs={bottomTabs}
                        activeTab={activeBottomTab}
                        setActiveTab={setActiveBottomTab}
                    />
                </div>
            </div>

            {/* DESKTOP VIEW (>= lg) */}
            <div className="hidden h-full flex-1 gap-4 p-4 lg:flex lglex-row">
                {/* Left Column */}
                <div className="flex flex-10 flex-col gap-4">
                    {/* RGB Feed */}
                    <div className="bg-zinc-900 relative aspect-video rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <RGBFeed />
                        <div className="absolute top-4 right-4 size-3 rounded-full bg-red-500"></div>
                    </div>

                    {/* Map + Depth */}
                    <div className="h-full flex flex-row gap-4">
                        <div className="bg-zinc-900 relative flex-1 rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                            <DroneMap />
                        </div>
                        <div className="bg-zinc-900 relative flex-1 rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                            <DepthFeed />
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="flex flex-4 flex-col gap-4">
                    <div className="bg-zinc-900 relative flex-1 rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                        <DroneFeed />
                    </div>
                    <div className="bg-zinc-900 relative flex-1 rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <ManualControl />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
