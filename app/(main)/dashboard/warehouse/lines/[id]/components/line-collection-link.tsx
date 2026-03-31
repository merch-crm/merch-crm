"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Palette, Image as ImageIcon } from "lucide-react";

interface LineCollectionLinkProps {
    collection: {
        id: string;
        name: string;
        coverImage: string | null;
        designsCount: number;
    } | null;
    baseLine: {
        id: string;
        name: string;
        itemsCount: number;
    } | null;
}

export function LineCollectionLink({
    collection,
    baseLine,
}: LineCollectionLinkProps) {
    if (!collection && !baseLine) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Связанные данные</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {/* Коллекция принтов */}
                {collection && (
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                            {collection.coverImage ? (
                                <Image
                                    src={collection.coverImage}
                                    alt={collection.name}
                                    width={48}
                                    height={48}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <Palette className="h-5 w-5 text-muted-foreground" />
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground">Коллекция принтов</p>
                            <p className="font-medium truncate">{collection.name}</p>
                            <p className="text-xs text-muted-foreground">
                                {collection.designsCount} принтов
                            </p>
                        </div>

                        <Link href={`/dashboard/design/prints/${collection.id}`}>
                            <Button variant="ghost" size="icon">
                                <ExternalLink className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                )}

                {/* Базовая линейка */}
                {baseLine && (
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className="w-12 h-12 rounded-md bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                            <ImageIcon className="h-5 w-5 text-blue-500" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground">Базовая линейка</p>
                            <p className="font-medium truncate">{baseLine.name}</p>
                            <p className="text-xs text-muted-foreground">
                                {baseLine.itemsCount} позиций
                            </p>
                        </div>

                        <Link href={`/dashboard/warehouse/lines/${baseLine.id}`}>
                            <Button variant="ghost" size="icon">
                                <ExternalLink className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
