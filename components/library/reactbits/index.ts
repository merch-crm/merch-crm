// ==============================================
// React Bits — Component Library
// Path: components/library/reactbits/index.ts
// Full inventory: 128 components (23 text + 29 animations + 36 components + 40 backgrounds)
// Implemented: 14 components
// Install remaining: npx shadcn@latest add @react-bits/<Name>-TS-TW
// Dependencies: motion, gsap (for split-text), ogl (for aurora bg)
// ==============================================

export { cn } from "./utils/cn";

// ═══════════════ TEXT ANIMATIONS (23) ═══════════════
export { BlurText } from "./text-animations/blur-text";
export { ShinyText } from "./text-animations/shiny-text";
export { DecryptedText } from "./text-animations/decrypted-text";
export { GradientText } from "./text-animations/gradient-text";
export { CountUp } from "./text-animations/count-up";
export { RotatingText } from "./text-animations/rotating-text";
export { GlitchText } from "./text-animations/glitch-text";
// export { SplitText } from "./text-animations/split-text";           // needs gsap
// export { CircularText } from "./text-animations/circular-text";
// export { TextType } from "./text-animations/text-type";
// export { Shuffle } from "./text-animations/shuffle";
// export { TextPressure } from "./text-animations/text-pressure";
// export { CurvedLoop } from "./text-animations/curved-loop";
// export { FuzzyText } from "./text-animations/fuzzy-text";
// export { FallingText } from "./text-animations/falling-text";
// export { TextCursor } from "./text-animations/text-cursor";
// export { TrueFocus } from "./text-animations/true-focus";
// export { ScrollFloat } from "./text-animations/scroll-float";
// export { ScrollReveal } from "./text-animations/scroll-reveal";
// export { AsciiText } from "./text-animations/ascii-text";
// export { ScrambledText } from "./text-animations/scrambled-text";
// export { ScrollVelocity } from "./text-animations/scroll-velocity";
// export { VariableProximity } from "./text-animations/variable-proximity";

// ═══════════════ ANIMATIONS (29) ═══════════════
export { StarBorder } from "./animations/star-border";
export { ClickSpark } from "./animations/click-spark";
// export { AnimatedContent } from "./animations/animated-content";
// export { FadeContent } from "./animations/fade-content";
// export { ElectricBorder } from "./animations/electric-border";
// export { OrbitImages } from "./animations/orbit-images";
// export { PixelTransition } from "./animations/pixel-transition";
// export { GlareHover } from "./animations/glare-hover";
// export { Antigravity } from "./animations/antigravity";
// export { LogoLoop } from "./animations/logo-loop";
// export { TargetCursor } from "./animations/target-cursor";
// export { MagicRings } from "./animations/magic-rings";
// export { LaserFlow } from "./animations/laser-flow";
// export { MagnetLines } from "./animations/magnet-lines";
// export { GhostCursor } from "./animations/ghost-cursor";
// export { GradualBlur } from "./animations/gradual-blur";
// export { Magnet } from "./animations/magnet";
// export { StickerPeel } from "./animations/sticker-peel";
// export { PixelTrail } from "./animations/pixel-trail";
// export { Cubes } from "./animations/cubes";
// export { MetallicPaint } from "./animations/metallic-paint";
// export { Noise } from "./animations/noise";
// export { ShapeBlur } from "./animations/shape-blur";
// export { Crosshair } from "./animations/crosshair";
// export { ImageTrail } from "./animations/image-trail";
// export { Ribbons } from "./animations/ribbons";
// export { SplashCursor } from "./animations/splash-cursor";
// export { MetaBalls } from "./animations/meta-balls";
// export { BlobCursor } from "./animations/blob-cursor";

// ═══════════════ COMPONENTS (36) ═══════════════
export { TiltedCard } from "./components/tilted-card";
export { Dock } from "./components/dock";
export { Stepper } from "./components/stepper";
export { Counter } from "./components/counter";
export { SpotlightCard } from "./components/spotlight-card";
// export { AnimatedList } from "./components/animated-list";
// export { ScrollStack } from "./components/scroll-stack";
// export { BubbleMenu } from "./components/bubble-menu";
// export { MagicBento } from "./components/magic-bento";
// export { CircularGallery } from "./components/circular-gallery";
// export { ReflectiveCard } from "./components/reflective-card";
// export { CardNav } from "./components/card-nav";
// export { Stack } from "./components/stack";
// export { FluidGlass } from "./components/fluid-glass";
// export { PillNav } from "./components/pill-nav";
// export { Masonry } from "./components/masonry";
// export { GlassSurface } from "./components/glass-surface";
// export { DomeGallery } from "./components/dome-gallery";
// export { ChromaGrid } from "./components/chroma-grid";
// export { Folder } from "./components/folder";
// export { StaggeredMenu } from "./components/staggered-menu";
// export { ModelViewer } from "./components/model-viewer";
// export { Lanyard } from "./components/lanyard";
// export { ProfileCard } from "./components/profile-card";
// export { GooeyNav } from "./components/gooey-nav";
// export { PixelCard } from "./components/pixel-card";
// export { Carousel } from "./components/carousel";
// export { BorderGlow } from "./components/border-glow";
// export { FlyingPosters } from "./components/flying-posters";
// export { CardSwap } from "./components/card-swap";
// export { GlassIcons } from "./components/glass-icons";
// export { DecayCard } from "./components/decay-card";
// export { FlowingMenu } from "./components/flowing-menu";
// export { ElasticSlider } from "./components/elastic-slider";
// export { InfiniteMenu } from "./components/infinite-menu";
// export { BounceCards } from "./components/bounce-cards";

// ═══════════════ BACKGROUNDS (40) ═══════════════
// export { LiquidEther } from "./backgrounds/liquid-ether";
// export { Prism } from "./backgrounds/prism";
// export { DarkVeil } from "./backgrounds/dark-veil";
// export { LightPillar } from "./backgrounds/light-pillar";
// export { Silk } from "./backgrounds/silk";
// export { FloatingLines } from "./backgrounds/floating-lines";
// export { LightRays } from "./backgrounds/light-rays";
// export { PixelBlast } from "./backgrounds/pixel-blast";
// export { ColorBends } from "./backgrounds/color-bends";
// export { EvilEye } from "./backgrounds/evil-eye";
// export { LineWaves } from "./backgrounds/line-waves";
// export { Radar } from "./backgrounds/radar";
// export { SoftAurora } from "./backgrounds/soft-aurora";
// export { Aurora } from "./backgrounds/aurora";
// export { Plasma } from "./backgrounds/plasma";
// export { Particles } from "./backgrounds/particles";
// export { GradientBlinds } from "./backgrounds/gradient-blinds";
// export { Grainient } from "./backgrounds/grainient";
// export { GridScan } from "./backgrounds/grid-scan";
// export { Beams } from "./backgrounds/beams";
// export { PixelSnow } from "./backgrounds/pixel-snow";
// export { Lightning } from "./backgrounds/lightning";
// export { PrismaticBurst } from "./backgrounds/prismatic-burst";
// export { Galaxy } from "./backgrounds/galaxy";
// export { Dither } from "./backgrounds/dither";
// export { FaultyTerminal } from "./backgrounds/faulty-terminal";
// export { RippleGrid } from "./backgrounds/ripple-grid";
// export { DotGrid } from "./backgrounds/dot-grid";
// export { Threads } from "./backgrounds/threads";
// export { Hyperspeed } from "./backgrounds/hyperspeed";
// export { Iridescence } from "./backgrounds/iridescence";
// export { Waves } from "./backgrounds/waves";
// export { GridDistortion } from "./backgrounds/grid-distortion";
// export { Ballpit } from "./backgrounds/ballpit";
// export { Orb } from "./backgrounds/orb";
// export { LetterGlitch } from "./backgrounds/letter-glitch";
// export { GridMotion } from "./backgrounds/grid-motion";
// export { ShapeGrid } from "./backgrounds/shape-grid";
// export { LiquidChrome } from "./backgrounds/liquid-chrome";
// export { Balatro } from "./backgrounds/balatro";
