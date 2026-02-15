'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Transition from '@/components/Transition';
import Loading from '@/components/Loading';
import { AnimatePresence, motion } from 'framer-motion';
import ViewfinderCursor from '@/components/ViewfinderCursor';

export default function RootLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(true);
    const [theme, setTheme] = useState('midnight');

    useEffect(() => {
        // Load initial theme
        const savedTheme = localStorage.getItem('site-theme') || 'midnight';
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);

        // Show loading animation for 2 seconds on initial load
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    const toggleTheme = (newTheme: string) => {
        setTheme(newTheme);
        localStorage.setItem('site-theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    const isAdminRoute = pathname?.startsWith('/admin');

    if (isAdminRoute) {
        return <>{children}</>;
    }

    return (
        <div className="relative">
            <ViewfinderCursor />
            <AnimatePresence mode="wait">
                {isLoading && (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Loading />
                    </motion.div>
                )}
            </AnimatePresence>

            {!isLoading && (
                <>
                    <Navbar currentTheme={theme} onThemeChange={toggleTheme} />
                    <Transition>
                        {children}
                    </Transition>
                    <Footer />
                </>
            )}
        </div>
    );
}
