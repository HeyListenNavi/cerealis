import React from 'react';
import { Leaf, Droplets, FlaskConical, AlertTriangle, ArrowUp, ArrowDown, BarChart2, CheckCircle, BrainCircuit, Sparkles } from 'lucide-react';

const mockAnalysisData = {
    scanDate: "2025-10-05T05:55:00Z", 
    executiveSummary: "AI analysis indicates developing water stress in the northwest quadrant of the agave field, correlating with a 4% decline in the Vegetation Index (NDVI) over the past week. While overall health remains fair, immediate irrigation adjustments are recommended to prevent potential yield loss.",
    alerts: [
        { id: 'alert1', severity: 'warning', title: "High Water Stress Detected", details: "Crops shows a Water Stress Index of 82%, significantly above the acceptable threshold of 60%." },
    ],
    kpis: {
        overallHealth: { value: 76, trend: -4, tooltip: "An AI-calculated index from 0-100 representing the general well-being of the crops based on multiple spectral bands." },
        yieldPrediction: { value: 85, trend: -8, tooltip: "Estimated yield as a percentage of the optimal potential yield, based on current health and historical data." },
        areaScanned: { value: 12.5, trend: 0, tooltip: "Total area in hectares covered during this autonomous drone scan." },
    },
    spectralAnalysis: [
        { id: 'ndvi', label: "Vegetation Index (NDVI)", value: 0.68, optimalRange: [0.65, 0.85] },
        { id: 'ndre', label: "Nutrient Stress (NDRE)", value: 0.55, optimalRange: [0.6, 0.7] },
        { id: 'water', label: "Water Stress Index", value: 82, optimalRange: [0, 60], invert: true },
        { id: 'pests', label: "Pest/Disease Risk", value: 45, optimalRange: [0, 30], invert: true }, 
    ],
    historicalData: {
        labels: ["Sep 20", "Sep 25", "Sep 30", "Oct 2", "Oct 4"],
        tooltip: "Tracks key health metrics over the last five scans to identify patterns and changes over time.",
        datasets: [
            {
                label: "NDVI",
                data: [0.72, 0.71, 0.70, 0.69, 0.68],
                color: "#658c2d",
            },
            {
                label: "Water Stress %",
                data: [45, 55, 60, 75, 82],
                color: "#f59e0b",
            }
        ]
    },
    recommendations: [
        { id: 1, priority: 'High', text: "Adjust irrigation schedule for the northwest quadrant immediately.", icon: Droplets },
        { id: 2, priority: 'Medium', text: "Conduct soil sample analysis in Zone B for potential nitrogen deficiency.", icon: FlaskConical },
        { id: 3, priority: 'Low', text: "Schedule follow-up drone scan in 7 days to monitor vegetation response.", icon: Leaf },
    ]
};

const Tooltip = ({ text, children }) => (
    <div className="relative group">
        {children}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs bg-gray-700 text-white text-xs rounded-lg py-1.5 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 shadow-lg border border-gray-700">
            {text}
        </div>
    </div>
);

const KpiCard = ({ label, value, unit, trend, tooltip }) => (
    <Tooltip text={tooltip}>
        <div className="bg-gray-800/20 p-4 rounded-xl">
            <p className="text-sm text-gray-400">{label}</p>
            <div className="flex items-baseline space-x-2 mt-1">
                <p className="text-3xl font-bold text-white">{value}<span className="text-xl font-medium">{unit}</span></p>
                {trend !== 0 && (
                    <div className={`flex items-center text-sm font-semibold ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {trend > 0 ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                        <span>{Math.abs(trend)}%</span>
                    </div>
                )}
            </div>
        </div>
    </Tooltip>
);

const RadialGauge = ({ label, value, optimalRange, invert = false }) => {
    const min = optimalRange[0];
    const max = optimalRange[1];
    
    let percentage = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
    
    let displayPercentage = invert ? 100 - percentage : percentage;

    const getStatus = () => {
        if (invert) {
            if (value > max) return { text: "High Risk", color: "#ef4444" };
            if (value > min + (max - min) * 0.7) return { text: "Warning", color: "#f59e0b" };
            return { text: "Low Risk", color: "#658c2d" };
        } else { 
            if (value < min) return { text: "Stressed", color: "#ef4444" };
            if (value < min + (max - min) * 0.3) return { text: "Moderate", color: "#f59e0b" };
            return { text: "Healthy", color: "#658c2d" };
        }
    };

    const status = getStatus();
    const circumference = 2 * Math.PI * 54; // r=54
    const offset = circumference - (displayPercentage / 100) * circumference;

    return (
        <div className="bg-gray-800/20 p-4 rounded-xl flex flex-col items-center text-center h-full">
            <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
                    <circle className="stroke-gray-700" cx="64" cy="64" r="54" strokeWidth="12" fill="transparent" />
                    <circle
                        style={{ stroke: status.color }}
                        className="transition-all duration-500"
                        cx="64" cy="64" r="54" strokeWidth="12" fill="transparent"
                        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-white">{value.toFixed(2)}</span>
                    <span className="text-xs font-semibold" style={{ color: status.color }}>{status.text}</span>
                </div>
            </div>
            <p className="mt-3 text-sm text-gray-300 font-medium flex-grow flex items-center">{label}</p>
        </div>
    );
};

const TrendChart = ({ title, data, labels, color }) => {
    const maxValue = Math.max(...data.data);
    const minValue = Math.min(...data.data);
    const range = maxValue - minValue === 0 ? 1 : maxValue - minValue;

    const points = data.data.map((val, i) => {
        const x = (i / (data.data.length - 1)) * 100;
        const y = 100 - ((val - minValue) / range) * 80 - 10; 
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="bg-gray-800/20 p-4 rounded-xl">
            <p className="text-sm font-medium text-gray-300 mb-2">{title}</p>
            <div className="h-40 relative">
                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {[0, 25, 50, 75, 100].map(y => <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#4b5563" strokeWidth="0.5" />)}
                    <polyline fill="none" stroke={color} strokeWidth="2" points={points} />
                </svg>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
                {labels.map(label => <span key={label}>{label}</span>)}
            </div>
        </div>
    );
};

export default function AIAnalyticsDashboard() {
    const { scanDate, executiveSummary, alerts, kpis, spectralAnalysis, historicalData, recommendations } = mockAnalysisData;

    return (
        <div className="p-8 bg-zinc-900 rounded-xl w-full space-y-8">
            
            <header className="border-b border-gray-700/30 pb-4">
                <h1 className="text-2xl font-bold text-white">AI-Powered Environmental Analysis</h1>
                <p className="text-sm text-gray-400">Scan completed: {new Date(scanDate).toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })}</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <section>
                        <h2 className="text-lg font-semibold mb-3 flex items-center"><Leaf size={20} className="mr-2 text-[#658c2d]"/>Executive Summary</h2>
                        <div className="bg-gray-800/20 p-4 rounded-xl text-gray-300">
                            <p>{executiveSummary}</p>
                        </div>
                    </section>
                    
                    {alerts.length > 0 && (
                        <section>
                            <h2 className="text-lg font-semibold mb-3 flex items-center"><AlertTriangle size={20} className="mr-2 text-yellow-400"/>Critical Alerts</h2>
                            <div className="space-y-3">
                                {alerts.map(alert => (
                                    <div key={alert.id} className="bg-yellow-900/40 border border-yellow-400/50 p-4 rounded-xl">
                                        <p className="font-semibold text-yellow-300">{alert.title}</p>
                                        <p className="text-sm text-yellow-300/80 mt-1">{alert.details}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    <section>
                        <Tooltip text={historicalData.tooltip}>
                            <h2 className="text-lg font-semibold mb-3 flex items-center"><BarChart2 size={20} className="mr-2 text-[#658c2d]"/>Historical Trends</h2>
                        </Tooltip>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {historicalData.datasets.map(dataset => (
                                <TrendChart key={dataset.label} title={dataset.label} data={dataset} labels={historicalData.labels} color={dataset.color} />
                            ))}
                         </div>
                    </section>
                </div>

                <div className="space-y-8">
                    <section>
                        <h2 className="text-lg font-semibold mb-3">Key Metrics</h2>
                        <div className="space-y-4">
                           <KpiCard label="Overall Crop Health" value={kpis.overallHealth.value} unit="%" trend={kpis.overallHealth.trend} tooltip={kpis.overallHealth.tooltip} />
                           <KpiCard label="Predicted Yield" value={kpis.yieldPrediction.value} unit="%" trend={kpis.yieldPrediction.trend} tooltip={kpis.yieldPrediction.tooltip} />
                           <KpiCard label="Area Scanned" value={kpis.areaScanned.value} unit=" ha" trend={kpis.areaScanned.trend} tooltip={kpis.areaScanned.tooltip} />
                        </div>
                    </section>
                    
                    <section>
                        <h2 className="text-lg font-semibold mb-3 flex items-center"><CheckCircle size={20} className="mr-2 text-[#658c2d]"/>Recommendations</h2>
                        <div className="space-y-3">
                            {recommendations.map(rec => {
                                const priorityColor = rec.priority === 'High' ? 'text-red-400' : rec.priority === 'Medium' ? 'text-yellow-400' : 'text-green-400';
                                return (
                                    <div key={rec.id} className="bg-gray-800/20 p-3 rounded-xl flex items-start space-x-3">
                                        <div className={`flex-shrink-0 mt-1 ${priorityColor}`}><rec.icon size={18}/></div>
                                        <p className="text-sm text-gray-300">{rec.text}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                </div>
            </div>

            <section>
                <h2 className="text-lg font-semibold mb-4">Detailed Spectral Analysis</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {spectralAnalysis.map(metric => (
                        <RadialGauge key={metric.id} label={metric.label} value={metric.value} optimalRange={metric.optimalRange} invert={metric.invert} />
                    ))}
                </div>
            </section>
        </div>
    );
}

