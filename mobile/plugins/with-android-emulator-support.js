// Config plugin: add x86_64 ABI to Android builds for emulator compatibility.
//
// Problem: EAS cloud builds produce arm64-v8a-only APKs.
// Windows/Intel Android emulators run x86_64, so `adb install` fails with
// INSTALL_FAILED_NO_MATCHING_ABIS.
//
// Fix: inject x86_64 into ndk.abiFilters for non-production builds so that
// the same APK installs on both physical devices (arm64) and emulators (x86_64).
// Production builds are left as arm64-v8a only (smaller, faster).

const { withAppBuildGradle } = require('@expo/config-plugins');

const withAndroidEmulatorSupport = (config) => {
  // Skip for production — keep APK lean (arm64-v8a only)
  if (process.env.APP_ENV === 'production') {
    return config;
  }

  return withAppBuildGradle(config, (mod) => {
    let contents = mod.modResults.contents;

    // 1) If arm64-v8a is the sole filter, add x86_64 alongside it
    if (contents.includes('abiFilters "arm64-v8a"') &&
        !contents.includes('x86_64')) {
      contents = contents.replace(
        /abiFilters\s+"arm64-v8a"/g,
        'abiFilters "arm64-v8a", "x86_64"',
      );
    }

    // 2) If no abiFilters exist yet, inject an ndk block into defaultConfig
    if (!contents.includes('abiFilters')) {
      contents = contents.replace(
        /(defaultConfig\s*\{)/,
        '$1\n            ndk {\n                abiFilters "arm64-v8a", "x86_64"\n            }',
      );
    }

    mod.modResults.contents = contents;
    return mod;
  });
};

module.exports = withAndroidEmulatorSupport;
