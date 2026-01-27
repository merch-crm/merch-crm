"use client";

import { useState } from "react";
import { updateProfile } from "./actions";
import { Loader2, CheckCircle2, AlertCircle, Camera } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface UserProfile {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    department?: { name: string } | string | null;
    role?: { name: string } | null;
    avatar?: string | null;
    telegram?: string | null;
    instagram?: string | null;
    socialMax?: string | null;
    birthday?: string | null;
    createdAt: string | Date;
}

export function ProfileForm({ user }: { user: UserProfile }) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar || null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setMessage({ type: "", text: "" });

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = 500;
                canvas.height = 500;
                const ctx = canvas.getContext("2d");

                if (ctx) {
                    const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
                    const x = (canvas.width / 2) - (img.width / 2) * scale;
                    const y = (canvas.height / 2) - (img.height / 2) * scale;
                    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

                    let quality = 0.9;
                    const compress = () => {
                        canvas.toBlob(
                            (blob) => {
                                if (blob) {
                                    if (blob.size > 1024 * 1024 && quality > 0.1) {
                                        quality -= 0.1;
                                        compress();
                                    } else {
                                        const processedFile = new File([blob], "avatar.jpg", { type: "image/jpeg" });
                                        setAvatarFile(processedFile);
                                        setAvatarPreview(URL.createObjectURL(blob));
                                        setUploading(false);
                                    }
                                } else {
                                    setUploading(false);
                                    setMessage({ type: "error", text: "Ошибка при обработке изображения." });
                                }
                            },
                            "image/jpeg",
                            quality
                        );
                    };
                    compress();
                } else {
                    setUploading(false);
                }
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setMessage({ type: "", text: "" });

        if (avatarFile) {
            formData.set("avatar", avatarFile);
        }

        const result = await updateProfile(formData);

        if (result.error) {
            setMessage({ type: "error", text: result.error });
        } else {
            setMessage({ type: "success", text: "Профиль успешно обновлен!" });
        }
        setLoading(false);
    }

    const deptName = typeof user.department === 'object' && user.department !== null ? user.department.name : (user.department || "Общий отдел");

    return (
        <form action={handleSubmit} className="space-y-10">
            <div className="flex flex-col md:flex-row items-center gap-10">
                <div className="relative group/avatar">
                    <div className="absolute -inset-1 bg-primary rounded-full blur opacity-20 group-hover/avatar:opacity-40 transition duration-1000 group-hover/avatar:duration-200" />
                    <div className="relative h-32 w-32 rounded-full overflow-hidden border-4 border-white shadow-xl ring-1 ring-slate-100">
                        <Avatar className="h-full w-full">
                            <AvatarImage src={avatarPreview || undefined} alt="Avatar" className="object-cover" />
                            <AvatarFallback className="bg-slate-100 text-slate-400 text-3xl font-black uppercase">
                                {user.name.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                        </Avatar>
                        {uploading && (
                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            </div>
                        )}
                        <label className="absolute inset-x-0 bottom-0 py-2 bg-black/40 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest text-center cursor-pointer opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300">
                            <Camera className="w-4 h-4 mx-auto mb-0.5" />
                            Изменить
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleAvatarUpload}
                                disabled={uploading}
                            />
                        </label>
                    </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h3 className="text-xl font-black text-slate-900 tracking-normal">{user.name}</h3>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">{deptName}</p>
                    <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
                        <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] font-black text-slate-500 uppercase tracking-widest">
                            #personal_details
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                <div className="space-y-2 group/input">
                    <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 group-hover/input:text-primary transition-colors">ФИО</Label>
                    <Input
                        name="name"
                        defaultValue={user.name}
                        className="h-14 px-6 rounded-2xl bg-slate-50/50 border-slate-100 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 font-black text-slate-900 transition-all duration-300"
                        placeholder="Введите ФИО"
                    />
                </div>

                <div className="space-y-2 group/input">
                    <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Дата рождения</Label>
                    <Input
                        name="birthday"
                        type="date"
                        defaultValue={user.birthday?.split("T")[0]}
                        className="h-14 px-6 rounded-2xl bg-slate-50/50 border-slate-100 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 font-bold text-slate-900 transition-all duration-300"
                    />
                </div>

                <div className="space-y-2 group/input">
                    <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Телефон</Label>
                    <Input
                        name="phone"
                        defaultValue={user.phone || ""}
                        className="h-14 px-6 rounded-2xl bg-slate-50/50 border-slate-100 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 font-black text-slate-900 transition-all duration-300"
                        placeholder="+7 (___) ___-__-__"
                    />
                </div>

                <div className="space-y-2 group/input">
                    <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Telegram</Label>
                    <Input
                        name="telegram"
                        defaultValue={user.telegram || ""}
                        className="h-14 px-6 rounded-2xl bg-slate-50/50 border-slate-100 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 font-black text-slate-900 transition-all duration-300"
                        placeholder="@username"
                    />
                </div>

                <div className="space-y-2 group/input">
                    <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Instagram</Label>
                    <Input
                        name="instagram"
                        defaultValue={user.instagram || ""}
                        className="h-14 px-6 rounded-2xl bg-slate-50/50 border-slate-100 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 font-black text-slate-900 transition-all duration-300"
                        placeholder="username"
                    />
                </div>

                <div className="space-y-2 group/input">
                    <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Social Max</Label>
                    <Input
                        name="socialMax"
                        defaultValue={user.socialMax || ""}
                        className="h-14 px-6 rounded-2xl bg-slate-50/50 border-slate-100 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 font-black text-slate-900 transition-all duration-300"
                        placeholder="ID"
                    />
                </div>

                <div className="space-y-2 opacity-60">
                    <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</Label>
                    <Input
                        value={user.email}
                        readOnly
                        className="h-14 px-6 rounded-2xl bg-slate-100 border-slate-200 cursor-not-allowed font-black text-slate-500"
                    />
                </div>

                <div className="space-y-2 opacity-60">
                    <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Отдел</Label>
                    <Input
                        value={deptName}
                        readOnly
                        className="h-14 px-6 rounded-2xl bg-slate-100 border-slate-200 cursor-not-allowed font-black text-slate-500"
                    />
                </div>
            </div>

            {message.text && (
                <div className={cn(
                    "p-5 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-300",
                    message.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-100" : "bg-rose-50 text-rose-800 border border-rose-100"
                )}>
                    {message.type === "success" ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <AlertCircle className="w-5 h-5 text-rose-500" />}
                    <span className="text-[14px] font-black">{message.text}</span>
                </div>
            )}

            <div className="pt-6 flex justify-end">
                <button
                    type="submit"
                    disabled={loading}
                    className="h-16 px-12 rounded-[24px] bg-primary hover:bg-slate-900 text-white font-black text-[16px] shadow-2xl shadow-primary/20 transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center gap-3"
                >
                    {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                    {loading ? "Сохранение..." : "Сохранить изменения"}
                </button>
            </div>
        </form>
    );
}
