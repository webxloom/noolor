"use client";
import React from "react";
import { Footer } from "./footer";
import { Navbar } from "./navbar";
import { usePathname } from "next/navigation";

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const pathname = usePathname();

  if (pathname.startsWith("/admin-dashboard")) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      <Navbar />
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer />
    </div>
  );
};

export default AppLayout;
