import { 
    Leaf, 
    Droplets, 
    FlaskConical, 
    CheckCircle, 
    AlertTriangle,
    Info
} from 'lucide-react';

export const fieldZones = [
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
        summary: "¡Este lote está de maravilla! Las hojas están creciendo con mucha fuerza y tienen el color verde perfecto que buscamos."
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
        summary: "Todo va por buen camino aquí. No hace falta que cambies nada en el riego por ahora."
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
        summary: "Parece que a esta parte del campo le está costando un poco más absorber el agua. Dale una revisada a las mangueras."
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
        summary: "¡Cuidado! Esta zona tiene mucha sed y las plantas se ven débiles. Si no les damos agua pronto, podrían enfermarse."
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
        summary: "Se están recuperando bien de la última vez, pero no hay que quitarles el ojo de encima todavía."
    }
];

export const getRecommendationsForZone = (zoneId: string, zoneName: string) => {
    if (zoneId.includes('norte')) {
        return [
            { 
                title: "Mantenimiento Preventivo",
                text: `Todo se ve excelente en ${zoneName}. Solo mantén el riego actual.`, 
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
    } else if (zoneId === 'centro') {
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
                text: `Necesitas aplicar un riego profundo de inmediato en ${zoneName}.`, 
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
};

export const getGeneralRecommendations = () => {
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
};
