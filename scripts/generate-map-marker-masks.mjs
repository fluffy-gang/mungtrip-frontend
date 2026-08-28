import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceDirectory = path.join(
  root,
  'node_modules/@material-design-icons/svg/filled',
);
const outputDirectory = path.join(root, 'assets/images/map-marker-masks');

const markerIcons = {
  ACCOMMODATION: 'hotel',
  ACTIVITY: 'directions_run',
  ATTRACTION: 'park',
  CAFE: 'local_cafe',
  CARE: 'favorite',
  DEFAULT: 'pets',
  FACILITY: 'build',
  GROOMING: 'content_cut',
  HOSPITAL: 'local_hospital',
  RESTAURANT: 'restaurant',
  SHOPPING: 'shopping_bag',
  TRAINING: 'school',
};

const markerBackground = Buffer.from(`
  <svg xmlns="http://www.w3.org/2000/svg" width="132" height="132" viewBox="0 0 132 132">
    <defs>
      <filter id="shadow" x="-25%" y="-25%" width="150%" height="160%">
        <feDropShadow dx="0" dy="5" stdDeviation="4" flood-color="#111827" flood-opacity=".2"/>
      </filter>
    </defs>
    <circle cx="66" cy="66" r="51" fill="#000000" stroke="#FFFFFF" stroke-width="6" filter="url(#shadow)"/>
  </svg>
`);

await mkdir(outputDirectory, { recursive: true });
await sharp(markerBackground)
  .png()
  .toFile(path.join(outputDirectory, 'background.png'));

await Promise.all(
  Object.entries(markerIcons).map(async ([category, icon]) => {
    const svg = await readFile(path.join(sourceDirectory, `${icon}.svg`), 'utf8');
    const monochromeSvg = svg.replaceAll('<path', '<path fill="#000000"');

    await sharp(Buffer.from(monochromeSvg))
      .resize(51, 51)
      .png()
      .toFile(path.join(outputDirectory, `${category.toLowerCase()}.png`));
  }),
);

console.log(`Generated ${Object.keys(markerIcons).length} icon masks and one background mask.`);
