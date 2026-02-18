"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { 
  Image as ImageIcon, 
  RefreshCw, 
  Check, 
  Copy, 
  Download, 
  RotateCw, 
  Plus, 
  MousePointerClick, 
  Sparkles, 
  Maximize2,
  Printer,
  FileText,
  FileCode,
  ChevronDown,
  BarChart3, 
  Clock,     
  AlignLeft, 
  Activity,
  Linkedin, 
  Mail,     
  Share2,
  Twitter,
  Scissors, 
  Wand2,    
  Eraser    
} from "lucide-react";

const CustomEditor = dynamic(
  async () => {
    const { CKEditor } = await import("@ckeditor/ckeditor5-react");
    const ClassicEditor = await import("@ckeditor/ckeditor5-build-classic");
    return (props) => <CKEditor editor={ClassicEditor.default} {...props} />;
  },
  { ssr: false, loading: () => <div className="p-8 text-slate-400">Loading Editor...</div> }
);

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
  figure { margin: 0; padding: 0; }
  strong { color: #1e293b; font-weight: 700; }
`;

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

export default function ResultSection({ data, onRegenerate }) {
  const [editorData, setEditorData] = useState(formatMarkdown(data.answer || ""));
  const [editorInstance, setEditorInstance] = useState(null);
  const [images, setImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [imagePage, setImagePage] = useState(1); 
  const [selectedText, setSelectedText] = useState("");
  const [activeAction, setActiveAction] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showRegenMenu, setShowRegenMenu] = useState(false); 
  const exportMenuRef = useRef(null);
  const regenMenuRef = useRef(null); 

  const stats = data.analytics || { word_count: 0, reading_time: 0, readability_score: 0, sentiment: "N/A" };
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  const contentType = (data.content_type || "").toLowerCase();
  const showLinkedIn = contentType.includes("linkedin");
  const showGmail = contentType.includes("email") || contentType.includes("newsletter") || contentType.includes("pitch");
  const showTwitter = contentType.includes("tweet") || contentType.includes("thread");

  const getReadabilityColor = (score) => {
    if (score >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 60) return "text-blue-600 bg-blue-50 border-blue-200";
    if (score >= 40) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };
  
  const getReadabilityLabel = (score) => {
    if (score >= 80) return "Very Easy";
    if (score >= 60) return "Standard";
    if (score >= 40) return "Difficult";
    return "Very Complex";
  };
  
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

  useEffect(() => {
    function handleClickOutside(event) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setShowExportMenu(false);
      }
      if (regenMenuRef.current && !regenMenuRef.current.contains(event.target)) {
        setShowRegenMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const handleSmartRegenerate = async (actionType, instruction) => {
    if (!selectedText || !editorInstance) return;
    setActiveAction(actionType);
    try {
      const enhancedInstruction = `${instruction}. IMPORTANT: Preserve the original structural formatting (bullet points, lists, headings) in your response using standard Markdown/HTML.`;
      const res = await fetch(`${API_URL}/api/regenerate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selected_text: selectedText, instruction: enhancedInstruction }),
      });
      const result = await res.json();
      const formattedHtml = formatMarkdown(result.updated_text);
      editorInstance.model.change((writer) => {
        const selection = editorInstance.model.document.selection;
        const range = selection.getFirstRange();
        const viewFragment = editorInstance.data.processor.toView(formattedHtml);
        const modelFragment = editorInstance.data.toModel(viewFragment);
        editorInstance.model.insertContent(modelFragment, range);
      });
    } catch (err) {
      console.error(err);
    } finally {
      setActiveAction(null);
    }
  };

  const handleFullRefine = async (actionType, instruction) => {
    if (!editorInstance) return;
    const fullText = editorInstance.getData();
    if (!fullText) return;

    setShowRegenMenu(false); 
    setActiveAction("full_regen"); 

    try {
        const enhancedInstruction = `${instruction}. IMPORTANT: Preserve the original structural formatting (HTML tags, lists, headers) exactly. Return the full updated HTML.`;
        
        const res = await fetch(`${API_URL}/api/regenerate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ selected_text: fullText, instruction: enhancedInstruction }),
        });
        
        const result = await res.json();
        const formattedHtml = formatMarkdown(result.updated_text);
        editorInstance.setData(formattedHtml);
    } catch (err) {
        console.error(err);
        alert("Failed to refine text. Please try again.");
    } finally {
        setActiveAction(null);
    }
  };

  const handleShare = (platform) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = editorData;
    const plainText = tempDiv.innerText || tempDiv.textContent || "";
    const encodedText = encodeURIComponent(plainText);
    const encodedTopic = encodeURIComponent(data.topic || "My Content");

    let url = "";

    if (platform === 'linkedin') {
        url = `https://www.linkedin.com/feed/?shareActive=true&text=${encodedText}`;
    } else if (platform === 'gmail') {
        url = `https://mail.google.com/mail/?view=cm&fs=1&su=${encodedTopic}&body=${encodedText}`;
    } else if (platform === 'twitter') {
        url = `https://twitter.com/intent/tweet?text=${encodedText}`;
    }

    if (url) {
        const width = 800;
        const height = 600;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;
        window.open(url, '_blank', `width=${width},height=${height},top=${top},left=${left}`);
    }
  };

  const handleCopy = () => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = editorData;
    const plainText = tempDiv.innerText || tempDiv.textContent || "";
    navigator.clipboard.writeText(plainText);
    setIsCopied(true);
    setTimeout(() => { setIsCopied(false); }, 2500);
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
    const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Exported Content</title><style>${exportStyles}</style></head><body>${editorData}</body></html>`;
    const file = new Blob([fullHtml], {type: 'text/html'});
    downloadFile(file, "generated-content.html");
  };

  const handleExportDOCX = () => {
    const preHtml = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export</title><style>${exportStyles} body { font-family: Arial, sans-serif; }</style></head><body>`;
    const postHtml = "</body></html>";
    const html = preHtml + editorData + postHtml;
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    downloadFile(blob, 'generated-content.doc');
  };

  const handleExportPDF = () => {
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
    doc.write(editorData);
    doc.write('</body></html>');
    doc.close();
    const printContent = () => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) document.body.removeChild(iframe);
        setShowExportMenu(false);
      }, 1000);
    };
    const images = iframe.contentDocument.getElementsByTagName('img');
    if (images.length > 0) {
      const loadPromises = Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => { img.onload = resolve; img.onerror = resolve; });
      });
      Promise.all(loadPromises).then(() => setTimeout(printContent, 100));
    } else {
      printContent();
    }
  };

  return (
    <section className="flex flex-col lg:flex-row gap-6 lg:gap-8 h-auto lg:h-[850px] animate-in fade-in duration-700 pb-10 lg:pb-0">
      
      <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative min-h-[500px]">
        
        <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-3 border-b border-slate-100 bg-white/80 backdrop-blur-sm z-10 sticky top-0">
          <div className="flex items-center gap-2">
             <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] animate-pulse" />
             <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">AI Editor</span>
          </div>
          
          <div className="flex items-center">
            {selectedText ? (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <button 
                  onClick={() => handleSmartRegenerate('funny', "Make it funnier")} 
                  disabled={!!activeAction} 
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-sm border border-indigo-700/10 ${activeAction && activeAction !== 'funny' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Sparkles size={12} className={activeAction === 'funny' ? "animate-spin" : ""} /> 
                  {activeAction === 'funny' ? "Generating..." : "Make Funnier"}
                </button>
                <button 
                  onClick={() => handleSmartRegenerate('expand', "Expand detailed")} 
                  disabled={!!activeAction} 
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-sm border border-emerald-700/10 ${activeAction && activeAction !== 'expand' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {activeAction === 'expand' ? <RefreshCw size={12} className="animate-spin" /> : <Maximize2 size={12} />}
                  {activeAction === 'expand' ? "Expanding..." : "Expand"}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium animate-pulse select-none">
                 <MousePointerClick size={14} />
                 <span>Select text to edit</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 border-b border-slate-100 divide-x divide-slate-100 bg-white">
            <div className="p-3 flex flex-col items-center justify-center text-center">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    <AlignLeft size={12} /> Words
                </div>
                <span className="text-lg font-black text-slate-700">{stats.word_count}</span>
            </div>
            
            <div className="p-3 flex flex-col items-center justify-center text-center">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    <Clock size={12} /> Read Time
                </div>
                <span className="text-lg font-black text-slate-700">{stats.reading_time} min</span>
            </div>

            <div className="p-3 flex flex-col items-center justify-center text-center">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    <BarChart3 size={12} /> Readability
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getReadabilityColor(stats.readability_score)}`}>
                    {getReadabilityLabel(stats.readability_score)}
                </span>
            </div>

            <div className="p-3 flex flex-col items-center justify-center text-center">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    <Activity size={12} /> Sentiment
                </div>
                <span className="text-sm font-bold text-slate-700 capitalize">{stats.sentiment}</span>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto relative">
          <CustomEditor
            data={editorData}
            onReady={(editor) => {
              setEditorInstance(editor);
              editor.model.document.selection.on("change", () => handleSelectionChange(editor));
            }}
            onChange={(event, editor) => setEditorData(editor.getData())}
          />
        </div>

        <div className="absolute bottom-6 md:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 md:gap-2 bg-slate-900/90 backdrop-blur-md text-white p-1.5 rounded-2xl shadow-2xl ring-1 ring-white/10 transition-all hover:scale-105 w-max max-w-[95%] z-20">
           
           <button 
             onClick={handleCopy} 
             disabled={isCopied}
             className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all duration-300 ${isCopied ? "bg-emerald-500/20 text-emerald-300" : "hover:bg-white/10"}`}
             title="Copy Text"
           >
             {isCopied ? <Check size={16} /> : <Copy size={16} />}
           </button>

           <div className="w-px h-4 bg-white/20"></div>

           {showLinkedIn && (
             <button onClick={() => handleShare('linkedin')} className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs md:text-sm font-semibold hover:bg-[#0077b5] transition-colors" title="Post to LinkedIn">
               <Linkedin size={16} /> <span className="hidden sm:inline">LinkedIn</span>
             </button>
           )}
           {showGmail && (
             <button onClick={() => handleShare('gmail')} className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs md:text-sm font-semibold hover:bg-red-600 transition-colors" title="Send via Gmail">
               <Mail size={16} /> <span className="hidden sm:inline">Gmail</span>
             </button>
           )}
           {showTwitter && (
             <button onClick={() => handleShare('twitter')} className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs md:text-sm font-semibold hover:bg-sky-500 transition-colors" title="Tweet">
               <Twitter size={16} /> <span className="hidden sm:inline">Tweet</span>
             </button>
           )}
           
           {(showLinkedIn || showGmail || showTwitter) && <div className="w-px h-4 bg-white/20"></div>}

           <div className="relative" ref={exportMenuRef}>
             <button 
                onClick={() => setShowExportMenu(!showExportMenu)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs md:text-sm font-semibold transition ${showExportMenu ? "bg-white/20 text-white" : "hover:bg-white/10"}`}
             >
               <Download size={16} />
             </button>
             {showExportMenu && (
               <div className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2 z-50">
                 <div className="p-1">
                   <button onClick={handleExportPDF} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-lg transition-colors text-left"><Printer size={14} /> Save as PDF</button>
                   <button onClick={handleExportDOCX} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors text-left"><FileText size={14} /> Export to Word</button>
                   <button onClick={handleExportHTML} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-orange-600 rounded-lg transition-colors text-left"><FileCode size={14} /> Export as HTML</button>
                 </div>
               </div>
             )}
           </div>
           
           <div className="w-px h-4 bg-white/20"></div>
           
           <div className="relative" ref={regenMenuRef}>
             <button 
               onClick={() => setShowRegenMenu(!showRegenMenu)} 
               className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs md:text-sm font-semibold transition ${showRegenMenu ? "bg-white/20 text-white" : "hover:bg-white/10"} text-indigo-300 hover:text-indigo-200`} 
               title="Regenerate Options"
               disabled={!!activeAction}
             >
               {activeAction === "full_regen" ? <RotateCw size={16} className="animate-spin"/> : <RotateCw size={16} />}
               <ChevronDown size={12} className={`transition-transform ${showRegenMenu ? "rotate-180" : ""}`} />
             </button>

             {showRegenMenu && (
               <div className="absolute bottom-full right-0 mb-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2 z-50">
                 <div className="p-1">
                   <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Refine Content</div>
                   
                   <button onClick={() => { setShowRegenMenu(false); onRegenerate(); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-lg transition-colors text-left">
                     <RefreshCw size={14} /> Retry (Original Prompt)
                   </button>
                   
                   <div className="h-px bg-slate-100 my-1"></div>

                   <button onClick={() => handleFullRefine('shorten', 'Make the entire text shorter and more concise')} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-emerald-600 rounded-lg transition-colors text-left">
                     <Scissors size={14} /> Make Shorter
                   </button>

                   <button onClick={() => handleFullRefine('expand', 'Expand the text with more details and depth')} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors text-left">
                     <Maximize2 size={14} /> Make Longer
                   </button>

                   <button onClick={() => handleFullRefine('simplify', 'Simplify the language to be easily understood (5th grade level)')} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-orange-600 rounded-lg transition-colors text-left">
                     <Eraser size={14} /> Simplify (Readability)
                   </button>
                   
                   <button onClick={() => handleFullRefine('grammar', 'Fix all grammar and spelling errors without changing the tone')} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-purple-600 rounded-lg transition-colors text-left">
                     <Wand2 size={14} /> Fix Grammar
                   </button>
                 </div>
               </div>
             )}
           </div>
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
          padding: 2rem 2.5rem 6rem 2.5rem !important; 
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
          color: #334155 !important;
          line-height: 1.6 !important; 
          -webkit-font-smoothing: antialiased;
        }
        @media (min-width: 1024px) {
           .ck-editor__editable {
              min-height: 800px !important;
              padding: 3.5rem 4.5rem !important;
           }
        }
        
        .ck.ck-toolbar {
          border: none !important;
          background: rgba(255, 255, 255, 0.8) !important;
          backdrop-filter: blur(10px) !important;
          -webkit-backdrop-filter: blur(10px) !important;
          position: sticky !important;
          top: 0 !important;
          z-index: 50 !important;
          border-bottom: 1px solid rgba(0,0,0,0.05) !important;
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
    </section>
  );
}