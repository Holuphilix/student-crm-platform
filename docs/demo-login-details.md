# Demo Login Details

Use these reviewer/demo accounts after seeding them into Supabase.

Default password for every demo account:

```txt
StudentCRM@2026
```

| Role | Full name | Email |
| --- | --- | --- |
| Administrator / Manager | Philip CRM Admin | `admin@studentcrm.test` |
| Sales Representative | Sam Sales Representative | `sales@studentcrm.test` |
| Client | Jordan CRM User | `user@studentcrm.test` |

For this assessment, `admin` is the canonical manager role. No separate manager demo account is required.

## Create Demo Users

From the repository root:

```bash
npm --prefix worker run seed:demo-users
```

Verify that every demo user can sign in and read the matching profile row:

```bash
npm --prefix worker run verify:demo-users
```

The script reads Supabase backend credentials from either environment variables or `worker/.dev.vars`:

```env
SUPABASE_URL=your_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

To override the shared demo password:

```bash
DEMO_USER_PASSWORD='YourStrongPassword@2026' npm --prefix worker run seed:demo-users
```

The seed script creates or updates:

- Supabase Auth users
- Auth user metadata: `full_name`, `role`
- `public.profiles` rows: `id`, `full_name`, `email`, `role`
