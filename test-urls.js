const https = require('https');

const urls = [
    'https://ioecqexihaxfignbncym.supabase.co/storage/v1/object/public/portfolio-images/Kasol-Kheergana%20Trek/1771062057613-20251002_170739.jpg',
    'https://ioecqexihaxfignbncym.supabase.co/storage/v1/object/public/portfolio-images/20250102_073804.jpg'
];

function checkUrl(url) {
    return new Promise((resolve) => {
        https.get(url, (res) => {
            console.log(`URL: ${url}`);
            console.log(`Status: ${res.statusCode}`);
            resolve(res.statusCode);
        }).on('error', (e) => {
            console.error(`Error checking ${url}: ${e.message}`);
            resolve(null);
        });
    });
}

async function run() {
    for (const url of urls) {
        await checkUrl(url);
    }
}

run();
