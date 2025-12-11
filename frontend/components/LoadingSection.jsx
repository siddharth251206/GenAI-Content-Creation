export default function LoadingSection() {
  return (
    <div className="mt-10 max-w-3xl mx-auto p-4 bg-neutral-900 rounded animate-pulse">
      
      <div className="h-6 bg-neutral-700 rounded w-1/3 mb-4"></div>

      {/* Fake paragraphs */}
      <div className="space-y-3">
        <div className="h-4 bg-neutral-700 rounded"></div>
        <div className="h-4 bg-neutral-700 rounded"></div>
        <div className="h-4 bg-neutral-700 rounded w-5/6"></div>
        <div className="h-4 bg-neutral-700 rounded w-4/6"></div>
      </div>

      <div className="h-6 bg-neutral-700 rounded w-1/4 mt-6 mb-2"></div>

      <div className="flex gap-3">
        <div className="h-6 w-20 bg-neutral-700 rounded"></div>
        <div className="h-6 w-20 bg-neutral-700 rounded"></div>
        <div className="h-6 w-20 bg-neutral-700 rounded"></div>
      </div>
    </div>
  );
}
