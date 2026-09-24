import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';

const [sourcePath, outputPath] = process.argv.slice(2);
if (!sourcePath || !outputPath) {
  console.error('Uso: npm run optimize:presenter -- imagen-origen.png public/presenters/nombre.png');
  process.exit(1);
}

const source = PNG.sync.read(fs.readFileSync(sourcePath));
let left = source.width;
let top = source.height;
let right = -1;
let bottom = -1;

for (let y = 0; y < source.height; y += 1) {
  for (let x = 0; x < source.width; x += 1) {
    if (source.data[(y * source.width + x) * 4 + 3] <= 8) continue;
    left = Math.min(left, x);
    top = Math.min(top, y);
    right = Math.max(right, x);
    bottom = Math.max(bottom, y);
  }
}

if (right < left) throw new Error('La imagen no contiene píxeles visibles.');

// Keep a little breathing room around the cutout and enough pixels for HiDPI.
const padding = 8;
left = Math.max(0, left - padding);
top = Math.max(0, top - padding);
right = Math.min(source.width - 1, right + padding);
bottom = Math.min(source.height - 1, bottom + padding);
const cropWidth = right - left + 1;
const cropHeight = bottom - top + 1;
const targetHeight = Math.min(384, cropHeight);
const targetWidth = Math.round(cropWidth * targetHeight / cropHeight);
const output = new PNG({ width: targetWidth, height: targetHeight });

// Nearest-neighbour sampling keeps the original pixel edges intact.
for (let y = 0; y < targetHeight; y += 1) {
  const sourceY = top + Math.min(cropHeight - 1, Math.floor(y * cropHeight / targetHeight));
  for (let x = 0; x < targetWidth; x += 1) {
    const sourceX = left + Math.min(cropWidth - 1, Math.floor(x * cropWidth / targetWidth));
    const from = (sourceY * source.width + sourceX) * 4;
    const to = (y * targetWidth + x) * 4;
    source.data.copy(output.data, to, from, from + 4);
  }
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, PNG.sync.write(output, { deflateLevel: 9 }));
console.log(`${sourcePath} → ${outputPath} (${targetWidth} × ${targetHeight})`);
