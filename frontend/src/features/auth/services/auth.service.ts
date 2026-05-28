import { supabase } from "@/lib/supabase/supabase-client";

import type {
  SignInPayload,
  SignUpPayload,
} from "@/features/auth/types/auth.types";

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
) {
  const { error } = await supabase.auth.signUp({
    email: payload.email,
    password: payload.password,
    options: {
      data: {
        full_name: payload.fullName,
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function signOutUser() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
}
