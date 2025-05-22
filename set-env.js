const fs = require('fs');
const path = require('path');

const envDir = path.join(__dirname, 'src', 'environments');
if (!fs.existsSync(envDir)) {
    fs.mkdirSync(envDir, { recursive: true });
    console.log(`Created environments directory at: ${envDir}`);
}

const devTarget = path.join(envDir, 'environment.ts');
const prodTarget = path.join(envDir, 'environment.prod.ts');

const apiUrl = process.env.API_URL || 'http://localhost:3000';

const devFile = `
export const environment = {
    production: false,
    apiUrl: '${apiUrl}'
};`;

const prodFile = `
export const environment = {
    production: true,
    apiUrl: '${apiUrl}'
};`;

fs.writeFileSync(devTarget, devFile);
fs.writeFileSync(prodTarget, prodFile);

console.log(`✅ Environment files generated successfully:
- environment.ts
- environment.prod.ts
With apiUrl: ${apiUrl}
`);