"use client";
import type { LucideIcon } from "lucide-react";

type Props = {
  title: string;
  value: number | string;
  icon?: LucideIcon;
  color?: string;
  subtitle?: string;
};

export default function UserSummaryCard({
  title,
  value,
  icon: Icon,
  color = "bg-gray-100 text-gray-700",
  subtitle,
}: Props) {
  return (
    <div className="rounded-lg border p-4 bg-white dark:bg-gray-800 shadow-sm">
      <div className="flex items-center justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full ${color}`}
        >
          {Icon ? <Icon className="h-5 w-5" /> : null}
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-300">
            {title}
          </div>
        </div>
      </div>
      {subtitle ? (
        <div className="mt-3 text-xs text-gray-400">{subtitle}</div>
      ) : null}
    </div>
  );
}
