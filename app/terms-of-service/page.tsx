export default function TermsOfServicePage() {
  return (
    <main className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-3xl flex-col gap-6 px-6 py-16 sm:px-10 lg:px-12">
      <h1 className="font-heading text-3xl font-semibold">Terms of Service</h1>
      <p className="text-muted-foreground">
        Last updated: November 23, 2026
      </p>

      <section className="space-y-6 text-sm text-muted-foreground">
        <h2 className="font-heading text-lg font-semibold">1. Acceptance of Terms</h2>
        <p>
          By accessing or using SalonBook, you agree to be bound by these Terms
          of Service. If you do not agree, you may not use the platform.
        </p>
      </section>

      <section className="space-y-6 text-sm text-muted-foreground">
        <h2 className="font-heading text-lg font-semibold">2. Use of the Platform</h2>
        <p>
          You must be at least 13 years old to use SalonBook. You are
          responsible for maintaining the confidentiality of your account and
          for all activities that occur under your account.
        </p>
      </section>

      <section className="space-y-6 text-sm text-muted-foreground">
        <h2 className="font-heading text-lg font-semibold">3. Appointments</h2>
        <p>
          Appointment requests are subject to confirmation by the salon. We do
          not guarantee availability of any service or time slot.
        </p>
      </section>

      <section className="space-y-6 text-sm text-muted-foreground">
        <h2 className="font-heading text-lg font-semibold">4. Payments</h2>
        <p>
          Payments are processed through Stripe. You are responsible for
          providing accurate payment information. All transactions are subject to
          Stripe's terms.
        </p>
      </section>

      <section className="space-y-6 text-sm text-muted-foreground">
        <h2 className="font-heading text-lg font-semibold">5. Termination</h2>
        <p>
          We may suspend or terminate your account at any time, without notice,
          for conduct that we believe violates these Terms.
        </p>
      </section>

      <section className="space-y-6 text-sm text-muted-foreground">
        <h2 className="font-heading text-lg font-semibold">6. Contact Us</h2>
        <p>
          If you have questions about these Terms, contact us at :{" "}
          <a href="mailto:contact@salonbook.com" className="text-primary hover:underline">
            contact@salonbook.com
          </a>
          .
        </p>
      </section>
    </main>
  )
}
