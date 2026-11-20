import type { ReactNode } from "react"

const AUTH_IMAGE_URL = "/auth-image.jpg"

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: ReactNode
  children: ReactNode
}) {
  // min-height subtracts the 4rem navbar plus its 1px bottom border so the
  // auth page never adds a scrollbar.
  return (
    <main className="grid min-h-[calc(100svh_-_4rem_-_1px)] md:grid-cols-2">
      <section className="dark flex flex-col justify-center bg-background px-4 py-4 text-foreground sm:px-8">
        <div className="mx-auto w-full max-w-sm">
          <h1 className="text-center font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
            {title}
          </h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            {subtitle}
          </p>
          <div className="mt-4">{children}</div>
        </div>
      </section>

      <aside
        aria-hidden="true"
        className="relative hidden overflow-hidden bg-zinc-900 md:block"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url("${AUTH_IMAGE_URL}")` }}
        />
      </aside>
    </main>
  )
}
