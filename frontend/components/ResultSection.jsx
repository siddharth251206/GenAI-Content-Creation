"use client";

export default function ResultSection({ data }) {
  return (
    <div className="mt-10 max-w-3xl mx-auto p-6 bg-neutral-900 rounded-lg shadow-lg border border-neutral-800">
      
      <h2 className="text-2xl font-semibold mb-3">Generated Blog</h2>
      
      <p className="leading-7 text-neutral-200 whitespace-pre-line">
        {data.blog}
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">SEO Keywords</h2>

      <div className="flex flex-wrap gap-2">
        {data.keywords.map((keyword, index) => (
          <span
            key={index}
            className="bg-green-500 text-black px-3 py-1 rounded-full font-semibold text-sm"
          >
            {keyword}
          </span>
        ))}
      </div>
    </div>
  );
}
