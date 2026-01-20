import { getBrandingSettings } from "./actions";
import { BrandingForm } from "./branding-form";

export default async function BrandingPage() {
    const settings = await getBrandingSettings();

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Внешний вид</h1>
                <p className="text-slate-500 font-medium mt-2">Настройка логотипа, цветов и названия CRM</p>
            </div>

            {/* Form */}
            <BrandingForm initialSettings={settings} />
        </div>
    );
}
