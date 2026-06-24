# 📲 MSG91 Push Notification SDK for React Native

Easily integrate **in-app pop-up notifications** and **Firebase Cloud Messaging (FCM)** notifications in your React Native app using MSG91's Push Notification SDK.

Supports:
- 🔔 In-App HTML Pop-up Notifications (socket / foreground)
- 📩 FCM Notifications with HTML Templates (Android & iOS)

---

## 📋 Table of Contents

1. [Installation](#-installation)
2. [Requirements](#-requirements)
3. [Basic Usage (in-app pop-up)](#-basic-usage-in-app-pop-up)
4. [Firebase & MSG91 Dashboard Setup](#-firebase--msg91-dashboard-setup)
5. [Android Setup](#-android-setup)
6. [iOS Setup (APNs + FCM)](#-ios-setup-apns--fcm)
7. [FCM Integration in React Native](#-fcm-integration-in-react-native)
8. [Background FCM Handler](#-background-fcm-handler)
9. [Props & SDK Methods](#-props)
10. [Troubleshooting](#-troubleshooting)

---

## 🚀 Installation

```bash
npm install @msg91comm/react-native-push-notification-sdk react-native-webview
# or
yarn add @msg91comm/react-native-push-notification-sdk react-native-webview
```

#### For FCM push notifications also install:

```bash
npm install @react-native-firebase/app @react-native-firebase/messaging
```

Then for iOS:

```bash
cd ios && pod install && cd ..
```

Rebuild the native app after installation (`npm run android` / `npm run ios`).

---

## 📦 Requirements

| Dependency | Purpose |
|------------|---------|
| [react-native-webview](https://www.npmjs.com/package/react-native-webview) | Renders HTML notification pop-ups |
| [@react-native-firebase/app](https://rnfirebase.io/) | Firebase core |
| [@react-native-firebase/messaging](https://rnfirebase.io/messaging/usage) | FCM token & message handling |
| Firebase project with FCM enabled | Push delivery |
| **iOS only:** APNs configured in Apple Developer + Firebase | Required for iOS FCM tokens |

> ⚠️ **Important:** Use the **same Firebase project** everywhere — the one whose config files you add to your app **and** whose Admin SDK JSON you upload to the MSG91 dashboard.

---

## 💻 Basic Usage (in-app pop-up)

```tsx
import React from 'react';
import MSG91PushNotificationSDK from '@msg91comm/react-native-push-notification-sdk';

export default function App() {
  return (
    <>
      <AppNavigator />
      <MSG91PushNotificationSDK
        helloConfig={{
          widgetToken: 'your_widget_token',
          unique_id: 'user@example.com',
        }}
        projectId="your_msg91_project_id"
      />
    </>
  );
}
```

With this setup alone, your app receives in-app HTML notifications when a push is triggered via socket (app in foreground). For **FCM** (background / killed / tap-to-open), continue with the setup below.

---

## 🔧 Firebase & MSG91 Dashboard Setup

Complete these steps **before** integrating FCM in code.

### Step 1 — Create / use a Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a project (or use an existing one)
3. Add **both** platforms to this project:
   - **Android app** → note the package name (e.g. `com.yourcompany.app`)
   - **iOS app** → note the Bundle ID (e.g. `com.yourcompany.app`)

### Step 2 — Download Firebase config files

| Platform | File | Place in project |
|----------|------|------------------|
| Android | `google-services.json` | `android/app/google-services.json` |
| iOS | `GoogleService-Info.plist` | `ios/YourApp/GoogleService-Info.plist` (add to Xcode) |

### Step 3 — Upload Firebase Admin SDK JSON to MSG91

1. In Firebase → **Project Settings → Service Accounts**
2. Click **Generate new private key** → download the JSON file
3. In **MSG91 Dashboard → Push Notification Panel → FCM Projects → Create Project and config**
4. Upload this JSON for your project

> This must be the **same Firebase project** as the `google-services.json` / `GoogleService-Info.plist` in your app. If they don't match, tokens will register but notifications won't deliver.

---

## 🤖 Android Setup (Ignore if you already have firebase setup)

### 1. Add `google-services.json`

```
android/app/google-services.json
```

### 2. Gradle plugins

In `android/build.gradle`:

```gradle
classpath("com.google.gms:google-services:4.4.2")
```

In `android/app/build.gradle`:

```gradle
apply plugin: "com.google.gms.google-services"
```

### 3. Notification permission (Android 13+)

Add to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

### 4. Follow React Native Firebase guide

Complete any remaining steps from the [RN Firebase messaging docs](https://rnfirebase.io/messaging/usage).

---

## 🍎 iOS Setup (APNs + FCM)

On iOS, FCM does **not** work without APNs (Apple Push Notification service). You must configure APNs in **three places** — all using the **same Bundle ID** and **same Firebase project**.

---

### Part A — Apple Developer Portal (Identifiers)

1. Sign in to [Apple Developer](https://developer.apple.com/account/)
2. Go to **Certificates, Identifiers & Profiles → Identifiers**
3. Select your app's **App ID** (or create one)
   - Type: **App IDs → App**
   - Description: your app name
   - **Bundle ID:** e.g. `com.yourcompany.app` (must match Xcode exactly)
4. Under **Capabilities**, enable:
   - ✅ **Push Notifications**
5. Click **Save**

#### Create APNs Auth Key (.p8) — recommended

1. Go to **Keys → + (Create a key)**
2. Name: e.g. `APNs Push Key`
3. Enable **Apple Push Notifications service (APNs)**
4. Click **Continue → Register**
5. **Download the `.p8` file** — you can only download it **once**
6. Note down:
   - **Key ID** (10-character string)
   - **Team ID** (from Membership details, top-right of developer portal)

> Keep the `.p8` file safe. You will upload it to Firebase in Part C.

---

### Part B — Xcode Configuration (Ignore if already done)

1. Open `ios/YourApp.xcworkspace` in Xcode
2. Select your **app target → Signing & Capabilities**

#### Signing

- **Team:** your Apple Developer team
- **Bundle Identifier:** must match the App ID from Part A exactly  
  (e.g. `com.yourcompany.app`)

#### Add capabilities

Click **+ Capability** and add:

| Capability | Why |
|------------|-----|
| **Push Notifications** | Required for APNs |
| **Background Modes** | Check **Remote notifications** |

This adds `aps-environment` to your entitlements file and `remote-notification` to `UIBackgroundModes` in `Info.plist`.

#### Verify `Info.plist`

Ensure `UIBackgroundModes` includes:

```xml
<key>UIBackgroundModes</key>
<array>
  <string>remote-notification</string>
</array>
```

#### Add `GoogleService-Info.plist`

1. Drag `GoogleService-Info.plist` (from Firebase Console) into your Xcode project
2. Check **Copy items if needed** and add to your app target
3. Verify `BUNDLE_ID` inside the plist matches your Xcode Bundle Identifier

#### Configure Firebase in `AppDelegate`

In `ios/YourApp/AppDelegate.mm` (or `.m`):

```objc
#import <Firebase.h>

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  [FIRApp configure];
  // ... rest of your setup
  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}
```

#### Entitlements — development vs production

Your `.entitlements` file will contain:

```xml
<key>aps-environment</key>
<string>development</string>
```

| Build type | Value |
|------------|-------|
| Debug / local dev | `development` |
| TestFlight / App Store | `production` |

Xcode usually manages this automatically when **Automatically manage signing** is enabled. For release builds, confirm `aps-environment` is `production`.

---

### Part C — Upload APNs Key (.p8) to Firebase

This connects Apple Push to your Firebase project so FCM can deliver to iOS devices.

1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select the **same Firebase project** whose `GoogleService-Info.plist` is in your app
3. Go to **Project Settings (⚙️) → Cloud Messaging tab**
4. Scroll to **Apple app configuration**
5. Under **APNs Authentication Key**, click **Upload**
6. Enter:
   - **APNs auth key file:** your `.p8` file
   - **Key ID:** from Part A
   - **Team ID:** your Apple Developer Team ID
7. Click **Upload**

> ✅ The Firebase project here must be the **same project** whose Admin SDK JSON you uploaded to the MSG91 dashboard.

---

### Part D — iOS testing checklist

| Check | Expected |
|-------|----------|
| Physical iPhone (not simulator) | Simulator cannot receive real push |
| Notification permission granted | User taps "Allow" on first launch |
| Bundle ID matches everywhere | Apple Developer = Xcode = GoogleService-Info.plist |
| APNs key uploaded to Firebase | Cloud Messaging tab shows key uploaded |
| Same Firebase project in MSG91 | Admin JSON matches app's config files |
| `[FIRApp configure]` in AppDelegate | Firebase initialized on launch |
| FCM token logged in console | See integration example below |

---

## 🧑‍💻 FCM Integration in React Native

Mount the SDK component **and** add this `useEffect` in your root component (e.g. `App.tsx`):

```tsx
import React, { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
import MSG91PushNotificationSDK from '@msg91comm/react-native-push-notification-sdk';

export default function App() {
  useEffect(() => {
    messaging().getToken().then(token => {
      // Registers device FCM token with MSG91 for FCM Notifications.
      MSG91PushNotificationSDK.registerFCM(token);
    });

    messaging().onNotificationOpenedApp(remoteMessage => {
      if (remoteMessage?.data?.key === 'msg91') {
        // Shows in-app notification popup on click of FCM notification.
        MSG91PushNotificationSDK.handleFCMNotification(remoteMessage?.data?.html_url as string);
      }
    });

    messaging().onMessage((remoteMessage) => {
      if (remoteMessage?.data?.key === 'msg91') {
        // Shows in-app notification popup from FCM event.
        MSG91PushNotificationSDK.handleFCMNotification(remoteMessage?.data?.html_url as string);
      }
    });
  }, []);

  return (
    <>
      <AppNavigator />
      <MSG91PushNotificationSDK
        helloConfig={{
          widgetToken: 'your_widget_token',
          unique_id: 'user@example.com',
        }}
        projectId="your_msg91_project_id"
      />
    </>
  );
}
```

---

## ⚙️ Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `helloConfig` | object | Yes | Must include `widgetToken`. Pass `unique_id` could be username, email etc.. |
| `projectId` | string | Yes | Firebase project id |

---

## 🧪 SDK Methods

| Method | Description |
|--------|-------------|
| `MSG91PushNotificationSDK.registerFCM(fcmToken)` | Sends FCM token to MSG91 backend for this device |
| `MSG91PushNotificationSDK.handleFCMNotification(htmlUrl)` | Fetches HTML content and shows in-app pop-up |

---

## 🔍 Troubleshooting

### iOS — FCM token is `null` or `getToken` fails

| Cause | Fix |
|-------|-----|
| Permission denied | Call `requestPermission` and await user approval |
| APNs not configured | Complete [Part A–C](#-ios-setup-apns--fcm) |
| `.p8` not uploaded to Firebase | Upload in Firebase → Cloud Messaging → Apple app configuration |
| Bundle ID mismatch | Match Apple Developer, Xcode, and `GoogleService-Info.plist` |
| Testing on simulator | Use a **physical device** |
| Wrong Firebase project | Same project for plist, Admin JSON (MSG91), and APNs key |
| `aps-environment` wrong for build | `development` for debug, `production` for TestFlight/App Store |

### iOS — Token registers but notifications don't arrive

- Confirm Firebase Admin JSON in MSG91 dashboard is from the **same** Firebase project
- Confirm APNs Auth Key (.p8) is uploaded in that same Firebase project
- Check MSG91 campaign targets the correct `projectId`

### Android — Notifications not showing (API 33+)

- Add `POST_NOTIFICATIONS` permission to `AndroidManifest.xml`
- Ensure runtime permission is granted via `requestPermission()`

### General — Pop-up not showing on FCM

- Verify payload contains `data.key = "msg91"` and `data.html_url`
- Ensure `<MSG91PushNotificationSDK />` is mounted in your component tree
- Check `handleFCMNotification` is called in all listeners (foreground, background tap)

--