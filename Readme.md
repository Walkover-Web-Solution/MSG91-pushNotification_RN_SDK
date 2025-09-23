# 📲 MSG91 Push Notification SDK for React Native

Easily integrate **in-app pop-up notifications** and **Firebase Cloud Messaging (FCM)** notifications in your React Native app using MSG91's Push Notification SDK.

Supports:
- 🔔 In-App HTML Pop-up Notifications
- 📩 FCM Notifications on Android with HTML Templates

---

## 🚀 Installation

```bash
npm install @msg91comm/react-native-push-notification-sdk
# or
yarn add @msg91comm/react-native-push-notification-sdk
```

---

## 📦 Requirements

- [react-native-webview](https://www.npmjs.com/package/react-native-webview) - Install this as our package requires it as peer dependency.
#### For FCM Push-Notifications Only:
- [@react-native-firebase/messaging](https://rnfirebase.io/messaging/usage) - for FCM Notifications
- Firebase project with FCM enabled

---

## 💻 Basic Usage

### Basic Setup (without FCM Notifications)

```tsx
import MSG91PushNotificationSDK from '@msg91comm/MSG91PushNotificationSDK';
import { SafeAreaView } from 'react-native';

<>
  <AppNavigator/>
  <MSG91PushNotificationSDK
    helloConfig={{ widgetToken: 'your_widget_token' }}
    projectId="your_msg91_project_id"
  />
</>
```

_With this minimal setup, your app will receive In-App HTML Notification when your app is in foreground._

---

## 🔧 Firebase Setup (for FCM Notifications)

To send FCM notifications, your app must be connected to a Firebase project.

### 1. Generate Firebase Admin SDK Key

- Go to your Firebase project.
- Navigate to **Project Settings > Service Accounts**.
- Click **"Generate new private key"** and download the JSON file.

| Step 1 | Step 2 | Step 3 | Step 4 |
|--------|--------|--------|--------|
| ![Step1](https://github.com/user-attachments/assets/b6db5b1c-c6c5-4f75-b3e7-fc9e59068212) | ![Step2](https://github.com/user-attachments/assets/3128a5f0-fddb-49cc-9d8b-6001709c5a9a) | ![Step3](https://github.com/user-attachments/assets/307788e2-2015-443b-a4c0-e54e19de3e52) | ![Step4](https://github.com/user-attachments/assets/98a2f3a8-06f2-423e-a7f8-0f63f6225186) |


### 2. Upload Firebase Key to MSG91 Dashboard

Upload this Firebase Admin JSON in the **Push Notification Panel** via the Firebase Integration section.

### 3. Add `google-services.json` (Android)

Place your `google-services.json` file inside:
```
android/app/google-services.json
```

### 4. Enable FCM in Your App

Follow the [official Firebase setup guide](https://rnfirebase.io/messaging/usage) to enable FCM support in your app.

## 💻 Usage

## 🧑‍💻 Example with Firebase Messaging

```ts
import React, { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
import MSG91PushNotificationSDK from '@msg91comm/MSG91PushNotificationSDK';

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
        // Show in-app notification popup from FCM event.
        MSG91PushNotificationSDK.handleFCMNotification(remoteMessage?.data?.html_url as string);
      }
    });
  }, []);

  return (
    <>
      <AppNavigator/>
      <MSG91PushNotificationSDK
        helloConfig={{ widgetToken: 'your_widget_token' }}
        projectId="your_firebase_project_id"
      />
    </>
  );
}
```

---

## ⚙️ Props

| Prop        | Type     | Required | Description                              |
|-------------|----------|----------|------------------------------------------|
| `helloConfig` | object | Yes | Hello widget configuration, must include `widgetToken` |
| `projectId` | string   | Yes | MSG91 FCM project ID |

---

## 🧪 SDK Methods (for FCM Project only)

| Method | Description |
|--------|-------------|
| `MSG91PushNotificationSDK.registerFCM(fcmToken: string)` | Registers user device FCM token with project ID |
| `MSG91PushNotificationSDK.handleFCMNotification(htmlUrl: string)` | Opens FCM notification as Popup |

