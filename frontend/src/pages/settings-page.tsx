export function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Account Settings
        </h1>

        <p className="text-muted-foreground mt-2">
          Manage your profile, security, and CRM preferences.
        </p>
      </div>

      <div className="border rounded-lg p-6 space-y-4 max-w-2xl">
        <div>
          <h2 className="font-semibold text-lg">
            User Information
          </h2>
        </div>

        <div className="space-y-2">
          <p>
            <span className="font-medium">Role:</span>{" "}
            Administrator
          </p>

          <p>
            <span className="font-medium">Access Level:</span>{" "}
            Full CRM Access
          </p>

          <p>
            <span className="font-medium">Status:</span>{" "}
            Active
          </p>
        </div>
      </div>

      <div className="border rounded-lg p-6 max-w-2xl">
        <h2 className="font-semibold text-lg mb-2">
          Coming Soon
        </h2>

        <p className="text-muted-foreground">
          Advanced profile management, organization
          settings, notification preferences, and
          account security controls will be available
          in future updates.
        </p>
      </div>
    </div>
  );
}