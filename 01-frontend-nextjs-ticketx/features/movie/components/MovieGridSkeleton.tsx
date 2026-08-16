export function MovieGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {Array.from({ length: 10 }).map((_, index) => (
        <div key={index} className="flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <div className="aspect-[2/3] w-full animate-pulse bg-zinc-100" />
          <div className="flex flex-col gap-2 p-3">
            <div className="h-4 w-4/5 animate-pulse rounded bg-zinc-100" />
            <div className="h-3 w-2/5 animate-pulse rounded bg-zinc-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
