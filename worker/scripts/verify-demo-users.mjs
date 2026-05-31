import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { createClient } from "@supabase/supabase-js";

import { demoPassword, demoUsers } from "./demo-users.mjs";
import { parseEnvFile } from "./env-file.mjs";

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const workerDirectory = resolve(currentDirectory, "..");
const repositoryDirectory = resolve(workerDirectory, "..");
const workerDevVarsPath = resolve(workerDirectory, ".dev.vars");
const frontendEnvPath = resolve(repositoryDirectory, "frontend", ".env");

const workerDevVars = parseEnvFile(workerDevVarsPath);
const frontendEnv = parseEnvFile(frontendEnvPath);

const supabaseUrl =
  process.env.SUPABASE_URL ??
  frontendEnv.VITE_SUPABASE_URL ??
  workerDevVars.SUPABASE_URL;

const publishableKey =
  process.env.SUPABASE_PUBLISHABLE_KEY ??
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  process.env.VITE_SUPABASE_ANON_KEY ??
  frontendEnv.VITE_SUPABASE_PUBLISHABLE_KEY ??
  frontendEnv.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !publishableKey) {
  console.error(
    "Missing SUPABASE_URL and publishable key. Add VITE_SUPABASE_URL plus VITE_SUPABASE_PUBLISHABLE_KEY to frontend/.env, or export them before running this script."
  );
  process.exit(1);
}

async function verifyDemoUser(demoUser) {
  const supabase = createClient(supabaseUrl, publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data: signInData, error: signInError } =
    await supabase.auth.signInWithPassword({
      email: demoUser.email,
      password: demoPassword,
    });

  if (signInError || !signInData.user) {
    throw new Error(
      signInError?.message ??
        `Could not sign in as ${demoUser.email}.`
    );
  }

  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("id, full_name, email, role")
      .eq("id", signInData.user.id)
      .maybeSingle();

  if (profileError) {
    throw new Error(profileError.message);
  }

  if (!profile) {
    throw new Error(
      `Signed in as ${demoUser.email}, but no profile row was found.`
    );
  }

  const mismatches = [
    ["full_name", demoUser.full_name, profile.full_name],
    ["email", demoUser.email, profile.email],
    ["role", demoUser.role, profile.role],
  ].filter(([, expected, actual]) => expected !== actual);

  if (mismatches.length > 0) {
    throw new Error(
      `${demoUser.email} profile mismatch: ${mismatches
        .map(
          ([field, expected, actual]) =>
            `${field} expected ${expected}, got ${actual}`
        )
        .join("; ")}`
    );
  }

  await supabase.auth.signOut();

  return {
    email: demoUser.email,
    role: demoUser.role,
  };
}

console.log("Verifying Student CRM demo user logins...");

for (const demoUser of demoUsers) {
  const result = await verifyDemoUser(demoUser);

  console.log(`verified: ${result.email} (${result.role})`);
}

console.log("All demo user logins verified successfully.");
