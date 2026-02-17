"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { UploadCloud, FileText, CheckCircle, AlertCircle, X, Brain } from "lucide-react";

export default function KnowledgeUpload() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  const { user } = useAuth();
  
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState(null); 

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !user) return;

    setUploading(true);
    setStatus(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = await user.getIdToken();
      const response = await fetch(`${API_URL}/api/knowledge/upload`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.detail || "Upload failed");

      setStatus({
        type: "success",
        text: `Success! Added ${data.chunks_added} knowledge chunks to your brain.`,
      });
      setFile(null); 
    } catch (error) {
      console.error(error);
      setStatus({
        type: "error",
        text: error.message || "Failed to upload file.",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl mb-4">
          Train your <span className="text-indigo-600">AI Brain</span>
        </h2>
        <p className="text-lg text-slate-600 leading-relaxed">
          Upload PDF or Text files (company guidelines, product manuals, specs). 
          The AI will read these before generating content for you.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 ring-1 ring-slate-900/5 p-6 sm:p-10">
        <div className="flex flex-col items-center justify-center space-y-6">
          
          <div className="h-20 w-20 bg-indigo-50 rounded-full flex items-center justify-center ring-8 ring-indigo-50/50">
            <Brain className="h-10 w-10 text-indigo-600" />
          </div>

          <form onSubmit={handleUpload} className="w-full space-y-6">
            
            <div className="relative group w-full">
              <label 
                htmlFor="file-upload" 
                className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${
                  file 
                    ? "border-indigo-400 bg-indigo-50/30" 
                    : "border-slate-300 hover:border-indigo-400 hover:bg-slate-50"
                }`}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                  {file ? (
                    <>
                      <FileText className="h-10 w-10 text-indigo-600 mb-3" />
                      <p className="text-sm font-semibold text-slate-900">{file.name}</p>
                      <p className="text-xs text-slate-500 mt-1">{(file.size / 1024).toFixed(2)} KB</p>
                      <button 
                        type="button"
                        onClick={(e) => { e.preventDefault(); setFile(null); }}
                        className="mt-4 text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
                      >
                        <X size={12} /> Remove
                      </button>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="h-10 w-10 text-slate-400 mb-3 group-hover:scale-110 transition-transform" />
                      <p className="mb-2 text-sm text-slate-600">
                        <span className="font-bold text-indigo-600">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-slate-500">PDF or TXT up to 10MB</p>
                    </>
                  )}
                </div>
                <input 
                  id="file-upload" 
                  name="file-upload" 
                  type="file" 
                  accept=".pdf,.txt,.md"
                  className="hidden" 
                  onChange={handleFileChange}
                />
              </label>
            </div>

            {status && (
              <div className={`p-4 rounded-lg flex items-start gap-3 text-sm font-medium ${
                status.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}>
                {status.type === 'success' ? <CheckCircle size={18} className="mt-0.5 shrink-0" /> : <AlertCircle size={18} className="mt-0.5 shrink-0" />}
                {status.text}
              </div>
            )}

            <button
              type="submit"
              disabled={!file || uploading}
              className="w-full py-3.5 px-4 flex justify-center items-center gap-2 rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 font-semibold shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {uploading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing Knowledge...
                </>
              ) : (
                "Upload to Brain"
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}