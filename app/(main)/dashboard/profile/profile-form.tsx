"use client";

import { useState, useCallback } from "react";
import { updateProfile } from "./actions";
import { CheckCircle2, AlertCircle, Camera, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { cn } from "@/lib/utils";
import { UserProfile } from "./types";
import { useImageUploader } from "@/hooks/use-image-uploader";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";

export function ProfileForm({ user }: { user: UserProfile }) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar || null);


    // Advanced Image Uploader Hook
    const { uploadStates, processFiles, cancelUpload } = useImageUploader({
        folder: "avatars",
        maxFiles: 1,
        maxOriginalSizeMB: 10
    });

    const handleAvatarUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setMessage({ type: "", text: "" });

        const onFileProcessed = (_data: { file: File, preview: string }) => {
            // we don't need to save the file locally in state for long,
            // but the profile form uses it in handleSubmit.
            // Actually, processFiles with useImageUploader handles the network upload too.
            // But ProfileForm currently sends it via Server Action in handleSubmit.
            // Let's adapt: we use useImageUploader for processing/preview, 
            // but we'll let it finish the network upload to the server, 
            // and then we'll just use the returned server URL.

            // Wait, useImageUploader returns a server URL in 'preview' after success.
            // We should update our local state when that happens.
        };

        const onError = (msg: string) => {
            toast(msg, "destructive");
        };

        const results = await processFiles(files, 0, onFileProcessed, onError);
        if (results && results.length > 0) {
            const res = results[0];
            setAvatarPreview(res.preview); // This is the server URL
            // Since it's already on the server, we might not even need to send it in formData
            // But updateProfile action expects a file or we can modify it to accept a URL.
            // Looking at ProfileForm's original logic, it sent a file. 
            // The ImageUploader hook has already handled the server storage.
            // So we'll pass the URL or a special flag.
        }

        // Reset input
        e.target.value = "";
    }, [processFiles, toast]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const name = formData.get("name") as string;

        if (!name || name.trim().length < 2) {
            setMessage({ type: "error", text: "ФИО должно содержать минимум 2 символа" });
            return;
        }

        setLoading(true);
        setMessage({ type: "", text: "" });

        // If we have a NEW avatar preview that is a server URL from useImageUploader,
        // we can pass it to the action.
        if (avatarPreview && avatarPreview.startsWith('/uploads/')) {
            formData.set("avatarUrl", avatarPreview);
        }

        const result = await updateProfile(formData);

        if (result.success) {
            setMessage({ type: "success", text: "Профиль успешно обновлен!" });
        } else {
            setMessage({ type: "error", text: result.error });
        }
        setLoading(false);
    }

    const deptName = user.department?.name || "Общий отдел";
    const currentUpload = uploadStates[0];

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex flex-col md:flex-row items-center gap-3">
                <div className="relative group/avatar">
                    <div className="absolute -inset-1 bg-primary rounded-full blur opacity-20 group-hover/avatar:opacity-40 transition duration-1000 group-hover/avatar:duration-200" />
                    <div className="relative h-32 w-32 rounded-full overflow-hidden border-4 border-white shadow-xl ring-1 ring-slate-100 bg-slate-50">
                        <Avatar className="h-full w-full">
                            <AvatarImage src={avatarPreview || undefined} alt="Avatar" className="object-cover" />
                            <AvatarFallback className="bg-slate-100 text-slate-400 text-3xl font-black">
                                {user.name.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                        </Avatar>

                        {/* Progress Overlay */}
                        {currentUpload && currentUpload.uploading && (
                            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-4">
                                <div className="relative w-12 h-12 flex items-center justify-center">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle
                                            cx="24" cy="24" r="20"
                                            stroke="currentColor" strokeWidth="4" fill="transparent"
                                            className="text-slate-100"
                                        />
                                        <circle
                                            cx="24" cy="24" r="20"
                                            stroke="currentColor" strokeWidth="4" fill="transparent"
                                            strokeDasharray={125.6}
                                            strokeDashoffset={125.6 * (1 - currentUpload.progress / 100)}
                                            className="text-primary transition-all duration-300"
                                        />
                                    </svg>
                                    <span className="absolute text-xs font-black text-slate-900">{Math.round(currentUpload.progress)}%</span>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => cancelUpload(0)}
                                    className="mt-2 h-7 px-2 text-xs font-black hover:bg-rose-50 hover:text-rose-500 rounded-lg transition-colors flex items-center gap-1"
                                >
                                    <X className="w-3 h-3" />
                                    Отмена
                                </Button>
                            </div>
                        )}

                        <label className={cn(
                            "absolute inset-x-0 bottom-0 py-2 bg-black/40 backdrop-blur-md text-white text-xs font-black text-center cursor-pointer transition-opacity duration-300",
                            currentUpload?.uploading ? "opacity-0 pointer-events-none" : "opacity-0 group-hover/avatar:opacity-100"
                        )}>
                            <Camera className="w-4 h-4 mx-auto mb-0.5" />
                            Изменить
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleAvatarUpload}
                                disabled={currentUpload?.uploading}
                            />
                        </label>
                    </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h3 className="text-xl font-black text-slate-900">{user.name}</h3>
                    <p className="text-slate-400 text-sm font-bold mt-1">{deptName}</p>
                    <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
                        <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-black text-slate-500">
                            #personal_details
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-3">
                <div className="space-y-2 group/input">
                    <Label className="text-xs font-black text-slate-400 ml-1 group-hover/input:text-primary transition-colors">ФИО</Label>
                    <Input
                        name="name"
                        defaultValue={user.name}
                        className="h-12 px-6 rounded-2xl bg-slate-50/50 border-slate-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 font-black text-slate-900 transition-all duration-300"
                        placeholder="Введите ФИО"
                    />
                </div>

                <div className="space-y-2 group/input">
                    <Label className="text-xs font-black text-slate-400 ml-1">Дата рождения</Label>
                    <Input
                        name="birthday"
                        type="date"
                        defaultValue={user.birthday?.split("T")[0]}
                        className="h-12 px-6 rounded-2xl bg-slate-50/50 border-slate-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 font-bold text-slate-900 transition-all duration-300"
                    />
                </div>

                <div className="space-y-2 group/input">
                    <Label className="text-xs font-black text-slate-400 ml-1">Телефон</Label>
                    <Input
                        name="phone"
                        defaultValue={user.phone || ""}
                        className="h-12 px-6 rounded-2xl bg-slate-50/50 border-slate-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 font-black text-slate-900 transition-all duration-300"
                        placeholder="+7 (___) ___-__-__"
                    />
                </div>

                <div className="space-y-2 group/input">
                    <Label className="text-xs font-black text-slate-400 ml-1">Telegram</Label>
                    <Input
                        name="telegram"
                        defaultValue={user.telegram || ""}
                        className="h-12 px-6 rounded-2xl bg-slate-50/50 border-slate-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 font-black text-slate-900 transition-all duration-300"
                        placeholder="@username"
                    />
                </div>

                <div className="space-y-2 group/input">
                    <Label className="text-xs font-black text-slate-400 ml-1">Instagram</Label>
                    <Input
                        name="instagram"
                        defaultValue={user.instagram || ""}
                        className="h-12 px-6 rounded-2xl bg-slate-50/50 border-slate-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 font-black text-slate-900 transition-all duration-300"
                        placeholder="username"
                    />
                </div>

                <div className="space-y-2 group/input">
                    <Label className="text-xs font-black text-slate-400 ml-1">Social Max</Label>
                    <Input
                        name="socialMax"
                        defaultValue={user.socialMax || ""}
                        className="h-12 px-6 rounded-2xl bg-slate-50/50 border-slate-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 font-black text-slate-900 transition-all duration-300"
                        placeholder="ID"
                    />
                </div>

                <div className="space-y-2 opacity-60">
                    <Label className="text-xs font-black text-slate-400 ml-1">Email</Label>
                    <Input
                        value={user.email}
                        readOnly
                        className="h-12 px-6 rounded-2xl bg-slate-100 border-slate-200 cursor-not-allowed font-black text-slate-500"
                    />
                </div>

                <div className="space-y-2 opacity-60">
                    <Label className="text-xs font-black text-slate-400 ml-1">Отдел</Label>
                    <Input
                        value={deptName}
                        readOnly
                        className="h-12 px-6 rounded-2xl bg-slate-100 border-slate-200 cursor-not-allowed font-black text-slate-500"
                    />
                </div>
            </div>

            {message.text && (
                <div className={cn("p-5 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300",
                    message.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-100" : "bg-rose-50 text-rose-800 border border-rose-100"
                )}>
                    {message.type === "success" ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <AlertCircle className="w-5 h-5 text-rose-500" />}
                    <span className="text-sm font-black">{message.text}</span>
                </div>
            )}

            <div className="pt-6 flex justify-end">
                <SubmitButton
                    isLoading={loading}
                    className="h-11 px-12 rounded-[var(--radius-inner)] btn-dark text-white font-bold text-base shadow-2xl shadow-slate-900/20 transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center gap-3 border-none"
                    text="Сохранить изменения"
                    loadingText="Сохранение..."
                />
            </div>
        </form>
    );
}
