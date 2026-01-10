const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');
const faviconSvg = path.join(publicDir, 'favicon.svg');

const sizes = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 48, name: 'favicon.ico' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 192, name: 'android-chrome-192x192.png' },
  { size: 512, name: 'android-chrome-512x512.png' },
];

async function generateFavicons() {
  const svgBuffer = fs.readFileSync(faviconSvg);

  for (const { size, name } of sizes) {
    const outputPath = path.join(publicDir, name);

    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);

    console.log(`Generated: ${name} (${size}x${size})`);
  }

  console.log('\nAll favicons generated successfully!');
}

generateFavicons().catch(console.error);
