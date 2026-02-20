import * as React from "react";
import { FileText, Image as ImageIcon, File as FileIcon } from "lucide-react";

export const FILE_ICONS: Record<string, React.ReactNode> = {
    image: <ImageIcon className="w-6 h-6" aria-label="Image file" />,
    pdf: <FileText className="w-6 h-6" />,
    document: <FileText className="w-6 h-6" />,
    default: <FileIcon className="w-6 h-6" />,
};
