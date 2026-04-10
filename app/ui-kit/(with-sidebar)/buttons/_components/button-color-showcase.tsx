"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ComponentShowcase, BgSolid } from "@/components/ui-kit";
import { Typo } from "@/components/ui/typo";

interface ButtonVariantConfig {
 color: "primary" | "success" | "warning" | "danger" | "neutral" | "brand";
 title: string;
 desc: string;
 primaryIcon: LucideIcon;
 secondaryIcon?: LucideIcon;
 ghostIcon?: LucideIcon;
 primaryLabel: string;
 secondaryLabel?: string;
 ghostLabel?: string;
 loadingLabel?: string;
}

export function ButtonColorShowcase({ 
 color, title, desc, 
 primaryIcon: PrimaryIcon, secondaryIcon: SecondaryIcon, ghostIcon: GhostIcon,
 primaryLabel, secondaryLabel, ghostLabel, loadingLabel 
}: ButtonVariantConfig) {
 const Icon2 = SecondaryIcon || PrimaryIcon;
 const Icon3 = GhostIcon || PrimaryIcon;

 return (
 <BgSolid>
 <ComponentShowcase 
 title={<Typo>{title}</Typo>} 
 source="custom" 
 desc={<Typo>{desc}</Typo>}
 importPath='import { Button } from "@/components/ui/button";'
 >
 <div className="flex flex-col gap-6">
 <div className="flex flex-wrap gap-4 items-end">
 <div className="flex flex-col gap-2">
 <Typo as="span" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Primary</Typo>
 <div className="flex gap-3">
 <Button color={color} variant="solid">
 <PrimaryIcon className="size-4 mr-2" />
 <Typo>{primaryLabel}</Typo>
 </Button>
 {secondaryLabel && (
 <Button color={color} variant="solid">
 <Icon2 className="size-4 mr-2" />
 <Typo>{secondaryLabel}</Typo>
 </Button>
 )}
 <Button color={color} variant="solid" size="icon">
 <PrimaryIcon className="size-5" />
 </Button>
 </div>
 </div>
 <div className="flex flex-col gap-2">
 <Typo as="span" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Secondary</Typo>
 <div className="flex gap-3">
 <Button color={color} variant="outline">
 <Icon2 className="size-4 mr-2" />
 <Typo>{secondaryLabel || primaryLabel}</Typo>
 </Button>
 <Button color={color} variant="outline" size="icon">
 <Icon2 className="size-5" />
 </Button>
 </div>
 </div>
 </div>

 <div className="flex flex-wrap gap-4 items-end">
 <div className="flex flex-col gap-2">
 <Typo as="span" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ghost</Typo>
 <div className="flex gap-3">
 <Button color={color} variant="ghost">
 <Icon3 className="size-4 mr-2" />
 <Typo>{ghostLabel || primaryLabel}</Typo>
 </Button>
 <Button color={color} variant="ghost" size="icon">
 <Icon3 className="size-5" />
 </Button>
 </div>
 </div>
 <div className="flex flex-col gap-2">
 <Typo as="span" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Loading</Typo>
 <div className="flex gap-3">
 <Button color={color} variant="solid" isLoading loadingText={<Typo>{loadingLabel || primaryLabel}</Typo>}
 >
 <Typo>{primaryLabel}</Typo>
 </Button>
 </div>
 </div>
 </div>
 </div>
 </ComponentShowcase>
 </BgSolid>
 );
}
