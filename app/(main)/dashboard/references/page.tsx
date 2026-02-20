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
import NewReferencesCRM from "./new-references-crm";
import ChargingWidgetCRM from "./charging-widget-crm";
import BatteryWidgetCRM from "./battery-widget-crm";
import FileManagerCRM from "./file-manager-crm";
import DashboardWidgetsCRM from "./dashboard-widgets-crm";
import FloatingPanelsCRM from "./floating-panels-crm";
import BikeHealthCard from "./bike-health-card";
import ChargingNotificationPanelsCRM from "./charging-notification-panels-crm";
import ProjectTabsCRM from "./project-tabs-crm";
import SoftUiPanelsCRM from "./soft-ui-panels-crm";
import TooltipShowcaseCRM from "./tooltip-showcase-crm";
import SidebarNavigationCRM from "./sidebar-navigation-crm";
import FileUploadShowcaseCRM from "./file-upload-showcase-crm";
import IconsShowcaseCRM from "./icons-showcase-crm";

export default function DesignShowcasePage() {
    return (
        <div className="min-h-screen bg-background p-4 md:p-8 font-sans text-foreground overflow-x-hidden">
            <div className="max-w-[1400px] mx-auto space-y-4">

                {/* Page Header */}
                <header className="glass-panel p-8 mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">Референсы</h1>
                    <p className="text-slate-400 text-sm font-medium">
                        Премиальная коллекция дизайнов на основе Lumin-Apple стиля
                    </p>
                </header>

                <div className="flex flex-col gap-20">
                    {/* --- NEW REFERENCES (IMAGES FROM USER) --- */}
                    <NewReferencesCRM />

                    {/* --- ICONS SHOWCASE --- */}
                    <IconsShowcaseCRM />

                    {/* --- FILE MANAGER DESIGNS --- */}
                    <FileManagerCRM />

                    {/* --- CHARGING WIDGET (NEW REQUEST) --- */}
                    <ChargingWidgetCRM />

                    {/* --- BATTERY WIDGET (REFERENCE MATCH) --- */}
                    <BatteryWidgetCRM />

                    {/* --- DASHBOARD WIDGETS COLLECTION --- */}
                    <DashboardWidgetsCRM />

                    {/* --- FLOATING PANELS UI (SOFT SHADOWS) --- */}
                    <FloatingPanelsCRM />

                    {/* --- CHARGING NOTIFICATIONS (DARK PILLS) --- */}
                    <ChargingNotificationPanelsCRM />

                    {/* --- BIKE HEALTH CARD (GLASSMORPHISM) --- */}
                    <BikeHealthCard />

                    {/* --- PROJECT TABS (DARK MODE) --- */}
                    <ProjectTabsCRM />

                    {/* --- TOOLTIP SHOWCASE (LIGHT/DARK) --- */}
                    <TooltipShowcaseCRM />

                    {/* --- SIDEBAR NAVIGATION (TREE & FLOATING) --- */}
                    <SidebarNavigationCRM />

                    {/* --- FILE UPLOAD (MINIMALIST) --- */}
                    <FileUploadShowcaseCRM />

                    {/* --- SOFT UI CONTROLS (BUTTONS) --- */}
                    <SoftUiPanelsCRM />

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
