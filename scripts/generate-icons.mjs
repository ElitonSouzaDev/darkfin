import sharp from 'sharp'
import { mkdirSync } from 'fs'

mkdirSync('public/icons', { recursive: true })

// Dark background with green "D" letter — simple SVG
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="#0a1628"/>
  <text x="256" y="340" font-family="Arial Black, Arial, sans-serif" font-size="280" font-weight="900"
    text-anchor="middle" fill="#10b981">D</text>
</svg>`

const buf = Buffer.from(svg)

const sizes = [72, 96, 128, 144, 152, 192, 384, 512]

await Promise.all(sizes.map(s =>
  sharp(buf).resize(s, s).png().toFile(`public/icons/icon-${s}x${s}.png`)
))

// apple-touch-icon (180x180)
await sharp(buf).resize(180, 180).png().toFile('public/icons/apple-touch-icon.png')

// favicon 32x32
await sharp(buf).resize(32, 32).png().toFile('public/favicon.png')

console.log('Icons generated ✓')
