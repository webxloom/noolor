"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";
import Toast from "../components/ui/toast";

interface ToastContextType {
  addToast: (
    message: string,
    type: "success" | "error" | "info" | "warning",
  ) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<
    {
      id: number;
      message: string;
      type: "success" | "error" | "info" | "warning";
    }[]
  >([]);
  const [nextId, setNextId] = useState(1);

  const addToast = (
    message: string,
    type: "success" | "error" | "info" | "warning",
  ) => {
    setToasts((prevToasts) => [...prevToasts, { id: nextId, message, type }]);
    setNextId(nextId + 1);
  };

  const removeToast = (id: number) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
