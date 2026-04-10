"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, File, ArrowRight, CloudUpload, FileText, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileWithProgress {
  file: File;
  progress: number;
  status: "uploading" | "complete" | "error";
}

interface BentoFileUploadProps {
  onUpload?: (files: File[]) => void;
  className?: string;
  maxSize?: number; // In MB
}

export function BentoFileUpload({ 
  onUpload, 
  className,
  maxSize = 10 
}: BentoFileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const addFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(f => f.size <= maxSize * 1024 * 1024);
    const mapped = validFiles.map(f => ({
      file: f,
      progress: 0,
      status: "uploading" as const
    }));
    
    setFiles(prev => [...prev, ...mapped]);
    onUpload?.(validFiles);

    // Simulate progress
    mapped.forEach((_, i) => {
      const currentIdx = files.length + i;
      let p = 0;
      const interval = setInterval(() => {
        p += 10;
        setFiles(prev => {
          const updated = [...prev];
          if (updated[currentIdx]) {
            updated[currentIdx].progress = p;
            if (p >= 100) {
              updated[currentIdx].status = "complete";
              clearInterval(interval);
            }
          }
          return updated;
        });
      }, 300);
    });
  };

  if (!isMounted) {
    return (
      <div className="w-full max-w-xl h-64 rounded-card bg-slate-50 border border-slate-100 animate-pulse" />
    );
  }

  return (
    <div className={cn("w-full max-w-xl mx-auto flex flex-col gap-6", className)}>
      <motion.button
        type="button"
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        animate={{
          backgroundColor: dragActive ? "rgba(59, 130, 246, 0.03)" : "rgba(255, 255, 255, 1)",
          borderColor: dragActive ? "#3b82f6" : "#f1f5f9",
        }}
        aria-label="Upload node: Drop binary assets here or click to browse"
        className={cn(
          "relative w-full flex flex-col items-center justify-center gap-6 rounded-card border-2 border-dashed p-16 cursor-pointer transition-all duration-700 overflow-hidden group shadow-premium outline-none focus-visible:ring-4 focus-visible:ring-primary-base/10",
          dragActive && "ring-8 ring-primary-base/5 shadow-2xl"
        )}
      >
        <div className="absolute inset-0 bg-primary-base/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        
        <input ref={inputRef} type="file" multiple className="hidden" aria-hidden="true" onChange={(e) => e.target.files && addFiles(Array.from(e.target.files))} />
        
        <div className="size-24 rounded-card bg-slate-50 shadow-inner flex items-center justify-center text-primary-base group-hover:scale-110 group-hover:rotate-3 transition-all duration-700 relative border border-slate-100">
          <CloudUpload className={cn("size-10", dragActive && "animate-bounce")} />
          <div className="absolute inset-0 bg-primary-base/10 rounded-card blur-2xl group-hover:opacity-100 opacity-0 transition-opacity" />
        </div>
        
        <div className="text-center relative z-10 flex flex-col gap-3">
          <h4 className="text-[12px] font-black text-slate-900 tracking-[0.3em]">Зона загрузки</h4>
          <p className="text-[10px] font-black text-slate-400 tracking-widest leading-relaxed">
            Перетащите файлы сюда или нажмите для выбора<br/>
            <span className="text-primary-base opacity-60">PDF, JPG, PNG // МАКС {maxSize}МБ</span>
          </p>
        </div>

        <div className="text-[11px] font-black text-white bg-slate-950 px-10 py-4 rounded-element shadow-2xl shadow-black/20 group-hover:bg-primary-base group-hover:shadow-primary-base/30 transition-all duration-500 tracking-[0.2em] flex items-center gap-3 border border-slate-900">
          Загрузить <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </motion.button>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            {files.map((f, i) => (
              <motion.div
                key={`${f.file.name}-${i}`}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                layout
                className="flex items-center gap-5 p-5 bg-white rounded-card border border-slate-100 shadow-premium group/item overflow-hidden relative"
              >
                <div className={cn(
                  "size-14 rounded-element flex items-center justify-center transition-all duration-500",
                  f.status === "complete" ? "bg-emerald-50 text-emerald-500" : "bg-slate-50 text-slate-400 group-hover/item:text-primary-base group-hover/item:bg-primary-base/10"
                )}>
                  <FileText className="size-6" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] font-black text-slate-900 tracking-widest truncate">{f.file.name}</p>
                    <span className="text-[10px] font-black text-slate-300 tracking-tighter tabular-nums px-2 py-0.5 bg-slate-50 rounded-lg">
                      {(f.file.size / 1024 / 1024).toFixed(2)}МБ
                    </span>
                  </div>
                  
                  <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden shadow-inner p-[1px] border border-slate-100">
                    <motion.div
                      animate={{ width: `${f.progress}%` }}
                      className={cn(
                        "h-full rounded-full transition-all duration-500 shadow-sm",
                        f.status === "complete" ? "bg-emerald-500" : "bg-primary-base shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                      )}
                    />
                  </div>
                </div>

                <div className="shrink-0 size-12 flex items-center justify-center transition-all duration-500">
                  {f.status === "complete" ? (
                    <div className="p-2 rounded-full bg-emerald-500 text-white shadow-xl shadow-emerald-500/20">
                      <Check className="size-4 stroke-[4]" />
                    </div>
                  ) : (
                    <button 
                      type="button" 
                      aria-label="Cancel transmission"
                      onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))}
                      className="size-10 rounded-xl hover:bg-rose-50 text-slate-300 hover:text-rose-500 transition-all active:scale-90 outline-none focus-visible:ring-4 focus-visible:ring-rose-500/10"
                    >
                      <X className="size-5" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
