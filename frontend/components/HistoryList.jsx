"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Calendar, FileText, Trash2, Eye, X } from "lucide-react";

export default function HistoryList() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    if (user) fetchHistory();
  }, [user]);

  const fetchHistory = async () => {
    try {
      const token = await user.getIdToken();
      const response = await fetch("http://127.0.0.1:8000/api/history", {
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
    e.stopPropagation(); // Prevent opening the modal when clicking delete
    if (!confirm("Are you sure you want to delete this generation?")) return;

    // Optimistic UI Update (Remove immediately)
    setHistory((prev) => prev.filter((item) => item.id !== id));

    try {
      const token = await user.getIdToken();
      await fetch(`http://127.0.0.1:8000/api/history/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Failed to delete", error);
      fetchHistory(); // Revert if failed
    }
  };

  if (loading) return (
    <div className="flex flex-col gap-4">
      {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-100 rounded-xl animate-pulse" />)}
    </div>
  );

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {history.length === 0 ? (
          <p className="text-slate-500 col-span-2 text-center py-10">No history found.</p>
        ) : (
          history.map((item) => (
            <div 
              key={item.id} 
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative cursor-pointer"
              onClick={() => setSelectedItem(item)}
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-3 pr-8">
                <h3 className="font-semibold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                  {item.topic}
                </h3>
              </div>

              {/* Metadata */}
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                 <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded">
                   <Calendar size={12} /> {new Date(item.created_at).toLocaleDateString()}
                 </span>
                 <span className="flex items-center gap-1 bg-indigo-50 text-indigo-600 px-2 py-1 rounded font-medium uppercase">
                   <FileText size={12} /> {item.content_type}
                 </span>
              </div>

              {/* Preview Text */}
              <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                {item.answer}
              </p>

              {/* Actions (Absolute positioned) */}
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => { e.stopPropagation(); setSelectedItem(item); }}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition"
                  title="View"
                >
                  <Eye size={18} />
                </button>
                <button 
                  onClick={(e) => handleDelete(item.id, e)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* --- VIEW MODAL --- */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedItem.topic}</h3>
                <p className="text-xs text-slate-500">{new Date(selectedItem.created_at).toLocaleString()}</p>
              </div>
              <button 
                onClick={() => setSelectedItem(null)}
                className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-200 rounded-full transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content (Scrollable) */}
            <div className="p-6 overflow-y-auto whitespace-pre-wrap text-slate-700 leading-relaxed font-sans">
              {selectedItem.answer}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button 
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition"
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