import React, { useMemo } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { report } from '@/routes';
import { fieldZones, getRecommendationsForZone, getGeneralRecommendations } from '@/lib/field-data';
import { 
    FileText, 
    Calendar, 
    User, 
    Droplets, 
    FlaskConical, 
    CheckCircle, 
    AlertTriangle,
    Info,
    LayoutDashboard,
    ChevronRight
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Reporte',
        href: report().url,
    }
];

const bgColors = {
    'text-green-400': 'bg-green-400',
    'text-yellow-400': 'bg-yellow-400',
    'text-orange-400': 'bg-orange-400',
    'text-red-400': 'bg-red-400',
    'text-red-500': 'bg-red-500',
};

const MetricBar = ({ label, value, color }) => (
    <div className="space-y-1">
        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            <span>{label}</span>
            <span>{value}%</span>
        </div>
        <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden border border-zinc-700/50">
            <div 
                className={`h-full rounded-full transition-all duration-1000 ${bgColors[color] || 'bg-zinc-500'}`} 
                style={{ width: `${value}%` }}
            />
        </div>
    </div>
);

export default function DroneReport() {
    const generalRecommendations = useMemo(() => getGeneralRecommendations(), []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Estado de tus Cultivos" />
            
            <div className="flex-1 bg-zinc-950 p-4 lg:p-12 font-sans overflow-y-auto">
                <div className="max-w-5xl mx-auto space-y-12">
                    
                    {/* Header Document Style */}
                    <div className="border-b-2 border-zinc-800 pb-10 flex flex-col md:flex-row justify-between items-start gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-[#658c2d]">
                                <FileText size={32} strokeWidth={2.5} />
                                <h1 className="text-3xl lg:text-4xl font-black text-white uppercase tracking-tighter italic">Estado de tus Cultivos hoy</h1>
                            </div>
                            <div className="flex flex-wrap gap-6 text-zinc-400 text-sm font-bold uppercase tracking-widest">
                                <div className="flex items-center gap-2"><Calendar size={16} /> 21 Mayo, 2026</div>
                                <div className="flex items-center gap-2"><Info size={16} /> Vuelo del Dron: Finalizado</div>
                            </div>
                        </div>
                        <div className="bg-[#658c2d] text-white px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest shadow-[0_0_20px_rgba(101,140,45,0.3)]">
                            Análisis Completo
                        </div>
                    </div>

                    {/* Executive Summary */}
                    <section className="bg-zinc-900/40 p-8 rounded-3xl border border-zinc-800 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                            <LayoutDashboard size={200} />
                        </div>
                        <h2 className="text-xl font-black text-white uppercase tracking-tight mb-4 flex items-center gap-3">
                            <ChevronRight className="text-[#658c2d]" />
                            Lo que el dron vio hoy
                        </h2>
                        <p className="text-zinc-300 leading-relaxed font-medium text-lg">
                            ¡Hola! El dron ya dio su vuelta de hoy por todo el campo. En general, las plantas están creciendo con mucha fuerza, 
                            sobre todo en la parte <span className="text-[#658c2d] font-bold">Norte</span>. Sin embargo, hay un punto que nos preocupa: 
                            el <span className="text-red-400 font-bold">Lote Sur Este</span> tiene mucha sed. Sería bueno que le dieras una revisada 
                            mañana mismo para que no se nos sequen las plantas.
                        </p>
                    </section>

                    {/* Zone Breakdown */}
                    <div className="space-y-8">
                        <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3 px-2">
                            <ChevronRight className="text-[#658c2d]" />
                            ¿Cómo está cada zona?
                        </h2>
                        
                        <div className="grid grid-cols-1 gap-6">
                            {fieldZones.map(zone => (
                                <div key={zone.id} className="bg-zinc-900/60 rounded-3xl border border-zinc-800 overflow-hidden flex flex-col lg:flex-row shadow-xl">
                                    {/* Zone Identity */}
                                    <div className="lg:w-1/3 p-8 bg-zinc-900/40 border-r border-zinc-800 space-y-6">
                                        <div className="space-y-1">
                                            <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${zone.metrics.salud.color}`}>Estado: {zone.metrics.salud.status}</span>
                                            <h3 className="text-2xl font-black text-white tracking-tight">{zone.name}</h3>
                                        </div>
                                        <div className="space-y-5">
                                            <MetricBar label="Salud" value={zone.metrics.salud.value} color={zone.metrics.salud.color} />
                                            <MetricBar label="Nutrientes" value={zone.metrics.nutrientes.value} color={zone.metrics.nutrientes.color} />
                                            <MetricBar label="Agua en el Suelo" value={zone.metrics.humedad.value} color={zone.metrics.humedad.color} />
                                            <MetricBar label="Riesgo de Plagas" value={zone.metrics.plagas.value} color={zone.metrics.plagas.color} />
                                        </div>
                                    </div>

                                    {/* Zone Insights & Recs */}
                                    <div className="lg:w-2/3 p-8 flex flex-col justify-between space-y-8">
                                        <div className="space-y-3">
                                            <h4 className="text-xs font-black text-zinc-500 uppercase tracking-widest">Lo que notamos</h4>
                                            <p className="text-zinc-300 font-medium leading-relaxed italic border-l-4 border-[#658c2d]/30 pl-4 text-base">
                                                "{zone.summary}"
                                            </p>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            <h4 className="text-xs font-black text-zinc-500 uppercase tracking-widest">Consejos del sistema</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {getRecommendationsForZone(zone.id, zone.name).map((rec, i) => (
                                                    <div key={i} className="bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800/50 flex gap-3">
                                                        <div className={`flex-shrink-0 mt-1 ${rec.color}`}><rec.icon size={16} /></div>
                                                        <div className="space-y-1">
                                                            <p className="text-xs font-black text-white leading-tight uppercase">{rec.title}</p>
                                                            <p className="text-[11px] text-zinc-400 leading-snug">{rec.text}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Consolidated Action Plan */}
                    <section className="bg-[#658c2d] rounded-3xl p-8 lg:p-12 text-white shadow-[0_20px_50px_rgba(101,140,45,0.3)]">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                            <div>
                                <h2 className="text-3xl font-black uppercase tracking-tighter italic">Lo que debes hacer hoy</h2>
                                <p className="text-[#d9f99d] font-bold uppercase text-xs tracking-widest mt-2">Tareas más importantes para tu jornada</p>
                            </div>
                            <CheckCircle size={60} strokeWidth={2.5} className="opacity-40" />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {generalRecommendations.map((rec, i) => (
                                <div key={i} className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white text-[#658c2d] p-2 rounded-lg"><rec.icon size={20} strokeWidth={3} /></div>
                                        <h4 className="font-black uppercase tracking-tight">{rec.title}</h4>
                                    </div>
                                    <p className="font-bold text-lg leading-tight">{rec.text}</p>
                                    <p className="text-sm text-[#d9f99d] italic leading-relaxed">
                                        <strong>¿Por qué?:</strong> {rec.why}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Footer Signature */}
                    <div className="pt-12 text-center border-t border-zinc-800">
                        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.5em]">
                            Hecho con cariño por Cerealis AI &copy; 2026
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
