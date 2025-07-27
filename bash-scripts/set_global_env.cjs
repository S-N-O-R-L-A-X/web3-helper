const { execSync } = require('child_process');

try {
  execSync('set NODE_ENV=production', { stdio: 'inherit' });
  execSync('set GENERATE_SOURCEMAP=false', { stdio: 'inherit' });
  console.log('Environment variables set successfully');
} catch (error) {
  console.error('Error setting environment variables:', error);
  process.exit(1);
}
