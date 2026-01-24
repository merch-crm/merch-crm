"use client";

import React, { useState } from "react";
import {
    Folder,
    FileText,
    Image as ImageIcon,
    Users,
    Clock,
    Upload,
    Search,
    Grid3x3,
    List,
    ChevronLeft,
    ChevronRight,
    MoreHorizontal,
    Share2,
    Plus,
    TrendingUp,
    HardDrive,
    Download
} from "lucide-react";

interface FileItem {
    id: string;
    name: string;
    type: "folder" | "file" | "image";
    size?: string;
    date: string;
    sharedWith?: number;
    preview?: string;
}

interface FolderCard {
    id: string;
    name: string;
    date: string;
    sharedWith: number;
    color: string;
}

export default function FileManagerCRM() {
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    // Данные для первого дизайна (macOS style)
    const folders: FolderCard[] = [
        { id: "1", name: "customer #1", date: "09/01/2021, 10:44 am", sharedWith: 3, color: "bg-blue-500" },
        { id: "2", name: "customer #2", date: "09/01/2021, 10:44 am", sharedWith: 2, color: "bg-blue-500" },
        { id: "3", name: "customer #3", date: "09/12/2021, 5:12 pm", sharedWith: 4, color: "bg-blue-500" },
        { id: "4", name: "customer #4", date: "09/15/2021, 6:56 pm", sharedWith: 1, color: "bg-blue-500" },
        { id: "5", name: "customer #5", date: "09/01/2021, 10:44 am", sharedWith: 3, color: "bg-blue-500" },
        { id: "6", name: "customer #6", date: "09/01/2021, 10:44 am", sharedWith: 2, color: "bg-blue-500" },
        { id: "7", name: "customer #7", date: "09/01/2021, 10:44 am", sharedWith: 5, color: "bg-blue-500" },
        { id: "8", name: "customer #8", date: "09/01/2021, 10:44 am", sharedWith: 2, color: "bg-blue-500" },
    ];

    const pdfFiles = [
        { id: "p1", name: "design proposals", date: "09/01/2021, 10:44 am" },
        { id: "p2", name: "design proposals", date: "09/01/2021, 10:44 am" },
        { id: "p3", name: "design proposals", date: "09/01/2021, 10:44 am" },
        { id: "p4", name: "design proposals", date: "09/01/2021, 10:44 am" },
        { id: "p5", name: "design proposals", date: "09/01/2021, 10:44 am" },
    ];

    // Данные для второго дизайна (Drive style)
    const recentProjects = [
        { id: "r1", name: "Designs", sharedWith: 3, color: "bg-indigo-500" },
        { id: "r2", name: "Design Sprint 2.0", sharedWith: 2, color: "bg-white" },
        { id: "r3", name: "Discovery Call", sharedWith: 3, color: "bg-white" },
    ];

    const newFiles: FileItem[] = [
        { id: "n1", name: "Manual wesbite", type: "file", size: "2.3 MB", date: "21.03.2019" },
        { id: "n2", name: "Gymnastic", type: "image", size: "1.8 MB", date: "20.03.2019" },
        { id: "n3", name: "Neverous", type: "file", size: "4.2 MB", date: "20.01.2019" },
        { id: "n4", name: "Manual app", type: "file", size: "3.1 MB", date: "12.01.2019" },
    ];

    const sharedFiles = [
        { id: "s1", name: "Manual Guidelines" },
        { id: "s2", name: "Manual Illustrations" },
        { id: "s3", name: "Overflight Cover Photo" },
        { id: "s4", name: "Design Process Draft" },
        { id: "s5", name: "Wallpaper #1" },
        { id: "s6", name: "Manual" },
    ];

    return (
        <section className="space-y-12">
            {/* Заголовок секции */}
            <div className="text-center space-y-3">
                <h2 className="text-3xl font-bold text-slate-900">
                    Файловые Менеджеры
                </h2>
                <p className="text-slate-500 text-sm">
                    Современные интерфейсы управления файлами и проектами
                </p>
            </div>

            {/* ДИЗАЙН 1: macOS Cloud Storage Style */}
            <div className="glass-panel p-8 space-y-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        </div>
                        <div className="flex items-center gap-3 ml-4">
                            <ChevronLeft className="w-5 h-5 text-slate-400" />
                            <ChevronRight className="w-5 h-5 text-slate-400" />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <span>Sort by:</span>
                            <select className="bg-transparent border-none outline-none font-medium">
                                <option>type</option>
                                <option>name</option>
                                <option>date</option>
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`p-2 rounded-lg transition-colors ${viewMode === "grid" ? "bg-blue-100 text-blue-600" : "text-slate-400 hover:bg-slate-100"
                                    }`}
                            >
                                <Grid3x3 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                className={`p-2 rounded-lg transition-colors ${viewMode === "list" ? "bg-blue-100 text-blue-600" : "text-slate-400 hover:bg-slate-100"
                                    }`}
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sidebar + Content */}
                <div className="flex gap-6">
                    {/* Sidebar */}
                    <div className="w-48 space-y-2">
                        <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg bg-blue-50 text-blue-600 font-medium text-sm">
                            <Folder className="w-4 h-4" />
                            All Projects
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 font-medium text-sm transition-colors">
                            <Folder className="w-4 h-4" />
                            Fintory Projects
                        </button>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 space-y-8">
                        {/* Folders Grid */}
                        <div className="grid grid-cols-5 gap-4">
                            {folders.map((folder) => (
                                <div
                                    key={folder.id}
                                    className="group cursor-pointer"
                                >
                                                                        <div className="relative mb-2">
                                        {/* 3D Folder Icon - Precise macOS Style */}
                                        <div className="w-full aspect-[1.3/1] relative transition-transform duration-200 group-hover:-translate-y-1">
                                            {/* Folder Tab (Back) */}
                                            <div className="absolute top-[8%] left-0 w-[40%] h-[20%] bg-[#5094FC] rounded-t-md"></div>
                                            
                                            {/* Main Folder Body (Front) */}
                                            <div className="absolute bottom-0 left-0 w-full h-[85%] bg-gradient-to-b from-[#4B90FC] to-[#2F7CF6] rounded-lg shadow-sm border-t border-[#6BA6FD]/50">
                                                {/* Subtle inner glow */}
                                                <div className="absolute inset-x-0 top-0 h-px bg-white/20"></div>
                                            </div>
                                            
                                            {/* Icon Shadow */}
                                            <div className="absolute -bottom-1 left-2 right-2 h-3 bg-blue-900/10 blur-md rounded-full"></div>
                                        </div>
                                    </div>
                                    <div className="text-xs">
                                        <p className="font-semibold text-slate-900 truncate">{folder.name}</p>
                                        <p className="text-slate-400 text-[10px]">{folder.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* PDF Files Grid */}
                        <div className="grid grid-cols-5 gap-4">
                            {pdfFiles.map((file) => (
                                <div
                                    key={file.id}
                                    className="group cursor-pointer"
                                >
                                    <div className="relative mb-2">
                                        <div className="w-full aspect-[4/3] bg-white border-2 border-slate-200 rounded-xl flex items-center justify-center group-hover:border-slate-300 transition-colors">
                                            <FileText className="w-8 h-8 text-slate-300" />
                                            <span className="absolute bottom-2 text-[10px] font-bold text-slate-400">pdf</span>
                                        </div>
                                    </div>
                                    <div className="text-xs">
                                        <p className="font-semibold text-slate-900 truncate">{file.name}</p>
                                        <p className="text-slate-400 text-[10px]">{file.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Sidebar - Info Panel */}
                    <div className="w-64 bg-white rounded-xl p-6 border border-slate-200 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                                <ImageIcon className="w-6 h-6 text-slate-400" />
                            </div>
                            <div>
                                <p className="font-semibold text-sm text-slate-900">screen_01</p>
                                <p className="text-xs text-slate-500">PNG image - 2.3 MB</p>
                            </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-slate-200">
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Created</span>
                                <span className="font-medium text-slate-900">09/01/2021, 10:44 am</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Last updated</span>
                                <span className="font-medium text-slate-900">09/12/2021, 5:12 pm</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Last opened</span>
                                <span className="font-medium text-slate-900">09/15/2021, 6:56 pm</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Image size</span>
                                <span className="font-medium text-slate-900">1600×1200</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Resolution</span>
                                <span className="font-medium text-slate-900">72×72</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Color space</span>
                                <span className="font-medium text-slate-900">RGB</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Color profile</span>
                                <span className="font-medium text-slate-900 truncate">sRGB IEC61966-2.1</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ДИЗАЙН 2: Modern Drive Style */}
            <div className="glass-panel p-8">
                <div className="flex gap-8">
                    {/* Left Sidebar */}
                    <div className="w-52 space-y-6">
                        <div className="mb-8">
                            <h3 className="text-2xl font-bold text-indigo-600">drive.</h3>
                        </div>

                        <nav className="space-y-1">
                            <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-indigo-600 bg-indigo-50 font-medium text-sm">
                                <Folder className="w-4 h-4" />
                                My drive
                            </button>
                            <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 font-medium text-sm transition-colors">
                                <FileText className="w-4 h-4" />
                                My files
                            </button>
                            <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 font-medium text-sm transition-colors">
                                <Users className="w-4 h-4" />
                                Sharing
                            </button>
                            <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 font-medium text-sm transition-colors">
                                <Clock className="w-4 h-4" />
                                File requests
                            </button>
                        </nav>

                        <div className="pt-6 border-t border-slate-200">
                            <p className="text-xs font-semibold text-slate-400 mb-3 px-4">MY PLACES</p>
                            <nav className="space-y-1">
                                <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 font-medium text-sm transition-colors">
                                    <Folder className="w-4 h-4" />
                                    Designs
                                </button>
                                <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 font-medium text-sm transition-colors">
                                    <Folder className="w-4 h-4" />
                                    Music
                                </button>
                                <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 font-medium text-sm transition-colors">
                                    <Folder className="w-4 h-4" />
                                    Design Sprint
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 space-y-8">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <ChevronLeft className="w-5 h-5 text-slate-400" />
                                <ChevronRight className="w-5 h-5 text-slate-400" />
                            </div>
                            <button className="px-6 py-2.5 bg-indigo-600 text-white rounded-full font-medium text-sm hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
                                UPLOAD NEW FILE
                            </button>
                        </div>

                        {/* Recently Used */}
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 mb-4">Recently used</h3>
                            <div className="grid grid-cols-3 gap-4">
                                {recentProjects.map((project, idx) => (
                                    <div
                                        key={project.id}
                                        className={`${project.color} rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${idx === 0 ? 'text-white' : 'text-slate-900 border border-slate-200'
                                            }`}
                                    >
                                        <div className="mb-4">
                                            <p className="text-xs font-medium opacity-70 mb-1">SHARED WITH</p>
                                            <div className="flex -space-x-2">
                                                {[...Array(project.sharedWith)].map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className={`w-6 h-6 rounded-full ${idx === 0 ? 'bg-white/30' : 'bg-indigo-200'
                                                            } border-2 ${idx === 0 ? 'border-indigo-500' : 'border-white'}`}
                                                    ></div>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium opacity-70 mb-1">FOLDER</p>
                                            <p className="font-bold text-lg">{project.name}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* New Files */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-slate-900">New files</h3>
                                <button className="text-sm text-slate-400 hover:text-slate-600 transition-colors">
                                    VIEW ALL
                                </button>
                            </div>
                            <div className="space-y-2">
                                {newFiles.map((file) => (
                                    <div
                                        key={file.id}
                                        className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                                    >
                                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                                            {file.type === "image" ? (
                                                <ImageIcon className="w-5 h-5 text-slate-400" />
                                            ) : (
                                                <FileText className="w-5 h-5 text-slate-400" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-sm text-slate-900">{file.name}</p>
                                        </div>
                                        <div className="text-sm text-slate-500">{file.date}</div>
                                        <div className="text-sm text-slate-500 w-20">.{file.type === "image" ? "psd" : "sketch"}</div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors">
                                                <MoreHorizontal className="w-4 h-4 text-slate-400" />
                                            </button>
                                            <button className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors">
                                                <Plus className="w-4 h-4 text-slate-400" />
                                            </button>
                                            <button className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors">
                                                <Share2 className="w-4 h-4 text-slate-400" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Shared with me */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-slate-900">Shared with me</h3>
                                <button className="text-sm text-slate-400 hover:text-slate-600 transition-colors">
                                    VIEW ALL
                                </button>
                            </div>
                            <div className="grid grid-cols-6 gap-3">
                                {sharedFiles.map((file) => (
                                    <div
                                        key={file.id}
                                        className="group cursor-pointer"
                                    >
                                        <div className="aspect-square bg-slate-100 rounded-xl mb-2 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                                            <FileText className="w-8 h-8 text-slate-300" />
                                        </div>
                                        <p className="text-xs font-medium text-slate-900 truncate">{file.name}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar - Statistics */}
                    <div className="w-72 space-y-6">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="SEARCH YOUR CONTENT"
                                className="w-full px-4 py-3 pr-12 bg-slate-100 rounded-full text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                                <Search className="w-4 h-4 text-white" />
                            </button>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-6">
                            <h4 className="font-bold text-slate-900">Statistic</h4>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">Downloads</p>
                                        <p className="text-xs text-slate-500">this week</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="relative w-12 h-12">
                                            <svg className="w-12 h-12 transform -rotate-90">
                                                <circle
                                                    cx="24"
                                                    cy="24"
                                                    r="20"
                                                    stroke="#e2e8f0"
                                                    strokeWidth="4"
                                                    fill="none"
                                                />
                                                <circle
                                                    cx="24"
                                                    cy="24"
                                                    r="20"
                                                    stroke="#6366f1"
                                                    strokeWidth="4"
                                                    fill="none"
                                                    strokeDasharray={`${(69 / 100) * 125.6} 125.6`}
                                                />
                                            </svg>
                                            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-900">
                                                69
                                            </span>
                                        </div>
                                        <span className="text-xs text-slate-500">per day</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">Available</p>
                                        <p className="text-xs text-slate-500">space</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="relative w-12 h-12">
                                            <svg className="w-12 h-12 transform -rotate-90">
                                                <circle
                                                    cx="24"
                                                    cy="24"
                                                    r="20"
                                                    stroke="#e2e8f0"
                                                    strokeWidth="4"
                                                    fill="none"
                                                />
                                                <circle
                                                    cx="24"
                                                    cy="24"
                                                    r="20"
                                                    stroke="#6366f1"
                                                    strokeWidth="4"
                                                    fill="none"
                                                    strokeDasharray={`${(12 / 100) * 125.6} 125.6`}
                                                />
                                            </svg>
                                            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-900">
                                                12
                                            </span>
                                        </div>
                                        <span className="text-xs text-slate-500">gb left</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">Shared</p>
                                        <p className="text-xs text-slate-500">files</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="relative w-12 h-12">
                                            <svg className="w-12 h-12 transform -rotate-90">
                                                <circle
                                                    cx="24"
                                                    cy="24"
                                                    r="20"
                                                    stroke="#e2e8f0"
                                                    strokeWidth="4"
                                                    fill="none"
                                                />
                                                <circle
                                                    cx="24"
                                                    cy="24"
                                                    r="20"
                                                    stroke="#6366f1"
                                                    strokeWidth="4"
                                                    fill="none"
                                                    strokeDasharray={`${(49 / 100) * 125.6} 125.6`}
                                                />
                                            </svg>
                                            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-900">
                                                49
                                            </span>
                                        </div>
                                        <span className="text-xs text-slate-500">today</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Upgrade Card */}
                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
                            <div className="mb-4">
                                <svg viewBox="0 0 200 120" className="w-full h-auto">
                                    {/* Illustration placeholder */}
                                    <circle cx="50" cy="60" r="30" fill="#fbbf24" opacity="0.3" />
                                    <circle cx="100" cy="40" r="25" fill="#a78bfa" opacity="0.4" />
                                    <circle cx="150" cy="70" r="35" fill="#60a5fa" opacity="0.3" />
                                    <rect x="40" y="50" width="15" height="40" fill="#6366f1" rx="2" />
                                    <rect x="95" y="30" width="15" height="60" fill="#8b5cf6" rx="2" />
                                    <rect x="145" y="60" width="15" height="30" fill="#ec4899" rx="2" />
                                </svg>
                            </div>
                            <h5 className="font-bold text-slate-900 mb-2">Unlock more space now!</h5>
                            <p className="text-xs text-slate-600 mb-4">Upgrade to Drive Plus</p>
                            <button className="w-full py-2.5 bg-indigo-600 text-white rounded-full font-medium text-sm hover:bg-indigo-700 transition-colors">
                                UPGRADE NOW
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
