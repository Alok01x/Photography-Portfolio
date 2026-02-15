const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkGalleryQuery() {
    console.log('Fetching photos with gallery logic (order by created_at DESC)...');

    const { data, error } = await supabase
        .from('photos')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching:', error.message);
    } else {
        console.log('Successfully fetched', data.length, 'photos');
        console.log('Results (first 2):');
        console.log(JSON.stringify(data.slice(0, 2), null, 2));
    }
}

checkGalleryQuery();
