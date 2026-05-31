export const demoPassword =
  process.env.DEMO_USER_PASSWORD ?? "StudentCRM@2026";

export const demoUsers = [
  {
    full_name: "Philip CRM Admin",
    email: "admin@studentcrm.test",
    role: "admin",
  },
  {
    full_name: "Sam Sales Representative",
    email: "sales@studentcrm.test",
    role: "sales",
  },
  {
    full_name: "Jordan CRM User",
    email: "user@studentcrm.test",
    role: "user",
  },
];
