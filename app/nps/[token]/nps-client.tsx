"use client";

import React, { useState } from "react";
import { submitFeedback } from "./actions";
import { motion, AnimatePresence } from "framer-motion";
import { Star, CheckCircle2, MessageSquare, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface NPSClientProps {
    token: string;
    initialData: {
        id: string;
        token: string;
        clientName: string;
        orderNumber: string;
        createdAt: Date;
    };
}

export function NPSClient({ token, initialData }: NPSClientProps) {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    
    const [score, setScore] = useState<number | null>(null);
    const [comment, setComment] = useState("");

    const handleSubmit = async () => {
        if (score === null) return;
        setSubmitting(true);
        const res = await submitFeedback(token, score, comment);
        if (res.success) {
            setSuccess(true);
        } else {
            setError(res.error || "Ошибка отправки");
        }
        setSubmitting(false);
    };

    if (success) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center"
                >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Спасибо за отзыв!</h1>
                    <p className="text-slate-600 mb-6">Ваше мнение помогает нам становиться лучше.</p>
                    <Button 
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 rounded-2xl text-lg font-semibold transition-all shadow-lg shadow-indigo-200"
                        onClick={() => window.close()}
                    >
                        Закрыть
                    </Button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-50 flex items-center justify-center p-4 py-12">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-lg w-full bg-white/70 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 p-8 md:p-12 relative overflow-hidden border border-white"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-full -mr-8 -mt-8" />
                
                <header className="mb-10 relative">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                            <Star className="w-6 h-6 fill-current" />
                        </div>
                        <span className="font-bold text-indigo-600 tracking-wider text-sm">Оцените качество</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight mb-4">
                        Как вам ваш заказ <span className="text-indigo-600">#{initialData.orderNumber}</span>?
                    </h1>
                    <p className="text-slate-500 text-lg leading-relaxed">
                        Пожалуйста, оцените вероятность того, что вы порекомендуете нас своим друзьям или коллегам.
                    </p>
                </header>

                <div className="flex flex-col gap-3">
                    <div className="space-y-3">
                        <div className="flex justify-between text-xs font-medium text-slate-400 px-1">
                            <span>Совсем не вероятно</span>
                            <span>Очень вероятно</span>
                        </div>
                        <div className="grid grid-cols-11 gap-1.5 md:gap-3">
                            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                <motion.button
                                    type="button"
                                    key={num}
                                    whileHover={{ scale: 1.1, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setScore(num)}
                                    className={`
                                        aspect-square flex items-center justify-center rounded-xl md:rounded-2xl text-sm md:text-lg font-bold transition-all
                                        ${score === num 
                                            ? 'bg-indigo-600 text-white scale-110 shadow-lg shadow-indigo-300 ring-4 ring-indigo-50/50' 
                                            : 'bg-white/50 backdrop-blur-sm text-slate-500 border border-slate-100 hover:border-indigo-200 hover:text-indigo-600 shadow-sm'
                                        }
                                    `}
                                >
                                    {num}
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    <AnimatePresence>
                        {score !== null && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex flex-col gap-3"
                            >
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 ml-1">
                                        <MessageSquare className="w-4 h-4 text-indigo-500" />
                                        Напишите пару слов (необязательно)
                                    </label>
                                    <Textarea 
                                        placeholder="Что вам особенно понравилось или что нам стоит улучшить?"
                                        className="min-h-[120px] rounded-2xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 text-lg p-4 resize-none transition-all"
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                    />
                                </div>

                                <Button 
                                    disabled={submitting}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-8 rounded-[1.25rem] text-xl font-bold transition-all shadow-xl shadow-indigo-100 active:scale-95 disabled:opacity-50"
                                    onClick={handleSubmit}
                                >
                                    {submitting ? "Отправка..." : "Отправить отзыв"}
                                </Button>

                                {error && (
                                    <p className="text-rose-500 text-sm font-bold text-center animate-pulse">
                                        {error}
                                    </p>
                                )}

                                <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
                                    Сделано с <Heart className="w-3 h-3 fill-pink-500 text-pink-500" /> для наших клиентов
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
