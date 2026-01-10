"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic"; // 1. Import dynamic
import { Wand2, Image as ImageIcon, RefreshCw, Check } from "lucide-react";

// 2. Dynamically import CKEditor so it ONLY loads on the browser
// This prevents the "window is not defined" error
const CustomEditor = dynamic(
  async () => {
    const { CKEditor } = await import("@ckeditor/ckeditor5-react");
    const ClassicEditor = await import("@ckeditor/ckeditor5-build-classic");
    
    return (props) => (
      <CKEditor
        editor={ClassicEditor.default}
        {...props}
      />
    );
  },
  { 
    ssr: false, // Disable server-side rendering for this component
    loading: () => <div className="p-10 text-neutral-400">Loading Editor...</div>
  }
);

export default function ResultSection({ data }) {
  const [editorData, setEditorData] = useState(data.answer || "");
  const [editorInstance, setEditorInstance] = useState(null);
  
  // Image State
  const [images, setImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  
  // Regeneration State
  const [selectedText, setSelectedText] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);

  // 1. Fetch Images when component mounts
  useEffect(() => {
    if (data.topic) {
      fetchImages(data.topic);
    }
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
      console.error("Failed to load images", err);
    } finally {
      setLoadingImages(false);
    }
  };

  // 2. Insert Image into Editor
  const insertImage = (url) => {
    if (!editorInstance) return;
    
    editorInstance.model.change((writer) => {
      // Insert image at current selection
      const imageElement = writer.createElement("imageBlock", { src: url });
      editorInstance.model.insertContent(imageElement, editorInstance.model.document.selection);
    });
  };

  // 3. Handle Text Selection
  const handleSelectionChange = (editor) => {
    const selection = editor.model.document.selection;
    const range = selection.getFirstRange();
    let text = "";
    
    for (const item of range.getItems()) {
      if (item.is("textProxy")) {
        text += item.data;
      }
    }
    setSelectedText(text);
  };

  // 4. Regenerate Selected Text
  const handleRegenerate = async (instruction) => {
    if (!selectedText) return;
    setIsRegenerating(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selected_text: selectedText,
          instruction: instruction, 
        }),
      });
      
      const result = await res.json();
      
      // Replace text in editor
      editorInstance.model.change((writer) => {
        const selection = editorInstance.model.document.selection;
        const range = selection.getFirstRange();
        editorInstance.model.insertContent(
          writer.createText(result.updated_text),
          range
        );
      });
      
    } catch (err) {
      console.error("Regeneration failed", err);
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <section className="mt-12 flex flex-col lg:flex-row gap-6 h-[800px]">
      
      {/* --- LEFT: EDITOR AREA --- */}
      <div className="flex-1 flex flex-col border border-neutral-800 rounded-xl bg-neutral-900 overflow-hidden">
        
        {/* Editor Toolbar (Custom Actions) */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 bg-neutral-900">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
            Smart Editor
          </span>
          
          <div className="flex gap-2">
            {selectedText && (
              <>
                <button 
                  onClick={() => handleRegenerate("Make it funnier")}
                  disabled={isRegenerating}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 rounded hover:bg-indigo-600/30 transition"
                >
                  <Wand2 size={12} /> Make Funny
                </button>
                <button 
                  onClick={() => handleRegenerate("Expand and explain detailed")}
                  disabled={isRegenerating}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs bg-green-600/20 text-green-300 border border-green-500/30 rounded hover:bg-green-600/30 transition"
                >
                  <RefreshCw size={12} className={isRegenerating ? "animate-spin" : ""} /> Expand
                </button>
                 <button 
                  onClick={() => handleRegenerate("Rewrite professionally")}
                  disabled={isRegenerating}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs bg-blue-600/20 text-blue-300 border border-blue-500/30 rounded hover:bg-blue-600/30 transition"
                >
                  Rewrite
                </button>
              </>
            )}
          </div>
        </div>

        {/* CKEditor Instance (Wrapped in CustomEditor) */}
        <div className="flex-1 overflow-y-auto text-black custom-editor-wrapper">
          <CustomEditor
            data={editorData}
            onReady={(editor) => {
              setEditorInstance(editor);
              editor.model.document.selection.on("change", () => handleSelectionChange(editor));
            }}
            onChange={(event, editor) => {
              setEditorData(editor.getData());
            }}
          />
        </div>
      </div>

      {/* --- RIGHT: ASSETS SIDEBAR --- */}
      <div className="w-full lg:w-64 flex flex-col border border-neutral-800 rounded-xl bg-neutral-900 overflow-hidden">
        <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-900 flex items-center gap-2 text-neutral-300">
          <ImageIcon size={14} />
          <span className="text-sm font-semibold">Stock Images</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loadingImages ? (
            <div className="text-xs text-neutral-500 animate-pulse">Finding perfect images...</div>
          ) : images.length > 0 ? (
            images.map((url, idx) => (
              <div 
                key={idx} 
                className="group relative rounded-lg overflow-hidden border border-neutral-800 cursor-pointer hover:border-green-500 transition"
                onClick={() => insertImage(url)}
              >
                <img src={url} alt="Stock" className="w-full h-32 object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                  <span className="text-xs text-white font-medium flex items-center gap-1">
                    <Check size={12} /> Insert
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-xs text-neutral-600 text-center">
              No images found.
            </div>
          )}
        </div>
      </div>

      {/* CSS Override for CKEditor Dark Mode */}
      <style jsx global>{`
        .ck-editor__editable {
          min-height: 600px;
          background-color: #f5f5f5 !important;
          color: #333 !important;
          padding: 2rem !important;
        }
        .ck-toolbar {
          background-color: #f5f5f5 !important;
          border-bottom: 1px solid #ddd !important;
        }
      `}</style>
    </section>
  );
}