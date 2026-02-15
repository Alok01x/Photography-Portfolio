'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

const navigation = [
    { name: 'Dashboard', href: '/admin', icon: 'Dashboard' },
    { name: 'Photos', href: '/admin/photos', icon: 'Photos' },
    { name: 'Upload', href: '/admin/upload', icon: 'Upload' },
    { name: 'Albums', href: '/admin/albums', icon: 'Albums' },
];

const Icons = {
    Dashboard: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
    ),
    Photos: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    ),
    Upload: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
    ),
    Albums: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
    ),
};

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-black/40 backdrop-blur-xl border-r border-white/5 hidden lg:flex flex-col">
            <div className="p-8">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black font-playfair italic font-bold">A</div>
                    <span className="text-sm tracking-[0.3em] uppercase font-light group-hover:tracking-[0.4em] transition-all duration-500">Portfolio</span>
                </Link>
            </div>

            <nav className="flex-1 px-4 space-y-1">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = Icons[item.icon as keyof typeof Icons];

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 relative group ${isActive ? 'text-white' : 'text-white/40 hover:text-white'
                                }`}
                        >
                            <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                                <Icon />
                            </div>
                            <span className="tracking-widest uppercase text-[0.7rem]">{item.name}</span>

                            {isActive && (
                                <motion.div
                                    layoutId="active-nav"
                                    className="absolute inset-0 bg-white/5 rounded-lg -z-10"
                                    initial={false}
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-8">
                <Link
                    href="/"
                    className="flex items-center gap-2 text-white/30 hover:text-white transition-colors group text-[0.6rem] uppercase tracking-[0.2em] font-medium"
                >
                    <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Site
                </Link>
            </div>
        </aside>
    );
}
