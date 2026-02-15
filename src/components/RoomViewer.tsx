'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface PhotoData {
    src: string;
    alt: string;
    aspect: string;
    id: string | number;
    album: string;
}

interface FrameItem {
    id: string;
    photo: PhotoData;
    style: FrameType;
    x: number;
    y: number;
    scale: number;
    rotation: number;
    aspectOverride?: 'auto' | 'square' | 'wide' | 'tall';
}

interface RoomViewerProps {
    photo?: PhotoData;
    initialPhotos?: PhotoData[];
    allPhotos?: PhotoData[];
    onClose: () => void;
}

type FrameType =
    | 'canvas' | 'white_thin' | 'black_floating' | 'silver_thin'
    | 'oak' | 'walnut' | 'black_ash' | 'birch' | 'mahogany' | 'pine' | 'hickory'
    | 'aluminum' | 'steel' | 'gold' | 'copper'
    | 'shadowbox' | 'classic_mat' | 'maple_gallery';

interface FrameConfig {
    name: string;
    category: 'Modern' | 'Wooden' | 'Industrial' | 'Gallery';
    border: string;
    matColor: string;
    depth: string;
    matting: number;
    innerBorder?: string;
}

const FRAMES: Record<FrameType, FrameConfig> = {
    // Modern
    canvas: { name: 'Canvas Wrap', category: 'Modern', border: 'border-transparent', matColor: 'bg-transparent', depth: 'shadow-[0_25px_50px_rgba(0,0,0,0.5)]', matting: 0 },
    white_thin: { name: 'Thin White', category: 'Modern', border: 'border-white', matColor: 'bg-white', depth: 'shadow-[0_20px_40px_rgba(0,0,0,0.3)]', matting: 40 },
    black_floating: { name: 'Floating Black', category: 'Modern', border: 'border-neutral-900', matColor: 'bg-black/5', depth: 'shadow-[0_30px_60px_rgba(0,0,0,0.6)]', matting: 20 },
    silver_thin: { name: 'Thin Silver', category: 'Modern', border: 'border-neutral-300', matColor: 'bg-white', depth: 'shadow-[0_20px_40px_rgba(0,0,0,0.3)]', matting: 30 },

    // Wooden
    oak: { name: 'Natural Oak', category: 'Wooden', border: 'border-[#c49363]', matColor: 'bg-[#faf7f2]', depth: 'shadow-[0_30px_60px_rgba(0,0,0,0.4)]', matting: 45 },
    walnut: { name: 'Deep Walnut', category: 'Wooden', border: 'border-[#2d1d0f]', matColor: 'bg-[#fdfcfb]', depth: 'shadow-[0_45px_90px_rgba(0,0,0,0.7)]', matting: 55 },
    black_ash: { name: 'Black Ash', category: 'Wooden', border: 'border-neutral-950', matColor: 'bg-white', depth: 'shadow-[0_40px_80px_rgba(0,0,0,0.8)]', matting: 60 },
    birch: { name: 'Light Birch', category: 'Wooden', border: 'border-[#e3dcd2]', matColor: 'bg-[#fffcf9]', depth: 'shadow-[0_25px_50px_rgba(0,0,0,0.3)]', matting: 40 },
    mahogany: { name: 'Mahogany Red', category: 'Wooden', border: 'border-[#4a1a14]', matColor: 'bg-[#fcf8f5]', depth: 'shadow-[0_50px_100px_rgba(0,0,0,0.6)]', matting: 65 },
    pine: { name: 'Rustic Pine', category: 'Wooden', border: 'border-[#b59b7c]', matColor: 'bg-[#f9f3ef]', depth: 'shadow-[0_30px_60px_rgba(0,0,0,0.4)]', matting: 40 },
    hickory: { name: 'Smoked Hickory', category: 'Wooden', border: 'border-[#3d2b1f]', matColor: 'bg-[#f4f1ee]', depth: 'shadow-[0_45px_90px_rgba(0,0,0,0.7)]', matting: 55 },

    // Industrial
    aluminum: { name: 'Brushed Aluminum', category: 'Industrial', border: 'border-neutral-400', matColor: 'bg-neutral-100', depth: 'shadow-[0_20px_40px_rgba(0,0,0,0.4)]', matting: 50 },
    steel: { name: 'Matte Steel', category: 'Industrial', border: 'border-neutral-800', matColor: 'bg-white', depth: 'shadow-[0_35px_70px_rgba(0,0,0,0.7)]', matting: 55 },
    gold: { name: 'Champagne Gold', category: 'Industrial', border: 'border-[#d4af37]', matColor: 'bg-[#fefdfa]', depth: 'shadow-[0_40px_80px_rgba(0,0,0,0.5)]', matting: 60 },
    copper: { name: 'Antique Copper', category: 'Industrial', border: 'border-[#b87333]', matColor: 'bg-[#fffbf2]', depth: 'shadow-[0_40px_80px_rgba(0,0,0,0.6)]', matting: 55 },

    // Gallery
    shadowbox: { name: 'Shadow Box', category: 'Gallery', border: 'border-neutral-900', matColor: 'bg-neutral-50', depth: 'shadow-[0_60px_120px_rgba(0,0,0,0.8)]', matting: 80 },
    classic_mat: { name: 'Double Mat Classic', category: 'Gallery', border: 'border-neutral-950', matColor: 'bg-white', depth: 'shadow-[0_40px_80px_rgba(0,0,0,0.6)]', matting: 70, innerBorder: 'border-black/10' },
    maple_gallery: { name: 'Museum Maple', category: 'Gallery', border: 'border-[#e8d5b5]', matColor: 'bg-white', depth: 'shadow-[10px_10px_20px_rgba(0,0,0,0.2)]', matting: 100 }
};

export default function RoomViewer({ photo, initialPhotos = [], allPhotos = [], onClose }: RoomViewerProps) {
    const [customRoomSrc, setCustomRoomSrc] = useState<string | null>(null);
    const [showPhotoPicker, setShowPhotoPicker] = useState(false);
    const [multiSelectMode, setMultiSelectMode] = useState(false);
    const [selectedPhotos, setSelectedPhotos] = useState<PhotoData[]>([]);
    const [isPreview, setIsPreview] = useState(false);
    const [activeAlbum, setActiveAlbum] = useState<string>('');

    // Initialization logic for frames
    const getInitialFrames = () => {
        const photosToUse = initialPhotos.length > 0 ? initialPhotos : (photo ? [photo] : []);
        if (photosToUse.length === 0) return [];

        const now = Date.now();

        // Auto-layout logic for initial batch
        if (photosToUse.length === 1) {
            return [{ id: 'initial-0', photo: photosToUse[0], style: 'canvas' as FrameType, x: 0, y: 0, scale: 1, rotation: 0, aspectOverride: 'auto' as const }];
        } else if (photosToUse.length === 2) {
            return [
                { id: `initial-${now}-0`, photo: photosToUse[0], style: 'canvas' as FrameType, x: -200, y: 0, scale: 0.8, rotation: 0, aspectOverride: 'auto' as const },
                { id: `initial-${now}-1`, photo: photosToUse[1], style: 'canvas' as FrameType, x: 200, y: 0, scale: 0.8, rotation: 0, aspectOverride: 'auto' as const }
            ];
        } else {
            // Grid flow for 3+ photos
            return photosToUse.map((p, i) => ({
                id: `batch-${now}-${i}`,
                photo: p,
                style: 'canvas' as FrameType,
                x: (i - (photosToUse.length - 1) / 2) * 250,
                y: 0,
                scale: 0.6,
                rotation: 0,
                aspectOverride: 'auto' as const
            }));
        }
    };

    const [history, setHistory] = useState<FrameItem[][]>([getInitialFrames()]);
    const [historyIndex, setHistoryIndex] = useState(0);

    const currentFrames = history[historyIndex];
    const [selectedFrameId, setSelectedFrameId] = useState<string | null>(currentFrames[0]?.id || null);
    const constraintsRef = useRef(null);

    // Derived State
    const albumNames = useMemo(() => {
        const albums = Array.from(new Set(allPhotos.map(p => p.album).filter(Boolean))) as string[];
        return albums;
    }, [allPhotos]);

    useEffect(() => {
        if (!activeAlbum && albumNames.length > 0) {
            setActiveAlbum(albumNames[0]);
        }
    }, [albumNames, activeAlbum]);

    const filteredPhotos = useMemo(() => {
        if (!activeAlbum) return allPhotos;
        return allPhotos.filter(p => p.album === activeAlbum);
    }, [allPhotos, activeAlbum]);

    // Helper for deep cloning frames
    const cloneFrames = (frames: FrameItem[]): FrameItem[] => JSON.parse(JSON.stringify(frames));

    const pushHistory = (newFrames: FrameItem[]) => {
        const nextFrames = cloneFrames(newFrames);
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(nextFrames);
        if (newHistory.length > 50) newHistory.shift();
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    };

    const undo = () => {
        if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1);
        }
    };

    const redo = () => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(historyIndex + 1);
        }
    };

    const handleAddSelectedPhotos = () => {
        if (selectedPhotos.length === 0) return;
        const now = Date.now();
        const newFrames: FrameItem[] = selectedPhotos.map((p, i) => ({
            id: `multi-${now}-${i}`,
            photo: p,
            style: 'canvas' as FrameType,
            x: (i - (selectedPhotos.length - 1) / 2) * 200,
            y: 0,
            scale: selectedPhotos.length > 2 ? 0.6 : 0.8,
            rotation: 0,
            aspectOverride: 'auto' as const
        }));
        pushHistory([...currentFrames, ...newFrames]);
        setSelectedPhotos([]);
        setMultiSelectMode(false);
        setShowPhotoPicker(false);
    };

    const handleRoomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setCustomRoomSrc(url);
        }
    };

    const updateFrame = (id: string, updates: Partial<FrameItem>, isFinal = true) => {
        const next = currentFrames.map(f => f.id === id ? { ...f, ...updates } : f);
        if (isFinal) {
            pushHistory(next);
        } else {
            const newHistory = [...history];
            newHistory[historyIndex] = next;
            setHistory(newHistory);
        }
    };

    const removeFrame = (id: string) => {
        const next = currentFrames.filter(f => f.id !== id);
        pushHistory(next);
        if (selectedFrameId === id) setSelectedFrameId(next[0]?.id || null);
    };

    const applyLayout = (type: 'centered' | 'triptych' | 'pair') => {
        let next: FrameItem[] = [];
        const basePhoto = currentFrames[0]?.photo || photo;
        if (!basePhoto) return;

        if (type === 'centered') {
            next = [{ ...currentFrames[0], id: 'solo-' + Date.now(), x: 0, y: 0, scale: 1 }];
        } else if (type === 'triptych') {
            const base = { ...currentFrames[0], photo: basePhoto, style: 'canvas' as FrameType, y: 0, scale: 0.6, rotation: 0, aspectOverride: 'auto' as const };
            const now = Date.now();
            next = [
                { ...base, id: 't1-' + now, x: -280 },
                { ...base, id: 't2-' + now, x: 0 },
                { ...base, id: 't3-' + now, x: 280 }
            ];
        } else if (type === 'pair') {
            const base = { ...currentFrames[0], photo: basePhoto, style: 'canvas' as FrameType, y: 0, scale: 0.75, rotation: 0, aspectOverride: 'auto' as const };
            const now = Date.now();
            next = [
                { ...base, id: 'p1-' + now, x: -180 },
                { ...base, id: 'p2-' + now, x: 180 }
            ];
        }
        pushHistory(next);
        setSelectedFrameId(next[0]?.id || null);
    };

    const handleSwapPhoto = (newPhoto: PhotoData) => {
        if (multiSelectMode) {
            if (selectedPhotos.find(p => p.id === newPhoto.id)) {
                setSelectedPhotos(selectedPhotos.filter(p => p.id !== newPhoto.id));
            } else {
                setSelectedPhotos([...selectedPhotos, newPhoto]);
            }
        } else {
            if (selectedFrameId) {
                // Swap mode: update existing frame
                updateFrame(selectedFrameId, { photo: newPhoto });
            } else {
                // Add mode: create new frame at center
                const now = Date.now();
                const newFrame: FrameItem = {
                    id: `single-${now}`,
                    photo: newPhoto,
                    style: 'canvas' as FrameType,
                    x: 0,
                    y: 0,
                    scale: 1,
                    rotation: 0,
                    aspectOverride: 'auto' as const
                };
                pushHistory([...currentFrames, newFrame]);
            }
            setShowPhotoPicker(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10001] bg-black flex flex-col md:flex-row overflow-hidden"
            onClick={() => {
                if (!isPreview) {
                    setSelectedFrameId(null);
                    setShowPhotoPicker(false);
                }
            }}
        >
            {/* LEFT SECTION: INTERACTIVE VISUALS */}
            <div className="relative w-full h-[45%] md:h-full md:flex-1 bg-neutral-900 touch-none transition-all duration-700 overflow-hidden flex items-center justify-center">
                <div ref={constraintsRef} className="absolute inset-[-100%] z-0" />

                {/* 1. ROOM LAYERS */}
                <AnimatePresence mode="wait">
                    {customRoomSrc ? (
                        <motion.div
                            key="uploaded-room"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className={`absolute inset-0 z-0 bg-black flex items-center justify-center transition-all duration-500 w-full`}
                        >
                            {/* Blurred background for fitting */}
                            <div className="absolute inset-0 z-0">
                                <Image src={customRoomSrc} alt="" fill className="object-cover opacity-30 blur-2xl scale-110" sizes="10vw" />
                            </div>
                            {/* Main contained image - NO PADDING to maximize fit */}
                            <div className="relative w-full h-full flex items-center justify-center">
                                <Image src={customRoomSrc} alt="Custom Room" fill className="object-contain" sizes="100vw" />
                            </div>
                            <div className="absolute inset-0 bg-black/10 pointer-events-none" />
                        </motion.div>
                    ) : (
                        <motion.div key="empty-stage" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col items-center justify-center gap-8 bg-neutral-950 z-10 transition-all duration-500">
                            <div className="w-40 h-40 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                                <svg className="w-16 h-16 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </div>
                            <div className="text-center max-w-md px-10">
                                <h3 className="text-white text-3xl font-playfair italic mb-4">Your Custom Stage</h3>
                                <p className="text-white/40 text-[10px] uppercase tracking-[0.5em] leading-relaxed" style={{ textWrap: 'balance' }}>Personalize your space. Upload a photo of your actual wall to visualize these prints in your home.</p>
                            </div>
                            <label className="cursor-pointer bg-white text-black px-12 py-6 rounded-full text-[13px] uppercase font-black tracking-widest shadow-[0_20px_60px_rgba(255,255,255,0.1)] hover:scale-105 active:scale-95 transition-all">
                                <span>Select Wall Photo</span>
                                <input type="file" onChange={handleRoomUpload} className="hidden" accept="image/*" />
                            </label>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 2. THE SMART INTERACTIVE STAGE */}
                {customRoomSrc && (
                    <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none transition-all duration-500 w-full">
                        <AnimatePresence>
                            {currentFrames.map((item) => {
                                const selected = selectedFrameId === item.id && !isPreview;
                                const fStyle = FRAMES[item.style] || FRAMES.canvas;

                                const rawAspect = item.photo.aspect?.toLowerCase() || 'square';
                                const override = item.aspectOverride || 'auto';

                                const isLandscape = rawAspect.includes('wide') || rawAspect.includes('land') || rawAspect.includes('horiz') || rawAspect.includes('pano');
                                const isPortrait = rawAspect.includes('tall') || rawAspect.includes('port') || rawAspect.includes('vert');

                                const finalType = override === 'auto'
                                    ? (isLandscape ? 'wide' : isPortrait ? 'tall' : 'square')
                                    : override;

                                const isFrameWide = finalType === 'wide';
                                const isFrameTall = finalType === 'tall';

                                return (
                                    <motion.div
                                        key={item.id}
                                        drag={!isPreview}
                                        dragMomentum={false}
                                        dragConstraints={constraintsRef}
                                        onDragStart={() => {
                                            setSelectedFrameId(item.id);
                                        }}
                                        onDragEnd={(e, info) => {
                                            updateFrame(item.id, {
                                                x: item.x + info.offset.x,
                                                y: item.y + info.offset.y
                                            });
                                        }}
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{
                                            x: item.x,
                                            y: item.y,
                                            scale: 1, // Reset transform scale
                                            rotate: item.rotation,
                                            opacity: 1,
                                            zIndex: selected ? 50 : 40,
                                            // Layout scaling for borders
                                            padding: `${fStyle.matting * (item.scale * 0.7)}px`,
                                            transition: { type: 'spring', damping: 25, stiffness: 300, mass: 0.5 }
                                        }}
                                        exit={{ scale: 0.5, opacity: 0 }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (!isPreview) setSelectedFrameId(item.id);
                                        }}
                                        className={`absolute pointer-events-auto ${isPreview ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'} group ${fStyle.depth} ${fStyle.matColor}`}
                                        style={{
                                            boxShadow: selected ? '0 0 0 2px rgba(255,255,255,0.5), 0 20px 40px rgba(0,0,0,0.4)' : undefined
                                        }}
                                    >
                                        <div className={`absolute inset-0 border-[12px] md:border-[20px] ${fStyle.border} shadow-inner pointer-events-none`} />

                                        {/* Optional Inner Border for Double Matting */}
                                        {fStyle.innerBorder && (
                                            <div className={`absolute inset-[3px] border ${fStyle.innerBorder} pointer-events-none`} />
                                        )}

                                        <motion.div
                                            animate={{ width: (isFrameWide ? 400 : isFrameTall ? 240 : 300) * item.scale }}
                                            transition={{ type: 'spring', damping: 25, stiffness: 300, mass: 0.5 }}
                                            className="relative"
                                        >
                                            <div className={`relative w-full overflow-hidden shadow-inner ${isFrameWide ? 'aspect-[3/2]' : isFrameTall ? 'aspect-[4/5]' : 'aspect-square'}`}>
                                                <Image src={item.photo.src} alt={item.photo.alt} fill className="object-cover pointer-events-none" sizes="(max-width: 768px) 50vw, 33vw" />
                                            </div>
                                        </motion.div>

                                        <AnimatePresence>
                                            {selected && !isPreview && (
                                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute -bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-50">
                                                    <div className="flex gap-2 bg-black/60 backdrop-blur-xl border border-white/10 p-2 rounded-full shadow-2xl">
                                                        <button onClick={(e) => { e.stopPropagation(); removeFrame(item.id); }} className="bg-red-500/80 text-white p-2 rounded-full hover:bg-red-600 transition-colors">
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                                                        </button>
                                                        <div className="w-[1px] h-6 bg-white/10 mx-1" />
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setShowPhotoPicker(true); setMultiSelectMode(false); }}
                                                            className="flex items-center gap-2 px-4 py-1.5 text-white/80 hover:text-white transition-colors"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                            <span className="text-[9px] uppercase font-black tracking-widest">Swap</span>
                                                        </button>
                                                        <div className="w-[1px] h-6 bg-white/10 mx-1" />
                                                        <div className="w-[1px] h-6 bg-white/10 mx-1" />
                                                        <div className="flex gap-1">
                                                            <button onClick={(e) => { e.stopPropagation(); updateFrame(item.id, { scale: Math.max(0.2, item.scale - 0.1) }); }} className="text-white/60 hover:text-white p-2 transition-colors">
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M20 12H4" /></svg>
                                                            </button>
                                                            <button onClick={(e) => { e.stopPropagation(); updateFrame(item.id, { scale: Math.min(2.0, item.scale + 0.1) }); }} className="text-white/60 hover:text-white p-2 transition-colors">
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                                                            </button>
                                                        </div>
                                                        <div className="w-[1px] h-6 bg-white/10 mx-1" />
                                                        <button onClick={(e) => { e.stopPropagation(); updateFrame(item.id, { rotation: item.rotation - 5 }); }} className="text-white/60 hover:text-white p-2 transition-colors">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l5 5m-5-5l5-5" /></svg>
                                                        </button>
                                                        <button onClick={(e) => { e.stopPropagation(); updateFrame(item.id, { rotation: item.rotation + 5 }); }} className="text-white/60 hover:text-white p-2 transition-colors">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 10H11a8 8 0 00-8 8v2M21 10l-5 5m5-5l-5-5" /></svg>
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>

                        {!isPreview && (
                            <div className="absolute top-6 sm:top-8 left-6 sm:left-10 z-[100] flex items-center gap-3 md:gap-6 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                                <button onClick={onClose} className="group bg-black/40 backdrop-blur-3xl border border-white/10 p-4 sm:p-5 rounded-full hover:bg-white/10 transition-all shadow-2xl">
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6 group-hover:-translate-x-1 text-white/60 group-hover:text-white transition-all transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg>
                                </button>
                                <div className="flex flex-col">
                                    <h2 className="text-[12px] sm:text-[16px] uppercase tracking-[0.6em] sm:tracking-[1em] text-white font-black italic">SMART STUDIO</h2>
                                    <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.4em] sm:tracking-[0.5em] text-white/30 font-bold">Wall Visualizer</span>
                                </div>
                            </div>
                        )}

                        {isPreview && (
                            <div className="absolute top-6 right-6 z-[100] pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                                <button
                                    onClick={() => setIsPreview(false)}
                                    className="bg-black/50 backdrop-blur-md text-white px-6 py-3 rounded-full text-[10px] uppercase font-black tracking-widest hover:bg-white/20 transition-all border border-white/10 shadow-2xl flex items-center gap-3"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                    Exit Preview
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Sidebar Simple Replacement */}
            {customRoomSrc && !showPhotoPicker && (
                <div className={`relative w-full md:w-[400px] h-[55%] md:h-full bg-black z-[200] border-t md:border-t-0 md:border-l border-white/10 p-6 md:p-10 flex flex-col shadow-[0_-20px_50px_rgba(0,0,0,0.5)] md:shadow-none transition-all duration-500 ${isPreview ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'}`} onClick={(e) => e.stopPropagation()}>
                    <div className="w-16 h-1 bg-white/20 rounded-full mx-auto mb-6 md:hidden flex-shrink-0" />

                    <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide flex flex-col gap-10">
                        {/* TOP ACTIONS */}
                        <div className="grid grid-cols-6 gap-2 px-2 sm:px-4">
                            <button onClick={() => { setShowPhotoPicker(true); setMultiSelectMode(true); }} className="col-span-2 bg-white text-black py-4 rounded-xl text-[10px] uppercase font-black tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                                Add Art
                            </button>
                            <button onClick={() => applyLayout('pair')} className="bg-white/10 text-white py-4 rounded-xl text-[10px] uppercase font-black tracking-widest hover:bg-white/20 transition-all border border-white/5">
                                Pair
                            </button>
                            <button onClick={() => applyLayout('triptych')} className="bg-white/10 text-white py-4 rounded-xl text-[10px] uppercase font-black tracking-widest hover:bg-white/20 transition-all border border-white/5">
                                Tri
                            </button>

                            {/* History & Preview */}
                            <button onClick={undo} disabled={historyIndex <= 0} className={`rounded-xl flex items-center justify-center transition-all border border-white/5 ${historyIndex > 0 ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white/5 text-white/20'}`}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l5 5m-5-5l5-5" /></svg>
                            </button>
                            <button onClick={redo} disabled={historyIndex >= history.length - 1} className={`rounded-xl flex items-center justify-center transition-all border border-white/5 ${historyIndex < history.length - 1 ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white/5 text-white/20'}`}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 10H11a8 8 0 00-8 8v2M21 10l-5 5m5-5l-5-5" /></svg>
                            </button>
                        </div>

                        <div className="px-2 sm:px-4 mt-2">
                            <button onClick={() => setIsPreview(true)} className="w-full bg-white/5 text-white/60 py-3 rounded-xl text-[9px] uppercase font-black tracking-[0.2em] hover:bg-white/10 hover:text-white transition-all border border-white/5 flex items-center justify-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                Enter Preview Mode
                            </button>
                        </div>

                        {selectedFrameId ? (
                            <>
                                <div className="flex justify-between items-center px-2 sm:px-4">
                                    <p className="text-[10px] uppercase tracking-[0.4em] text-white/30 font-black">Size</p>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-black text-white/60 tabular-nums">
                                            {Math.round((currentFrames.find(it => it.id === selectedFrameId)?.scale || 1) * 100)}%
                                        </span>
                                        <button onClick={() => updateFrame(selectedFrameId, { scale: 1.0 })} className="text-[9px] uppercase font-black tracking-widest text-white/30 hover:text-white transition-colors">Reset</button>
                                    </div>
                                </div>
                                <input
                                    type="range" min="0.2" max="3.0" step="0.01"
                                    value={currentFrames.find(it => it.id === selectedFrameId)?.scale || 1}
                                    onChange={(e) => updateFrame(selectedFrameId, { scale: parseFloat(e.target.value) }, false)}
                                    onMouseUp={() => updateFrame(selectedFrameId, { scale: currentFrames.find(it => it.id === selectedFrameId)?.scale || 1 }, true)}
                                    className="w-full accent-white h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                />
                                <div className="flex justify-between mt-6">
                                    {[{ label: 'S', val: 0.5 }, { label: 'M', val: 1.0 }, { label: 'L', val: 1.5 }, { label: 'XL', val: 2.5 }].map((p) => (
                                        <button key={p.label} onClick={() => updateFrame(selectedFrameId, { scale: p.val })} className="w-14 h-14 bg-white/5 rounded-2xl text-[12px] font-black text-white/40 hover:bg-white/10">{p.label}</button>
                                    ))}
                                </div>

                                {/* RATIO CONTROLS */}
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.4em] text-white/30 font-black mb-4">Ratio</p>
                                    <div className="grid grid-cols-4 gap-2">
                                        {(['auto', 'square', 'wide', 'tall'] as const).map((ratio) => (
                                            <button
                                                key={ratio}
                                                onClick={() => updateFrame(selectedFrameId, { aspectOverride: ratio })}
                                                className={`py-3 rounded-xl text-[9px] uppercase font-bold tracking-widest transition-all ${(currentFrames.find(it => it.id === selectedFrameId)?.aspectOverride || 'auto') === ratio ? 'bg-white text-black font-black scale-[1.05] shadow-lg' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                                            >
                                                {ratio}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* SERIES SELECTION */}
                                <div className="pb-10">
                                    {['Modern', 'Wooden', 'Industrial', 'Gallery'].map((category) => (
                                        <div key={category} className="mb-6">
                                            <p className="text-[10px] uppercase tracking-[0.4em] text-white/30 font-black mb-3 ml-2">{category}</p>
                                            <div className="grid grid-cols-4 gap-3">
                                                {Object.entries(FRAMES).filter(([_, conf]) => conf.category === category).map(([key, conf]) => (
                                                    <button
                                                        key={key}
                                                        onClick={() => updateFrame(selectedFrameId, { style: key as FrameType })}
                                                        className={`group relative w-full aspect-square rounded-xl overflow-hidden transition-all ${(currentFrames.find(it => it.id === selectedFrameId)?.style || 'canvas') === key
                                                            ? 'ring-2 ring-white scale-105 shadow-xl'
                                                            : 'opacity-50 hover:opacity-100 hover:scale-105'
                                                            }`}
                                                    >
                                                        <div className={`absolute inset-0 ${conf.matColor}`} />
                                                        <div className={`absolute inset-0 border-[4px] ${conf.border}`} />
                                                        <div className="absolute inset-2 bg-neutral-900 shadow-inner" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center flex-1 h-32 opacity-30">
                                <p className="text-[10px] uppercase tracking-[0.2em] font-medium text-white text-center">Select an art piece<br />to customize</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* OVERLAYS (Independent of Split) */}
            <AnimatePresence>
                {showPhotoPicker && !isPreview && (
                    <motion.div
                        initial={{ y: 200, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 200, opacity: 0 }}
                        className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 z-[300] w-[95vw] max-w-5xl bg-black/80 backdrop-blur-3xl border border-white/10 p-6 sm:p-10 rounded-[3rem] shadow-3xl flex flex-col gap-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center px-2 sm:px-4">
                            <div className="flex flex-col gap-4">
                                <p className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-black">
                                    {multiSelectMode ? `Tap to Select (${selectedPhotos.length})` : 'Select Art'}
                                </p>
                                <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1">
                                    {albumNames.map(name => (
                                        <button
                                            key={name}
                                            onClick={() => setActiveAlbum(name)}
                                            className={`px-5 py-2.5 rounded-full text-[9px] uppercase font-bold tracking-widest transition-all whitespace-nowrap ${activeAlbum === name ? 'bg-white text-black shadow-lg' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                                        >
                                            {name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button onClick={() => setShowPhotoPicker(false)} className="text-white/40 hover:text-white transition-colors p-4 bg-white/5 rounded-full">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-5 overflow-y-auto max-h-[40vh] scrollbar-hide px-2 pb-6">
                            {filteredPhotos.map((p) => {
                                const isSelected = selectedPhotos.find(sp => sp.id === p.id);
                                return (
                                    <button
                                        key={p.id}
                                        onClick={() => handleSwapPhoto(p)}
                                        className={`relative aspect-square rounded-[1.5rem] overflow-hidden border transition-all hover:scale-105 active:scale-95 ${isSelected ? 'border-white border-4 p-1 ring-4 ring-white/20' : 'border-white/5 hover:border-white/40 shadow-xl'}`}
                                    >
                                        <Image src={p.src} alt={p.alt} fill className="object-contain" sizes="(max-width: 640px) 33vw, 20vw" />
                                        {isSelected && (
                                            <div className="absolute inset-0 bg-white/20 flex items-center justify-center">
                                                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-2xl">
                                                    <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                                </div>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        {multiSelectMode && selectedPhotos.length > 0 && (
                            <button
                                onClick={handleAddSelectedPhotos}
                                className="bg-white text-black w-full py-6 rounded-3xl text-[14px] font-black uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-95 transition-all shadow-2xl"
                            >
                                Add {selectedPhotos.length} Pieces to Wall
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
