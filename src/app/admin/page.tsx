'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalPhotos: 0,
        totalAlbums: 0,
        recentUploads: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const { data: photos, error } = await supabase
                    .from('photos')
                    .select('id, album, created_at');

                if (error) throw error;

                if (photos) {
                    const albums = new Set(photos.map(p => p.album)).size;
                    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                    const recent = photos.filter(p => p.created_at && new Date(p.created_at) > twentyFourHoursAgo).length;

                    setStats({
                        totalPhotos: photos.length,
                        totalAlbums: albums,
                        recentUploads: recent,
                    });
                }
            } catch (err) {
                console.error('Error fetching stats:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchStats();
    }, []);

    const statCards = [
        { name: 'Total Photos', value: stats.totalPhotos, icon: '📸' },
        { name: 'Active Albums', value: stats.totalAlbums, icon: '📁' },
        { name: 'Uploads (24h)', value: stats.recentUploads, icon: '✨' },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div>
            <div className="mb-12">
                <h1 className="text-4xl font-playfair italic mb-2">Welcome Back.</h1>
                <p className="text-white/40 uppercase tracking-[0.2em] text-xs">Portfolio Management Dashboard</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {statCards.map((stat, index) => (
                    <motion.div
                        key={stat.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm"
                    >
                        <div className="text-3xl mb-4">{stat.icon}</div>
                        <div className="text-3xl font-light mb-1">{stat.value}</div>
                        <div className="text-white/40 uppercase tracking-widest text-[0.6rem] font-medium">{stat.name}</div>
                    </motion.div>
                ))}
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
                <h2 className="text-xl font-light mb-6">Quick Actions</h2>
                <div className="flex flex-wrap gap-4">
                    <Link
                        href="/admin/upload"
                        className="px-6 py-3 bg-white text-black rounded-lg text-xs uppercase tracking-widest font-bold hover:bg-white/90 transition-colors"
                    >
                        Upload Photo
                    </Link>
                    <Link
                        href="/admin/albums/new"
                        className="px-6 py-3 border border-white/20 rounded-lg text-xs uppercase tracking-widest font-bold hover:bg-white/5 transition-colors"
                    >
                        New Album
                    </Link>
                    <Link
                        href="/admin/albums"
                        className="px-6 py-3 border border-white/20 rounded-lg text-xs uppercase tracking-widest font-bold hover:bg-white/5 transition-colors"
                    >
                        Manage Albums
                    </Link>
                    <Link
                        href="/admin/settings"
                        className="px-6 py-3 border border-white/20 rounded-lg text-xs uppercase tracking-widest font-bold hover:bg-white/5 transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Settings
                    </Link>
                </div>
            </div>
        </div>
    );
}
