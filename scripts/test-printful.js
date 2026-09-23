// scripts/test-printful.js
// Run with: node scripts/test-printful.js
// Loads PRINTFUL_API_KEY from .env.local and pings Printful's API to confirm the key works.

require('dotenv').config({ path: '.env.local' });

const API_KEY = process.env.PRINTFUL_API_KEY;

if (!API_KEY) {
  console.error('Missing PRINTFUL_API_KEY in .env.local');
  process.exit(1);
}

async function testPrintfulKey() {
  try {
    const res = await fetch('https://api.printful.com/stores', {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      console.error(`Printful API error (${res.status}):`, data);
      process.exit(1);
    }

    console.log('Printful key is valid. Store info:');
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Request failed:', err.message);
    process.exit(1);
  }
}

testPrintfulKey();