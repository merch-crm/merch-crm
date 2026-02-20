import { getBrandingSettings, getIconGroups } from "./actions";
import { BrandingForm } from "./branding-form";
import { PageContainer } from "@/components/ui/page-container";

export default async function BrandingPage() {
    const [settings, iconGroups] = await Promise.all([
        getBrandingSettings(),
        getIconGroups()
    ]);

    return (
        <PageContainer>
            {/* Form */}
            <BrandingForm initialSettings={settings} initialIconGroups={iconGroups} />
        </PageContainer>
    );
}
