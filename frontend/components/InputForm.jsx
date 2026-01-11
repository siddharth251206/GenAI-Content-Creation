"use client";

import { useState } from "react";
import { Send, Zap } from "lucide-react";

export default function InputForm({ onGenerate, loading }) {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("professional");
  const [contentType, setContentType] = useState("blog post");
  const [targetAudience, setTargetAudience] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!topic.trim()) return;
    onGenerate({ topic, tone, content_type: contentType, target_audience: targetAudience });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-1">
      <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
        
        {/* Main Prompt Input */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            What would you like to create?
          </label>
          <div className="relative">
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              rows={3}
              placeholder="e.g., A blog post about the future of AI in healthcare..."
              className="w-full resize-none rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-inner"
            />
            <Zap className="absolute right-3 top-3 text-indigo-400 opacity-50" size={16} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Content Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Format</label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              className="w-full rounded-lg bg-white border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
            >
              <option value="blog post">Blog Post</option>
              <option value="linkedin post">LinkedIn Post</option>
              <option value="tweet">Tweet / X Post</option>
              <option value="email newsletter">Newsletter</option>
              <option value="code">Code Snippet</option>
            </select>
          </div>

          {/* Tone */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tone</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full rounded-lg bg-white border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
            >
              <option value="professional">Professional</option>
              <option value="enthusiastic">Enthusiastic</option>
              <option value="casual">Casual</option>
              <option value="authoritative">Authoritative</option>
            </select>
          </div>

          {/* Audience */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Target Audience</label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g. CTOs, Students..."
              className="w-full rounded-lg bg-white border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading || !topic.trim()}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              "Generating..."
            ) : (
              <>
                Generate Content <Send size={16} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}