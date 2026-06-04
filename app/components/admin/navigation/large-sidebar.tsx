import { navItems } from "@/lib/constants/admin";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LargeSidebar({
  pathname,
  setIsProfileMenuOpen,
}: {
  pathname: string;
  setIsProfileMenuOpen: (isOpen: boolean) => void;
}) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createBrowserSupabaseClient();

    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="hidden w-[260px] shrink-0 border-r border-slate-200/80 bg-white/90 lg:flex lg:flex-col">
      <div className="border-b border-slate-200/80 px-6 py-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Noolor Admin
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5">
        <nav>
          <ul className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <li key={item.label}>
                  <Link
                    href={item.label === "Logout" ? "#" : item.href}
                    onClick={(e) => {
                      if (item.label === "Logout") {
                        e.preventDefault();
                        void handleLogout();
                        return;
                      }

                      setIsProfileMenuOpen(false);
                    }}
                    className={`flex items-center justify-between rounded-2xl px-3 py-3 transition-all ${
                      isActive
                        ? "bg-slate-950 text-white shadow-lg shadow-slate-950/10"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={
                          isActive ? "text-amber-300" : "text-slate-400"
                        }
                      >
                        {item.icon}
                      </span>
                      <span className="text-sm font-medium">{item.label}</span>
                    </span>
                    {item.badge ? (
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          isActive
                            ? "bg-white/15 text-white"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
