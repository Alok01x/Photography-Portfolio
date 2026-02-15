const https = require('https');

const urls = [
    'https://ioecqexihaxfignbncym.supabase.co/storage/v1/object/public/portfolio-images/Kasol-Kheergana%20Trek/1771064543049-0-20251004_170647.jpg',
    'https://ioecqexihaxfignbncym.supabase.co/storage/v1/object/public/portfolio-images/Kasol-Kheergana%20Trek/1771064556430-1-20251004_165449.jpg',
    'https://ioecqexihaxfignbncym.supabase.co/storage/v1/object/public/portfolio-images/Kasol-Kheergana%20Trek/1771064574208-2-20251004_135310.jpg'
];

function checkUrl(url) {
    return new Promise((resolve) => {
        https.get(url, (res) => {
            console.log(`\nURL: ${url.split('/').pop()}`);
            console.log(`Status: ${res.statusCode}`);
            console.log(`Content-Type: ${res.headers['content-type']}`);
            console.log(`Content-Length: ${res.headers['content-length']}`);
            resolve(res.statusCode);
        }).on('error', (e) => {
            console.error(`\nError checking ${url}: ${e.message}`);
            resolve(null);
        });
    });
}

async function run() {
    console.log('Testing the 3 most recent uploads...\n');
    for (const url of urls) {
        await checkUrl(url);
    }
}

run();
