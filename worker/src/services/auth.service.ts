import type { SupabaseClient } from "@supabase/supabase-js";

import { HttpError } from "../lib/http-error";

export type RegisterUserPayload = {
  full_name: string;
  email: string;
  password: string;
};

export type RegisteredProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: "user" | "admin" | "sales" | "manager";
  created_at: string;
};

export type RegisteredUserResponse = {
  user: {
    id: string;
    email: string | null;
  };
  profile: RegisteredProfile;
};

function isAlreadyRegisteredError(message: string) {
  const normalizedMessage = message.toLowerCase();

  return (
    normalizedMessage.includes("already") ||
    normalizedMessage.includes("registered") ||
    normalizedMessage.includes("exists")
  );
}

export async function registerUser(
  supabase: SupabaseClient,
  payload: RegisterUserPayload
): Promise<RegisteredUserResponse> {
  const fullName = payload.full_name.trim();
  const email = payload.email.trim().toLowerCase();

  const { data: authData, error: authError } =
    await supabase.auth.admin.createUser({
      email,
      password: payload.password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
      },
    });

  if (authError) {
    throw new HttpError(
      isAlreadyRegisteredError(authError.message)
        ? 409
        : 400,
      "REGISTRATION_FAILED",
      authError.message
    );
  }

  if (!authData.user) {
    throw new HttpError(
      500,
      "REGISTRATION_FAILED",
      "Supabase did not return a registered user."
    );
  }

  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .upsert(
        {
          id: authData.user.id,
          full_name: fullName,
          email,
          role: "user",
        },
        {
          onConflict: "id",
        }
      )
      .select("id, full_name, email, role, created_at")
      .single<RegisteredProfile>();

  if (profileError || !profile) {
    await supabase.auth.admin.deleteUser(
      authData.user.id
    );

    throw new HttpError(
      500,
      "PROFILE_CREATION_FAILED",
      profileError?.message ??
        "Profile could not be created for the registered user."
    );
  }

  return {
    user: {
      id: authData.user.id,
      email: authData.user.email ?? email,
    },
    profile,
  };
}
