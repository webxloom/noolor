import React, { useEffect, useMemo, useState } from "react";
import styles from "./style.module.css";

interface ToastProps {
  message: string;
  type: "success" | "error" | "info" | "warning";
  onClose: () => void;
}

const ToastContainer = ({
  type,
  slideOut,
  children,
}: {
  type: "success" | "error" | "info" | "warning";
  slideOut: boolean;
  children: React.ReactNode;
}) => {
  const bgColor = useMemo(() => {
    switch (type) {
      case "success":
        return "bg-green-400";
      case "error":
        return "bg-red-500";
      case "info":
        return "bg-cyan-500";
      case "warning":
        return "bg-yellow-400";
      default:
        return "bg-emerald-50";
    }
  }, [type]);
  return (
    <div
      className={`${styles.toastContainer} ${bgColor} ${
        slideOut ? styles.slideOut : styles.slideIn
      }`}
    >
      {children}
    </div>
  );
};

export default function Toast({ message, type, onClose }: ToastProps) {
  const [slideOut, setSlideOut] = useState(false);

  useEffect(() => {
    if (type === "warning") return;

    const timer = setTimeout(() => {
      setSlideOut(true);
      setTimeout(onClose, 500);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <ToastContainer type={type} slideOut={slideOut}>
      {type === "warning" ? (
        <div className="flex items-start gap-3 p-2">
          <div className="flex-1">
            <h4 className="font-semibold text-slate-900">Warning</h4>
            <p className="text-sm text-black">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-2 text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>
      ) : (
        <div>{message}</div>
      )}
    </ToastContainer>
  );
}
