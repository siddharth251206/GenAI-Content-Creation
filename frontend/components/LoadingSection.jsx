"use client";

const shimmer =
  "bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 bg-[length:200%_100%] animate-[shimmer_2.0s_linear_infinite]";

export default function LoadingSection() {
  return (
    <section className="flex flex-col lg:flex-row gap-6 lg:gap-8 h-auto lg:h-[850px] pb-10 lg:pb-0">

      <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative min-h-[500px]">

        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${shimmer}`} />
            <div className={`h-3 w-16 rounded ${shimmer}`} />
          </div>
          <div className="flex gap-2">
            <div className={`h-8 w-24 rounded-lg ${shimmer}`} />
            <div className={`h-8 w-24 rounded-lg ${shimmer}`} />
          </div>
        </div>

        <div className="p-8 lg:p-14 space-y-8">
          <div className={`h-10 w-3/4 rounded-lg ${shimmer}`} />

          <div className="space-y-3">
            <div className={`h-4 w-full rounded ${shimmer}`} />
            <div className={`h-4 w-11/12 rounded ${shimmer}`} />
            <div className={`h-4 w-full rounded ${shimmer}`} />
          </div>

          <div className={`h-8 w-1/3 rounded-lg mt-8 ${shimmer}`} />

          <div className="space-y-4 pl-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`h-2 w-2 rounded-full ${shimmer}`} />
                <div className={`h-4 w-2/3 rounded ${shimmer}`} />
              </div>
            ))}
          </div>

          <div className="space-y-3 pt-4">
            <div className={`h-4 w-full rounded ${shimmer}`} />
            <div className={`h-4 w-4/5 rounded ${shimmer}`} />
            <div className={`h-4 w-full rounded ${shimmer}`} />
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-64 h-10 rounded-2xl border border-slate-200 overflow-hidden">
          <div className={`w-full h-full ${shimmer}`} />
        </div>
      </div>

      <div className="w-full lg:w-80 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <div className={`h-4 w-4 rounded ${shimmer}`} />
          <div className={`h-4 w-24 rounded ${shimmer}`} />
        </div>

        <div className="p-4 grid grid-cols-2 lg:flex lg:flex-col gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`aspect-video lg:h-32 w-full rounded-xl ${shimmer}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
