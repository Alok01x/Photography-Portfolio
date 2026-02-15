'use client';

import { motion } from 'framer-motion';

interface SectionBackgroundProps {
    children: React.ReactNode;
    className?: string;
}

export default function SectionBackground({ children, className = '' }: SectionBackgroundProps) {
    return (
        <div className={`relative min-h-screen w-full overflow-hidden bg-background transition-colors duration-1000 ${className}`}>
            {/* Animated Mesh Blobs - Optimized for Mobile */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden transition-opacity duration-1000" style={{ opacity: 'var(--blob-opacity, 0.1)' }}>
                {/* Blob 1 */}
                <motion.div
                    animate={{
                        x: [0, 100, -50, 0],
                        y: [0, -150, 100, 0],
                        scale: [1, 1.2, 0.9, 1],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    // Optimization: Use simpler blur and shadow on mobile, disable animation logic if needed
                    className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full blur-[60px] md:blur-[120px] transition-colors duration-1000 shadow-[0_0_100px_rgba(var(--blob-1),0.1)] md:shadow-[0_0_200px_rgba(var(--blob-1),0.2)]"
                    style={{
                        backgroundColor: 'rgb(var(--blob-1))',
                        // Disable heavy animation on mobile to save CPU
                        animation: 'none'
                    }}
                />

                {/* Blob 2 */}
                <motion.div
                    animate={{
                        x: [0, -120, 80, 0],
                        y: [0, 100, -120, 0],
                        scale: [1, 0.8, 1.1, 1],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full blur-[60px] md:blur-[120px] transition-colors duration-1000 shadow-[0_0_100px_rgba(var(--blob-2),0.1)] md:shadow-[0_0_200px_rgba(var(--blob-2),0.2)]"
                    style={{ backgroundColor: 'rgb(var(--blob-2))' }}
                />

                {/* Blob 3 */}
                <motion.div
                    animate={{
                        x: [0, 50, -80, 0],
                        y: [0, 120, 50, 0],
                        scale: [1, 1.1, 0.9, 1],
                    }}
                    transition={{
                        duration: 18,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute -bottom-[10%] left-[20%] w-[45%] h-[45%] rounded-full blur-[60px] md:blur-[120px] transition-colors duration-1000 shadow-[0_0_100px_rgba(var(--blob-3),0.1)] md:shadow-[0_0_200px_rgba(var(--blob-3),0.2)]"
                    style={{ backgroundColor: 'rgb(var(--blob-3))' }}
                />
            </div>

            {/* Noise Texture Overlay */}
            <div className="absolute inset-0 z-1 pointer-events-none opacity-[0.02] md:opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

            {/* Content */}
            <div className="relative z-10 w-full h-full">
                {children}
            </div>
        </div>
    );
}
