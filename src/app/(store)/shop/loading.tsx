export default function ShopLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 w-full pt-24 pb-20">
      <div className="skeleton h-12 w-40 rounded-lg" />
      <div className="skeleton mt-3 h-4 w-24 rounded" />
      <div className="mt-6 flex gap-3">
        <div className="skeleton h-11 w-full max-w-sm rounded-lg" />
        <div className="skeleton h-11 w-44 rounded-lg hidden sm:block" />
      </div>
      <div className="mt-4 flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-9 w-24 rounded-full" />
        ))}
      </div>
      <div className="mt-8 grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl overflow-hidden bg-white shadow-md">
            <div className="skeleton aspect-square" />
            <div className="p-4 space-y-2">
              <div className="skeleton h-3 w-16 rounded" />
              <div className="skeleton h-5 w-3/4 rounded" />
              <div className="skeleton h-4 w-20 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
