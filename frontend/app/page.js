"use client";

import { useState } from "react";
import LoginButton from "@/components/LoginButton"; // Use this, not Auth.jsx
import InputForm from "@/components/InputForm";
import ResultSection from "@/components/ResultSection";
import LoadingSection from "@/components/LoadingSection";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user } = useAuth();
  
  // State to manage the flow
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState(null);

  const handleGenerate = async (formData) => {
    setLoading(true);
    setResultData(null); // Reset previous results

    try {
      // Call your Backend API here
      const response = await fetch("http://127.0.0.1:8000/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      setResultData(data); // Pass backend response to ResultSection
    } catch (error) {
      console.error("Error generating:", error);
      alert("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white p-8">
      {/* 1. Header & Auth */}
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
          AI Content Gen
        </h1>
        <LoginButton />
      </div>

      {/* 2. Main Content Area */}
      <div className="max-w-5xl mx-auto">
        
        {/* Only show form if user is logged in (Optional) */}
        {user ? (
          <>
            <InputForm onGenerate={handleGenerate} />

            {loading && <LoadingSection />}

            {/* Show ResultSection only when we have data */}
            {resultData && !loading && (
              <ResultSection data={resultData} />
            )}
          </>
        ) : (
          <div className="text-center mt-20 text-neutral-400">
            Please sign in to generate content.
          </div>
        )}
      </div>
    </main>
  );
}