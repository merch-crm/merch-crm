#!/usr/bin/env node

/**
 * Скрипт конвертации PNG в ICO формат.
 * Использование: node scripts/generate-favicon.js [путь-к-png]
 * По умолчанию: берёт app/icon.png и создаёт app/favicon.ico
 * 
 * Формат ICO:
 * - Header (6 байт): reserved(2) + type(2) + count(2)
 * - Directory Entry (16 байт): width, height, colors, reserved, planes, bpp, size, offset
 * - PNG data
 */

const fs = require('fs');
const path = require('path');

function createIco(pngBuffer) {
    // ICO Header (6 bytes)
    const header = Buffer.alloc(6);
    header.writeUInt16LE(0, 0);  // Reserved, must be 0
    header.writeUInt16LE(1, 2);  // Type: 1 = ICO
    header.writeUInt16LE(1, 4);  // Number of images: 1

    // Parse PNG dimensions from IHDR chunk
    // PNG signature is 8 bytes, then IHDR chunk starts
    const width = pngBuffer.readUInt32BE(16);
    const height = pngBuffer.readUInt32BE(20);
    const bitsPerPixel = 32; // RGBA

    // ICO Directory Entry (16 bytes)
    const entry = Buffer.alloc(16);
    entry.writeUInt8(width >= 256 ? 0 : width, 0);   // Width (0 = 256)
    entry.writeUInt8(height >= 256 ? 0 : height, 1);  // Height (0 = 256)
    entry.writeUInt8(0, 2);   // Color palette: 0 = no palette
    entry.writeUInt8(0, 3);   // Reserved
    entry.writeUInt16LE(1, 4);  // Color planes
    entry.writeUInt16LE(bitsPerPixel, 6);  // Bits per pixel
    entry.writeUInt32LE(pngBuffer.length, 8);   // Size of PNG data
    entry.writeUInt32LE(6 + 16, 12);  // Offset to PNG data (header + 1 entry)

    return Buffer.concat([header, entry, pngBuffer]);
}

// ─── Main ───────────────────────────────────────────────
const args = process.argv.slice(2);
const projectRoot = path.resolve(__dirname, '..');
const inputPath = args[0] || path.join(projectRoot, 'app', 'icon.png');
const outputPath = args[1] || path.join(projectRoot, 'app', 'favicon.ico');

if (!fs.existsSync(inputPath)) {
    console.error(`❌ Файл не найден: ${inputPath}`);
    process.exit(1);
}

const pngBuffer = fs.readFileSync(inputPath);

// Validate PNG signature
const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
if (!pngBuffer.subarray(0, 8).equals(pngSignature)) {
    console.error('❌ Входной файл не является PNG');
    process.exit(1);
}

const width = pngBuffer.readUInt32BE(16);
const height = pngBuffer.readUInt32BE(20);

const icoBuffer = createIco(pngBuffer);
fs.writeFileSync(outputPath, icoBuffer);

console.log(`✅ favicon.ico создан: ${outputPath}`);
console.log(`   Размер: ${width}x${height}px, ${icoBuffer.length} байт`);
