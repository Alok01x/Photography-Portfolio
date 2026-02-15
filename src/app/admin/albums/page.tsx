'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Photo {
    id: string;
    src: string;
    alt: string;
    album: string;
    is_cover: boolean;
}

interface Album {
    name: string;
    photos: Photo[];
    coverPhoto: Photo | null;
}

export default function AlbumsManagement() {
    const [albums, setAlbums] = useState<Album[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [editingAlbum, setEditingAlbum] = useState<string | null>(null);
    const [newName, setNewName] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        setLoading(true);
        try {
            // 1. Fetch albums
            const { data: albumData, error: albumError } = await supabase
                .from('albums')
                .select('*')
                .order('name');

            if (albumError) throw albumError;

            // 2. Fetch photos
            const { data: photoData, error: photoError } = await supabase
                .from('photos')
                .select('*')
                .order('created_at', { ascending: false });

            if (photoError) throw photoError;

            if (albumData) {
                const albumList = albumData.map(album => {
                    const albumPhotos = photoData?.filter(p => p.album === album.name) || [];
                    return {
                        id: album.id,
                        name: album.name,
                        photos: albumPhotos,
                        coverPhoto: albumPhotos.find(p => p.is_cover) || albumPhotos[0] || null
                    };
                });

                // Add any orphans (photos with albums not in the albums table)
                const albumNames = new Set(albumData.map(a => a.name));
                const orphans: { [key: string]: Photo[] } = {};
                photoData?.forEach(p => {
                    if (!albumNames.has(p.album || 'Uncategorized')) {
                        const name = p.album || 'Uncategorized';
                        if (!orphans[name]) orphans[name] = [];
                        orphans[name].push(p);
                    }
                });

                Object.keys(orphans).forEach(name => {
                    albumList.push({
                        id: 'orphan-' + name,
                        name: name,
                        photos: orphans[name],
                        coverPhoto: orphans[name].find(p => p.is_cover) || orphans[name][0] || null
                    });
                });

                setAlbums(albumList);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    }

    async function handleRename(oldName: string) {
        if (!newName.trim() || newName === oldName) {
            setEditingAlbum(null);
            return;
        }

        setUpdatingId('rename-' + oldName);
        try {
            // 1. Update album name in albums table
            const { error: albumError } = await supabase
                .from('albums')
                .update({ name: newName.trim() })
                .eq('name', oldName);

            if (albumError) {
                // If it fails, maybe it's an "orphan" (not in albums table yet)
                // We'll try to insert it if it doesn't exist, or just proceed to photos
                console.warn('Could not update album record:', albumError.message);

                // Try to insert if it's missing from the albums table
                await supabase.from('albums').upsert({ name: newName.trim() }, { onConflict: 'name' });
            }

            // 2. Update all photos with this album name (Cascading update)
            const { error: photoError } = await supabase
                .from('photos')
                .update({ album: newName.trim() })
                .eq('album', oldName);

            if (photoError) throw photoError;

            await fetchData();
            setEditingAlbum(null);
        } catch (err: any) {
            alert('Error renaming album: ' + err.message);
        } finally {
            setUpdatingId(null);
        }
    }

    async function setAsCover(photo: Photo, albumName: string) {
        setUpdatingId(photo.id);
        try {
            // 1. Unset all covers for this album
            const { error: unsetError } = await supabase
                .from('photos')
                .update({ is_cover: false })
                .eq('album', albumName);

            if (unsetError) throw unsetError;

            // 2. Set new cover
            const { error: setError } = await supabase
                .from('photos')
                .update({ is_cover: true })
                .eq('id', photo.id);

            if (setError) throw setError;

            // 3. Refresh data
            await fetchData();
        } catch (err: any) {
            alert('Error updating cover: ' + err.message);
        } finally {
            setUpdatingId(null);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-end mb-12">
                <div>
                    <h1 className="text-4xl font-playfair italic mb-2">Albums.</h1>
                    <p className="text-white/40 uppercase tracking-[0.2em] text-xs">Organize and curate your collections</p>
                </div>
                <Link
                    href="/admin/albums/new"
                    className="px-6 py-3 bg-white text-black rounded-lg text-xs uppercase tracking-widest font-bold hover:bg-white/90 transition-colors"
                >
                    Create New Album
                </Link>
            </div>

            <div className="space-y-16">
                {albums.map((album) => (
                    <section key={album.name} className="relative">
                        <div className="flex items-center justify-between mb-8 group/header">
                            <div className="flex items-baseline gap-4">
                                {editingAlbum === album.name ? (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            className="bg-white/10 border border-white/20 rounded px-3 py-1 text-xl font-light uppercase tracking-wider outline-none focus:border-white"
                                            autoFocus
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleRename(album.name);
                                                if (e.key === 'Escape') setEditingAlbum(null);
                                            }}
                                        />
                                        <button
                                            onClick={() => handleRename(album.name)}
                                            className="text-xs uppercase tracking-widest font-bold text-white hover:text-white/60"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => setEditingAlbum(null)}
                                            className="text-xs uppercase tracking-widest font-bold text-white/40 hover:text-white"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <h2 className="text-2xl font-light tracking-wider uppercase">{album.name}</h2>
                                        <button
                                            onClick={() => {
                                                setEditingAlbum(album.name);
                                                setNewName(album.name);
                                            }}
                                            className="opacity-0 group-hover/header:opacity-100 transition-opacity text-[10px] uppercase tracking-widest font-bold text-white/40 hover:text-white ml-2"
                                        >
                                            Edit Name
                                        </button>
                                    </>
                                )}
                                <span className="text-white/20 text-xs font-medium uppercase tracking-widest">{album.photos.length} Photos</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {album.photos.map((photo) => (
                                <div
                                    key={photo.id}
                                    className={`group relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-300 ${photo.is_cover ? 'border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'border-transparent opacity-60 hover:opacity-100 hover:border-white/20'
                                        }`}
                                >
                                    <Image
                                        src={photo.src}
                                        alt={photo.alt}
                                        fill
                                        className="object-cover"
                                    />

                                    {photo.is_cover && (
                                        <div className="absolute top-2 left-2 bg-white text-black text-[8px] font-bold uppercase tracking-widest px-2 py-1 rounded">
                                            Cover
                                        </div>
                                    )}

                                    {!photo.is_cover && (
                                        <button
                                            onClick={() => setAsCover(photo, album.name)}
                                            disabled={updatingId === photo.id}
                                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] uppercase tracking-widest font-bold text-white hover:bg-black/40 disabled:opacity-50"
                                        >
                                            {updatingId === photo.id ? 'Setting...' : 'Set as Cover'}
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
            </div>

            {albums.length === 0 && (
                <div className="text-center py-20 border-2 border-dashed border-white/10 rounded-2xl">
                    <p className="text-white/20 uppercase tracking-[0.3em] text-sm font-light">No albums found in your library</p>
                </div>
            )}
        </div>
    );
}
