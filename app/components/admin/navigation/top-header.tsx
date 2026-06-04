import { useMemo } from "react";

const quickLinks = ["Add parish", "Review request", "Download report"];

export default function TopHeader({
  activeSection,
  setIsMobileNavOpen,
  setIsProfileMenuOpen,
  isProfileMenuOpen,
}: {
  activeSection: string;
  setIsMobileNavOpen: (isOpen: boolean) => void;
  setIsProfileMenuOpen: (isOpen: boolean) => void;
  isProfileMenuOpen: boolean;
}) {
  const adminName = "John Doe";
  const adminRole = "Administrator";
  const adminEmail = "john.doe@example.com";
  const adminInitials = useMemo(() => {
    const names = adminName.split(" ");
    return names
      .map((name) => name[0])
      .join("")
      .toUpperCase();
  }, [adminName]);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
      <div className="flex flex-col gap-4 px-4 py-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(true)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Open navigation"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 7h16M4 12h16M4 17h16"
                />
              </svg>
            </button>

            <div>
              <h2 className="text-xl font-semibold text-slate-950 sm:text-2xl">
                {activeSection}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-100"
              aria-label="Notifications"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.17V11a6 6 0 1 0-12 0v3.17c0 .53-.21 1.04-.59 1.43L4 17h5m6 0a3 3 0 1 1-6 0m6 0H9"
                />
              </svg>
              <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-amber-500" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
