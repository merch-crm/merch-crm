"use client";

import React, { useRef, useEffect } from "react";
import { useThree, useFrame, invalidate } from "@react-three/fiber";
import * as THREE from "three";
import { useIsTouch } from "./useIsTouch";

const ROTATE_SPEED = 0.005;
const INERTIA = 0.925;
const PARALLAX_MAG = 0.05;
const PARALLAX_EASE = 0.12;
const HOVER_MAG = (6 * Math.PI) / 180;
const HOVER_EASE = 0.15;

interface MerchPhysicsWrapperProps {
    children: React.ReactNode;
    enableMouseParallax?: boolean;
    enableHoverRotation?: boolean;
    enableManualRotation?: boolean;
    autoRotate?: boolean;
    autoRotateSpeed?: number;
    zone: 'front' | 'back' | 'top';
}

export function MerchPhysicsWrapper({ 
    children, 
    enableMouseParallax = true, 
    enableHoverRotation = true, 
    enableManualRotation = true,
    autoRotate = false,
    autoRotateSpeed = 0.35,
    zone
}: MerchPhysicsWrapperProps) {
    const outer = useRef<THREE.Group>(null!);
    const { gl } = useThree();
    const isTouch = useIsTouch();

    const vel = useRef({ x: 0, y: 0 });
    const tPar = useRef({ x: 0, y: 0 });
    const cPar = useRef({ x: 0, y: 0 });
    const tHov = useRef({ x: 0, y: 0 });
    const cHov = useRef({ x: 0, y: 0 });

    const targetHov = useRef({ x: 0, y: 0 });

    // Управление поворотом в зависимости от зоны
    useEffect(() => {
        if (zone === 'back') {
            targetHov.current = { x: 0, y: Math.PI };
        } else if (zone === 'top') {
            targetHov.current = { x: Math.PI / 4, y: 0 };
        } else {
            targetHov.current = { x: 0, y: 0 };
        }
    }, [zone]);

    // Обработка ручного вращения мышью/касанием
    useEffect(() => {
        if (!enableManualRotation || isTouch) return;
        const el = gl.domElement;
        let isDragging = false;
        let lx = 0, ly = 0;
        
        const down = (e: PointerEvent) => {
            if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
            isDragging = true;
            lx = e.clientX;
            ly = e.clientY;
            window.addEventListener('pointerup', up);
        };
        const move = (e: PointerEvent) => {
            if (!isDragging) return;
            const dx = e.clientX - lx;
            const dy = e.clientY - ly;
            lx = e.clientX;
            ly = e.clientY;
            
            // Apply immediately + add velocity for inertia
            outer.current.rotation.y += dx * ROTATE_SPEED;
            outer.current.rotation.x += dy * ROTATE_SPEED;
            vel.current = { x: dx * ROTATE_SPEED, y: dy * ROTATE_SPEED };
            invalidate();
        };
        const up = () => (isDragging = false);
        
        el.addEventListener('pointerdown', down);
        el.addEventListener('pointermove', move);
        
        return () => {
            el.removeEventListener('pointerdown', down);
            el.removeEventListener('pointermove', move);
            window.removeEventListener('pointerup', up);
        };
    }, [gl, enableManualRotation, isTouch]);

    // Обработка параллакса и легкого отклонения от наведения мыши
    useEffect(() => {
        if (isTouch) return;
        const mm = (e: PointerEvent) => {
            if (e.pointerType !== 'mouse') return;
            const nx = (e.clientX / window.innerWidth) * 2 - 1;
            const ny = (e.clientY / window.innerHeight) * 2 - 1;
            
            if (enableMouseParallax) {
                tPar.current = { x: -nx * PARALLAX_MAG, y: -ny * PARALLAX_MAG };
            }
            if (enableHoverRotation) {
                tHov.current = { x: ny * HOVER_MAG, y: nx * HOVER_MAG };
            }
            invalidate();
        };
        window.addEventListener('pointermove', mm);
        return () => window.removeEventListener('pointermove', mm);
    }, [enableMouseParallax, enableHoverRotation, isTouch]);

    // Физический луп
    useFrame((_, dt) => {
        let isRedrawNeeded = false;
        
        // Parallax
        cPar.current.x += (tPar.current.x - cPar.current.x) * PARALLAX_EASE;
        cPar.current.y += (tPar.current.y - cPar.current.y) * PARALLAX_EASE;
        
        // Hover
        cHov.current.x += (tHov.current.x - cHov.current.x) * HOVER_EASE;
        cHov.current.y += (tHov.current.y - cHov.current.y) * HOVER_EASE;

        if (outer.current) {
            // Zone tracking Lerp (smooth return to target zone)
            if (vel.current.x < 1e-3 && vel.current.y < 1e-3) {
                outer.current.rotation.x = THREE.MathUtils.lerp(outer.current.rotation.x, targetHov.current.x + cHov.current.x, 0.05);
                outer.current.rotation.y = THREE.MathUtils.lerp(outer.current.rotation.y, targetHov.current.y + cHov.current.y, 0.05);    
            } else {
                // Apply velocity
                outer.current.rotation.y += vel.current.x;
                outer.current.rotation.x += vel.current.y;
            }

            // Decay velocity
            vel.current.x *= INERTIA;
            vel.current.y *= INERTIA;

            // Apply Parallax translation
            outer.current.position.x = cPar.current.x;
            outer.current.position.y = cPar.current.y;

            if (autoRotate) {
                outer.current.rotation.y += autoRotateSpeed * dt;
                isRedrawNeeded = true;
            }
        }

        if (Math.abs(vel.current.x) > 1e-4 || Math.abs(vel.current.y) > 1e-4) isRedrawNeeded = true;
        if (Math.abs(cPar.current.x - tPar.current.x) > 1e-4 || Math.abs(cPar.current.y - tPar.current.y) > 1e-4) isRedrawNeeded = true;
        
        if (isRedrawNeeded) invalidate();
    });

    return (
        <group ref={outer}>
            {children}
        </group>
    );
}
