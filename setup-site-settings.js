const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
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

async function setupSiteSettings() {
    console.log('Setting up site_settings table...\n');

    // Read the SQL file
    const sql = fs.readFileSync('create-site-settings-table.sql', 'utf8');

    console.log('⚠️  IMPORTANT: You need to run this SQL in the Supabase SQL Editor');
    console.log('📋 Copy the SQL from: create-site-settings-table.sql');
    console.log('🔗 Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/sql\n');

    console.log('After running the SQL, verify the table exists:');

    // Try to fetch from the table to verify it exists
    const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .single();

    if (error) {
        console.error('❌ Table not found or error:', error.message);
        console.log('\n👉 Please run the SQL script in Supabase SQL Editor first.');
    } else {
        console.log('✅ Table exists and is accessible!');
        console.log('Current settings:', JSON.stringify(data, null, 2));
    }
}

setupSiteSettings();
