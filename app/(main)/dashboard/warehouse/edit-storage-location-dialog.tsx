"use client";

import { Building, Package, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ResponsiveModal } from "@/components/ui/responsive-modal";

import { StorageLocation, StorageLocationItem } from "./storage-locations-tab";
import { useEditLocationLogic } from "./components/storage-location/hooks/useEditLocationLogic";
import { LocationForm } from "./components/storage-location/location-form";
import { LocationItemsList } from "./components/storage-location/location-items-list";
import { QuickTransferModal } from "./components/storage-location/quick-transfer-modal";

interface EditStorageLocationDialogProps {
    users: { id: string; name: string }[];
    locations: StorageLocation[];
    location: StorageLocation | null;
    isOpen: boolean;
    onClose: () => void;
}

const ITEMS_PER_PAGE = 7;

export function EditStorageLocationDialog(props: EditStorageLocationDialogProps) {
    const fallbackLocation = props.locations[0] || { id: "none", name: "" };
    return <EditStorageLocationInner {...props} location={props.location || (fallbackLocation as StorageLocation)} />;
}

function EditStorageLocationInner({ users, locations, location, isOpen, onClose }: EditStorageLocationDialogProps & { location: StorageLocation; }) {
    const logic = useEditLocationLogic({ location });
    const { ui, setUi, form, setFormValue, fieldErrors, clearFieldError, localItems, setLocalItems, handleAutoSave } = logic;

    return (
        <>
            <ResponsiveModal
                isOpen={isOpen}
                onClose={onClose}
                title="Редактирование локации"
                showVisualTitle={false}
                className="sm:max-w-[800px]"
            >
                <div className="flex flex-col h-full overflow-hidden">
                    {/* Header - Mobile & Desktop via tailwind */}
                    <div className="flex items-center justify-between p-5 pb-2 shrink-0 border-b border-transparent">
                        <div className="flex items-center gap-3.5 md:gap-3">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-[var(--radius-inner)] bg-primary/10 flex items-center justify-center shadow-sm shrink-0">
                                <Building className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 md:gap-3">
                                    <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight">Настройки склада</h2>
                                    {ui.isSaving && (
                                        <div className="md:flex hidden items-center gap-1.5 px-2.5 py-0.5 bg-primary/5 rounded-full border border-primary/10">
                                            <RefreshCw className="w-2.5 h-2.5 text-primary animate-spin" />
                                            <span className="text-xs font-bold text-primary">Сохранение...</span>
                                        </div>
                                    )}
                                    {/* Mobile spinner only */}
                                    {ui.isSaving && <RefreshCw className="md:hidden w-3 h-3 text-primary animate-spin" />}
                                </div>
                                <p className="text-xs md:text-[11px] font-bold text-slate-500 mt-0.5">
                                    Локация: <span className="text-slate-900 font-bold">{form.name}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Main Body */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {/* Mobile Two-Stack Layout */}
                        <div className="md:hidden px-5 pb-6 space-y-4">
                            <LocationForm
                                form={form}
                                fieldErrors={fieldErrors}
                                isSaving={ui.isSaving}
                                users={users}
                                location={location}
                                setFormValue={setFormValue}
                                clearFieldError={clearFieldError}
                                handleAutoSave={handleAutoSave}
                            />

                            <div className="pt-6 border-t border-slate-100">
                                <label className="text-sm font-bold text-slate-700 mb-4 block">Наличие товаров</label>
                                <LocationItemsList
                                    currentPage={ui.currentPage}
                                    itemsPerPage={ITEMS_PER_PAGE}
                                    localItems={localItems}
                                    setCurrentPage={(p) => setUi(prev => ({ ...prev, currentPage: p }))}
                                    onTransferClick={(item) => setUi(prev => ({ ...prev, transferItem: item }))}
                                />
                            </div>
                        </div>

                        {/* Desktop Side-by-Side Layout */}
                        <div className="hidden md:grid grid-cols-5 gap-3 p-5 h-full overflow-hidden">
                            <div className="col-span-2 space-y-4 overflow-y-auto custom-scrollbar pr-2 pl-1">
                                <LocationForm
                                    form={form}
                                    fieldErrors={fieldErrors}
                                    isSaving={ui.isSaving}
                                    users={users}
                                    location={location}
                                    setFormValue={setFormValue}
                                    clearFieldError={clearFieldError}
                                    handleAutoSave={handleAutoSave}
                                />
                                <div className="pt-2">
                                    <Button
                                        type="button"
                                        variant="btn-dark"
                                        onClick={onClose}
                                        className="w-full h-11 rounded-[var(--radius-inner)] font-bold text-sm shadow-lg shadow-black/10 transition-all active:scale-[0.98]"
                                    >
                                        Сохранить
                                    </Button>
                                </div>
                            </div>

                            <div className="col-span-3 flex flex-col gap-4 border-l border-slate-200 pl-5 h-full min-h-[440px] overflow-hidden">
                                <div className="flex items-center justify-between mb-4">
                                    <label className="text-sm font-bold text-slate-700 block">
                                        <Package className="w-3.5 h-3.5 text-slate-300 inline-block mr-2" /> Товары в наличии <span className="opacity-30">/</span> {localItems?.length || 0}
                                    </label>
                                    <div className={cn(
                                        "flex items-center gap-1.5 px-2.5 py-1 rounded-full border shadow-sm transition-colors",
                                        form.isActive ? "bg-emerald-500/10 border-emerald-500/20" : "bg-slate-50 border-slate-200"
                                    )}>
                                        <div className={cn(
                                            "w-1.5 h-1.5 rounded-full transition-all",
                                            form.isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                                        )} />
                                        <span className={cn(
                                            "text-xs font-bold",
                                            form.isActive ? "text-emerald-500" : "text-slate-500"
                                        )}>
                                            {form.isActive ? "Активно" : "Архив"}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto custom-scrollbar">
                                    <LocationItemsList
                                        currentPage={ui.currentPage}
                                        itemsPerPage={ITEMS_PER_PAGE}
                                        localItems={localItems}
                                        setCurrentPage={(p) => setUi(prev => ({ ...prev, currentPage: p }))}
                                        onTransferClick={(item) => setUi(prev => ({ ...prev, transferItem: item }))}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Dialog Actions footer sticky bottom */}
                    <div className="md:hidden sticky bottom-0 z-20 p-5 pt-3 flex items-center gap-3 shrink-0 bg-white/95 backdrop-blur-md border-t border-slate-100">
                        <Button
                            variant="ghost"
                            type="button"
                            onClick={onClose}
                            className="flex h-11 flex-1 text-slate-400 hover:text-slate-600 font-bold text-sm"
                        >
                            Отмена
                        </Button>
                        <Button variant="btn-dark" type="button" onClick={onClose} className="h-11 flex-1 rounded-[var(--radius-inner)] text-sm font-bold shadow-sm">
                            Сохранить
                        </Button>
                    </div>
                </div>
            </ResponsiveModal>

            {ui.transferItem && (
                <QuickTransferModal
                    item={ui.transferItem}
                    currentLocationId={location.id}
                    locations={locations}
                    onClose={() => setUi(prev => ({ ...prev, transferItem: null }))}
                    onSuccess={(itemId, quantity) => {
                        setLocalItems(prev => prev.map(i => {
                            if (i.id === itemId) return { ...i, quantity: i.quantity - quantity };
                            return i;
                        }).filter(i => i.quantity > 0));
                    }}
                />
            )}
        </>
    );
}
