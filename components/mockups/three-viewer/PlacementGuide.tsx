"use client";

import React, { useRef } from "react";
import { useFrame, type RootState } from "@react-three/fiber";
import { Float, Text } from "@react-three/drei";
import * as THREE from "three";

export function PlacementGuide({ 
    position, 
    rotation, 
    zoneLabel 
}: { 
    position: [number, number, number], 
    rotation: [number, number, number], 
    zoneLabel: string 
}) {
    const ring1Ref = useRef<THREE.Mesh>(null);
    const ring2Ref = useRef<THREE.Mesh>(null);
    const groupRef = useRef<THREE.Group>(null);
    
    useFrame((state: RootState) => {
        const time = state.clock.elapsedTime;
        if (ring1Ref.current) {
            const s = 1 + Math.sin(time * 3) * 0.05;
            ring1Ref.current.scale.set(s, s, s);
            (ring1Ref.current.material as THREE.MeshBasicMaterial).opacity = 0.3 + Math.sin(time * 3) * 0.1;
        }
        if (ring2Ref.current) {
            const s = 0.8 + Math.cos(time * 2) * 0.1;
            ring2Ref.current.scale.set(s, s, s);
            ring2Ref.current.rotation.z = time * 0.5;
            (ring2Ref.current.material as THREE.MeshBasicMaterial).opacity = 0.2 + Math.cos(time * 2) * 0.1;
        }
        if (groupRef.current) {
            groupRef.current.position.y += Math.sin(time * 2) * 0.0005;
        }
    });

    return (
        <group ref={groupRef} position={position} rotation={rotation}>
            {/* Основное кольцо */}
            <mesh ref={ring1Ref}>
                <ringGeometry args={[0.22, 0.24, 64]} />
                <meshBasicMaterial color="#60a5fa" transparent opacity={0.4} side={THREE.DoubleSide} />
            </mesh>
            
            {/* Внутреннее анимированное кольцо */}
            <mesh ref={ring2Ref}>
                <ringGeometry args={[0.15, 0.16, 4, 1, 0, Math.PI * 1.5]} />
                <meshBasicMaterial color="#3b82f6" transparent opacity={0.2} side={THREE.DoubleSide} />
            </mesh>

            {/* Текстовая метка */}
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                <Text
                    position={[0, 0.35, 0]}
                    fontSize={0.06}
                    color="#60a5fa"
                    fillOpacity={0.8}
                    anchorX="center"
                    anchorY="middle"
                    font="/fonts/Manrope-Bold.ttf"
                >
                    {`ZONE: ${zoneLabel.toUpperCase()}`}
                </Text>
            </Float>

            {/* Лазерные перекрестия */}
            <mesh rotation={[0, 0, 0]}>
                <planeGeometry args={[0.5, 0.005]} />
                <meshBasicMaterial color="#60a5fa" transparent opacity={0.2} />
            </mesh>
            <mesh rotation={[0, 0, Math.PI / 2]}>
                <planeGeometry args={[0.5, 0.005]} />
                <meshBasicMaterial color="#60a5fa" transparent opacity={0.2} />
            </mesh>
        </group>
    );
}
