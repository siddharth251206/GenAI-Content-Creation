"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  Calendar, 
  FileText, 
  Trash2, 
  X, 
  ArrowRight, 
  Copy, 
  Check,
  Download,
  Printer,
  FileCode,
  ChevronDown,
  Info // Added Info icon for the note
} from "lucide-react";

// --- SHARED STYLES FOR EXPORTS ---
const exportStyles = `
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #334155; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
  h1 { font-size: 2.25em; font-weight: 800; letter-spacing: -0.03em; margin-bottom: 0.3em; margin-top: 0; color: #0f172a; line-height: 1.1; }
  h2 { font-size: 1.5em; font-weight: 700; margin-top: 1.5em; margin-bottom: 0.4em; color: #1e293b; letter-spacing: -0.02em; }
  h3 { font-size: 1.25em; font-weight: 600; margin-top: 1.25em; margin-bottom: 0.25em; color: #4338ca; }
  h4 { font-size: 0.85em; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 1.25em; margin-bottom: 0.25em; color: #64748b; }
  p { margin-bottom: 1em; }
  ul { list-style-type: disc; padding-left: 1.2em; margin-bottom: 1em; margin-top: 0.5em; }
  li { margin-bottom: 0.25em; padding-left: 0.2em; color: #475569; }
  blockquote { border-left: 3px solid #6366f1; background: #f8fafc; padding: 0.75em 1em; margin: 1.5em 0; font-style: italic; color: #475569; border-radius: 4px; }
  img { max-width: 100%; height: auto; border-radius: 8px; margin: 10px 0; display: block; }
  strong { color: #1e293b; font-weight: 700; }
`;

// --- ROBUST FORMATTER ---
const formatMarkdown = (text) => {
  if (!text) return "";
  let html = text.replace(/\r\n/g, '\n');
  html = html
    .replace(/```html/g, '').replace(/```/g, '')
    .replace(/^\s*#### (.*$)/gim, '<h4>$1</h4>')
    .replace(/^\s*### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^\s*## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^\s*# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^\s*> (.*$)/gim, '<blockquote>$1</blockquote>')
    .replace(/^\s*[\-\*] (.*$)/gim, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>')
    .replace(/<\/ul>\s*<ul>/gim, '')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>') 
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')             
    .replace(/(<\/h[1-6]>|<\/ul>|<\/ol>|<\/blockquote>)\s*\n+/gim, '$1')
    .replace(/\n+\s*(<h[1-6]>|<ul>|<ol>|<blockquote>)/gim, '$1')
    .replace(/\n/gim, '<br />');
  return html;
};

export default function HistoryList() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  
  const [selectedItem, setSelectedItem] = useState(null);
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(false);
  
  // --- NEW STATE FOR OVERFLOW DETECTION ---
  const [isTitleTruncated, setIsTitleTruncated] = useState(false);
  const titleRef = useRef(null);
  
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    if (user) {
      const cachedData = sessionStorage.getItem(`history_${user.uid}`);
      if (cachedData) {
        setHistory(JSON.parse(cachedData));
        setLoading(false);
        fetchHistory(true);
      } else {
        fetchHistory(false);
      }
    }
  }, [user]);

  // Reset states when a new item is opened
  useEffect(() => {
    if (selectedItem) {
      setIsHeaderExpanded(false);
      setIsTitleTruncated(false);
    }
  }, [selectedItem]);

  // --- NEW EFFECT: CHECK FOR OVERFLOW ---
  useEffect(() => {
    if (selectedItem && titleRef.current) {
      // Check if scrollHeight is greater than clientHeight (meaning text is clamped)
      const checkOverflow = () => {
        const el = titleRef.current;
        if (el) {
          setIsTitleTruncated(el.scrollHeight > el.clientHeight);
        }
      };
      
      // Small timeout ensures CSS has applied styles before measuring
      setTimeout(checkOverflow, 50);
      window.addEventListener('resize', checkOverflow);
      return () => window.removeEventListener('resize', checkOverflow);
    }
  }, [selectedItem]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setShowExportMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchHistory = async (isBackgroundUpdate = false) => {
    try {
      if (!isBackgroundUpdate) setLoading(true);
      const token = await user.getIdToken();
      const response = await fetch(`${API_URL}/api/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
        sessionStorage.setItem(`history_${user.uid}`, JSON.stringify(data));
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
    const updatedHistory = history.filter((item) => item.id !== id);
    setHistory(updatedHistory);
    if (user) sessionStorage.setItem(`history_${user.uid}`, JSON.stringify(updatedHistory));

    try {
      const token = await user.getIdToken();
      await fetch(`${API_URL}/api/history/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Failed to delete", error);
      fetchHistory(true); 
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getFormattedContent = () => {
    if (!selectedItem) return "";
    return formatMarkdown(selectedItem.answer);
  };

  const downloadFile = (blob, filename) => {
    const element = document.createElement("a");
    element.href = URL.createObjectURL(blob);
    element.download = filename;
    document.body.appendChild(element); 
    element.click();
    document.body.removeChild(element);
    setShowExportMenu(false);
  };

  const handleExportHTML = () => {
    const content = getFormattedContent();
    const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${selectedItem.topic}</title><style>${exportStyles}</style></head><body>${content}</body></html>`;
    const file = new Blob([fullHtml], {type: 'text/html'});
    downloadFile(file, `${selectedItem.topic.substring(0, 20)}.html`);
  };

  const handleExportDOCX = () => {
    const content = getFormattedContent();
    const preHtml = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export</title><style>${exportStyles} body { font-family: Arial, sans-serif; }</style></head><body>`;
    const postHtml = "</body></html>";
    const html = preHtml + content + postHtml;
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    downloadFile(blob, `${selectedItem.topic.substring(0, 20)}.doc`);
  };

  const handleExportPDF = () => {
    const content = getFormattedContent();
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);
    
    const doc = iframe.contentWindow.document;
    doc.write('<html><head><title>Print</title>');
    doc.write(`<style>${exportStyles}</style>`); 
    doc.write('</head><body>');
    doc.write(content);
    doc.write('</body></html>');
    doc.close();

    const printContent = () => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
        setShowExportMenu(false);
      }, 1000);
    };

    const images = iframe.contentDocument.getElementsByTagName('img');
    if (images.length > 0) {
      const loadPromises = Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
          img.onload = resolve;
          img.onerror = resolve; 
        });
      });
      Promise.all(loadPromises).then(() => setTimeout(printContent, 100));
    } else {
      printContent();
    }
  };

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
       {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 overflow-hidden"
          >
            <div className="flex justify-between items-center">
              <div className="h-5 w-24 rounded-full shimmer-effect" />
              <div className="h-4 w-16 rounded shimmer-effect" />
            </div>
            <div className="h-6 w-3/4 rounded shimmer-effect" />
            <div className="space-y-2">
              <div className="h-4 w-full rounded shimmer-effect" />
              <div className="h-4 w-11/12 rounded shimmer-effect" />
              <div className="h-4 w-4/5 rounded shimmer-effect" />
            </div>
            <div className="pt-4 border-t border-slate-100 flex justify-between">
              <div className="h-4 w-20 rounded shimmer-effect" />
              <div className="h-4 w-4 rounded shimmer-effect" />
            </div>
          </div>
        ))}
       <style jsx>{`
          .shimmer-effect {
            background-color: #e2e8f0; 
            background-image: linear-gradient(100deg, transparent 20%, rgba(255, 255, 255, 0.9) 50%, transparent 80%);
            background-size: 500px 100%;
            background-repeat: no-repeat;
            animation: shimmer 0.8s infinite linear;
          }
          @keyframes shimmer { 0% { background-position: -500px 0; } 100% { background-position: 500px 0; } }
       `}</style>
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
            
            {/* --- HEADER --- */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50 shrink-0 relative">
              <div className="space-y-1 min-w-0 pr-4 flex-1"> 
                
                <h3 
                  ref={titleRef}
                  className={`text-xl font-bold text-slate-900 break-words cursor-pointer transition-all duration-200 ${isHeaderExpanded ? '' : 'line-clamp-2 hover:line-clamp-none'}`}
                  onClick={() => setIsHeaderExpanded(!isHeaderExpanded)}
                >
                  {selectedItem.topic}
                </h3>
                
                <div className="flex items-center gap-3">
                  <div className="flex gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1 shrink-0"><Calendar size={12}/> {new Date(selectedItem.created_at).toLocaleString()}</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-medium capitalize shrink-0">{selectedItem.content_type}</span>
                  </div>

                  {/* --- NEW NOTE: VISIBLE ONLY IF TRUNCATED & NOT EXPANDED --- */}
                  {isTitleTruncated && !isHeaderExpanded && (
                    <span className="hidden sm:flex items-center gap-1 text-[10px] text-slate-400 font-medium animate-pulse">
                      <Info size={10} /> Hover to view full • Tap to expand
                    </span>
                  )}
                  {/* Mobile version of note */}
                  {isTitleTruncated && !isHeaderExpanded && (
                    <span className="flex sm:hidden items-center gap-1 text-[10px] text-slate-400 font-medium animate-pulse">
                      <Info size={10} /> Tap to expand
                    </span>
                  )}
                </div>

              </div>
              <button 
                onClick={() => setSelectedItem(null)}
                className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition shrink-0 self-start"
              >
                <X size={24} />
              </button>
            </div>

            {/* --- CONTENT AREA --- */}
            <div
              className="ck-editor__editable p-8 overflow-y-auto flex-1 min-h-0" 
              dangerouslySetInnerHTML={{ __html: formatMarkdown(selectedItem.answer) }}
            />

            {/* --- FOOTER --- */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
              <button 
                onClick={() => handleCopy(selectedItem.answer)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition shadow-sm text-xs sm:text-sm"
              >
                {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                {copied ? "Copied" : "Copy"}
              </button>

              <div className="relative" ref={exportMenuRef}>
                <button 
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className={`flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg font-semibold text-slate-700 transition hover:bg-slate-50 shadow-sm text-xs sm:text-sm ${showExportMenu ? "bg-slate-100" : ""}`}
                >
                  <Download size={16} /> Export <ChevronDown size={12} className={`transition-transform ${showExportMenu ? "rotate-180" : ""}`} />
                </button>

                {showExportMenu && (
                  <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2 z-50">
                    <div className="p-1">
                      <button onClick={handleExportPDF} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-lg transition-colors text-left">
                        <Printer size={14} /> Save as PDF
                      </button>
                      <button onClick={handleExportDOCX} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors text-left">
                        <FileText size={14} /> Export to Word
                      </button>
                      <button onClick={handleExportHTML} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-orange-600 rounded-lg transition-colors text-left">
                        <FileCode size={14} /> Export as HTML
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button 
                onClick={() => setSelectedItem(null)}
                className="px-5 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition shadow-sm text-xs sm:text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .ck-editor__editable {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #334155;
          line-height: 1.6; 
          -webkit-font-smoothing: antialiased;
        }
        .ck-editor__editable h1 { font-size: 2.25em; font-weight: 800; letter-spacing: -0.03em; margin-bottom: 0.3em; margin-top: 0; color: #0f172a; line-height: 1.1; }
        .ck-editor__editable h2 { font-size: 1.5em; font-weight: 700; margin-top: 1.5em; margin-bottom: 0.4em; color: #1e293b; letter-spacing: -0.02em; }
        .ck-editor__editable h3 { font-size: 1.25em; font-weight: 600; margin-top: 1.25em; margin-bottom: 0.25em; color: #4338ca; }
        .ck-editor__editable h4 { font-size: 0.85em; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 1.25em; margin-bottom: 0.25em; color: #64748b; }
        .ck-editor__editable p { margin-bottom: 1em; }
        .ck-editor__editable ul { list-style-type: disc; padding-left: 1.2em; margin-bottom: 1em; margin-top: 0.5em; }
        .ck-editor__editable li { margin-bottom: 0.25em; padding-left: 0.2em; color: #475569; }
        .ck-editor__editable blockquote { border-left: 3px solid #6366f1; background: #f8fafc; padding: 0.75em 1em; margin: 1.5em 0; font-style: italic; color: #475569; border-radius: 4px; }
      `}</style>
    </>
  );
}