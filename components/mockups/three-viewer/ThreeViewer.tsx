"use client";

import React, { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Stage, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";

import { Loader } from "./Loader";
import { ThreeErrorBoundary } from "./ThreeErrorBoundary";
import { ReactBitsPhysicsWrapper } from "./ReactBitsPhysicsWrapper";
import { MerchModel } from "./MerchModel";

interface ThreeViewerProps {
    modelUrl?: string;
    itemColor?: string;
    logoUrl?: string | null;
    placementZone?: 'front' | 'back' | 'top';
    decalScale?: number;
    decalOffset?: [number, number];
    decalRotation?: number;
    backgroundColor?: string;
    autoRotate?: boolean;
}

export function ThreeViewer({ 
    modelUrl = "/merch_tshirt_v1.glb",
    itemColor = "#ffffff",
    logoUrl = null,
    placementZone = 'front',
    decalScale = 1,
    decalOffset = [0, 0],
    decalRotation = 0,
    backgroundColor = "#020617",
    autoRotate = false
}: ThreeViewerProps) {
    const [resetKey, setResetKey] = useState(0);

    return (
        <div className="w-full h-[500px] rounded-2xl bg-slate-950 overflow-hidden relative border border-slate-800 shadow-2xl group/viewer isolate">
            <div className="absolute inset-0 bg-radial-gradient from-white/5 to-transparent pointer-events-none z-0" />
            
            <ThreeErrorBoundary>
                <Canvas 
                    key={resetKey}
                    shadows 
                    dpr={[1, 2]} 
                    camera={{ position: [0, 0.5, 4], fov: 45 }}
                    gl={{ preserveDrawingBuffer: true, toneMapping: THREE.ACESFilmicToneMapping }}
                    style={{ touchAction: 'pan-y pinch-zoom', zIndex: 1 }}
                >
                    <color attach="background" args={[backgroundColor]} />
                    <ambientLight intensity={0.7} />
                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} shadow-mapSize={[1024, 1024]} castShadow />
                    
                    <ReactBitsPhysicsWrapper zone={placementZone} autoRotate={autoRotate}>
                        <Stage environment="city" intensity={0.6} adjustCamera={false}>
                            <MerchModel 
                                url={modelUrl} 
                                color={itemColor} 
                                textureUrl={logoUrl} 
                                zone={placementZone}
                                decalScale={decalScale}
                                decalOffset={decalOffset}
                                decalRotation={decalRotation}
                            />
                        </Stage>
                    </ReactBitsPhysicsWrapper>

                    <Suspense fallback={<Loader />}>
                        <Environment preset="city" blur={0.5} />
                    </Suspense>
                    <ContactShadows position={[0, -0.8, 0]} opacity={0.4} scale={10} blur={2.5} far={4} />
                </Canvas>
            </ThreeErrorBoundary>

            {/* Контролы и статус */}
            <div className="absolute top-4 right-4 flex gap-2 z-10">
                <Button 
                    type="button"
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setResetKey(k => k + 1)}
                    className="h-7 bg-black/40 backdrop-blur-md border border-white/10 text-white/70 hover:text-white px-2 rounded-full text-xs gap-1.5"
                >
                    <RefreshCcw className="w-3 h-3" />
                    Сброс вида
                </Button>
                <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-xs text-white font-bold flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-blue-400 animate-pulse" />
                    Interactive 3D
                </div>
            </div>

            {/* Тултип управления */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 backdrop-blur-xl rounded-full border border-white/10 text-[11px] font-bold text-white/50 flex gap-3 transition-all transform origin-bottom hover:scale-105 pointer-events-none">
                <span>Drag to Rotate</span>
            </div>
        </div>
    );
}
