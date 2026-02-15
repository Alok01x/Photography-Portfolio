'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import imageCompression from 'browser-image-compression';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';

function UploadForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialAlbum = searchParams.get('album') || '';

    const [uploading, setUploading] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [uploadStatus, setUploadStatus] = useState({ current: 0, total: 0 });
    const [albums, setAlbums] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        album: initialAlbum,
        category: 'Landscape',
        alt: '',
        aspect: 'square'
    });

    useEffect(() => {
        fetchAlbums();
    }, []);

    async function fetchAlbums() {
        const { data } = await supabase.from('albums').select('*').order('name');
        if (data) setAlbums(data);
    }

    useEffect(() => {
        if (initialAlbum) {
            setFormData(prev => ({ ...prev, album: initialAlbum }));
        }
    }, [initialAlbum]);

    const [isDragging, setIsDragging] = useState(false);

    const handleFiles = (selectedFiles: File[]) => {
        if (selectedFiles.length > 0) {
            // Additive selection
            setFiles(prev => [...prev, ...selectedFiles]);

            selectedFiles.forEach((file) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviews(prev => [...prev, reader.result as string]);
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFiles(Array.from(e.target.files || []));
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragover' || e.type === 'dragenter') setIsDragging(true);
        else if (e.type === 'dragleave' || e.type === 'drop') setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
        handleFiles(droppedFiles);
    };

    const clearSelection = () => {
        setFiles([]);
        setPreviews([]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (files.length === 0) return;

        setUploading(true);
        setUploadStatus({ current: 0, total: files.length });

        try {
            const albumName = formData.album || 'Uncategorized';

            if (albumName !== 'Uncategorized') {
                await supabase.from('albums').upsert({ name: albumName }, { onConflict: 'name' });
            }

            // Compression helper function
            const compressImage = async (file: File): Promise<File> => {
                const options = {
                    maxSizeMB: 10,
                    maxWidthOrHeight: 2560,
                    useWebWorker: true,
                    initialQuality: 0.95,
                    alwaysKeepResolution: false,
                };

                try {
                    // Only compress if file is very large (> 10MB)
                    if (file.size > 10 * 1024 * 1024) {
                        console.log(`Compressing ${file.name}: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
                        const compressed = await imageCompression(file, options);
                        console.log(`Compressed to: ${(compressed.size / 1024 / 1024).toFixed(2)} MB`);
                        return compressed;
                    }
                    return file;
                } catch (error) {
                    console.error('Compression error:', error);
                    return file;
                }
            };

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                setUploadStatus(prev => ({ ...prev, current: i + 1 }));

                // Compress image if needed
                const fileToUpload = await compressImage(file);

                // Add index to prevent filename collisions when uploading multiple files
                const fileName = `${Date.now()}-${i}-${fileToUpload.name.replace(/\s/g, '_')}`;
                const storagePath = `${albumName}/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('portfolio-images')
                    .upload(storagePath, fileToUpload, {
                        contentType: fileToUpload.type,
                        upsert: true
                    });

                if (uploadError) throw uploadError;

                const { data: urlData } = supabase.storage
                    .from('portfolio-images')
                    .getPublicUrl(storagePath);

                const publicUrl = urlData.publicUrl;

                const { error: dbError } = await supabase
                    .from('photos')
                    .insert({
                        src: publicUrl,
                        alt: formData.alt || fileToUpload.name.split('.')[0],
                        album: albumName,
                        category: formData.category,
                        aspect: formData.aspect,
                        is_cover: false,
                        created_at: new Date().toISOString()
                    });

                if (dbError) throw dbError;
            }

            router.push('/admin/photos');
        } catch (err: any) {
            alert('Error: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-12">
                <h1 className="text-4xl font-playfair italic mb-2">Upload.</h1>
                <p className="text-white/40 uppercase tracking-[0.2em] text-xs">Add new masterpieces to your collection</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Upload Form */}
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center ml-1">
                            <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Photo Files</label>
                            {files.length > 0 && (
                                <button
                                    type="button"
                                    onClick={clearSelection}
                                    className="text-[10px] text-white/20 hover:text-white uppercase tracking-widest transition-colors"
                                >
                                    Clear All
                                </button>
                            )}
                        </div>
                        <div
                            className="relative group"
                            onDragOver={handleDrag}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDrop={handleDrop}
                        >
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                                id="file-upload"
                                multiple
                            />
                            <label
                                htmlFor="file-upload"
                                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-12 transition-all cursor-pointer group ${isDragging ? 'border-white bg-white/10' : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                                    }`}
                            >
                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-white/40 group-hover:text-white">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                                <p className="text-sm text-white/60 font-medium group-hover:text-white transition-colors">
                                    {files.length > 0 ? `${files.length} images selected` : "Select or drop images"}
                                </p>
                                <p className="text-[10px] text-white/30 uppercase tracking-widest mt-2">{isDragging ? "Drop to add" : "JPG, PNG, WEBP, AVIF"}</p>
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold ml-1">Album Name</label>
                            <input
                                type="text"
                                list="album-list"
                                placeholder="Select or type new"
                                value={formData.album}
                                onChange={(e) => setFormData({ ...formData, album: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/20 transition-colors"
                                required
                            />
                            <datalist id="album-list">
                                {albums.map(a => (
                                    <option key={a.id} value={a.name} />
                                ))}
                            </datalist>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold ml-1">Category (Sub-filter)</label>
                            <div className="relative">
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-10 text-sm text-white focus:outline-none focus:border-white/20 transition-colors appearance-none cursor-pointer"
                                >
                                    <option value="Landscape" className="bg-black text-white">Landscape</option>
                                    <option value="Portrait" className="bg-black text-white">Portrait</option>
                                    <option value="Street" className="bg-black text-white">Street</option>
                                    <option value="Wildlife" className="bg-black text-white">Wildlife</option>
                                    <option value="Architecture" className="bg-black text-white">Architecture</option>
                                    <option value="Abstract" className="bg-black text-white">Abstract</option>
                                    <option value="Cinematic" className="bg-black text-white">Cinematic</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold ml-1">Aspect Ratio</label>
                            <div className="relative">
                                <select
                                    value={formData.aspect}
                                    onChange={(e) => setFormData({ ...formData, aspect: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-10 text-sm text-white focus:outline-none focus:border-white/20 transition-colors appearance-none cursor-pointer"
                                >
                                    <option value="square" className="bg-black text-white">Square</option>
                                    <option value="tall" className="bg-black text-white">Tall (Portrait)</option>
                                    <option value="wide" className="bg-black text-white">Wide (Landscape)</option>
                                    <option value="ultraWide" className="bg-black text-white">Ultra Wide</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold ml-1">Title / Description (Alt)</label>
                        <textarea
                            placeholder="Optional: A description for all photos..."
                            value={formData.alt}
                            onChange={(e) => setFormData({ ...formData, alt: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/20 transition-colors h-32 resize-none"
                        />
                        <p className="text-[8px] text-white/20 uppercase tracking-widest ml-1">If blank, filename will be used as title</p>
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="flex-1 py-4 border border-white/20 text-white rounded-xl text-xs uppercase tracking-[0.2em] font-bold hover:bg-white/5 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={uploading || files.length === 0}
                            className="flex-[2] py-4 bg-white text-black rounded-xl text-xs uppercase tracking-[0.2em] font-bold hover:bg-white/90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {uploading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                    Uploading ({uploadStatus.current}/{uploadStatus.total})...
                                </span>
                            ) : `Upload ${files.length || ''} Masterpiece${files.length === 1 ? '' : 's'}`}
                        </button>
                    </div>
                </form>

                {/* Preview Section */}
                <div className="hidden lg:block border-l border-white/5 pl-12">
                    <div className="sticky top-12">
                        <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold ml-1 mb-6 block text-center">Batch Preview</label>
                        <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-4 bg-white/5 border border-white/10 rounded-2xl custom-scrollbar relative shadow-2xl">
                            {previews.length > 0 ? (
                                previews.map((preview, idx) => (
                                    <div key={idx} className="aspect-square rounded-lg overflow-hidden relative group">
                                        <img
                                            src={preview}
                                            alt={`Preview ${idx}`}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-x-0 bottom-0 p-3 bg-black/80">
                                            <p className="text-white/40 text-[8px] uppercase tracking-widest truncate">{formData.album || 'Album'}</p>
                                            <p className="text-white text-[10px] font-playfair italic underline truncate underline-offset-2 decoration-white/20">{formData.alt || files[idx]?.name || 'Photo'}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-2 aspect-[4/5] flex items-center justify-center text-white/10 uppercase tracking-widest text-[10px]">No images selected</div>
                            )}
                        </div>
                        <div className="mt-8 p-6 border border-white/5 rounded-2xl bg-white/2 text-center">
                            <p className="text-white/40 text-[10px] uppercase tracking-widest mb-2 font-bold opacity-50">Bulk Metadata</p>
                            <div className="space-y-1">
                                <p className="text-white text-sm font-playfair italic capitalize">{formData.album || 'Uncategorized'}</p>
                                <p className="text-white/40 text-[10px] uppercase tracking-[0.2em]">{formData.aspect} ratio</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function UploadPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-[60vh]">
                <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
        }>
            <UploadForm />
        </Suspense>
    );
}
