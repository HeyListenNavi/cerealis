import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

const RecenterAutomatically = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position);
    }
  }, [position, map]);
  return null;
};

export default function DroneMap() {
  const [droneData, setDroneData] = useState(null);
  const [error, setError] = useState(null);
  const defaultPosition = [29.098668, -110.997321]; // Mexico City

  useEffect(() => {
    const ws = new WebSocket("wss://websockets.cerealis.cloud/ws/drone_info");
    ws.onopen = () => {
      console.log("Connected to drone info feed.");
      setError(null);
    };
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.location && data.location.lat !== null) {
        setDroneData(data);
      } else {
        console.log("Received status:", data.status);
      }
    };
    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
      setError("Failed to connect to drone feed. Is the server running?");
    };
    ws.onclose = () => {
      console.log("Disconnected from drone info feed.");
    };
    return () => {
      ws.close();
    };
  }, []);

  const droneIcon = useMemo(() => L.divIcon({
    className: 'drone-icon-container',
    html: `
      <div>
        <svg width="50" height="50" viewBox="0 0 30 30" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
          <circle cx="15" cy="15" r="4" fill="#658c2d"/>
          <line x1="15" y1="15" x2="15" y2="5" stroke="#658c2d" stroke-width="2"/>
          <circle cx="15" cy="5" r="3" fill="#ffffff" stroke="#658c2d" stroke-width="1.5"/>
          <line x1="15" y1="15" x2="15" y2="25" stroke="#658c2d" stroke-width="2"/>
          <circle cx="15" cy="25" r="3" fill="#ffffff" stroke="#658c2d" stroke-width="1.5"/>
          <line x1="15" y1="15" x2="5" y2="15" stroke="#658c2d" stroke-width="2"/>
          <circle cx="5" cy="15" r="3" fill="#ffffff" stroke="#658c2d" stroke-width="1.5"/>
          <line x1="15" y1="15" x2="25" y2="15" stroke="#658c2d" stroke-width="2"/>
          <circle cx="25" cy="15" r="3" fill="#ffffff" stroke="#658c2d" stroke-width="1.5"/>
        </svg>
      </div>
    `,
    iconSize: [50, 50],
    iconAnchor: [25, 25],
  }), []);

  const dronePosition = droneData ? [droneData.location.lat, droneData.location.lon] : null;
  const mapCenter = defaultPosition;

  return (
      <MapContainer
        center={mapCenter}
        zoom={16}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {dronePosition && (
          <Marker position={dronePosition} icon={droneIcon}>
            <Popup>
              <b>Drone Telemetry</b> <br />
              Lat: {droneData.location.lat.toFixed(6)} <br />
              Lon: {droneData.location.lon.toFixed(6)} <br />
              Altitude: {droneData.location.alt.toFixed(2)}m <br />
              Mode: {droneData.mode} <br />
              Battery: {droneData.battery.voltage.toFixed(2)}V
            </Popup>
          </Marker>
        )}
        <RecenterAutomatically position={dronePosition} />
      </MapContainer>
  );
}
