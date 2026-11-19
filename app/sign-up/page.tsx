import type { Metadata } from "next"

import { AuthShell } from "@/components/auth/auth-shell"
import { SignUpForm } from "@/components/auth/sign-up-form"

export const metadata: Metadata = {
  title: "Create account | SalonBook",
}

export default function SignUpPage() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="Join SalonBook to book and host salon spaces."
    >
      <SignUpForm />
    </AuthShell>
  )
}
