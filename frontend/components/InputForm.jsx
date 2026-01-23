"use client";

import { useState, useEffect } from "react";
import { Send, Zap, ChevronDown, Layout, Users, MessageSquare, Globe } from "lucide-react";

const PLACEHOLDERS = [
  "e.g., The future of AI in healthcare...",
  "e.g., Sustainable energy solutions for 2026...",
  "e.g., Explaining Quantum Computing to beginners...",
  "e.g., Our new product launch announcement...",
  "e.g., The top 5 trends in software engineering...",
  "e.g., Healthy meal prep ideas for busy professionals..."
];

export default function InputForm({ onGenerate, loading }) {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("professional");
  const [contentType, setContentType] = useState("blog post");
  const [language, setLanguage] = useState("English");
  const [targetAudience, setTargetAudience] = useState("");
  
  const [placeholder, setPlaceholder] = useState("");
  const [loopNum, setLoopNum] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(50);

  useEffect(() => {
    const handleTyping = () => {
      const i = loopNum % PLACEHOLDERS.length;
      const fullText = PLACEHOLDERS[i];

      setPlaceholder(
        isDeleting 
          ? fullText.substring(0, placeholder.length - 1) 
          : fullText.substring(0, placeholder.length + 1)
      );

      setTypingSpeed(isDeleting ? 20 : 50);

      if (!isDeleting && placeholder === fullText) {
        setTimeout(() => setIsDeleting(true), 2000); 
      } else if (isDeleting && placeholder === "") {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [placeholder, isDeleting, loopNum, typingSpeed]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!topic.trim()) return;
    onGenerate({ 
        topic, 
        tone, 
        content_type: contentType, 
        target_audience: targetAudience,
        language 
    });
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white p-1 shadow-xl shadow-slate-200/60 ring-1 ring-slate-900/5">
      
      <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
        
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Zap size={16} className="text-blue-800" />
            What do you want to create?
          </label>
          <div className="relative group">
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              rows={3}
              placeholder={placeholder}
              className="w-full resize-none rounded-xl bg-slate-50 border border-slate-200 px-5 py-4 text-base text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm group-hover:bg-white group-hover:border-slate-300"
            />
            {!topic && (
               <span className="absolute top-4 left-[calc(1.25rem+2px)] text-transparent border-r-2 border-indigo-500 animate-pulse h-5">
                 {placeholder}
               </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <Layout size={12} /> Format
            </label>
            <div className="relative">
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="w-full appearance-none rounded-lg bg-white border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all cursor-pointer hover:border-slate-300"
              >
                <optgroup label="Social Media">
                    <option value="linkedin post">LinkedIn Post</option>
                    <option value="tweet">Tweet / X Thread</option>
                    <option value="instagram caption">Instagram Caption</option>
                    <option value="youtube script">YouTube Video Script</option>
                </optgroup>
                <optgroup label="Long Form">
                    <option value="blog post">SEO Blog Post</option>
                    <option value="newsletter">Email Newsletter</option>
                    <option value="case study">Case Study</option>
                </optgroup>
                <optgroup label="Business">
                    <option value="cold email">Cold Email / Sales Pitch</option>
                    <option value="job description">Job Description</option>
                </optgroup>
                <optgroup label="AI & Technical">
                    <option value="llm prompt">LLM System Prompt</option>
                    <option value="midjourney prompt">Midjourney Image Prompt</option>
                    <option value="code snippet">Code Snippet & Explain</option>
                </optgroup>
              </select>
              <ChevronDown className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <MessageSquare size={12} /> Tone
            </label>
            <div className="relative">
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full appearance-none rounded-lg bg-white border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all cursor-pointer hover:border-slate-300"
              >
                <option value="professional">Professional</option>
                <option value="enthusiastic">Enthusiastic</option>
                <option value="casual">Casual / Friendly</option>
                <option value="authoritative">Authoritative</option>
                <option value="witty">Witty / Humorous</option>
                <option value="persuasive">Persuasive / Sales</option>
                <option value="empathetic">Empathetic</option>
                <option value="storytelling">Storytelling</option>
                <option value="technical">Technical / Precise</option>
              </select>
              <ChevronDown className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <Users size={12} /> Audience
            </label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g. CTOs, Students"
              className="w-full rounded-lg bg-white border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all hover:border-slate-300"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <Globe size={12} /> Language
            </label>
            <div className="relative">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full appearance-none rounded-lg bg-white border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all cursor-pointer hover:border-slate-300"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
                <option value="Mandarin">Mandarin</option>
                <option value="Japanese">Japanese</option>
                <option value="Arabic">Arabic</option>
                <option value="Russian">Russian</option>
                <option value="Portuguese">Portuguese</option>
                <option value="Gujarati">Gujarati</option>
              </select>
              <ChevronDown className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>

        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading || !topic.trim()}
            className="group relative w-full overflow-hidden rounded-xl bg-indigo-600 px-8 py-4 text-white shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-1 hover:shadow-indigo-500/50 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative flex items-center justify-center gap-2 font-bold tracking-wide">
              {loading ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Generating Magic...
                </>
              ) : (
                <>
                  Generate Content <Send size={18} className="transition-transform group-hover:translate-x-1" />
                </>
              )}
            </div>
          </button>
        </div>
      </form>
    </div>
  );
}