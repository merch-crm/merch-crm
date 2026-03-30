"use client";

import { Canvas, useFrame, createPortal, type RootState } from "@react-three/fiber";
import { 
    OrbitControls, 
    Stage, 
    useGLTF, 
    Environment,
    ContactShadows,
    Float,
    Decal,
    useTexture,
    Text
} from "@react-three/drei";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import React, { Suspense, useRef, useMemo, useEffect } from "react";
import * as THREE from "three";


// Компонент для плавного управления камерой при смене зон
function CameraController({ zone, controlsRef }: { zone: 'front' | 'back' | 'top', controlsRef?: React.RefObject<React.ElementRef<typeof OrbitControls> | null> }) {
    const prevZone = useRef<string | null>(null);
    const isTransitioning = useRef(false);

    useEffect(() => {
        if (prevZone.current !== zone) {
            prevZone.current = zone;
            isTransitioning.current = true;
        }
    }, [zone]);

    useFrame((state: RootState) => {
        if (!isTransitioning.current) return;

        const step = 0.08; // Increased from 0.05 for snappier feel
        const targetPos = new THREE.Vector3(0, 0.5, 4);
        
        if (zone === 'back') targetPos.set(0, 0.5, -4);
        if (zone === 'top') targetPos.set(0, 4, 0.5);
        if (zone === 'front') targetPos.set(0, 0.5, 4);

        state.camera.position.lerp(targetPos, step);
        
        if (controlsRef?.current) {
            controlsRef.current.target.lerp(new THREE.Vector3(0, 0, 0), step);
            controlsRef.current.update();
        } else {
            state.camera.lookAt(0, 0, 0);
        }

        if (state.camera.position.distanceTo(targetPos) < 0.02) {
            isTransitioning.current = false;
        }
    });
    return null;
}

// Улучшенный компонент-индикатор зоны размещения (Holographic Style)
function PlacementGuide({ position, rotation, zoneLabel }: { position: [number, number, number], rotation: [number, number, number], zoneLabel: string }) {
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
                    font="/fonts/Manrope-Bold.ttf" // Correct path to existing asset
                >
                    {`PLACEMENT ZONE: ${zoneLabel.toUpperCase()}`}
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

// Вспомогательный компонент для загрузки и отображения модели
function Model({ 
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

    useEffect(() => {
        if (!scene) return;
        scene.traverse((child: THREE.Object3D) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                if (mesh.material) {
                    mesh.material = (mesh.material as THREE.Material).clone();
                    (mesh.material as THREE.MeshStandardMaterial).color.set(color);
                    (mesh.material as THREE.MeshStandardMaterial).roughness = 0.7;
                    (mesh.material as THREE.MeshStandardMaterial).metalness = 0.2;
                }
            }
        });
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
                                <LogoDecal 
                                    url={textureUrl} 
                                    position={decalParams.position as [number, number, number]}
                                    rotation={decalParams.rotation as [number, number, number]}
                                    scale={decalParams.scale as [number, number, number]}
                                />,
                                mainMesh
                            )}
                        </Suspense>
                    ) : (
                        <Suspense fallback={null}>
                            {createPortal(
                                <PlacementGuide 
                                    position={decalParams.position as [number, number, number]} 
                                    rotation={decalParams.rotation as [number, number, number]} 
                                    zoneLabel={zone}
                                />,
                                mainMesh
                            )}
                        </Suspense>
                    )}
                </>
            )}
        </group>
    );
}

// Компонент логотипа (проецируется внутрь меша)
function LogoDecal({ url, position, rotation, scale }: { 
    url: string; 
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
}) {
    // Hooks must be at the top level
    const texture = useTexture(url || "/logo.png"); // Fallback to avoid hook issues, though url should be present
    
    useEffect(() => {
        if (texture) {
            texture.anisotropy = 16;
            texture.needsUpdate = true;
        }
    }, [texture]);

    if (!url) return null;

    return (
        <Decal 
            position={position} 
            rotation={rotation} 
            scale={scale} 
        >
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

// Удален старый DecalLogo, используем LogoDecal выше

// Компонент для отлова ошибок 3D
class ThreeErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: string }> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, error: "" };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error: error.message };
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-md text-center p-6 z-50">
                    <div className="max-w-sm bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-3xl">
                        <div className="text-red-500 mb-4 text-3xl">⚠️</div>
                        <h3 className="text-white text-lg font-bold mb-2">Ошибка 3D визуализации</h3>
                        <p className="text-slate-400 text-xs leading-relaxed mb-6">
                            {this.state.error.includes("drei-assets") 
                                ? "Не удалось загрузить компоненты окружения. Проверьте интернет-соединение." 
                                : this.state.error}
                        </p>
                        <div className="flex flex-col gap-2">
                            <button 
                                type="button"
                                onClick={() => window.location.reload()}
                                className="w-full px-6 py-3 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition-colors"
                            >
                                Перезагрузить страницу
                            </button>
                            <button 
                                type="button"
                                onClick={() => this.setState({ hasError: false })}
                                className="w-full px-6 py-3 bg-white/5 text-slate-400 rounded-xl text-xs hover:bg-white/10 transition-colors"
                            >
                                Попробовать снова
                            </button>
                        </div>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

// Error Boundary already has React import context check

interface ThreeViewerProps {
    modelUrl?: string;
    itemColor?: string;
    logoUrl?: string | null;
    placementZone?: 'front' | 'back' | 'top';
    decalScale?: number;
    decalOffset?: [number, number];
    decalRotation?: number;
    backgroundColor?: string;
}

export default function ThreeViewer({ 
    modelUrl = "/merch_tshirt_v1.glb",
    itemColor = "#ffffff",
    logoUrl = null,
    placementZone = 'front',
    decalScale = 1,
    decalOffset = [0, 0],
    decalRotation = 0,
    backgroundColor = "#020617"
}: ThreeViewerProps) {
    const controlsRef = useRef<React.ElementRef<typeof OrbitControls>>(null);

    const resetView = () => {
        if (controlsRef.current) {
            controlsRef.current.reset();
        }
    };

    return (
        <div className="w-full h-[500px] rounded-2xl bg-slate-950 overflow-hidden relative border border-slate-800 shadow-2xl group/viewer">
            <ThreeErrorBoundary>
                <Suspense fallback={
                    <div className="absolute inset-0 flex items-center justify-center text-white flex-col gap-3">
                        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                        <span className="text-xs text-slate-500">Загрузка 3D сцены...</span>
                    </div>
                }>
                    <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0.5, 4], fov: 45 }}>
                        <color attach="background" args={[backgroundColor]} />
                        <CameraController zone={placementZone} controlsRef={controlsRef} />
                        <ambientLight intensity={0.7} />
                        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} shadow-mapSize={[1024, 1024]} castShadow />
                        
                        <Stage environment="city" intensity={0.6} adjustCamera={false}>
                            <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
                                <Model 
                                    url={modelUrl} 
                                    color={itemColor} 
                                    textureUrl={logoUrl} 
                                    zone={placementZone}
                                    decalScale={decalScale}
                                    decalOffset={decalOffset}
                                    decalRotation={decalRotation}
                                />
                            </Float>
                        </Stage>

                        <OrbitControls 
                            ref={controlsRef}
                            enablePan={false} 
                            enableZoom={true} 
                            minPolarAngle={Math.PI / 4} 
                            maxPolarAngle={Math.PI / 1.5}
                            makeDefault
                        />
                        
                        <Suspense fallback={null}>
                        <Environment preset="city" blur={0.5} />
                        </Suspense>
                        <ContactShadows position={[0, -0.8, 0]} opacity={0.4} scale={10} blur={2.5} far={4} />
                    </Canvas>
                </Suspense>
            </ThreeErrorBoundary>

            {/* Контролы и статус */}
            <div className="absolute top-4 right-4 flex gap-2">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={resetView}
                    className="h-7 bg-black/40 backdrop-blur-md border border-white/10 text-white/70 hover:text-white px-2 rounded-full text-xs tracking-wider gap-1.5"
                >
                    <RefreshCcw className="w-3 h-3" />
                    Сброс вида
                </Button>
                <div className="px-3 py-1 bg-primary/20 backdrop-blur-md rounded-full border border-primary/30 text-xs text-primary font-bold flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                    Интерактив
                </div>
            </div>

            {/* Тултип управления */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/5 backdrop-blur-md rounded-full border border-white/10 text-xs text-white/40 tracking-tighter flex gap-3 transition-opacity group-hover/viewer:opacity-100 opacity-40">
                <span>ЛКМ: Вращение</span>
                <span className="opacity-20">|</span>
                <span>Колесо: Зум</span>
            </div>
        </div>
    );
}

// Предзагрузка основной модели
// useGLTF.preload("/merch_tshirt_v1.glb");

