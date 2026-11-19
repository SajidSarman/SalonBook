import type { Metadata } from "next"
import Link from "next/link"

import { AuthShell } from "@/components/auth/auth-shell"
import { SignInForm } from "@/components/auth/sign-in-form"

export const metadata: Metadata = {
  title: "Log in | SalonBook",
}

export default function SignInPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to book and host salon spaces."
    >
      <SignInForm />
    </AuthShell>
  )
}
