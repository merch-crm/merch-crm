import {
    printCollections,
    printDesigns,
    printDesignVersions,
    printDesignFiles
} from "@/lib/schema";
import { InferSelectModel } from "drizzle-orm";

export type Collection = InferSelectModel<typeof printCollections>;
export type Design = InferSelectModel<typeof printDesigns>;
export type Version = InferSelectModel<typeof printDesignVersions>;
export type DesignFile = InferSelectModel<typeof printDesignFiles>;

export interface CollectionWithStats extends Collection {
    designsCount: number;
    linkedLinesCount: number;
}

export interface CollectionWithFullStats extends Collection {
    stats: {
        designs: number;
        versions: number;
        files: number;
    };
    linkedLines: {
        id: string;
        name: string;
        type: "base" | "finished";
        categoryName: string;
    }[];
}

export interface DesignWithVersionsCount extends Design {
    versionsCount: number;
    filesCount: number;
}

export interface VersionWithFiles extends Version {
    files: DesignFile[];
}

export interface DesignWithFullData extends Design {
    collection: {
        id: string;
        name: string;
    };
    versions: VersionWithFiles[];
    linkedLines: {
        id: string;
        name: string;
        categoryName: string;
    }[];
}
