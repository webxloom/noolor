"use client";

import { useToast } from "@/app/hooks/use-toast";
import Toast from "@/app/components/ui/toast";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-2">
      {toasts.map((item) => (
        <Toast
          key={item.id}
          message={String(item.description ?? item.title ?? "")}
          type={item.type}
          onClose={() => dismiss(item.id)}
        />
      ))}
    </div>
  );
}
