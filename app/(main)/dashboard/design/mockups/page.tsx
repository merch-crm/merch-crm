"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
const ThreeViewer = dynamic(() => import("@/components/mockups/3d-viewer"), { 
    ssr: false,
    loading: () => (
        <div className="w-full h-full min-h-[400px] rounded-2xl bg-slate-50/50 flex flex-col items-center justify-center text-slate-800 gap-3 border border-slate-200/60 shadow-sm backdrop-blur-xl">
            <div className="w-10 h-10 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
            <span className="text-xs font-bold text-slate-500 tracking-wide">Подготовка 3D сцены...</span>
        </div>
    )
});

import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
    Palette, 
    Layers, 
    Save, 
    Upload, 
    Trash2,
    Sparkles,
    Download,
    Package,
    Shirt,
    ArrowRight,
    RefreshCcw,
    ShoppingBag,
    Wind,
    Maximize,
    Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const COLORS = [
    { name: "Белый", value: "#ffffff" },
    { name: "Черный", value: "#000000" },
    { name: "Серый", value: "#888888" },
    { name: "Темно-синий", value: "#1e3a8a" },
    { name: "Красный", value: "#ef4444" },
    { name: "Зеленый", value: "#10b981" },
];

const PRESET_MODELS = [
    { id: "tshirt", name: "Классическая футболка", url: "/merch_tshirt_v1.glb", icon: Shirt, description: "Стандартный крой", category: "apparel" },
    { id: "oversize", name: "Оверсайз футболка", url: "/merch_tshirt_v1.glb", icon: Shirt, description: "Заниженное плечо", category: "apparel" },
    { id: "hoodie", name: "Худи с капюшоном", url: "/merch_tshirt_v1.glb", icon: Package, description: "Плотный хлопок", category: "apparel" },
    { id: "polo", name: "Рубашка поло", url: "/merch_tshirt_v1.glb", icon: Shirt, description: "Классический воротник", category: "apparel" },
    { id: "tote", name: "Шоппер", url: "/merch_tshirt_v1.glb", icon: ShoppingBag, description: "Хлопковая сумка", category: "accessories" },
    { id: "cap", name: "Кепка", url: "/merch_tshirt_v1.glb", icon: Maximize, description: "Бейсболка, 5 панелей", category: "accessories" },
    { id: "panama", name: "Панама", url: "/merch_tshirt_v1.glb", icon: Info, description: "Летний головной убор", category: "accessories" },
    { id: "raincoat", name: "Дождевик", url: "/merch_tshirt_v1.glb", icon: Wind, description: "Водонепроницаемый", category: "equipment" },
    { id: "umbrella", name: "Зонт", url: "/merch_tshirt_v1.glb", icon: RefreshCcw, description: "Складной автомат", category: "equipment" },
];

export default function MockupsPage() {
    const [modelConfig, setModelConfig] = useState({
        color: "#ffffff",
        logo: null as string | null,
        zone: 'front' as 'front' | 'back' | 'top',
        modelUrl: "/merch_tshirt_v1.glb",
        customModelUrl: null as string | null,
        scale: 1,
        offset: [0, 0] as [number, number],
        rotation: 0,
        bgColor: "#f1f5f9"
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);

    // Cleanup Blob URLs to prevent memory leaks
    useEffect(() => {
        const currentModelUrl = modelConfig.customModelUrl;
        const currentLogoUrl = modelConfig.logo;
        return () => {
            if (currentModelUrl) URL.revokeObjectURL(currentModelUrl);
            if (currentLogoUrl && currentLogoUrl.startsWith("blob:")) URL.revokeObjectURL(currentLogoUrl);
        };
    }, [modelConfig.customModelUrl, modelConfig.logo]);

    // Cleanup previous Blob URL when a new one is created
    const updateModelUrl = (url: string) => {
        if (modelConfig.customModelUrl) URL.revokeObjectURL(modelConfig.customModelUrl);
        setModelConfig(prev => ({
            ...prev,
            customModelUrl: url,
            modelUrl: url
        }));
    };

    const updateLogoUrl = (url: string) => {
        if (modelConfig.logo && modelConfig.logo.startsWith("blob:")) URL.revokeObjectURL(modelConfig.logo);
        setModelConfig(prev => ({ ...prev, logo: url }));
    };

    const _resetTransform = () => {
        setModelConfig(prev => ({
            ...prev,
            scale: 1,
            offset: [0, 0],
            rotation: 0
        }));
    };

    const handleModelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && (file.name.endsWith(".glb") || file.name.endsWith(".gltf"))) {
            const url = URL.createObjectURL(file);
            updateModelUrl(url);
        }
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            updateLogoUrl(url);
        }
    };

    const downloadModel = (url: string, filename: string) => {
        const link = document.createElement("a");
        link.href = url;
        link.download = `${filename}.glb`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex-1 p-4 md:p-6 lg:p-8 space-$1-3 max-w-[1600px] mx-auto w-full bg-slate-50/30 min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white/60 backdrop-blur-xl border border-slate-200/60 p-4 rounded-2xl shadow-sm gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50/80 flex items-center justify-center border border-indigo-100/50">
                        <Palette className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight">3D визуализатор</h1>
                        <p className="text-xs text-slate-500 font-medium">Создание и предпросмотр дизайна в реальном времени</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="h-9 gap-2 font-semibold border-slate-200/60 rounded-xl bg-white hover:bg-slate-50 text-xs shadow-sm">
                        <Save className="w-3.5 h-3.5" />
                        Сохранить проект
                    </Button>
                    <Button className="h-9 gap-2 font-semibold shadow-md shadow-indigo-600/10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs text-white">
                        <Download className="w-3.5 h-3.5" />
                        Скачать PNG
                    </Button>
                </div>
            </div>

            {/* Main Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 h-full md:h-[calc(100vh-160px)] min-h-[700px]">
                
                {/* Left Column - Span 8 */}
                <div className="md:col-span-8 flex flex-col gap-3 h-full">
                    {/* 3D Viewer */}
                    <Card className="flex-1 p-0 overflow-hidden relative rounded-2xl border border-slate-200/60 shadow-sm bg-slate-50 flex flex-col min-h-[400px] h-full group">
                        <ThreeViewer 
                            modelUrl={modelConfig.modelUrl}
                            itemColor={modelConfig.color} 
                            logoUrl={modelConfig.logo} 
                            placementZone={modelConfig.zone}
                            decalScale={modelConfig.scale}
                            decalOffset={modelConfig.offset}
                            decalRotation={modelConfig.rotation}
                            backgroundColor={modelConfig.bgColor}
                        />
                    </Card>

                    {/* Models - Bento Card 1 (Moved here) */}
                    <Card className="p-4 border border-slate-200/60 shadow-sm rounded-2xl bg-white/80 backdrop-blur-xl shrink-0 w-full">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Package className="w-4 h-4 text-indigo-500" />
                                <h3 className="font-bold text-sm text-slate-800">Библиотека моделей</h3>
                            </div>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 text-xs font-semibold px-2 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload className="w-3 h-3 mr-1" />
                                Ваш .GLB
                            </Button>
                        </div>

                        <Tabs defaultValue="apparel" className="w-full">
                            <TabsList className="grid grid-cols-3 w-full max-w-[400px] h-8 mb-3 bg-slate-100/70 p-1 rounded-xl">
                                <TabsTrigger value="apparel" className="text-xs font-bold rounded-lg h-6">Одежда</TabsTrigger>
                                <TabsTrigger value="accessories" className="text-xs font-bold rounded-lg h-6">Аксессуары</TabsTrigger>
                                <TabsTrigger value="equipment" className="text-xs font-bold rounded-lg h-6">Прочее</TabsTrigger>
                            </TabsList>
                            {["apparel", "accessories", "equipment"].map((cat) => (
                                <TabsContent key={cat} value={cat} className="mt-0">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[160px] overflow-y-auto pr-1 minimal-scrollbar">
                                        {PRESET_MODELS.filter(m => m.category === cat).map((m) => (
                                            <div 
                                                key={m.id}
                                                role="button"
                                                tabIndex={0}
                                                className={cn(
                                                    "group flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer border text-left w-full outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                                                    modelConfig.modelUrl === m.url && modelConfig.customModelUrl === null
                                                        ? "bg-indigo-50/80 border-indigo-200 shadow-sm" 
                                                        : "bg-transparent border-transparent hover:bg-slate-50 hover:border-slate-200"
                                                )}
                                                onClick={() => { setModelConfig(prev => ({ ...prev, customModelUrl: null, modelUrl: m.url })); }}
                                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setModelConfig(prev => ({ ...prev, customModelUrl: null, modelUrl: m.url })); } }}
                                            >
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <div className={cn(
                                                        "w-8 h-8 rounded-lg flex items-center justify-center transition-colors shadow-sm shrink-0",
                                                        modelConfig.modelUrl === m.url && modelConfig.customModelUrl === null ? "bg-white text-indigo-600" : "bg-white border border-slate-100 text-slate-400"
                                                    )}>
                                                        <m.icon className="w-4 h-4" />
                                                    </div>
                                                    <div className="min-w-0 pr-2">
                                                        <p className="text-xs font-bold text-slate-700 leading-tight truncate">{m.name}</p>
                                                        <p className="text-xs text-slate-400 truncate">{m.description}</p>
                                                    </div>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost" size="icon"
                                                    className="h-6 w-6 shrink-0 rounded-md opacity-0 group-hover:opacity-100 hover:bg-white text-slate-400 hover:text-slate-600 transition-all shadow-sm"
                                                    onClick={(e) => { e.stopPropagation(); downloadModel(m.url, m.id); }}
                                                >
                                                    <Download className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </TabsContent>
                            ))}
                        </Tabs>
                    </Card>
                </div>

                {/* Right Sidebar - Span 4 */}
                <div className="md:col-span-4 flex flex-col gap-3 h-full md:overflow-y-auto pr-1 pb-4 minimal-scrollbar">

                    {/* Colors - Bento Card 2 */}
                    <Card className="p-4 border border-slate-200/60 shadow-sm rounded-2xl bg-white/80 backdrop-blur-xl shrink-0">
                        <div className="flex items-center gap-2 mb-3">
                            <Palette className="w-4 h-4 text-emerald-500" />
                            <h3 className="font-bold text-sm text-slate-800">Настройки цвета</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {/* Окрас изделия */}
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-400 tracking-wider">ИЗДЕЛИЕ</Label>
                                <div className="flex flex-wrap gap-1.5">
                                    {COLORS.map((c) => (
                                        <button
                                            type="button"
                                            key={c.value}
                                            onClick={() => setModelConfig(prev => ({ ...prev, color: c.value }))}
                                            className={cn(
                                                "w-6 h-6 rounded-full border ring-2 ring-offset-1 transition-transform",
                                                modelConfig.color === c.value ? "ring-indigo-500 hover:scale-110 shadow-sm" : "border-slate-200 ring-transparent hover:scale-110"
                                            )}
                                            style={{ backgroundColor: c.value }}
                                            title={c.name}
                                        />
                                    ))}
                                    <div className="relative w-6 h-6 rounded-full border border-slate-200 bg-gradient-to-tr from-rose-300 via-purple-300 to-indigo-300 flex items-center justify-center hover:scale-110 transition-transform overflow-hidden cursor-pointer shadow-sm">
                                        <input type="color" value={modelConfig.color} onChange={(e) => setModelConfig(prev => ({ ...prev, color: e.target.value }))} className="absolute inset-0 opacity-0 w-8 h-8 -ml-1 -mt-1 cursor-pointer" />
                                    </div>
                                </div>
                            </div>

                            {/* Фон сцены */}
                            <div className="space-y-2 border-l border-slate-100 pl-4">
                                <Label className="text-xs font-bold text-slate-400 tracking-wider">СЦЕНА</Label>
                                <div className="flex flex-wrap gap-1.5">
                                    {["#020617", "#ffffff", "#f8fafc", "#f1f5f9", "#e2e8f0"].map((bg) => (
                                        <button
                                            type="button"
                                            key={bg} onClick={() => setModelConfig(prev => ({ ...prev, bgColor: bg }))}
                                            className={cn(
                                                "w-6 h-6 rounded-lg transition-transform ring-1 ring-offset-1",
                                                modelConfig.bgColor === bg ? "ring-emerald-500 hover:scale-105 shadow-sm" : "ring-slate-200 border border-slate-200/50 hover:scale-105"
                                            )}
                                            style={{ backgroundColor: bg }}
                                        />
                                    ))}
                                    <div className="relative w-6 h-6 rounded-lg border border-slate-200 bg-gradient-to-tr from-slate-100 to-slate-200 flex items-center justify-center hover:scale-105 transition-transform overflow-hidden cursor-pointer shadow-sm">
                                        <input type="color" value={modelConfig.bgColor} onChange={(e) => setModelConfig(prev => ({ ...prev, bgColor: e.target.value }))} className="absolute inset-0 opacity-0 w-8 h-8 -ml-1 -mt-1 cursor-pointer" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Zone & Logo Print - Bento Card 3 */}
                    <Card className="p-4 border border-slate-200/60 shadow-sm rounded-2xl bg-white/80 backdrop-blur-xl shrink-0 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Layers className="w-4 h-4 text-amber-500" />
                                <h3 className="font-bold text-sm text-slate-800">Принт и позиция</h3>
                            </div>
                            
                            {/* Зона - Inline */}
                            <div className="flex bg-slate-100/70 p-0.5 rounded-lg border border-slate-200/50">
                                {[ { id: 'front', label: 'Грудь' }, { id: 'back', label: 'Спина' }, { id: 'top', label: 'Рукав' }].map((z) => (
                                    <button
                                        type="button"
                                        key={z.id}
                                        className={cn(
                                            "py-1 px-2.5 text-xs font-bold rounded-md transition-all outline-none",
                                            modelConfig.zone === z.id ? "bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200/50" : "text-slate-500 hover:text-slate-700"
                                        )}
                                        onClick={() => setModelConfig(prev => ({ ...prev, zone: z.id as typeof modelConfig.zone }))}
                                    >
                                        {z.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Логотип Upload */}
                        {!modelConfig.logo ? (
                            <div 
                                role="button"
                                tabIndex={0}
                                onClick={() => logoInputRef.current?.click()}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { logoInputRef.current?.click(); } }}
                                className="group relative border-2 border-dashed border-slate-200/80 rounded-xl p-5 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[140px] w-full outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            >
                                <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-indigo-50/50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-all">
                                    <Upload className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                                </div>
                                <p className="text-[12px] font-bold text-slate-700 mb-1" suppressHydrationWarning>Загрузить изображение</p>
                                <div className="text-xs text-slate-400 max-w-[200px] leading-relaxed" suppressHydrationWarning>
                                    Перетащите файл (До 5МБ)
                                    <br/>
                                    <span
                                        role="button"
                                        tabIndex={0}
                                        className="text-indigo-500 hover:underline cursor-pointer inline-block mt-1"
                                        onClick={(e) => { e.stopPropagation(); updateLogoUrl("/logo.png"); }}
                                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); updateLogoUrl("/logo.png"); } }}
                                    >Или нажми здесь для теста</span>
                                </div>
                            </div>
                        ) : (
                            <div className="relative group bg-slate-50/50 rounded-xl border border-slate-200/80 p-2 flex flex-col items-center justify-center min-h-[140px] overflow-hidden">
                                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:8px_8px] opacity-50" />
                                <Image src={modelConfig.logo} alt="Принт" width={240} height={120} className="relative z-10 max-w-full max-h-[120px] object-contain drop-shadow-md transition-transform group-hover:scale-105" unoptimized onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/logo.png"; }} />
                                
                                <div className="absolute right-2 top-2 z-20 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                    <Button type="button" size="icon" variant="destructive" className="h-7 w-7 rounded-lg shadow-md" onClick={(e) => { e.stopPropagation(); updateLogoUrl(null as unknown as string); }}>
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button type="button" size="icon" className="h-7 w-7 bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg shadow-md" onClick={(e) => { e.stopPropagation(); logoInputRef.current?.click(); }}>
                                        <RefreshCcw className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            </div>
                        )}
                        <input type="file" ref={logoInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
                    </Card>

                    {/* AI Lab Unified Banner - Bento Card 4 */}
                    <Card className="p-0 border border-indigo-500/10 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700 relative overflow-hidden group shrink-0 shadow-md shadow-indigo-600/20 cursor-pointer hover:shadow-lg transition-all hover:-translate-y-0.5">
                        <div className="absolute -right-4 -top-4 p-4 opacity-10 group-hover:opacity-20 group-hover:rotate-12 transition-all duration-500">
                            <Sparkles className="w-32 h-32 text-white" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        <div className="relative z-10 p-5 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20 shadow-inner group-hover:scale-110 group-hover:bg-white/20 transition-all">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-sm text-white mb-0.5">AI Лаборатория</h3>
                                <p className="text-xs text-indigo-100 font-medium leading-tight">
                                    Удаляйте фон, масштабируйте и находите идеальный дизайн в один клик.
                                </p>
                            </div>
                            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/10 group-hover:bg-white transition-colors">
                                <ArrowRight className="w-3 h-3 text-white group-hover:text-indigo-600" />
                            </div>
                        </div>
                    </Card>
                    
                </div>
            </div>
            
            {/* Custom file input required inputs */}
            <input type="file" ref={fileInputRef} onChange={handleModelUpload} accept=".glb" className="hidden" />
        </div>
    );
}
