import sharp from 'sharp';
import { readFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SVG_PATH = join(ROOT, 'clearhorizon_icon.svg');
const OUT_DIR = join(ROOT, 'public', 'icons');

mkdirSync(OUT_DIR, { recursive: true });

const svgBuffer = readFileSync(SVG_PATH);

const sizes = [
  { name: 'icon-16.png',   size: 16  },
  { name: 'icon-32.png',   size: 32  },
  { name: 'icon-57.png',   size: 57  },
  { name: 'icon-60.png',   size: 60  },
  { name: 'icon-72.png',   size: 72  },
  { name: 'icon-76.png',   size: 76  },
  { name: 'icon-96.png',   size: 96  },
  { name: 'icon-114.png',  size: 114 },
  { name: 'icon-120.png',  size: 120 },
  { name: 'icon-128.png',  size: 128 },
  { name: 'icon-144.png',  size: 144 },
  { name: 'icon-152.png',  size: 152 },
  { name: 'icon-167.png',  size: 167 },
  { name: 'icon-180.png',  size: 180 },
  { name: 'icon-192.png',  size: 192 },
  { name: 'icon-512.png',  size: 512 },
];

async function generateIcon(name, size, padding = 0) {
  const outPath = join(OUT_DIR, name);
  if (padding > 0) {
    // For maskable icons: render SVG into a smaller area with safe-zone padding
    const innerSize = Math.round(size * (1 - padding * 2));
    const offset = Math.round(size * padding);
    const svgResized = await sharp(svgBuffer)
      .resize(innerSize, innerSize)
      .png()
      .toBuffer();
    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 13, g: 43, b: 110, alpha: 1 }, // #0d2b6e
      },
    })
      .composite([{ input: svgResized, top: offset, left: offset }])
      .png()
      .toFile(outPath);
  } else {
    await sharp(svgBuffer).resize(size, size).png().toFile(outPath);
  }
  console.log(`  ✓ ${name} (${size}×${size})`);
}

async function generateFavico() {
  // favicon.ico as 32×32 PNG (browsers accept PNG favicons named .ico)
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(join(OUT_DIR, 'favicon.ico'));
  console.log('  ✓ favicon.ico (32×32)');
}

async function main() {
  console.log('Generating PWA icons from clearhorizon_icon.svg...\n');
  await Promise.all(sizes.map(({ name, size }) => generateIcon(name, size)));
  // Maskable icon with ~20% safe-zone padding on each side
  await generateIcon('icon-maskable-512.png', 512, 0.1);
  await generateFavico();
  console.log('\nAll icons generated in public/icons/');
}

main().catch((err) => {
  console.error('Icon generation failed:', err);
  process.exit(1);
});
