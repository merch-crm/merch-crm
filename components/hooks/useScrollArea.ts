import { useState, useCallback, useEffect, RefObject } from "react";

export function useScrollFade(
    orientation: "vertical" | "horizontal" | "both",
    viewportRef: RefObject<HTMLDivElement | null>
) {
    const [showTopFade, setShowTopFade] = useState(false);
    const [showBottomFade, setShowBottomFade] = useState(false);
    const [showLeftFade, setShowLeftFade] = useState(false);
    const [showRightFade, setShowRightFade] = useState(false);

    const checkScroll = useCallback(() => {
        const viewport = viewportRef.current;
        if (!viewport) return;

        const { scrollTop, scrollLeft, scrollHeight, scrollWidth, clientHeight, clientWidth } = viewport;

        if (orientation === "vertical" || orientation === "both") {
            setShowTopFade(scrollTop > 0);
            setShowBottomFade(scrollTop < scrollHeight - clientHeight - 1);
        }

        if (orientation === "horizontal" || orientation === "both") {
            setShowLeftFade(scrollLeft > 0);
            setShowRightFade(scrollLeft < scrollWidth - clientWidth - 1);
        }
    }, [orientation, viewportRef]);

    useEffect(() => {
        const viewport = viewportRef.current;
        if (!viewport) return;

        checkScroll();
        viewport.addEventListener("scroll", checkScroll);
        window.addEventListener("resize", checkScroll);

        return () => {
            viewport.removeEventListener("scroll", checkScroll);
            window.removeEventListener("resize", checkScroll);
        };
    }, [checkScroll, viewportRef]);

    return { showTopFade, showBottomFade, showLeftFade, showRightFade, checkScroll };
}

export function useHorizontalScroll(viewportRef: RefObject<HTMLDivElement | null>) {
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const checkScroll = useCallback(() => {
        const viewport = viewportRef.current;
        if (!viewport) return;

        const { scrollLeft, scrollWidth, clientWidth } = viewport;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }, [viewportRef]);

    useEffect(() => {
        const viewport = viewportRef.current;
        if (!viewport) return;

        checkScroll();
        viewport.addEventListener("scroll", checkScroll);
        window.addEventListener("resize", checkScroll);

        return () => {
            viewport.removeEventListener("scroll", checkScroll);
            window.removeEventListener("resize", checkScroll);
        };
    }, [checkScroll, viewportRef]);

    const scroll = (direction: "left" | "right") => {
        const viewport = viewportRef.current;
        if (!viewport) return;

        const scrollAmount = viewport.clientWidth * 0.8;
        viewport.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth",
        });
    };

    return { canScrollLeft, canScrollRight, scroll, checkScroll };
}

export function useAutoScroll(
    viewportRef: RefObject<HTMLDivElement | null>,
    autoScroll: boolean,
    children: React.ReactNode
) {
    const [isAtBottom, setIsAtBottom] = useState(true);
    const [showButton, setShowButton] = useState(false);

    const scrollToBottom = useCallback(() => {
        const viewport = viewportRef.current;
        if (!viewport) return;
        viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
    }, [viewportRef]);

    const checkIfAtBottom = useCallback(() => {
        const viewport = viewportRef.current;
        if (!viewport) return;

        const { scrollTop, scrollHeight, clientHeight } = viewport;
        const isBottom = scrollTop >= scrollHeight - clientHeight - 50; // 50px threshold
        setIsAtBottom(isBottom);
        setShowButton(!isBottom);
    }, [viewportRef]);

    useEffect(() => {
        const viewport = viewportRef.current;
        if (!viewport) return;

        viewport.addEventListener("scroll", checkIfAtBottom);
        return () => viewport.removeEventListener("scroll", checkIfAtBottom);
    }, [checkIfAtBottom, viewportRef]);

    useEffect(() => {
        if (autoScroll && isAtBottom) {
            const viewport = viewportRef.current;
            if (viewport) {
                viewport.scrollTop = viewport.scrollHeight;
            }
        }
    }, [children, autoScroll, isAtBottom, viewportRef]);

    return { showButton, scrollToBottom };
}
