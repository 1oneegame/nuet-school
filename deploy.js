#!/usr/bin/env node

/**
 * Deployment Helper Script for Vercel
 * This script helps prepare and deploy the application to Vercel
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkPrerequisites() {
  log('🔍 Checking prerequisites...', 'blue');
  
  // Check if Vercel CLI is installed
  try {
    execSync('vercel --version', { stdio: 'ignore' });
    log('✅ Vercel CLI is installed', 'green');
  } catch (error) {
    log('❌ Vercel CLI is not installed. Install it with: npm i -g vercel', 'red');
    process.exit(1);
  }
  
  // Check if package.json exists
  if (!fs.existsSync('package.json')) {
    log('❌ package.json not found', 'red');
    process.exit(1);
  }
  log('✅ package.json found', 'green');
  
  // Check if .env.local exists
  if (!fs.existsSync('.env.local')) {
    log('⚠️  .env.local not found. Make sure to set up environment variables in Vercel dashboard', 'yellow');
  } else {
    log('✅ .env.local found', 'green');
  }
}

function runBuildTest() {
  log('🏗️  Testing build process...', 'blue');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    log('✅ Build successful', 'green');
  } catch (error) {
    log('❌ Build failed. Please fix build errors before deploying', 'red');
    process.exit(1);
  }
}

function deployToVercel() {
  log('🚀 Deploying to Vercel...', 'blue');
  try {
    execSync('vercel --prod', { stdio: 'inherit' });
    log('✅ Deployment successful!', 'green');
  } catch (error) {
    log('❌ Deployment failed', 'red');
    process.exit(1);
  }
}

function showPostDeploymentChecklist() {
  log('\n📋 Post-deployment checklist:', 'cyan');
  log('1. ✅ Set up MongoDB Atlas database', 'yellow');
  log('2. ✅ Configure environment variables in Vercel dashboard:', 'yellow');
  log('   - MONGODB_URI', 'yellow');
  log('   - NEXTAUTH_URL', 'yellow');
  log('   - NEXTAUTH_SECRET', 'yellow');
  log('   - JWT_SECRET', 'yellow');
  log('   - NEXT_PUBLIC_URL', 'yellow');
  log('3. ✅ Test authentication functionality', 'yellow');
  log('4. ✅ Test API endpoints', 'yellow');
  log('5. ✅ Test database operations', 'yellow');
  log('6. ✅ Configure custom domain (optional)', 'yellow');
  log('\n🎉 Your application should now be live on Vercel!', 'green');
}

function main() {
  log('🚀 Vercel Deployment Helper', 'bright');
  log('================================', 'bright');
  
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    log('Usage: node deploy.js [options]', 'cyan');
    log('Options:', 'cyan');
    log('  --skip-build    Skip the build test', 'cyan');
    log('  --help, -h      Show this help message', 'cyan');
    return;
  }
  
  checkPrerequisites();
  
  if (!args.includes('--skip-build')) {
    runBuildTest();
  }
  
  deployToVercel();
  showPostDeploymentChecklist();
}

if (require.main === module) {
  main();
}

module.exports = { checkPrerequisites, runBuildTest, deployToVercel };