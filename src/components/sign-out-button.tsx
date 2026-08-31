"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
      className="text-sm border border-cc-background-300 rounded-md px-3 py-1.5 text-cc-foreground-800 hover:bg-cc-background-100"
    >
      Sign out
    </button>
  );
}
