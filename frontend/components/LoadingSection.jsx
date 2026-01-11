export default function LoadingSection() {
  return (
    <div className="mt-8 max-w-4xl mx-auto p-8 bg-white border border-slate-200 rounded-2xl shadow-sm animate-pulse">
      
      {/* Title Skeleton */}
      <div className="h-8 bg-slate-200 rounded-lg w-1/3 mb-8"></div>

      {/* Paragraph Skeletons */}
      <div className="space-y-4 mb-8">
        <div className="h-4 bg-slate-100 rounded w-full"></div>
        <div className="h-4 bg-slate-100 rounded w-full"></div>
        <div className="h-4 bg-slate-100 rounded w-11/12"></div>
        <div className="h-4 bg-slate-100 rounded w-4/5"></div>
      </div>

      {/* Subheader Skeleton */}
      <div className="h-6 bg-slate-200 rounded-lg w-1/4 mb-4"></div>

      {/* List Skeletons */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-slate-300"></div>
          <div className="h-4 bg-slate-100 rounded w-1/2"></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-slate-300"></div>
          <div className="h-4 bg-slate-100 rounded w-2/3"></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-slate-300"></div>
          <div className="h-4 bg-slate-100 rounded w-3/5"></div>
        </div>
      </div>
    </div>
  );
}