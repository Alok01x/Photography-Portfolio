'use client';

import { motion } from 'framer-motion';

interface TransitionProps {
    children: React.ReactNode;
}

const SHUTTER_BLADES = 6;

export default function Transition({ children }: TransitionProps) {
    return (
        <div className="relative">
            {/* Shutter Blades - Closing */}
            <div className="fixed inset-0 z-[99999] pointer-events-none flex">
                {[...Array(SHUTTER_BLADES)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 0 }}
                        exit={{ scaleY: 1 }}
                        transition={{
                            duration: 0.4,
                            ease: [0.22, 1, 0.36, 1],
                            delay: i * 0.05
                        }}
                        style={{
                            originY: i % 2 === 0 ? 0 : 1,
                            width: `${100 / SHUTTER_BLADES}%`
                        }}
                        className="h-full bg-black/95 backdrop-blur-md"
                    />
                ))}
            </div>

            {/* Shutter Blades - Opening */}
            <div className="fixed inset-0 z-[99999] pointer-events-none flex">
                {[...Array(SHUTTER_BLADES)].map((_, i) => (
                    <motion.div
                        key={`in-${i}`}
                        initial={{ scaleY: 1 }}
                        animate={{ scaleY: 0 }}
                        transition={{
                            duration: 0.6,
                            ease: [0.22, 1, 0.36, 1],
                            delay: 0.2 + (i * 0.05)
                        }}
                        style={{
                            originY: i % 2 === 0 ? 1 : 0,
                            width: `${100 / SHUTTER_BLADES}%`
                        }}
                        className="h-full bg-black/95 backdrop-blur-md"
                    />
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
            >
                {children}
            </motion.div>
        </div>
    );
}
