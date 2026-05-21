import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Polygon, Tooltip as LeafletTooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
    Leaf, 
    Droplets, 
    FlaskConical, 
    AlertTriangle, 
    ArrowUp, 
    ArrowDown, 
    CheckCircle, 
    Map as MapIcon,
    Info
} from 'lucide-react';

// Simplified data structure with more realistic agave field shapes
const fieldZones = [
    {
        id: 'norte-superior',
        name: "Lote Norte A",
        color: "#658c2d", // Healthy
        bounds: [
            [32.5365, -116.9278],
            [32.5368, -116.9260],
            [32.5362, -116.9258],
            [32.5359, -116.9272],
            [32.5361, -116.9276]
        ],
        metrics: {
            salud: { label: "Salud General", value: 95, status: "Excelente", color: "text-green-400" },
            nutrientes: { label: "Nivel de Nutrientes", value: 90, status: "Alto", color: "text-green-400" },
            humedad: { label: "Humedad del Suelo", value: 80, status: "Óptima", color: "text-green-400" },
            plagas: { label: "Riesgo de Plagas", value: 2, status: "Inexistente", color: "text-green-400" }
        },
        summary: "El Lote Norte A presenta el mejor desarrollo foliar de la temporada. Los niveles de nitrógeno son ideales."
    },
    {
        id: 'norte-inferior',
        name: "Lote Norte B",
        color: "#658c2d", // Healthy
        bounds: [
            [32.5359, -116.9272],
            [32.5362, -116.9258],
            [32.5355, -116.9255],
            [32.5352, -116.9268]
        ],
        metrics: {
            salud: { label: "Salud General", value: 88, status: "Muy Buena", color: "text-green-400" },
            nutrientes: { label: "Nivel de Nutrientes", value: 82, status: "Bueno", color: "text-green-400" },
            humedad: { label: "Humedad del Suelo", value: 70, status: "Adecuada", color: "text-green-400" },
            plagas: { label: "Riesgo de Plagas", value: 8, status: "Bajo", color: "text-green-400" }
        },
        summary: "Desarrollo constante. Se recomienda mantener el ciclo de riego actual sin cambios."
    },
    {
        id: 'centro',
        name: "Sección Central",
        color: "#f59e0b", // Warning
        bounds: [
            [32.5352, -116.9268],
            [32.5355, -116.9255],
            [32.5348, -116.9252],
            [32.5344, -116.9260],
            [32.5346, -116.9266]
        ],
        metrics: {
            salud: { label: "Salud General", value: 65, status: "Regular", color: "text-yellow-400" },
            nutrientes: { label: "Nivel de Nutrientes", value: 50, status: "Moderado", color: "text-yellow-400" },
            humedad: { label: "Humedad del Suelo", value: 38, status: "Baja", color: "text-yellow-400" },
            plagas: { label: "Riesgo de Plagas", value: 30, status: "Moderado", color: "text-yellow-400" }
        },
        summary: "Se detecta estrés hídrico moderado en el centro del lote. Posible obstrucción en goteo."
    },
    {
        id: 'sur-este',
        name: "Lote Sur Este",
        color: "#ef4444", // Critical
        bounds: [
            [32.5348, -116.9252],
            [32.5350, -116.9242],
            [32.5342, -116.9238],
            [32.5338, -116.9248]
        ],
        metrics: {
            salud: { label: "Salud General", value: 42, status: "Crítica", color: "text-red-400" },
            nutrientes: { label: "Nivel de Nutrientes", value: 28, status: "Deficiente", color: "text-red-400" },
            humedad: { label: "Humedad del Suelo", value: 12, status: "Muy Baja", color: "text-red-400" },
            plagas: { label: "Riesgo de Plagas", value: 65, status: "Alto", color: "text-red-400" }
        },
        summary: "Urgencia detectada: Zona con alta evaporación y baja retención. Requiere fertilización foliar inmediata."
    },
    {
        id: 'sur-oeste',
        name: "Lote Sur Oeste",
        color: "#f59e0b", // Warning
        bounds: [
            [32.5346, -116.9266],
            [32.5344, -116.9260],
            [32.5338, -116.9248],
            [32.5334, -116.9255],
            [32.5336, -116.9268]
        ],
        metrics: {
            salud: { label: "Salud General", value: 72, status: "Bueno", color: "text-yellow-400" },
            nutrientes: { label: "Nivel de Nutrientes", value: 65, status: "Estable", color: "text-yellow-400" },
            humedad: { label: "Humedad del Suelo", value: 55, status: "Regular", color: "text-yellow-400" },
            plagas: { label: "Riesgo de Plagas", value: 15, status: "Controlado", color: "text-yellow-400" }
        },
        summary: "Zona en recuperación tras el último tratamiento. Mantener vigilancia sobre humedad relativa."
    }
];

const RecenterMap = ({ bounds }) => {
    const map = useMap();
    useEffect(() => {
        if (bounds) {
            map.fitBounds(bounds, { padding: [20, 20] });
        }
    }, [map, bounds]);
    return null;
};

const MetricCard = ({ label, value, status, color }) => (
    <div className="bg-gray-800/40 p-4 rounded-xl border border-gray-700/30">
        <p className="text-sm text-gray-400 mb-1">{label}</p>
        <div className="flex justify-between items-end">
            <div className="text-2xl font-bold text-white">{value}%</div>
            <div className={`text-sm font-semibold ${color}`}>{status}</div>
        </div>
        <div className="w-full bg-gray-700 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
                className={`h-full rounded-full transition-all duration-500 ${color.replace('text-', 'bg-')}`} 
                style={{ width: `${value}%` }}
            />
        </div>
    </div>
);

export default function AIAnalyticsDashboard() {
    const [selectedZone, setSelectedZone] = useState(null);

    const allBounds = useMemo(() => {
        const points = fieldZones.flatMap(z => z.bounds);
        return L.latLngBounds(points);
    }, []);

    const dataToShow = selectedZone || {
        name: "Resumen General del Campo",
        metrics: {
            salud: { label: "Salud General Promedio", value: 68, status: "Estable", color: "text-yellow-400" },
            nutrientes: { label: "Nutrientes Promedio", value: 57, status: "Moderado", color: "text-yellow-400" },
            humedad: { label: "Humedad Promedio", value: 44, status: "Baja", color: "text-yellow-400" },
            plagas: { label: "Riesgo de Plagas", value: 30, status: "Moderado", color: "text-yellow-400" }
        },
        summary: "El campo presenta variaciones significativas. Los lotes del Sur requieren atención prioritaria en riego. Haz clic en una zona para ver el diagnóstico específico de cada sector."
    };

    const recommendations = useMemo(() => {
        if (selectedZone) {
            if (selectedZone.id.includes('norte')) {
                return [
                    { 
                        title: "Mantenimiento Preventivo",
                        text: `Todo se ve excelente en ${selectedZone.name}. Solo mantén el riego actual.`, 
                        priority: "Baja",
                        why: "Las plantas están en su punto óptimo de hidratación y nutrientes.",
                        icon: CheckCircle,
                        color: "text-green-400"
                    },
                    { 
                        title: "Planificación de Cosecha",
                        text: `Empieza a preparar las herramientas para la cosecha selectiva.`, 
                        priority: "Media",
                        why: "El tamaño de las pencas indica que estarán listas en unos 15 días.",
                        icon: Leaf,
                        color: "text-blue-400"
                    }
                ];
            } else if (selectedZone.id === 'centro') {
                return [
                    { 
                        title: "Ajuste de Riego",
                        text: `Aumenta el tiempo de goteo en 15 minutos durante la mañana.`, 
                        priority: "Alta",
                        why: "Hemos notado que el suelo se está secando más rápido de lo normal en el centro.",
                        icon: Droplets,
                        color: "text-orange-400"
                    },
                    { 
                        title: "Nutrición Extra",
                        text: `Añade un poco de potasio al sistema de fertirriego.`, 
                        priority: "Media",
                        why: "Ayudará a que las plantas de esta zona recuperen su color verde intenso.",
                        icon: FlaskConical,
                        color: "text-yellow-400"
                    }
                ];
            } else {
                return [
                    { 
                        title: "¡Riego Urgente!",
                        text: `Necesitas aplicar un riego profundo de inmediato en ${selectedZone.name}.`, 
                        priority: "Crítica",
                        why: "Las plantas están sufriendo por falta de agua y podrían empezar a marchitarse.",
                        icon: Droplets,
                        color: "text-red-500"
                    },
                    { 
                        title: "Protección de Cultivo",
                        text: `Aplica el tratamiento contra hongos antes de que caiga el sol.`, 
                        priority: "Alta",
                        why: "La humedad nocturna combinada con el calor actual favorece las plagas en esta zona baja.",
                        icon: AlertTriangle,
                        color: "text-orange-400"
                    }
                ];
            }
        }
        return [
            { 
                title: "Optimización de Agua",
                text: "Prioriza el riego en los sectores del Sur hoy por la tarde.", 
                priority: "Media",
                why: "Es la zona que más rápido está perdiendo humedad por el sol.",
                icon: Droplets,
                color: "text-orange-400"
            },
            { 
                title: "Refuerzo Nutricional",
                text: "Aplica fertilizante en el área central mañana temprano.", 
                priority: "Media",
                why: "Las plantas del centro necesitan un empujón para igualar el crecimiento del norte.",
                icon: FlaskConical,
                color: "text-yellow-400"
            }
        ];
    }, [selectedZone]);

    return (
        <div className="p-4 lg:p-8 bg-zinc-950 min-h-full w-full space-y-6 lg:space-y-8 font-sans text-zinc-100">
            
            <header className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-800 pb-6 gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-2">
                        <MapIcon className="text-[#658c2d] w-8 h-8" />
                        Monitoreo Inteligente de Cultivos
                    </h1>
                    <p className="text-zinc-400 text-sm mt-1">
                        Estado visual y análisis predictivo por sectores.
                    </p>
                </div>
                <div className="bg-zinc-900 px-4 py-2 rounded-xl border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Sincronización IA</span>
                    <p className="text-sm font-medium text-zinc-200">Hoy, 05:55 AM</p>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
                
                {/* MAP SECTION */}
                <div className="xl:col-span-7 bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl h-[450px] lg:h-[550px] relative group">
                    <MapContainer
                        center={[32.535404, -116.926896]}
                        zoom={17}
                        scrollWheelZoom={false}
                        style={{ height: '100%', width: '100%' }}
                        zoomControl={false}
                    >
                        <TileLayer
                            attribution='&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        />
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            opacity={0.3}
                        />
                        {fieldZones.map(zone => (
                            <Polygon
                                key={zone.id}
                                positions={zone.bounds}
                                pathOptions={{
                                    fillColor: zone.color,
                                    fillOpacity: selectedZone?.id === zone.id ? 0.6 : 0.35,
                                    color: 'white',
                                    weight: selectedZone?.id === zone.id ? 3 : 1.5,
                                }}
                                eventHandlers={{
                                    click: () => setSelectedZone(zone)
                                }}
                            >
                                <LeafletTooltip permanent direction="center" className="custom-zone-label">
                                    <div className="flex flex-col items-center">
                                        <span className="name">{zone.name}</span>
                                        <span className="val">{zone.metrics.salud.value}%</span>
                                    </div>
                                </LeafletTooltip>
                            </Polygon>
                        ))}
                        <RecenterMap bounds={allBounds} />
                    </MapContainer>
                    
                    <div className="absolute top-6 right-6 bg-zinc-900/80 backdrop-blur-xl p-4 rounded-2xl border border-zinc-700/50 z-[1000] text-xs space-y-3 shadow-2xl">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-[#658c2d] shadow-[0_0_8px_rgba(101,140,45,0.6)]"></div>
                            <span className="text-zinc-300 font-medium">Saludable</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-[#f59e0b] shadow-[0_0_8px_rgba(245,158,11,0.6)]"></div>
                            <span className="text-zinc-300 font-medium">Atención</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-[#ef4444] shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
                            <span className="text-zinc-300 font-medium">Urgente</span>
                        </div>
                    </div>
                    
                    {!selectedZone && (
                        <div className="absolute inset-x-0 bottom-10 flex justify-center z-[1000] pointer-events-none">
                            <div className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-6 py-3 rounded-2xl text-sm font-semibold shadow-2xl animate-pulse">
                                Toca un sector para analizar
                            </div>
                        </div>
                    )}
                </div>

                {/* DATA SECTION */}
                <div className="xl:col-span-5 flex flex-col gap-6">
                    <div className="bg-zinc-900/60 backdrop-blur-sm p-6 lg:p-8 rounded-3xl border border-zinc-800 space-y-8 shadow-xl">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-black text-white tracking-tight">{dataToShow.name}</h2>
                                {selectedZone && <p className="text-xs text-[#658c2d] font-bold mt-1 uppercase tracking-widest">Diagnóstico por Zona</p>}
                            </div>
                            {selectedZone && (
                                <button 
                                    onClick={() => setSelectedZone(null)}
                                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-[10px] text-zinc-300 font-bold rounded-lg border border-zinc-700 transition-all uppercase tracking-tighter"
                                >
                                    Restablecer
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <MetricCard {...dataToShow.metrics.salud} />
                            <MetricCard {...dataToShow.metrics.nutrientes} />
                            <MetricCard {...dataToShow.metrics.humedad} />
                            <MetricCard {...dataToShow.metrics.plagas} />
                        </div>

                        <div className="bg-zinc-800/30 p-5 rounded-2xl border border-zinc-700/30 flex gap-4 items-start relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-[#658c2d]/40"></div>
                            <div className={`mt-1 flex-shrink-0 ${selectedZone ? (dataToShow.metrics.salud.color) : 'text-blue-400'}`}>
                                <Info size={22} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h4 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-1.5">Análisis de Precisión IA</h4>
                                <p className="text-sm text-zinc-300 leading-relaxed font-medium">
                                    {dataToShow.summary}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-zinc-900/60 p-6 lg:p-8 rounded-3xl border border-zinc-800 shadow-xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                            <CheckCircle size={120} />
                        </div>
                        <h3 className="text-sm font-black text-[#658c2d] uppercase tracking-[0.2em] flex items-center gap-2 mb-6">
                            <CheckCircle size={18} strokeWidth={3} />
                            Guía de Acciones de Hoy
                        </h3>
                        <div className="space-y-6">
                            {recommendations.map((rec, i) => (
                                <div key={i} className="bg-zinc-800/40 p-5 rounded-2xl border border-zinc-700/30 hover:border-[#658c2d]/50 transition-all group">
                                    <div className="flex gap-4 items-start">
                                        <div className={`flex-shrink-0 p-3 rounded-xl ${rec.color.replace('text-', 'bg-')}/20 ${rec.color}`}>
                                            <rec.icon size={22} strokeWidth={2.5} />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-sm font-black text-white uppercase tracking-tight">{rec.title}</h4>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                                    rec.priority === 'Crítica' ? 'bg-red-500 text-white' : 
                                                    rec.priority === 'Alta' ? 'bg-orange-500 text-white' : 
                                                    'bg-zinc-700 text-zinc-300'
                                                }`}>
                                                    {rec.priority}
                                                </span>
                                            </div>
                                            <p className="text-sm font-bold text-zinc-200">{rec.text}</p>
                                            <p className="text-xs text-zinc-400 leading-relaxed italic mt-2 flex gap-1 items-start">
                                                <Info size={14} className="flex-shrink-0 mt-0.5 opacity-60" />
                                                <span><strong>¿Por qué?:</strong> {rec.why}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}