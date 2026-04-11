// Custom config plugin: create splashscreen_logo drawables during Android prebuild.
//
// Why: expo-splash-screen (a transitive dep of the `expo` SDK package) generates
// a layer-list drawable that contains:
//   <bitmap android:src="@drawable/splashscreen_logo" />
//
// The <bitmap> element requires a RASTER drawable (PNG), NOT an XML shape.
// Writing an XML shape drawable here caused AAPT2 to fail with
// "resource drawable/splashscreen_logo not found" on every build.
//
// Fix: generate a minimal solid-colour PNG at build time using Node's built-in
// `zlib` module — no extra npm dependencies required.
//
// The app uses a fully-custom JS splash (app/splash.tsx) so the native drawable
// is never actually shown to users; it only needs to exist so resource linking
// succeeds.

const { withDangerousMod } = require('@expo/config-plugins');
const fs   = require('fs');
const path = require('path');
const zlib = require('zlib');

// ─── Minimal PNG encoder ────────────────────────────────────────────────────

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    t[i] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const tb  = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const crcVal = crc32(Buffer.concat([tb, data]));
  const crcBuf = Buffer.alloc(4); crcBuf.writeUInt32BE(crcVal, 0);
  return Buffer.concat([len, tb, data, crcBuf]);
}

/**
 * Create a minimal solid-colour PNG (24-bit RGB, no alpha).
 * w × h pixels, colour (r, g, b) each 0–255.
 */
function solidColorPNG(w, h, r, g, b) {
  // Signature
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // colour type: RGB (no alpha)
  // compression / filter / interlace stay 0

  // Raw scanlines: [filter_byte=0, R, G, B, …] × h rows
  const scanline = Buffer.alloc(1 + w * 3);
  scanline[0] = 0; // filter: None
  for (let x = 0; x < w; x++) {
    scanline[1 + x * 3    ] = r;
    scanline[1 + x * 3 + 1] = g;
    scanline[1 + x * 3 + 2] = b;
  }
  const raw        = Buffer.concat(Array.from({ length: h }, () => scanline));
  const compressed = zlib.deflateSync(raw, { level: 9 });

  return Buffer.concat([
    sig,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', compressed),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

// Brand navy blue #1E3A5F
const LOGO_PNG = solidColorPNG(1, 1, 0x1e, 0x3a, 0x5f);

// Write to every density bucket so aapt2 has a match at any DPI
const DRAWABLE_DIRS = [
  'drawable',
  'drawable-mdpi',
  'drawable-hdpi',
  'drawable-xhdpi',
  'drawable-xxhdpi',
  'drawable-xxxhdpi',
];

const withSplashscreenLogo = (config) => {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const resDir = path.join(
        config.modRequest.platformProjectRoot,
        'app', 'src', 'main', 'res',
      );

      for (const dir of DRAWABLE_DIRS) {
        const drawableDir = path.join(resDir, dir);
        if (!fs.existsSync(drawableDir)) {
          fs.mkdirSync(drawableDir, { recursive: true });
        }

        // Remove the old XML shape drawable if a previous build left one —
        // having both .xml and .png for the same resource name confuses aapt2.
        const oldXml = path.join(drawableDir, 'splashscreen_logo.xml');
        if (fs.existsSync(oldXml)) fs.unlinkSync(oldXml);

        // Write the raster PNG that <bitmap android:src="@drawable/splashscreen_logo" />
        // expects.
        fs.writeFileSync(path.join(drawableDir, 'splashscreen_logo.png'), LOGO_PNG);
      }

      return config;
    },
  ]);
};

module.exports = withSplashscreenLogo;
