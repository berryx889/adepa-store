export default function ProductLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 w-full pt-24 pb-20">
      <div className="skeleton h-4 w-48 rounded" />
      <div className="mt-6 grid gap-8 lg:gap-14 lg:grid-cols-2">
        <div>
          <div className="skeleton aspect-square rounded-xl" />
          <div className="mt-3 flex gap-3">
            <div className="skeleton size-20 rounded-lg" />
            <div className="skeleton size-20 rounded-lg" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="skeleton h-3 w-20 rounded" />
          <div className="skeleton h-12 w-4/5 rounded-lg" />
          <div className="skeleton h-7 w-32 rounded" />
          <div className="space-y-2 pt-4">
            <div className="skeleton h-4 w-full rounded" />
            <div className="skeleton h-4 w-full rounded" />
            <div className="skeleton h-4 w-2/3 rounded" />
          </div>
          <div className="skeleton h-12 w-64 rounded-lg mt-6" />
        </div>
      </div>
    </div>
  );
}
