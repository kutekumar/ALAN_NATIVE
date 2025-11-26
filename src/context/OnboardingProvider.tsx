import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Web-compatible storage
const storage = {
  getItem: async (key: string) => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  },
  setItem: async (key: string, value: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  },
  removeItem: async (key: string) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  },
};

interface OnboardingContextType {
  isFirstLaunch: boolean | null;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const ONBOARDING_KEY = 'has_completed_onboarding';

interface OnboardingProviderProps {
  children: ReactNode;
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const hasCompleted = await storage.getItem(ONBOARDING_KEY);
      setIsFirstLaunch(hasCompleted === null);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setIsFirstLaunch(true); // Default to showing onboarding if error
    }
  };

  const completeOnboarding = async () => {
    try {
      await storage.setItem(ONBOARDING_KEY, 'true');
      setIsFirstLaunch(false);
    } catch (error) {
      console.error('Error saving onboarding completion:', error);
    }
  };

  const resetOnboarding = async () => {
    try {
      await storage.removeItem(ONBOARDING_KEY);
      setIsFirstLaunch(true);
    } catch (error) {
      console.error('Error resetting onboarding:', error);
    }
  };

  const value = {
    isFirstLaunch,
    completeOnboarding,
    resetOnboarding,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}