const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Manual env parsing
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyData() {
    console.log('Fetching photos from Supabase...');
    const { data, error } = await supabase
        .from('photos')
        .select('*');

    if (error) {
        console.error('Error fetching data:', error.message);
    } else {
        console.log('Successfully fetched', data.length, 'photos:');
        console.log(JSON.stringify(data, null, 2));
    }
}

verifyData();
