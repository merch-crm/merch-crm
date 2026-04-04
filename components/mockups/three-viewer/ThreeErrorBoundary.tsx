"use client";

import React from "react";

/**
 * ThreeErrorBoundary - Компонент для отлова ошибок 3D
 */
export class ThreeErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: string }> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, error: "" };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error: error.message };
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-md text-center p-6 z-50">
                    <div className="max-w-sm bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl">
                        <div className="text-red-500 mb-4 text-3xl">⚠️</div>
                        <h3 className="text-white text-md font-bold mb-2">Ошибка 3D визуализации</h3>
                        <p className="text-slate-400 text-xs leading-relaxed mb-6 font-mono">
                            {this.state.error.includes("drei-assets") 
                                ? "Не удалось загрузить компоненты окружения. Проверьте интернет-соединение." 
                                : this.state.error}
                        </p>
                        <div className="flex flex-col gap-2">
                            <button 
                                type="button"
                                // audit-ok: window check (inside event handler)
                                onClick={() => typeof window !== 'undefined' && window.location.reload()}
                                className="w-full px-6 py-3 bg-white text-black rounded-lg text-xs font-bold hover:bg-white/90 transition-colors"
                            >
                                Перезагрузить страницу
                            </button>
                        </div>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}
