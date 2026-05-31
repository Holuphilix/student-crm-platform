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
  role: "client" | "user" | "admin" | "sales" | "manager";
  created_at: string;
};

export type RegisteredUserResponse = {
  user: {
    id: string;
    email: string | null;
  };
  profile: RegisteredProfile;
};

type RegisteredClient = {
  id: string;
  profile_id?: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  country?: string | null;
  target_country?: string | null;
  created_at: string;
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
        role: "client",
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

  let { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .upsert(
        {
          id: authData.user.id,
          full_name: fullName,
          email,
          role: "client",
        },
        {
          onConflict: "id",
        }
      )
      .select("id, full_name, email, role, created_at")
      .single<RegisteredProfile>();

  if (profileError) {
    const fallbackProfileResponse = await supabase
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

    profile = fallbackProfileResponse.data;
    profileError = fallbackProfileResponse.error;
  }

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

  const clientResponse = await supabase
    .from("clients")
    .upsert(
      {
        profile_id: authData.user.id,
        full_name: fullName,
        email,
        status: "new_lead",
      },
      {
        onConflict: "profile_id",
      }
    )
    .select("id, profile_id, full_name, email, phone, country, target_country, created_at")
    .single<RegisteredClient>();

  let registeredClient = clientResponse.data;
  let clientError = clientResponse.error;

  if (clientError) {
    const existingClientResponse = await supabase
      .from("clients")
      .select("id, full_name, email, phone, created_at")
      .eq("email", email)
      .maybeSingle<RegisteredClient>();

    if (
      existingClientResponse.data &&
      !existingClientResponse.error
    ) {
      registeredClient = existingClientResponse.data;
      clientError = null;
    } else {
      const fallbackClientResponse = await supabase
        .from("clients")
        .insert({
          full_name: fullName,
          email,
          status: "new_lead",
        })
        .select("id, full_name, email, phone, created_at")
        .single<RegisteredClient>();

      registeredClient = fallbackClientResponse.data;
      clientError = fallbackClientResponse.error;
    }
  }

  if (clientError || !registeredClient) {
    await supabase.auth.admin.deleteUser(
      authData.user.id
    );

    throw new HttpError(
      500,
      "CLIENT_RECORD_CREATION_FAILED",
      clientError?.message ??
        "CRM client record could not be created for the registered user."
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
