import sharp from 'sharp';
import fs from 'node:fs';
const svg = fs.readFileSync('public/icon.svg');
const BG = '#04070f';
const jobs = [['icon-192.png',192,1],['icon-512.png',512,1],['maskable-512.png',512,0.8],['apple-touch-icon-180.png',180,1]];
for (const [name,size,scale] of jobs) {
  const inner = Math.round(size*scale);
  const logo = await sharp(svg, { density: 400 }).resize(inner, inner, { fit: 'contain', background: { r:0,g:0,b:0,alpha:0 } }).png().toBuffer();
  await sharp({ create: { width:size, height:size, channels:4, background:BG } })
    .composite([{ input: logo, top: Math.round((size-inner)/2), left: Math.round((size-inner)/2) }])
    .png().toFile(`public/icons/${name}`);
  console.log(`  sharp: ${name} ${size}x${size} logo=${inner}px bg=${BG}`);
}
