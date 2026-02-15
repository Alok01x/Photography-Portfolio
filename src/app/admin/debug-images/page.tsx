'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

interface Photo {
    id: string;
    src: string;
    alt: string;
    album: string;
    created_at: string;
}

export default function ImageDebugPage() {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);
    const [imageErrors, setImageErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        const fetchPhotos = async () => {
            try {
                const { data, error } = await supabase
                    .from('photos')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(5);

                if (error) throw error;
                if (data) setPhotos(data);
            } catch (error) {
                console.error('Error fetching photos:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPhotos();
    }, []);

    const handleImageError = (id: string, error: any) => {
        console.error(`Image ${id} failed to load:`, error);
        setImageErrors(prev => ({ ...prev, [id]: error.toString() }));
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="p-8 bg-black text-white min-h-screen">
            <h1 className="text-3xl mb-8">Image Debug Page</h1>
            <p className="mb-4 text-gray-400">Showing last 5 photos from database</p>

            <div className="space-y-8">
                {photos.map((photo, index) => (
                    <div key={photo.id} className="border border-gray-700 p-4 rounded-lg">
                        <h3 className="text-xl mb-2">Photo {index + 1}: {photo.alt}</h3>
                        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                            <div>
                                <p><strong>ID:</strong> {photo.id}</p>
                                <p><strong>Album:</strong> {photo.album}</p>
                                <p><strong>Created:</strong> {photo.created_at || 'null'}</p>
                            </div>
                            <div>
                                <p><strong>URL:</strong></p>
                                <p className="text-xs break-all text-blue-400">{photo.src}</p>
                            </div>
                        </div>

                        {/* Test with Next.js Image */}
                        <div className="mb-4">
                            <h4 className="text-sm font-bold mb-2">Next.js Image Component:</h4>
                            <div className="relative w-full max-w-md h-64 bg-gray-800 rounded">
                                <Image
                                    src={photo.src}
                                    alt={photo.alt}
                                    fill
                                    className="object-contain"
                                    onError={(e) => handleImageError(photo.id, 'Next.js Image failed')}
                                    onLoad={() => console.log(`Image ${photo.id} loaded successfully`)}
                                    sizes="(max-width: 768px) 100vw, 500px"
                                />
                            </div>
                            {imageErrors[photo.id] && (
                                <p className="text-red-500 text-sm mt-2">Error: {imageErrors[photo.id]}</p>
                            )}
                        </div>

                        {/* Test with regular img tag */}
                        <div>
                            <h4 className="text-sm font-bold mb-2">Regular img tag:</h4>
                            <img
                                src={photo.src}
                                alt={photo.alt}
                                className="max-w-md h-auto rounded"
                                onError={(e) => {
                                    console.error(`Regular img ${photo.id} failed`);
                                    (e.target as HTMLImageElement).style.border = '2px solid red';
                                }}
                                onLoad={() => console.log(`Regular img ${photo.id} loaded`)}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
