"use client";

import { NeonAuthUIProvider } from "@neondatabase/auth/react/ui";

import { authClient } from "@/lib/neon-auth-client";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <NeonAuthUIProvider authClient={authClient} redirectTo="/dashboard">
      {children}
    </NeonAuthUIProvider>
  );
}
