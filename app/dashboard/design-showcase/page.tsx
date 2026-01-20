"use client";

import React from "react";
import StepsMenuCRM from "./steps-menu-crm";
import CardsCRM from "./cards-crm";
import AnalyticsCRM from "./analytics-crm";
import TwistyCRM from "./twisty-crm";
import InvoiceDashboardCRM from "./invoice-dashboard-crm";
import SmartHomeDashboardCRM from "./smart-home-dashboard-crm";
import AquaflowLandingCRM from "./aquaflow-landing-crm";
import UiComponentsShowcaseCRM from "./ui-components-showcase-crm";
import EduplexDashboardCRM from "./eduplex-dashboard-crm";
import FocusFlowDashboardCRM from "./focus-flow-dashboard-crm";

export default function DesignShowcasePage() {
    return (
        <div className="min-h-screen bg-background p-4 md:p-8 font-sans text-foreground">
            <div className="max-w-[1400px] mx-auto space-y-8">

                {/* Page Header */}
                <header className="glass-panel p-8 mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">Design Showcase</h1>
                    <p className="text-slate-400 text-sm font-medium">
                        CRM-стилизованная коллекция дизайнов с glassmorphism и ultra-rounded corners
                    </p>
                </header>

                <div className="flex flex-col gap-20">
                    {/* --- CUSTOM COMPONENT: STEPS MENU (PHOTO 1 + 2) --- */}
                    <StepsMenuCRM />

                    {/* --- SECTION 1: CARDS (CRM STYLE) --- */}
                    <CardsCRM />

                    {/* --- SECTION 2: ANALYTICS (CRM STYLE) --- */}
                    <AnalyticsCRM />

                    {/* --- SECTION 3: TWISTY (CRM STYLE) --- */}
                    <TwistyCRM />

                    {/* --- SECTION 4: INVOICE (CRM STYLE) --- */}
                    <InvoiceDashboardCRM />

                    {/* --- SECTION 5: SMART HOME (CRM STYLE) --- */}
                    <SmartHomeDashboardCRM />

                    {/* --- SECTION 6: AQUAFLOW (CRM STYLE) --- */}
                    <AquaflowLandingCRM />

                    {/* --- SECTION 7: UI COMPONENTS (CRM STYLE) --- */}
                    <UiComponentsShowcaseCRM />

                    {/* --- SECTION 8: EDUPLEX (CRM STYLE) --- */}
                    <EduplexDashboardCRM />

                    {/* --- SECTION 9: FOCUSFLOW (CRM STYLE) --- */}
                    <FocusFlowDashboardCRM />

                </div>
            </div>
        </div>
    );
}
