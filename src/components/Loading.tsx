'use client';

export default function Loading() {
    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#09090b] z-[9999]">
            <div className="relative w-24 h-24 mb-8">
                {/* Outer glowing ring */}
                <div className="absolute inset-0 border-4 border-white/5 rounded-full" />

                {/* Orbital pulse */}
                <div className="absolute inset-0 border-4 border-t-cyan-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin duration-700" />

                {/* Inner core pulse */}
                <div className="absolute inset-4 bg-cyan-500/10 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
                </div>
            </div>

            <div className="flex flex-col items-center space-y-2">
                <span className="text-[10px] uppercase tracking-[0.8em] font-black text-white/40 animate-pulse">
                    Initializing
                </span>
                <div className="h-px w-32 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>
        </div>
    );
}
