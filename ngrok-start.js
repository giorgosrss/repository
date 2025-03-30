const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting ngrok tunnel to provide secure HTTPS access...');

// Check if ngrok is installed
try {
  // On Windows, we need to use 'ngrok.cmd' instead of just 'ngrok'
  const isWindows = process.platform === 'win32';
  const ngrokCmd = isWindows ? 'ngrok.cmd' : 'ngrok';
  
  // Use port 3000 (Next.js default port)
  const ngrok = spawn(ngrokCmd, ['http', '3000']);
  
  ngrok.stdout.on('data', (data) => {
    console.log(`${data}`);
  });
  
  ngrok.stderr.on('data', (data) => {
    console.error(`${data}`);
  });
  
  // Extract and display the ngrok URLs
  let hasDisplayedUrls = false;
  
  // Function to check if Next.js is running on port 3000
  const checkNextJs = () => {
    http.get('http://localhost:3000', (res) => {
      if (res.statusCode === 200) {
        console.log('✅ Next.js is running on port 3000');
      } else {
        console.log('⚠️ Next.js may not be running correctly. Status code:', res.statusCode);
      }
    }).on('error', () => {
      console.log('❌ Next.js does not appear to be running on port 3000');
      console.log('Please start your Next.js app with: npm run dev');
    });
  };
  
  // After a short delay, check if Next.js is running
  setTimeout(checkNextJs, 3000);
  
  // Try to extract and display the HTTPS URL from ngrok output
  setTimeout(() => {
    if (!hasDisplayedUrls) {
      console.log('\n📱 Please use one of these methods to access your app from mobile:');
      console.log('   1. Check the ngrok URLs above for an https:// URL');
      console.log('   2. If no URL is visible, check ngrok\'s web interface at: http://localhost:4040\n');
    }
  }, 5000);
  
  console.log('Press Ctrl+C to stop the ngrok tunnel');
  
} catch (err) {
  console.error('Error running ngrok:', err);
  console.log('\n❌ It seems ngrok is not installed or not in your PATH.');
  console.log('Please install ngrok by running:');
  console.log('  npm install -g ngrok');
  console.log('or download from: https://ngrok.com/download');
} 