import React, { useState, useEffect, useRef } from 'react';
import { BatteryFull, Zap, ArrowUp, Satellite, Compass, Home, Navigation } from 'lucide-react';

const SERVER_IP = "s8wc004skw8s0wo8k8cc8ooc.89.116.212.214.sslip.io";
const INFO_URL = `ws://${SERVER_IP}/ws/drone_info`;
const NEW_GREEN_COLOR = '#658c2d';
const NEW_GREEN_DARKER = '#516d23';
const SIMULATION_SPEED_MPS = 20;

const useDroneTelemetry = (url) => {
    const [droneInfo, setDroneInfo] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState('Connecting...');

    useEffect(() => {
        let ws;
        const connect = () => {
            ws = new WebSocket(url);
            ws.onopen = () => setConnectionStatus('Connected');
            ws.onmessage = (event) => {
                try {
                    setDroneInfo(JSON.parse(event.data));
                } catch (error) {
                    console.error("Failed to parse telemetry data:", error);
                }
            };
            ws.onclose = () => {
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
        return () => ws?.close();
    }, [url]);

    return { droneInfo, connectionStatus };
};

const StatCard = ({ icon, label, value, children, valueClassName = "text-2xl" }) => (
    <div className="bg-gray-800/50 p-3 rounded-lg shadow-lg flex flex-col justify-between text-white">
        <div>
            <div className="flex items-center text-gray-400 mb-1">
                {icon}
                <span className="ml-2 text-xs font-medium uppercase">{label}</span>
            </div>
            <div className={`${valueClassName} font-bold truncate`}>{value}</div>
        </div>
        {children && <div className="mt-2">{children}</div>}
    </div>
);

const BatteryBar = ({ level = 0 }) => {
    const color = level > 50 ? 'bg-green-500' : level > 20 ? 'bg-yellow-500' : 'bg-red-500';
    return (
        <div className="w-full bg-gray-700 rounded-full h-2">
            <div className={`${color} h-2 rounded-full transition-all duration-500`} style={{ width: `${level}%` }}></div>
        </div>
    );
};

export default function DroneDashboard() {
    const { droneInfo, connectionStatus } = useDroneTelemetry(INFO_URL);
    const [map, setMap] = useState(null);
    const [leaflet, setLeaflet] = useState(null);
    const [tool, setTool] = useState('manual');
    const [waypoints, setWaypoints] = useState([]);
    const [isSimulating, setIsSimulating] = useState(false);
    const [droneMarker, setDroneMarker] = useState(null);
    const mapRef = useRef(null);
    const mapInitialized = useRef(false);
    const markersRef = useRef([]);
    const polylinesRef = useRef([]);
    const coveragePolygonsRef = useRef([]);
    const rectangleRef = useRef(null);
    const isDrawingRef = useRef(false);
    const startPointRef = useRef(null);
    const animationFrameRef = useRef(null);
    const simulationStateRef = useRef({});

    useEffect(() => {
        if (window.L) {
            setLeaflet(window.L);
            return;
        }
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/leaflet.css';
        document.head.appendChild(link);
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/leaflet.js';
        script.onload = () => setLeaflet(window.L);
        document.body.appendChild(script);
    }, []);

    useEffect(() => {
        if (!leaflet || mapRef.current) return;
        const mapInstance = leaflet.map('map').setView([19.4326, -99.1332], 5); 
        leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(mapInstance);
        mapRef.current = mapInstance;
        setMap(mapInstance);
        return () => mapRef.current?.remove();
    }, [leaflet]);
    
    useEffect(() => {
        if (map && droneInfo?.location?.lat && !mapInitialized.current) {
            map.setView([droneInfo.location.lat, droneInfo.location.lon], 16);
            mapInitialized.current = true;
        }
    }, [map, droneInfo]);

    const getDistance = (p1, p2) => {
        const toRad = deg => deg * Math.PI / 180;
        const R = 6371000;
        const dLat = toRad(p2[0] - p1[0]), dLon = toRad(p2[1] - p1[1]);
        const lat1 = toRad(p1[0]), lat2 = toRad(p2[0]);
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    useEffect(() => {
        if (!map || !leaflet || isSimulating) return;
        const handleMapClick = (e) => {
            if (tool === 'manual') setWaypoints(prev => [...prev, [e.latlng.lat, e.latlng.lng]]);
        };
        const handleMouseDown = (e) => {
            if (tool === 'auto') {
                isDrawingRef.current = true;
                startPointRef.current = e.latlng;
                if (rectangleRef.current) rectangleRef.current.remove();
                rectangleRef.current = leaflet.rectangle([e.latlng, e.latlng], { color: NEW_GREEN_COLOR, weight: 2, dashArray: '5, 5', fillOpacity: 0 }).addTo(map);
                map.dragging.disable();
            }
        };
        const handleMouseMove = (e) => {
            if (isDrawingRef.current && startPointRef.current) rectangleRef.current.setBounds([startPointRef.current, e.latlng]);
        };
        const handleMouseUp = (e) => {
            if (isDrawingRef.current && startPointRef.current) {
                isDrawingRef.current = false;
                map.dragging.enable();
                generateLawnmowerPattern(startPointRef.current, e.latlng);
                startPointRef.current = null;
            }
        };
        map.on({ click: handleMapClick, mousedown: handleMouseDown, mousemove: handleMouseMove, mouseup: handleMouseUp });
        map.getContainer().style.cursor = tool === 'auto' ? 'crosshair' : '';
        return () => {
            map.off({ click: handleMapClick, mousedown: handleMouseDown, mousemove: handleMouseMove, mouseup: handleMouseUp });
            map.getContainer().style.cursor = '';
            map.dragging.enable();
        };
    }, [map, leaflet, tool, isSimulating]);

    const createCorridor = (start, end, width) => {
        const toRad = deg => deg * Math.PI / 180;
        const toDeg = rad => rad * 180 / Math.PI;
        const lat1 = toRad(start[0]), lon1 = toRad(start[1]), lat2 = toRad(end[0]), lon2 = toRad(end[1]);
        const bearing = Math.atan2(Math.sin(lon2 - lon1) * Math.cos(lat2), Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1));
        const perpBearing1 = bearing + Math.PI / 2, perpBearing2 = bearing - Math.PI / 2;
        const R = 6371000, d = width / 2;
        const offset = (lat, lon, brng) => {
            const lat_out = Math.asin(Math.sin(lat) * Math.cos(d / R) + Math.cos(lat) * Math.sin(d / R) * Math.cos(brng));
            const lon_out = lon + Math.atan2(Math.sin(brng) * Math.sin(d / R) * Math.cos(lat), Math.cos(d / R) - Math.sin(lat) * Math.sin(lat_out));
            return [toDeg(lat_out), toDeg(lon_out)];
        };
        return [offset(lat1, lon1, perpBearing1), offset(lat1, lon1, perpBearing2), offset(lat2, lon2, perpBearing2), offset(lat2, lon2, perpBearing1)];
    };

    useEffect(() => {
        if (!map || !leaflet) return;
        [...markersRef.current, ...polylinesRef.current, ...coveragePolygonsRef.current].forEach(layer => layer.remove());
        markersRef.current = []; polylinesRef.current = []; coveragePolygonsRef.current = [];
        waypoints.forEach((point, idx) => {
            markersRef.current.push(leaflet.circleMarker(point, { radius: 6, fillColor: NEW_GREEN_COLOR, color: NEW_GREEN_DARKER, weight: 2, opacity: 1, fillOpacity: 1 }).addTo(map));
            coveragePolygonsRef.current.push(leaflet.circle(point, { radius: 50, color: NEW_GREEN_COLOR, fillColor: NEW_GREEN_COLOR, fillOpacity: 0.1, weight: 1 }).addTo(map));
            if (idx > 0) {
                polylinesRef.current.push(leaflet.polyline([waypoints[idx - 1], point], { color: NEW_GREEN_COLOR, weight: 2, dashArray: '5, 5', opacity: 0.8 }).addTo(map));
                const corridor = createCorridor(waypoints[idx - 1], point, 100);
                coveragePolygonsRef.current.push(leaflet.polygon(corridor, { color: NEW_GREEN_COLOR, fillColor: NEW_GREEN_COLOR, fillOpacity: 0.1, weight: 1 }).addTo(map));
            }
        });
    }, [waypoints, map, leaflet]);
    
    const generateLawnmowerPattern = (start, end) => {
        clearAll(false);
        const bounds = leaflet.latLngBounds(start, end);
        const northEast = bounds.getNorthEast(), southWest = bounds.getSouthWest();
        const latDiff = northEast.lat - southWest.lat;
        const coverageWidthMeters = 50, coverageWidthDegrees = coverageWidthMeters / 111320;
        const numPasses = Math.max(2, Math.ceil(latDiff / coverageWidthDegrees));
        const spacing = latDiff / (numPasses - 1);
        const cornerPoints = [], finalWaypoints = [];
        let currentLat = southWest.lat, leftToRight = true;
        for (let i = 0; i < numPasses; i++) {
            cornerPoints.push([currentLat, leftToRight ? southWest.lng : northEast.lng]);
            cornerPoints.push([currentLat, leftToRight ? northEast.lng : southWest.lng]);
            currentLat += spacing;
            leftToRight = !leftToRight;
        }
        const maxSegmentLength = 200;
        for (let i = 0; i < cornerPoints.length; i++) {
            finalWaypoints.push(cornerPoints[i]);
            if (i < cornerPoints.length - 1) {
                const p1 = cornerPoints[i], p2 = cornerPoints[i + 1];
                const segmentDist = getDistance(p1, p2);
                if (segmentDist > maxSegmentLength) {
                    const numSubdivisions = Math.ceil(segmentDist / maxSegmentLength);
                    for (let j = 1; j < numSubdivisions; j++) {
                        finalWaypoints.push([p1[0] + (p2[0] - p1[0]) * (j / numSubdivisions), p1[1] + (p2[1] - p1[1]) * (j / numSubdivisions)]);
                    }
                }
            }
        }
        setWaypoints(finalWaypoints);
    };

    const startSimulation = () => {
        if (waypoints.length < 2 || isSimulating || !leaflet) return;
        
        const segmentDistances = [];
        for (let i = 0; i < waypoints.length - 1; i++) {
            segmentDistances.push(getDistance(waypoints[i], waypoints[i + 1]));
        }
        const totalDistance = segmentDistances.reduce((a, b) => a + b, 0);
        
        simulationStateRef.current = {
            startTime: performance.now(),
            segmentDistances,
            totalDistance,
            totalDuration: (totalDistance / SIMULATION_SPEED_MPS) * 1000,
        };

        const droneIcon = leaflet.divIcon({
            className: 'drone-icon-container',
            html: `<div><svg width="50" height="50" viewBox="0 0 30 30" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));"><circle cx="15" cy="15" r="4" fill="${NEW_GREEN_COLOR}"/><line x1="15" y1="15" x2="15" y2="5" stroke="${NEW_GREEN_COLOR}" stroke-width="2"/><circle cx="15" cy="5" r="3" fill="#ffffff" stroke="${NEW_GREEN_COLOR}" stroke-width="1.5"/><line x1="15" y1="15" x2="15" y2="25" stroke="${NEW_GREEN_COLOR}" stroke-width="2"/><circle cx="15" cy="25" r="3" fill="#ffffff" stroke="${NEW_GREEN_COLOR}" stroke-width="1.5"/><line x1="15" y1="15" x2="5" y2="15" stroke="${NEW_GREEN_COLOR}" stroke-width="2"/><circle cx="5" cy="15" r="3" fill="#ffffff" stroke="${NEW_GREEN_COLOR}" stroke-width="1.5"/><line x1="15" y1="15" x2="25" y2="15" stroke="${NEW_GREEN_COLOR}" stroke-width="2"/><circle cx="25" cy="15" r="3" fill="#ffffff" stroke="${NEW_GREEN_COLOR}" stroke-width="1.5"/></svg></div>`,
            iconSize: [50, 50],
            iconAnchor: [25, 25]
        });
        const marker = leaflet.marker(waypoints[0], { icon: droneIcon }).addTo(map);
        setDroneMarker(marker);
        setIsSimulating(true);
    };

    useEffect(() => {
        if (!isSimulating || !droneMarker) {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            return;
        }

        const animate = (currentTime) => {
            const { startTime, segmentDistances, totalDistance } = simulationStateRef.current;
            const elapsedTime = currentTime - startTime;
            const elapsedDistance = (elapsedTime / 1000) * SIMULATION_SPEED_MPS;

            if (elapsedDistance >= totalDistance) {
                droneMarker.setLatLng(waypoints[waypoints.length - 1]);
                setIsSimulating(false);
                return;
            }

            let distanceTraveled = 0;
            let currentSegment = 0;
            for (let i = 0; i < segmentDistances.length; i++) {
                if (distanceTraveled + segmentDistances[i] >= elapsedDistance) {
                    currentSegment = i;
                    break;
                }
                distanceTraveled += segmentDistances[i];
            }

            const distanceIntoSegment = elapsedDistance - distanceTraveled;
            const segmentProgress = distanceIntoSegment / segmentDistances[currentSegment];
            const start = waypoints[currentSegment], end = waypoints[currentSegment + 1];

            const currentLat = start[0] + (end[0] - start[0]) * segmentProgress;
            const currentLng = start[1] + (end[1] - start[1]) * segmentProgress;
            droneMarker.setLatLng([currentLat, currentLng]);

            const angle = Math.atan2(end[1] - start[1], end[0] - start[0]) * 180 / Math.PI + 90;
            const iconElement = droneMarker.getElement()?.querySelector('div');
            if (iconElement) iconElement.style.transform = `rotate(${angle}deg)`;

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, [isSimulating, droneMarker, waypoints]);

    const clearAll = (clearRectangle = true) => {
        setIsSimulating(false);
        setWaypoints([]);
        if (droneMarker) droneMarker.remove();
        setDroneMarker(null);
        if (clearRectangle && rectangleRef.current) {
            rectangleRef.current.remove();
            rectangleRef.current = null;
        }
    };

    const radiansToDegrees = (rad) => (rad * 180 / Math.PI);

    return (
        <div className="relative w-full h-full">
            <div id="map" className="w-full h-full rounded-xl"></div>

            <div className="absolute bottom-4 left-4 z-[1000] w-full max-w-sm">
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <StatCard icon={<BatteryFull size={16}/>} label="Battery" value={`${droneInfo?.battery?.level || 0}%`} valueClassName="text-xl">
                        <BatteryBar level={droneInfo?.battery?.level} />
                    </StatCard>
                    <StatCard icon={<Zap size={16}/>} label="Voltage" value={`${droneInfo?.battery?.voltage?.toFixed(2) || '0.00'} V`} valueClassName="text-xl"/>
                    <StatCard icon={<ArrowUp size={16}/>} label="Altitude" value={`${droneInfo?.location?.alt?.toFixed(1) || '0.0'} m`} valueClassName="text-xl"/>
                    <StatCard icon={<Navigation size={16}/>} label="Attitude" value={`P: ${radiansToDegrees(droneInfo?.attitude?.pitch).toFixed(0)}° R: ${radiansToDegrees(droneInfo?.attitude?.roll).toFixed(0)}°`} valueClassName="text-lg"/>
                    <StatCard icon={<Compass size={16}/>} label="Heading" value={`${droneInfo?.heading || 0}°`} valueClassName="text-xl"/>
                    <StatCard icon={<Satellite size={16}/>} label="Satellites" value={droneInfo?.satellites || 0} valueClassName="text-xl"/>
                </div>
            </div>

            <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 w-64 z-[1000]">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Mission Planner</h3>
                
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tool</label>
                    <div className="flex gap-2">
                        <button onClick={() => !isSimulating && setTool('manual')} disabled={isSimulating} className={`flex-1 py-2 px-3 rounded transition-colors text-white border-2 ${tool === 'manual' ? 'border-gray-800' : 'border-transparent'}`} style={{ backgroundColor: tool === 'manual' ? NEW_GREEN_DARKER : NEW_GREEN_COLOR }}>Manual</button>
                        <button onClick={() => !isSimulating && setTool('auto')} disabled={isSimulating} className={`flex-1 py-2 px-3 rounded transition-colors text-white border-2 ${tool === 'auto' ? 'border-gray-800' : 'border-transparent'}`} style={{ backgroundColor: tool === 'auto' ? NEW_GREEN_DARKER : NEW_GREEN_COLOR }}>Auto</button>
                    </div>
                </div>

                <div className="space-y-2">
                    <button onClick={startSimulation} disabled={waypoints.length < 2 || isSimulating} className="w-full py-2 px-4 rounded font-medium transition-colors text-white" style={{ backgroundColor: (waypoints.length >= 2 && !isSimulating) ? NEW_GREEN_COLOR : '#a0aec0', cursor: (waypoints.length >= 2 && !isSimulating) ? 'pointer' : 'not-allowed' }}>
                        Start Simulation
                    </button>
                    <button onClick={() => clearAll(true)} className="w-full py-2 px-4 bg-red-500 text-white rounded font-medium hover:bg-red-600 transition-colors">
                        Clear All
                    </button>
                </div>
            </div>
        </div>
    );
}