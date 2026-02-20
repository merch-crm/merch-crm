import * as React from "react";
import { FILE_ICONS } from "./constants";

export const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return FILE_ICONS.image;
    if (file.type === "application/pdf") return FILE_ICONS.pdf;
    if (file.type.includes("document") || file.type.includes("word")) return FILE_ICONS.document;
    return FILE_ICONS.default;
};
