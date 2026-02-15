'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getSiteSettings } from '@/lib/settings';
import { motion } from 'framer-motion';
import SectionBackground from '@/components/SectionBackground';

export default function ProfilePage() {
    const [profileData, setProfileData] = useState({
        name: 'Alok Gadhwal',
        bio: '"Capturing the soul within the frame."',
        image: '/hero_background.svg',
        description: 'Based in India, my work is a continuous exploration of the interplay between light, human emotion, and the vast silence of nature.',
        role: 'Founder & Lead Photographer',
        label: 'The Visionary',
        expertise: ["Landscape Photography", "Architectural Documentation", "Cinematic Portraits", "Visual Storytelling"],
        gear: [
            { category: "Camera Body", item: "Sony A7R IV" },
            { category: "Prime Lenses", item: "35mm f/1.4, 85mm f/1.4" },
            { category: "Zoom Lenses", item: "24-70mm f/2.8, 70-200mm f/2.8" },
            { category: "Drone", item: "DJI Mavic 3 Pro" },
        ]
    });

    useEffect(() => {
        async function loadProfileData() {
            const settings = await getSiteSettings();
            if (settings) {
                // Parse expertise
                const expertiseArray = settings.profile_expertise
                    ? settings.profile_expertise.split(',').map(s => s.trim())
                    : profileData.expertise;

                // Parse gear
                let gearArray = profileData.gear;
                if (settings.profile_gear) {
                    try {
                        gearArray = typeof settings.profile_gear === 'string'
                            ? JSON.parse(settings.profile_gear)
                            : settings.profile_gear;
                    } catch (e) {
                        // Keep default on parse error
                    }
                }

                setProfileData({
                    name: settings.profile_name || 'Alok Gadhwal',
                    bio: settings.profile_bio || '"Capturing the soul within the frame."',
                    image: settings.profile_image_url || '/hero_background.svg',
                    description: settings.profile_long_bio || profileData.description,
                    role: settings.profile_role || 'Founder & Lead Photographer',
                    label: settings.profile_label || 'The Visionary',
                    expertise: expertiseArray,
                    gear: gearArray
                });
            }
        }
        loadProfileData();
    }, []);

    return (
        <SectionBackground>
            <main className="min-h-screen pt-40 pb-32">
                <div className="container">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-start">

                        {/* Sidebar / Image Section */}
                        <div className="lg:col-span-5 space-y-12">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="relative aspect-[3/4] rounded-[2.5rem] overflow-hidden group shadow-2xl border border-white/10"
                            >
                                <Image
                                    src={profileData.image}
                                    alt={profileData.name}
                                    fill
                                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                    sizes="(max-width: 1024px) 100vw, 40vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent flex items-end p-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                    <span className="text-foreground/60 text-xs uppercase tracking-[0.5em] font-medium">{profileData.role}</span>
                                </div>
                                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background/60 to-transparent pointer-events-none" />
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                                className="relative bg-foreground/5 p-10 rounded-[2rem] border border-foreground/10 backdrop-blur-xl overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl -mr-10 -mt-10" />
                                <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold text-cyan-500 dark:text-cyan-400 mb-8">Expertise</h3>
                                <ul className="space-y-6">
                                    {profileData.expertise.map((skill, i) => (
                                        <motion.li
                                            key={i}
                                            initial={{ opacity: 0, x: -10 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="flex items-center gap-4 text-sm tracking-wide text-foreground/80"
                                        >
                                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/50" />
                                            {skill}
                                        </motion.li>
                                    ))}
                                </ul>
                            </motion.div>
                        </div>

                        {/* Main Content Section */}
                        <div className="lg:col-span-7 space-y-20">
                            <div className="space-y-8">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-4"
                                >
                                    <div className="h-px w-12 bg-foreground/20" />
                                    <span className="text-foreground/40 text-xs uppercase tracking-[0.6em] font-bold">{profileData.label}</span>
                                </motion.div>
                                <motion.h1
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.2 }}
                                    className="text-6xl lg:text-9xl font-bold tracking-tighter leading-[0.9] text-foreground"
                                >
                                    {profileData.name}
                                </motion.h1>
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                    className="text-2xl lg:text-4xl font-light italic text-foreground/60 font-playfair"
                                >
                                    {profileData.bio}
                                </motion.p>
                            </div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                transition={{ duration: 1 }}
                                className="max-w-2xl"
                            >
                                <p className="text-xl lg:text-2xl leading-relaxed font-light text-foreground/80 font-inter italic whitespace-pre-line">
                                    {profileData.description}
                                </p>
                            </motion.div>

                            {/* Gear Section */}
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                                className="relative bg-foreground/5 p-12 lg:p-16 rounded-[3rem] border border-foreground/10 backdrop-blur-3xl overflow-hidden shadow-2xl"
                            >
                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 blur-3xl -ml-20 -mb-20" />
                                <div className="flex justify-between items-center mb-16">
                                    <h2 className="text-3xl font-bold tracking-tight italic font-playfair underline decoration-foreground/10 underline-offset-8 text-foreground">The Toolkit</h2>
                                    <span className="px-5 py-1.5 rounded-full border border-foreground/20 text-[10px] uppercase tracking-widest font-bold text-foreground/40">Hardware</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
                                    {profileData.gear.map((gear: any, idx: number) => (
                                        <motion.div
                                            key={idx}
                                            whileHover={{ x: 10 }}
                                            className="group"
                                        >
                                            <span className="text-[10px] uppercase tracking-[0.5em] font-black text-foreground/20 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors">
                                                {gear.category}
                                            </span>
                                            <p className="text-xl font-light mt-3 text-foreground/90">{gear.item}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                className="flex flex-wrap gap-8 items-center pt-8"
                            >
                                <motion.a
                                    href="/contact"
                                    whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(var(--foreground),0.1)" }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-12 py-5 bg-foreground text-background font-bold rounded-2xl transition-all shadow-xl"
                                >
                                    Start a Project
                                </motion.a>
                                <div className="flex items-center gap-6">
                                    <div className="h-px w-16 bg-foreground/20"></div>
                                    <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-foreground/30">Available for commissions worldwide</p>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </main>
        </SectionBackground>
    );
}
