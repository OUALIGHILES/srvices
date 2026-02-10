'use client'

import React from 'react'
import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from './supabase'

const supabase = createClient()

interface UserProfile {
  id: string
  email: string
  full_name: string
  phone_number: string
  user_type: 'customer' | 'driver' | 'admin'
  avatar_url?: string
  bio?: string
  rating: number
  total_reviews: number
  wallet_balance: number
  status: 'active' | 'suspended' | 'pending_approval'
  language: 'en' | 'ar'
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signUp: (email: string, password: string, userData: Partial<UserProfile>) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        setUser(user)

        if (user) {
          const { data: profileData, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single()
            
          if (error) {
            console.warn('Profile not found in users table, creating default profile:', error.message)
            // Create a default profile for the user if it doesn't exist
            const defaultProfile = {
              id: user.id,
              email: user.email || '',
              full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'New User',
              phone_number: user.phone_number || '',
              user_type: 'customer' as const,
              rating: 0,
              total_reviews: 0,
              wallet_balance: 0,
              status: 'active' as const,
              language: 'en' as const,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }

            try {
              const { error: insertError } = await supabase
                .from('users')
                .upsert(defaultProfile, { onConflict: ['id'] })

              if (insertError) {
                // Handle AbortError specifically to prevent console errors
                if (insertError.name === 'AbortError') {
                  console.warn('Profile creation/update was aborted:', insertError.message)
                } else {
                  console.error('Error creating/updating default profile:', insertError.message)
                }
              } else {
                setProfile(defaultProfile)
              }
            } catch (upsertError: any) {
              // Catch any other errors during upsert
              if (upsertError.name === 'AbortError') {
                console.warn('Profile creation/update was aborted:', upsertError.message)
              } else {
                console.error('Unexpected error during profile creation/update:', upsertError.message)
              }
            }
          } else {
            setProfile(profileData)
          }
        }
      } catch (error) {
        console.error('Auth check error:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    // Subscribe to auth changes
    const supabase = createClient()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null)
      if (session?.user) {
        let { data: profileData, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
          
        if (error) {
          console.warn('Profile not found in users table during auth state change, creating default profile:', error.message)
          // Create a default profile for the user if it doesn't exist
          const defaultProfile = {
            id: session.user.id,
            email: session.user.email || '',
            full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'New User',
            phone_number: session.user.phone_number || '',
            user_type: 'customer' as const,
            rating: 0,
            total_reviews: 0,
            wallet_balance: 0,
            status: 'active' as const,
            language: 'en' as const,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }

          try {
            const { error: insertError } = await supabase
              .from('users')
              .upsert(defaultProfile, { onConflict: ['id'] })

            if (insertError) {
              // Handle AbortError specifically to prevent console errors
              if (insertError.name === 'AbortError') {
                console.warn('Profile creation/update was aborted:', insertError.message)
              } else {
                console.error('Error creating/updating default profile:', insertError.message)
              }
            } else {
              setProfile(defaultProfile)
            }
          } catch (upsertError: any) {
            // Catch any other errors during upsert
            if (upsertError.name === 'AbortError') {
              console.warn('Profile creation/update was aborted:', upsertError.message)
            } else {
              console.error('Unexpected error during profile creation/update:', upsertError.message)
            }
          }
        } else {
          setProfile(profileData)
        }
      } else {
        setProfile(null)
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, userData: Partial<UserProfile>) => {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          ...userData,
          full_name: userData.full_name,
          phone_number: userData.phone_number,
        },
      },
    })
    if (error) throw error

    if (data.user) {
      // Check if user already exists in the users table (might happen due to race conditions)
      const { data: existingProfile, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single()
      
      if (fetchError) {
        try {
          // User doesn't exist in the users table, so create it
          const { error: profileError } = await supabase.from('users').upsert({
            id: data.user.id,
            email,
            full_name: userData.full_name || email.split('@')[0],
            phone_number: userData.phone_number || '',
            user_type: userData.user_type || 'customer',
            rating: 0,
            total_reviews: 0,
            wallet_balance: 0,
            status: 'active',
            language: userData.language || 'en',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }, { onConflict: ['id'] })

          if (profileError) {
            // Handle AbortError specifically to prevent console errors
            if (profileError.name === 'AbortError') {
              console.warn('Profile creation/update was aborted during sign up:', profileError.message)
            } else {
              throw profileError
            }
          } else {
            // Set the profile after successful creation
            const newProfile = {
              id: data.user.id,
              email,
              full_name: userData.full_name || email.split('@')[0],
              phone_number: userData.phone_number || '',
              user_type: userData.user_type || 'customer',
              rating: 0,
              total_reviews: 0,
              wallet_balance: 0,
              status: 'active',
              language: userData.language || 'en',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            setProfile(newProfile);
          }
        } catch (upsertError: any) {
          // Handle any other errors during upsert
          if (upsertError.name === 'AbortError') {
            console.warn('Profile creation/update was aborted during sign up:', upsertError.message)
          } else {
            throw upsertError
          }
        }
      } else {
        // User already exists in the users table, update if needed
        console.log('User profile already exists in the users table')
        setProfile(existingProfile);
      }
    }
  }

  const signIn = async (email: string, password: string) => {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error

    // After successful sign in, check if user profile exists in the users table
    if (data?.user) {
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (profileError) {
        console.warn('Profile not found in users table during sign in, creating default profile:', profileError.message)
        // Create a default profile for the user if it doesn't exist
        const defaultProfile = {
          id: data.user.id,
          email: data.user.email || '',
          full_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'New User',
          phone_number: data.user.phone_number || '',
          user_type: 'customer' as const,
          rating: 0,
          total_reviews: 0,
          wallet_balance: 0,
          status: 'active' as const,
          language: 'en' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        try {
          const { error: insertError } = await supabase
            .from('users')
            .upsert(defaultProfile, { onConflict: ['id'] })

          if (insertError) {
            // Handle AbortError specifically to prevent console errors
            if (insertError.name === 'AbortError') {
              console.warn('Profile creation/update was aborted:', insertError.message)
            } else {
              console.error('Error creating/updating default profile:', insertError.message)
            }
          }
        } catch (upsertError: any) {
          // Catch any other errors during upsert
          if (upsertError.name === 'AbortError') {
            console.warn('Profile creation/update was aborted:', upsertError.message)
          } else {
            console.error('Unexpected error during profile creation/update:', upsertError.message)
          }
        }
      } else {
        // Update the profile state immediately after successful sign in
        setProfile(profileData);
      }
    }
  }

  const signOut = async () => {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    
    // Reset user and profile state after logout
    setUser(null)
    setProfile(null)
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('Not authenticated')

    const supabase = createClient()
    const { error } = await supabase.from('users').update(updates).eq('id', user.id)
    if (error) throw error

    setProfile((prev) => (prev ? { ...prev, ...updates } : null))
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
