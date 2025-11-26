# ALAN LUX - Luxury Shopping App

A React Native Expo TypeScript application for premium luxury shopping experience.

## 🚀 Quick Start

1. **Setup the project:**
   ```bash
   # Install dependencies
   npm install
   
   # Copy environment variables
   cp .env.example .env
   
   # Start development server
   npx expo start
   ```

2. **Test on device:**
   - Install latest Expo Go app
   - Scan QR code with camera
   - App will open in Expo Go

## 🏗️ Project Structure

```
src/
├── components/     # Reusable UI components
├── context/        # React contexts (Auth, etc.)
├── hooks/          # Custom React hooks
├── navigation/     # App navigation setup
├── screens/        # App screens
├── services/       # API services (Supabase, etc.)
└── types/          # TypeScript type definitions

assets/             # Images, fonts, etc.
```

## 🛠️ Tech Stack

- **Framework:** React Native with Expo SDK 50
- **Language:** TypeScript
- **Styling:** NativeWind (Tailwind CSS for React Native)
- **Navigation:** React Navigation 6
- **State Management:** React Query (TanStack Query)
- **Backend:** Supabase
- **Authentication:** Supabase Auth

## 📱 Features

- ✅ Bottom tab navigation
- ✅ Authentication context
- ✅ Supabase integration
- ✅ TypeScript configuration
- ✅ NativeWind styling
- ✅ React Query setup

## 🔧 Development Commands

```bash
# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web
npm run web

# Check for issues
npx expo doctor
```

## 🌟 Environment Variables

Copy `.env.example` to `.env` and configure:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📚 Next Steps

1. Implement authentication screens
2. Add product catalog screens
3. Create shopping cart functionality
4. Build order management
5. Add push notifications
6. Implement user profile management