export function CategoryPage({ title, description, count, children }: {
  title: string; description: React.ReactNode; count: number; children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-6xl px-6 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-heading text-gray-950 ">{title}</h1>
        <p className="mt-1 text-sm text-gray-500 font-medium">{description} · {count} компонентов</p>
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}
