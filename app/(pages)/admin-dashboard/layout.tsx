import AdminShell from "@/app/components/admin/admin-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  //   const cookieStore = await cookies();
  //   const supabase = createClient(cookieStore);
  //   const {
  //     data: { session },
  //   } = await supabase.auth.getSession();

  //   if (!session) {
  //     return <AdminLogin />;
  //   }

  return <AdminShell>{children}</AdminShell>;
}
