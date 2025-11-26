# ALAN LUX App Setup Guide

## 🚨 Fix the Current Issues

### 1. Uninstall Global Expo CLI (if installed)
```bash
npm uninstall -g expo-cli
```

### 2. Clear npm/yarn cache
```bash
# If using npm
npm cache clean --force

# If using yarn
yarn cache clean
```

### 3. Install dependencies
```bash
# Delete existing node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Install fresh dependencies
npm install
```

### 4. Copy environment file
```bash
cp .env.example .env
```

### 5. Start the development server
```bash
npx expo start
```

## 📱 Testing with Expo Go

After running `npx expo start`:
1. Make sure you're using **Expo Go version 2.29.0 or higher**
2. Scan the QR code with your iPhone camera
3. It should open in Expo Go without the manifest error

## 🔧 Alternative: Use Development Build

If you still have issues, create a development build:

```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Configure EAS
npx expo install expo-dev-client
eas build:configure

# Create development build for iOS
eas build --platform ios --profile development
```

## 📋 Troubleshooting

### If you get "legacy manifest" error:
- Update Expo Go app on your phone
- Use `npx expo start` instead of `expo start`
- Clear Expo Go cache: Settings > Clear Cache

### If you get dependency version errors:
```bash
npx expo install --fix
```

### Check your setup:
```bash
npx expo doctor
```