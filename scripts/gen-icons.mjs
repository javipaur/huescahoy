import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "assets", "logo.png");
const appDir = path.join(root, "src", "app");
const iconsDir = path.join(root, "public", "icons");
fs.mkdirSync(iconsDir, { recursive: true });

const outputs = [
  { file: path.join(appDir, "icon.png"), size: 64 },
  { file: path.join(iconsDir, "icon-192.png"), size: 192 },
  { file: path.join(iconsDir, "icon-512.png"), size: 512 },
  { file: path.join(iconsDir, "maskable-512.png"), size: 512, inset: 0.12 },
  { file: path.join(iconsDir, "apple-touch-icon.png"), size: 180 },
];

for (const { file, size, inset } of outputs) {
  let pipeline = sharp(source);
  if (inset) {
    const inner = Math.round(size * (1 - inset * 2));
    const bg = await sharp(source)
      .resize(size, size, { fit: "cover" })
      .blur(30)
      .toBuffer();
    const logo = await sharp(source).resize(inner, inner).png().toBuffer();
    pipeline = sharp(bg).composite([{ input: logo, blend: "over" }]);
  } else {
    pipeline = pipeline.resize(size, size, { fit: "cover" });
  }
  await pipeline.png().toFile(file);
  console.log("generated", path.relative(root, file), `${size}x${size}`);
}

const svgSize = 512;
const jpeg = await sharp(source)
  .resize(svgSize, svgSize, { fit: "cover" })
  .jpeg({ quality: 85 })
  .toBuffer();
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgSize} ${svgSize}" width="${svgSize}" height="${svgSize}"><image width="${svgSize}" height="${svgSize}" href="data:image/jpeg;base64,${jpeg.toString("base64")}"/></svg>`;
const svgFile = path.join(iconsDir, "icon.svg");
fs.writeFileSync(svgFile, svg);
console.log(
  "generated",
  path.relative(root, svgFile),
  `${svgSize}x${svgSize}`,
  `${(jpeg.length / 1024).toFixed(0)} KB embed`
);
