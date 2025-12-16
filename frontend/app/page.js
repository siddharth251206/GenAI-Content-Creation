"use client";

import { useState } from "react";
import InputForm from "../components/InputForm";
import LoadingSection from "../components/LoadingSection";
import ResultSection from "../components/ResultSection";

export default function Home() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async (formInput) => {
    setLoading(true);
    setData(null);
    setError(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formInput),
      });

      if (!response.ok) {
        throw new Error(`Server error ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError("Backend is unreachable. Is FastAPI running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white font-sans">
      
      {/* Top Bar */}
      <header className="border-b border-neutral-800 bg-neutral-900/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold tracking-wide">
            GenAI Studio
          </h1>
          <span className="text-xs text-neutral-400">
            AI-assisted content creation
          </span>
        </div>
      </header>

      {/* Main Editor Area */}
      <section className="max-w-7xl mx-auto px-6 py-10">

        {/* Prompt Panel */}
        <div className="max-w-2xl mb-12">
          <InputForm onGenerate={handleGenerate} />
        </div>

        {/* System State */}
        {loading && (
          <div className="mb-10">
            <LoadingSection />
            <p className="mt-4 text-sm text-neutral-500">
              Generating content — this may take a moment…
            </p>
          </div>
        )}

        {error && (
          <div className="mb-10 p-4 border border-red-800 bg-red-900/20 text-red-300 rounded">
            {error}
          </div>
        )}

        {/* Output Canvas */}
        {data && (
          <div className="mt-8">
            <ResultSection data={data} />
          </div>
        )}

      </section>
    </main>
  );
}
