'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { getSiteSettings } from '@/lib/settings';

export default function Hero() {
    const [offset, setOffset] = useState(0);
    const [heroData, setHeroData] = useState({
        title: <>The Art of <br /> Seeing.</>,
        subtitle: "Narrating the silent beauty of existence through light, shadow, and soul.",
        bgImage: "/hero_background.svg" // Fallback
    });

    useEffect(() => {
        // Fetch hero settings from database
        async function loadHeroSettings() {
            const settings = await getSiteSettings();
            if (settings) {
                setHeroData({
                    title: settings.hero_title ? <>{settings.hero_title}</> : <>The Art of <br /> Seeing.</>,
                    subtitle: settings.hero_subtitle || "Narrating the silent beauty of existence through light, shadow, and soul.",
                    bgImage: settings.hero_background_url || "/hero_background.svg"
                });
            }
        }
        loadHeroSettings();
    }, []);

    useEffect(() => {
        let rafId: number;
        const handleScroll = () => {
            rafId = requestAnimationFrame(() => {
                setOffset(window.scrollY);
            });
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
            cancelAnimationFrame(rafId);
        };
    }, []);

    return (
        <section className="relative h-screen min-h-[700px] flex items-end justify-start overflow-hidden bg-background transition-colors duration-1000">
            <div
                className="absolute inset-0 z-0"
                style={{ transform: `translateY(${offset * 0.5}px)` }}
            >
                <Image
                    src={heroData.bgImage}
                    alt="Hero Background"
                    fill
                    quality={95}
                    sizes="100vw"
                    style={{ objectFit: 'cover' }}
                />
                <div className="absolute inset-0 bg-black/40 z-[1]" />
            </div>

            <div className="relative z-10 w-full px-[40px] pb-[25vh]">
                <motion.h1
                    className="text-[clamp(3.5rem,10vw,8rem)] italic font-light leading-[0.9] tracking-[-0.04em] mb-8 text-foreground"
                    style={{ transform: `translateY(${offset * 0.2}px)` }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                >
                    {heroData.title}
                </motion.h1>
                <motion.p
                    className="text-[clamp(1.1rem,2vw,1.5rem)] font-light tracking-widest uppercase opacity-60 max-w-[600px] leading-relaxed"
                    style={{ transform: `translateY(${offset * 0.2}px)` }}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                >
                    {heroData.subtitle}
                </motion.p>
            </div>

            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
                <span className="uppercase tracking-[0.3em] text-[0.7rem] font-medium opacity-40">Scroll</span>
                <div className="w-px h-12 bg-foreground/20 relative overflow-hidden" />
            </div>
        </section>
    );
}
