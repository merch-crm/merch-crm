import { getBrandingSettings } from "./actions";
import { BrandingForm } from "./branding-form";

export default async function BrandingPage() {
    const settings = await getBrandingSettings();

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Form */}
            <BrandingForm initialSettings={settings} />
        </div>
    );
}
