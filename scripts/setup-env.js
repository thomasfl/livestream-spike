#!/usr/bin/env node

/**
 * Setup script to help configure environment variables
 * Run with: node scripts/setup-env.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupEnvironment() {
  console.log('🚀 Email Collection System - Environment Setup\n');
  
  console.log('Please provide your Supabase credentials:');
  console.log('(You can find these in your Supabase project dashboard > Settings > API)\n');
  
  const supabaseUrl = await question('Supabase Project URL: ');
  const supabaseAnonKey = await question('Supabase Anon Key: ');
  const supabaseServiceKey = await question('Supabase Service Role Key: ');
  
  const envContent = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnonKey}
SUPABASE_SERVICE_ROLE_KEY=${supabaseServiceKey}
`;
  
  const envPath = path.join(__dirname, '..', '.env.local');
  
  try {
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ Environment variables saved to .env.local');
    console.log('\n📋 Next steps:');
    console.log('1. Run: npm run dev (to test locally)');
    console.log('2. Follow DEPLOYMENT.md for production deployment');
  } catch (error) {
    console.error('❌ Error writing .env.local:', error.message);
  }
  
  rl.close();
}

setupEnvironment().catch(console.error);