import { supabase } from "@/lib/supabase/supabase-client";
import { apiClient } from "@/lib/api/client";

import type {
  PasswordRecoveryPayload,
  SignInPayload,
  SignUpPayload,
  SignUpResult,
  UpdateEmailPayload,
  UpdatePasswordPayload,
  UserProfile,
} from "@/features/auth/types/auth.types";
import { getUserProfile } from "@/features/auth/services/profile.service";

type RegisterUserResponse = {
  user: {
    id: string;
    email: string | null;
  };
  profile: UserProfile;
};

export async function signInWithEmail(
  payload: SignInPayload
) {
  const { error } =
    await supabase.auth.signInWithPassword({
      email: payload.email,
      password: payload.password,
    });

  if (error) {
    throw new Error(error.message);
  }
}

export async function signUpWithEmail(
  payload: SignUpPayload
): Promise<SignUpResult> {
  const registration =
    await apiClient<RegisterUserResponse>(
      "/api/auth/register",
      {
        method: "POST",
        body: JSON.stringify({
          full_name: payload.fullName,
          email: payload.email,
          password: payload.password,
        }),
      }
    );

  const { data, error } =
    await supabase.auth.signInWithPassword({
      email: payload.email,
      password: payload.password,
    });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user) {
    return {
      user: null,
      session: data.session,
      profile: registration.profile,
    };
  }

  const profile =
    (await getUserProfile(data.user)) ??
    registration.profile;

  return {
    user: data.user,
    session: data.session,
    profile,
  };
}

export async function requestPasswordRecovery(
  payload: PasswordRecoveryPayload
) {
  const { error } =
    await supabase.auth.resetPasswordForEmail(
      payload.email,
      {
        redirectTo: `${window.location.origin}/reset-password`,
      }
    );

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateAuthenticatedPassword(
  payload: UpdatePasswordPayload
) {
  const { error } = await supabase.auth.updateUser({
    password: payload.password,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateAuthenticatedEmail(
  payload: UpdateEmailPayload
) {
  const { data, error } =
    await supabase.auth.updateUser({
      email: payload.email,
    });

  if (error) {
    throw new Error(error.message);
  }

  if (data.user) {
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert(
        {
          id: data.user.id,
          email: data.user.email ?? payload.email,
        },
        {
          onConflict: "id",
        }
      );

    const isMissingEmailColumn =
      profileError?.message
        .toLowerCase()
        .includes("email") &&
      profileError.message
        .toLowerCase()
        .includes("column");

    if (profileError && !isMissingEmailColumn) {
      throw new Error(profileError.message);
    }
  }
}

export async function signOutUser() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
}
