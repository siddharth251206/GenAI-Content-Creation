"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Calendar, FileText, Trash2, Eye, X, ArrowRight, Copy, Check } from "lucide-react";

const formatMarkdown = (text) => {
  if (!text) return "";
  
  let html = text
    .replace(/```html/g, '').replace(/```/g, '')
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-slate-800 mt-6 mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-slate-900 mt-8 mb-3">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-slate-900 mt-8 mb-4">$1</h1>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold text-slate-900">$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em class="italic">$1</em>')
    .replace(/^\- (.*$)/gim, '<li class="ml-4 list-disc marker:text-slate-400 pl-1">$1</li>')
    .replace(/(<li.*<\/li>)/gim, '<ul class="my-4 space-y-1">$1</ul>')
    .replace(/<\/ul>\s*<ul>/gim, '')
    .replace(/\n/gim, '<br />');

  return html;
};

export default function HistoryList() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    if (user) fetchHistory();
  }, [user]);

  const fetchHistory = async () => {
    try {
      const token = await user.getIdToken();
      const response = await fetch(`${API_URL}/api/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (error) {
      console.error("Failed to load history", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation(); 
    if (!confirm("Are you sure you want to delete this?")) return;

    setHistory((prev) => prev.filter((item) => item.id !== id));

    try {
      const token = await user.getIdToken();
      await fetch(`${API_URL}/api/history/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Failed to delete", error);
      fetchHistory(); 
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-white rounded-2xl border border-slate-100 shadow-sm animate-pulse" />)}
    </div>
  );

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {history.length === 0 ? (
          <div className="col-span-2 flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
            <div className="p-4 bg-slate-50 rounded-full mb-4">
              <FileText className="text-slate-400" size={32} />
            </div>
            <p className="text-slate-500 font-medium">No history found yet.</p>
          </div>
        ) : (
          history.map((item) => (
            <div 
              key={item.id} 
              className="group relative flex flex-col justify-between bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 hover:border-indigo-100 cursor-pointer"
              onClick={() => setSelectedItem(item)}
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wide border border-indigo-100">
                      <FileText size={10} /> {item.content_type}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                    <Calendar size={11} />
                    {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 line-clamp-2 mb-3 group-hover:text-indigo-600 transition-colors">
                  {item.topic}
                </h3>

                <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed mb-4">
                  {item.answer}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-auto">
                 <button className="text-xs font-semibold text-indigo-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    View Result <ArrowRight size={12} />
                 </button>
                 
                 <button 
                  onClick={(e) => handleDelete(item.id, e)}
                  className="p-2 -mr-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col ring-1 ring-white/20">
            
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-900">{selectedItem.topic}</h3>
                <div className="flex gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(selectedItem.created_at).toLocaleString()}</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-medium capitalize">{selectedItem.content_type}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedItem(null)}
                className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition"
              >
                <X size={24} />
              </button>
            </div>

            <div 
              className="p-8 overflow-y-auto text-slate-700 leading-7 font-sans text-base"
              dangerouslySetInnerHTML={{ __html: formatMarkdown(selectedItem.answer) }}
            />

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => handleCopy(selectedItem.answer)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition shadow-sm"
              >
                {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
                {copied ? "Copied" : "Copy Content"}
              </button>
              <button 
                onClick={() => setSelectedItem(null)}
                className="px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}