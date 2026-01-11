"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Wand2, Image as ImageIcon, RefreshCw, Check, Copy, Download, RotateCw } from "lucide-react";

// Dynamically load Editor
const CustomEditor = dynamic(
  async () => {
    const { CKEditor } = await import("@ckeditor/ckeditor5-react");
    const ClassicEditor = await import("@ckeditor/ckeditor5-build-classic");
    return (props) => <CKEditor editor={ClassicEditor.default} {...props} />;
  },
  { ssr: false, loading: () => <div className="p-8 text-slate-400">Loading Editor...</div> }
);

export default function ResultSection({ data, onRegenerate }) {
  const [editorData, setEditorData] = useState(data.answer || "");
  const [editorInstance, setEditorInstance] = useState(null);
  const [images, setImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    if (data.topic) fetchImages(data.topic);
  }, [data.topic]);

  const fetchImages = async (topic) => {
    setLoadingImages(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const result = await res.json();
      setImages(result.images || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingImages(false);
    }
  };

  const insertImage = (url) => {
    if (!editorInstance) return;
    editorInstance.model.change((writer) => {
      const imageElement = writer.createElement("imageBlock", { src: url });
      editorInstance.model.insertContent(imageElement, editorInstance.model.document.selection);
    });
  };

  const handleSelectionChange = (editor) => {
    const selection = editor.model.document.selection;
    const range = selection.getFirstRange();
    let text = "";
    for (const item of range.getItems()) {
      if (item.is("textProxy")) text += item.data;
    }
    setSelectedText(text);
  };

  const handleSmartRegenerate = async (instruction) => {
    if (!selectedText) return;
    setIsRegenerating(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selected_text: selectedText, instruction }),
      });
      const result = await res.json();
      editorInstance.model.change((writer) => {
        const selection = editorInstance.model.document.selection;
        const range = selection.getFirstRange();
        editorInstance.model.insertContent(writer.createText(result.updated_text), range);
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsRegenerating(false);
    }
  };

  // --- ACTIONS ---
  const handleCopy = () => {
    const plainText = editorData.replace(/<[^>]+>/g, ''); // Simple strip HTML
    navigator.clipboard.writeText(plainText);
    alert("Content copied to clipboard!");
  };

  const handleExport = () => {
    const element = document.createElement("a");
    const file = new Blob([editorData], {type: 'text/markdown'});
    element.href = URL.createObjectURL(file);
    element.download = "generated-content.md";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  };

  return (
    <section className="flex flex-col lg:flex-row gap-8 h-[850px] animate-in fade-in duration-700">
      
      {/* --- EDITOR AREA --- */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
        
        {/* Top Toolbar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2">
             <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
             <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">AI Editor</span>
          </div>
          
          <div className="flex gap-2">
            {selectedText && (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                <button onClick={() => handleSmartRegenerate("Make it funnier")} disabled={isRegenerating} className="btn-toolbar text-indigo-600 bg-indigo-50 border-indigo-100">
                  <Wand2 size={12} /> Funny
                </button>
                <button onClick={() => handleSmartRegenerate("Expand detailed")} disabled={isRegenerating} className="btn-toolbar text-emerald-600 bg-emerald-50 border-emerald-100">
                  <RefreshCw size={12} className={isRegenerating ? "animate-spin" : ""} /> Expand
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Editor Instance */}
        <div className="flex-1 overflow-y-auto">
          <CustomEditor
            data={editorData}
            onReady={(editor) => {
              setEditorInstance(editor);
              editor.model.document.selection.on("change", () => handleSelectionChange(editor));
            }}
            onChange={(event, editor) => setEditorData(editor.getData())}
          />
        </div>

        {/* Bottom Action Bar (Floating) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-900/90 backdrop-blur text-white p-1.5 rounded-xl shadow-xl transition hover:scale-105">
           <button 
             onClick={handleCopy}
             className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-lg text-sm font-medium transition"
           >
             <Copy size={16} /> Copy
           </button>
           <div className="w-px h-4 bg-white/20"></div>
           <button 
             onClick={handleExport}
             className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-lg text-sm font-medium transition"
           >
             <Download size={16} /> Export
           </button>
           <div className="w-px h-4 bg-white/20"></div>
           <button 
             onClick={onRegenerate}
             className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-lg text-sm font-medium transition text-indigo-300"
           >
             <RotateCw size={16} /> Regenerate
           </button>
        </div>
      </div>

      {/* --- SIDEBAR --- */}
      <div className="w-full lg:w-72 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2 text-slate-700">
          <ImageIcon size={16} />
          <span className="text-sm font-semibold">Stock Images</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
          {loadingImages ? (
            <div className="text-center py-10 space-y-2">
               <div className="animate-spin w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto"/>
               <p className="text-xs text-slate-400">Curating visuals...</p>
            </div>
          ) : images.length > 0 ? (
            images.map((url, idx) => (
              <div 
                key={idx} 
                className="group relative rounded-xl overflow-hidden shadow-sm border border-slate-200 cursor-pointer hover:shadow-md transition-all hover:scale-[1.02]"
                onClick={() => insertImage(url)}
              >
                <img src={url} alt="Stock" className="w-full h-32 object-cover" />
                <div className="absolute inset-0 bg-indigo-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all backdrop-blur-[2px]">
                  <span className="px-3 py-1.5 bg-white text-indigo-600 text-xs font-bold rounded-full flex items-center gap-1 shadow-lg">
                    <Check size={12} /> Add
                  </span>
                </div>
              </div>
            ))
          ) : (
             <p className="text-xs text-slate-400 text-center py-10">No images found.</p>
          )}
        </div>
      </div>

      <style jsx global>{`
        .btn-toolbar {
          @apply flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded-md transition hover:brightness-95;
        }
        .ck-editor__editable {
          min-height: 800px;
          padding: 3rem !important;
          font-family: ui-sans-serif, system-ui, sans-serif !important;
          color: #1e293b !important;
        }
        .ck.ck-toolbar {
          border: none !important;
          background: white !important;
        }
      `}</style>
    </section>
  );
}