"use client";
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";

import { navItems } from "@/lib/constants/admin";
import LargeSidebar from "./navigation/large-sidebar";
import TopHeader from "./navigation/top-header";

type AdminShellProps = {
  children: React.ReactNode;
};

export default function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const activeSection = useMemo(() => {
    const match = navItems.find((item) => pathname === item.href);

    return match?.label ?? "Admin";
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#f5f1e8_100%)] text-slate-900">
      <div className="flex min-h-screen">
        <>
          <LargeSidebar
            pathname={pathname}
            setIsProfileMenuOpen={setIsProfileMenuOpen}
          />

          {/* {isMobileNavOpen ? (
            <button
              type="button"
              aria-label="Close navigation"
              className="fixed inset-0 z-40 bg-slate-950/35 lg:hidden"
              onClick={() => setIsMobileNavOpen(false)}
            />
          ) : null}

          <MobileNav
            pathname={pathname}
            setIsProfileMenuOpen={setIsProfileMenuOpen}
            isMobileNavOpen={isMobileNavOpen}
            setIsMobileNavOpen={setIsMobileNavOpen}
          /> */}
        </>

        <div className="flex min-w-0 flex-1 flex-col">
          <TopHeader
            activeSection={activeSection}
            setIsMobileNavOpen={setIsMobileNavOpen}
            setIsProfileMenuOpen={setIsProfileMenuOpen}
            isProfileMenuOpen={isProfileMenuOpen}
          />

          <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
