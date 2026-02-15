'use client';

import Image from 'next/image';
import FadeIn from './FadeIn';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { supabase } from '@/lib/supabase';
import { getSiteSettings } from '@/lib/settings';
import RoomViewer from './RoomViewer';

interface Photo {
    id: string | number;
    src: string;
    alt: string;
    aspect: string;
    album: string;
    category?: string;
    is_cover?: boolean;
}

export default function Gallery() {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
    const [currentAlbum, setCurrentAlbum] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState<string>('');
    const [activeOrientation, setActiveOrientation] = useState<string>('All');
    const [showRoomViewer, setShowRoomViewer] = useState(false);
    const [galleryTitle, setGalleryTitle] = useState('Shutter Stories & Soulful Shots');


    useEffect(() => {
        const fetchPhotos = async () => {
            try {
                const { data, error } = await supabase
                    .from('photos')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                if (data) setPhotos(data);

                const settings = await getSiteSettings();
                if (settings && settings.gallery_title) {
                    setGalleryTitle(settings.gallery_title);
                }
            } catch (error) {
                // Silently handle
            } finally {
                setLoading(false);
            }
        };
        fetchPhotos();
    }, []);

    const albums = photos.reduce((acc: { [key: string]: Photo[] }, photo) => {
        const albumName = photo.album || 'Mcleodganj-Bir Billing';
        if (!acc[albumName]) acc[albumName] = [];
        acc[albumName].push(photo);
        return acc;
    }, {});

    const albumList = Object.keys(albums).map(name => {
        const items = albums[name];
        const cover = items.find(p => p.is_cover) || items[0];
        return { name, cover, count: items.length };
    });

    const displayPhotos = currentAlbum
        ? albums[currentAlbum].filter(p => {
            const matchesCategory = activeCategory === '' || p.category === activeCategory;
            const orientation = p.aspect === 'tall' ? 'Portrait' : (p.aspect === 'wide' || p.aspect === 'ultraWide' ? 'Landscape' : 'Square');
            const matchesOrientation = activeOrientation === 'All' || orientation === activeOrientation;
            return matchesCategory && matchesOrientation;
        })
        : [];

    const availableCategories = currentAlbum
        ? Array.from(new Set(albums[currentAlbum].map(p => p.category).filter(Boolean))) as string[]
        : [];

    useEffect(() => {
        if (currentAlbum && availableCategories.length > 0 && !activeCategory) {
            setActiveCategory(availableCategories[0]);
        } else if (!currentAlbum) {
            setActiveCategory('');
            setActiveOrientation('All');
        }
    }, [currentAlbum, availableCategories, activeCategory]);

    useEffect(() => {
        if (selectedPhoto || showRoomViewer) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [selectedPhoto, showRoomViewer]);

    const handlePhotoClick = (photo: Photo) => {
        setSelectedPhoto(photo);
    };


    if (loading) {
        return (
            <div className="py-32 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <section className="py-20 bg-background relative overflow-hidden transition-colors duration-1000" id="gallery">
            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                    <div className="max-w-2xl">
                        <motion.h2
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-white text-4xl md:text-7xl font-playfair italic mb-6 leading-tight"
                        >
                            {galleryTitle}
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="text-white/40 text-[10px] uppercase tracking-[0.6em]"
                        >
                            {currentAlbum ? `Exploring: ${currentAlbum}` : 'Curated Collections'}
                        </motion.p>
                    </div>

                    <div className="flex flex-wrap gap-4 items-center">
                        {currentAlbum && (
                            <button
                                onClick={() => { setCurrentAlbum(null); setActiveCategory(''); setActiveOrientation('All'); }}
                                className="group flex items-center gap-3 text-white/60 hover:text-white transition-all text-[10px] uppercase tracking-widest font-black"
                            >
                                <span className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white/40 transition-all">←</span>
                                Back to Albums
                            </button>
                        )}
                    </div>
                </div>

                {currentAlbum && (
                    <div className="flex flex-col gap-6 mb-12">
                        {availableCategories.length > 1 && (
                            <div className="flex flex-col gap-3">
                                <span className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-bold ml-1">Collections</span>
                                <div className="flex flex-wrap gap-3">
                                    {availableCategories.map((category) => (
                                        <button
                                            key={category}
                                            onClick={() => setActiveCategory(category)}
                                            className={`px-8 py-3 rounded-full text-[10px] uppercase tracking-[0.3em] font-black transition-all duration-500 ${activeCategory === category ? 'bg-white text-black shadow-2xl scale-105' : 'bg-white/5 text-white/30 hover:bg-white/10'}`}
                                        >
                                            {category}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-3">
                            <span className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-bold ml-1">Orientation</span>
                            <div className="flex flex-wrap gap-3">
                                {['All', 'Portrait', 'Landscape', 'Square'].map((orientation) => (
                                    <button
                                        key={orientation}
                                        onClick={() => setActiveOrientation(orientation)}
                                        className={`px-8 py-3 rounded-full text-[10px] uppercase tracking-[0.3em] font-black transition-all duration-500 ${activeOrientation === orientation ? 'bg-white text-black shadow-2xl scale-105' : 'bg-white/5 text-white/30 hover:bg-white/10'}`}
                                    >
                                        {orientation}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <AnimatePresence mode="wait">
                    {!currentAlbum ? (
                        <motion.div
                            key="album-list"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.5 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 px-4"
                        >
                            {albumList.map((album) => (
                                <div
                                    key={album.name}
                                    className="group cursor-pointer"
                                    onClick={() => setCurrentAlbum(album.name)}
                                >
                                    <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-secondary mb-6 transition-all duration-700 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] group-hover:-translate-y-2">
                                        <Image
                                            src={album.cover.src}
                                            alt={album.name}
                                            fill
                                            className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                            sizes="(max-width: 768px) 100vw, 33vw"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                                            <p className="text-white/60 text-xs font-medium tracking-[0.2em] uppercase mb-1">{album.count} shots</p>
                                            <h3 className="text-white text-3xl font-playfair italic font-light tracking-wide group-hover:tracking-wider transition-all duration-500 uppercase">{album.name}</h3>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="photo-list"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.5 }}
                            className="columns-1 gap-8 sm:columns-2 md:columns-3 px-4"
                        >
                            {displayPhotos.map((img, index) => {
                                return (
                                    <FadeIn key={img.id} delay={index * 100}>
                                        <div
                                            className="break-inside-avoid mb-8 cursor-pointer group relative gallery-image"
                                            onClick={() => handlePhotoClick(img)}
                                        >
                                            <div
                                                className="relative w-full rounded-lg overflow-hidden bg-secondary transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl z-0 hover:z-10"
                                            >
                                                {img.src ? (
                                                    <>
                                                        <Image
                                                            src={img.src}
                                                            alt={img.alt}
                                                            width={800}
                                                            height={1200}
                                                            className="w-full h-auto transition-all duration-1000 group-hover:scale-110"
                                                        />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <span className="text-white text-[10px] uppercase font-black tracking-[0.4em] border border-white/20 px-6 py-2 rounded-full bg-black/20 backdrop-blur-xl">View Details</span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="aspect-[3/4] flex items-center justify-center">
                                                        <span className="text-white/10 italic">No visual data</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </FadeIn>
                                )
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>


            {/* Room Viewer Portal */}
            <AnimatePresence>
                {showRoomViewer && (
                    <RoomViewer
                        photo={selectedPhoto!}
                        allPhotos={photos}
                        onClose={() => {
                            setShowRoomViewer(false);
                            setSelectedPhoto(null);
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Lightbox Overlay */}
            <AnimatePresence>
                {selectedPhoto && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-4 md:p-12"
                        onClick={() => setSelectedPhoto(null)}
                    >
                        <button
                            className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors"
                            onClick={() => setSelectedPhoto(null)}
                        >
                            <svg className="w-8 h-8 font-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="flex flex-col md:flex-row max-w-7xl w-full gap-12 items-center" onClick={(e) => e.stopPropagation()}>
                            <div className="relative w-full md:w-[60%] aspect-[4/5] overflow-hidden rounded-2xl shadow-2xl">
                                <Image
                                    src={selectedPhoto.src}
                                    alt={selectedPhoto.alt}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 60vw"
                                />
                            </div>

                            <div className="w-full md:w-[40%] text-left">
                                <p className="text-white/40 text-[10px] uppercase tracking-[0.5em] mb-4 font-black">Archive ID: 00{selectedPhoto.id}</p>
                                <h3 className="text-white text-4xl md:text-6xl font-playfair italic mb-8 leading-tight">{selectedPhoto.alt}</h3>
                                <div className="space-y-6 mb-12">
                                    <div className="flex justify-between items-center border-b border-white/10 pb-4">
                                        <span className="text-white/30 text-[9px] uppercase tracking-widest">Collection</span>
                                        <span className="text-white text-[11px] font-bold uppercase tracking-widest">{selectedPhoto.album}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-white/10 pb-4">
                                        <span className="text-white/30 text-[9px] uppercase tracking-widest">Aspect</span>
                                        <span className="text-white text-[11px] font-bold uppercase tracking-widest">{selectedPhoto.aspect}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        setShowRoomViewer(true);
                                        setSelectedPhoto(null);
                                    }}
                                    className="w-full bg-white text-black py-6 rounded-full text-[13px] uppercase tracking-[0.2em] font-black shadow-xl hover:scale-105 transition-all"
                                >
                                    View in Room Studio
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
