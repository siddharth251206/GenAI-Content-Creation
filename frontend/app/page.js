"use client";

import { useState } from "react";
import InputForm from "../components/InputForm";
import LoadingSection from "../components/LoadingSection";
import ResultSection from "../components/ResultSection";

export default function Home() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // New state for error handling

  const handleGenerate = async (formInput) => {
    console.log("Sending to Backend:", formInput);
    
    // Reset states
    setLoading(true);
    setData(null);
    setError(null);

    try {
      // 1. Call the API
      const response = await fetch("http://127.0.0.1:8000/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formInput),
      });

      // 2. Check for errors
      if (!response.ok) {
        throw new Error(`Server Error: ${response.status}`);
      }

      // 3. Get Data
      const result = await response.json();
      console.log("Backend Response:", result);
      
      // 4. Update UI
      setData(result); // result is { answer: "..." }

    } catch (err) {
      console.error("Failed to generate:", err);
      setError("Failed to connect to the brain 🧠. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 md:p-20 text-white bg-neutral-950 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent mb-4">
            GenAI Content Platform
          </h1>
          <p className="text-neutral-400 text-lg">
            Powered by LangChain, Pinecone & Google Gemini
          </p>
        </div>

        {/* Input Form */}
        <InputForm onGenerate={handleGenerate} />

        {/* Loading State */}
        {loading && (
          <div className="mt-10">
            <LoadingSection />
            <p className="text-center text-neutral-500 mt-4 animate-pulse">
              Consulting the knowledge base...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mt-10 p-4 bg-red-900/30 border border-red-800 rounded text-red-200 text-center">
            {error}
          </div>
        )}

        {/* Result State */}
        {data && <ResultSection data={data} />}
        
      </div>
    </main>
  );
}