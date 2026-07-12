export default function AdminLoading() {
  return (
    <div>
      <div className="skeleton h-10 w-56 rounded-lg" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-20 rounded-xl" />
        ))}
      </div>
      <div className="skeleton mt-6 h-64 rounded-xl" />
    </div>
  );
}
