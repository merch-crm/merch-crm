"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { formatPrice } from "./utils";
import { PriceLineItemProps } from "./types";
import { TYPE_COLORS, TYPE_ICONS } from "./constants";
import { PriceRow } from "./PriceRow";

export function PriceLineItem({
    line,
    currency,
    showQuantity,
    showUnitPrice,
    nested = false,
}: PriceLineItemProps) {
    const [showDetails, setShowDetails] = React.useState(false);
    const colors = TYPE_COLORS[line.type];
    const icon = line.icon || TYPE_ICONS[line.type];
    const hasDetails = line.details && line.details.length > 0;

    return (
        <div className={cn(nested && "ml-8 border-l-2 border-slate-100")}>
            <PriceRow
                icon={icon}
                colorClasses={colors}
                label={line.label}
                description={line.description}
                amount={line.amount}
                currency={currency}
                isNegative={line.isNegative}
                highlighted={line.highlighted}
                hasDetails={hasDetails}
                showDetails={showDetails}
                onClick={hasDetails ? () => setShowDetails(!showDetails) : undefined}
                quantityInfo={showQuantity && showUnitPrice && line.quantity && line.unitPrice ?
                    `${line.quantity} × ${formatPrice(line.unitPrice, currency)}` : undefined
                }
            />

            {/* Детали */}
            {hasDetails && showDetails && (
                <div className="bg-slate-50 border-t border-slate-100">
                    {line.details!.map((detail) => (
                        <PriceLineItem
                            key={detail.id}
                            line={detail}
                            currency={currency}
                            showQuantity={showQuantity}
                            showUnitPrice={showUnitPrice}
                            nested
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
