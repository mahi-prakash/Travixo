import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../utils/supabase";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState(null);

  const syncProfile = async (currentUser) => {
    if (!currentUser) {
      setProfile(null);
      return;
    }

    try {
      // 1. Try to fetch existing profile
      const { data: existingProfile, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .single();

      if (existingProfile) {
        setProfile(existingProfile);
        return;
      }

      // 2. If not exists, create it
      const { data: newProfile, error: insertError } = await supabase
        .from("profiles")
        .insert({
          id: currentUser.id,
          email: currentUser.email,
          full_name: currentUser.user_metadata?.full_name || "Adventurer",
          avatar_url: currentUser.user_metadata?.avatar_url
        })
        .select("*")
        .single();

      if (insertError) throw insertError;
      setProfile(newProfile);
    } catch (err) {
      console.error("Profile sync error:", err);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      syncProfile(currentUser);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      syncProfile(currentUser);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    // Determine the redirect URL (Local vs Production)
    const redirectUrl = window.location.origin.includes('localhost') 
      ? window.location.origin 
      : 'https://www.thetravstory.com';

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
      },
    });
    if (error) throw error;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <UserContext.Provider
      value={{
        user,
        profile,
        session,
        token: session?.access_token,
        loading,
        loginWithGoogle,
        logout,
        setUser,
        refreshProfile: () => syncProfile(user),
        // Personality tag is now a static default
        personalityTag: "Adventurer", 
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
