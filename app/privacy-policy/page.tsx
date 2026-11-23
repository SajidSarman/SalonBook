export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-3xl flex-col gap-6 px-6 py-16 sm:px-10 lg:px-12">
      <h1 className="font-heading text-3xl font-semibold">Privacy Policy</h1>
      <p className="text-muted-foreground">
        Last updated: November 23, 2026
      </p>

      <section className="space-y-6 text-sm text-muted-foreground">
        <h2 className="font-heading text-lg font-semibold">1. Information We Collect</h2>
        <p>
          We collect information you provide directly to us, such as your name,
          email address, phone number, and profile image when you create an
          account or update your profile.
        </p>
      </section>

      <section className="space-y-6 text-sm text-muted-foreground">
        <h2 className="font-heading text-lg font-semibold">2. How We Use Your Information</h2>
        <p>
          We use your information to provide and manage your appointments,
          process payments, communicate with you about your bookings, and improve
          our services.
        </p>
      </section>

      <section className="space-y-6 text-sm text-muted-foreground">
        <h2 className="font-heading text-lg font-semibold">3. Sharing Your Information</h2>
        <p>
          We do not sell your personal information. We may share information with
          service providers (for example, payment processing) only as necessary
          to operate the platform.
        </p>
      </section>

      <section className="space-y-6 text-sm text-muted-foreground">
        <h2 className="font-heading text-lg font-semibold">4. Your Rights</h2>
        <p>
          You may access, update, or delete your personal information at any time
          through your profile settings or by contacting us.
        </p>
      </section>

      <section className="space-y-6 text-sm text-muted-foreground">
        <h2 className="font-heading text-lg font-semibold">5. Contact Us</h2>
        <p>
          If you have questions about this Privacy Policy, contact us at :{" "}
          <a href="mailto:contact@salonbook.com" className="text-primary hover:underline">
             contact@salonbook.com
          </a>
          .
        </p>
      </section>
    </main>
  )
}
