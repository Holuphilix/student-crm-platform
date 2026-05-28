import {
  createContext,
  useEffect,
  useState,
} from "react";

import type { ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase/supabase-client";
import {
  signInWithEmail,
  signOutUser,
  signUpWithEmail,
} from "@/features/auth/services/auth.service";
import type {
  AuthContextType,
  SignInPayload,
  SignUpPayload,
  UserProfile,
} from "@/features/auth/types/auth.types";

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

async function getUserProfile(
  userId: string
): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, role, created_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);

  const [session, setSession] = useState<Session | null>(null);

  const [profile, setProfile] =
    useState<UserProfile | null>(null);

  const [loading, setLoading] = useState(true);

  async function signIn(payload: SignInPayload) {
    await signInWithEmail(payload);
  }

  async function signUp(payload: SignUpPayload) {
    await signUpWithEmail(payload);
  }

  async function signOut() {
    await signOutUser();
  }

  useEffect(() => {
    let isMounted = true;

    async function resolveAuthState(
      nextSession: Session | null
    ) {
      const nextUser = nextSession?.user ?? null;

      setSession(nextSession);
      setUser(nextUser);

      if (!nextUser) {
        setProfile(null);
        setLoading(false);

        return;
      }

      try {
        const nextProfile = await getUserProfile(
          nextUser.id
        );

        if (!isMounted) {
          return;
        }

        setProfile(nextProfile);
      } catch {
        if (!isMounted) {
          return;
        }

        setProfile(null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    async function getSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      await resolveAuthState(session);
    }

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        setLoading(true);
        void resolveAuthState(nextSession);
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        role: profile?.role ?? null,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
