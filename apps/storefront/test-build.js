// Test script to verify TypeScript compilation
const { execSync } = require('child_process');
const path = require('path');

try {
  console.log('Testing TypeScript compilation...');
  
  // Try to compile TypeScript files
  const tscPath = path.join(__dirname, 'node_modules', '.bin', 'tsc.cmd');
  execSync(`"${tscPath}" --noEmit`, { stdio: 'inherit' });
  
  console.log('✅ TypeScript compilation successful - no errors!');
} catch (error) {
  console.log('❌ TypeScript compilation failed');
  process.exit(1);
}
