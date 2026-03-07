"use client";

import Link from "next/link";
import { Globe } from "lucide-react";
import { BrandingSettings } from "@/lib/types";

interface FooterProps {
    branding?: BrandingSettings;
}

export function Footer({ branding }: FooterProps) {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="py-6 px-8 mt-12">
            <div className="max-w-[1480px] mx-auto flex flex-wrap items-center justify-center gap-3">
                <p className="text-sm font-medium text-slate-500">
                    © {currentYear} {branding?.companyName || "MerchCRM"}. Все права защищены.
                </p>
                <div className="flex items-center gap-3">
                    <Link href="#" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
                        Политика конфиденциальности
                    </Link>
                    <Link href="#" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
                        Условия использования
                    </Link>
                    <div className="w-px h-4 bg-slate-200" />
                    <Link href="#" className="text-sm font-bold flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
                        <Globe className="w-4 h-4" /> RU
                    </Link>
                </div>
            </div>
        </footer>
    );
}
