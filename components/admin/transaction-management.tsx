"use client"

import * as React from "react"
import { ReceiptText } from "lucide-react"

import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

type TransactionRecord = {
  id: string
  appointmentId: string | null
  customerId: string | null
  customerName: string | null
  customerEmail: string | null
  amount: number
  currency: string
  stripeSessionId: string
  status: "paid" | "failed"
  createdAt: string | null
}

function parseTransactions(value: unknown): TransactionRecord[] {
  if (!Array.isArray(value)) {
    throw new Error("The transactions API returned an invalid response.")
  }

  return value.map((item) => {
    if (typeof item !== "object" || item === null) {
      throw new Error("The transactions API returned an invalid transaction.")
    }

    const transaction = item as Record<string, unknown>
    const id =
      typeof transaction._id === "string"
        ? transaction._id
        : typeof transaction.id === "string"
          ? transaction.id
          : null

    if (
      !id ||
      typeof transaction.amount !== "number" ||
      !Number.isFinite(transaction.amount) ||
      typeof transaction.currency !== "string" ||
      typeof transaction.stripeSessionId !== "string" ||
      (transaction.status !== "paid" && transaction.status !== "failed") ||
      (transaction.appointmentId !== undefined &&
        transaction.appointmentId !== null &&
        typeof transaction.appointmentId !== "string") ||
      (transaction.customerId !== undefined &&
        transaction.customerId !== null &&
        typeof transaction.customerId !== "string") ||
      (transaction.customerName !== undefined &&
        transaction.customerName !== null &&
        typeof transaction.customerName !== "string") ||
      (transaction.customerEmail !== undefined &&
        transaction.customerEmail !== null &&
        typeof transaction.customerEmail !== "string") ||
      (transaction.createdAt !== undefined &&
        typeof transaction.createdAt !== "string")
    ) {
      throw new Error(
        "The transactions API returned invalid transaction fields."
      )
    }

    return {
      id,
      appointmentId:
        typeof transaction.appointmentId === "string"
          ? transaction.appointmentId
          : null,
      customerId:
        typeof transaction.customerId === "string"
          ? transaction.customerId
          : null,
      customerName:
        typeof transaction.customerName === "string"
          ? transaction.customerName
          : null,
      customerEmail:
        typeof transaction.customerEmail === "string"
          ? transaction.customerEmail
          : null,
      amount: transaction.amount,
      currency: transaction.currency,
      stripeSessionId: transaction.stripeSessionId,
      status: transaction.status,
      createdAt:
        typeof transaction.createdAt === "string"
          ? transaction.createdAt
          : null,
    }
  })
}

function formatAmount(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${amount.toLocaleString()} ${currency}`
  }
}

function formatDate(value: string | null) {
  if (!value) return "—"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString()
}

function shorten(value: string | null, length = 10) {
  if (!value) return "—"
  return value.length > length ? `${value.slice(0, length)}…` : value
}

export function TransactionManagement() {
  const { error: showError } = useToast()
  const [transactions, setTransactions] = React.useState<TransactionRecord[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let active = true

    async function loadTransactions() {
      try {
        const response = await fetch("/api/admin/transactions", {
          cache: "no-store",
        })
        const result: unknown = await response.json()

        if (!response.ok) {
          const message =
            typeof result === "object" &&
            result !== null &&
            "message" in result &&
            typeof result.message === "string"
              ? result.message
              : "Could not load transactions."
          throw new Error(message)
        }

        const data = parseTransactions(result)
        if (active) {
          setTransactions(data)
        }
      } catch (requestError) {
        if (active) {
          showError(
            "Could not load transactions",
            requestError instanceof Error
              ? requestError.message
              : "Could not load transactions."
          )
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadTransactions()
    return () => {
      active = false
    }
  }, [showError])

  const paidCount = transactions.filter(
    (transaction) => transaction.status === "paid"
  ).length

  return (
    <section id="transactions-title" className="mt-12 scroll-mt-24">
      <div className="mb-5 flex items-center gap-3">
        <ReceiptText className="size-5" />
        <h2 className="font-heading text-2xl font-semibold">Transactions</h2>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading transactions…</p>
      ) : transactions.length === 0 ? (
        <p className="rounded-2xl border border-dashed p-8 text-sm text-muted-foreground">
          No transactions yet. Completed payments will appear here.
        </p>
      ) : (
        <>
          <p className="mb-3 text-sm text-muted-foreground">
            {transactions.length} transaction
            {transactions.length === 1 ? "" : "s"} · {paidCount} paid
          </p>
          <div className="overflow-x-auto rounded-2xl border">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-muted/50 text-xs tracking-wide text-muted-foreground uppercase">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Appointment</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Stripe session</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-t">
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                      {formatDate(transaction.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="font-mono text-xs"
                        title={transaction.appointmentId ?? undefined}
                      >
                        {shorten(transaction.appointmentId)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {transaction.customerName || transaction.customerEmail ? (
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {transaction.customerName || "—"}
                          </span>
                          {transaction.customerEmail && (
                            <span className="text-xs text-muted-foreground">
                              {transaction.customerEmail}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span
                          className="font-mono text-xs"
                          title={transaction.customerId ?? undefined}
                        >
                          {shorten(transaction.customerId)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium whitespace-nowrap">
                      {formatAmount(transaction.amount, transaction.currency)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                          transaction.status === "paid"
                            ? "bg-emerald-600/10 text-emerald-700"
                            : "bg-destructive/10 text-destructive"
                        )}
                      >
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="font-mono text-xs"
                        title={transaction.stripeSessionId}
                      >
                        {shorten(transaction.stripeSessionId, 16)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  )
}
