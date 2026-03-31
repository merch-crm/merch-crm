import { useState, useRef, useEffect } from "react";

export function useGalleryLightbox(imagesCount: number) {
    const [fullscreen, setFullscreen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [imageZoomed, setImageZoomed] = useState(false);
    const lightboxRef = useRef<HTMLDivElement>(null);

    const openFullscreen = (index: number) => {
        setCurrentIndex(index >= 0 && index < imagesCount ? index : 0);
        setImageZoomed(false);
        setFullscreen(true);
    };

    const nextImage = () => {
        setCurrentIndex(prev => (prev + 1) % imagesCount);
        setImageZoomed(false);
    };

    const prevImage = () => {
        setCurrentIndex(prev => (prev - 1 + imagesCount) % imagesCount);
        setImageZoomed(false);
    };

    useEffect(() => {
        if (fullscreen && lightboxRef.current) {
            lightboxRef.current.focus();
        }
    }, [fullscreen]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowLeft") {
            e.preventDefault();
            prevImage();
        } else if (e.key === "ArrowRight") {
            e.preventDefault();
            nextImage();
        } else if (e.key === "Escape") {
            e.preventDefault();
            setFullscreen(false);
        }
    };

    return {
        fullscreen,
        currentIndex,
        imageZoomed,
        lightboxRef,
        setFullscreen,
        setCurrentIndex,
        setImageZoomed,
        openFullscreen,
        nextImage,
        prevImage,
        handleKeyDown
    };
}
