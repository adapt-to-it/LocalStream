const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const png2icons = require('png2icons');

const iconSvg = path.join(__dirname, '../gui/icon.svg');
const iconPng = path.join(__dirname, '../gui/icon-1024.png');
const icnsOutput = path.join(__dirname, '../gui/icon.icns');
const icoOutput = path.join(__dirname, '../gui/icon.ico');

console.log('🎨 Generating app icons...');

// Convert SVG to PNG at 1024x1024
console.log('📐 Converting SVG to PNG...');
try {
    execSync(`rsvg-convert -w 1024 -h 1024 "${iconSvg}" -o "${iconPng}"`, { stdio: 'inherit' });
} catch (error) {
    // Fallback to sips if rsvg-convert is not available
    try {
        execSync(`qlmanage -t -s 1024 -o "${path.dirname(iconPng)}" "${iconSvg}"`, { stdio: 'inherit' });
        const thumbnailPath = path.join(path.dirname(iconPng), path.basename(iconSvg) + '.png');
        if (fs.existsSync(thumbnailPath)) {
            fs.renameSync(thumbnailPath, iconPng);
        }
    } catch (fallbackError) {
        console.error('❌ Failed to convert SVG to PNG. Please install rsvg-convert or use macOS qlmanage.');
        process.exit(1);
    }
}

if (!fs.existsSync(iconPng)) {
    console.error('❌ PNG file was not created');
    process.exit(1);
}

console.log('✅ PNG created');

// Generate .icns for macOS
console.log('🍎 Generating .icns for macOS...');
const input = fs.readFileSync(iconPng);
const icnsBuffer = png2icons.createICNS(input, png2icons.BICUBIC, 0);
fs.writeFileSync(icnsOutput, icnsBuffer);
console.log('✅ .icns created');

// Generate .ico for Windows
console.log('🪟 Generating .ico for Windows...');
const icoBuffer = png2icons.createICO(input, png2icons.BICUBIC, 0, false);
fs.writeFileSync(icoOutput, icoBuffer);
console.log('✅ .ico created');

// Cleanup temporary PNG
if (fs.existsSync(iconPng)) {
    fs.unlinkSync(iconPng);
    console.log('🧹 Cleaned up temporary files');
}

console.log('🎉 Icon generation complete!');
