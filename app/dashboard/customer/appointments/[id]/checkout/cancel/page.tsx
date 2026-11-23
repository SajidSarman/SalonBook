import Link from "next/link"
import { XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PaymentToast } from "@/components/ui/payment-toast"
import { requireRole } from "@/lib/auth-guard"

export default async function CheckoutCancelPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireRole("customer")
  const { id } = await params

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center py-12 text-center">
      <PaymentToast
        type="error"
        title="Payment canceled"
        description="Your payment was not completed and you have not been charged."
      />
      <XCircle className="size-14 text-muted-foreground" aria-hidden="true" />
      <h1 className="mt-5 font-heading text-3xl font-semibold">
        Payment canceled
      </h1>
      <p className="mt-2 text-muted-foreground">
        Your payment was not completed and you have not been charged. You can
        try again whenever you&apos;re ready.
      </p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <Button
          render={
            <Link
              href={`/dashboard/customer/appointments/${encodeURIComponent(id)}/checkout`}
            />
          }
          nativeButton={false}
        >
          Try payment again
        </Button>
        <Button
          variant="outline"
          render={
            <Link href="/dashboard/customer#appointment-management-title" />
          }
          nativeButton={false}
        >
          Back to my appointments
        </Button>
      </div>
    </div>
  )
}
