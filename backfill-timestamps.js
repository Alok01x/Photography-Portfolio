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

async function backfillCreatedAt() {
    console.log('Backfilling created_at for photos...');

    const { data: photos, error: fetchError } = await supabase
        .from('photos')
        .select('id')
        .is('created_at', null);

    if (fetchError) {
        console.error('Error fetching null created_at rows:', fetchError.message);
        return;
    }

    console.log(`Found ${photos.length} rows to update.`);

    for (const photo of photos) {
        const { error: updateError } = await supabase
            .from('photos')
            .update({ created_at: new Date().toISOString() })
            .eq('id', photo.id);

        if (updateError) {
            console.error(`Error updating photo ${photo.id}:`, updateError.message);
        } else {
            console.log(`Updated photo ${photo.id}`);
        }
    }
}

backfillCreatedAt();
