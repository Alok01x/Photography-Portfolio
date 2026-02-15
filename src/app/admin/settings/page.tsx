'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getSiteSettings, updateSiteSettings, uploadSettingsImage, SiteSettings } from '@/lib/settings';
import { useRouter } from 'next/navigation';

type TabType = 'profile' | 'hero' | 'galleries' | 'about' | 'contact';

export default function SettingsPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabType>('profile');
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        profile_name: '',
        profile_bio: '',
        hero_title: '',
        hero_subtitle: '',
        about_content: '',
        about_title: '',
        about_subtitle: '',
        about_stats_exp: '',
        about_stats_locations: '',
        about_stats_captures: '',
        gallery_title: '',
        profile_role: '',
        profile_label: '',
        profile_long_bio: '',
        profile_expertise: '',
        profile_gear: '',
        contact_email: '',
        contact_phone: '',
        contact_address: '',
        contact_title: '',
        contact_subtitle: '',
        social_instagram: '',
        social_facebook: '',
        social_twitter: '',
        social_linkedin: '',
    });

    // Image previews
    const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
    const [heroImagePreview, setHeroImagePreview] = useState<string | null>(null);
    const [aboutImagePreview, setAboutImagePreview] = useState<string | null>(null);
    const [contactQRPreview, setContactQRPreview] = useState<string | null>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    async function fetchSettings() {
        const data = await getSiteSettings();
        if (data) {
            setSettings(data);
            setFormData({
                profile_name: data.profile_name || '',
                profile_bio: data.profile_bio || '',
                hero_title: data.hero_title || '',
                hero_subtitle: data.hero_subtitle || '',
                about_content: data.about_content || '',
                about_title: data.about_title || 'About Me',
                about_subtitle: data.about_subtitle || 'The Story',
                about_stats_exp: data.about_stats_exp || '10+',
                about_stats_locations: data.about_stats_locations || '50+',
                about_stats_captures: data.about_stats_captures || '1M+',
                gallery_title: data.gallery_title || 'Shutter Stories & Soulful Shots',
                profile_role: data.profile_role || 'Founder & Lead Photographer',
                profile_label: data.profile_label || 'The Visionary',
                profile_long_bio: data.profile_long_bio || '',
                profile_expertise: data.profile_expertise || 'Landscape Photography, Architectural Documentation, Cinematic Portraits, Visual Storytelling',
                profile_gear: typeof data.profile_gear === 'string' ? data.profile_gear : JSON.stringify(data.profile_gear, null, 2) || '',
                contact_email: data.contact_email || '',
                contact_phone: data.contact_phone || '',
                contact_address: data.contact_address || '',
                contact_title: data.contact_title || 'Get in Touch',
                contact_subtitle: data.contact_subtitle || 'Whether you\'re interested in a collaboration, print sales, or just want to say hello.',
                social_instagram: data.social_instagram || '',
                social_facebook: data.social_facebook || '',
                social_twitter: data.social_twitter || '',
                social_linkedin: data.social_linkedin || '',
            });
            setProfileImagePreview(data.profile_image_url);
            setHeroImagePreview(data.hero_background_url);
            setAboutImagePreview(data.about_image_url);
            setContactQRPreview(data.contact_insta_qr_url);
        }
        setLoading(false);
    }

    async function handleImageUpload(
        e: React.ChangeEvent<HTMLInputElement>,
        type: 'profile' | 'hero' | 'about' | 'contact'
    ) {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);
        const url = await uploadSettingsImage(file, type);

        if (url) {
            // Update preview
            if (type === 'profile') setProfileImagePreview(url);
            else if (type === 'hero') setHeroImagePreview(url);
            else if (type === 'about') setAboutImagePreview(url);
            else setContactQRPreview(url);

            // Update in database with correct field names
            let fieldName: string;
            if (type === 'profile') fieldName = 'profile_image_url';
            else if (type === 'hero') fieldName = 'hero_background_url';
            else if (type === 'about') fieldName = 'about_image_url';
            else fieldName = 'contact_insta_qr_url';

            const success = await updateSiteSettings({ [fieldName]: url });

            if (success) {
                alert('Image uploaded successfully!');
                await fetchSettings(); // Refresh settings to confirm save
            } else {
                alert('Image uploaded but failed to save to database. Check console for errors.');
            }
        } else {
            alert('Failed to upload image');
        }

        setUploadingImage(false);
    }

    async function handleSave() {
        setSaving(true);

        // Parse gear back to JSON if it's a string
        let gearJson = formData.profile_gear;
        if (typeof formData.profile_gear === 'string' && formData.profile_gear.trim()) {
            try {
                gearJson = JSON.parse(formData.profile_gear);
            } catch (e) {
                alert('Invalid JSON in Gear List. Please check the format. Example: [ { "category": "Camera", "item": "Sony A7" } ]');
                setSaving(false);
                return;
            }
        }

        const success = await updateSiteSettings({
            ...formData,
            profile_gear: gearJson
        });

        if (success) {
            alert('Settings saved successfully!');
            fetchSettings();
        } else {
            alert('Failed to save settings');
        }
        setSaving(false);
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
        );
    }

    const tabs: { id: TabType; label: string; icon: string }[] = [
        { id: 'profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
        { id: 'hero', label: 'Hero Section', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
        { id: 'galleries', label: 'Galleries', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z' },
        { id: 'about', label: 'About Page', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
        { id: 'contact', label: 'Contact Info', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    ];

    return (
        <div>
            <div className="mb-12">
                <h1 className="text-4xl font-playfair italic mb-2">Settings.</h1>
                <p className="text-white/40 uppercase tracking-[0.2em] text-xs">Customize your portfolio</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-8 border-b border-white/10">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors relative ${activeTab === tab.id
                            ? 'text-white'
                            : 'text-white/40 hover:text-white/60'
                            }`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon} />
                        </svg>
                        {tab.label}
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="max-w-3xl">
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <div className="space-y-6">
                        <div>
                            <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold ml-1 mb-2 block">
                                Profile Picture
                            </label>
                            <p className="text-xs text-white/40 mb-3 ml-1">
                                💡 Tip: Use a square image with your face centered. This will be displayed as a circular icon in the navbar.
                            </p>
                            <div className="flex items-start gap-6">
                                <div className="space-y-3">
                                    <div className="relative w-32 h-32 rounded-full overflow-hidden bg-white/5 border border-white/10">
                                        {profileImagePreview ? (
                                            <Image src={profileImagePreview} alt="Profile" fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-white/20">
                                                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-white/30 text-center">Navbar Preview</p>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <label className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm cursor-pointer transition-colors">
                                        {uploadingImage ? 'Uploading...' : 'Upload New'}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => handleImageUpload(e, 'profile')}
                                            disabled={uploadingImage}
                                        />
                                    </label>
                                    <p className="text-xs text-white/30 max-w-xs">
                                        Best results: Square image (1:1 ratio) with face centered
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold ml-1 mb-2 block">
                                Name
                            </label>
                            <input
                                type="text"
                                value={formData.profile_name}
                                onChange={(e) => setFormData({ ...formData, profile_name: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/20 transition-colors"
                                placeholder="Your Name"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold ml-1 mb-2 block">
                                Bio
                            </label>
                            <textarea
                                value={formData.profile_bio}
                                onChange={(e) => setFormData({ ...formData, profile_bio: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/20 transition-colors h-24 resize-none"
                                placeholder="Short bio line..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold ml-1 mb-2 block">
                                    Professional Role
                                </label>
                                <input
                                    type="text"
                                    value={formData.profile_role}
                                    onChange={(e) => setFormData({ ...formData, profile_role: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/20 transition-colors"
                                    placeholder="Founder & Lead Photographer"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold ml-1 mb-2 block">
                                    Label / Vision
                                </label>
                                <input
                                    type="text"
                                    value={formData.profile_label}
                                    onChange={(e) => setFormData({ ...formData, profile_label: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/20 transition-colors"
                                    placeholder="The Visionary"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold ml-1 mb-2 block">
                                Long Bio / Description
                            </label>
                            <textarea
                                value={formData.profile_long_bio}
                                onChange={(e) => setFormData({ ...formData, profile_long_bio: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/20 transition-colors h-48 resize-none"
                                placeholder="Full profile description..."
                            />
                        </div>

                        <div>
                            <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold ml-1 mb-2 block">
                                Expertise (Comma separated)
                            </label>
                            <input
                                type="text"
                                value={formData.profile_expertise}
                                onChange={(e) => setFormData({ ...formData, profile_expertise: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/20 transition-colors"
                                placeholder="Landscape Photography, Cinematic Portraits..."
                            />
                        </div>

                        <div>
                            <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold ml-1 mb-2 block">
                                Gear List (JSON Format)
                            </label>
                            <textarea
                                value={formData.profile_gear}
                                onChange={(e) => setFormData({ ...formData, profile_gear: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-mono focus:outline-none focus:border-white/20 transition-colors h-48 resize-none"
                                placeholder="[ { 'category': 'Camera', 'item': 'Sony A7' } ]"
                            />
                        </div>
                    </div>
                )}

                {/* Hero Tab */}
                {activeTab === 'hero' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold ml-1 mb-3 block">
                                    Background Image
                                </label>
                                <div className="space-y-4">
                                    {heroImagePreview && (
                                        <div className="relative w-full h-64 rounded-xl overflow-hidden bg-white/5 border border-white/10">
                                            <Image src={heroImagePreview} alt="Hero Background" fill className="object-cover" />
                                        </div>
                                    )}
                                    <label className="inline-block px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm cursor-pointer transition-colors">
                                        {uploadingImage ? 'Uploading...' : heroImagePreview ? 'Change Background' : 'Upload Background'}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => handleImageUpload(e, 'hero')}
                                            disabled={uploadingImage}
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold ml-1 mb-2 block">
                                Title
                            </label>
                            <input
                                type="text"
                                value={formData.hero_title}
                                onChange={(e) => setFormData({ ...formData, hero_title: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/20 transition-colors"
                                placeholder="The Art of Seeing."
                            />
                        </div>

                        <div>
                            <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold ml-1 mb-2 block">
                                Subtitle
                            </label>
                            <textarea
                                value={formData.hero_subtitle}
                                onChange={(e) => setFormData({ ...formData, hero_subtitle: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/20 transition-colors h-24 resize-none"
                                placeholder="Narrating the silent beauty of existence through light, shadow, and soul."
                            />
                        </div>
                    </div>
                )}

                {/* Galleries Tab */}
                {activeTab === 'galleries' && (
                    <div className="space-y-6">
                        <div>
                            <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold ml-1 mb-2 block">
                                Gallery Main Title
                            </label>
                            <input
                                type="text"
                                value={formData.gallery_title}
                                onChange={(e) => setFormData({ ...formData, gallery_title: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/20 transition-colors"
                                placeholder="Shutter Stories & Soulful Shots"
                            />
                        </div>
                    </div>
                )}

                {/* About Tab */}
                {activeTab === 'about' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold ml-1 mb-2 block">
                                    Page Title
                                </label>
                                <input
                                    type="text"
                                    value={formData.about_title}
                                    onChange={(e) => setFormData({ ...formData, about_title: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/20 transition-colors"
                                    placeholder="About Me"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold ml-1 mb-2 block">
                                    Subtitle
                                </label>
                                <input
                                    type="text"
                                    value={formData.about_subtitle}
                                    onChange={(e) => setFormData({ ...formData, about_subtitle: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/20 transition-colors"
                                    placeholder="The Story"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold ml-1 mb-3 block">
                                About Image
                            </label>
                            <div className="space-y-4">
                                {aboutImagePreview && (
                                    <div className="relative w-full h-64 rounded-xl overflow-hidden bg-white/5 border border-white/10">
                                        <Image src={aboutImagePreview} alt="About" fill className="object-cover" />
                                    </div>
                                )}
                                <label className="inline-block px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm cursor-pointer transition-colors">
                                    {uploadingImage ? 'Uploading...' : aboutImagePreview ? 'Change Image' : 'Upload Image'}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => handleImageUpload(e, 'about')}
                                        disabled={uploadingImage}
                                    />
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold ml-1 mb-2 block">
                                About Content
                            </label>
                            <textarea
                                value={formData.about_content}
                                onChange={(e) => setFormData({ ...formData, about_content: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/20 transition-colors h-64 resize-none"
                                placeholder="Share your story here..."
                            />
                        </div>

                        <div className="pt-6 border-t border-white/10">
                            <h3 className="text-sm font-medium mb-4 text-white/60 uppercase tracking-widest">Statistics</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold ml-1 mb-2 block">
                                        Years Experience
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.about_stats_exp}
                                        onChange={(e) => setFormData({ ...formData, about_stats_exp: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/20 transition-colors"
                                        placeholder="10+"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold ml-1 mb-2 block">
                                        Locations
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.about_stats_locations}
                                        onChange={(e) => setFormData({ ...formData, about_stats_locations: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/20 transition-colors"
                                        placeholder="50+"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold ml-1 mb-2 block">
                                        Captures
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.about_stats_captures}
                                        onChange={(e) => setFormData({ ...formData, about_stats_captures: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/20 transition-colors"
                                        placeholder="1M+"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Contact Tab */}
                {activeTab === 'contact' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold ml-1 mb-2 block">
                                    Page Title
                                </label>
                                <input
                                    type="text"
                                    value={formData.contact_title}
                                    onChange={(e) => setFormData({ ...formData, contact_title: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/20 transition-colors"
                                    placeholder="Get in Touch"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold ml-1 mb-2 block">
                                    Page Subtitle
                                </label>
                                <textarea
                                    value={formData.contact_subtitle}
                                    onChange={(e) => setFormData({ ...formData, contact_subtitle: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/20 transition-colors h-24 resize-none"
                                    placeholder="Whether you're interested in a collaboration..."
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold ml-1 mb-2 block">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={formData.contact_email}
                                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/20 transition-colors"
                                    placeholder="your@email.com"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold ml-1 mb-2 block">
                                    Phone
                                </label>
                                <input
                                    type="tel"
                                    value={formData.contact_phone}
                                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/20 transition-colors"
                                    placeholder="+1 (555) 123-4567"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold ml-1 mb-2 block">
                                    Address
                                </label>
                                <textarea
                                    value={formData.contact_address}
                                    onChange={(e) => setFormData({ ...formData, contact_address: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/20 transition-colors h-24 resize-none"
                                    placeholder="123 Main St, City, State 12345"
                                />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/10">
                            <h3 className="text-sm font-medium mb-4 text-white/60 uppercase tracking-widest">Social Media</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold ml-1 mb-2 block">
                                        Instagram Username
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.social_instagram}
                                        onChange={(e) => setFormData({ ...formData, social_instagram: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/20 transition-colors"
                                        placeholder="@username"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold ml-1 mb-2 block">
                                        Facebook
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.social_facebook}
                                        onChange={(e) => setFormData({ ...formData, social_facebook: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/20 transition-colors"
                                        placeholder="facebook.com/username"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold ml-1 mb-2 block">
                                        Twitter
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.social_twitter}
                                        onChange={(e) => setFormData({ ...formData, social_twitter: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/20 transition-colors"
                                        placeholder="@username"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold ml-1 mb-2 block">
                                        LinkedIn
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.social_linkedin}
                                        onChange={(e) => setFormData({ ...formData, social_linkedin: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/20 transition-colors"
                                        placeholder="linkedin.com/in/username"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Save Button */}
                <div className="flex gap-4 pt-8 border-t border-white/10 mt-8">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-8 py-3 bg-white text-black rounded-lg text-sm uppercase tracking-widest font-bold hover:bg-white/90 transition-colors disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                        onClick={() => router.push('/admin')}
                        className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm uppercase tracking-widest font-bold transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
