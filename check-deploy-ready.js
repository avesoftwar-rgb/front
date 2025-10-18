#!/usr/bin/env node

/**
 * Deployment Readiness Check Script
 * Checks if the project is ready for deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking deployment readiness...\n');

let allChecks = true;

// Color codes
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

function check(message, condition, required = true) {
  if (condition) {
    console.log(`${GREEN}✓${RESET} ${message}`);
    return true;
  } else {
    const symbol = required ? `${RED}✗${RESET}` : `${YELLOW}!${RESET}`;
    console.log(`${symbol} ${message}`);
    if (required) allChecks = false;
    return false;
  }
}

function section(title) {
  console.log(`\n${BLUE}━━━ ${title} ━━━${RESET}`);
}

// Check Git Configuration
section('Git Configuration');
check('.gitignore exists', fs.existsSync('.gitignore'));
const gitignoreContent = fs.existsSync('.gitignore') ? fs.readFileSync('.gitignore', 'utf8') : '';
check('.gitignore includes node_modules', gitignoreContent.includes('node_modules'));
check('.gitignore includes .env files', gitignoreContent.includes('.env'));
check('.gitignore includes dist/build', gitignoreContent.includes('dist') || gitignoreContent.includes('build'));

// Check Project Files
section('Project Structure');
check('package.json exists', fs.existsSync('package.json'));
check('README.md exists', fs.existsSync('README.md'));
check('render.yaml exists', fs.existsSync('render.yaml'));
check('DEPLOYMENT_GUIDE.md exists', fs.existsSync('DEPLOYMENT_GUIDE.md'));

// Check Backend Files
section('Backend (apps/api)');
check('API directory exists', fs.existsSync('apps/api'));
check('API package.json exists', fs.existsSync('apps/api/package.json'));
check('API server.js exists', fs.existsSync('apps/api/src/server.js'));
check('Environment example exists', fs.existsSync('apps/api/env.example'));

if (fs.existsSync('apps/api/package.json')) {
  const apiPackage = JSON.parse(fs.readFileSync('apps/api/package.json', 'utf8'));
  check('API has start script', apiPackage.scripts && apiPackage.scripts.start);
  check('API has required dependencies', 
    apiPackage.dependencies && 
    apiPackage.dependencies.express && 
    apiPackage.dependencies.mongodb
  );
}

// Check Frontend Files
section('Frontend (apps/storefront)');
check('Storefront directory exists', fs.existsSync('apps/storefront'));
check('Storefront package.json exists', fs.existsSync('apps/storefront/package.json'));
check('Storefront index.html exists', fs.existsSync('apps/storefront/index.html'));
check('Storefront main.tsx exists', fs.existsSync('apps/storefront/src/main.tsx'));

if (fs.existsSync('apps/storefront/package.json')) {
  const frontendPackage = JSON.parse(fs.readFileSync('apps/storefront/package.json', 'utf8'));
  check('Frontend has build script', frontendPackage.scripts && frontendPackage.scripts.build);
  check('Frontend has dev script', frontendPackage.scripts && frontendPackage.scripts.dev);
  check('Frontend has required dependencies', 
    frontendPackage.dependencies && 
    frontendPackage.dependencies.react && 
    frontendPackage.dependencies['react-dom']
  );
}

// Check Environment Files
section('Environment Configuration');
check('API env.example exists', fs.existsSync('apps/api/env.example'));
const hasConfigEnv = fs.existsSync('apps/api/config.env');
if (hasConfigEnv) {
  console.log(`${YELLOW}!${RESET} config.env exists (should not be committed)`);
  const configContent = fs.readFileSync('apps/api/config.env', 'utf8');
  if (configContent.includes('mongodb://localhost')) {
    console.log(`${YELLOW}!${RESET} config.env uses localhost MongoDB (update for production)`);
  }
}

// Check Render Configuration
section('Render Configuration');
if (fs.existsSync('render.yaml')) {
  const renderConfig = fs.readFileSync('render.yaml', 'utf8');
  check('render.yaml has backend service', renderConfig.includes('shopmart-api'));
  check('render.yaml has MongoDB env var', renderConfig.includes('MONGODB_URI'));
  check('render.yaml has CORS env var', renderConfig.includes('CORS_ORIGINS'));
  check('render.yaml has NODE_ENV', renderConfig.includes('NODE_ENV'));
}

// Check Documentation
section('Documentation');
check('README.md has deployment section', 
  fs.existsSync('README.md') && fs.readFileSync('README.md', 'utf8').includes('Deployment')
);
check('Deployment guide exists', fs.existsSync('DEPLOYMENT_GUIDE.md'));
check('Quick deploy guide (AR) exists', fs.existsSync('QUICK_DEPLOY_AR.md'));

// Check for sensitive files (should NOT exist)
section('Security Check');
const sensitiveFiles = [
  'apps/api/.env',
  'apps/api/.env.local',
  'apps/storefront/.env',
  'apps/storefront/.env.local'
];

let hasSensitiveFiles = false;
sensitiveFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`${RED}✗${RESET} ${file} exists (should not be committed!)`);
    hasSensitiveFiles = true;
  }
});
if (!hasSensitiveFiles) {
  console.log(`${GREEN}✓${RESET} No sensitive .env files found in repository`);
}

// Check node_modules (should NOT exist in git)
const nodeModulesInGit = [
  'node_modules',
  'apps/api/node_modules',
  'apps/storefront/node_modules'
].some(dir => fs.existsSync(dir));

if (nodeModulesInGit) {
  console.log(`${YELLOW}!${RESET} node_modules directories exist (should be in .gitignore)`);
} else {
  console.log(`${GREEN}✓${RESET} node_modules not tracked in repository`);
}

// Final Summary
console.log(`\n${'='.repeat(50)}`);
if (allChecks) {
  console.log(`${GREEN}✓ All critical checks passed!${RESET}`);
  console.log(`\n${BLUE}Your project is ready for deployment!${RESET}`);
  console.log(`\nNext steps:`);
  console.log(`1. Push to GitHub: git push origin main`);
  console.log(`2. Set up MongoDB Atlas (see DEPLOYMENT_GUIDE.md)`);
  console.log(`3. Deploy to Render (connect GitHub repo)`);
  console.log(`4. Deploy to Vercel (optional, for frontend)`);
  console.log(`\nFor detailed instructions, see:`);
  console.log(`- DEPLOYMENT_GUIDE.md (English & Arabic)`);
  console.log(`- QUICK_DEPLOY_AR.md (Quick Arabic guide)`);
} else {
  console.log(`${RED}✗ Some checks failed!${RESET}`);
  console.log(`\nPlease fix the issues above before deploying.`);
  process.exit(1);
}
console.log(`${'='.repeat(50)}\n`);

