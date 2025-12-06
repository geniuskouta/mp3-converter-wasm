import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.dirname(__dirname);

// Directories
const publicDir = path.join(rootDir, 'public');
const libDir = path.join(publicDir, 'lib');

// Helper function to copy directory recursively
function copyDir(src, dest) {
    // Create destination directory
    fs.mkdirSync(dest, { recursive: true });

    // Read source directory
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            // Only copy .js, .mjs, and .wasm files (skip .d.ts files)
            const ext = path.extname(entry.name);
            if (['.js', '.mjs', '.wasm'].includes(ext)) {
                fs.copyFileSync(srcPath, destPath);
                console.log(`✓ Copied: ${entry.name}`);
            }
        }
    }
}

console.log('Building public directory...\n');

// Clean existing lib directory
if (fs.existsSync(libDir)) {
    console.log('Cleaning old lib directory...');
    fs.rmSync(libDir, { recursive: true, force: true });
}

// Copy ffmpeg packages
console.log('\nCopying @ffmpeg/ffmpeg...');
copyDir(
    path.join(rootDir, 'node_modules/@ffmpeg/ffmpeg/dist/esm'),
    path.join(libDir, 'ffmpeg')
);

console.log('\nCopying @ffmpeg/util...');
copyDir(
    path.join(rootDir, 'node_modules/@ffmpeg/util/dist/esm'),
    path.join(libDir, 'util')
);

console.log('\nCopying @ffmpeg/core...');
copyDir(
    path.join(rootDir, 'node_modules/@ffmpeg/core/dist/esm'),
    path.join(libDir, 'core')
);

console.log('\n✅ Build complete! Public directory is ready for deployment.');
