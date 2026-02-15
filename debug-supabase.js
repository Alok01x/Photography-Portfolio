const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        const parts = line.split('=');
        env[parts[0].trim()] = parts.slice(1).join('=').trim();
    }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function finalDiagnose() {
    console.log('--- Checking TABLE: photos ---');
    const { data, error } = await supabase.from('photos').select('*');

    if (error) {
        console.log('❌ Error:', error.message);
    } else {
        console.log('✅ Connection successful!');
        console.log('Rows found:', data.length);
        if (data.length > 0) {
            console.log('First Row Data:', JSON.stringify(data[0], null, 2));
        } else {
            console.log('Empty result. This usually means either:');
            console.log('1. The table is actually empty.');
            console.log('2. RLS is enabled but no SELECT policy exists.');
        }
    }
}

finalDiagnose();
