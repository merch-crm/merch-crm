"use client";

import React, { useRef, useMemo, useEffect, Suspense } from "react";
import { useGLTF } from "@react-three/drei";
import { createPortal } from "@react-three/fiber";
import * as THREE from "three";
import { LogoDecal } from "./LogoDecal";
import { PlacementGuide } from "./PlacementGuide";

/**
 * MerchModel - Вспомогательный компонент для загрузки и отображения модели
 */
export function MerchModel({ 
    url, 
    color = "#ffffff", 
    textureUrl, 
    zone = 'front',
    decalScale = 1,
    decalOffset = [0, 0],
    decalRotation = 0
}: { 
    url: string; 
    color?: string; 
    textureUrl?: string | null;
    zone?: 'front' | 'back' | 'top';
    decalScale?: number;
    decalOffset?: [number, number];
    decalRotation?: number;
}) {
    const { scene } = useGLTF(url);
    const modelRef = useRef<THREE.Group>(null);
    
    // Поиск основного меша (самого большого)
    const mainMesh = useMemo(() => {
        let bestMesh: THREE.Mesh | null = null;
        let maxVolume = 0;

        scene.traverse((child: THREE.Object3D) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                const name = mesh.name.toLowerCase();
                if (name.includes('body') || name.includes('chest') || name.includes('shirt') || name.includes('seat')) {
                    bestMesh = mesh;
                    return;
                }

                if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
                const box = mesh.geometry.boundingBox!;
                const volume = (box.max.x - box.min.x) * (box.max.y - box.min.y) * (box.max.z - box.min.z);
                
                if (volume > maxVolume) {
                    maxVolume = volume;
                    bestMesh = mesh;
                }
            }
        });
        return bestMesh;
    }, [scene]);

    // Расчет позиции декали в зависимости от зоны
    const decalParams = useMemo(() => {
        if (!mainMesh) return { position: [0, 0.4, 0.5], rotation: [0, 0, 0], scale: [0.3, 0.3, 0.3] };
        
        const mesh = mainMesh as THREE.Mesh;
        if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
        const box = mesh.geometry.boundingBox!;
        const height = box.max.y - box.min.y;
        const center = new THREE.Vector3();
        box.getCenter(center);

        const baseScale = 0.3 * decalScale;
        const [offX, offY] = decalOffset;

        if (zone === 'back') {
            return {
                position: [center.x + offX, box.min.y + height * 0.7 + offY, box.min.z - 0.01],
                rotation: [0, Math.PI, decalRotation] as [number, number, number],
                scale: [baseScale, baseScale, baseScale] as [number, number, number]
            };
        }
        
        if (zone === 'top') {
            return {
                position: [center.x + offX, box.max.y + 0.01, center.z + offY], 
                rotation: [-Math.PI / 2, 0, decalRotation] as [number, number, number],
                scale: [baseScale, baseScale, baseScale] as [number, number, number]
            };
        }

        return {
            position: [center.x + offX, box.min.y + height * 0.7 + offY, box.max.z + 0.01], 
            rotation: [0, 0, decalRotation] as [number, number, number],
            scale: [baseScale, baseScale, baseScale] as [number, number, number]
        };
    }, [mainMesh, zone, decalScale, decalOffset, decalRotation]);

    // Применение цвета и материалов
    useEffect(() => {
        if (!scene) return;
        
        const materialsToDispose: THREE.Material[] = [];
        
        scene.traverse((child: THREE.Object3D) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                if (mesh.material) {
                    // Dispose of the previous material before assigning a new clone
                    const oldMaterial = mesh.material;
                    materialsToDispose.push(oldMaterial as THREE.Material);
                    
                    const newMaterial = (oldMaterial as THREE.Material).clone();
                    (newMaterial as THREE.MeshStandardMaterial).color.set(color);
                    (newMaterial as THREE.MeshStandardMaterial).roughness = 0.7;
                    (newMaterial as THREE.MeshStandardMaterial).metalness = 0.2;
                    mesh.material = newMaterial;
                }
            }
        });

        return () => {
            // Cleanup: Dispose of the cloned materials when effect re-runs or component unmounts
            materialsToDispose.forEach(material => {
                if (material && typeof material.dispose === 'function') {
                    material.dispose();
                }
            });
        };
    }, [scene, color]);

    return (
        <group ref={modelRef} dispose={null}>
            <primitive object={scene} scale={1.5} position={[0, -0.2, 0]} />
            
            {/* Проецируем логотип или гид внутрь основного меша через портал */}
            {mainMesh && (
                <>
                    {textureUrl ? (
                        <Suspense fallback={null}>
                            {createPortal(
                                <LogoDecal url={textureUrl} position={decalParams.position as [number, number, number]} rotation={decalParams.rotation as [number, number, number]} scale={decalParams.scale as [number, number, number]} />,
                                mainMesh
                            )}
                        </Suspense>
                    ) : (
                        <Suspense fallback={null}>
                            {createPortal(
                                <PlacementGuide position={decalParams.position as [number, number, number]} rotation={decalParams.rotation as [number, number, number]} zoneLabel={zone} />,
                                mainMesh
                            )}
                        </Suspense>
                    )}
                </>
            )}
        </group>
    );
}
