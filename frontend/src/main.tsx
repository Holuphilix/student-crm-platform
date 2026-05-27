import React from "react";

import ReactDOM from "react-dom/client";

import { RouterProvider } from "react-router-dom";

import { Toaster } from "sonner";

import "./index.css";

import { QueryProvider } from "@/app/providers/query-provider";

import { router } from "@/app/router/router";

import { AuthProvider } from "@/features/auth/providers/auth-provider";

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <React.StrictMode>
    <QueryProvider>
      <AuthProvider>
        <RouterProvider router={router} />

        <Toaster richColors />
      </AuthProvider>
    </QueryProvider>
  </React.StrictMode>
);