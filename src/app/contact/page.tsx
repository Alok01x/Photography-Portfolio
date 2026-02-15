'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getSiteSettings } from '@/lib/settings';
import SectionBackground from '@/components/SectionBackground';
import { motion } from 'framer-motion';

export default function Contact() {
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [contactInfo, setContactInfo] = useState({
        email: 'alokgadhwalx@gmail.com',
        phone: '',
        instagram: '@alok_gadhwal_',
        instagramUrl: 'https://www.instagram.com/alok_gadhwal_?igsh=MWx6ZXM5ZXVlMjZlaw==',
        title: 'Get in Touch',
        subtitle: 'Whether you\'re interested in a collaboration, print sales, or just want to say hello.',
        qrCodeUrl: '/insta-qr.png'
    });

    useEffect(() => {
        async function loadContactSettings() {
            const settings = await getSiteSettings();
            if (settings) {
                setContactInfo({
                    email: settings.contact_email || 'alokgadhwalx@gmail.com',
                    phone: settings.contact_phone || '',
                    instagram: settings.social_instagram || '@alok_gadhwal_',
                    instagramUrl: settings.social_instagram
                        ? `https://www.instagram.com/${settings.social_instagram.replace('@', '')}`
                        : 'https://www.instagram.com/alok_gadhwal_?igsh=MWx6ZXM5ZXVlMjZlaw==',
                    title: settings.contact_title || 'Get in Touch',
                    subtitle: settings.contact_subtitle || 'Whether you\'re interested in a collaboration, print sales, or just want to say hello.',
                    qrCodeUrl: settings.contact_insta_qr_url || '/insta-qr.png'
                });
            }
        }
        loadContactSettings();
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus('submitting');
        await new Promise(resolve => setTimeout(resolve, 1500));
        setStatus('success');
    };

    return (
        <SectionBackground>
            <div className="min-h-screen flex items-center py-32 lg:py-48">
                <div className="container grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="space-y-12"
                    >
                        <div className="space-y-6">
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="text-purple-600 dark:text-purple-400 text-sm uppercase tracking-[0.4em] font-medium"
                            >
                                Let&apos;s Connect
                            </motion.span>
                            <h1 className="text-5xl lg:text-8xl font-bold leading-tight tracking-tight text-foreground">{contactInfo.title}</h1>
                            <p className="text-xl lg:text-2xl text-foreground/60 leading-relaxed font-light max-w-md font-inter">
                                {contactInfo.subtitle}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-10 pt-12 border-t border-foreground/10">
                            <div className="group cursor-pointer">
                                <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-foreground/30 group-hover:text-foreground/50 transition-colors">Email</span>
                                <a href={`mailto:${contactInfo.email}`} className="block text-2xl lg:text-3xl mt-2 font-light hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors duration-300 text-foreground">
                                    {contactInfo.email}
                                </a>
                            </div>

                            {contactInfo.phone && (
                                <div className="group cursor-pointer">
                                    <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-foreground/30 group-hover:text-foreground/50 transition-colors">Phone</span>
                                    <a href={`tel:${contactInfo.phone}`} className="block text-2xl lg:text-3xl mt-2 font-light hover:text-purple-500 dark:hover:text-purple-400 transition-colors duration-300 text-foreground">
                                        {contactInfo.phone}
                                    </a>
                                </div>
                            )}

                            <div className="group cursor-pointer">
                                <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-foreground/30 group-hover:text-foreground/50 transition-colors">Instagram</span>
                                <div className="flex items-center gap-8 mt-4">
                                    <a
                                        href={contactInfo.instagramUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-2xl lg:text-3xl font-light hover:text-pink-500 dark:hover:text-pink-400 transition-colors duration-300 text-foreground"
                                    >
                                        {contactInfo.instagram}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <form className="relative bg-foreground/5 p-8 lg:p-14 rounded-[3rem] border border-foreground/10 space-y-8 backdrop-blur-3xl shadow-2xl" onSubmit={handleSubmit}>
                            {/* Inner glow for form */}
                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />

                            <div className="space-y-3">
                                <label htmlFor="name" className="text-[10px] uppercase tracking-widest font-bold text-foreground/40 ml-1">Your Name</label>
                                <input type="text" id="name" name="name" required className="w-full bg-foreground/5 border border-foreground/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:bg-foreground/10 transition-all placeholder:text-foreground/20 text-foreground" placeholder="John Doe" />
                            </div>

                            <div className="space-y-3">
                                <label htmlFor="email" className="text-[10px] uppercase tracking-widest font-bold text-foreground/40 ml-1">Email Address</label>
                                <input type="email" id="email" name="email" required className="w-full bg-foreground/5 border border-foreground/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:bg-foreground/10 transition-all placeholder:text-foreground/20 text-foreground" placeholder="john@example.com" />
                            </div>

                            <div className="space-y-3">
                                <label htmlFor="message" className="text-[10px] uppercase tracking-widest font-bold text-foreground/40 ml-1">Message</label>
                                <textarea id="message" name="message" required className="w-full bg-foreground/5 border border-foreground/10 rounded-2xl px-6 py-5 min-h-[180px] focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:bg-foreground/10 transition-all resize-none placeholder:text-foreground/20 text-foreground" placeholder="Tell me about your project..."></textarea>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                className="w-full bg-foreground text-background font-bold py-5 rounded-2xl hover:opacity-90 transition-all disabled:opacity-50 shadow-[0_0_30px_rgba(var(--foreground),0.1)]"
                                disabled={status === 'submitting'}
                            >
                                {status === 'submitting' ? 'Sending Journey...' : status === 'success' ? 'Message Received ✓' : 'Send Message'}
                            </motion.button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </SectionBackground>
    );
}
