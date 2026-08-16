"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        duration: 4200,
        classNames: {
          toast: "font-sans",
        },
      }}
    />
  );
}
