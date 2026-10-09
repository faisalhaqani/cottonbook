// Runs after `npx cap add android`. Applies CottonBook's icon, colour, version and a fixed
// signing key, so every build is signed the same way and a new APK installs over the old one
// without wiping the user's trials.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const android = path.join(root, 'android');
const res = path.join(android, 'app/src/main/res');
if (!fs.existsSync(android)) { console.error('android/ not found. Run `npx cap add android` first.'); process.exit(1); }

// 1. launcher icons
fs.cpSync(path.join(root, 'resources/android'), res, { recursive: true });
fs.writeFileSync(path.join(res, 'values/ic_launcher_background.xml'),
`<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#38872C</color>
</resources>
`);

// 1b. keep the page's Capacitor bundles in step with the native plugins npm installed
const nm = path.join(root, 'node_modules/@capacitor');
const vend = path.join(root, 'www/vendor');
for (const [from, to] of [['core/dist/capacitor.js','capacitor.js'],
    ['filesystem/dist/plugin.js','capacitor-filesystem.js'],['share/dist/plugin.js','capacitor-share.js']]) {
  fs.copyFileSync(path.join(nm, from), path.join(vend, to));
}

// 2. version and signing
const versionName = process.env.APP_VERSION_NAME || '1.0.0';
const versionCode = process.env.APP_VERSION_CODE || '1';
const gradlePath = path.join(android, 'app/build.gradle');
let g = fs.readFileSync(gradlePath, 'utf8');
g = g.replace(/versionCode\s+\d+/, `versionCode ${versionCode}`)
     .replace(/versionName\s+"[^"]*"/, `versionName "${versionName}"`);
if (!g.includes('cottonbook-debug.keystore')) {
  g += `
// CottonBook: fixed signing key, kept in mobile/signing
android {
    signingConfigs {
        debug {
            storeFile file('../../signing/cottonbook-debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }
}
`;
}
fs.writeFileSync(gradlePath, g);
console.log(`prepared: version ${versionName} (${versionCode}), icons, green launcher background, fixed signing key`);
