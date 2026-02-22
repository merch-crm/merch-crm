"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, AlertCircle, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UploadIconModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpload: (file: File) => void;
}

export function UploadIconModal({ isOpen, onClose, onUpload }: UploadIconModalProps) {
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setUploadedFile(file);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
                    onClick={() => {
                        onClose();
                        setUploadedFile(null);
                    }}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-100"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Upload className="w-5 h-5 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">
                                    Загрузить SVG
                                </h3>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    onClose();
                                    setUploadedFile(null);
                                }}
                                className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200"
                            >
                                <X className="w-5 h-5 text-slate-500" />
                            </Button>
                        </div>

                        <label
                            htmlFor="svg-upload-modal-standalone"
                            className={cn(
                                "border-2 border-dashed rounded-[20px] p-6 text-center transition-all cursor-pointer group bg-slate-50/50 hover:bg-white active:scale-[0.98] block",
                                uploadedFile
                                    ? "border-primary/50 bg-primary/5"
                                    : "border-slate-200 hover:border-primary/50"
                            )}
                        >
                            <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-slate-100 mx-auto mb-5 flex items-center justify-center group-hover:shadow-md transition-all">
                                {uploadedFile ? (
                                    <Sparkles className="w-8 h-8 text-primary" />
                                ) : (
                                    <Upload className="w-8 h-8 text-primary shadow-primary/20" />
                                )}
                            </div>
                            {uploadedFile ? (
                                <>
                                    <p className="text-slate-700 font-bold mb-1 text-lg">
                                        {uploadedFile.name}
                                    </p>
                                    <p className="text-sm text-slate-400">
                                        {(uploadedFile.size / 1024).toFixed(1)} KB • Нажмите, чтобы выбрать другой
                                    </p>
                                </>
                            ) : (
                                <>
                                    <p className="text-slate-700 font-bold mb-1 text-lg">
                                        Перетащите SVG файл сюда
                                    </p>
                                    <p className="text-sm text-slate-400">
                                        макс. размер 50KB, только контурные SVG
                                    </p>
                                </>
                            )}
                            <input
                                type="file"
                                accept=".svg"
                                className="hidden"
                                id="svg-upload-modal-standalone"
                                onChange={handleFileChange}
                            />
                        </label>

                        <div className="mt-6 p-4 bg-amber-50/50 rounded-[16px] border border-amber-100 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-bold text-amber-800">
                                    Технические требования
                                </p>
                                <ul className="text-xs text-amber-700 mt-2 space-y-2">
                                    <li className="flex items-center gap-2">• ViewBox должен быть <span className="font-mono bg-white px-1 rounded">24x24</span></li>
                                    <li className="flex items-center gap-2">• Толщина линий (stroke) <span className="font-mono bg-white px-1 rounded">1.5px</span></li>
                                    <li className="flex items-center gap-2">• Удалите все <span className="font-mono bg-white px-1 rounded">fill</span> атрибуты</li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
                            <Button
                                type="button"
                                variant="outline"
                                className="rounded-xl font-bold h-12 px-6"
                                onClick={() => {
                                    onClose();
                                    setUploadedFile(null);
                                }}
                            >
                                Отмена
                            </Button>
                            <Button
                                type="button"
                                className="btn-dark rounded-xl font-bold h-12 px-8 shadow-xl shadow-slate-900/20"
                                disabled={!uploadedFile}
                                onClick={() => {
                                    if (uploadedFile) {
                                        onUpload(uploadedFile);
                                        setUploadedFile(null);
                                    }
                                }}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Добавить
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
