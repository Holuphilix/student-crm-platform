import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { createClient } from "@supabase/supabase-js";

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
  workerDevVars.SUPABASE_URL ??
  frontendEnv.VITE_SUPABASE_URL;

const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  workerDevVars.SUPABASE_SERVICE_ROLE_KEY;

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

const checks = [
  {
    table: "clients",
    select: "id, owner_id, email",
    description: "clients.owner_id",
  },
  {
    table: "conversations",
    select: "id, author_id, assigned_to, status",
    description:
      "conversations.author_id, conversations.assigned_to, conversations.status",
  },
];

let failed = false;

console.log("Verifying Student CRM database schema...");

for (const check of checks) {
  const { error } = await supabase
    .from(check.table)
    .select(check.select)
    .limit(1);

  if (error) {
    failed = true;
    console.error(`FAIL: ${check.description}`);
    console.error(`      ${error.message}`);
  } else {
    console.log(`PASS: ${check.description}`);
  }
}

if (failed) {
  console.error(
    "\nRun docs/supabase/conversation-assignment-local-fix.sql in Supabase SQL Editor, then run this command again."
  );
  process.exit(1);
}

console.log("CRM schema is ready for conversation assignment.");
