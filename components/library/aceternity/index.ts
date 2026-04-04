// ==============================================
// Aceternity UI — Component Library
// Path: components/library/aceternity/index.ts
// Реализовано: 24 компонента
// Закомментировано: ~66 компонентов (шаблоны файлов)
// Dependencies: motion, simplex-noise, @tsparticles/*, clsx, tailwind-merge
// ==============================================

export { cn } from "./utils/cn";

// --- Cards & Containers (5) ---
export { CardContainer, CardBody, CardItem } from "./components/3d-card";
export { BentoGrid, BentoGridItem } from "./components/bento-grid";
export { HoverEffect, Card as HoverCard, CardTitle as HoverCardTitle, CardDescription as HoverCardDescription } from "./components/card-hover-effect";
export { WobbleCard } from "./components/wobble-card";

// --- Modals & Overlays (1) ---
export { Modal, ModalTrigger, ModalBody, ModalContent, ModalFooter, ModalProvider, useOutsideClick } from "./components/animated-modal";

// --- Navigation (2) ---
export { FloatingDock } from "./components/floating-dock";
export { Sidebar, SidebarBody, SidebarProvider, SidebarLink, DesktopSidebar, MobileSidebar } from "./components/sidebar";

// --- Text Effects (4) ---
export { TextGenerateEffect } from "./components/text-generate-effect";
export { FlipWords } from "./components/flip-words";
export { TypewriterEffect, TypewriterEffectSmooth } from "./components/typewriter-effect";
export { Highlight, HeroHighlight } from "./components/hero-highlight";

// --- Backgrounds (4) ---
export { WavyBackground } from "./components/wavy-background";
export { Spotlight } from "./components/spotlight-new";
export { AuroraBackground } from "./components/aurora-background";
export { SparklesCore } from "./components/sparkles";

// --- Buttons & Borders (3) ---
export { Button as MovingBorderButton, MovingBorder } from "./components/moving-border";
export { HoverBorderGradient } from "./components/hover-border-gradient";
export { GlowingEffect } from "./components/glowing-effect";

// --- Carousel & Lists (1) ---
export { InfiniteMovingCards } from "./components/infinite-moving-cards";

// --- Effects (1) ---
export { Meteors } from "./components/meteors";

// --- Loaders (1) ---
export { MultiStepLoader } from "./components/multi-step-loader";

// --- Forms (1) ---
export { FileUpload } from "./components/file-upload";
