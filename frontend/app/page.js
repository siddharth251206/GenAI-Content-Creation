"use client";

import { useState } from "react";
import LoginButton from "@/components/LoginButton"; 
import InputForm from "@/components/InputForm";
import ResultSection from "@/components/ResultSection";
import LoadingSection from "@/components/LoadingSection";
import HistoryList from "@/components/HistoryList"; 
import { useAuth } from "@/context/AuthContext";
import { Sparkles, History, PenTool } from "lucide-react";

export default function Home() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  const { user } = useAuth();
  
  // View State
  const [activeTab, setActiveTab] = useState("generate"); 
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState(null);
  
  // Track last request for "Regenerate" functionality
  const [lastRequest, setLastRequest] = useState(null);

  const handleGenerate = async (formData) => {
    if (!user) {
      alert("Please sign in first.");
      return;
    }

    // Save for regeneration
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
    <main className="min-h-screen bg-slate-50 pb-20">
      {/* --- Header --- */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <Sparkles size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              GenAI<span className="text-indigo-600">Studio</span>
            </h1>
          </div>
          <LoginButton />
        </div>
      </header>

      {/* --- Main Content --- */}
      <div className="max-w-5xl mx-auto px-6 mt-10">
        
        {/* Navigation Tabs */}
        {user && (
          <div className="flex justify-center mb-10">
            <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm flex gap-1">
              <button
                onClick={() => setActiveTab("generate")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "generate" 
                    ? "bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <PenTool size={16} /> Generator
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "history" 
                    ? "bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <History size={16} /> History
              </button>
            </div>
          </div>
        )}

        {/* Content Area */}
        {user ? (
          <>
            {activeTab === "generate" ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">Create Content that Matters</h2>
                  <p className="text-slate-500">AI-powered generation for blogs, social media, and more.</p>
                </div>

                <InputForm onGenerate={handleGenerate} loading={loading} />
                
                {loading && <LoadingSection />}
                
                {/* Result Section with Regenerate capability */}
                {resultData && !loading && (
                  <ResultSection 
                    data={resultData} 
                    onRegenerate={() => handleGenerate(lastRequest)} 
                  />
                )}
              </div>
            ) : (
              <HistoryList />
            )}
          </>
        ) : (
          <div className="text-center mt-32 animate-in zoom-in-95 duration-500">
            <div className="inline-flex justify-center items-center w-16 h-16 bg-indigo-100 rounded-full mb-6">
              <Sparkles className="text-indigo-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome to GenAI Studio</h2>
            <p className="text-slate-500 max-w-md mx-auto mb-8">
              Sign in to unlock the power of AI content creation. Generate blogs, social posts, and emails in seconds.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}