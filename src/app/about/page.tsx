'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getSiteSettings } from '@/lib/settings';
import { motion } from 'framer-motion';
import SectionBackground from '@/components/SectionBackground';

export default function About() {
    const [aboutData, setAboutData] = useState({
        content: "Hi, I'm a passionate photographer exploring the world one frame at a time. My journey began with a simple curiosity about how light shapes our perception of reality.\n\nWhether I'm trekking through the Himalayas, or chasing the golden hour, my goal remains the same: to tell a story that resonates.\n\nI believe that photography is not just about taking pictures; it's about feeling the moment. Minimalism and natural light are the core pillars of my aesthetic.",
        image: "/hero_background.svg", // Fallback
        title: "About Me",
        subtitle: "The Story",
        statsExp: "10+",
        statsLocations: "50+",
        statsCaptures: "1M+"
    });

    useEffect(() => {
        async function loadAboutSettings() {
            const settings = await getSiteSettings();
            if (settings) {
                setAboutData({
                    content: settings.about_content || aboutData.content,
                    image: settings.about_image_url || "/hero_background.svg",
                    title: settings.about_title || "About Me",
                    subtitle: settings.about_subtitle || "The Story",
                    statsExp: settings.about_stats_exp || "10+",
                    statsLocations: settings.about_stats_locations || "50+",
                    statsCaptures: settings.about_stats_captures || "1M+"
                });
            }
        }
        loadAboutSettings();
    }, []);

    return (
        <SectionBackground>
            <div className="container py-32 lg:py-48">
                <div className="space-y-20 lg:space-y-32">
                    <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-foreground/5 w-full shadow-[0_0_50px_rgba(0,0,0,0.2)] dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-foreground/10 group"
                        >
                            <Image
                                src={aboutData.image}
                                alt="About"
                                fill
                                style={{ objectFit: 'cover' }}
                                className="transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="space-y-10"
                        >
                            <div className="space-y-4">
                                <motion.span
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    className="text-cyan-500 dark:text-cyan-400 text-sm uppercase tracking-[0.4em] font-medium"
                                >
                                    {aboutData.subtitle}
                                </motion.span>
                                <h1 className="text-5xl lg:text-8xl font-bold leading-tight tracking-tight text-foreground">{aboutData.title}</h1>
                            </div>

                            <div className="space-y-8 whitespace-pre-line">
                                <p className="text-xl lg:text-2xl text-foreground/70 leading-relaxed font-light font-inter italic">
                                    {aboutData.content}
                                </p>
                            </div>

                            <div className="pt-8 border-t border-foreground/10 flex gap-12">
                                <div className="space-y-1">
                                    <span className="block text-2xl font-bold text-foreground">{aboutData.statsExp}</span>
                                    <span className="text-xs uppercase tracking-widest text-foreground/40">Years Exp.</span>
                                </div>
                                <div className="space-y-1">
                                    <span className="block text-2xl font-bold text-foreground">{aboutData.statsLocations}</span>
                                    <span className="text-xs uppercase tracking-widest text-foreground/40">Locations</span>
                                </div>
                                <div className="space-y-1">
                                    <span className="block text-2xl font-bold text-foreground">{aboutData.statsCaptures}</span>
                                    <span className="text-xs uppercase tracking-widest text-foreground/40">Captures</span>
                                </div>
                            </div>
                        </motion.div>
                    </section>
                </div>
            </div>
        </SectionBackground>
    );
}
