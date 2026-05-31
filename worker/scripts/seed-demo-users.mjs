import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { createClient } from "@supabase/supabase-js";

import { demoPassword, demoUsers } from "./demo-users.mjs";
import { parseEnvFile } from "./env-file.mjs";

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const workerDirectory = resolve(currentDirectory, "..");
const devVarsPath = resolve(workerDirectory, ".dev.vars");
const devVars = parseEnvFile(devVarsPath);

const supabaseUrl =
  process.env.SUPABASE_URL ?? devVars.SUPABASE_URL;
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  devVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Add them to worker/.dev.vars or export them before running this script."
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const deprecatedDemoEmails = [
  "manager@studentcrm.test",
];

async function findAuthUserByEmail(email) {
  const normalizedEmail = email.toLowerCase();
  let page = 1;
  const perPage = 1000;

  while (true) {
    const { data, error } =
      await supabase.auth.admin.listUsers({
        page,
        perPage,
      });

    if (error) {
      throw error;
    }

    const match = data.users.find(
      (user) =>
        user.email?.toLowerCase() === normalizedEmail
    );

    if (match) {
      return match;
    }

    if (data.users.length < perPage) {
      return null;
    }

    page += 1;
  }
}

async function upsertDemoUser(demoUser) {
  const existingUser = await findAuthUserByEmail(
    demoUser.email
  );

  const authPayload = {
    email: demoUser.email,
    password: demoPassword,
    email_confirm: true,
    user_metadata: {
      full_name: demoUser.full_name,
      role: demoUser.role,
    },
  };

  const { data, error } = existingUser
    ? await supabase.auth.admin.updateUserById(
        existingUser.id,
        authPayload
      )
    : await supabase.auth.admin.createUser(authPayload);

  if (error || !data.user) {
    throw new Error(
      error?.message ??
        `Failed to create ${demoUser.email}.`
    );
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .upsert(
      {
        id: data.user.id,
        full_name: demoUser.full_name,
        email: demoUser.email,
        role: demoUser.role,
      },
      {
        onConflict: "id",
      }
    );

  if (profileError) {
    throw new Error(profileError.message);
  }

  return {
    id: data.user.id,
    email: demoUser.email,
    role: demoUser.role,
    action: existingUser ? "updated" : "created",
  };
}

async function removeDeprecatedDemoUsers() {
  for (const email of deprecatedDemoEmails) {
    const existingUser = await findAuthUserByEmail(email);

    if (!existingUser) {
      continue;
    }

    const { error } =
      await supabase.auth.admin.deleteUser(
        existingUser.id
      );

    if (error) {
      throw new Error(error.message);
    }

    console.log(`removed deprecated demo account: ${email}`);
  }
}

console.log("Seeding Student CRM demo users...");

for (const demoUser of demoUsers) {
  const result = await upsertDemoUser(demoUser);

  console.log(
    `${result.action}: ${result.email} (${result.role})`
  );
}

await removeDeprecatedDemoUsers();

console.log("Demo users are ready.");
console.log(`Shared demo password: ${demoPassword}`);
