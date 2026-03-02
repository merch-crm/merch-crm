export * from "@/lib/types";

export interface AttributeMeta {
    fullName?: string;
    shortName?: string;
    isOversize?: boolean;
    hex?: string;
    measureValue?: string;
    measureUnit?: string;
    length?: string;
    width?: string;
    height?: string;
    dimensionUnit?: string;
    weight?: string;
    unit?: string;
    volume?: string;
    density?: string;
    quantity?: string;
    items?: { name: string; percent: string }[];
}
