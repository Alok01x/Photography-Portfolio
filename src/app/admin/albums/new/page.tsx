'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function NewAlbumPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setLoading(true);
        try {
            const { error } = await supabase
                .from('albums')
                .insert({ name: name.trim() });

            if (error) throw error;

            router.push('/admin/albums');
        } catch (err: any) {
            alert('Error creating album: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-12">
                <h1 className="text-4xl font-playfair italic mb-2">New Album.</h1>
                <p className="text-white/40 uppercase tracking-[0.2em] text-xs">Create a new collection for your masterpieces</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm space-y-8">
                <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold ml-1">Album Name</label>
                    <input
                        type="text"
                        placeholder="e.g. Street Photography"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/20 transition-colors"
                        required
                        autoFocus
                    />
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
                        disabled={loading || !name.trim()}
                        className="flex-[2] py-4 bg-white text-black rounded-xl text-xs uppercase tracking-[0.2em] font-bold hover:bg-white/90 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? "Creating..." : "Create Album"}
                    </button>
                </div>
            </form>
        </div>
    );
}
