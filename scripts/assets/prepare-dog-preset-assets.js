#!/usr/bin/env node

/**
 * Prepare and validate the 25 dog preset images without modifying the source
 * directory. Matching is NFC-based because macOS filenames may be NFD.
 *
 * Usage:
 *   node scripts/assets/prepare-dog-preset-assets.js --check
 *   node scripts/assets/prepare-dog-preset-assets.js --prepare
 */

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const zlib = require('node:zlib');
const { spawnSync } = require('node:child_process');

const repositoryRoot = path.resolve(__dirname, '../..');
const defaultInputDir = '/Users/yeodahui/Downloads/Dogs';
const defaultOutputDir = path.join(repositoryRoot, 'assets/dog-presets/webp');
const defaultManifestPath = path.join(repositoryRoot, 'assets/dog-presets/manifest.json');

const assets = [
  { original: '강아지등록.png', breedId: null, role: 'hero' },
  ...[
    ['골든 리트리버', 'golden-retriever'],
    ['그레이하운드', 'greyhound'],
    ['말티즈', 'maltese'],
    ['보더콜리', 'border-collie'],
    ['비숑', 'bichon'],
    ['시고르자브종', 'mixed-breed'],
    ['시바견', 'shiba'],
    ['웰시코기', 'welsh-corgi'],
    ['진돗개', 'jindo'],
    ['치와와', 'chihuahua'],
    ['포메라니안', 'pomeranian'],
    ['푸들', 'poodle'],
  ].flatMap(([breed, breedId]) => [
    { original: `${breed}.png`, breedId, role: 'cover' },
    { original: `${breed}-1.png`, breedId, role: 'profile' },
  ]),
];

function parseArgs(argv) {
  const options = { mode: 'check', inputDir: defaultInputDir, outputDir: defaultOutputDir, manifestPath: defaultManifestPath };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--prepare') options.mode = 'prepare';
    else if (argument === '--check') options.mode = 'check';
    else if (argument === '--input-dir') options.inputDir = path.resolve(argv[++index]);
    else if (argument === '--output-dir') options.outputDir = path.resolve(argv[++index]);
    else if (argument === '--manifest') options.manifestPath = path.resolve(argv[++index]);
    else throw new Error(`Unknown argument: ${argument}`);
  }
  return options;
}

function normalizedEntries(directory) {
  return fs.readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => ({ display: entry.name, normalized: entry.name.normalize('NFC'), path: path.join(directory, entry.name) }));
}

function findByNfc(entries, filename) {
  const normalized = filename.normalize('NFC');
  const matches = entries.filter((entry) => entry.normalized === normalized);
  if (matches.length !== 1) throw new Error(`Expected one NFC match for ${filename}, found ${matches.length}`);
  return matches[0];
}

function sha256(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function readUint24LE(buffer, offset) {
  return buffer[offset] | (buffer[offset + 1] << 8) | (buffer[offset + 2] << 16);
}

function inspectPng(buffer) {
  if (buffer.length < 33 || buffer.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') throw new Error('not a PNG');
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  const colorType = buffer[25];
  let hasTransparencyChunk = false;
  const idat = [];
  let offset = 8;
  while (offset + 12 <= buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.subarray(offset + 4, offset + 8).toString('ascii');
    if (type === 'tRNS') hasTransparencyChunk = true;
    if (type === 'IDAT') idat.push(buffer.subarray(offset + 8, offset + 8 + length));
    offset += 12 + length;
    if (type === 'IEND') break;
  }
  let hasTransparentPixels = hasTransparencyChunk;
  // The supplied files are non-interlaced 8-bit RGBA PNGs. Decode scanline
  // filters locally so alpha validation does not depend on an image package.
  if (colorType === 6 && buffer[24] === 8 && buffer[28] === 0 && idat.length > 0) {
    const raw = zlib.inflateSync(Buffer.concat(idat));
    const stride = width * 4;
    let previous = Buffer.alloc(stride);
    let cursor = 0;
    for (let y = 0; y < height; y += 1) {
      const filter = raw[cursor++];
      const row = Buffer.from(raw.subarray(cursor, cursor + stride));
      cursor += stride;
      for (let x = 0; x < stride; x += 1) {
        const left = x >= 4 ? row[x - 4] : 0;
        const up = previous[x] || 0;
        const upperLeft = x >= 4 ? previous[x - 4] || 0 : 0;
        if (filter === 1) row[x] = (row[x] + left) & 0xff;
        else if (filter === 2) row[x] = (row[x] + up) & 0xff;
        else if (filter === 3) row[x] = (row[x] + Math.floor((left + up) / 2)) & 0xff;
        else if (filter === 4) {
          const p = left + up - upperLeft;
          const pa = Math.abs(p - left); const pb = Math.abs(p - up); const pc = Math.abs(p - upperLeft);
          row[x] = (row[x] + (pa <= pb && pa <= pc ? left : pb <= pc ? up : upperLeft)) & 0xff;
        } else if (filter !== 0) throw new Error(`unsupported PNG filter ${filter}`);
      }
      for (let x = 3; x < stride; x += 4) if (row[x] !== 0xff) hasTransparentPixels = true;
      previous = row;
    }
  }
  return { width, height, hasAlpha: colorType === 4 || colorType === 6 || hasTransparencyChunk, hasTransparency: hasTransparentPixels };
}

function inspectWebp(buffer) {
  if (buffer.length < 16 || buffer.subarray(0, 4).toString('ascii') !== 'RIFF' || buffer.subarray(8, 12).toString('ascii') !== 'WEBP') throw new Error('not a WebP');
  let offset = 12;
  let result;
  let alphaFlag = false;
  while (offset + 8 <= buffer.length) {
    const type = buffer.subarray(offset, offset + 4).toString('ascii');
    const size = buffer.readUInt32LE(offset + 4);
    const payload = offset + 8;
    if (type === 'VP8X' && size >= 10) {
      alphaFlag = Boolean(buffer[payload] & 0x10);
      result = { width: 1 + readUint24LE(buffer, payload + 4), height: 1 + readUint24LE(buffer, payload + 7), hasAlpha: alphaFlag, hasTransparency: alphaFlag };
    } else if (type === 'VP8L' && size >= 5) {
      if (buffer[payload] !== 0x2f) throw new Error('invalid VP8L signature');
      const bits = buffer.readUInt32LE(payload + 1);
      result = { width: result?.width ?? 1 + (bits & 0x3fff), height: result?.height ?? 1 + ((bits >>> 14) & 0x3fff), hasAlpha: alphaFlag || Boolean((bits >>> 28) & 1), hasTransparency: alphaFlag || Boolean((bits >>> 28) & 1) };
    } else if (type === 'VP8 ' && size >= 10) {
      if (buffer[payload + 3] !== 0x9d || buffer[payload + 4] !== 0x01 || buffer[payload + 5] !== 0x2a) throw new Error('invalid VP8 signature');
      result = { width: result?.width ?? (buffer.readUInt16LE(payload + 6) & 0x3fff), height: result?.height ?? (buffer.readUInt16LE(payload + 8) & 0x3fff), hasAlpha: alphaFlag, hasTransparency: alphaFlag };
    }
    offset = payload + size + (size % 2);
  }
  if (!result) throw new Error('WebP image chunk not found');
  return result;
}

function inspect(filePath, mime) {
  const buffer = fs.readFileSync(filePath);
  const dimensions = mime === 'image/png' ? inspectPng(buffer) : inspectWebp(buffer);
  return { bytes: buffer.length, dimensions: { width: dimensions.width, height: dimensions.height }, sha256: sha256(filePath), mime, hasAlpha: dimensions.hasAlpha, hasTransparency: dimensions.hasTransparency };
}

function run() {
  const options = parseArgs(process.argv.slice(2));
  if (!fs.existsSync(options.inputDir)) throw new Error(`Input directory does not exist: ${options.inputDir}`);
  const sourceEntries = normalizedEntries(options.inputDir);
  if (options.mode === 'prepare') fs.mkdirSync(options.outputDir, { recursive: true });
  const manifestAssets = [];
  for (const asset of assets) {
    const source = findByNfc(sourceEntries, asset.original);
    const outputFilename = `${asset.original.slice(0, -4)}.webp`.normalize('NFC');
    const outputPath = path.join(options.outputDir, outputFilename);
    if (options.mode === 'prepare') {
      const conversion = spawnSync('cwebp', ['-quiet', '-q', '90', source.path, '-o', outputPath], { encoding: 'utf8' });
      if (conversion.status !== 0) throw new Error(`cwebp failed for ${source.display}: ${conversion.stderr || conversion.error}`);
    }
    if (!fs.existsSync(outputPath)) throw new Error(`Missing converted asset: ${outputPath}`);
    const sourceInfo = inspect(source.path, 'image/png');
    const convertedInfo = inspect(outputPath, 'image/webp');
    if (sourceInfo.dimensions.width !== convertedInfo.dimensions.width || sourceInfo.dimensions.height !== convertedInfo.dimensions.height) {
      throw new Error(`Dimensions changed for ${asset.original}: ${JSON.stringify(sourceInfo.dimensions)} -> ${JSON.stringify(convertedInfo.dimensions)}`);
    }
    if (sourceInfo.hasTransparency && !convertedInfo.hasTransparency) throw new Error(`Transparent pixels lost for ${asset.original}`);
    manifestAssets.push({
      originalFilename: { display: source.display, normalizedNfc: asset.original.normalize('NFC') },
      breedId: asset.breedId,
      role: asset.role,
      source: sourceInfo,
      converted: { filename: outputFilename, ...convertedInfo },
      uploadStatus: 'not-uploaded',
      objectKey: null,
      publicUrl: null,
    });
  }
  const manifest = { schemaVersion: 1, sourceDirectory: options.inputDir, convertedDirectory: path.relative(repositoryRoot, options.outputDir) || '.', assetCount: manifestAssets.length, assets: manifestAssets };
  if (options.mode === 'prepare') {
    fs.writeFileSync(options.manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  } else {
    if (!fs.existsSync(options.manifestPath)) throw new Error(`Missing manifest: ${options.manifestPath}`);
    const existing = JSON.parse(fs.readFileSync(options.manifestPath, 'utf8'));
    if (JSON.stringify(existing) !== JSON.stringify(manifest)) throw new Error(`Manifest drift detected: ${options.manifestPath}`);
  }
  console.log(`Validated ${manifestAssets.length} assets; manifest: ${options.manifestPath}`);
}

try { run(); } catch (error) { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; }
