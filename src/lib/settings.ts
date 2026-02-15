import { supabase } from './supabase';
import imageCompression from 'browser-image-compression';

export interface SiteSettings {
    id: string;
    // Profile
    profile_image_url: string | null;
    profile_name: string | null;
    profile_bio: string | null;
    // Hero
    hero_background_url: string | null;
    hero_title: string | null;
    hero_subtitle: string | null;
    // Gallery
    gallery_title: string | null;
    // About
    about_content: string | null;
    about_image_url: string | null;
    about_title: string | null;
    about_subtitle: string | null;
    about_stats_exp: string | null;
    about_stats_locations: string | null;
    about_stats_captures: string | null;
    // Profile Extended
    profile_role: string | null;
    profile_label: string | null;
    profile_long_bio: string | null;
    profile_expertise: string | null;
    profile_gear: any;
    // Contact
    contact_email: string | null;
    contact_phone: string | null;
    contact_address: string | null;
    contact_title: string | null;
    contact_subtitle: string | null;
    contact_insta_qr_url: string | null;
    // Social
    social_instagram: string | null;
    social_facebook: string | null;
    social_twitter: string | null;
    social_linkedin: string | null;
    // Metadata
    created_at: string;
    updated_at: string;
}

/**
 * Fetch site settings from Supabase
 * Returns the single settings record
 */
export async function getSiteSettings(): Promise<SiteSettings | null> {
    try {
        const { data, error } = await supabase
            .from('site_settings')
            .select('*')
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        return null;
    }
}

/**
 * Update site settings
 * @param updates Partial settings object with fields to update
 */
export async function updateSiteSettings(updates: Partial<SiteSettings>): Promise<boolean> {
    try {
        const { data, error } = await supabase
            .from('site_settings')
            .update(updates)
            .eq('id', '00000000-0000-0000-0000-000000000001')
            .select();

        if (error) {
            throw error;
        }

        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Compress image before upload to optimize large files
 * @param file The original image file
 * @returns Compressed image file
 */
async function compressImage(file: File): Promise<File> {
    const options = {
        maxSizeMB: 10, // Allow up to 10MB to preserve quality
        maxWidthOrHeight: 2560, // Higher resolution (2K)
        useWebWorker: true,
        initialQuality: 0.95, // High quality (95%)
        alwaysKeepResolution: false,
    };

    try {
        // Only compress if file is very large (> 10MB)
        if (file.size > 10 * 1024 * 1024) {
            const compressedFile = await imageCompression(file, options);
            return compressedFile;
        }

        return file;
    } catch (error) {
        return file; // Return original if compression fails
    }
}

/**
 * Upload an image to the settings folder in Supabase Storage
 * @param file The image file to upload
 * @param type The type of image (profile, hero, about, contact)
 * @returns The public URL of the uploaded image
 */
export async function uploadSettingsImage(
    file: File,
    type: 'profile' | 'hero' | 'about' | 'contact'
): Promise<string | null> {
    try {
        // Only compress very large files (> 10MB) to preserve quality
        const fileToUpload = file.size > 10 * 1024 * 1024
            ? await compressImage(file)
            : file;

        const fileExt = fileToUpload.name.split('.').pop() || 'jpg';
        const fileName = `${type}-${Date.now()}.${fileExt}`;
        const filePath = `settings/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('portfolio-images')
            .upload(filePath, fileToUpload, {
                contentType: fileToUpload.type,
                upsert: true
            });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
            .from('portfolio-images')
            .getPublicUrl(filePath);

        return urlData.publicUrl;
    } catch (error) {
        return null;
    }
}
