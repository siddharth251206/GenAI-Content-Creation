"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Wand2, Image as ImageIcon, RefreshCw, Check, Copy, Download, RotateCw, Plus, MousePointerClick } from "lucide-react";

const CustomEditor = dynamic(
  async () => {
    const { CKEditor } = await import("@ckeditor/ckeditor5-react");
    const ClassicEditor = await import("@ckeditor/ckeditor5-build-classic");
    return (props) => <CKEditor editor={ClassicEditor.default} {...props} />;
  },
  { ssr: false, loading: () => <div className="p-8 text-slate-400">Loading Editor...</div> }
);

const formatMarkdown = (text) => {
  if (!text) return "";
  
  let html = text
    .replace(/```html/g, '').replace(/```/g, '')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/^\- (.*$)/gim, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>')
    .replace(/<\/ul>\s*<ul>/gim, '')
    .replace(/\n/gim, '<br />');

  return html;
};

export default function ResultSection({ data, onRegenerate }) {
  const [editorData, setEditorData] = useState(formatMarkdown(data.answer || ""));
  const [editorInstance, setEditorInstance] = useState(null);
  const [images, setImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [imagePage, setImagePage] = useState(1); 
  const [selectedText, setSelectedText] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    if (data.answer) {
        setEditorData(formatMarkdown(data.answer));
    }
  }, [data.answer]);

  useEffect(() => {
    if (data.topic) {
        setImages([]);
        setImagePage(1);
        fetchImages(data.topic, 1);
    }
  }, [data.topic]);

  const fetchImages = async (topic, page) => {
    setLoadingImages(true);
    try {
      const res = await fetch(`${API_URL}/api/images?page=${page}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const result = await res.json();
      
      if (result.images && result.images.length > 0) {
          setImages(prev => [...prev, ...result.images]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingImages(false);
    }
  };

  const handleLoadMoreImages = () => {
      const nextPage = imagePage + 1;
      setImagePage(nextPage);
      fetchImages(data.topic, nextPage);
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
      const res = await fetch(`${API_URL}/api/regenerate`, {
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

  const handleCopy = () => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = editorData;
    const plainText = tempDiv.innerText || tempDiv.textContent || "";
    navigator.clipboard.writeText(plainText);
    alert("Content copied to clipboard!");
  };

  const handleExport = () => {
    const element = document.createElement("a");
    const file = new Blob([editorData], {type: 'text/html'});
    element.href = URL.createObjectURL(file);
    element.download = "generated-content.html";
    document.body.appendChild(element); 
    element.click();
  };

  return (
    <section className="flex flex-col lg:flex-row gap-6 lg:gap-8 h-auto lg:h-[850px] animate-in fade-in duration-700 pb-10 lg:pb-0">
      
      <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative min-h-[500px]">
        
        <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-3 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2">
             <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
             <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">AI Editor</span>
          </div>
          
          <div className="flex gap-2">
            {selectedText && (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                <button onClick={() => handleSmartRegenerate("Make it funnier")} disabled={isRegenerating} className="btn-toolbar text-indigo-600 bg-indigo-50 border-indigo-100 hover:bg-indigo-100">
                  <Wand2 size={12} /> <span className="hidden sm:inline">Funny</span>
                </button>
                <button onClick={() => handleSmartRegenerate("Expand detailed")} disabled={isRegenerating} className="btn-toolbar text-emerald-600 bg-emerald-50 border-emerald-100 hover:bg-emerald-100">
                  <RefreshCw size={12} className={isRegenerating ? "animate-spin" : ""} /> <span className="hidden sm:inline">Expand</span>
                </button>
              </div>
            )}
          </div>
        </div>

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

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 md:gap-2 bg-slate-900/95 backdrop-blur text-white p-1.5 rounded-xl shadow-xl transition w-max max-w-[95%] z-20">
           <button onClick={handleCopy} className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 rounded-lg text-xs md:text-sm font-medium transition">
             <Copy size={14} /> Copy
           </button>
           <div className="w-px h-4 bg-white/20"></div>
           <button onClick={handleExport} className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 rounded-lg text-xs md:text-sm font-medium transition">
             <Download size={14} /> Export
           </button>
           <div className="w-px h-4 bg-white/20"></div>
           <button onClick={onRegenerate} className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 rounded-lg text-xs md:text-sm font-medium transition text-indigo-300">
             <RotateCw size={14} /> <span className="hidden sm:inline">Regenerate</span>
           </button>
        </div>
      </div>

      <div className="w-full lg:w-80 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-auto lg:h-full shrink-0">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-slate-700">
            <ImageIcon size={16} />
            <span className="text-sm font-semibold">Stock Images</span>
          </div>
          <p className="text-[10px] text-indigo-500 font-medium lg:hidden flex items-center gap-1">
            <MousePointerClick size={10} /> Tap image to insert into editor
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-slate-50/30">
          <div className="grid grid-cols-2 lg:flex lg:flex-col gap-4">
            {images.map((url, idx) => (
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
            ))}
            
            {loadingImages ? (
              <div className="col-span-2 py-6 flex flex-col items-center gap-2">
                 <div className="animate-spin w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full"/>
                 <span className="text-xs text-slate-400">Loading visuals...</span>
              </div>
            ) : (
              <button 
                onClick={handleLoadMoreImages}
                className="col-span-2 mt-2 flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/50 text-indigo-600 text-sm font-medium hover:bg-indigo-50 transition-colors"
              >
                <Plus size={16} /> Load More Images
              </button>
            )}
            
            {!loadingImages && images.length === 0 && (
                <p className="col-span-2 text-xs text-slate-400 text-center py-10">No images found.</p>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .btn-toolbar {
          @apply flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded-md transition hover:brightness-95;
        }
        .ck-editor__editable {
          min-height: 400px !important;
          padding: 1.5rem !important;
          font-family: ui-sans-serif, system-ui, sans-serif !important;
          color: #1e293b !important;
        }
        @media (min-width: 1024px) {
           .ck-editor__editable {
              min-height: 800px !important;
              padding: 3rem !important;
           }
        }
        .ck.ck-toolbar {
          border: none !important;
          background: white !important;
        }
        .ck-editor__editable h1 { font-size: 2em; font-weight: 800; margin-bottom: 0.5em; color: #1e293b; }
        .ck-editor__editable h2 { font-size: 1.5em; font-weight: 700; margin-bottom: 0.5em; margin-top: 1em; color: #334155; }
        .ck-editor__editable h3 { font-size: 1.25em; font-weight: 600; margin-bottom: 0.5em; color: #475569; }
        .ck-editor__editable ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 1em; }
        .ck-editor__editable li { margin-bottom: 0.25em; }
      `}</style>
    </section>
  );
}