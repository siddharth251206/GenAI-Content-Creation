"use client";

import { useState } from "react";
import LoginButton from "@/components/LoginButton"; 
import InputForm from "@/components/InputForm";
import ResultSection from "@/components/ResultSection";
import LoadingSection from "@/components/LoadingSection";
import HistoryList from "@/components/HistoryList"; 
import { useAuth } from "@/context/AuthContext";
import { Sparkles, History, PenTool, LayoutTemplate } from "lucide-react";

export default function Home() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState("generate"); 
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [lastRequest, setLastRequest] = useState(null);

  const handleGenerate = async (formData) => {
    if (!user) {
      alert("Please sign in first.");
      return;
    }

    setLastRequest(formData);
    setLoading(true);
    setResultData(null); 

    try {
      const token = await user.getIdToken();
      const response = await fetch(`${API_URL}/api/generate`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Generation failed");
      }
      
      const data = await response.json();
      setResultData(data); 
    } catch (error) {
      console.error(error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen pb-20 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* --- Header (Widened) --- */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-[90rem] items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-2.5 group cursor-pointer">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 shadow-sm transition-transform duration-300 group-hover:scale-105">
              <Sparkles size={18} className="text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Content<span className="text-indigo-600">Flow</span>
            </h1>
          </div>
          <LoginButton />
        </div>
      </header>

      {/* --- Main Content (Widened) --- */}
      <div className="mx-auto mt-8 max-w-[85rem] px-4 sm:px-6 md:mt-12">
        
        {user && (
          <div className="mb-10 flex justify-center">
            <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
              <button
                onClick={() => setActiveTab("generate")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  activeTab === "generate" 
                    ? "bg-white text-indigo-600 shadow-sm ring-1 ring-black/5" 
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                <PenTool size={16} /> Generator
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  activeTab === "history" 
                    ? "bg-white text-indigo-600 shadow-sm ring-1 ring-black/5" 
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                <History size={16} /> History
              </button>
            </div>
          </div>
        )}

        {user ? (
          <div className="mx-auto max-w-7xl">
            {activeTab === "generate" ? (
              <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out">
                {/* Hero Title */}
                <div className="text-center mb-10">
                  <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl mb-4">
                    Create content with <span className="text-indigo-600">Superpowers</span>
                  </h2>
                  <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                    Generate high-converting blogs, social posts, and emails in seconds using our advanced AI models.
                  </p>
                </div>

                <InputForm onGenerate={handleGenerate} loading={loading} />
                
                {loading && (
                  <div className="mt-12">
                    <LoadingSection />
                  </div>
                )}
                
                {resultData && !loading && (
                  <div className="mt-10">
                    <ResultSection 
                      data={resultData} 
                      onRegenerate={() => handleGenerate(lastRequest)} 
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <HistoryList />
              </div>
            )}
          </div>
        ) : (
          /* Empty State */
          <div className="mt-20 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-700">
            <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-indigo-50 border border-indigo-100">
              <LayoutTemplate className="h-10 w-10 text-indigo-600" />
            </div>
            <h2 className="mb-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Welcome to ContentFlow Studio
            </h2>
            <p className="mb-10 max-w-lg text-lg text-slate-600 leading-relaxed">
              Sign in to unlock the power of AI content creation. Generate blogs, social posts, and emails in seconds.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}