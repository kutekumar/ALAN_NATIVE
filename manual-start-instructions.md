# Manual Start Instructions

If the batch files don't work, try these manual commands:

## Option 1: Offline Mode
```bash
npx expo start --offline --clear
```

## Option 2: Skip Doctor Checks
```bash
set EXPO_NO_DOCTOR=1
npx expo start --clear
```

## Option 3: Basic Start
```bash
npx expo start --no-dev --clear
```

## Option 4: Network Troubleshooting
1. Check your internet connection
2. Try using mobile hotspot
3. Disable VPN if using one
4. Try: `npm config set registry https://registry.npmjs.org/`

## Option 5: Alternative Metro Start
```bash
npx react-native start --reset-cache
```

The fetch error is usually due to:
- Network connectivity issues
- Firewall blocking Expo servers
- VPN interference
- Corporate network restrictions