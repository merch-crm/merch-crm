"use client";

import React, { useEffect } from "react";
import { Decal, useTexture } from "@react-three/drei";

export function LogoDecal({ url, position, rotation, scale }: { 
    url: string; 
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
}) {
    const texture = useTexture(url || "/logo.png");
    
    useEffect(() => {
        if (texture) {
            texture.anisotropy = 16;
            texture.needsUpdate = true;
        }
    }, [texture]);

    if (!url) return null;

    return (
        <Decal position={position} rotation={rotation} scale={scale}>
            <meshStandardMaterial
                map={texture}
                transparent
                polygonOffset
                polygonOffsetFactor={-10}
                roughness={1}
                metalness={0}
                depthTest={true}
                depthWrite={false}
            />
        </Decal>
    );
}
