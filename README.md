# RaPaX™ Mobile
## React Native — Android & iOS
**Archer Chain Analytics™ — Sovereign Digital Vending Machine**

---

## What's In The App

**Three tabs:**

| Tab | Who | What |
|---|---|---|
| 🛒 STORE | Buyers | Browse products, select currency, get payment address + QR, live status, download link |
| ⚡ OPERATOR | You | Stats, product availability toggles, transactions, manual payment confirm, audit logs |
| ⚙️ SETTINGS | You | Configure RaPaX™ server URL and operator secret |

---

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | 18 LTS+ | nodejs.org |
| React Native CLI | latest | `npm install -g react-native-cli` |
| Android Studio | latest | developer.android.com |
| Java JDK | 17 | Bundled with Android Studio |
| Android SDK | API 33+ | Via Android Studio SDK Manager |

---

## Setup

### 1. Install dependencies

```bash
cd rapax-mobile
npm install
```

### 2. Android environment

In Android Studio:
- Open SDK Manager → install **Android SDK Platform 33**
- Open AVD Manager → create a device (Pixel 6, API 33) for testing

Set environment variables in `~/.bashrc` or `~/.zshrc`:

```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### 3. Configure the app

On first launch, go to **Settings** tab:
- Enter your RaPaX™ API URL (e.g., `http://192.168.1.50:4000/api`)
- Toggle **Operator Mode** on if you want the operator dashboard
- Enter your operator secret

> **Same network required:** Your phone and RaPaX™ server must be on the same WiFi, or RaPaX™ must be accessible via a public URL/domain.

---

## Development

```bash
# Start Metro bundler
npm start

# Run on Android emulator or connected device
npm run android

# Run on iOS simulator (Mac only)
npm run ios
```

---

## Build APK (Sideload)

### Generate a signing keystore (once only)

```bash
cd android/app
keytool -genkeypair -v -storetype PKCS12 \
  -keystore rapax-release-key.keystore \
  -alias rapax-key -keyalg RSA -keysize 2048 -validity 10000
```

### Configure signing

Edit `android/app/build.gradle`:

```gradle
android {
  signingConfigs {
    release {
      storeFile file('rapax-release-key.keystore')
      storePassword 'YOUR_STORE_PASSWORD'
      keyAlias 'rapax-key'
      keyPassword 'YOUR_KEY_PASSWORD'
    }
  }
  buildTypes {
    release {
      signingConfig signingConfigs.release
      minifyEnabled true
      proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
  }
}
```

### Build the APK

```bash
npm run build:apk
```

APK output: `android/app/build/outputs/apk/release/app-release.apk`

### Install on Android device

```bash
# Via ADB (USB or wireless)
adb install android/app/build/outputs/apk/release/app-release.apk

# Or copy APK to device and open with file manager
# Enable "Install from unknown sources" in Android Settings → Security
```

---

## Network Configuration

RaPaX™ must be reachable from the device.

**Same WiFi (development):**
- Find your machine's local IP: `ip addr` (Linux) or `ipconfig` (Windows)
- Use `http://192.168.x.x:4000/api` in Settings

**Production (public URL):**
- Put RaPaX™ behind nginx/Caddy with a domain + TLS
- Use `https://your-domain.com/api` in Settings
- Update `DOWNLOAD_LINK_TTL` in RaPaX™ `.env` as needed

**Android HTTP cleartext (local only):**
The app allows cleartext HTTP for local development.
For production, always use HTTPS.

---

## App Structure

```
rapax-mobile/
├── App.js                          — Root entry point
├── src/
│   ├── theme/index.js              — Brand tokens (black/gold/white)
│   ├── services/api.js             — RaPaX™ API client + AsyncStorage config
│   ├── components/index.js         — Shared UI components
│   ├── navigation/index.js         — Tab + stack navigation
│   └── screens/
│       ├── ShopScreen.js           — Buyer: product catalog + currency select
│       ├── CheckoutScreen.js       — Buyer: payment address, QR, live status
│       ├── OperatorScreen.js       — Operator: stats, products, transactions, logs
│       └── SettingsScreen.js       — Config: API URL + operator secret
```

---

## Full Buyer Flow

```
Settings → enter API URL

Store tab
  → Browse products
  → Select currency (BTC / ETH / SOL / USDT)
  → Receive payment address + QR code
  → Send crypto from any wallet

Live status updates every 15 seconds:
  pending → confirming → confirmed → fingerprinting → delivering

Payment confirmed + fingerprint complete:
  → Download link appears in app
  → Tap to open browser and download fingerprinted asset
```

---

## Full Operator Flow

```
Settings → enable Operator Mode + enter secret

Operator tab
  STATS        — Total products, transactions, revenue by currency
  PRODUCTS     — Toggle availability on/off per product
  TRANSACTIONS — View all transactions, manually confirm payments
  LOGS         — Full immutable audit log with event types
```

---

*© Archer Chain Analytics™ — All Rights Reserved.*
*Sovereign. Zero-Trust. Zero Compromise.*
