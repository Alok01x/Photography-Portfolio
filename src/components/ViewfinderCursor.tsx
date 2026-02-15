'use client';

import { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

export default function ViewfinderCursor() {
    const [isVisible, setIsVisible] = useState(false);

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Softer spring for a more "fluid/ghostly" lag effect
    const springConfig = { damping: 30, stiffness: 200 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
            if (!isVisible) setIsVisible(true);
        };

        const handleMouseLeave = () => setIsVisible(false);
        const handleMouseEnter = () => setIsVisible(true);

        window.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseleave', handleMouseLeave);
        document.addEventListener('mouseenter', handleMouseEnter);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseleave', handleMouseLeave);
            document.removeEventListener('mouseenter', handleMouseEnter);
        };
    }, [isVisible, mouseX, mouseY]);

    if (!isVisible) return null;

    return (
        <motion.div
            className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-[9999] flex items-center justify-center mix-blend-screen opacity-50"
            style={{
                x: springX,
                y: springY,
                translateX: '-50%',
                translateY: '-50%',
            }}
        >
            {/* Fluid Trail Glow */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="w-full h-full bg-cyan-400/20 rounded-full blur-xl border border-cyan-400/30"
            />

            {/* Minimal focus dot shadow */}
            <div className="absolute w-1 h-1 bg-cyan-400/40 rounded-full blur-[1px]" />
        </motion.div>
    );
}
