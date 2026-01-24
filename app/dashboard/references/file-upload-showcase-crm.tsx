"use client";

import React from "react";
import { motion } from "framer-motion";
import { CloudUpload, Trash2, X } from "lucide-react";

export default function FileUploadShowcaseCRM() {
    return (
        <section className="space-y-12 py-12 flex flex-col items-center bg-[#f2f4f6] rounded-[3rem]">
            <div className="flex items-center gap-3 self-start px-12 mb-[-1rem]">
                <div className="h-8 w-1 bg-slate-900 rounded-full" />
                <h2 className="text-3xl font-bold text-slate-800">File Uploader</h2>
            </div>

            <div className="scale-110">
                <div className="w-[400px] bg-white rounded-[2.5rem] p-4 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] space-y-4">

                    {/* 1. Drop Zone */}
                    <div className="bg-[#f3f4f6] rounded-[2rem] h-48 flex flex-col items-center justify-center border-2 border-transparent border-dashed hover:border-slate-300 hover:bg-[#eceef0] transition-all cursor-pointer group">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                            <CloudUpload size={28} className="text-slate-600" strokeWidth={1.5} />
                        </div>
                        <p className="text-slate-900 font-semibold mb-1">Drop your files here or browse</p>
                        <p className="text-slate-400 text-sm">Max file size up to 1 GB</p>
                    </div>

                    <div className="space-y-3 pt-2">
                        {/* 2. Uploaded File Item */}
                        <div className="flex items-center p-3 rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all bg-white group">
                            <div className="w-12 h-12 bg-[#f3f4f6] rounded-xl flex items-center justify-center text-slate-500 font-medium text-xs mr-4">
                                PDF
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-slate-900 font-semibold truncate">Product Catalog.pdf</p>
                                <p className="text-slate-400 text-xs">20 MB</p>
                            </div>
                            <button className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                                <Trash2 size={20} />
                            </button>
                        </div>

                        {/* 3. Another File Item */}
                        <div className="flex items-center p-3 rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all bg-white group">
                            <div className="w-12 h-12 bg-[#f3f4f6] rounded-xl flex items-center justify-center text-slate-500 font-medium text-xs mr-4">
                                PDF
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-slate-900 font-semibold truncate">Cinema 4D Project File.zip</p>
                                <p className="text-slate-400 text-xs">20 MB</p>
                            </div>
                            <button className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Pagination Dots */}
                    <div className="flex justify-center gap-1.5 py-1">
                        <div className="w-2 h-2 rounded-full bg-slate-200" />
                        <div className="w-2 h-2 rounded-full bg-slate-300" />
                        <div className="w-2 h-2 rounded-full bg-slate-200" />
                    </div>

                    {/* 4. Uploading State */}
                    <div className="relative p-4 rounded-2xl border border-slate-100 bg-white overflow-hidden">
                        <div className="flex items-start justify-between mb-4 relative z-10">
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-[#f3f4f6] rounded-xl flex items-center justify-center text-slate-500 font-medium text-xs mr-4">
                                    PDF
                                </div>
                                <div>
                                    <p className="text-slate-900 font-semibold">Blender Project File.zip</p>
                                    <p className="text-slate-400 text-xs mt-0.5">150 MB of 300 MB</p>
                                </div>
                            </div>
                            <button className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Progress Bar Container */}
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: "0%" }}
                                whileInView={{ width: "50%" }}
                                transition={{ duration: 1.5, ease: "easeInOut" }}
                                className="h-full bg-slate-900 rounded-full"
                            />
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
