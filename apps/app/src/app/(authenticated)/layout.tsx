import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { LogoutButton } from "@/components/layout/LogoutButton";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-200">
          <div className="flex h-full items-center justify-between px-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {(session.user as any)?.tenantName || "Dashboard"}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{session.user?.name || session.user?.email}</p>
                <p className="text-xs text-gray-500">{(session.user as any)?.role || "User"}</p>
              </div>
              <LogoutButton />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
