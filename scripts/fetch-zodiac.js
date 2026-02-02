#!/usr/bin/env node
// Node.js script to fetch Zodiac Killer case files

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const API_URL = process.env.API_URL || 'http://localhost:3000';
const OUTPUT_FILE = path.join(__dirname, '..', 'zodiac-killer-case.json');

async function fetchZodiacCase() {
  return new Promise((resolve, reject) => {
    const url = new URL(`${API_URL}/api/cases/fetch-public?case=zodiac`);
    const protocol = url.protocol === 'https:' ? https : http;
    
    protocol.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (error) {
          reject(new Error('Failed to parse response'));
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('🔍 Fetching Zodiac Killer case files...\n');
  
  try {
    const result = await fetchZodiacCase();
    
    if (result.error) {
      console.error('❌ Error:', result.error);
      process.exit(1);
    }
    
    // Save to file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result.case, null, 2));
    
    console.log('✅ Zodiac Killer case data saved to:', OUTPUT_FILE);
    console.log('\nCase Details:');
    console.log(`  Title: ${result.case.title}`);
    console.log(`  Date: ${result.case.date}`);
    console.log(`  Evidence Items: ${result.case.evidence.length}`);
    console.log(`  Status: ${result.case.status}`);
    console.log('\nTo import into AI Detective:');
    console.log('1. Open the app (npm run dev)');
    console.log('2. Click "Fetch Public" button');
    console.log('3. Click "Fetch Zodiac Killer Case"');
    console.log('\nOr import via API:');
    console.log(`curl -X POST ${API_URL}/api/cases \\`);
    console.log(`  -H 'Content-Type: application/json' \\`);
    console.log(`  -d @${OUTPUT_FILE}`);
    
  } catch (error) {
    console.error('❌ Failed to fetch case:', error.message);
    console.log('\nMake sure the dev server is running:');
    console.log('  npm run dev');
    process.exit(1);
  }
}

main();
