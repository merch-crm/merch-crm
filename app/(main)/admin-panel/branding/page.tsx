import { getBrandingSettings, getIconGroups } from "../actions/branding.actions";
import { BrandingForm } from "./branding-form";
import { PageContainer } from "@/components/ui/page-container";

export const dynamic = "force-dynamic";

export default async function BrandingPage() {
    const [settings, iconGroupsRes] = await Promise.all([
        getBrandingSettings(),
        getIconGroups()
    ]);

    const iconGroups = iconGroupsRes.success ? (iconGroupsRes.data || []) : [];

    return (
        <PageContainer>
            {/* Form */}
            <BrandingForm initialSettings={settings} initialIconGroups={iconGroups} />
        </PageContainer>
    );
}
