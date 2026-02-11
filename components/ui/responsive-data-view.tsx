"use client";

import React from "react";


interface ResponsiveDataViewProps<T> {
    data: T[];
    renderTable: () => React.ReactNode;
    renderCard: (item: T, index: number) => React.ReactNode;
    mobileGridClassName?: string;
    desktopClassName?: string;
}

/**
 * A component that renders a table on desktop and a vertical list of cards on mobile.
 * Ensures that the desktop UI remains unchanged while providing a purpose-built mobile experience.
 */
export function ResponsiveDataView<T>({
    data,
    renderTable,
    renderCard,
    mobileGridClassName = "grid grid-cols-1 md:grid-cols-2 gap-4 md:hidden",
    desktopClassName = "hidden md:block"
}: ResponsiveDataViewProps<T>) {
    return (
        <div className="w-full">
            {/* Mobile/Tablet View: Grid of cards */}
            <div className={mobileGridClassName}>
                {data.map((item, index) => renderCard(item, index))}
            </div>

            {/* Desktop View: Original Table */}
            <div className={desktopClassName}>
                {renderTable()}
            </div>
        </div>
    );
}
