"use client";

import { useState } from "react";
import { updateProfile } from "./actions";
import { Loader2, CheckCircle2, AlertCircle, Camera } from "lucide-react";

interface UserProfile {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    department?: { name: string } | string | null;
    role?: { name: string } | null;
    createdAt: string | Date;
}

export function ProfileForm({ user }: { user: UserProfile }) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar || null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = 500;
                canvas.height = 500;
                const ctx = canvas.getContext("2d");

                if (ctx) {
                    // Calculate aspect ratio to simulate object-fit: cover
                    const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
                    const x = (canvas.width / 2) - (img.width / 2) * scale;
                    const y = (canvas.height / 2) - (img.height / 2) * scale;

                    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

                    // Compress to < 1MB
                    let quality = 0.9;
                    const compress = () => {
                        canvas.toBlob(
                            (blob) => {
                                if (blob) {
                                    if (blob.size > 1024 * 1024 && quality > 0.1) {
                                        quality -= 0.1;
                                        compress(); // Recursively reduce quality
                                    } else {
                                        const processedFile = new File([blob], "avatar.jpg", { type: "image/jpeg" });
                                        setAvatarFile(processedFile);
                                        setAvatarPreview(URL.createObjectURL(blob));
                                    }
                                }
                            },
                            "image/jpeg",
                            quality
                        );
                    };
                    compress();
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

    return (
        <form action={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center mb-6">
                <div className="relative group cursor-pointer">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-100 shadow-sm relative bg-slate-100">
                        {avatarPreview ? (
                            <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <span className="text-4xl font-bold">{user.name.charAt(0)}</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                </div>
                <p className="text-xs text-slate-400 mt-2 font-medium">Нажмите, чтобы изменить фото</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Полное имя</label>
                    <input
                        name="name"
                        type="text"
                        defaultValue={user.name}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none bg-slate-50/30 font-medium"
                        placeholder="Имя Фамилия"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Телефон</label>
                    <input
                        name="phone"
                        type="tel"
                        defaultValue={user.phone || ""}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none bg-slate-50/30 font-medium"
                        placeholder="+7 (999) 000-00-00"
                    />
                </div>
                <div className="space-y-2 opacity-80">
                    <label className="text-sm font-bold text-slate-700 ml-1">Отдел</label>
                    <input
                        type="text"
                        value={(typeof user.department === 'object' && user.department !== null) ? user.department.name : (user.department || "Без отдела")}
                        readOnly
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-100 cursor-not-allowed outline-none font-medium text-slate-600"
                    />
                    <input type="hidden" name="department" value={(typeof user.department === 'object' && user.department !== null) ? user.department.name : (user.department || "")} />
                </div>
                <div className="space-y-2 opacity-60">
                    <label className="text-sm font-bold text-slate-700 ml-1">Email (только чтение)</label>
                    <input
                        type="email"
                        value={user.email}
                        readOnly
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-100 cursor-not-allowed outline-none font-medium"
                    />
                </div>
            </div>

            {message.text && (
                <div className={`p-4 rounded-lg flex items-center gap-3 animate-in fade-in zoom-in-95 ${message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"
                    }`}>
                    {message.type === "success" ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <AlertCircle className="w-5 h-5 text-red-500" />}
                    <span className="text-sm font-medium">{message.text}</span>
                </div>
            )}

            <div className="pt-2">
                <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3.5 bg-indigo-600 text-white rounded-lg font-bold shadow-lg shadow-indigo-600/20 hover:bg-white hover:text-indigo-600 hover:ring-2 hover:ring-indigo-600 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                    {loading ? "Сохранение..." : "Сохранить изменения"}
                </button>
            </div>
        </form>
    );
}
