'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, useScroll, useSpring, useTransform } from 'framer-motion';
import { getSiteSettings } from '@/lib/settings';
import { usePathname } from 'next/navigation';

interface NavbarProps {
  currentTheme?: string;
  onThemeChange?: (theme: string) => void;
}

export default function Navbar({ currentTheme = 'midnight', onThemeChange }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { scrollY } = useScroll();

  const [mounted, setMounted] = useState(false);
  const [activeHash, setActiveHash] = useState('');

  const themes = [
    { id: 'midnight', icon: 'M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z', color: 'text-blue-400' },
    { id: 'golden', icon: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z', color: 'text-amber-400' },
    { id: 'studio', icon: 'M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z', color: 'text-foreground' },
  ];

  useEffect(() => {
    setMounted(true);
    async function loadProfileImage() {
      const settings = await getSiteSettings();
      if (settings?.profile_image_url) {
        setProfileImage(settings.profile_image_url);
      }
    }
    loadProfileImage();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      // Only update active hash based on scroll position if we are on the home page
      if (pathname === '/') {
        const gallerySection = document.getElementById('gallery');
        if (gallerySection) {
          const rect = gallerySection.getBoundingClientRect();
          // Adjust detection range as needed
          if (rect.top < 300 && rect.bottom > 300) {
            setActiveHash('#gallery');
          } else {
            setActiveHash('');
          }
        }
      } else {
        // Reset active hash if we are on other pages (About, Contact, Profile)
        setActiveHash(prev => (prev !== '' ? '' : prev));
      }
    };

    // Call handleScroll once on mount/pathname change to set initial state
    handleScroll();

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Gallery', href: '/#gallery' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const isActive = (href: string) => {
    // For Gallery link (hash-based)
    if (href.includes('#')) {
      const hash = href.split('#')[1];
      return pathname === '/' && activeHash === `#${hash}`;
    }

    // For Home link specifically (only highlight if on home page and not scrolled to gallery)
    if (href === '/') {
      return pathname === '/' && activeHash === '';
    }

    // For other links (About, Contact, etc.)
    return pathname === href;
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    if (pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setActiveHash('');
    }
  };

  const handleGalleryClick = (e: React.MouseEvent) => {
    if (pathname === '/') {
      e.preventDefault();
      const element = document.getElementById('gallery');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        setActiveHash('#gallery');
      }
    }
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="fixed top-8 left-0 w-full z-[1000] flex justify-center px-4 pointer-events-none">
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={mounted ? { y: 0, opacity: 1 } : {}}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        className={`pointer-events-auto relative flex items-center gap-1 md:gap-2 p-1.5 md:p-2 rounded-full border border-foreground/10 shadow-2xl backdrop-blur-3xl transition-all duration-500 ${scrolled ? 'bg-background/80 scale-95 shadow-xl' : 'bg-background/5 scale-100'
          }`}
      >
        {/* Subtle inner glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/5 to-transparent pointer-events-none rounded-full" />

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden flex items-center justify-center w-9 h-9 rounded-full bg-foreground/10 text-foreground relative z-20"
        >
          <AnimatePresence mode="wait">
            {isMobileMenuOpen ? (
              <motion.svg key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </motion.svg>
            ) : (
              <motion.svg key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
              </motion.svg>
            )}
          </AnimatePresence>
        </button>

        {/* Desktop Nav Items (Hide on mobile menu open if needed, but here we just hide on small screens) */}
        <div className="hidden md:flex items-center gap-1 bg-foreground/5 p-1 rounded-full border border-foreground/5">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={link.href === '/#gallery' ? handleGalleryClick : undefined}
              className="relative px-4 py-2 text-[0.7rem] tracking-[0.1em] uppercase font-medium group transition-all"
            >
              <span className={`relative z-10 transition-colors duration-300 ${isActive(link.href) ? 'text-background font-bold' : 'text-foreground/50 group-hover:text-foreground/80'
                }`}>
                {link.name}
              </span>

              {isActive(link.href) && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 bg-foreground rounded-full shadow-[0_0_20px_rgba(var(--foreground),0.4)]"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}

              <motion.div
                className="absolute inset-0 bg-foreground/10 opacity-0 group-hover:opacity-100 rounded-full transition-opacity"
                whileHover={{ scale: 1.05 }}
              />
            </Link>
          ))}
        </div>

        {/* Mobile Expanding Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="absolute top-[120%] left-0 w-full bg-background/95 backdrop-blur-3xl border border-foreground/10 rounded-[2.5rem] p-3 shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col gap-1.5 md:hidden z-50"
            >
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={(e) => {
                    if (link.href === '/#gallery') handleGalleryClick(e);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`px-6 py-4 rounded-2xl text-xs uppercase tracking-[0.2em] font-black transition-all ${isActive(link.href) ? 'bg-foreground text-background' : 'bg-foreground/5 text-foreground/50'}`}
                >
                  {link.name}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Theme Toggle */}
        <div className="flex items-center gap-0.5 bg-foreground/10 p-1 rounded-full border border-foreground/5">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => onThemeChange?.(t.id)}
              className={`relative w-8 h-8 flex items-center justify-center rounded-full transition-all ${currentTheme === t.id ? 'bg-foreground/10 font-bold scale-110' : 'hover:bg-foreground/5 opacity-40 hover:opacity-100'
                }`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`w-3.5 h-3.5 z-10 ${currentTheme === t.id ? t.color : 'text-foreground/30'}`}>
                <path strokeLinecap="round" strokeLinejoin="round" d={t.icon} />
              </svg>
              {currentTheme === t.id && (
                <motion.div
                  layoutId="active-theme"
                  className="absolute inset-0 bg-foreground/10 rounded-full"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Profile Link */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="ml-0.5 md:ml-1"
        >
          <Link
            href="/profile"
            className="relative flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-foreground/20 to-foreground/5 border border-foreground/20 overflow-hidden shadow-inner group"
          >
            {profileImage ? (
              <Image
                src={profileImage}
                alt="Profile"
                width={40}
                height={40}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 opacity-60 group-hover:opacity-100 transition-opacity text-foreground">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
            )}
            <div className="absolute inset-0 bg-gradient-to-tr from-foreground/20 via-transparent to-transparent pointer-events-none" />
          </Link>
        </motion.div>
      </motion.nav>
    </div>
  );
}
