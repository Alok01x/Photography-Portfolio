/**
 * SUPABASE BULK UPLOADER
 * ----------------------
 * This script uploads all images from a local folder to Supabase Storage
 * and automatically creates the database records for your Gallery.
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 1. CONFIGURATION (Fill this in or ensure .env.local is set)
const SUPABASE_URL = 'https://ioecqexihaxfignbncym.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'YOUR_SERVICE_ROLE_KEY_HERE'; // Find in Project Settings > API
const BUCKET_NAME = 'portfolio-images';
const LOCAL_FOLDER = './images-to-upload'; // Put your pictures in this folder
const ALBUM_NAME = 'My New Album'; // All photos in this batch will get this album name

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function uploadAll() {
    console.log(`🚀 Starting bulk upload from: ${LOCAL_FOLDER}`);

    if (!fs.existsSync(LOCAL_FOLDER)) {
        console.error('❌ Error: Local folder not found. Create a folder named "images-to-upload" first.');
        return;
    }

    const files = fs.readdirSync(LOCAL_FOLDER).filter(file =>
        /\.(jpg|jpeg|png|webp|avif)$/i.test(file)
    );

    console.log(`📸 Found ${files.length} images. Processing...`);

    for (const file of files) {
        const filePath = path.join(LOCAL_FOLDER, file);
        const fileBuffer = fs.readFileSync(filePath);

        console.log(`📤 Uploading: ${file}...`);

        // 1. Upload to Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(`${ALBUM_NAME}/${file}`, fileBuffer, {
                contentType: 'image/jpeg',
                upsert: true
            });

        if (uploadError) {
            console.error(`   ❌ Failed to upload ${file}:`, uploadError.message);
            continue;
        }

        // 2. Get Public URL
        const { data: urlData } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(`${ALBUM_NAME}/${file}`);

        const publicUrl = urlData.publicUrl;

        // 3. Insert into Database Table
        const { error: dbError } = await supabase
            .from('photos')
            .upsert({
                src: publicUrl,
                alt: file.split('.')[0].replace(/-/g, ' '), // Creates a clean title from filename
                album: ALBUM_NAME,
                is_cover: false
            });

        if (dbError) {
            console.error(`   ❌ Failed to save ${file} to database:`, dbError.message);
        } else {
            console.log(`   ✅ Success: ${file}`);
        }
    }

    console.log('\n✨ All done! Refresh your website to see the new photos.');
}

uploadAll();
