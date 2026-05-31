import {
  createContext,
  useEffect,
  useState,
} from "react";

import type { ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase/supabase-client";
import { isSupabaseConfigured } from "@/lib/supabase/supabase-client";
import {
  signInWithEmail,
  signOutUser,
  signUpWithEmail,
} from "@/features/auth/services/auth.service";
import {
  ensureUserProfile,
  getUserProfile,
  updateAuthenticatedProfile,
} from "@/features/auth/services/profile.service";
import type {
  AuthContextType,
  SignInPayload,
  SignUpPayload,
  UpdateProfilePayload,
  UserProfile,
} from "@/features/auth/types/auth.types";

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
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
    const result = await signUpWithEmail(payload);

    if (result.session) {
      setSession(result.session);
    }

    if (result.user) {
      setUser(result.user);
    }

    if (result.profile) {
      setProfile(result.profile);
    } else if (result.user) {
      const nextProfile = await getUserProfile(
        result.user
      );

      setProfile(nextProfile);
    }
  }

  async function signOut() {
    await signOutUser();
  }

  async function updateProfile(
    payload: UpdateProfilePayload
  ) {
    if (!user) {
      throw new Error("You must be signed in.");
    }

    try {
      await updateAuthenticatedProfile(user, payload);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update profile."
      );
      throw error;
    }

    const {
      data: { session: nextSession },
    } = await supabase.auth.getSession();

    setSession(nextSession);
    setUser(nextSession?.user ?? user);

    const nextProfile = await getUserProfile(
      nextSession?.user ?? user
    );

    setProfile(nextProfile);
    toast.success("Profile updated successfully.");
  }

  useEffect(() => {
    let isMounted = true;

    if (!isSupabaseConfigured) {
      setLoading(false);

      return () => {
        isMounted = false;
      };
    }

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
        const existingProfile =
          await getUserProfile(nextUser);
        const nextProfile =
          existingProfile ??
          (await ensureUserProfile({
            user: nextUser,
            fullName:
              typeof nextUser.user_metadata
                ?.full_name === "string"
                ? nextUser.user_metadata.full_name
                : undefined,
            email: nextUser.email,
            role: "client",
          }));

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
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
