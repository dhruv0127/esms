// Simple script to generate a favicon with "K" letter
// Run with: node generate-favicon.js

const fs = require('fs');
const { createCanvas } = require('canvas');

// Check if canvas is installed
try {
    require.resolve('canvas');
} catch(e) {
    console.log('⚠️  Canvas module not found.');
    console.log('\nTo generate the favicon automatically, install canvas:');
    console.log('npm install canvas --save-dev');
    console.log('\nAlternatively, use the create-favicon.html file in your browser.');
    process.exit(0);
}

// Create 32x32 canvas for favicon
const size = 32;
const canvas = createCanvas(size, size);
const ctx = canvas.getContext('2d');

// Background - Blue (#1890ff)
ctx.fillStyle = '#1890ff';
ctx.fillRect(0, 0, size, size);

// Add slight rounded corners effect
ctx.globalCompositeOperation = 'destination-in';
ctx.beginPath();
ctx.moveTo(4, 0);
ctx.lineTo(28, 0);
ctx.quadraticCurveTo(32, 0, 32, 4);
ctx.lineTo(32, 28);
ctx.quadraticCurveTo(32, 32, 28, 32);
ctx.lineTo(4, 32);
ctx.quadraticCurveTo(0, 32, 0, 28);
ctx.lineTo(0, 4);
ctx.quadraticCurveTo(0, 0, 4, 0);
ctx.fill();

ctx.globalCompositeOperation = 'source-over';

// Letter K - White
ctx.fillStyle = '#ffffff';
ctx.font = 'bold 24px Arial, sans-serif';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('K', 16, 17);

// Save as PNG
const pngBuffer = canvas.toBuffer('image/png');
fs.writeFileSync('./src/favicon-32x32.png', pngBuffer);

console.log('✅ Favicon PNG generated: src/favicon-32x32.png');
console.log('\nTo convert to .ico format:');
console.log('1. Visit: https://favicon.io/favicon-converter/');
console.log('2. Upload src/favicon-32x32.png');
console.log('3. Download and replace src/favicon.ico');
console.log('\nOr use an online tool or ImageMagick:');
console.log('convert src/favicon-32x32.png src/favicon.ico');
