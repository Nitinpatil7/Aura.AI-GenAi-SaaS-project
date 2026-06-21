"use client";

import { useState, createContext, useCallback, useEffect } from "react";

export const appcontext = createContext();

export const ContextProvider = ({ children }) => {
  const [api] = useState(
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"
  );
  const [profile, setprofile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    try {
      const res = await fetch(`${api}/auth/me`, {
        method: "GET",
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setprofile(data);
      } else {
        setprofile(null);
      }
    } catch (error) {
      console.error("Profile refresh failed:", error);
    } finally {
      setProfileLoading(false);
    }
  }, [api]);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  return (
    <appcontext.Provider value={{ api, profile, setprofile, refreshProfile, profileLoading }}>
      {children}
    </appcontext.Provider>
  );
};


