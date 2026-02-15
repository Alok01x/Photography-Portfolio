'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface Photo {
    id: string;
    src: string;
    alt: string;
    album: string;
    category: string;
    created_at: string;
}

export default function PhotosManagement() {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        fetchPhotos();
    }, []);

    async function fetchPhotos() {
        try {
            const { data, error } = await supabase
                .from('photos')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) setPhotos(data);
        } catch (err) {
            console.error('Error fetching photos:', err);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(photo: Photo) {
        if (!confirm('Are you sure you want to delete this photo? This action cannot be undone.')) return;

        setDeletingId(photo.id);
        try {
            // 1. Delete from database
            const { error: dbError } = await supabase
                .from('photos')
                .delete()
                .eq('id', photo.id);

            if (dbError) throw dbError;

            // 2. Try to extract filename from URL to delete from storage
            // URL format: .../storage/v1/object/public/portfolio-images/ALBUM_NAME/FILE_NAME
            const urlParts = photo.src.split('/');
            const fileName = urlParts[urlParts.length - 1];
            const albumName = urlParts[urlParts.length - 2];

            if (fileName && albumName) {
                const { error: storageError } = await supabase.storage
                    .from('portfolio-images')
                    .remove([`${albumName}/${fileName}`]);

                if (storageError) {
                    console.warn('Could not delete from storage:', storageError.message);
                }
            }

            setPhotos(prev => prev.filter(p => p.id !== photo.id));
        } catch (err: any) {
            alert('Error deleting photo: ' + err.message);
        } finally {
            setDeletingId(null);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
        );
    }

    // Group photos by album
    const photosByAlbum = photos.reduce((acc, photo) => {
        const album = photo.album || 'Uncategorized';
        if (!acc[album]) acc[album] = [];
        acc[album].push(photo);
        return acc;
    }, {} as Record<string, Photo[]>);

    const albumNames = Object.keys(photosByAlbum).sort();

    return (
        <div>
            <div className="flex justify-between items-end mb-12">
                <div>
                    <h1 className="text-4xl font-playfair italic mb-2">Photos.</h1>
                    <p className="text-white/40 uppercase tracking-[0.2em] text-xs">Manage your gallery collection</p>
                </div>
                <Link
                    href="/admin/upload"
                    className="px-6 py-3 bg-white text-black rounded-lg text-xs uppercase tracking-widest font-bold hover:bg-white/90 transition-colors"
                >
                    Add Photo
                </Link>
            </div>

            {albumNames.length > 0 ? (
                <div className="space-y-12">
                    {albumNames.map((albumName) => {
                        const albumPhotos = photosByAlbum[albumName];
                        return (
                            <div key={albumName}>
                                {/* Album Header */}
                                <div className="mb-6 pb-3 border-b border-white/10">
                                    <h2 className="text-2xl font-playfair italic text-white/90">{albumName}</h2>
                                    <p className="text-white/30 text-xs uppercase tracking-widest mt-1">
                                        {albumPhotos.length} {albumPhotos.length === 1 ? 'photo' : 'photos'}
                                    </p>
                                </div>

                                {/* Album Photos Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    <AnimatePresence>
                                        {albumPhotos.map((photo) => (
                                            <motion.div
                                                key={photo.id}
                                                layout
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                className="group relative bg-white/5 border border-white/10 rounded-xl overflow-hidden"
                                            >
                                                <div className="relative aspect-square">
                                                    <Image
                                                        src={photo.src}
                                                        alt={photo.alt}
                                                        fill
                                                        className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                                                    />
                                                    <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-sm p-4 translate-y-full group-hover:translate-y-0 transition-transform">
                                                        <p className="text-white text-xs font-medium truncate mb-1">{photo.alt || 'No Title'}</p>
                                                        <div className="flex justify-between items-center">
                                                            <p className="text-white/40 text-[10px] uppercase tracking-widest">{photo.album}</p>
                                                            {photo.category && (
                                                                <span className="text-[8px] bg-white/10 px-1.5 py-0.5 rounded text-white/60 font-bold uppercase tracking-tighter">
                                                                    {photo.category}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleDelete(photo)}
                                                        disabled={deletingId === photo.id}
                                                        className="p-2 bg-red-500/80 hover:bg-red-500 rounded-lg backdrop-blur-sm transition-colors disabled:opacity-50"
                                                        title="Delete Photo"
                                                    >
                                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-20 border-2 border-dashed border-white/10 rounded-2xl">
                    <p className="text-white/20 uppercase tracking-[0.3em] text-sm font-light">No photos found in your library</p>
                </div>
            )}
        </div>
    );
}
