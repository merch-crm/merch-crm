import { getBrandingSettings, getIconGroups } from "./actions";
import { BrandingForm } from "./branding-form";

export default async function BrandingPage() {
    const [settings, iconGroups] = await Promise.all([
        getBrandingSettings(),
        getIconGroups()
    ]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Form */}
            <BrandingForm initialSettings={settings} initialIconGroups={iconGroups} />
        </div>
    );
}
