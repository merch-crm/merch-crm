import React from "react";
import { UserCircle, Shield } from "lucide-react";
import { ProfileForm } from "../../profile-form";
import { PasswordForm } from "../../password-form";
import { UserProfile } from "../../types";

interface SettingsTabProps {
    user: UserProfile;
}

export function SettingsTab({ user }: SettingsTabProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 pb-12">
            <div className="crm-card  !rounded-3xl">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <UserCircle className="w-6 h-6 text-primary" /> Личные данные
                </h2>
                <ProfileForm user={user} />
            </div>
            <div className="crm-card  !rounded-3xl">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Shield className="w-6 h-6 text-primary" /> Безопасность
                </h2>
                <PasswordForm />
            </div>
        </div>
    );
}
