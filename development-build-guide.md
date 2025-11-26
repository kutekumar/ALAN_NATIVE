# Development Build Setup Guide

Since Expo Go SDK 54 is having TurboModule issues with our project, we'll create a custom development build. This is actually the recommended approach for real app development.

## What is a Development Build?

- Custom Expo Go app with YOUR exact dependencies pre-compiled
- No more version compatibility issues
- Access to any React Native package
- More reliable for complex apps

## Setup Steps:

### 1. Install EAS CLI
```bash
npm install -g @expo/eas-cli
```

### 2. Login to Expo
```bash
eas login
```
(Use your existing Expo account or create one)

### 3. Install Development Client
```bash
npx expo install expo-dev-client
```

### 4. Configure EAS
```bash
eas build:configure
```

### 5. Create iOS Development Build
```bash
eas build --platform ios --profile development
```

### 6. Install on Your Phone
- EAS will provide a link to install via TestFlight
- Or download directly from EAS dashboard
- Install this custom app instead of regular Expo Go

### 7. Start Development Server
```bash
npx expo start --dev-client
```

### 8. Scan QR Code
- Use your NEW custom development app
- Not the regular Expo Go

## Benefits:

✅ No more TurboModule errors
✅ All our dependencies will work
✅ Faster development experience
✅ Access to any React Native library
✅ Production-ready setup

## Time Investment:

- Initial setup: 10-15 minutes
- Build time: 5-10 minutes (first time)
- Then works perfectly forever!

This is the professional way to develop React Native apps with Expo.