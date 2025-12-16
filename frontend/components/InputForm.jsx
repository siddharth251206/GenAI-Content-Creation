"use client";

import { useState } from "react";

export default function InputForm({ onGenerate }) {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("professional");
  const [contentType, setContentType] = useState("blog post");
  const [targetAudience, setTargetAudience] = useState("general audience");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!topic.trim()) {
      alert("Topic cannot be empty");
      return;
    }

    onGenerate({
      topic,
      tone,
      content_type: contentType,
      target_audience: targetAudience,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-neutral-800 bg-neutral-900/80 backdrop-blur p-6 space-y-6"
    >
      {/* Prompt */}
      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-2">
          Prompt
        </label>
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          rows={3}
          placeholder="Describe what you want the AI to generate…"
          className="w-full resize-none rounded-md bg-neutral-800 border border-neutral-700 px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Modifiers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-neutral-400 mb-1">
            Content Type
          </label>
          <select
            value={contentType}
            onChange={(e) => setContentType(e.target.value)}
            className="w-full rounded-md bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="blog post">Blog Post</option>
            <option value="linkedin post">LinkedIn Post</option>
            <option value="tweet">Tweet</option>
            <option value="email newsletter">Email Newsletter</option>
            <option value="code">Code</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-400 mb-1">
            Tone
          </label>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="w-full rounded-md bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="professional">Professional</option>
            <option value="serious">Serious</option>
            <option value="enthusiastic">Enthusiastic</option>
            <option value="casual">Casual</option>
            <option value="programming">Programming</option>
          </select>
        </div>
      </div>

      {/* Audience */}
      <div>
        <label className="block text-xs font-medium text-neutral-400 mb-1">
          Target Audience
        </label>
        <input
          type="text"
          value={targetAudience}
          onChange={(e) => setTargetAudience(e.target.value)}
          placeholder="e.g. Developers, founders, students"
          className="w-full rounded-md bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Action */}
      <div className="pt-2">
        <button
          type="submit"
          className="w-full rounded-md bg-green-500 py-2.5 text-sm font-semibold text-black hover:bg-green-400 transition active:scale-[0.98]"
        >
          Generate
        </button>
      </div>
    </form>
  );
}
