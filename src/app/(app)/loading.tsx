export default function AppLoading() {
  return (
    <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="h-32 animate-pulse rounded-lg border border-slate-200 bg-white"
        />
      ))}
    </div>
  );
}
