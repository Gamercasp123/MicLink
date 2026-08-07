# MicLink

MicLink is a cross-platform React Native app for streaming live microphone audio from an iOS/Android phone to a local PC over UDP.

## Installation

1. Install dependencies:
   ```bash
   cd MicLink
   npm install
   npx pod-install ios
   ```

2. Run on Android:
   ```bash
   npm run android
   ```

3. Run on iOS:
   ```bash
   npm run ios
   ```

## Required native setup

### Android

Add to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.INTERNET" />
```

In `android/app/src/main/AndroidManifest.xml`, add inside `<application>` if background audio is needed:

```xml
<service android:name="com.example.MicLink.AudioService" android:foregroundServiceType="microphone|mediaProjection" />
```

### iOS

Add to `ios/MicLink/Info.plist`:

```xml
<key>NSMicrophoneUsageDescription</key>
<string>MicLink needs microphone access to stream audio to your PC.</string>
<key>UIBackgroundModes</key>
<array>
  <string>audio</string>
</array>
```

## Dependencies

- `react-native-live-audio-stream`
- `react-native-udp`
- `react-native-permissions`
- `buffer`

## App behavior

- Minimalist UI with IP and port inputs
- Connect / Disconnect toggle
- Live UDP audio streaming in PCM from the microphone
- Real-time activity status and level meter

## Notes

- Use a local UDP listener on PC to receive raw PCM audio.
- Sample rate is configured as 16 kHz mono to lower bandwidth and latency.
