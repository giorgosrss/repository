const fs = require('fs');
const path = require('path');
const selfsigned = require('selfsigned');

const attrs = [{ name: 'commonName', value: 'localhost' }];
const pems = selfsigned.generate(attrs, { days: 365 });

const certDir = path.join(__dirname, 'certificates');

if (!fs.existsSync(certDir)) {
  fs.mkdirSync(certDir);
}

fs.writeFileSync(path.join(certDir, 'server.key'), pems.private);
fs.writeFileSync(path.join(certDir, 'server.crt'), pems.cert);

console.log('Self-signed certificates generated in ./certificates/ directory');
console.log('');
console.log('To use HTTPS for development:');
console.log('1. Run: npm install -D local-ssl-proxy selfsigned');
console.log('2. Run: npx local-ssl-proxy --source 3443 --target 3000');
console.log('3. Open: https://localhost:3443 in your browser');
console.log('');
console.log('Note: You will need to accept the self-signed certificate warning in your browser'); 