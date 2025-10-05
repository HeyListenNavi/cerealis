import React, { useState, useEffect } from 'react';
import { BatteryFull, Zap, GaugeCircle, ArrowUp, Satellite, Compass, PlaneTakeoff, Home, Navigation } from 'lucide-react';

const SERVER_IP = "s8wc004skw8s0wo8k8cc8ooc.89.116.212.214.sslip.io";
const INFO_URL = `ws://${SERVER_IP}/ws/drone_info`;

const useDroneTelemetry = (url) => {
    const [droneInfo, setDroneInfo] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState('Connecting...');

    useEffect(() => {
        let ws;
        const connect = () => {
            ws = new WebSocket(url);

            ws.onopen = () => {
                console.log("Telemetry feed connected.");
                setConnectionStatus('Connected');
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    setDroneInfo(data);
                } catch (error) {
                    console.error("Failed to parse telemetry data:", error);
                }
            };

            ws.onclose = () => {
                console.log("Telemetry feed disconnected. Retrying...");
                setConnectionStatus('Disconnected');
                setTimeout(connect, 5000);
            };

            ws.onerror = (error) => {
                console.error("Telemetry WebSocket error:", error);
                setConnectionStatus('Error');
                ws.close();
            };
        };

        connect();

        return () => {
            if (ws) {
                ws.close();
            }
        };
    }, [url]);

    return { droneInfo, connectionStatus };
};

const StatCard = ({ icon, label, value, children, valueClassName = "text-2xl" }) => (
    <div className="bg-gray-800/20 p-4 rounded-lg shadow-lg flex flex-col justify-between">
        <div>
            <div className="flex items-center text-gray-400 mb-2">
                {icon}
                <span className="ml-2 text-sm font-medium">{label}</span>
            </div>
            <div className={`${valueClassName} font-bold text-white truncate`}>
                {value}
            </div>
        </div>
        {children && <div className="mt-3">{children}</div>}
    </div>
);

const BatteryBar = ({ level = 0 }) => {
    const getBatteryColor = () => {
        if (level > 50) return 'bg-green-500';
        if (level > 20) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div
                className={`${getBatteryColor()} h-2.5 rounded-full transition-all duration-500`}
                style={{ width: `${level}%` }}
            ></div>
        </div>
    );
};

export default function DroneFeed() {
    const { droneInfo, connectionStatus } = useDroneTelemetry(INFO_URL);

    return (
        <div className="text-gray-200 p-2 rounded-xl font-sans w-full max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6 border-b border-gray-700/40 pb-4">
                <h2 className="text-xl font-bold">Drone Telemetry</h2>
                <div className="flex items-center text-sm">
                    <span className={`h-3 w-3 rounded-full mr-2 ${connectionStatus === 'Connected' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                    {connectionStatus}
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <StatCard
                    icon={<BatteryFull size={20} />}
                    label="Battery"
                    value={`${droneInfo?.battery?.level || 0}%`}
                >
                    <BatteryBar level={droneInfo?.battery?.level} />
                </StatCard>
                
                <StatCard
                    icon={<Zap size={20} />}
                    label="Voltage"
                    value={`${droneInfo?.battery?.voltage?.toFixed(2) || '0.00'} V`}
                />

                <StatCard
                    icon={<ArrowUp size={20} />}
                    label="Altitude"
                    value={`${droneInfo?.location?.alt?.toFixed(1) || '0.0'} m`}
                />

                <StatCard
                    icon={<Home size={20} />}
                    label="Location (Lat / Lon)"
                    valueClassName="text-base" 
                    value={
                        <span>
                            Lat: {droneInfo?.location?.lat?.toFixed(1) || 'N/A'}m
                            <br />
                            Lon: {droneInfo?.location?.lon?.toFixed(1) || 'N/A'}m
                        </span>
                    }
                />

                <StatCard
                    icon={<Compass size={20} />}
                    label="Heading"
                    value={`${droneInfo?.heading || 0}°`}
                />

                <StatCard
                    icon={<Satellite size={20} />}
                    label="Satellites"
                    value={droneInfo?.satellites || 0}
                />
            </div>
        </div>
    );
}

