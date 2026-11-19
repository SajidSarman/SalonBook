export default async function SalonDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <main className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-6xl flex-col gap-2 px-6 py-16">
      <h1 className="font-heading text-3xl font-semibold">Salon Details</h1>
      <p className="text-muted-foreground">
        Placeholder page for salon <span className="font-mono">{id}</span>.
      </p>
    </main>
  )
}
