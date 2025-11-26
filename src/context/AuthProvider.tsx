import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  language: string | null;
  created_at: string;
  updated_at: string;
  email: string;
  avatar_url: string | null;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await getProfile(session.user.id);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const getInitialSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting initial session:', error);
        setLoading(false);
        return;
      }

      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await getProfile(session.user.id);
      }
    } catch (error) {
      console.error('Error in getInitialSession:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProfile = async (userId: string) => {
    try {
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      // If profile doesn't exist, create one for existing users
      if (error && error.code === 'PGRST116') {
        console.log('Profile not found, creating one for existing user...');
        
        // Get user info from auth
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const profileData = {
            id: userId,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            email: user.email || '',
            phone: user.user_metadata?.phone || null,
            language: 'en',
            avatar_url: null,
          };

          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert(profileData)
            .select()
            .single();

          if (createError) {
            console.error('Error creating profile for existing user:', createError);
            return;
          }

          setProfile(newProfile);
          return;
        }
      }

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error in getProfile:', error);
    }
  };

  const createProfile = async (userId: string, email: string, fullName: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          full_name: fullName,
          email: email,
          phone: null,
          language: 'en',
          avatar_url: null,
        });

      if (error) {
        console.error('Error creating profile:', error);
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error('Error in createProfile:', error);
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      setLoading(true);
      
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: displayName,
          }
        }
      });

      if (signUpError) {
        setLoading(false);
        return { error: signUpError };
      }

      // Create profile if user was created
      if (data.user) {
        const { error: profileError } = await createProfile(
          data.user.id, 
          email, 
          displayName
        );

        if (profileError) {
          setLoading(false);
          return { error: profileError };
        }
      }

      setLoading(false);
      return { error: null };
    } catch (error) {
      setLoading(false);
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('AuthProvider signIn called with:', email);
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('Supabase signIn response:', { data, error });
      setLoading(false);
      
      if (error) {
        console.log('SignIn error in AuthProvider:', error);
      }
      
      return { error };
    } catch (error) {
      console.log('SignIn catch error in AuthProvider:', error);
      setLoading(false);
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const value = {
    session,
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}