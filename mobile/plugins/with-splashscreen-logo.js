// Custom config plugin: create a splashscreen_logo drawable
// during Android prebuild.
//
// Why: expo-splash-screen is pulled in as a transitive dep of the `expo`
// SDK package and its native code references R.drawable.splashscreen_logo.
// On this project the stock config plugin is not producing the drawable
// reliably, so we generate a tiny shape drawable of the brand color as a
// guaranteed placeholder. The app uses a custom JS splash
// (app/splash.tsx) anyway, so the native drawable is never actually shown
// to users — it only needs to exist so resource linking succeeds.

const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const DRAWABLE_XML = `<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android"
    android:shape="rectangle">
    <solid android:color="#1E3A5F" />
</shape>
`;

const withSplashscreenLogo = (config) => {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const drawableDir = path.join(
        config.modRequest.platformProjectRoot,
        'app',
        'src',
        'main',
        'res',
        'drawable'
      );

      if (!fs.existsSync(drawableDir)) {
        fs.mkdirSync(drawableDir, { recursive: true });
      }

      const logoPath = path.join(drawableDir, 'splashscreen_logo.xml');
      fs.writeFileSync(logoPath, DRAWABLE_XML);

      return config;
    },
  ]);
};

module.exports = withSplashscreenLogo;
