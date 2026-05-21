import React, { useState, useEffect, useRef } from 'react';

// --- CONFIGURATION ---
const SERVER_IP = "wss://websockets.cerealis.cloud";
const INFO_URL = `${SERVER_IP}/ws/drone_info`;
const CONTROL_URL = `${SERVER_IP}/ws/control`;
const NEW_GREEN_COLOR = '#658c2d';
const NEW_GREEN_DARKER = '#516d23';
const SIMULATION_SPEED_MPS = 20; // Drone speed in meters per second
// ---------------------

/**
 * Custom hook to manage WebSocket connection for live drone telemetry.
 */
const useDroneTelemetry = (url) => {
    const [droneInfo, setDroneInfo] = useState(null);
    useEffect(() => {
        let ws;
        const connect = () => {
            ws = new WebSocket(url);
            ws.onmessage = (event) => {
                try {
                    setDroneInfo(JSON.parse(event.data));
                } catch (error) {
                    console.error("Failed to parse telemetry data:", error);
                }
            };
            ws.onclose = () => setTimeout(connect, 5000);
            ws.onerror = () => ws.close();
        };
        connect();
        return () => ws?.close();
    }, [url]);
    return { droneInfo };
};

/**
 * Main dashboard component with map and mission planning.
 */
export default function DroneDashboard() {
    const { droneInfo } = useDroneTelemetry(INFO_URL);
    const [map, setMap] = useState(null);
    const [leaflet, setLeaflet] = useState(null);
    const [tool, setTool] = useState('manual');
    const [waypoints, setWaypoints] = useState([]);
    const [polygonPoints, setPolygonPoints] = useState([]);
    const [isSimulating, setIsSimulating] = useState(false);
    const [droneMarker, setDroneMarker] = useState(null);
    const mapRef = useRef(null);
    const mapInitialized = useRef(false);
    const markersRef = useRef([]);
    const polylinesRef = useRef([]);
    const rectangleRef = useRef(null);
    const polygonRef = useRef(null);
    const isDrawingRef = useRef(false);
    const startPointRef = useRef(null);
    const animationFrameRef = useRef(null);
    const simulationStateRef = useRef({});
    const controlSocketRef = useRef(null);
    const motorIntervalRef = useRef(null);

    // Establish Control WebSocket connection
    useEffect(() => {
        const ws = new WebSocket(CONTROL_URL);
        controlSocketRef.current = ws;
        ws.onopen = () => console.log('Control WebSocket connected.');
        ws.onclose = () => console.log('Control WebSocket disconnected.');
        ws.onerror = (err) => console.error('Control WebSocket error:', err);
        return () => ws.close();
    }, []);

    // Function to send commands to the control socket
    const sendCommand = (command) => {
        if (controlSocketRef.current?.readyState === WebSocket.OPEN) {
            console.log(`Sending motor command: ${command}`);
            controlSocketRef.current.send(command);
        }
    };

    // Load Leaflet library dynamically
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

    // Initialize map
    useEffect(() => {
        if (!leaflet || mapRef.current) return;
        
        const fallbackCoords = [32.535404, -116.926896];
        const mapInstance = leaflet.map('map').setView(fallbackCoords, 16);
        
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    mapInstance.setView([latitude, longitude], 16);
                },
                (error) => {
                    console.error("Error getting current location:", error);
                }
            );
        }

        leaflet.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        }).addTo(mapInstance);
        leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            opacity: 0.4
        }).addTo(mapInstance);
        mapRef.current = mapInstance;
        setMap(mapInstance);
        mapInitialized.current = true;
        return () => mapRef.current?.remove();
    }, [leaflet]);

    const getDistance = (p1, p2) => {
        const toRad = deg => deg * Math.PI / 180;
        const R = 6371000;
        const dLat = toRad(p2[0] - p1[0]), dLon = toRad(p2[1] - p1[1]);
        const lat1 = toRad(p1[0]), lat2 = toRad(p2[0]);
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const isPointInPolygon = (point, polygon) => {
        const x = point[0], y = point[1];
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i][0], yi = polygon[i][1];
            const xj = polygon[j][0], yj = polygon[j][1];
            const intersect = ((yi > y) !== (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    };

    // Update polygon layer and generate grid when points change
    useEffect(() => {
        if (!map || !leaflet) return;
        if (polygonRef.current) polygonRef.current.remove();
        if (polygonPoints.length > 0) {
            polygonRef.current = leaflet.polygon(polygonPoints, { color: NEW_GREEN_COLOR, weight: 2, fillOpacity: 0.2 }).addTo(map);
            
            if (tool === 'polygon' && polygonPoints.length >= 3) {
                generatePolygonGrid();
            }
        } else if (tool === 'polygon') {
            setWaypoints([]);
        }
    }, [polygonPoints, map, leaflet, tool]);

    // Handle map interactions for drawing waypoints
    useEffect(() => {
        if (!map || !leaflet || isSimulating) return;
        const handleMapClick = (e) => {
            if (tool === 'manual') setWaypoints(prev => [...prev, [e.latlng.lat, e.latlng.lng]]);
            if (tool === 'polygon') setPolygonPoints(prev => [...prev, [e.latlng.lat, e.latlng.lng]]);
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
        const handleMouseUp = () => {
            if (isDrawingRef.current && startPointRef.current) {
                isDrawingRef.current = false;
                map.dragging.enable();
                const bounds = rectangleRef.current.getBounds();
                generateLawnmowerPattern(bounds.getSouthWest(), bounds.getNorthEast());
                startPointRef.current = null;
            }
        };
        map.on({ click: handleMapClick, mousedown: handleMouseDown, mousemove: handleMouseMove, mouseup: handleMouseUp });
        map.getContainer().style.cursor = (tool === 'auto' || tool === 'polygon') ? 'crosshair' : '';
        return () => {
            map.off({ click: handleMapClick, mousedown: handleMouseDown, mousemove: handleMouseMove, mouseup: handleMouseUp });
            map.getContainer().style.cursor = '';
            map.dragging.enable();
        };
    }, [map, leaflet, tool, isSimulating]);

    // Update markers and lines when waypoints change
    useEffect(() => {
        if (!map || !leaflet) return;
        markersRef.current.forEach(layer => layer.remove());
        polylinesRef.current.forEach(layer => layer.remove());
        markersRef.current = []; 
        polylinesRef.current = [];
        waypoints.forEach((point, idx) => {
            markersRef.current.push(leaflet.circleMarker(point, { radius: 6, fillColor: NEW_GREEN_COLOR, color: NEW_GREEN_DARKER, weight: 2, opacity: 1, fillOpacity: 1 }).addTo(map));
            if (idx > 0) {
                polylinesRef.current.push(leaflet.polyline([waypoints[idx - 1], point], { color: NEW_GREEN_COLOR, weight: 2, dashArray: '5, 5', opacity: 0.8 }).addTo(map));
            }
        });
    }, [waypoints, map, leaflet]);
    
    const generateLawnmowerPattern = (start, end) => {
        clearAll(false);
        const bounds = leaflet.latLngBounds(start, end);
        const south = bounds.getSouth();
        const north = bounds.getNorth();
        const west = bounds.getWest();
        const east = bounds.getEast();
        
        // Use a tighter spacing for better coverage (e.g., 10 meters)
        const coverageWidthMeters = 10;
        const latMetersPerDegree = 111320;
        const coverageWidthDegrees = coverageWidthMeters / latMetersPerDegree;
        
        const latDiff = north - south;
        const numPasses = Math.max(2, Math.ceil(latDiff / coverageWidthDegrees));
        const spacing = latDiff / (numPasses - 1);
        
        const finalWaypoints = [];
        let leftToRight = true;
        
        for (let i = 0; i < numPasses; i++) {
            const currentLat = south + (i * spacing);
            
            if (leftToRight) {
                finalWaypoints.push([currentLat, west]);
                finalWaypoints.push([currentLat, east]);
            } else {
                finalWaypoints.push([currentLat, east]);
                finalWaypoints.push([currentLat, west]);
            }
            leftToRight = !leftToRight;
        }
        
        setWaypoints(finalWaypoints);
    };

    const generatePolygonGrid = () => {
        if (polygonPoints.length < 3) return;
        
        const bounds = leaflet.polygon(polygonPoints).getBounds();
        const south = bounds.getSouth();
        const north = bounds.getNorth();
        const west = bounds.getWest();
        const east = bounds.getEast();
        
        const coverageWidthMeters = 10;
        const latMetersPerDegree = 111320;
        const coverageWidthDegrees = coverageWidthMeters / latMetersPerDegree;
        
        const latDiff = north - south;
        const numPasses = Math.max(2, Math.ceil(latDiff / coverageWidthDegrees));
        const spacing = latDiff / (numPasses - 1);
        
        let finalWaypoints = [];
        let leftToRight = true;
        
        for (let i = 0; i < numPasses; i++) {
            const currentLat = south + (i * spacing);
            
            // Find intersections of this latitude with polygon edges
            let intersections = [];
            for (let j = 0; j < polygonPoints.length; j++) {
                const p1 = polygonPoints[j];
                const p2 = polygonPoints[(j + 1) % polygonPoints.length];
                
                if ((p1[0] <= currentLat && p2[0] > currentLat) || (p2[0] <= currentLat && p1[0] > currentLat)) {
                    const t = (currentLat - p1[0]) / (p2[0] - p1[0]);
                    const lng = p1[1] + t * (p2[1] - p1[1]);
                    intersections.push(lng);
                }
            }
            
            intersections.sort((a, b) => a - b);
            
            // Generate segments between pairs of intersections
            const passWaypoints = [];
            for (let j = 0; j < intersections.length; j += 2) {
                if (j + 1 < intersections.length) {
                    if (leftToRight) {
                        passWaypoints.push([currentLat, intersections[j]]);
                        passWaypoints.push([currentLat, intersections[j+1]]);
                    } else {
                        passWaypoints.push([currentLat, intersections[j+1]]);
                        passWaypoints.push([currentLat, intersections[j]]);
                    }
                }
            }
            
            if (passWaypoints.length > 0) {
                finalWaypoints = [...finalWaypoints, ...passWaypoints];
                leftToRight = !leftToRight;
            }
        }
        
        setWaypoints(finalWaypoints);
    };

    const startSimulation = () => {
        if (waypoints.length < 2 || isSimulating || !leaflet) return;
        
        // --- FIX: Remove the previous drone marker if it exists ---
        if (droneMarker) {
            droneMarker.remove();
        }
        // ---------------------------------------------------------
        
        const segmentDistances = waypoints.slice(1).map((wp, i) => getDistance(waypoints[i], wp));
        const totalDistance = segmentDistances.reduce((a, b) => a + b, 0);
        
        simulationStateRef.current = {
            startTime: performance.now(),
            segmentDistances,
            totalDistance,
        };

        const droneIcon = leaflet.divIcon({
            className: 'drone-icon-container',
            html: `<div><svg width="50" height="50" viewBox="0 0 30 30" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));"><circle cx="15" cy="15" r="4" fill="${NEW_GREEN_COLOR}"/><line x1="15" y1="15" x2="15" y2="5" stroke="${NEW_GREEN_COLOR}" stroke-width="2"/><circle cx="15" cy="5" r="3" fill="#ffffff" stroke="${NEW_GREEN_COLOR}" stroke-width="1.5"/><line x1="15" y1="15" x2="15" y2="25" stroke="${NEW_GREEN_COLOR}" stroke-width="2"/><circle cx="15" cy="25" r="3" fill="#ffffff" stroke="${NEW_GREEN_COLOR}" stroke-width="1.5"/><line x1="15" y1="15" x2="5" y2="15" stroke="${NEW_GREEN_COLOR}" stroke-width="2"/><circle cx="5" cy="15" r="3" fill="#ffffff" stroke="${NEW_GREEN_COLOR}" stroke-width="1.5"/><line x1="15" y1="15" x2="25" y2="15" stroke="${NEW_GREEN_COLOR}" stroke-width="2"/><circle cx="25" cy="15" r="3" fill="#ffffff" stroke="${NEW_GREEN_COLOR}" stroke-width="1.5"/></svg></div>`,
            iconSize: [50, 50],
            iconAnchor: [25, 25]
        });
        const marker = leaflet.marker(waypoints[0], { icon: droneIcon }).addTo(map);
        setDroneMarker(marker); // Set the new marker in state
        setIsSimulating(true);

        // Start sending "up" command every 10 seconds
        sendCommand('up');
        motorIntervalRef.current = setInterval(() => sendCommand('up'), 2000);
    };

    // Simulation animation loop
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
                clearInterval(motorIntervalRef.current);
                sendCommand('stop');
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

    const clearAll = (clearShapes = true) => {
        setIsSimulating(false);
        setWaypoints([]);
        if (droneMarker) {
            droneMarker.remove();
            setDroneMarker(null);
        }
        if (clearShapes) {
            if (rectangleRef.current) {
                rectangleRef.current.remove();
                rectangleRef.current = null;
            }
            if (polygonRef.current) {
                polygonRef.current.remove();
                polygonRef.current = null;
            }
            setPolygonPoints([]);
        }
        clearInterval(motorIntervalRef.current);
        sendCommand('stop');
    };

    return (
        <div className="relative w-full h-full font-sans">
            <div id="map" className="w-full h-full rounded-xl"></div>
            <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 w-64 z-[1000]">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Planificador de Misión</h3>
                
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Herramienta</label>
                    <div className="flex flex-wrap gap-2">
                        <button onClick={() => !isSimulating && setTool('manual')} disabled={isSimulating} className={`flex-1 py-2 px-3 rounded transition-colors text-white border-2 ${tool === 'manual' ? 'border-gray-800' : 'border-transparent'}`} style={{ backgroundColor: tool === 'manual' ? NEW_GREEN_DARKER : NEW_GREEN_COLOR }}>Manual</button>
                        <button onClick={() => !isSimulating && setTool('auto')} disabled={isSimulating} className={`flex-1 py-2 px-3 rounded transition-colors text-white border-2 ${tool === 'auto' ? 'border-gray-800' : 'border-transparent'}`} style={{ backgroundColor: tool === 'auto' ? NEW_GREEN_DARKER : NEW_GREEN_COLOR }}>Auto</button>
                        <button onClick={() => !isSimulating && setTool('polygon')} disabled={isSimulating} className={`flex-1 py-2 px-3 rounded transition-colors text-white border-2 ${tool === 'polygon' ? 'border-gray-800' : 'border-transparent'}`} style={{ backgroundColor: tool === 'polygon' ? NEW_GREEN_DARKER : NEW_GREEN_COLOR }}>Polígono</button>
                    </div>
                </div>

                <div className="space-y-2">
                    <button onClick={startSimulation} disabled={waypoints.length < 2 || isSimulating} className="w-full py-2 px-4 rounded font-medium transition-colors text-white" style={{ backgroundColor: (waypoints.length >= 2 && !isSimulating) ? NEW_GREEN_COLOR : '#a0aec0', cursor: (waypoints.length >= 2 && !isSimulating) ? 'pointer' : 'not-allowed' }}>
                        Iniciar Simulación
                    </button>
                    <button onClick={() => clearAll(true)} className="w-full py-2 px-4 bg-red-500 text-white rounded font-medium hover:bg-red-600 transition-colors">
                        Limpiar Todo
                    </button>
                </div>
            </div>
        </div>
    );
}

