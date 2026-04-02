import {
    printCollections,
    printDesigns,
    printDesignVersions,
    printDesignFiles,
    printDesignMockups
} from "@/lib/schema/designs";
import { InferSelectModel } from "drizzle-orm";

export type Collection = InferSelectModel<typeof printCollections>;
export type Design = InferSelectModel<typeof printDesigns>;
export type Version = InferSelectModel<typeof printDesignVersions>;
export type DesignFile = InferSelectModel<typeof printDesignFiles>;
export type PrintDesignMockup = InferSelectModel<typeof printDesignMockups>;

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
    mockups?: PrintDesignMockup[];
}

export interface DesignWithMockups extends Design {
    mockups?: PrintDesignMockup[];
    collection?: { id: string; name: string } | null;
    applicationType?: {
        id: string;
        name: string;
        color: string | null;
    } | null;
}
