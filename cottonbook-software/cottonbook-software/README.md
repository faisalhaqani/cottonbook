# CottonBook

Cotton breeder trait recorder and analysis software.
FSC&RD morphological descriptor, plant-level recording, full statistical suite, supplementary workbook export.

**Muhammad Faisal Haqani** — Masters in Plant Breeding and Genetics
Department of Plant Breeding and Genetics, The Islamia University of Bahawalpur

---

## What is in this folder

```
web/                     ready to upload to your website, installable as an app
  index.html             the whole application
  manifest.webmanifest   makes it installable on phone and desktop
  sw.js                  service worker, so it opens with no internet
  vendor/                xlsx 0.18.5 and jszip 3.10.1, bundled locally
  icons/

desktop/                 Tauri project, compiles to .exe, .msi, .dmg, .AppImage, .deb
  src/                   the same application, fully offline
  src-tauri/             native shell, config, icons
  package.json
```

The application is one self-contained HTML file. There is no server, no database and
no account. Every trial lives on the machine that recorded it, and moves as a `.cbk` file.

---

## 1. Website version (fastest)

Upload the contents of `web/` to any folder on your site, for example
`https://devcampsolutions.online/cottonbook/`, and open `index.html`.

Two requirements, both normal:

- Serve it over **HTTPS**. The service worker will not register on plain HTTP
  (except on `localhost`), and without it the offline mode is off.
- Keep the folder structure. `sw.js` must sit beside `index.html`, not in a subfolder,
  or its scope will be too narrow to cache the app.

Once a visitor opens it, Chrome and Edge show an install button in the address bar,
and Android offers "Add to home screen". After the first visit it works with no
connection at all.

To test locally before uploading:

```bash
cd web
python3 -m http.server 8080
# then open http://localhost:8080
```

---

## 2. Desktop application

Build once per operating system; Tauri cannot cross-compile a Windows installer
from macOS or Linux.

### Install the toolchain

1. **Rust** — https://rustup.rs
2. **Node.js 18 or newer** — https://nodejs.org
3. Platform dependencies:
   - **Windows**: Microsoft C++ Build Tools, and WebView2 (already present on Windows 10 and 11)
   - **macOS**: `xcode-select --install`
   - **Linux**: `sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget file libssl-dev libayatana-appindicator3-dev librsvg2-dev`

### Build

```bash
cd desktop
npm install
npm run dev      # opens the app in a window, with live reload
npm run build    # produces the installers
```

Output lands in `desktop/src-tauri/target/release/bundle/`:

| Platform | File |
|---|---|
| Windows | `nsis/CottonBook_1.0.0_x64-setup.exe` and `msi/CottonBook_1.0.0_x64_en-US.msi` |
| macOS | `dmg/CottonBook_1.0.0_aarch64.dmg` |
| Linux | `appimage/cottonbook_1.0.0_amd64.AppImage` and `deb/cottonbook_1.0.0_amd64.deb` |

Installer size is roughly **4 to 9 MB**, because Tauri uses the operating system's own
webview instead of shipping a browser engine.


### No Windows or Mac? Let GitHub build them

`desktop/.github/workflows/release.yml` builds all three platforms on GitHub's own machines, free
for public repositories.

1. Create a GitHub repository and upload the **contents** of `desktop/` to it, including the hidden `.github` folder.
2. Open the **Actions** tab, choose **Build installers**, press **Run workflow**.
3. Wait about 15 minutes. A draft **Release** appears with the `.exe`, `.msi`, `.dmg`, `.AppImage` and `.deb` attached.
4. Download them, rename to the names listed in the website's `downloads/` note, upload, and switch the platform to `true` in `RELEASED`.

Later releases: push a tag such as `v1.0.1` and the build runs by itself.

### Before you publish the installers

- **Code signing.** Unsigned installers trigger SmartScreen on Windows and Gatekeeper on
  macOS. Users can still proceed, but expect support questions. A Windows OV certificate
  runs roughly $200 to $400 a year, and an Apple Developer account $99 a year.
- **Version numbers** live in three files and must match: `package.json`,
  `src-tauri/Cargo.toml` and `src-tauri/tauri.conf.json`.

---

## 3. Android application

The same `web/` folder becomes an APK through Capacitor:

```bash
npm create @capacitor/app cottonbook-mobile
cd cottonbook-mobile
# set webDir to a copy of the web/ folder in capacitor.config.ts
npx cap add android
npx cap sync
npx cap open android     # builds and signs in Android Studio
```

Worth adding before a Play Store release: a camera button per plot, GPS stamping,
and SQLite in place of browser storage so Android cannot evict the data.

---

## Data and file formats

| Format | What it is |
|---|---|
| `.cbk` | One trial, or your whole library. JSON. Save it after every recording session. |
| `.xlsx` | Supplementary workbook: raw plant data, plot means, genotype means, mean squares, one sheet per analysis. |
| `.zip` | Every figure as an editable SVG and a 2× PNG. |

Storage is the browser profile or the app's own webview storage. It survives restarts
and updates. It does **not** survive clearing site data, so the `.cbk` file is the
real backup.

---

## Statistical methods

- Variance components after Burton and DeVane (1953): σ²g = (MSg − MSe)/r, σ²e = MSe, σ²p = σ²g + σ²e
- Broad-sense heritability after Allard (1960)
- Genetic advance after Johnson, Robinson and Comstock (1955), k = 2.06 at 5% selection
- Genotypic, phenotypic and environmental correlation from the analysis of covariance, after Singh and Chaudhary
- Path coefficient analysis after Dewey and Lu (1959)
- Line × Tester after Kempthorne (1957); σ²A = 2σ²gca with inbred parents, σ²D = σ²sca
- MCA inertia corrected after Benzécri (1979)
- Mantel test by permutation, 999 permutations, two-tailed

Significance is reported as `**` at 1%, `*` at 5%, and as the words Significant or
Non-significant beside it.

Negative variance components are set to zero, as is conventional, and this is stated in
the output. Genotypic correlations can exceed ±1 when components are small; they are
shown as computed rather than clipped.

---

## Third-party components

| Library | Version | Licence | Use |
|---|---|---|---|
| SheetJS (xlsx) | 0.18.5 | Apache-2.0 | writes the supplementary workbook |
| JSZip | 3.10.1 | MIT or GPLv3 | bundles the figures |
| IBM Plex | — | SIL Open Font Licence 1.1 | typeface |

All statistical code is original and has no dependencies.

---

## 3a. Android APK (built by GitHub, no Android Studio needed)

`mobile/` is the Android project. The `android/` folder is generated during the build, so only the
sources live in the repository: the web app (`www/`), icons (`resources/`), the signing key (`signing/`)
and one script that applies them (`scripts/prepare-android.mjs`).

1. Upload `mobile/` into the repository next to `desktop/`.
2. Add `.github/workflows/android.yml` (provided as `android.yml`).
3. Actions tab, **Build Android APK**, **Run workflow**. It attaches `CottonBook_1.0.0.apk` to the release.

Files are saved through the Android share sheet, because a phone's web view cannot save files itself.

**Signing.** `signing/cottonbook-debug.keystore` is a shared test key (password `android`). It keeps every
build signed the same way, so a new APK installs over the old one without deleting the user's trials. Before
a Google Play release, replace it with a private key kept in GitHub secrets, and build a signed release bundle.
